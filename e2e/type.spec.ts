import { test, expect } from "@playwright/test";
import { login, createType } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Type flows", async ({ page }) => {
  // Login
  await login(page);

  // Create
  await createType(page, "Test Type for types");

  // Edit
  await page
    .getByRole("row", { name: /Test Type for types/ })
    .getByRole("button", { name: "Edit" })
    .click();
  await page.getByLabel("Name:").fill("Test Type Edited");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Test Type Edited")).toBeVisible();

  // Delete
  await page
    .getByRole("row", { name: /Test Type Edited/ })
    .getByRole("button", { name: "X" })
    .click();
  await expect(page.getByText("Test Type Edited")).not.toBeVisible();
});
