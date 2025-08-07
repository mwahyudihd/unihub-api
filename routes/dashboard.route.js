import { getDashboardSummary } from "../services/totals.service.js";

export default async function dashboardRoutes(fastify, opts) {
  fastify.get("/", async (request, reply) => {
    try {
      const { totalUser, totalOrganization } = await getDashboardSummary();

      return reply.code(200).send({
        message: "Data berhasil diambil",
        statusCode: 200,
        totalUser,
        totalOrganization,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        message: "Gagal mengambil data",
        statusCode: 500,
        error: error.message,
      });
    }
  });
}