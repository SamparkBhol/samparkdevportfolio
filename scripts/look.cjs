// Dev tool: build first (`npm run build`), then `node scripts/look.cjs <outPrefix> [selector] [width] [height] [port]`
// Serves ./out on the port, opens the page with the machine's Chrome, scrolls the selector into view (or the top),
// waits for videos and reveals, saves <outPrefix>.png, prints console errors. Works in a worktree.
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright-core");
const [,, outPrefix = "tmp/look", selector = "", width = "1440", height = "900", port = String(4200 + Math.floor(Math.random() * 500))] = process.argv;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  require("node:fs").mkdirSync(path.dirname(outPrefix), { recursive: true });
  const server = spawn("npx", ["serve", "out", "-l", port, "-n"], { stdio: "ignore", detached: true });
  await sleep(1500);
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
  const page = await browser.newPage({ viewport: { width: +width, height: +height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle", timeout: 60000 });
  await sleep(1200);
  if (selector) { await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start", behavior: "instant" }), selector); await sleep(1500); }
  await page.screenshot({ path: `${outPrefix}.png` });
  console.log(`saved ${outPrefix}.png; errors: ${errors.length ? errors.join(" | ") : "none"}`);
  await browser.close();
  try { process.kill(-server.pid); } catch {}
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
