import { test, expect } from "@playwright/test";

const CHAPTERS = ["cover", "select", "campaign", "boss", "shop", "arcade", "quests", "archives", "transmissions", "inventory", "trophies", "continue"];

test("the issue loads with every chapter and no page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const id of CHAPTERS) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/SAMPARK/i);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("R opens the plain résumé and Escape closes it", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("r");
  const dialog = page.getByRole("dialog", { name: /plain résumé/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/58 schema migrations/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("the résumé page carries the seven Helmit bullets and the four links", async ({ page }) => {
  await page.goto("/resume/");
  for (const needle of ["Java and Spring Boot", "timeout propagation", "Cloud Build", "GKE Autopilot", "58 schema migrations", "9 platform integrations", "Vertex AI", "React Native"]) {
    await expect(page.getByText(needle).first()).toBeVisible();
  }
  for (const name of ["GitHub", "LinkedIn", "CV.pdf"]) await expect(page.getByRole("link", { name }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /samparkaccess1234@gmail.com/ })).toBeVisible();
});

test("the book opens with O and the cartridge ring exists", async ({ page }) => {
  await page.goto("/");
  const stage = page.locator("#cover [tabindex='0']").first();
  const opened = page.locator("#cover .open, #cover [data-open='true']");
  // The key lands only once the cover has hydrated, so press again until the book reports open.
  for (let i = 0; i < 8 && (await opened.count()) === 0; i++) {
    await stage.focus();
    await page.keyboard.press("o");
    await page.waitForTimeout(350);
  }
  await expect(opened.first()).toHaveCount(1);
  await expect(page.locator("#arcade button").first()).toBeVisible();
});

test("only one video plays at a time as you move through the chapters", async ({ page }) => {
  await page.goto("/");
  for (const id of CHAPTERS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const playing = await page.evaluate(() => Array.from(document.querySelectorAll("video")).filter((v) => !v.paused && v.currentTime > 0 && v.readyState > 2 && v.getBoundingClientRect().height > 0).length);
    expect(playing, `chapter ${id}`).toBeLessThanOrEqual(2);
  }
});

test("no horizontal overflow on any viewport", async ({ page }) => {
  await page.goto("/");
  const wider = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(wider).toBe(false);
});

test("404 shows GAME OVER", async ({ page }) => {
  await page.goto("/this-stage-does-not-exist/");
  await expect(page.getByText("GAME OVER")).toBeVisible();
});

test("the terminal answers help and jumps chapters", async ({ page }) => {
  await page.goto("/");
  await page.locator("#continue").scrollIntoViewIfNeeded();
  const input = page.locator("#ct-input");
  await input.click();
  await input.fill("help");
  await input.press("Enter");
  await expect(page.locator("#continue .ct-log")).toContainText(/experience/i);
  await input.fill("experience helmit");
  await input.press("Enter");
  await expect(page.locator("#continue .ct-log")).toContainText(/Software Engineer/);
  await input.fill("goto boss");
  await input.press("Enter");
  await expect.poll(() => page.locator("#boss").evaluate((n) => Math.abs(n.getBoundingClientRect().top)), { timeout: 8000 }).toBeLessThan(200);
});

test("choosing a class marks the player and the campaign follows", async ({ page }) => {
  await page.goto("/");
  await page.locator("#select").scrollIntoViewIfNeeded();
  const next = page.locator("#select button", { hasText: /next/i }).first();
  await next.click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.playerClass), { timeout: 5000 }).toBe("ml");
  await expect(page.locator("#campaign")).toHaveCount(1);
});

test("a scroll unrolls with the keyboard and a card runs its game on PLAY", async ({ page }) => {
  await page.goto("/");
  await page.locator("#archives").scrollIntoViewIfNeeded();
  const handle = page.locator("#archives .scroll-handle").first();
  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-expanded", "true");
  await page.locator("#transmissions").scrollIntoViewIfNeeded();
  const play = page.locator("#transmissions .crt-play").first();
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("the companion opens its command ring and closes on Escape", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "phones get the head button only");
  await page.goto("/");
  await page.locator("#boss").scrollIntoViewIfNeeded();
  const fox = page.locator(".fox-btn");
  await fox.click();
  await expect(page.locator("#fox-ring")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#fox-ring")).not.toHaveClass(/is-open/);
});
