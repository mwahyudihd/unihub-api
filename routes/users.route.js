/*
 * routes/users.route.js
 * Mendefinisikan endpoint API untuk resource pengguna.
 * Menghubungkan setiap rute ke fungsi controller yang sesuai.
 */
import { addUser, changeProfileInfo, changeProfilePicture, deleteMyProfilePicture, getAllUsers, getUserByEmail, getUserById, loginUser, modifyPassword, removeUser, resendCode, verifyEmail } from "../controllers/users.controller.js"; // Mengimpor controller pengguna.

// Fungsi ini akan dieksekusi oleh Fastify untuk mendaftarkan rute.
// 'fastify' adalah instance dari server, 'options' berisi opsi yang di-pass saat registrasi (misal: prefix).
export default async function userRoutes(fastify, options) {
  fastify.get('/', getAllUsers);
  fastify.get('/:id', getUserById);
  fastify.delete('/:id', removeUser);
  fastify.patch('/:id/password', modifyPassword);
  fastify.patch('/profile/picture', changeProfilePicture);
  fastify.delete('/profile/picture', deleteMyProfilePicture);
  fastify.put('/profile/data', changeProfileInfo);
  fastify.get('/login/q', getUserByEmail);
  fastify.post('/login', loginUser);
  fastify.post('/register', addUser);
  fastify.post('/verify/:type', verifyEmail);
  fastify.post('/request/code', resendCode);
}