import { createCategoryHandler, deleteCategoryHandler, getAllCategoriesHandler, getCategoriesByOrgHandler, getCategoryByIdHandler, updateCategoryHandler } from "../controllers/categories.controller.js";

const categoryRoutes = async (fastify, options) => {
    // Rute untuk membuat kategori baru.
    fastify.post('/', createCategoryHandler);

    // Rute untuk mendapatkan semua kategori.
    fastify.get('/', getAllCategoriesHandler);

    // Rute untuk mendapatkan satu kategori berdasarkan ID.
    fastify.get('/:id', getCategoryByIdHandler);

    // Rute untuk memperbarui kategori.
    fastify.put('/:id', updateCategoryHandler);

    // Rute untuk menghapus kategori.
    fastify.delete('/:id', deleteCategoryHandler);
    
    // Rute untuk mendapatkan semua kategori dari sebuah organisasi.
    fastify.get('/:orgId/org', getCategoriesByOrgHandler);
}

export default categoryRoutes;