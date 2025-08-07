import { createComment, deleteComment, updateComment } from "../services/comments.service.js";


export const createCommentHandler = async (request, reply) => {
  try {
    // 1. Ambil data yang diperlukan dari request.
    const { announcementId } = request.params; // ID pengumuman dari URL
    const { content, parent_comment_id, user_id } = request.body;
    // Validasi input dasar.
    if (!content) {
      return reply.code(400).send({
        message: 'Konten komentar tidak boleh kosong',
        statusCode: 400,
        error: 'Bad Request'
      });
    }

    // 2. Siapkan data untuk dikirim ke service.
    const commentData = {
      announcement_id: announcementId,
      user_id: user_id,
      content: content,
      parent_comment_id: parent_comment_id || null, // Set null jika bukan balasan
    };

    // 3. Panggil service untuk membuat komentar.
    const newComment = await createComment(commentData);

    // 4. Kirim respons sukses dengan status 201 Created.
    return reply.code(201).send({
      message: 'Komentar berhasil ditambahkan',
      statusCode: 201,
      data: newComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return reply.code(500).send({
      message: 'Terjadi kesalahan pada server',
      statusCode: 500,
      error: error.message
    });
  }
};

export const updateCommentHandler = async (request, reply) => {
  try {
    // 1. Ambil data yang diperlukan dari request.
    const { id } = request.params; // ID komentar dari URL
    const { content, user_id } = request.body; // Konten baru dari body

    if (!content) {
      return reply.code(400).send({
        message: 'Konten komentar tidak boleh kosong',
        statusCode: 400,
        error: 'Bad Request'
      });
    }

    // 2. Panggil service untuk mengupdate.
    const updatedComment = await updateComment(id, user_id, content);

    // 3. Kirim respons sukses.
    return reply.code(200).send({
      message: 'Komentar berhasil diupdate',
      statusCode: 200,
      data: updatedComment
    });

  } catch (error) {
    // 4. Handle error spesifik dari service.
    if (error.message.includes('tidak ditemukan')) {
      return reply.code(404).send({ message: error.message, statusCode: 404, error: 'Not Found' });
    }
    if (error.message.includes('tidak berhak')) {
      return reply.code(403).send({ message: error.message, statusCode: 403, error: 'Forbidden' });
    }
    
    console.error('Error updating comment:', error);
    return reply.code(500).send({ message: 'Terjadi kesalahan pada server', statusCode: 500, error: error.message });
  }
};

export const deleteCommentHandler = async (request, reply) => {
  try {
    // 1. Ambil data yang diperlukan dari request.
    const { id } = request.params;
    const { user_id } = request.body;

    // 2. Panggil service untuk menghapus.
    const result = await deleteComment(id, user_id);

    // 3. Kirim respons sukses.
    return reply.code(200).send({
      message: result.message,
      statusCode: 200,
      data: result
    });

  } catch (error) {
    // 4. Handle error spesifik dari service.
    if (error.message.includes('tidak ditemukan')) {
      return reply.code(404).send({ message: error.message, statusCode: 404, error: 'Not Found' });
    }
    if (error.message.includes('tidak berhak')) {
      return reply.code(403).send({ message: error.message, statusCode: 403, error: 'Forbidden' });
    }

    console.error('Error deleting comment:', error);
    return reply.code(500).send({ message: 'Terjadi kesalahan pada server', statusCode: 500, error: error.message });
  }
};