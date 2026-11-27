import { describe, expect, it } from "vitest";
import { jsonReport } from "../../src/report/json";
import { runRules } from "../../src/rules";
import { loadFixture } from "../helpers";

function reportFor(name: string) {
  const snapshot = loadFixture(name);
  return jsonReport(snapshot, runRules(snapshot));
}

describe("JSON report", () => {
  it("counts the legacy mess", () => {
    const report = reportFor("legacy-mess");
    expect(report.summary).toEqual({
      critical: 4,
      warning: 3,
      info: 1,
      skipped: 0,
    });
    expect(report.findings).toHaveLength(8);
  });

  it("lists skipped rules and a null version for a restricted key", () => {
    const report = reportFor("restricted-key");
    expect(report.flexUiVersion).toBeNull();
    expect(report.skipped.map((s) => s.ruleId)).toEqual(["R1", "R2"]);
  });

  it("survives a JSON round trip unchanged", () => {
    const report = reportFor("legacy-mess");
    expect(JSON.parse(JSON.stringify(report))).toEqual(report);
  });
});
