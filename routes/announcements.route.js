import { createAnnouncementHandler, deleteAnnouncementHandler, deleteAnnouncementImageHandler, getAllAnnouncementsByuserIdHandler, getAnnouncementDetail, getAnnouncementsByOrg, updateAnnouncementHandler, uploadImageHandler } from "../controllers/announcements.controller.js";

const announcementRoutes = async (fastify, options) => {
    fastify.get('/:id', getAnnouncementDetail);
    fastify.post('/', createAnnouncementHandler);
    fastify.patch('/:announcementId', uploadImageHandler);
    fastify.put('/:announcementId',updateAnnouncementHandler);
    fastify.delete('/:announcementId', deleteAnnouncementHandler);
    fastify.delete('/:announcementId/image', deleteAnnouncementImageHandler);
    fastify.get('/:org_id/org', getAnnouncementsByOrg);
    fastify.get('/:userId/all', getAllAnnouncementsByuserIdHandler);
};

export default announcementRoutes;