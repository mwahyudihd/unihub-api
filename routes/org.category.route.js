import { assignCategoryHandler, getAssignedCategoriesHandler, getAssignmentByIdHandler, removeCategoryHandler, replaceOrgCategoriesByOrgId } from "../controllers/org.category.controller.js";

// Fungsi plugin Fastify untuk mendaftarkan rute.
async function organizationCategoryRoutes(fastify, options) {

    // --- Rute Berbasis Organisasi ---
    // Grup endpoint yang beroperasi dalam konteks sebuah organisasi spesifik.

    // GET /organizations/:orgId/categories
    // Rute utama untuk mengambil semua kategori yang telah dihubungkan ke sebuah organisasi.
    fastify.get('/org/:orgId/categories', getAssignedCategoriesHandler);

    // POST /organizations/:orgId/categories
    // Rute untuk menghubungkan (assign) sebuah kategori baru ke organisasi.
    // 'category_id' dikirim melalui request body.
    fastify.post('/org/:orgId/categories', assignCategoryHandler);
    fastify.put('/org/:orgId/categories', replaceOrgCategoriesByOrgId);


    // --- Rute Berbasis Relasi ---
    // Grup endpoint yang menargetkan record relasi secara spesifik.

    // GET /organization-categories/:orgCategoryId
    // Rute untuk mendapatkan detail dari satu record hubungan spesifik.
    fastify.get('/:orgCategoryId', getAssignmentByIdHandler);

    // DELETE /:orgCategoryId
    // Rute untuk menghapus (unassign) sebuah hubungan kategori dari organisasi.
    fastify.delete('/:orgCategoryId', removeCategoryHandler);
}

// Ekspor plugin rute untuk diregistrasi di instance Fastify utama.
export default organizationCategoryRoutes;