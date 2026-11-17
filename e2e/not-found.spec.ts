import { test, expect } from "@playwright/test";
import { login } from "./shared-steps";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await login(page);
});

for (const entity of ["accounts", "balances", "groups", "types"]) {
  test(`Edit page for unknown ${entity} id shows not found`, async ({
    page,
  }) => {
    const response = await page.goto(`/${entity}/does-not-exist/edit`);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Not found" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
  });
}
