import { test } from "@playwright/test";
import { login, logout } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("allows login", async ({ page }) => {
  await login(page);
  await logout(page);
});
