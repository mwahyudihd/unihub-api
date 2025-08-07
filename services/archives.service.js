import OrganizationArchive from "../models/archives.model.js";

// Service untuk membuat arsip baru.
export const createArchive = async (archiveData) => {
  // Menggunakan metode 'create' dari Sequelize untuk menyimpan data baru.
  return await OrganizationArchive.create(archiveData);
};

// Service untuk mengambil semua arsip berdasarkan ID organisasi.
export const getArchivesByOrgId = async (orgId) => {
  // Menggunakan 'findAll' untuk mencari semua record yang cocok dengan org_id.
  return await OrganizationArchive.findAll({ where: { org_id: orgId } });
};

export const getArchivesByType = async (archiveType) => {
    return await OrganizationArchive.findAll({ where : { archive_type: archiveType } })
}

// Service untuk mengambil satu arsip berdasarkan ID arsip dan ID organisasi.
export const getArchiveById = async (archiveId) => {
  // Menggunakan 'findOne' untuk mencari satu record yang cocok dengan primary key (archive_id) dan org_id.
  return await OrganizationArchive.findOne({ where: { archive_id: archiveId } });
};

// Service untuk memperbarui data arsip.
export const updateArchive = async (archiveId, updateData) => {
  const [rowsUpdated, [updatedArchive]] = await OrganizationArchive.update(updateData, {
    where: { archive_id: archiveId },
    returning: true, 
  });
  return updatedArchive;
};

// Service untuk menghapus arsip.
export const deleteArchive = async (archiveId, orgId) => {
  // Menggunakan 'destroy' untuk menghapus record dari database.
  // Mengembalikan jumlah baris yang terhapus (0 atau 1).
  return await OrganizationArchive.destroy({
    where: { archive_id: archiveId, org_id: orgId },
  });
};

export const delAchiveById = async (archiveId) => {
  const archive = await OrganizationArchive.findByPk(archiveId);
  if (!archive) {
    throw new Error("Archive isn't found!");
  }

  await archive.destroy();
  return true;
}