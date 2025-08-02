import { Page, expect } from "@playwright/test";

/**
 * Performs login with default test credentials
 * @param page - The Playwright page object
 * @param email - Email address (defaults to test user)
 * @param password - Password (defaults to test password)
 */
export async function login(
  page: Page,
  email = "rachel@remix.run",
  password = "rachelrox"
) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Email address").press("Tab");

  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Password").press("Enter");

  // Verify login was successful by checking for New Account button
  await expect(page.getByText("New Account")).toBeVisible();
}

/**
 * Performs logout
 * @param page - The Playwright page object
 */
export async function logout(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByText("Log in")).toBeVisible();
}

/**
 * Navigates to the home page
 * @param page - The Playwright page object
 */
export async function goToHome(page: Page) {
  await page.goto("/");
}

/**
 * Creates a new group
 * @param page - The Playwright page object
 * @param groupName - The name of the group to create
 */
export async function createGroup(page: Page, groupName: string) {
  // Navigate to groups page
  await page.getByRole("link", { name: "🫙 Groups" }).click();

  // Click New Group button
  await page.getByRole("button", { name: "+ New Group" }).click();

  // Fill in the group name
  await page.getByLabel("Name:").fill(groupName);

  // Save the group
  await page.getByRole("button", { name: "Save" }).click();

  // Verify the group was created by checking it appears in the list
  await expect(page.getByText(groupName)).toBeVisible();
}

/**
 * Creates a new type
 * @param page - The Playwright page object
 * @param typeName - The name of the type to create
 */
export async function createType(page: Page, typeName: string) {
  // Navigate to types page
  await page.getByRole("link", { name: "🏦 Types" }).click();

  // Click New Type button
  await page.getByRole("button", { name: "+ New Type" }).click();

  // Fill in the type name
  await page.getByLabel("Name:").fill(typeName);

  // Save the type
  await page.getByRole("button", { name: "Save" }).click();

  // Verify the type was created by checking it appears in the list
  await expect(page.getByText(typeName)).toBeVisible();
}

/**
 * Creates a new balance
 * @param page - The Playwright page object
 * @param date - The date for the balance (YYYY-MM-DD format)
 * @param accountName - The name of the account to select
 * @param balanceAmount - The balance amount
 */
export async function createBalance(
  page: Page,
  date: string,
  accountName: string,
  balanceAmount: string
) {
  // Navigate to balances page
  await page.getByRole("link", { name: "💰 Balances" }).click();

  // Click New Balance button
  await page.getByRole("button", { name: "+ New Balance" }).click();

  // Fill in the balance details
  await page.getByLabel("Date:").fill(date);
  await page.getByLabel("Account:").selectOption({ label: accountName });
  await page
    .getByLabel("Balance (rounded to the nearest number):")
    .fill(balanceAmount);

  // Save the balance
  await page.getByRole("button", { name: "Save" }).click();

  // Verify the balance was created by checking it appears in the list
  await expect(page.getByText(balanceAmount)).toBeVisible();
}
