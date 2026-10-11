import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // Unit tests live next to the code they test: src/**/foo.test.ts
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
