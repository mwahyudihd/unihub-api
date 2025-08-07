import {
  assignCategoryToOrganization,
  getAssignedCategoriesByOrgId,
  getAssignmentById,
  removeCategoryFromOrganization,
  replaceOrganizationCategories,
} from "../services/org.category.service.js";

/**
 * Handler untuk menghubungkan sebuah kategori ke sebuah organisasi.
 * Membutuhkan org_id dari URL dan category_id dari body.
 */
export const assignCategoryHandler = async (request, reply) => {
  try {
    // Ambil org_id dari parameter URL.
    const { orgId } = request.params;
    // Ambil category_id dari body request.
    const { category_id } = request.body;

    // Validasi sederhana: pastikan category_id ada di body.
    if (!category_id) {
      return reply.code(400).send({
        message: "Request body must contain 'category_id'.",
        statusCode: 400,
      });
    }

    // Panggil service untuk membuat relasi/link.
    const assignment = await assignCategoryToOrganization({
      org_id: orgId,
      category_id: category_id,
    });

    // Kirim response 201 (Created).
    reply.code(201).send({
      message: "Category assigned to organization successfully.",
      statusCode: 201,
      data: assignment,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Failed to assign category.",
      statusCode: 500,
      error: error.message,
    });
  }
};

/**
 * Handler untuk mendapatkan semua kategori yang terhubung ke satu organisasi.
 * Ini adalah fungsi utama yang Anda minta.
 */
export const getAssignedCategoriesHandler = async (request, reply) => {
  try {
    // Ambil org_id dari parameter URL.
    const { orgId } = request.params;

    // Panggil service untuk mendapatkan daftar kategori terkait.
    const categories = await getAssignedCategoriesByOrgId(orgId);

    reply.code(200).send({
      message: "Assigned categories retrieved successfully.",
      statusCode: 200,
      data: categories,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error retrieving assigned categories.",
      statusCode: 500,
      error: error.message,
    });
  }
};

/**
 * Handler untuk menghapus hubungan antara kategori dan organisasi.
 * Menargetkan ID unik dari relasi itu sendiri (org_category_id).
 */
export const removeCategoryHandler = async (request, reply) => {
  try {
    // Ambil ID unik dari relasi yang akan dihapus dari URL.
    const { orgCategoryId } = request.params;

    // Panggil service untuk menghapus. Service akan return 0 jika tidak ketemu.
    const deletedCount = await removeCategoryFromOrganization(orgCategoryId);

    // Jika tidak ada baris yang dihapus, berarti relasi tidak ditemukan.
    if (deletedCount === 0) {
      return reply.code(404).send({
        message: "Assignment not found.",
        statusCode: 404,
      });
    }

    // Kirim response sukses.
    reply.code(200).send({
      message: "Category assignment successfully removed.",
      statusCode: 200,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Failed to remove category assignment.",
      statusCode: 500,
      error: error.message,
    });
  }
};

/**
 * Handler opsional untuk mendapatkan detail satu relasi spesifik.
 * Berguna untuk debugging atau jika UI memerlukan detail link itu sendiri.
 */
export const getAssignmentByIdHandler = async (request, reply) => {
  try {
    const { orgCategoryId } = request.params;
    const assignment = await getAssignmentById(orgCategoryId);

    if (!assignment) {
      return reply.code(404).send({
        message: "Assignment not found.",
        statusCode: 404,
      });
    }

    reply.code(200).send({
      message: "Assignment detail retrieved successfully.",
      statusCode: 200,
      data: assignment,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error retrieving assignment detail.",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const replaceOrgCategoriesByOrgId = async (request, reply) => {
  try {
    const { orgId } = request.params;
    const { category_ids } = request.body;

    if (!Array.isArray(category_ids)) {
      return reply
        .code(400)
        .send({ message: "category_ids harus berupa array." });
    }

    const result = await replaceOrganizationCategories(orgId, category_ids);
    return reply.code(200).send({
        message: "Organization categories updated successfully",
        statusCode: 200,
        data: result
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ message: "Gagal mengganti kategori organisasi.", statusCode: 500, error: error.message });
  }
};
