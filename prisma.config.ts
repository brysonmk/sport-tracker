// Prisma 7 reads its settings (schema path, migrations, DB URL, seed command) from
// this file instead of package.json / schema.prisma.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI (migrate, seed) prefers a DIRECT connection: on Neon, migrations need one,
    // while the app itself uses the pooled DATABASE_URL (src/lib/db.ts).
    //   DIRECT_URL             - set by hand (see docs/DEPLOY.md, manual setup)
    //   DATABASE_URL_UNPOOLED  - set automatically by Vercel's Neon integration
    // Locally neither is set (no pooler), so DATABASE_URL is used.
    // process.env (not Prisma's env() helper) so `prisma generate` works without a URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
