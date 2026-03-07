import { test, expect } from "@playwright/test";
import { login, createGroup, createType } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Account flows", async ({ page }, testInfo) => {
  const suffix = testInfo.retry > 0 ? `-retry${testInfo.retry}` : "";
  const groupName = `Test Group for account${suffix}`;
  const typeName = `Test Type for account${suffix}`;
  const accountName = `Test Account for account creation${suffix}`;
  const editedName = `Test Account Edited${suffix}`;

  // Login
  await login(page);

  // Create type and group so it can be chosen
  await createGroup(page, groupName);
  await createType(page, typeName);

  // Navigate to accounts page
  await page.getByRole("link", { name: "Accounts" }).click();

  // Create
  await page.getByRole("button", { name: "+ New Account" }).click();
  await page.getByLabel("Name:").fill(accountName);
  await page.getByLabel("Type:").selectOption({ label: typeName });
  await page.getByLabel("Group:").selectOption({ label: groupName });
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(accountName).first()).toBeVisible();

  // Edit
  await page
    .getByRole("row", { name: new RegExp(accountName) })
    .getByRole("button", { name: "Edit" })
    .first()
    .click();
  await page.getByLabel("Name:").fill(editedName);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(editedName).first()).toBeVisible();

  // Delete
  await page
    .getByRole("row", { name: new RegExp(editedName) })
    .getByRole("button", { name: "X" })
    .first()
    .click();
  await page
    .getByRole("row", { name: new RegExp(editedName) })
    .getByRole("button", { name: "X?" })
    .first()
    .click();
  await expect(page.getByText(editedName).first()).not.toBeVisible();
});
