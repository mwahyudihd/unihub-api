import { handleCreateFinance, handleDeleteFinance, handleGetFinanceById, handleGetFinanceList, handleUpdateFinance, uploadProofHandler } from "../controllers/finance.controller.js";

export default async function financeRoutes(fastify, options) {
    fastify.get('/all/:org_id', handleGetFinanceList);
    fastify.get('/detail/:transaction_id', handleGetFinanceById);
    fastify.post('/', handleCreateFinance);
    fastify.put('/:transaction_id', handleUpdateFinance);
    fastify.delete('/:transaction_id', handleDeleteFinance);
    fastify.post('/:transactionId/upload-proof', uploadProofHandler);
}