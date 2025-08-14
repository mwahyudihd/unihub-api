import Fastify from "fastify";
import userRoutes from "./routes/users.route.js";
import organizationRoutes from "./routes/organizations.route.js";
import interestRoutes from "./routes/interests.route.js";
import dotenv from "dotenv";
import memberRoutes from "./routes/member.route.js";
import fastifyCors from "@fastify/cors";
import archiveRoutes from "./routes/archives.route.js";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import path from "path";
import categoryRoutes from "./routes/categories.route.js";
import organizationCategoryRoutes from "./routes/org.category.route.js";
import submissionRoutes from "./routes/submission.route.js";
import financeRoutes from "./routes/finance.route.js";
import announcementRoutes from "./routes/announcements.route.js";
import commentsRoutes from "./routes/comments.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyMultipart);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UBAH BAGIAN INI
fastify.register(fastifyStatic, {
  // 1. Arahkan 'root' ke direktori '/public'
  root: path.join(__dirname, 'public'),
  // 2. Ubah 'prefix' agar URL-nya menjadi '/public'
  prefix: '/public/', 
});

await fastify.register(fastifyCors, {
  origin: "*", // Hanya izinkan request dari domain ini
  // Anda juga bisa menggunakan array untuk beberapa domain:
  // origin: ["https://app.unihub.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});

const userRoutesOptions = {
  prefix: "/api/users",
};
const orgRoutesOptions = {
  prefix: "/api/org",
};
const interestRoutesOptions = {
  prefix: "/api/interests",
};
const membershipRoutesOptions = {
  prefix: "/api/members"
}
const archiveRoutesOptions = {
  prefix: "/api/archive"
}
const categoriesRoutesOptions = {
  prefix: "/api/category"
}
const orgCategoryRoutesOptions = {
  prefix: "/api/organization-categories"
}
const orgSubmissionRoutesOptions = {
  prefix: "/api/submit"
}

const financeRoutesOptions = {
  prefix: "/api/finance"
}

const announcementRoutesOptions = {
  prefix: "/api/posts"
}

const commentRoutesOptions = {
  prefix: "/api/comments"
}

const dashboardRoutesOptions ={
  prefix: "/dashboard/summary"
}


fastify.register(userRoutes, userRoutesOptions);
fastify.register(organizationRoutes, orgRoutesOptions);
fastify.register(interestRoutes, interestRoutesOptions);
fastify.register(memberRoutes, membershipRoutesOptions);
fastify.register(archiveRoutes, archiveRoutesOptions);
fastify.register(categoryRoutes, categoriesRoutesOptions);
fastify.register(organizationCategoryRoutes, orgCategoryRoutesOptions);
fastify.register(submissionRoutes, orgSubmissionRoutesOptions);
fastify.register(financeRoutes, financeRoutesOptions);
fastify.register(announcementRoutes, announcementRoutesOptions);
fastify.register(commentsRoutes, commentRoutesOptions);
fastify.register(dashboardRoutes, dashboardRoutesOptions);

fastify.route({
  method: "GET",
  url: "/",
  handler: async (request, reply) => {
    return { host: "unihub - API" };
  }
});

try {
  await fastify.listen({ port: dotenv.config().parsed.PORT || 3106, host: '0.0.0.0' });
  fastify.log.info(`Server listening on ${fastify.server.address().port}`);
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}