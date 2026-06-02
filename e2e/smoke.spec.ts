import { test, expect } from "@playwright/test";

const STAGES = ["title", "about", "experience", "projects", "packages", "research", "blogs", "volunteer", "skills", "certifications", "contact"];

test("home loads with all 11 stages and no uncaught errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("link", { name: /enter portfolio/i })).toBeVisible();
  for (const id of STAGES) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
});

test("stage-select menu opens and lists stages", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open stage select menu").click();
  const menu = page.getByRole("navigation", { name: /stage select/i });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "BOSS FIGHTS" })).toBeVisible();
});

test("404 shows GAME OVER", async ({ page }) => {
  await page.goto("/this-stage-does-not-exist");
  await expect(page.getByText("GAME OVER")).toBeVisible();
});
