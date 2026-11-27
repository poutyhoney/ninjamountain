import { describe, expect, it } from "vitest";
import { createRedactor, FAKE_ACCOUNT_SID, FAKE_KEY_SID } from "../src/redact";

const accountSid = `AC${"a".repeat(32)}`;
const keySid = `SK${"b".repeat(32)}`;

describe("createRedactor", () => {
  it("maps the same number to the same fake in both formats", () => {
    const redact = createRedactor({ accountSid, keySid });
    expect(redact("+14155550123")).toBe("+12025550100");
    expect(redact("(415) 555-0123")).toBe("(202) 555-0100");
    expect(redact("+13105550199")).toBe("+12025550101");
  });

  it("redacts a number inside a channel address", () => {
    const redact = createRedactor({ accountSid, keySid });
    expect(redact("whatsapp:+14155550123")).toBe("whatsapp:+12025550100");
  });

  it("replaces the account and key SIDs anywhere in a string", () => {
    const redact = createRedactor({ accountSid, keySid });
    expect(redact(`/Accounts/${accountSid}/Keys/${keySid}`)).toBe(
      `/Accounts/${FAKE_ACCOUNT_SID}/Keys/${FAKE_KEY_SID}`,
    );
  });

  it("leaves digit runs inside other SIDs alone", () => {
    const redact = createRedactor({ accountSid, keySid });
    const sid = "PN1234567890123456789012345678abcd";
    expect(redact(sid)).toBe(sid);
  });
});
