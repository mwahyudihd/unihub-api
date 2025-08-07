import Category from "../models/category.model.js";

// Membuat kategori baru.
export const createCategory = async (categoryData) => {
    // Menggunakan Sequelize 'create' untuk membuat record baru di database.
    return await Category.create(categoryData);
};

// Mendapatkan semua kategori.
export const getAllCategories = async () => {
    // Mengambil semua record dari tabel 'categories'.
    return await Category.findAll();
};

// Mendapatkan satu kategori berdasarkan ID (Primary Key).
export const getCategoryById = async (id) => {
    // 'findByPk' adalah metode yang dioptimalkan untuk pencarian via Primary Key.
    return await Category.findByPk(id);
};

// Memperbarui data kategori berdasarkan ID.
export const updateCategory = async (id, updateData) => {
    // Cari dulu kategori yang mau diupdate.
    const category = await getCategoryById(id);
    if (!category) {
        return null; // Kembalikan null jika tidak ditemukan.
    }
    // Lakukan update dan kembalikan data yang sudah diperbarui.
    return await category.update(updateData);
};

// Menghapus kategori berdasarkan ID.
export const deleteCategory = async (id) => {
    const category = await getCategoryById(id);
    if (!category) {
        return 0; // Kembalikan 0 untuk menandakan tidak ada baris yang dihapus.
    }
    await category.destroy();
    return 1; // Kembalikan 1 untuk menandakan satu baris berhasil dihapus.
};

// Mendapatkan semua kategori yang dimiliki oleh sebuah organisasi.
export const getCategoriesByOrgId = async (orgId) => {
    // Query join untuk mengambil semua 'Category' yang terhubung dengan 'Organization'
    // melalui tabel pivot, dengan filter berdasarkan org_id.
    return await Category.findAll({
        include: [{
            model: Organization,
            where: { org_id: orgId }, // Kondisi filter pada tabel yang di-join.
            attributes: [], // Tidak perlu data dari tabel Organization.
        }],
        through: {
            attributes: [], // Tidak perlu data dari tabel pivot (OrganizationCategory).
        },
    });
};