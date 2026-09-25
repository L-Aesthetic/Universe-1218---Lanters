import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function reachSelection(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /establish archive link/i }).click();
  await page.getByRole("button", { name: /open incident/i }).click();

  await page.getByRole("button", { name: /energy trace/i }).click();
  await page.getByRole("button", { name: /the light came first/i }).click();
  await page.getByRole("button", { name: /prior contact/i }).click();
  await page
    .getByRole("button", { name: /continue to observer scan/i })
    .click();
}

test("selection becomes a persistent Lantern record", async ({ page }) => {
  await reachSelection(page);

  await expect(
    page.getByRole("heading", { name: /human of earth/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/selection basis.*in-case actions only/i),
  ).toBeVisible();
  await expect(
    page.getByText(/no personal profile.*activity outside this investigation/i),
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
  await page.getByRole("button", { name: /case/i }).click();

  await expect(
    page.getByRole("heading", { name: /why was the prior-contact record sealed/i }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /run waveform correlation/i })
    .click();

  await expect(page.getByText(/91.4%/i)).toBeVisible();
  await expect(
    page.locator(".ring-dock__item--recommended").filter({ hasText: "SECTOR" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /trace matching signal/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /trace matching signal/i }).click();

  await expect(
    page.getByText(/local model.*ring projection.*not to scale/i),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "UNKNOWN CONTACT", exact: true }),
  ).toBeVisible();

  await page
    .locator(".sector-node-list button")
    .filter({ hasText: "UNKNOWN CONTACT" })
    .click();
  await page.getByRole("button", { name: /scan unresolved contact/i }).click();

  await expect(page.getByText(/echo detected/i).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /unknown contact return/i }),
  ).toHaveCount(3);

  await page.getByRole("button", { name: /case/i }).click();
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


test("selection remains operable on a short viewport", async ({ page }) => {
  await reachSelection(page);

  const accept = page.getByRole("button", { name: /put on the ring/i });
  await accept.scrollIntoViewIfNeeded();
  await expect(accept).toBeVisible();

  const box = await accept.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? 9999) + (box?.height ?? 0)).toBeLessThanOrEqual(
    page.viewportSize()?.height ?? 640,
  );
});


test("case reconstruction reveals only reviewed timeline evidence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /establish archive link/i }).click();
  await page.getByRole("button", { name: /open incident/i }).click();

  await page.getByRole("button", { name: /energy trace/i }).click();

  await expect(page.getByText("02:13:41.811").first()).toBeVisible();
  await expect(page.getByText("02:17:41.811").first()).toBeVisible();
  await expect(page.getByText(/power outage logged/i)).toHaveCount(0);

  await page.getByRole("button", { name: /the light came first/i }).click();

  await expect(page.getByText(/power outage logged/i)).toBeVisible();
  await expect(
    page.getByText("CAMERA METADATA CORRUPTION", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/local timeline is incomplete/i)).toBeVisible();
});


test("ring reconstruction scrubs only through revealed events", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /establish archive link/i }).click();
  await page.getByRole("button", { name: /open incident/i }).click();
  await page.getByRole("button", { name: /energy trace/i }).click();

  const scrubber = page.getByRole("slider", { name: /reconstruction event/i });
  await expect(scrubber).toHaveAttribute("max", "1");
  await expect(scrubber).toHaveAttribute(
    "aria-valuetext",
    /02:13:41\.811, anomalous emission/i,
  );
  await expect(page.getByText(/unknown emission/i)).toBeVisible();

  await page
    .getByRole("button", { name: /02:17:41\.811.*body discovered/i })
    .click();
  await expect(page.getByText(/body position recorded/i)).toBeVisible();

  await page.getByRole("button", { name: /the light came first/i }).click();
  await expect(scrubber).toHaveAttribute("max", "4");

  await page
    .getByRole("button", { name: /02:17.*power outage logged/i })
    .click();
  await expect(page.getByText(/municipal grid loss/i)).toBeVisible();
  await expect(page.getByText(/body position recorded/i)).toHaveCount(0);
});


test("Ask the Ring stays grounded and cites its answer", async ({ page }) => {
  await reachSelection(page);
  await page.getByRole("button", { name: /put on the ring/i }).click();

  await page.getByRole("button", { name: /ask ring/i }).click();
  await expect(
    page.getByRole("heading", { name: /ask the ring/i }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /why was the prior record sealed/i })
    .click();

  await expect(page.getByText("KNOWN", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/does not state the motive.*will not invent one/i),
  ).toBeVisible();
  await expect(page.getByText(/case 2814-e\/001.*oan record/i)).toBeVisible();

  const input = page.getByLabel("QUERY");
  await input.fill("What did Abin Sur eat for breakfast?");
  await page.getByRole("button", { name: "ASK", exact: true }).click();

  await expect(page.getByText("UNKNOWN", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/does not contain enough grounded information/i),
  ).toBeVisible();
});

test("assignments advance from case review to correlation to sector trace", async ({
  page,
}) => {
  await reachSelection(page);
  await page.getByRole("button", { name: /put on the ring/i }).click();

  await expect(page.getByText("COMPARE PRIOR CONTACT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("AVAILABLE", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: /open case/i }).click();
  await page
    .getByRole("button", { name: /run waveform correlation/i })
    .click();

  await page.getByRole("button", { name: /open lantern service record/i }).click();

  await expect(page.getByText("TRACE THE RETURN", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("AVAILABLE", { exact: true }).first()).toBeVisible();
});


test("construct training uses the interactive 3D renderer", async ({ page }) => {
  await reachSelection(page);
  await page.getByRole("button", { name: /put on the ring/i }).click();

  await page.getByRole("button", { name: /construct/i }).click();

  const canvas = page.getByRole("application", {
    name: /interactive three-dimensional defensive shield construct/i,
  });

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-renderer", /webgl|fallback/);

  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("+");

  await page
    .getByRole("button", { name: /load-bearing bridge/i })
    .click();

  await expect(
    page.getByRole("application", {
      name: /interactive three-dimensional load-bearing bridge/i,
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /distress beacon/i })
    .click();

  await expect(
    page.getByRole("application", {
      name: /interactive three-dimensional distress beacon/i,
    }),
  ).toBeVisible();
});
