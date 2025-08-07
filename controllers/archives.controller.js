import { createArchive, delAchiveById, getArchiveById, getArchivesByOrgId, getArchivesByType, updateArchive } from "../services/archives.service.js";

// Handler untuk membuat arsip baru.
export const createArchiveHandler = async (request, reply) => {
  try {
    const { org_id } = request.params;
    
    // Panggil service untuk membuat arsip dengan data dari body request.
    const archive = await createArchive({ ...request.body, org_id });
    
    // Kirim response 201 (Created) dengan data arsip yang baru dibuat.
    reply.code(201).send({
        message: "Archives retrieved successfully.",
        statusCode: 201,
        data: archive
    });
  } catch (error) {
    // Penanganan error jika terjadi kegagalan.
    reply.code(500).send({ message: 'Gagal membuat arsip', statusCode: 500, error: error.message });
  }
};

// Handler untuk mendapatkan semua arsip dari sebuah organisasi.
export const getArchivesByOrgHandler = async (request, reply) => {
  try {
    const { org_id } = request.params; // Ambil org_id dari URL.
    const archives = await getArchivesByOrgId(org_id);
    reply.code(200).send({
        message: "Archives retrieved successfully.",
        statusCode: 200,
        data:archives
    }); // Kirim data arsip yang ditemukan.
  } catch (error) {
    reply.code(500).send({ message: 'Gagal mengambil arsip', statusCode: 500, error: error.message });
  }
};

// Handler untuk mendapatkan detail satu arsip.
export const getArchiveByIdHandler = async (request, reply) => {
  try {
    const { archive_id } = request.params; // Ambil ID dari URL.
    const archive = await getArchiveById(archive_id);
    
    // Jika arsip tidak ditemukan, kirim response 404.
    if (!archive) {
      return reply.code(404).send({ message: 'Archive not found!', statusCode: 404 });
    }
    reply.code(200).send({
        message: "Archive retrieved successfully.",
        statusCode: 200,
        data: archive
    });
  } catch (error) {
    reply.code(500).send({ message: 'Gagal mengambil detail arsip', statusCode: 500, error: error.message });
  }
};

// Handler untuk memperbarui arsip.
export const updateArchiveHandler = async (request, reply) => {
  try {
    const { archive_id } = request.params; // Ambil ID dari URL.
    const updatedArchive = await updateArchive(archive_id, request.body);

    // Jika service mengembalikan null (karena data tidak ditemukan), kirim 404.
    if (!updatedArchive) {
      return reply.code(404).send({ message: "Archive isn't found!", statusCode: 404 });
    }
    reply.code(200).send({
        message: "Archive updated successfully.",
        statusCode: 200,
        data: updatedArchive
    }); // Kirim data yang sudah diupdate.
  } catch (error) {
    reply.code(500).send({ message: 'Gagal memperbarui arsip', error: error.message });
  }
};

// Handler untuk menghapus arsip.
export const deleteArchiveHandler = async (request, reply) => {
  try {
    const { org_id, archive_id } = request.params; // Ambil ID dari URL.
    const deletedRows = await ArchiveService.deleteArchive(archive_id, org_id);
    
    // Jika tidak ada baris yang dihapus (data tidak ditemukan), kirim 404.
    if (deletedRows === 0) {
      return reply.code(404).send({ message: 'Achive not found!', statusCode: 404 });
    }
    // Kirim response 204 (No Content) yang menandakan sukses tanpa body.
    reply.code(204).send({
        message: `Archive - ${archive_id} is deleted success.`,
        statusCode: 204
    });
  } catch (error) {
    reply.code(500).send({ message: 'Gagal menghapus arsip', error: error.message });
  }
};

export const getArchivesByTypeHandler = async (request, reply) => {
    try {
        const { type } = request.params;

        const archives = await getArchivesByType(type);

        reply.code(200).send({
            message: "Archives retrieved successfully.",
            statusCode: 200,
            data: archives
        });
    } catch (error) {
        reply.code(500).send({
            message: "Internal server error.",
            statusCode: 500,
            error: error.message
        });
    }
}

export const removeArchiveHandler = async (request, reply) => {
  try {
    const { archive_id } = request.params;
    const result = await delAchiveById(archive_id);

    reply.code(201).send({
      message: "Archive deleted successfully",
      statusCode: 201,
      status: result
    })
  } catch (error) {
    console.error(`_${error.message}`);
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
}