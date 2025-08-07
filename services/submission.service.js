import OrganizationSubmission from "../models/org.submission.model.js";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import fs from 'fs';
import Organization from "../models/organization.model.js";
import models from "../models/index.js";
import User from "../models/user.model.js";

const pump = promisify(pipeline);

export const addNewSubmissionOrg = async (userId, orgId, status = 'pending') => await OrganizationSubmission.create({
  org_id: orgId,
  submitted_by_user_id: userId,
  status: status
});

export const addProofDocumentUrl = async (orgSubmissionId, fileData) => {
  const submission = await OrganizationSubmission.findByPk(orgSubmissionId);
  if (!submission) throw new Error('Riwayat pengajuan tidak ditemukan');

  const oldProofDocUrl = submission.proof_document_url;
  const fileExtension = path.extname(fileData.filename);
  const newFilename = `docs-${orgSubmissionId}-${Date.now()}${fileExtension}`;
  
  // Tentukan direktori dan URL untuk logo
  const uploadDir = path.resolve('public', 'docs');
  const filePath = path.join(uploadDir, newFilename);
  const publicUrl = `/public/docs/${newFilename}`;

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await pump(fileData.file, fs.createWriteStream(filePath));
  
  if (oldProofDocUrl) {
    try {
      const oldFilename = path.basename(oldProofDocUrl);
      const oldBaseDir = path.dirname(oldProofDocUrl).substring(1);
      const oldFilePath = path.resolve(oldBaseDir, oldFilename);
      await fs.promises.unlink(oldFilePath);
    } catch (err) {
      console.warn(`Gagal menghapus bukti lama: ${oldProofDocUrl}`, err.message);
    }
  }

  await submission.update({ proof_document_url: publicUrl });
  
  return submission;
}

export const findAllOrgSubmissionByUserId = async (userId) => {
  return await OrganizationSubmission.findAll({
    where: {
      submitted_by_user_id: userId
    },
    include: [
      {
        model: Organization,
        as: 'organization', // sesuai alias relasi
        attributes: ['org_id', 'name', 'description']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

export const findOneOrgSubmissionBySubId = async (submissionId) => {
  return await OrganizationSubmission.findOne({
    where: {
      submission_id: submissionId
    },
    include: [
      {
        model: Organization,
        as: 'organization', // sesuai alias relasi
        attributes: ['org_id', 'name', 'description']
      }
    ]
  });
};

export const findAllOrgSubmissions = async () => OrganizationSubmission.findAll();

export const modifySubmission = async (submissionId, updateData) => {
  const submission = await OrganizationSubmission.findByPk(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }
  return await submission.update(updateData);
};


export const removeSubmission = async (submissionId) => {
  const submission = await OrganizationSubmission.findByPk(submissionId);
  if (!submission) {
    throw new Error('Submission tidak ditemukan');
  }
  await submission.destroy();
  return { message: 'Submission deleted successfully' };
}

export const getSubmissionById = async (submissionId) => {
  try {
    const submission = await models.OrganizationSubmission.findOne({
      where: { submission_id: submissionId },
      include: [
        {
          model: models.Organization,
          as: 'organization',
          include: [
            {
              model: models.OrganizationCategory,
              as: 'organization_categories',
              include: [
                {
                  model: models.Category,
                  as: 'category',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!submission) {
      return {
        message: 'Pengajuan tidak ditemukan',
        statusCode: 404,
        data: null,
      };
    }

    return {
      message: 'Berhasil mengambil detail pengajuan',
      statusCode: 200,
      data: submission,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Terjadi kesalahan saat mengambil data pengajuan',
      statusCode: 500,
      data: null,
    };
  }
};

export const getAllSubmissionsWithUserAndOrg = async (paramStatus) => {
  try {
    const submissions = await OrganizationSubmission.findAll({
      where: paramStatus ? { status: paramStatus } : {},
      attributes: [
        'submission_id',
        'proof_document_url',
        'org_id',
        'createdAt',
        'status',
        'submitted_by_user_id'
      ],
      include: [
        {
          model: Organization,
          as: 'sub_organization',
          attributes: ['name', 'org_id', 'verification_status'],
        },
        {
          model: User,
          as: 'submitted_by_user',
          attributes: ['full_name', 'nim'],
        }
      ]
    });

    const result = submissions.map(sub => ({
      submission_id: sub.submission_id,
      organization_name: sub.sub_organization?.name ?? null,
      submitted_by: sub.submitted_by_user?.full_name ?? null,
      document: sub.proof_document_url,
      organization_id: sub.org_id,
      createdAt: sub.createdAt,
      submission_status: sub.status,
      org_status: sub.sub_organization?.verification_status ?? null,
      submitted_by_user_id: sub.submitted_by_user_id,
      submitter_nim: sub.submitted_by_user?.nim ?? null,
    }));

    return {
      message: 'Data pengajuan berhasil diambil',
      statusCode: 200,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      message: 'Gagal mengambil data pengajuan',
      statusCode: 500,
      data: null,
    };
  }
};