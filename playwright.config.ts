import "dotenv/config"; // the arrange helpers write to the database in DATABASE_URL
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. See e2e/README.md for the layout and how to run them.
 *
 * Locally: reuses the dev server on :3000 if it's running, otherwise starts one.
 * CI: runs against a production build (`npm run start`), which CI builds first.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Mobile first: most people will open their league on a phone.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
