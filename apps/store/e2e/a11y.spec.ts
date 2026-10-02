import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const pages = [
  { name: "pricing page", path: "/" },
  { name: "cancel page", path: "/checkout/cancel" },
];

for (const { name, path } of pages) {
  test(`${name} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    const problems = results.violations.flatMap((violation) =>
      violation.nodes.map(
        (node) => `${violation.id} (${violation.impact}): ${node.failureSummary} | ${node.html}`,
      ),
    );

    expect(problems).toEqual([]);
  });
}