import User from '../models/user.model.js';
// Di aplikasi nyata, Anda harus meng-hash password sebelum menyimpannya.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op, where } from 'sequelize';
import { sendVerificationCode } from './verifications.service.js';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import Member from '../models/member.model.js';
import Organization from '../models/organization.model.js';

// Opsi untuk menyembunyikan password_hash dari query SELECT.
const pump = promisify(pipeline);
const attributesToExclude = ['password_hash'];

// Membuat pengguna baru
export const saveUser = async (userData) => {
  // 1. Cek apakah email yang BARU dimasukkan sudah digunakan oleh PENGGUNA LAIN.
  const existingEmail = await User.findOne({
    where: {
      email: userData.email,
      // Pastikan email ini bukan milik user dengan NIM yang sama (untuk kasus update).
      nim: { [Op.ne]: userData.nim } 
    }
  });

  if (existingEmail) {
    throw new Error('Alamat email tersebut sudah digunakan oleh pengguna lain.');
  }

  // 2. Cek apakah ada pengguna dengan NIM yang sama.
  const existingUserByNim = await User.findOne({
    where: { nim: userData.nim }
  });

  // 3. Hash password (dilakukan sekali di sini untuk kedua skenario).
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password_hash, salt);
  userData.password_hash = hashedPassword;


  let userToReturn;

  // 4. LOGIKA UTAMA: Tentukan apakah harus UPDATE atau CREATE.
  if (existingUserByNim) {
    // --- SKENARIO UPDATE (NIM sudah ada) ---

    // Jika akun dengan NIM tersebut sudah terverifikasi, tolak pendaftaran.
    if (existingUserByNim.is_verified) {
      throw new Error('Nomor Induk Mahasiswa sudah terdaftar dan terverifikasi.');
    }

    // Jika belum terverifikasi, ini adalah kasus "salah input email".
    // Update data pengguna yang sudah ada dengan email dan password baru.
    await existingUserByNim.update({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: userData.password_hash,
      // Tambahkan field lain jika perlu diupdate
    });
    
    userToReturn = existingUserByNim;

  } else {
    // --- SKENARIO CREATE (NIM belum ada) ---
    // Buat pengguna baru jika tidak ada record dengan NIM tersebut.
    const newUser = await User.create(userData);
    userToReturn = newUser;
  }

  // 5. Kembalikan data user yang relevan tanpa password hash.
  const userJson = userToReturn.toJSON();
  delete userJson.password_hash;
  return userJson;
};

// Mendapatkan semua pengguna
export const findAllUsers = async () => {
  // Mencari semua user dan mengecualikan password_hash.
  return User.findAll({
    attributes: { exclude: attributesToExclude }
  });
}

export const getUserWithActiveOrganizations = async (userId) => {
  try {
    const user = await User.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Member,
          as: "memberships",
          where: { status: "active" },
          required: false, // kalau user belum ikut organisasi apapun tetap ditampilkan
          include: [
            {
              model: Organization,
              as: "organization",
            },
          ],
        },
      ],
    });

    return user;
  } catch (error) {
    console.error("Error fetching user with active organizations:", error);
    throw error;
  }
};

// Mengupdate pengguna
export const updateUser = async (userId, updateData) => {
  // Cari dulu user yang akan diupdate.
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // Jika ada password baru, pastikan di-hash sebelum update.
  if (updateData.password_hash) {
    // TODO: Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updateData.password_hash, salt);
    updateData.password_hash = hashedPassword;
  }
  // Lakukan update dan kembalikan data yang sudah diperbarui.
  const updatedUser = await user.update(updateData);
  const updatedUserJson = updatedUser.toJSON();
  delete updatedUserJson.password_hash;
  return updatedUserJson;
}

// Menghapus pengguna
export const deleteUser = async (userId) => {
  // Cari dulu user yang akan dihapus.
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // Hapus user dari database.
  await user.destroy();
  // Tidak ada yang perlu dikembalikan, controller akan mengirim status 204.
}

export const login = async (identifier, password) => {
  // 1. Cari pengguna berdasarkan email ATAU nim.
  // Gunakan Op.or untuk membuat query: WHERE email = 'identifier' OR nim = 'identifier'
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { nim: identifier }
      ]
    }
  });

  // 2. Jika pengguna tidak ditemukan, lempar error.
  // Pesan error sengaja dibuat umum untuk alasan keamanan.
  if (!user) {
    throw new Error('Tidak ada akun dengan alamat email atau nomor identitas mahasiswa yang Anda masukkan!');
  }

  // 3. Bandingkan password yang diberikan dengan password_hash di database.
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  // 4. Jika password tidak cocok, lempar error.
  if (!isPasswordValid) {
    throw new Error('Kata sandi salah!');
  }

  if (!user.is_verified) {
    sendVerificationCode(user.user_id, 'account_activation');
  }

  // 5. Jika password cocok, buat JWT (JSON Web Token).
  // 'YOUR_JWT_SECRET' HARUS diganti dengan secret key yang aman dan disimpan di environment variable (.env)
  const token = jwt.sign(
    { user_id: user.user_id, email: user.email }, // Payload token
    'YOUR_JWT_SECRET',                            // Secret Key
    { expiresIn: '8h' }                           // Token akan kedaluwarsa dalam 8 jam
  );

  // 6. Kembalikan token dan sebagian data pengguna (tanpa password).
  return {
    token,
    is_verified: user.is_verified,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      npm: user.nim,
      role: user.role,
      profile_picture_url: user.profile_picture_url
    }
  };
}

export const findUserByEmail = async (usermail) => User.findOne({
  where: {
    email: usermail
  }
});

export const findUserByUserIdWithResetPassword = async (userId, password) => {
  const user = await User.findByPk(userId);
  const isPasswordSame = await bcrypt.compare(password, user.password_hash);

  // 4. Jika password tidak cocok, lempar error.
  if (isPasswordSame) {
    return false;
  }
  return true;
}

export const updateImageProfile = async (userId, fileData) => {
  // 1. Cari pengguna untuk memastikan dia ada.
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  // 2. Cek apakah ada file gambar lama untuk dihapus.
  const oldPictureUrl = user.profile_picture_url;

  // 3. Buat nama file baru yang unik untuk menghindari konflik.
  const fileExtension = path.extname(fileData.filename); // -> .png, .jpg
  const newFilename = `profile-${userId}-${Date.now()}${fileExtension}`;
  
  // --> UBAH DI SINI: Tentukan direktori upload yang baru
  const uploadDir = path.resolve('public', 'images');
  const filePath = path.join(uploadDir, newFilename);
  
  // --> UBAH DI SINI: Sesuaikan URL publik yang akan disimpan ke database
  const publicUrl = `/public/images/${newFilename}`;

  // 5. Pastikan direktori 'uploads' ada.
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // 6. Simpan file baru ke direktori 'uploads' menggunakan stream pipeline.
  await pump(fileData.file, fs.createWriteStream(filePath));
  
  // 7. Hapus file gambar lama JIKA ADA, setelah yang baru berhasil disimpan.
  if (oldPictureUrl) {
    try {
      // Ekstrak nama file dari URL lama
      const oldFilename = path.basename(oldPictureUrl);
      const oldFilePath = path.join(uploadDir, oldFilename);
      await fs.promises.unlink(oldFilePath); // Hapus file
    } catch (err) {
      // Abaikan error jika file lama tidak ditemukan (mungkin sudah terhapus manual).
      console.warn(`Gagal menghapus file lama: ${oldPictureUrl}`, err.message);
    }
  }

  // 8. Update URL gambar profil di database.
  await user.update({ profile_picture_url: publicUrl });
  
  // Jangan kirim password hash kembali ke klien.
  const userJson = user.toJSON();
  delete userJson.password_hash;
  return userJson;
}

export const deleteProfilePicture = async (userId) => {
  // 1. Cari pengguna berdasarkan ID untuk mendapatkan path gambar.
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  // 2. Dapatkan URL gambar yang tersimpan di database.
  const pictureUrl = user.profile_picture_url;

  // 3. Jika tidak ada URL gambar, berarti tidak ada yang perlu dihapus.
  if (!pictureUrl) {
    return { message: 'Pengguna tidak memiliki foto profil.' };
  }

  // 4. Hapus file fisik dari direktori.
  try {
    // Ekstrak nama file dari URL (misal: dari '/public/images/profile-123.png' menjadi 'profile-123.png')
    const filename = path.basename(pictureUrl);
    // Tentukan path lengkap ke file di server.
    const filePath = path.resolve('public', 'images', filename);
    
    // Hapus file menggunakan fs.promises.unlink
    await fs.promises.unlink(filePath);
    console.log(`File berhasil dihapus: ${filePath}`);
  } catch (error) {
    // Jika file tidak ada di disk (misal: sudah terhapus manual),
    // kita tetap lanjutkan proses update database, cukup catat peringatannya.
    if (error.code === 'ENOENT') {
      console.warn(`File tidak ditemukan saat mencoba menghapus, tapi tetap melanjutkan: ${pictureUrl}`);
    } else {
      // Jika error lain, lempar error tersebut.
      throw error;
    }
  }

  // 5. Setelah file fisik dihapus, update kolom di database menjadi null.
  await user.update({ profile_picture_url: null });

  return { message: 'Foto profil berhasil dihapus.' };
}