import Announcement from "../models/announcement.model.js";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from 'fs';
import path from "path";
import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import AnnouncementComment from "../models/comments.model.js";
import { Op } from "sequelize";
import Member from "../models/member.model.js";

const pump = promisify(pipeline);


// CREATE
export const createAnnouncement = async (data) => {
  return await Announcement.create(data);
};

export const uploadImage = async (announcementId, fileData) => {
  const post = await Announcement.findByPk(announcementId);
  if (!post) {
    throw new Error('Pengumuman tidak ditemukan');
  }

  // 2. Cek apakah ada file gambar lama untuk dihapus.
  const oldPictureUrl = post.image_url;

  // 3. Buat nama file baru yang unik untuk menghindari konflik.
  const fileExtension = path.extname(fileData.filename); // -> .png, .jpg
  const newFilename = `post-${announcementId}-${Date.now()}${fileExtension}`;
  
  // --> UBAH DI SINI: Tentukan direktori upload yang baru
  const uploadDir = path.resolve('public', 'posts');
  const filePath = path.join(uploadDir, newFilename);
  
  // --> UBAH DI SINI: Sesuaikan URL publik yang akan disimpan ke database
  const publicUrl = `/public/posts/${newFilename}`;

  // 5. Pastikan direktori 'uploads' ada.
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // 6. Simpan file baru ke direktori 'uploads' menggunakan stream pipeline.
  await pump(fileData.file, fs.createWriteStream(filePath));
  
  // 7. Hapus file gambar lama JIKA ADA, setelah yang baru berhasil disimpan.
  if (oldPictureUrl) {
    try {
      // Ekstrak nama file dari URL lama
      const oldFilename = path.basename(oldPictureUrl);
      const oldFilePath = path.join(uploadDir, oldFilename);
      await fs.promises.unlink(oldFilePath); // Hapus file
    } catch (err) {
      // Abaikan error jika file lama tidak ditemukan (mungkin sudah terhapus manual).
      console.warn(`Gagal menghapus file lama: ${oldPictureUrl}`, err.message);
    }
  }

  // 8. Update URL gambar profil di database.
  await post.update({ image_url: publicUrl });
  
  return post;
}


// UPDATE
export const updateAnnouncement = async (announcementId, updateData) => {
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    throw new Error('Pengumuman tidak ditemukan');
  }

  return await announcement.update(updateData);
};

// DELETE
export const deleteAnnouncement = async (announcementId) => {
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    throw new Error('Pengumuman tidak ditemukan');
  }

  await deletePostPicture(announcementId);
  return await announcement.destroy();
};

export const deletePostPicture = async (id) => {
  const post = await Announcement.findByPk(id);
  if (!post)return;
  const imageUrl = post.image_url;
  if (!imageUrl) return;

  try {
    const filename = path.basename(imageUrl);
    const filePath = path.resolve('public', 'posts', filename);
    await fs.promises.unlink(filePath);
    console.log(`File berhasil dihapus: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.warn(`File tidak ditemukan, lanjut proses hapus DB: ${imageUrl}`);
  }

  await post.update({ image_url: null });
  return { message: "Post Image deleted successfully.", statusCode: 200, data: post };
};

// GET LIST
export const getAnnouncementsByOrgId = async (orgId) => {
  return await Announcement.findAll({
    where: { org_id: orgId },
    include: [
      {
        model: User,
        as: 'author', // pastikan relasi belongsTo ke User dengan alias ini
        attributes: ['user_id', 'full_name', 'profile_picture_url', 'email']
      }
    ],
    order: [['created_at', 'DESC']]
  });
};


export const getAnnouncementDetailById = async (announcementId) => {
  return await Announcement.findOne({
    where: { announcement_id: announcementId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['user_id', 'full_name', 'profile_picture_url']
      },
      {
        model: Organization,
        as: 'organization',
        attributes: ['org_id', 'name', 'description', 'logo_url']
      },
      {
        model: AnnouncementComment,
        as: 'comments',
        where: { parent_comment_id: null },
        required: false,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'full_name', 'profile_picture_url']
          },
          {
            model: AnnouncementComment,
            as: 'replies',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['user_id', 'full_name', 'profile_picture_url']
              }
            ]
          }
        ]
      }
    ]
  });
};

export const getAnnouncementsByUserId = async (userId) => {
  // 1. Ambil semua org_id tempat user ini aktif sebagai member
  const activeMemberships = await Member.findAll({
    where: {
      user_id: userId,
      status: "active",
    },
    attributes: ["org_id"],
  });

  const orgIds = activeMemberships.map((m) => m.org_id);

  if (orgIds.length === 0) {
    return []; // user tidak tergabung di organisasi manapun
  }

  // 2. Ambil semua organisasi yang org_id-nya cocok dan sudah disetujui
  const approvedOrgs = await Organization.findAll({
    where: {
      org_id: {
        [Op.in]: orgIds,
      },
      verification_status: "approved",
    },
    attributes: ["org_id"],
  });

  const approvedOrgIds = approvedOrgs.map((o) => o.org_id);

  if (approvedOrgIds.length === 0) {
    return []; // user tergabung tapi organisasi belum disetujui
  }

  // 3. Ambil semua pengumuman dari organisasi tersebut
  const announcements = await Announcement.findAll({
    where: {
      org_id: {
        [Op.in]: approvedOrgIds,
      },
    },
    include: [
      {
        model: Organization,
        as: "organization",
        attributes: ["org_id", "name", "logo_url"],
      },
      {
        model: User,
        as: "author",
        attributes: ["user_id", "full_name", "email", "profile_picture_url"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return announcements;
};