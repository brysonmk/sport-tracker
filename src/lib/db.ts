import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The one PrismaClient for the whole app.
 *
 * Prisma 7 talks to Postgres through a "driver adapter"; here that is node-postgres
 * (`pg`), which works the same against local Docker Postgres and Neon.
 *
 * In development, Next.js re-runs this module on every hot reload. Without the
 * globalThis cache each reload would open a new connection pool until Postgres runs
 * out of connections.
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env (see README).");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
