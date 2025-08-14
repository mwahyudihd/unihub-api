import {
  createOrganization,
  deleteOrganization,
  findAllFiltered,
  findAllMyOrganizationsByUserId,
  findAllOpenedOrg,
  findAllOrganizationsWithoutCategories,
  findALlOrgByVerifStatusCondition,
  findOrganizationById,
  getApprovedOrganizationsWithCategories,
  searchOrganizationsByName,
  updateOrganizationDetails,
  updateOrganizationLogo,
  updateVerificationStatus,
} from "../services/organizations.service.js";

//pass
export const getAllOrganizationsFiltered = async (request, reply) => {
  try {
    // 1. Ambil seluruh body dari request.
    const requestBody = request.body;

    // 2. Panggil fungsi service dengan body tersebut.
    const organizations = await findAllFiltered(requestBody);

    reply.code(200).send({
      message: "Organizations retrieved successfully",
      statusCode: 200,
      total: organizations.length,
      data: organizations,
    });
  } catch (error) {
    reply
      .code(500)
      .send({
        message: "Terjadi kesalahan pada server",
        statusCode: 500,
        error: error.message,
      });
  }
};

export const getOrganizationById = async (request, reply) => {
  try {
    const { id } = request.params; // Mengambil ID dari parameter URL.
    const organization = await findOrganizationById(id);
    reply.code(200).send({
      message: "Organization retrieved successfully",
      statusCode: 200,
      data: organization,
    });
  } catch (error) {
    // Jika service melempar error 'tidak ditemukan', kirim 404.
    if (error.message.includes("ditemukan")) {
      reply.code(404).send({ message: error.message, statusCode: 404 });
    } else {
      reply
        .code(500)
        .send({
          message: "Terjadi kesalahan pada server",
          statusCode: 500,
          error: error.message,
        });
    }
  }
};

export const modifyOrganizationDetails = async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = request.body;
    // Asumsi: Ada middleware otorisasi yang memeriksa apakah req.user.id
    // berhak mengedit organisasi ini (misal: dia adalah admin organisasi).

    const updatedOrganization = await updateOrganizationDetails(id, updateData);
    reply.code(200).send({
      message: "Organisasi updated successfully",
      statusCode: 200,
      data: updatedOrganization,
    });
  } catch (error) {
    if (error.message.includes("ditemukan")) {
      reply.code(404).send({ message: error.message, statusCode: 404 });
    } else {
      reply.code(400).send({ message: error.message, statusCode: 400 });
    }
  }
};

export const removeOrganization = async (request, reply) => {
  try {
    const { id } = request.params;
    // Asumsi: Otorisasi juga diperiksa di sini.

    const responseMessage = await deleteOrganization(id);
    // Mengirim response 204 No Content yang menandakan sukses tanpa body.
    reply.code(204).send({
      message: responseMessage.message || "Organisasi deleted successfully",
      statusCode: 204,
      orgId: id,
    });
  } catch (error) {
    if (error.message.includes("ditemukan")) {
      reply.code(404).send({ message: error.message, statusCode: 404 });
    } else {
      reply
        .code(500)
        .send({ message: "Terjadi kesalahan pada server", statusCode: 500 });
    }
  }
};

export const verifyStatus = async (request, reply) => {
  try {
    // Asumsi: Endpoint ini hanya bisa diakses oleh super-admin.
    // Middleware otorisasi harus memeriksa peran req.user.
    const adminUserId = request.user.id;
    const { id } = request.params;
    const { status } = request.body;

    if (!["approved", "rejected"].includes(status)) {
      return reply
        .code(400)
        .send({ message: "Status tidak valid", statusCode: 400 });
    }

    const organization = await updateVerificationStatus(
      id,
      status,
      adminUserId
    );
    reply.code(200).send({
      message: "Organisasi verification status updated successfully",
      statusCode: 200,
      data: organization,
    });
  } catch (error) {
    if (error.message.includes("ditemukan")) {
      reply.code(404).send({ message: error.message, statusCode: 404 });
    } else {
      reply
        .code(500)
        .send({
          message: "Terjadi kesalahan pada server",
          statusCode: 500,
          error: error.message,
        });
    }
  }
};

export const getAllOrganizations = async (request, reply) => {
  try {
    const organizations = await findAllOrganizationsWithoutCategories();
    reply.code(200).send({
      message: "Organizations retrieved successfully",
      statusCode: 200,
      total: organizations.length,
      data: organizations,
    });
  } catch (error) {
    reply
      .code(500)
      .send({
        message: "Terjadi kesalahan pada server",
        statusCode: 500,
        error: error.message,
      });
  }
};
//pass

export const newOrganizationJsonReq = async (request, reply) => {
  try {
    const { user_id, categoryIds, description, name } = request.body;

    if (!user_id) {
      return reply
        .code(401)
        .send({ message: "Otentikasi diperlukan", statusCode: 401 });
    }

    const newOrganization = await createOrganization(
      { name, description },
      user_id,
      categoryIds
    );

    reply.code(201).send({
      message: "Organisasi created successfully",
      statusCode: 201,
      data: newOrganization,
    });
  } catch (error) {
    reply.code(400).send({
      message: error.message,
      statusCode: 400,
      error: error.message,
    });
  }
};

// pendaftaran buka
export const getAllOrgOpen = async (request, reply) => {
  try {
    const result = await findAllOpenedOrg();

    reply.code(200).send({
      message: "Organization retrieved successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error",
      statusCode: 500,
      error: error.message,
    });
  }
};

//ukm saya
export const getMyOrganizations = async (request, reply) => {
  try {
    const { userId } = request.query;
    const result = await findAllMyOrganizationsByUserId(userId);

    reply.code(200).send({
      message: "Berhasil mengambil daftar organisasi saya",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    console.error("[getMyOrganizations]", error);
    reply.code(500).send({
      message: "Gagal mengambil daftar organisasi",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const getAllOrgByVerifStatusCondition = async (request, reply) => {
  try {
    const { condition } = request.params;
    const result = await findALlOrgByVerifStatusCondition(condition);

    reply.code(200).send({
      message: "Organizations retreived successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const getOrgBySearchQuery = async (request, reply) => {
  try {
    const { name } = request.query;

    if (!name || name.trim() === "") {
      return reply.code(400).send({ message: "Parameter 'name' wajib diisi.", statusCode: 400});
    }

    const results = await searchOrganizationsByName(name);
    return reply.code(200).send({
      message: "Query success",
      statusCode: 200,
      data: results
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ message: "Terjadi kesalahan saat mencari organisasi.", statusCode: 500, error: error.message });
  }
};

export const changeOrgLogo = async (request, reply) => {
  try {
    // Ambil file dari request. Multipart plugin menyediakan req.file().
    const fileData = await request.file();

    // Validasi dasar: pastikan file ada.
    if (!fileData) {
      return reply.code(400).send({ message: 'Tidak ada file yang diunggah' });
    }
    
    // Ambil ID pengguna dari token otentikasi.
    const { orgId } = request.query;

    // Panggil service untuk memproses file.
    const updatedUser = await updateOrganizationLogo(orgId, fileData);

    reply.code(200).send({
      message: 'Foto profil berhasil diperbarui',
      statusCode: 200,
      data: updatedUser,
    });

  } catch (error) {
    console.error('Error changing profile picture:', error);
    reply.code(500).send({ message: 'Terjadi kesalahan pada server' });
  }
}

export const getApprovedOrganizationsHandler = async (request, reply) => {
  try {
    const organizations = await getApprovedOrganizationsWithCategories();
    return reply.code(200).send({
      message:"Organizations retrieved successfully",
      statusCode: 200,
      data: organizations
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      message: "Gagal mengambil data organisasi yang disetujui.",
      statusCode: 500,
      error: error.message
    });
  }
};