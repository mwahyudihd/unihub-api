import AnnouncementComment from "../models/comments.model.js";
import User from "../models/user.model.js";

export const createComment = async (commentData) => {
  // 1. Buat komentar baru di database menggunakan data yang diberikan.
  const newComment = await AnnouncementComment.create(commentData);

  // 2. Ambil kembali komentar yang baru dibuat beserta data penulisnya untuk dikirim sebagai respons.
  // Ini memastikan frontend mendapatkan data lengkap tanpa perlu query lagi.
  return await AnnouncementComment.findByPk(newComment.comment_id, {
    include: {
      model: User,
      as: 'user',
      attributes: ['user_id', 'full_name', 'profile_picture_url']
    }
  });
};

export const updateComment = async (commentId, userId, newContent) => {
  // 1. Cari komentar berdasarkan ID-nya.
  const comment = await AnnouncementComment.findByPk(commentId);

  // 2. Jika komentar tidak ditemukan, lempar error.
  if (!comment) {
    throw new Error('Komentar tidak ditemukan');
  }

  // 3. Verifikasi hak akses: hanya penulis asli yang boleh mengedit.
  if (comment.user_id !== userId) {
    throw new Error('Anda tidak berhak mengedit komentar ini');
  }

  // 4. Update konten dan simpan perubahan.
  comment.content = newContent;
  await comment.save();
  
  return comment;
};

export const deleteComment = async (commentId, userId) => {
  // 1. Cari komentar berdasarkan ID-nya.
  const comment = await AnnouncementComment.findByPk(commentId);

  // 2. Jika komentar tidak ditemukan, lempar error.
  if (!comment) {
    throw new Error('Komentar tidak ditemukan');
  }

  // 3. Verifikasi hak akses: hanya penulis asli yang boleh menghapus.
  // Anda bisa menambahkan logika lain, misal admin organisasi juga boleh menghapus.
  if (comment.user_id !== userId) {
    throw new Error('Anda tidak berhak menghapus komentar ini');
  }

  // 4. Hapus komentar dari database.
  // Catatan: Karena ada 'ON DELETE CASCADE' di skema database,
  // semua balasan (replies) dari komentar ini akan otomatis ikut terhapus oleh PostgreSQL.
  await comment.destroy();

  return { message: 'Komentar berhasil dihapus' };
};