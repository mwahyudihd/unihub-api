import { addInterest, deleteInterest, getAllInterests, getInterest, getInterestByCategoryId, getInterestByUserId, modifyInterest } from "../controllers/interests.controller.js";

export default async function organizationRoutes(fastify, options) {
  fastify.get('/', getAllInterests);
  fastify.post('/', addInterest);
  fastify.delete('/:id', deleteInterest);
  fastify.put('/:id', modifyInterest);
  fastify.get('interest/:id', getInterest);
  fastify.get('/user/:id', getInterestByUserId);
  fastify.get('/category/:id', getInterestByCategoryId);
}