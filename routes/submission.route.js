import { getAllSubmissions, getAllSubmissionByUserId, newOrgSubmission, postProofDocument, updateSubmission, deleteSubmission, getOneSubmissionBySubId, getDetailSubmission, handleGetAllSubmissions } from "../controllers/submission.controller.js";

export default async function submissionRoutes(fastify, options) {
//   fastify.post('/', newOrganizationJsonReq); // Buat organisasi
    fastify.post('/:user_id/save', newOrgSubmission); // Buat submission
    fastify.patch('/proof', postProofDocument); // Upload dokumen bukti

//   // 2. Read
//   fastify.get('/filtered', getAllOrganizationsFiltered); // Harus di atas :id
    fastify.get('/:id', getOneSubmissionBySubId);
    fastify.get('/', getAllSubmissions); // Semua organisasi
    fastify.get('/filtered', getAllSubmissionByUserId); // Berdasarkan ID
    fastify.get('/detail', handleGetAllSubmissions);
    fastify.get('/detail/:id', getDetailSubmission);

//   // 3. Update
    fastify.put('/:id', updateSubmission); // Ubah organisasi
//   fastify.put('/:id/verification', verifyStatus); // Verifikasi organisasi

//   // 4. Delete
    fastify.delete('/:id', deleteSubmission); // Hapus organisasi
}