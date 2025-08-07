import Member from '../models/member.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';

export const addMember = async (memberData) => {
  const { user_id, org_id } = memberData;

  const existing = await Member.findOne({
    where: { user_id, org_id },
  });

  if (existing) {
    if (["pending", "active"].includes(existing.status)) {
      throw new Error("User sudah terdaftar sebagai member (pending/active).");
    }

    // Jika status 'inactive', update jadi 'pending'
    existing.status = "pending";
    existing.jabatan = memberData.jabatan || existing.jabatan;
    existing.role = memberData.role || existing.role;
    await existing.save();

    return existing;
  }

  // Jika belum ada sama sekali
  const newMember = await Member.create(memberData);
  return newMember;
};

export const deleteMemberByUserAndOrg = async ({ user_id, org_id }) => {
  const deletedCount = await Member.destroy({
    where: {
      user_id,
      org_id,
    },
  });

  if (deletedCount === 0) {
    throw new Error("Member tidak ditemukan.");
  }

  return { success: true, message: "Member berhasil dihapus." };
};

export const findAllMembers = async () => Member.findAll();

export const findMemberById = async (memberId) => {
  const member = await Member.findByPk(memberId);
  if (!member) {
    throw new Error('Keanggotaan tidak ditemukan');
  }
  return member;
}

export const findAllMembersByOrgId = async (orgId) => {
  // Mengambil semua member dengan org_id tertentu.
  // Menggunakan 'include' untuk menyertakan data dari model User (misal: nama lengkap, email).
  return Member.findAll({
    where: { org_id: orgId },
    include: [{
      model: User,
      attributes: ['user_id', 'full_name', 'profile_picture_url'] // Hanya ambil kolom yang relevan.
    }]
  });
}

export const findAllDetailMembershipsByUserId = async (userId) => {
  return Member.findAll({
    where: { user_id: userId },
    include: [{
      model: Organization,
      attributes: ['org_id', 'name', 'logo_url']
    }]
  });
}

export const findAllMemberByUserId = async ( userId ) => {
  return Member.findAll({
    where: { user_id: userId, status: 'active' }
  });
}

export const updateMemberRole = async (memberId, newRole) => {
  // Cari dulu member berdasarkan ID.
  const member = await getMemberById(memberId);
  // Lakukan update pada properti 'role'.
  member.role = newRole;
  // Simpan perubahan ke database.
  await member.save();
  return member;
}

export const updateMemberByOrgAndUserId = async ({ orgId, userId }, body) => {
  const [updatedCount] = await Member.update(body, {
    where: {
      user_id: userId,
      org_id: orgId,
    },
  });

  console.log('[DEBUG] updatedCount:', updatedCount); // 🧠 Tambahkan ini

  return updatedCount;
};

export const deleteMember = async (memberId) => {
  // Cari dulu member berdasarkan ID.
  const member = await Member.findByPk(memberId); // Cek eksistensi sebelum menghapus.
  if (!member) {
    throw new Error('Keanggotaan tidak ditemukan');
  }
  // Hapus record dari database.
  await member.destroy();
  return { message: 'Member deleted successfully' };
}

export const updateByUserId = async (userId, body) => {
  const member = await Member.findOne({
    where: {
      user_id: userId
    }
  });
  if (!member) {
    throw new Error(`Member with user id ${userId} isn't found.`);
  }
  return member.update(body);
}

export const updateById = async (memberId, body) => {
  const member = await Member.findOne({
    where: {
      member_id: memberId
    }
  });
  if (!member) {
    throw new Error(`Member with id ${memberId} isn't found.`);
  }
  return member.update(body);
}

export const getPendingRecruitsByOrgId = async (orgId) => {
  try {
    const pendingMembers = await Member.findAll({
      where: {
        org_id: orgId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "full_name",
            "email",
            "nim",
            "profile_picture_url",
            "prodi",
          ],
        },
      ],
      order: [["join_date", "DESC"]],
    });

    return pendingMembers;
  } catch (error) {
    console.error("Error fetching pending recruits:", error);
    throw error;
  }
};

export const findOneMemberByUserAndOrgId = async (userId, orgId) => {
  const data = await Member.findOne({
    where: {
      user_id: userId,
      org_id: orgId,
      status: 'active'
    }
  });
  if (!data) {
    throw new Error("Member not found.");
  }
  return data;
}