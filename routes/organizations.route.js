import { changeOrgLogo, getAllOrganizations, getAllOrganizationsFiltered, getAllOrgByVerifStatusCondition, getAllOrgOpen, getApprovedOrganizationsHandler, getMyOrganizations, getOrganizationById, getOrgBySearchQuery, modifyOrganizationDetails, newOrganizationJsonReq, removeOrganization, verifyStatus } from "../controllers/organizations.controller.js";

export default async function organizationRoutes(fastify, options) {
  fastify.post('/', newOrganizationJsonReq); // Buat organisasi

  // 2. Read
  fastify.get("/category/approved", getApprovedOrganizationsHandler);
  fastify.get("/search/q", getOrgBySearchQuery);
  fastify.get('/filtered', getAllOrganizationsFiltered); // Harus di atas :id
  fastify.get('/:condition/status', getAllOrgByVerifStatusCondition);
  fastify.get('/opened', getAllOrgOpen);
  fastify.get('/myukm', getMyOrganizations);
  fastify.get('/', getAllOrganizations); // Semua organisasi
  fastify.get('/:id', getOrganizationById); // Berdasarkan ID

  // 3. Update
  fastify.put('/:id', modifyOrganizationDetails); // Ubah organisasi
  fastify.patch('/logo', changeOrgLogo);
  fastify.put('/:id/verification', verifyStatus); // Verifikasi organisasi

  // 4. Delete
  fastify.delete('/:id', removeOrganization); // Hapus organisasi
}