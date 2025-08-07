import { createArchiveHandler, getArchiveByIdHandler, getArchivesByOrgHandler, getArchivesByTypeHandler, removeArchiveHandler, updateArchiveHandler } from "../controllers/archives.controller.js";

const archiveRoutes = async (fastify, options) => {
    fastify.get('/:archive_id', getArchiveByIdHandler);
    fastify.delete('/:archive_id', removeArchiveHandler);
    fastify.put('/:archive_id',updateArchiveHandler);
    fastify.get('/:org_id/org', getArchivesByOrgHandler);
    fastify.post('/:org_id/org', createArchiveHandler);
    fastify.get('/:type/type', getArchivesByTypeHandler);
};

export default archiveRoutes;