import { expect, test } from "@playwright/test";

test("pricing page shows the three belts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Choose your belt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "White Belt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brown Belt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Black Belt" })).toBeVisible();
});

test("choosing a paid belt goes to Stripe Checkout", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Choose Brown Sword" }).click();

  await page.waitForURL(/checkout\.stripe\.com/);
});

test("the cancel page offers a way back", async ({ page }) => {
  await page.goto("/checkout/cancel");

  await expect(page.getByRole("heading", { name: "Checkout canceled" })).toBeVisible();
  await page.getByRole("link", { name: "Back to the store" }).click();
  await expect(page).toHaveURL("/");
});

test("the success page rejects a fake session", async ({ page }) => {
  await page.goto("/checkout/success?session_id=fake");

  await expect(page).toHaveURL("/");
});