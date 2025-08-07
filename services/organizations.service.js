import { sequelize } from "../configs/db.config.js";
import Organization from '../models/organization.model.js';
import Member from '../models/member.model.js';
import OrgCategory from '../models/org.category.model.js';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import fs from 'fs';
import OrganizationCategory from "../models/org.category.model.js";
import { Op } from "sequelize";

const pump = promisify(pipeline);

//pass

export const findAllFiltered = async (requestBody = {}) => {
  // 1. Siapkan opsi query dasar untuk Sequelize.
  const queryOptions = {
    where: {},
    include: [],
    distinct: true, // Hindari duplikat jika satu org cocok dengan beberapa filter kategori.
  };

  // 2. Ekstrak array ID kategori dari body.
  const categoryIds = requestBody.filter;

  // 3. Jika 'filter' ada, merupakan array, dan tidak kosong, buat klausa 'include'.
  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    queryOptions.include.push({
      model: Category,
      attributes: ['category_id', 'name'],
      through: { attributes: [] }, // Jangan tampilkan data dari tabel penghubung.
      // Gunakan [Op.in] untuk mencari organisasi dengan category_id yang ada di dalam array.
      where: {
        category_id: {
          [Op.in]: categoryIds,
        },
      },
      // 'required: true' mengubah JOIN menjadi INNER JOIN,
      // memastikan hanya organisasi yang punya kategori ini yang ditampilkan.
      required: true, 
    });
  }

  // 4. (Fleksibel) Tambahkan filter lain dari body ke klausa 'where' utama.
  // Ini membuat fungsi bisa menangani filter lain seperti 'verification_status'.
  for (const key in requestBody) {
    if (key !== 'filter') {
      queryOptions.where[key] = requestBody[key];
    }
  }

  // 5. Jalankan query dan kembalikan hasilnya.
  return Organization.findAll(queryOptions);
};

export const findAllOrganizationsWithoutCategories = async () => {
  // Mengambil semua organisasi tanpa menyertakan data kategori.
  return Organization.findAll();
}

/**
 * Mengambil satu data organisasi berdasarkan ID, beserta data terkait.
 * @param {string} orgId - UUID dari organisasi.
 * @returns {Promise<Organization>} Objek organisasi lengkap dengan anggota dan kategori.
 * @throws {Error} Jika organisasi tidak ditemukan.
 */
export const findOrganizationById = async (orgId) => {
  const organization = await Organization.findByPk(orgId, {
    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["category_id", "name"],
        through: { attributes: [] },
      },
      {
        model: OrganizationCategory,
        as: "org_category",
        attributes: ["org_id", "category_id"],
      },
      {
        model: Member,
        as: "members",
        attributes: ["member_id", "role", "join_date", "jabatan"],
        where: { status: "active" }, // ✅ hanya member dengan status 'active'
        required: false, // supaya organisasi tetap muncul meski belum ada member aktif
        include: {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name", "profile_picture_url"],
        },
      },
    ],
  });

  if (!organization) {
    throw new Error("Organisasi tidak ditemukan");
  }

  return organization;
};

/**
 * Mengupdate data dasar sebuah organisasi.
 * @param {string} orgId - UUID dari organisasi.
 * @param {object} updateData - Data yang akan diupdate.
 * @returns {Promise<Organization>} Objek organisasi yang telah diupdate.
 */
export const updateOrganizationDetails = async (orgId, updateData) => {
  const organization = await Organization.findByPk(orgId);
  if (!organization) {
    throw new Error('Organisasi tidak ditemukan');
  }
  return organization.update(updateData);
}

export const deleteOrganization = async (orgId) => {
  const organization = await Organization.findByPk(orgId);
  if (!organization) {
    throw new Error('Organisasi tidak ditemukan');
  }
  await organization.destroy();
  return { message: 'Organisasi deleted successfully' };
}

export const updateVerificationStatus = async (orgId, status, adminUserId) => {
  const organization = await Organization.findByPk(orgId);
  if (!organization) {
    throw new Error('Organisasi tidak ditemukan');
  }

  const updatePayload = {
    verification_status: status,
    verified_by_user_id: adminUserId,
    verified_at: new Date() // Catat waktu verifikasi.
  };

  return organization.update(updatePayload);
}

export const createOrganization = async (orgData, creatorUserId, categoryIds) => {
  // Memulai transaksi untuk memastikan semua operasi berhasil atau semua gagal.
  const result = await sequelize.transaction(async (t) => {
    // 1. Buat entitas organisasi di dalam transaksi.
    const newOrganization = await Organization.create(orgData, { transaction: t });

    // 2. Daftarkan pembuat sebagai anggota pertama dengan peran 'ketua' ('1a').
    await Member.create({
      org_id: newOrganization.org_id,
      user_id: creatorUserId,
      role: '1a', // '1a' sebagai Ketua/Founder.
    }, { transaction: t });

    // 3. Jika ada kategori yang dipilih, buat asosiasinya.
    if (categoryIds && categoryIds.length > 0) {
      const orgCategoryData = categoryIds.map(catId => ({
        org_id: newOrganization.org_id,
        category_id: catId,
      }));
      // Gunakan bulkCreate untuk efisiensi saat memasukkan banyak data.
      await OrgCategory.bulkCreate(orgCategoryData, { transaction: t });
    }

    // Kembalikan objek organisasi yang baru dibuat.
    return newOrganization;
  });

  return result;
}

export const updateOrganizationLogo = async (orgId, fileData) => {
  const organization = await Organization.findByPk(orgId);
  if (!organization) throw new Error('Organisasi tidak ditemukan');

  const oldLogoUrl = organization.logo_url;
  const fileExtension = path.extname(fileData.filename);
  const newFilename = `logo-${orgId}-${Date.now()}${fileExtension}`;
  
  // Tentukan direktori dan URL untuk logo
  const uploadDir = path.resolve('public', 'icons');
  const filePath = path.join(uploadDir, newFilename);
  const publicUrl = `/public/icons/${newFilename}`;

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await pump(fileData.file, fs.createWriteStream(filePath));
  
  if (oldLogoUrl) {
    try {
      const oldFilename = path.basename(oldLogoUrl);
      const oldBaseDir = path.dirname(oldLogoUrl).substring(1);
      const oldFilePath = path.resolve(oldBaseDir, oldFilename);
      await fs.promises.unlink(oldFilePath);
    } catch (err) {
      console.warn(`Gagal menghapus logo lama: ${oldLogoUrl}`, err.message);
    }
  }

  await organization.update({ logo_url: publicUrl });
  
  return organization;
}

export const findAllOpenedOrg = async () => {
  const data = Organization.findAll({
    where: {
      recruitment_status: 'open', verification_status: 'approved'
    }
  });
  return data;
}

export const findAllMyOrganizationsByUserId = async (userId) => {
  return await Member.findAll({
    where: {
      user_id: userId,
      status: 'active'
    },
    include: [
      {
        model: Organization,
        as: 'organization',
        where: {
          verification_status: 'approved'
        },
        attributes: ['org_id', 'name', 'description', 'logo_url', 'verification_status', 'recruitment_status', 'created_at', 'updated_at']
      }
    ],
    attributes: ['member_id', 'jabatan', 'role', 'status', 'join_date'],
    order: [['join_date', 'DESC']]
  });
};

export const findALlOrgByVerifStatusCondition = async (condition) => {
  const data = await Organization.findAll({
    where: {
      'verification_status': condition
    }
  });
  return data;
}

export const searchOrganizationsByName = async (searchTerm) => {
  try {
    const organizations = await Organization.findAll({
      where: {
        name: {
          [Op.iLike]: `%${searchTerm}%`, // Case-insensitive LIKE untuk PostgreSQL
        },
        verification_status: 'approved', // Hanya organisasi yang sudah disetujui
      },
      include: [
        {
          model: Category, // jika ingin include relasi kategori
          as:'categories',
          through: { attributes: [] },
        },
      ],
      order: [["name", "ASC"]],
    });

    return organizations;
  } catch (error) {
    console.error("Error searching organizations:", error);
    throw error;
  }
};


export const getApprovedOrganizationsWithCategories = async () => {
  try {
    const organizations = await Organization.findAll({
      where: {
        verification_status: "approved",
      },
      attributes: [
        "org_id",
        "name",
        "description",
        "logo_url",
        "recruitment_status",
        "verification_status",
      ],
      include: [
        {
          model: OrganizationCategory,
          as: "org_category",
          attributes: ["category_id"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["category_id", "name"],
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
    });

    // Transform data untuk response frontend-friendly
    const formatted = organizations.map((org) => {
      const categories = org.org_category.map((oc) => oc.category);

      return {
        org_id: org.org_id,
        name: org.name,
        description: org.description,
        logo_url: org.logo_url,
        recruitment_status: org.recruitment_status,
        categories: categories.map((cat) => ({
          category_id: cat.category_id,
          name: cat.name,
        })),
      };
    });

    return formatted;
  } catch (error) {
    console.error("Error fetching approved organizations with categories:", error);
    throw error;
  }
};