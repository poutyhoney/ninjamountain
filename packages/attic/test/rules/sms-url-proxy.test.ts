// R1 tests: Proxy SMS URLs, pool-only numbers, 1.x, missing Proxy data, and
// the --flex-ui hint in the skip reason.
import { describe, expect, it } from "vitest";
import { smsUrlProxy } from "../../src/rules/sms-url-proxy";
import { loadFixture } from "../helpers";

const URL_NUMBER = "PN00000000000000000000000000000098";
const POOL_ONLY_NUMBER = "PN00000000000000000000000000000097";

describe("R1 SMS URL points at Proxy", () => {
  it("stays quiet on a healthy account", () => {
    expect(smsUrlProxy.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("flags the Proxy URL as critical and the pool-only number as a warning", () => {
    const result = smsUrlProxy.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(2);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R1",
      severity: "critical",
      resourceSid: URL_NUMBER,
    });
    expect(result.findings[1]).toMatchObject({
      ruleId: "R1",
      severity: "warning",
      resourceSid: POOL_ONLY_NUMBER,
    });
  });

  it("gives both steps when the number has a Proxy URL and sits in a pool", () => {
    const result = smsUrlProxy.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings[0]?.fix).toContain('--sms-url ""');
    expect(result.findings[0]?.fix).toContain("phone-numbers:remove");
  });

  it("stays quiet on a 1.x account", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexConfiguration = {
      available: true,
      data: { uiVersion: "1.34.2" },
    };
    expect(smsUrlProxy.run(snapshot)).toEqual({ status: "ran", findings: [] });
  });

  it("still checks SMS URLs when Proxy services were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.proxyServices = {
      available: false,
      reason: "401 code 8021: test",
    };
    const result = smsUrlProxy.run(snapshot);
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.resourceSid).toBe(URL_NUMBER);
    expect(result.findings[0]?.detail).toContain("Could not check Proxy pools");
  });

  it("skips with a --flex-ui hint when the Flex Configuration was unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexConfiguration = {
      available: false,
      reason: "401 code 8021: test",
    };
    const result = smsUrlProxy.run(snapshot);
    if (result.status !== "skipped")
      throw new Error(`expected skipped, got ${result.status}`);
    expect(result.reason).toContain("--flex-ui 2");
  });

  it("skips when phone numbers were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.phoneNumbers = { available: false, reason: "401 code 8021: test" };
    expect(smsUrlProxy.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 8021: test",
    });
  });
});
