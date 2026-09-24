import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function reachSelection(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/");
  await page.getByRole("button", { name: /establish archive link/i }).click();
  await page.getByRole("button", { name: /open incident/i }).click();

  await page.getByRole("button", { name: /energy trace/i }).click();
  await page.getByRole("button", { name: /the light came first/i }).click();
  await page.getByRole("button", { name: /prior contact/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
}

test("selection becomes a persistent Lantern record", async ({ page }) => {
  await reachSelection(page);

  await expect(
    page.getByRole("heading", { name: /human of earth/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /put on the ring/i }).click();
  await expect(page.getByText(/corps service record/i)).toBeVisible();

  const lanternNumber = page.getByText(/lantern 2814-/i);
  await expect(lanternNumber).toBeVisible();
  const original = await lanternNumber.textContent();

  await page.reload();

  await expect(page.getByText(original ?? "")).toBeVisible();
  await expect(page.getByRole("button", { name: /case/i })).toBeVisible();
});

test("case intelligence advances instead of leaving stale objectives", async ({
  page,
}) => {
  await reachSelection(page);
  await page.getByRole("button", { name: /put on the ring/i }).click();
  await page.getByRole("button", { name: /^case$/i }).click();

  await expect(
    page.getByRole("heading", { name: /why was the prior-contact record sealed/i }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /run waveform correlation/i })
    .click();

  await expect(page.getByText(/91.4%/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /trace matching signal/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /trace matching signal/i }).click();
  await page.getByRole("button", { name: /unknown contact/i }).click();
  await page.getByRole("button", { name: /scan unresolved contact/i }).click();

  await expect(page.getByText(/echo detected/i).first()).toBeVisible();

  await page.getByRole("button", { name: /^case$/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /how can one signature arrive from three places/i,
    }),
  ).toBeVisible();
});

test("boot screen has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(blocking).toEqual([]);
});
