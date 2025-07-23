import { test, expect } from "@playwright/test";
import { login, createGroup, createType } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Account flows", async ({ page }) => {
  // Login
  await login(page);

  // Create type and group so it can be chosen
  await createGroup(page, "Test Group");
  await createType(page, "Test Type");

  await page.goto("/");

  // Create
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByLabel("Name:").fill("Test Account");
  await page.getByLabel("Type:").selectOption({ label: "Test Type" });
  await page.getByLabel("Group:").selectOption({ label: "Test Group" });
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Test Account")).toBeVisible();

  // Edit
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Name:").fill("Test Account Edited");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Test Account Edited")).toBeVisible();

  // Delete
  await page.getByRole("button", { name: "X" }).click();
  await page.getByRole("button", { name: "X?" }).click();
  await expect(page.getByText("Test Account Edited")).not.toBeVisible();
});
