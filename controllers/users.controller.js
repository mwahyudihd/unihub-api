import { deleteProfilePicture, deleteUser, findAllUsers, findUserByEmail, findUserByUserIdWithResetPassword, getUserWithActiveOrganizations, login, saveUser, updateImageProfile, updateUser } from '../services/users.service.js';
import { sendVerificationCode, verifyCode } from '../services/verifications.service.js';

export const getAllUsers = async (request, reply) => {
  try {
    const users = await findAllUsers();
    reply.code(200).send({
      message: "Users retrieved successfully",
      statusCode: 200,
      data: users
    });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error', error: error.message, statusCode: 500 });
    return;
  }
}

export const getUserByEmail = async (request, reply) => {
  try {
    const { email } = request.query;
    const result = await findUserByEmail(email);
    if (!result) {
      reply.code(404).send({
        message: "Tidak ada email yang terdaftar dengan alamat tersebut.",
        statusCode: 404,
      });
    }
    reply.code(200).send({
      message: "User retrieved successfully.",
      statusCode: 200,
      data: result
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
}

export const getUserById = async (request, reply) => {
  try {
    const userId = request.params.id;
    const user = await getUserWithActiveOrganizations(userId);
    reply.send({
        message: "User retrieved successfully",
        statusCode: 200,
        data: user
    });
  } catch (error) {
    reply.code(404).send({ 
        message: error.message,
        statusCode: 404
    });
  }
}

export const removeUser = async (request, reply) => {
  try {
    const userId = request.params.id;
    await deleteUser(userId);
    reply.code(204).send({
        message: "User deleted successfully",
        statusCode: 204,
        userId: userId
    }); // No Content
  } catch (error) {
    reply.code(404).send({ 
        message: error.message,
        statusCode: 404
    });
  }
}

export const loginUser = async (request, reply) => {
    try {
    // 1. Ambil 'identifier' (bisa email/nim) dan 'password' dari body request.
    const { identifier, password } = request.body;

    // 2. Validasi input dasar.
    if (!identifier || !password) {
      return reply.code(400).send({ 
        message: "Identifier and password are required",
        statusCode: 400 
      });
    }

    // 3. Panggil service login.
    const loginData = await login(identifier, password);

    // 4. Jika sukses, kirim response 200 OK dengan token.
    reply.code(200).send({
      message: 'Login berhasil',
      statusCode: 200,
      token: loginData.token,
      is_verified: loginData.is_verified,
      data: {
        ...loginData.user,
      }
    });

  } catch (error) {
    // 5. Jika service melempar error ('Kredensial tidak valid'), kirim response 401 Unauthorized.
    reply.code(401).send({ message: error.message, statusCode: 401 });
  }
}

export const addUser = async (request, reply) => {
  try {
    // 1. Buat user seperti biasa.
    const newUser = await saveUser(request.body);
    
    reply.code(201).send({ 
        message: 'Registrasi berhasil. Silakan login dan cek email Anda untuk kode aktivasi.',
        statusCode: 201,
        data: newUser 
    });
  } catch (error) {
    reply.code(400).send({ message: error.message, statusCode: 400 });
  }
}

export const verifyEmail = async (request, reply) => {
  try { // Dapatkan ID user dari token otentikasi.
    const { code, user_id } = request.body; // Dapatkan kode dari body request.
    const { type } = request.params;

    const result = await verifyCode(user_id, code, type);
    reply.code(201).send({
      message: result.message,
      statusCode: 201,
      status: result.status
    });
  } catch (error) {
    reply.code(400).send({ message: error.message, statusCode: 400 });
  }
}

export const resendCode = async (request, reply) => {
  try {
    const { user_id, type } = request.body;
    const result = await sendVerificationCode(user_id, type);
    reply.code(201).send({
      message: "The verification code has been successfully sent. Please check your email.",
      statusCode: 201,
      status: true
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error!", statusCode: 500, error: error.message, status: false
    });
  }
}

export const modifyPassword = async (request, reply) => {
  try {
    const { password } = request.body;
    const { id: user_id } = request.params;
    if (!user_id || !password) {
      return reply.code(400).send({
        message: "User ID and password are required.",
        statusCode: 400,
        status: false
      });
    }
    const isNewPasswordValid = await findUserByUserIdWithResetPassword(user_id, password);
    if (!isNewPasswordValid) {
      reply.code(400).send({
        message: "The password cannot be the same as before!.",
        statusCode: 400,
        status: false
      });
    }
    await updateUser(user_id, {
      password_hash: password
    });
    reply.code(200).send({
      message: "Password update successfully",
      statusCode: 200,
      status: true
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message,
      status: false
    });
  }
}

export const changeProfilePicture = async (request, reply) => {
  try {
    // Ambil file dari request. Multipart plugin menyediakan request.file().
    const fileData = await request.file();

    // Validasi dasar: pastikan file ada.
    if (!fileData) {
      return reply.code(400).send({ message: 'Tidak ada file yang diunggah' });
    }
    
    // Ambil ID pengguna dari token otentikasi.
    const { userId } = request.query;

    // Panggil service untuk memproses file.
    const updatedUser = await updateImageProfile(userId, fileData);

    reply.header('Access-Control-Allow-Origin', request.headers.origin || '*')
    .header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .code(200).send({
      message: 'Foto profil berhasil diperbarui',
      statusCode: 200,
      data: updatedUser,
    });

  } catch (error) {
    console.error('Error changing profile picture:', error);
    reply.code(500).send({ message: 'Terjadi kesalahan pada server' });
  }
}

export const deleteMyProfilePicture = async (request, reply) => {
  try {
    // Ambil ID pengguna dari token otentikasi.
    const { userId } = request.query;
    
    // Panggil service untuk menghapus gambar.
    const result = await deleteProfilePicture(userId);

    reply.code(200).send({message: result, statusCode: 200});
  } catch (error) {
    if (error.message.includes('ditemukan')) {
      reply.code(404).send({ message: error.message });
    } else {
      console.error('Error deleting profile picture:', error);
      reply.code(500).send({ message: 'Terjadi kesalahan pada server' });
    }
  }
}

export const changeProfileInfo = async (request, reply) => {
  
  try {
    const { full_name, prodi, bio, user_id, contact } = request.body;
  
    if (!user_id) {
      reply.code(404).send({
        message: "User id is required!",
        statusCode: 404
      });
    }
    const result = await updateUser(user_id, { full_name, prodi, bio, contact });
    reply.code(200).send({
      message: "User update successfully.",
      statusCode: 200,
      data: result
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }

}