import { defineConfig, devices } from "@playwright/test";
// Uses the machine's Chrome so no browser download is needed. `npm run build` first; the suite serves `out/`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: { command: "npx serve out -l 4173", url: "http://127.0.0.1:4173", reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, channel: "chrome", launchOptions: { args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 }, channel: "chrome", launchOptions: { args: ["--no-sandbox"] } } },
    { name: "phone", use: { browserName: "chromium", channel: "chrome", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", launchOptions: { args: ["--no-sandbox"] } } },
  ],
});
