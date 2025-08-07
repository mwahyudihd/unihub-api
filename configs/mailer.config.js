import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Pastikan variabel environment sudah di-load.

// Konfigurasi transporter untuk mengirim email.
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_APP_HOST ?? 'stmtp.googlemail.com', // Gunakan host provider email Anda
  port: 465,
  secure: true, // true untuk port 465, false untuk port lain
  auth: {
    user: process.env.EMAIL_APP_USER ?? 'wawprjct@gmail.com', // Alamat email Anda dari file .env
    pass: process.env.EMAIL_APP_PASSWORD ?? 'nibo kzhk bbia wuad', // Gunakan "App Password" dari Google, BUKAN password asli.
  },
});