import { createAnnouncement, deleteAnnouncement, updateAnnouncement, uploadImage, deletePostPicture, getAnnouncementsByOrgId, getAnnouncementDetailById, getAnnouncementsByUserId } from "../services/announcements.service.js";

// CREATE
export const createAnnouncementHandler = async (request, reply) => {
  try {
    const body = request.body;

    if (!body.org_id || !body.author_id || !body.title || !body.content) {
      return reply.code(400).send({
        message: "Data not completed.",
        statusCode: 400,
      });
    }

    const announcement = await createAnnouncement(body);

    return reply.code(201).send({
        message: "Announcement created successfully.",
        statusCode: 200,
        data: announcement,
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const uploadImageHandler = async (request, reply) => {
  try {
    const { announcementId } = request.params;
    const file = await request.file();

    if (!file) {
      return reply.code(400).send({
        statusCode: 400,
        message: "File tidak ditemukan dalam permintaan.",
      });
    }

    const updatedPost = await uploadImage(announcementId, {
      filename: file.filename,
      file: file.file,
    });

    return reply.code(200).send({
      statusCode: 200,
      message: "Gambar berhasil diunggah.",
      data: updatedPost,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      message: "Gagal mengunggah gambar.",
      error: error.message,
    });
  }
};

export const updateAnnouncementHandler = async (request, reply) => {
  try {
    const { announcementId } = request.params;
    const updateData = request.body;

    const updatedAnnouncement = await updateAnnouncement(announcementId, updateData);

    return reply.code(200).send({
      statusCode: 200,
      message: "Pengumuman berhasil diperbarui.",
      data: updatedAnnouncement,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      message: "Gagal memperbarui pengumuman.",
      error: error.message,
    });
  }
};

export const deleteAnnouncementHandler = async (request, reply) => {
  try {
    const { announcementId } = request.params;

    await deleteAnnouncement(announcementId);

    return reply.code(200).send({
      statusCode: 200,
      message: "Pengumuman berhasil dihapus.",
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      message: "Gagal menghapus pengumuman.",
      error: error.message,
    });
  }
};

export const deleteAnnouncementImageHandler = async (request, reply) => {
  try {
    const { announcementId } = request.params;

    const result = await deletePostPicture(announcementId);

    return reply.code(200).send({
      statusCode: 200,
      message: "Gambar pengumuman berhasil dihapus.",
      data: result.data,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      message: "Gagal menghapus gambar pengumuman.",
      error: error.message,
    });
  }
};

/// GET
export const getAnnouncementsByOrg = async (request, reply) => {
  try {
    const { org_id } = request.params;
    
    const announcements = await getAnnouncementsByOrgId(org_id);

    reply.code(200).send({
      message: "Announcements retrieved successfullt",
      statusCode: 200,
      data: announcements
    });

  } catch (error) {
    console.error('Error getting announcements by organization:', error);
    reply.code(500).send({ message: 'Terjadi kesalahan pada server', statusCode: 500, error: error.message });
  }
};

export const getAnnouncementDetail = async (request, reply) => {
  try {
    // 1. Ambil ID pengumuman dari parameter URL (misal: /api/announcements/:id)
    const { id } = request.params;

    // 2. Panggil fungsi service untuk mengambil data dari database.
    const announcement = await getAnnouncementDetailById(id);

    // 3. Handle kasus jika pengumuman tidak ditemukan (service akan return null).
    if (!announcement) {
      // Kirim response 404 Not Found sesuai format yang diminta.
      return reply.code(404).send({
        message: 'Pengumuman tidak ditemukan',
        statusCode: 404,
        error: 'Not Found'
      });
    }

    // 4. Jika data berhasil ditemukan, kirim response 200 OK sesuai format.
    return reply.code(200).send({
      message: 'Detail pengumuman berhasil diambil',
      statusCode: 200,
      data: announcement
    });

  } catch (error) {
    // 5. Handle jika terjadi error tak terduga dari server atau database.
    console.error('Error fetching announcement detail:', error); // Logging untuk debug.
    
    // Kirim response 500 Internal Server Error sesuai format yang diminta.
    return reply.code(500).send({
      message: 'Terjadi kesalahan pada server',
      statusCode: 500,
      error: error.message
    });
  }
};

export const getAllAnnouncementsByuserIdHandler = async (request, reply) => {
    try {
      const { userId } = request.params;

      const announcements = await getAnnouncementsByUserId(userId);

      return reply.code(200).send({
        message: "Announcements retrieved successfully",
        statusCode: 200,
        data: announcements,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        status: "error",
        message: "Gagal mengambil pengumuman",
        error: error.message,
      });
    }
  };