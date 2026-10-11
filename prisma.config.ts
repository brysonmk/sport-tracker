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
    // process.env (not Prisma's env() helper) so `prisma generate` works in CI
    // without a database URL.
    url: process.env["DATABASE_URL"],
  },
});
