import { Op } from 'sequelize';
import Verification from '../models/verification.model.js';
import User from '../models/user.model.js';
import { transporter } from '../configs/mailer.config.js';
import { generateRandom6Digit } from '../utils/generators.js';
import { sequelize } from '../configs/db.config.js';

export async function sendVerificationCode(userId, type) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Pengguna tidak ditemukan');
  if (type === 'account_activation' && user.is_verified) {
      throw new Error('Akun sudah terverifikasi');
  }

  const code = generateRandom6Digit();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Kedaluwarsa dalam 15 menit.

  // 1. Buat record baru di tabel 'verifications'.
  await Verification.create({
    user_id: userId,
    verification_type: type,
    verification_code: code,
    expired_at: expiresAt,
  });
  
  // 2. Siapkan dan kirim email.
  const subject = type === 'account_activation' 
    ? 'Aktivasi Akun UniHub Anda' 
    : 'Permintaan Reset Password UniHub';
  
  const content = type === 'account_activation'
    ? 'Gunakan kode berikut untuk mengaktifkan akun Anda:'
    : 'Gunakan kode berikut untuk mereset password Anda:';

  await transporter.sendMail({
    from: `"UniHub" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: subject,
    html: `
        <p>Kode ini akan kedaluwarsa dalam 15 menit.</p>
        <div style="font-family: sans-serif; text-align: center;">
        <h2>${subject}</h2>
        <p>${content}</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px;">
          ${code}
        </p>
        <p>Kode ini akan kedaluwarsa dalam 15 menit.</p>
        <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      </div>
    `,
  });
}

export async function findCurrentCodeByUserIdAndType(userId, type) {
  return Verification.findOne({
    where: {
      user_id: userId,
      verification_type: type,
      is_used: false, // Cari yang belum pernah dipakai.
      expired_at: {
        [Op.gt]: new Date() // Cari yang belum kedaluwarsa (expired_at > waktu sekarang).
      }
    },
    // Ambil yang paling baru jika ada beberapa kode yang valid.
    order: [['created_at', 'DESC']]
  });
}

export async function verifyCode(userId, code, type) {
  // Membungkus semua operasi database dalam satu transaksi.
  // Jika salah satu gagal, semua akan dibatalkan (rollback).
  return sequelize.transaction(async (t) => {
    // 1. Cari pengguna dan kode verifikasi di dalam transaksi.
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }

    // Menggunakan fungsi yang sudah ada untuk mencari kode yang valid.
    const verification = await findCurrentCodeByUserIdAndType(userId, type);

    // 2. [FIX] Cek apakah kode valid ditemukan. Ini mencegah error 'cannot read property of null'.
    if (!verification || verification.verification_code !== code.toUpperCase()) {
      throw new Error('Kode verifikasi tidak valid atau telah kedaluwarsa');
    }

    // 3. Tandai kode sudah digunakan di dalam transaksi.
    await verification.update({ is_used: true }, { transaction: t });

    // 4. [FIX] Lakukan aksi berdasarkan tipe verifikasi.
    if (type === 'account_activation') {
      if (user.is_verified) {
        return { message: 'Akun sudah terverifikasi sebelumnya', status: false };
      }
      // Hanya ubah status 'is_verified' jika tipenya adalah aktivasi akun.
      await user.update({ is_verified: true }, { transaction: t });
      return { message: 'Akun berhasil diaktifkan!', status: true };
    } 
    
    else if (type === 'password_reset') {
      // Untuk reset password, kita hanya memvalidasi bahwa kodenya benar.
      // Langkah selanjutnya (mengirim token reset atau mengizinkan ganti password) akan dilakukan oleh fungsi lain.
      return { message: 'Kode untuk reset password valid', status: true };
    }

    // Jika ada tipe lain di masa depan.
    throw new Error('Tipe verifikasi tidak dikenal');
  });
}