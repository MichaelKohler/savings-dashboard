import { test, expect, type Page } from "@playwright/test";
import { login, createType, createBalance } from "./shared-steps";

const UNCHECKED_BY_DEFAULT_LABEL = "Unchecked in charts filter by default";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function createAccount(
  page: Page,
  {
    name,
    typeName,
    groupName,
    uncheckedInChartsByDefault = false,
  }: {
    name: string;
    typeName: string;
    groupName?: string;
    uncheckedInChartsByDefault?: boolean;
  }
) {
  await page.getByRole("link", { name: "Accounts" }).click();
  await page.getByRole("button", { name: "+ New Account" }).click();
  await page.getByLabel("Name:").fill(name);
  await page.getByLabel("Type:").selectOption({ label: typeName });
  if (groupName) {
    await page.getByLabel("Group:").selectOption({ label: groupName });
  }

  await expect(page.getByLabel(UNCHECKED_BY_DEFAULT_LABEL)).toBeDisabled();
  await page.getByLabel("Show in graphs").check();
  await expect(page.getByLabel(UNCHECKED_BY_DEFAULT_LABEL)).toBeEnabled();
  if (uncheckedInChartsByDefault) {
    await page.getByLabel(UNCHECKED_BY_DEFAULT_LABEL).check();
  }

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(name).first()).toBeVisible();
}

function filterCheckbox(page: Page, dropdown: string, name: string) {
  return page
    .getByRole("group", { name: dropdown })
    .getByRole("checkbox", { name: new RegExp(name) });
}

async function openDropdown(page: Page, dropdown: string) {
  await page.getByRole("button", { name: new RegExp(`^${dropdown}`) }).click();
}

async function closeDropdown(page: Page) {
  await page.keyboard.press("Escape");
}

test("Entities unchecked in charts filter by default", async ({
  page,
}, testInfo) => {
  const suffix = testInfo.retry > 0 ? `-retry${testInfo.retry}` : "";
  const groupName = `Charts Default Hidden Group${suffix}`;
  const typeName = `Charts Default Type${suffix}`;
  const hiddenAccount = `Charts Default Hidden Account${suffix}`;
  const visibleAccount = `Charts Default Visible Account${suffix}`;
  const groupedAccount = `Charts Default Grouped Account${suffix}`;

  await login(page);

  // Group that starts unchecked
  await page.getByRole("link", { name: "Groups" }).click();
  await page.getByRole("button", { name: "+ New Group" }).click();
  await page.getByLabel("Name:").fill(groupName);
  await page.getByLabel(UNCHECKED_BY_DEFAULT_LABEL).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("cell", { name: groupName }).first()
  ).toBeVisible();

  await createType(page, typeName);

  await createAccount(page, {
    name: hiddenAccount,
    typeName,
    uncheckedInChartsByDefault: true,
  });
  await createAccount(page, { name: visibleAccount, typeName });
  await createAccount(page, { name: groupedAccount, typeName, groupName });

  // Accounts only show up in the charts filter once they have balances
  await createBalance(page, "2025-01-01", hiddenAccount, "1000");
  await createBalance(page, "2025-01-01", visibleAccount, "2000");
  await createBalance(page, "2025-01-01", groupedAccount, "3000");

  await page.getByRole("link", { name: "Charts" }).click();

  // Initial state follows the defaults
  await openDropdown(page, "Accounts");
  const hiddenCheckbox = filterCheckbox(page, "Accounts", hiddenAccount);
  await expect(hiddenCheckbox).not.toBeChecked();
  await expect(
    page.getByRole("group", { name: "Accounts" }).getByText(hiddenAccount)
  ).toContainText("(unchecked by default)");
  await expect(filterCheckbox(page, "Accounts", visibleAccount)).toBeChecked();
  const groupedCheckbox = filterCheckbox(page, "Accounts", groupedAccount);
  await expect(groupedCheckbox).not.toBeChecked();
  await expect(groupedCheckbox).toBeDisabled();
  await closeDropdown(page);

  await openDropdown(page, "Groups");
  const groupCheckbox = filterCheckbox(page, "Groups", groupName);
  await expect(groupCheckbox).not.toBeChecked();
  await expect(
    page.getByRole("group", { name: "Groups" }).getByText(groupName)
  ).toContainText("(unchecked by default)");
  await closeDropdown(page);

  await expect(
    page.getByRole("button", { name: "Reset to defaults" })
  ).toBeDisabled();

  // "Show everything" selects all entities
  await page.getByRole("button", { name: "Show everything" }).click();

  await openDropdown(page, "Accounts");
  await expect(hiddenCheckbox).toBeChecked();
  await expect(groupedCheckbox).toBeChecked();
  await expect(groupedCheckbox).toBeEnabled();
  await closeDropdown(page);

  await openDropdown(page, "Groups");
  await expect(groupCheckbox).toBeChecked();
  await closeDropdown(page);

  // "Reset to defaults" restores the initial state
  await page.getByRole("button", { name: "Reset to defaults" }).click();

  await openDropdown(page, "Accounts");
  await expect(hiddenCheckbox).not.toBeChecked();
  await expect(filterCheckbox(page, "Accounts", visibleAccount)).toBeChecked();
  await expect(groupedCheckbox).toBeDisabled();
  await closeDropdown(page);

  await openDropdown(page, "Groups");
  await expect(groupCheckbox).not.toBeChecked();
  await closeDropdown(page);

  await expect(
    page.getByRole("button", { name: "Reset to defaults" })
  ).toBeDisabled();
});
