import { createCommentHandler, deleteCommentHandler, updateCommentHandler } from "../controllers/comments.controller.js";

const commentsRoutes = async (fastify, options) => {
    fastify.post('/:announcementId/post', createCommentHandler);
    fastify.put('/:id', updateCommentHandler);
    fastify.delete('/:id', deleteCommentHandler);
}

export default commentsRoutes;