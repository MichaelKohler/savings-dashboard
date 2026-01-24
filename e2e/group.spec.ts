import { test, expect } from "@playwright/test";
import { login, createGroup } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Group flows", async ({ page }) => {
  // Login
  await login(page);

  // Create
  await createGroup(page, "Test Group for groups");

  // Edit
  await page
    .getByRole("row", { name: /Test Group for groups/ })
    .getByRole("button", { name: "Edit" })
    .first()
    .click();
  await page.getByLabel("Name:").fill("Test Group Edited");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("cell", { name: "Test Group Edited" }).first()
  ).toBeVisible();

  // Delete
  await page
    .getByRole("row", { name: /Test Group Edited/ })
    .getByRole("button", { name: "X" })
    .first()
    .click();
  await page
    .getByRole("row", { name: /Test Group Edited/ })
    .getByRole("button", { name: "X?" })
    .first()
    .click();
  await expect(
    page.getByRole("cell", { name: "Test Group Edited" })
  ).not.toBeVisible();
});
