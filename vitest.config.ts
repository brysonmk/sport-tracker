import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // `import "server-only"` throws outside a React Server Component build; in unit
    // tests it's replaced by an empty module so server code can be tested directly.
    alias: { "server-only": new URL("./src/test/empty.ts", import.meta.url).pathname },
  },
  test: {
    // Unit tests live next to the code they test: src/**/foo.test.ts
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
