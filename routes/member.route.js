import { addMemberHandler, getAllDetailMembersByUserId, getAllMembers, getAllMembersByUserId, getMemberByUserAndOrgId, getRecruitementsMember, removeMember, updateMemberControllerByUserAndOrgId, updateMemberId, updateMemberUserId } from "../controllers/members.controller.js";

export default async function memberRoutes(fastify, options) {
    fastify.get('/', getAllMembers);
    fastify.get('/user/:id', getAllDetailMembersByUserId);
    fastify.get('/user/q', getAllMembersByUserId);
    fastify.get('/:orgId/recruitments', getRecruitementsMember);
    fastify.get('/:user_id/user/:org_id/org',  getMemberByUserAndOrgId);
    
    fastify.patch('/q', updateMemberId);
    fastify.patch('/:user_id/user', updateMemberUserId);
    fastify.put('/org/:orgId/user/:userId', updateMemberControllerByUserAndOrgId);
    fastify.post('/', addMemberHandler);
    fastify.delete('/', removeMember);
    // next ---> get member by userid & orgid
}