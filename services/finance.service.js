import Member from "../models/member.model.js";
import OrganizationFinance from "../models/org.finance.model.js";
import User from "../models/user.model.js";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from 'fs';
import path from "path";

const pump = promisify(pipeline);

// CREATE
export const createFinanceTransaction = async (data) => {
  return await OrganizationFinance.create(data);
};

export const getAllFinanceTransactions = async (orgId, { startDate, endDate, type }) => {
  const whereClause = {
    org_id: orgId,
  };

  if (startDate || endDate) {
    whereClause.transaction_date = {};
    if (startDate) whereClause.transaction_date[Op.gte] = startDate;
    if (endDate) whereClause.transaction_date[Op.lte] = endDate;
  }

  if (type) {
    whereClause.transaction_type = type; // 'income' or 'expense'
  }

  return await OrganizationFinance.findAll({
    where: whereClause,
    order: [['transaction_date', 'DESC']],
  });
};

// READ: Get single transaction by ID
// READ: Get single transaction by ID with user and member role
export const getFinanceTransactionById = async (transactionId) => {
  const transaction = await OrganizationFinance.findByPk(transactionId, {
    include: [
      {
        model: User,
        as: 'recorder',
        include: [
          {
            model: Member,
            as: 'memberships',
            where: {
              status: 'active'
            },
            required: false
          }
        ],
        attributes: ['user_id', 'full_name']
      }
    ]
  });

  if (!transaction) throw new Error('Transaksi tidak ditemukan');

  const recorder = transaction.recorder;
  const activeMembership = recorder?.memberships?.find(m => m.org_id === transaction.org_id);

  return {
    transaction_id: transaction.transaction_id,
    title: transaction.title,
    amount: transaction.amount,
    transaction_type: transaction.transaction_type,
    category: transaction.category,
    transaction_date: transaction.transaction_date,
    description: transaction.description,
    receipt_url: transaction.receipt_url,
    recorded_by: recorder
      ? {
          full_name: recorder.full_name,
          role: activeMembership?.role || null,
          jabatan: activeMembership?.jabatan || null
        }
      : null,
  };
};


// UPLOAD FILE
export const uploadTransactionProofDoc = async (orgId, fileData) => {
  const transaction = await getFinanceModelById(orgId);
  if (!transaction) throw new Error('Transaksi tidak ditemukan');

  const oldReceiptUrl = transaction.receipt_url;
  const fileExtension = path.extname(fileData.filename);
  const newFilename = `receipt-${orgId}-${Date.now()}${fileExtension}`;
  
  // Tentukan direktori dan URL untuk bukti
  const uploadDir = path.resolve('public', 'receipts');
  const filePath = path.join(uploadDir, newFilename);
  const publicUrl = `/public/receipts/${newFilename}`;

  await fs.promises.mkdir(uploadDir, { recursive: true });
  await pump(fileData.file, fs.createWriteStream(filePath));
  
  if (oldReceiptUrl) {
    try {
      const oldFilename = path.basename(oldReceiptUrl);
      const oldBaseDir = path.dirname(oldReceiptUrl).substring(1);
      const oldFilePath = path.resolve(oldBaseDir, oldFilename);
      await fs.promises.unlink(oldFilePath);
    } catch (err) {
      console.warn(`Gagal menghapus bukti transaksi lama: ${oldReceiptUrl}`, err.message);
    }
  }

  await transaction.update({ receipt_url: publicUrl });
  
  return transaction;
}

// Tambahkan di file kamu di atas (helper)
const deleteReceiptPicture = async (id) => {
  const transaction = await OrganizationFinance.findByPk(id);
  if (!transaction)return;
  const pictureUrl = transaction.receipt_url;
  if (!pictureUrl) return;

  try {
    const filename = path.basename(pictureUrl);
    const filePath = path.resolve('public', 'receipts', filename);
    await fs.promises.unlink(filePath);
    console.log(`File berhasil dihapus: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.warn(`File tidak ditemukan, lanjut proses hapus DB: ${pictureUrl}`);
  }

  await transaction.update({ receipt_url: null });
};


const getFinanceModelById = async (id) => {
  const transaction = await OrganizationFinance.findByPk(id);
  if (!transaction) throw new Error('Transaksi tidak ditemukan');
  return transaction;
};

// DELETE
export const deleteFinanceTransaction = async (transactionId) => {
  const transaction = await getFinanceModelById(transactionId);
  await deleteReceiptPicture(transactionId);
  return await transaction.destroy();
};

// UPDATE
export const updateFinanceTransaction = async (transactionId, updateData) => {
  const transaction = await getFinanceModelById(transactionId);
  return await transaction.update(updateData);
};
