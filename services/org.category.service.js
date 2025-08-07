import Category from "../models/category.model.js";
import OrganizationCategory from "../models/org.category.model.js";
import Organization from "../models/organization.model.js";

/**
 * Menghubungkan sebuah kategori ke sebuah organisasi.
 * @param {object} data - Objek berisi { org_id, category_id }.
 * @returns {Promise<OrganizationCategory>} Record relasi yang baru dibuat.
 */
export const assignCategoryToOrganization = async (data) => {
    // Mengecek apakah relasi sudah ada untuk mencegah duplikat.
    const existing = await OrganizationCategory.findOne({
        where: {
            org_id: data.org_id,
            category_id: data.category_id,
        },
    });

    // Jika sudah ada, kembalikan data yang ada daripada membuat baru.
    if (existing) {
        // Bisa juga melempar error jika duplikasi tidak diizinkan.
        // throw new Error('Category is already assigned to this organization.');
        return existing;
    }

    // Membuat record baru di tabel pivot 'organization_categories'.
    return await OrganizationCategory.create(data);
};

/**
 * Mendapatkan semua kategori yang terhubung ke satu organisasi.
 * @param {string} orgId - UUID dari organisasi.
 * @returns {Promise<Array<OrganizationCategory>>} Daftar relasi beserta detail kategori.
 */
export const getAssignedCategoriesByOrgId = async (orgId) => {
    // Mencari semua entri di OrganizationCategory yang cocok dengan org_id.
    // 'include' digunakan untuk melakukan JOIN dan mengambil data dari tabel Category.
    return await OrganizationCategory.findAll({
        where: { org_id: orgId },
        include: [{
            model: Category, // Melakukan JOIN dengan model Category.
            required: true,  // Memastikan hanya hasil yang memiliki kategori valid yang dikembalikan (INNER JOIN).
        }],
    });
};

/**
 * Mendapatkan detail sebuah relasi spesifik berdasarkan ID-nya.
 * @param {string} orgCategoryId - UUID dari record relasi.
 * @returns {Promise<OrganizationCategory|null>} Detail relasi atau null jika tidak ditemukan.
 */
export const getAssignmentById = async (orgCategoryId) => {
    // Mencari satu record relasi berdasarkan Primary Key-nya.
    // 'include' juga dipakai di sini untuk memberikan konteks (nama Organisasi dan Kategori).
    return await OrganizationCategory.findByPk(orgCategoryId, {
        include: [
            { model: Organization },
            { model: Category }
        ]
    });
};


/**
 * Menghapus hubungan antara kategori dan organisasi.
 * @param {string} orgCategoryId - UUID dari record relasi yang akan dihapus.
 * @returns {Promise<number>} Mengembalikan angka 1 jika berhasil, 0 jika tidak ditemukan.
 */
export const removeCategoryFromOrganization = async (orgCategoryId) => {
    // Menggunakan 'destroy' untuk menghapus record berdasarkan primary key.
    const result = await OrganizationCategory.destroy({
        where: { org_category_id: orgCategoryId },
    });
    // 'destroy' mengembalikan jumlah baris yang dihapus.
    return result;
};

export const replaceOrganizationCategories = async (org_id, category_ids = []) => {
  try {
    // 1. Hapus semua kategori lama berdasarkan org_id
    await OrganizationCategory.destroy({
      where: { org_id },
    });

    // 2. Masukkan kategori baru (jika ada)
    if (category_ids.length > 0) {
      const newEntries = category_ids.map((category_id) => ({
        org_id,
        category_id,
      }));

      await OrganizationCategory.bulkCreate(newEntries);
    }

    return { success: true, message: "Kategori organisasi berhasil diperbarui." };
  } catch (error) {
    console.error("Error updating organization categories:", error);
    throw error;
  }
};