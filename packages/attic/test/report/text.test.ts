import { describe, expect, it } from "vitest";
import { textReport } from "../../src/report/text";
import { runRules } from "../../src/rules";
import { loadFixture } from "../helpers";

function reportFor(name: string): string {
  const snapshot = loadFixture(name);
  return textReport(snapshot, runRules(snapshot));
}

describe("text report", () => {
  it("summarizes the legacy mess", () => {
    const report = reportFor("legacy-mess");
    expect(report).toContain("Legacy Flex audit: AC...0000 (Flex UI 2.18.0)");
    expect(report).toContain("4 critical, 3 warnings, 1 info, 0 skipped");
  });

  it("lists critical before warning before info", () => {
    const report = reportFor("legacy-mess");
    const critical = report.indexOf("\nCRITICAL\n");
    const warning = report.indexOf("\nWARNING\n");
    const info = report.indexOf("\nINFO\n");
    expect(critical).toBeGreaterThan(-1);
    expect(critical).toBeLessThan(warning);
    expect(warning).toBeLessThan(info);
  });

  it("says so when a healthy account has nothing to report", () => {
    const report = reportFor("healthy-2x");
    expect(report).toContain("0 critical, 0 warnings, 0 info, 0 skipped");
    expect(report).toContain("No findings.");
  });

  it("lists skipped rules with their reason", () => {
    const report = reportFor("restricted-key");
    expect(report).toContain("2 critical, 1 warning, 1 info, 2 skipped");
    expect(report).toMatch(/SKIPPED\n {2}\[R1\].*--flex-ui 2/);
  });

  it("always ends with the nothing-changed footer", () => {
    expect(
      reportFor("healthy-2x").endsWith(
        "Nothing was changed. Review each command before you run it.",
      ),
    ).toBe(true);
  });

  it("lists the manual checks before the footer", () => {
    const report = reportFor("healthy-2x");
    expect(report).toContain("MANUAL CHECKS\n  - API keys:");
    expect(report.indexOf("MANUAL CHECKS")).toBeLessThan(
      report.indexOf("Nothing was changed"),
    );
  });
});
