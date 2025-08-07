import { request } from "http";
import {
  addMember,
  deleteMemberByUserAndOrg,
  findAllDetailMembershipsByUserId,
  findAllMemberByUserId,
  findAllMembers,
  findOneMemberByUserAndOrgId,
  getPendingRecruitsByOrgId,
  updateById,
  updateByUserId,
  updateMemberByOrgAndUserId,
} from "../services/members.service.js";

export const getAllMembers = async (request, reply) => {
  try {
    const response = await findAllMembers();
    reply.code(200).send({
      message: "Members retrieved successfully",
      statusCode: 200,
      data: response,
    });
  } catch (error) {
    reply.code(500).send({
      message: error.message,
      statusCode: 500,
    });
  }
};

export const getAllDetailMembersByUserId = async (request, reply) => {
  try {
    const { id } = request.params;
    const response = await findAllDetailMembershipsByUserId(id);
    if (response.length <= 0) {
      reply.code(201).send({
        message: "You have not joined any organisation!",
        statusCode: 201,
        total: response.length,
      });
    } else {
      reply.code(200).send({
        message: "Members retrieved successfully",
        statusCode: 200,
        total: response.length,
        data: response,
      });
    }
  } catch (error) {
    reply.code(500).send({
      message: error.message,
      statusCode: 500,
    });
  }
};

export const getAllMembersByUserId = async (request, reply) => {
  try {
    const { user_id } = request.query;

    const result = await findAllMemberByUserId(user_id);

    reply.code(200).send({
      message: "Members retrieved successfully",
      statusCode: 200,
      total: result.length,
      data: result,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const updateMemberControllerByUserAndOrgId = async (request, reply) => {
  try {
    const { orgId, userId } = request.params;
    const body = request.body;

    const updatedCount = await updateMemberByOrgAndUserId(
      { orgId, userId },
      body
    );

    if (updatedCount === 0) {
      return reply.code(404).send({
        message: "Tidak ada data member yang cocok untuk diperbarui",
        statusCode: 404,
      });
    }

    return reply.code(200).send({
      message: "Member berhasil diperbarui",
      statusCode: 200,
      data: { updatedCount },
    });
  } catch (error) {
    console.error("[updateMemberController]", error.message);
    return reply.code(400).send({
      message: "Gagal memperbarui member",
      error: error.message,
      statusCode: 400,
    });
  }
};

export const updateMemberUserId = async (request, reply) => {
  try {
    const { user_id } = request.params;
    const body = request.body;

    const updatedMember = await updateByUserId(user_id, body);

    return reply.code(200).send({
      message: "Member berhasil diperbarui",
      statusCode: 200,
      data: updatedMember,
    });
  } catch (error) {
    console.error("[updateMemberController]", error.message);

    return reply.code(400).send({
      message: "Gagal memperbarui member",
      error: error.message,
      statusCode: 400,
    });
  }
};

export const updateMemberId = async (request, reply) => {
  try {
    const { id } = request.query;
    const body = request.body;

    const updatedMember = await updateById(id, body);

    return reply.code(200).send({
      message: "Member berhasil diperbarui",
      statusCode: 200,
      data: updatedMember,
    });
  } catch (error) {
    console.error("[updateMemberController]", error.message);

    return reply.code(400).send({
      message: "Gagal memperbarui member",
      error: error.message,
      statusCode: 400,
    });
  }
};

export const getRecruitementsMember = async (request, reply) => {
  try {
    const { orgId } = request.params;

    const recruits = await getPendingRecruitsByOrgId(orgId);

    return reply.code(200).send({
      message: "Recruitments retrieved successfully",
      statusCode: 200,
      data: recruits,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      message: "Gagal mengambil data rekrutan pending.",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const addMemberHandler = async (request, reply) => {
  try {
    const data = request.body;

    if (!data.user_id || !data.org_id) {
      return reply
        .code(400)
        .send({ message: "user_id dan org_id wajib diisi." });
    }

    const result = await addMember(data);
    return reply.code(201).send({
      message: "New member created successfully",
      statusCode: 201,
      data: result,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({ message: error.message });
  }
};

export const removeMember = async (request, reply) => {
  try {
    const { user_id, org_id } = request.body;

    if (!user_id || !org_id) {
      return reply
        .code(400)
        .send({ message: "user_id dan org_id wajib diisi.", statusCode: 400 });
    }

    const result = await deleteMemberByUserAndOrg({ user_id, org_id });
    return reply.code(200).send({ statusCode: 200, ...result });
  } catch (error) {
    request.log.error(error);
    return reply
      .code(400)
      .send({ message: "Server error", statusCode: 400, error: error.message });
  }
};

export const getMemberByUserAndOrgId = async (request, reply) => {
  try {
    const { org_id, user_id } = request.params;
    const data = await findOneMemberByUserAndOrgId(user_id, org_id);
    return reply.code(200).send({
      message: "Member retrieved successfully",
      statusCode: 200,
      data: data
    });
  } catch (error) {
    console.error(error.message);
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
}