import { test, expect } from "@playwright/test";
import { login, createGroup, createType } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Account flows", async ({ page }) => {
  // Login
  await login(page);

  // Create type and group so it can be chosen
  await createGroup(page, "Test Group for account");
  await createType(page, "Test Type for account");

  await page.goto("/");

  // Create
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByLabel("Name:").fill("Test Account for account creation");
  await page.getByLabel("Type:").selectOption({ label: "Test Type for account" });
  await page.getByLabel("Group:").selectOption({ label: "Test Group for account" });
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Test Account for account creation")).toBeVisible();

  // Edit
  await page.getByRole("row", { name: /Test Account for account creation/ }).getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Name:").fill("Test Account Edited");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Test Account Edited")).toBeVisible();

  // Delete
  await page.getByRole("row", { name: /Test Account Edited/ }).getByRole("button", { name: "X" }).click();
  await page.getByRole("row", { name: /Test Account Edited/ }).getByRole("button", { name: "X?" }).click();
  await expect(page.getByText("Test Account Edited")).not.toBeVisible();
});
