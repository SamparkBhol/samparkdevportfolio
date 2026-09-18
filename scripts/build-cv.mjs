// Prints /resume/ from the static build to public/cv.pdf using the machine's Chrome (no Chromium download).
// Usage: npm run build && npm run cv
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
const port = 4180;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn("npx", ["serve", "out", "-l", String(port), "-n"], { stdio: "ignore", detached: true });
await sleep(1500);
try {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/resume/`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  mkdirSync("public", { recursive: true });
  await page.pdf({ path: "public/cv.pdf", preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log("wrote public/cv.pdf");
} finally {
  try { process.kill(-server.pid); } catch {}
}
