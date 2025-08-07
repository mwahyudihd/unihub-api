import { createFinanceTransaction, deleteFinanceTransaction, getAllFinanceTransactions, getFinanceTransactionById, updateFinanceTransaction, uploadTransactionProofDoc } from "../services/finance.service.js";
import { pipeline } from 'stream';
import util from 'util';

const pump = util.promisify(pipeline);

// CREATE
export const handleCreateFinance = async (request, reply) => {
  try {
    const newTransaction = await createFinanceTransaction(request.body);
    reply.code(201).send({
        message: "Transaction created successfully",
        statusCode: 201,
        data: newTransaction
    });
  } catch (err) {
    reply.code(400).send({ message: "Internal server error.", statusCode: 400, error: err.message });
  }
};

// GET ALL by org_id with filter
export const handleGetFinanceList = async (request, reply) => {
  try {
    const { org_id } = request.params;
    const filters = {
      startDate: request.query.startDate,
      endDate: request.query.endDate,
      type: request.query.type,
    };
    const data = await getAllFinanceTransactions(org_id, filters);
    reply.code(200).send({
        message: "Transations retrieved successfully",
        statusCode: 200,
        data: data
    });
  } catch (err) {
    reply.code(500).send({ message: "Internal server error.", statusCode: 500, error: err.message });
  }
};

// GET by ID
export const handleGetFinanceById = async (request, reply) => {
  try {
    const data = await getFinanceTransactionById(request.params.transaction_id);
    reply.code(200).send({
        message: "Transaction retrieved successfully",
        statusCode: 200,
        data: data
    });
  } catch (err) {
    reply.code(404).send({ message: "Internal server error.", statusCode: 404, error: err.message });
  }
};

// UPDATE
export const handleUpdateFinance = async (request, reply) => {
  try {
    const updated = await updateFinanceTransaction(request.params.transaction_id, request.body);
    reply.code(200).send({
        message: "Transaction updated successfully",
        statusCode: 200,
        data: updated
    });
  } catch (err) {
    reply.code(400).send({ message: "Internal server error.", statusCode: 400, error: err.message });
  }
};

// DELETE
export const handleDeleteFinance = async (request, reply) => {
  try {
    await deleteFinanceTransaction(request.params.transaction_id);
    reply.code(204).send();
  } catch (err) {
    reply.code(404).send({ message: "Internal server error.", statusCode: 404, error: err.message });
  }
};

// UPLOAD FILE
export const uploadProofHandler = async (request, reply) => {
  const { transactionId } = request.params;
  const parts = request.parts();

  let filePart = null;
  for await (const part of parts) {
    if (part.file && part.fieldname === 'file') {
      filePart = part;
      break;
    }
  }

  if (!filePart) {
    return reply.code(400).send({ message: 'Berkas bukti transaksi tidak ditemukan dalam permintaan.' });
  }

  try {
    const updatedTransaction = await uploadTransactionProofDoc(transactionId, filePart);
    return reply.code(200).send({
      message: 'Bukti transaksi berhasil diunggah.',
      statusCode: 200,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return reply.code(500).send({
      message: 'Terjadi kesalahan saat mengunggah bukti transaksi.',
      statusCode: 500,
      error: error.message,
    });
  }
};