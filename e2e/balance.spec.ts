import { test, expect } from "@playwright/test";
import { login, createGroup, createType, createBalance } from "./shared-steps";
import { formatBalance } from "~/lib/utils";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Balance flows", async ({ page }) => {
  // Login
  await login(page);

  // Create dependencies first
  await createGroup(page, "Balance Test Group");
  await createType(page, "Balance Test Type");

  // Create account for balance
  await page.getByRole("link", { name: "Accounts" }).click();
  await page.getByRole("button", { name: "+ New Account" }).click();
  await page.getByLabel("Name:").fill("Balance Test Account");
  await page.getByLabel("Type:").selectOption({ label: "Balance Test Type" });
  await page.getByLabel("Group:").selectOption({ label: "Balance Test Group" });
  await page.getByRole("button", { name: "Save" }).click();

  // Create balance
  await createBalance(page, "2025-01-01", "Balance Test Account", "1000");
  const formattedBalance1000 = formatBalance(1000);
  const formattedBalance1500 = formatBalance(1500);

  // Edit
  await page
    .getByRole("row", {
      name: new RegExp(`Balance Test Account.*${formattedBalance1000}`),
    })
    .getByRole("button", { name: "Edit" })
    .first()
    .click();
  await page.getByLabel("Date:").fill("2025-01-02");
  await page.getByLabel("Balance:").fill("1500");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(formattedBalance1500).first()).toBeVisible();

  // Delete
  await page
    .getByRole("row", {
      name: new RegExp(`Balance Test Account.*${formattedBalance1500}`),
    })
    .getByRole("button", { name: "X" })
    .first()
    .click();
  await page
    .getByRole("row", {
      name: new RegExp(`Balance Test Account.*${formattedBalance1500}`),
    })
    .getByRole("button", { name: "X?" })
    .click();
  await expect(page.getByText(formattedBalance1500).first()).not.toBeVisible();
});
