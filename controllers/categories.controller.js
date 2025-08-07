import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoriesByOrgId,
} from "../services/categories.service.js";

// Handler untuk membuat kategori baru.
export const createCategoryHandler = async (request, reply) => {
  try {
    // Panggil service dengan data dari body request.
    const newCategory = await createCategory(request.body);

    // Kirim response 201 (Created) dengan format standar.
    reply.code(201).send({
      message: "Category created successfully.",
      statusCode: 201,
      data: newCategory,
    });
  } catch (error) {
    // Tangani error, misal duplikasi nama (unique constraint).
    reply.code(400).send({
      message: "Failed to create category.",
      statusCode: 400,
      error: error.message,
    });
  }
};

// Handler untuk mendapatkan semua kategori.
export const getAllCategoriesHandler = async (request, reply) => {
  try {
    const categories = await getAllCategories();
    reply.code(200).send({
      message: "Categories retrieved successfully.",
      statusCode: 200,
      data: categories,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error retrieving categories.",
      statusCode: 500,
      error: error.message,
    });
  }
};

// Handler untuk mendapatkan kategori berdasarkan ID.
export const getCategoryByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params; // Ambil ID dari URL.
    const category = await getCategoryById(id);

    // Jika service mengembalikan null, berarti data tidak ditemukan.
    if (!category) {
      return reply.code(404).send({
        message: "Category not found.",
        statusCode: 404,
      });
    }

    reply.code(200).send({
      message: "Category retrieved successfully.",
      statusCode: 200,
      data: category,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error retrieving category.",
      statusCode: 500,
      error: error.message,
    });
  }
};

// Handler untuk memperbarui kategori.
export const updateCategoryHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const updatedCategory = await updateCategory(id, request.body);

    // Jika service mengembalikan null, data tidak ditemukan.
    if (!updatedCategory) {
      return reply.code(404).send({
        message: "Category not found.",
        statusCode: 404,
      });
    }

    reply.code(200).send({
      message: "Category updated successfully.",
      statusCode: 200,
      data: updatedCategory,
    });
  } catch (error) {
    // Tangani error, misal duplikasi nama.
    reply.code(400).send({
      message: "Failed to update category.",
      statusCode: 400,
      error: error.message,
    });
  }
};

// Handler untuk menghapus kategori.
export const deleteCategoryHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const deletedRows = await deleteCategory(id);

    // Jika service mengembalikan 0, tidak ada data yang dihapus.
    if (deletedRows === 0) {
      return reply.code(404).send({
        message: "Category not found.",
        statusCode: 404,
      });
    }

    // Kirim response 200 dengan pesan sukses (204 tidak boleh memiliki body).
    reply.code(200).send({
      message: "Category deleted successfully.",
      statusCode: 200,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Failed to delete category.",
      statusCode: 500,
      error: error.message,
    });
  }
};

// Handler untuk mendapatkan kategori berdasarkan ID Organisasi.
export const getCategoriesByOrgHandler = async (request, reply) => {
  try {
    const { orgId } = request.params; // Ambil ID Organisasi dari URL.
    const categories = await getCategoriesByOrgId(orgId);

    reply.code(200).send({
      message: "Organization categories retrieved successfully.",
      statusCode: 200,
      data: categories,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error retrieving organization categories.",
      statusCode: 500,
      error: error.message,
    });
  }
};
