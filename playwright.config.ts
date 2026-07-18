import { defineConfig, devices } from "@playwright/test";

const apiUrl = "http://127.0.0.1:3100";
const adminUrl = "http://127.0.0.1:4173";
const miniappUrl = "http://127.0.0.1:4174";
const databaseUrl =
  "postgresql://petcare:petcare@127.0.0.1:5433/petcare_test?schema=public";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --filter @petcare/api start",
      url: `${apiUrl}/api/settings/store`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        API_PORT: "3100",
        DATABASE_URL: databaseUrl,
        NODE_ENV: "test",
        AI_ENABLED: "false",
        BOOKING_REMINDER_ENABLED: "false",
      },
    },
    {
      command:
        "pnpm --filter @petcare/admin exec vite --host 127.0.0.1 --port 4173",
      url: `${adminUrl}/login`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        VITE_API_BASE_URL: apiUrl,
      },
    },
    {
      command:
        "pnpm --filter @petcare/miniapp exec uni -p h5 --host 127.0.0.1 --port 4174",
      url: `${miniappUrl}/#/pages/home/index`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        VITE_API_BASE_URL: apiUrl,
      },
    },
  ],
});
