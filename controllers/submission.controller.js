import { addNewSubmissionOrg, addProofDocumentUrl, findAllOrgSubmissions, findAllOrgSubmissionByUserId, modifySubmission, removeSubmission, findOneOrgSubmissionBySubId, getSubmissionById, getAllSubmissionsWithUserAndOrg } from "../services/submission.service.js";

export const newOrgSubmission = async (req, reply) => {
  try {
    const { org_id, status = 'pending' } = req.body; // beri default 'pending' jika tidak dikirim
    const { user_id } = req.params;

    // Validasi minimal
    if (!org_id || !user_id) {
      return reply.code(400).send({
        message: "org_id dan user_id wajib diisi.",
        statusCode: 400,
      });
    }

    const response = await addNewSubmissionOrg(user_id, org_id, status);

    return reply.code(201).send({
      message: "Submission created",
      statusCode: 201,
      data: response,
    });
  } catch (error) {
    console.error(error); // bantu debug di server
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const postProofDocument = async (req, reply) => {
  try {
    // Ambil file dari request. Multipart plugin menyediakan req.file().
    const fileData = await req.file();

    // Validasi dasar: pastikan file ada.
    if (!fileData) {
      return reply.code(400).send({ message: 'Tidak ada file yang diunggah' });
    }
    
    // Ambil ID pengguna dari token otentikasi.
    const { submissionId } = req.query;

    // Panggil service untuk memproses file.
    const updatedOrg = await addProofDocumentUrl(submissionId, fileData);

    reply.code(200).send({
      message: 'Bukti dokumen berhasil diupload.',
      statusCode: 200,
      data: updatedOrg,
    });

  } catch (error) {
    console.error('Error changing profile picture:', error);
    reply.code(500).send({ message: 'Terjadi kesalahan pada server' });
  }
}

export const getAllSubmissionByUserId = async (req, reply) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return reply.code(400).send({
        message: "User id is required",
        statusCode: 400
      });
    }

    const result = await findAllOrgSubmissionByUserId(user_id);

    return reply.code(200).send({
      message: "Submissions retrieved successfully.",
      statusCode: 200,
      data: result,
      total: result.length
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
};

export const getOneSubmissionBySubId = async (request, reply) => {
  try {
    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        message: "Submission id is required",
        statusCode: 400
      });
    }

    const result = await findOneOrgSubmissionBySubId(id);

    return reply.code(200).send({
      message: "Submissions retrieved successfully.",
      statusCode: 200,
      data: result
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
};


export const getAllSubmissions = async (request, reply) => {
  try {
    const result = await findAllOrgSubmissions();

    return reply.code(200).send({
      message: "Submissions retrieved successfully.",
      statusCode: 200,
      data: result,
      total: result.length
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
};

export const updateSubmission = async (request, reply) => {
  try {
    const { id } = request.params;
    const body = request.body;
    const result = await modifySubmission(id, body);
    reply.code(200).send({
      message: "Submission updated successfully.",
      statusCode: 200,
      data: result
    });
  } catch (error) {
    reply.code(500).send({
      message: "Internal server error.",
      statusCode: 500,
      error: error.message
    });
  }
}

export const deleteSubmission = async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await removeSubmission(id);

    reply.code(200).send({
      message: result.message,
      statusCode: 200
    });
  } catch (error) {
    reply.code(404).send({
      message: "Gagal menghapus submission.",
      statusCode: 404,
      error: error.message
    });
  }
};

export const getDetailSubmission = async (request, reply) => {
  const { id } = request.params;

  const result = await getSubmissionById(id);

  return reply
    .code(result.statusCode)
    .send({
      message: result.message,
      data: result.data,
    });
};

export const handleGetAllSubmissions = async (request, reply) => {
  const { status } = request.query;
  const response = await getAllSubmissionsWithUserAndOrg(status);
  return reply.code(response.statusCode).send(response);
};
