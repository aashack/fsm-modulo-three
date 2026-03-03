import { defineConfig } from "@playwright/test";


// please don't edit this at all
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: "3100",
      HOST: "127.0.0.1",
      NODE_ENV: "test"
    }
  },
  fullyParallel: false,

});
