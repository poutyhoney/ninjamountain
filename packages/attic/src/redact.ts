import type { Snapshot } from "./snapshot";

export const FAKE_ACCOUNT_SID = `AC${"0".repeat(32)}`;
export const FAKE_KEY_SID = `SK${"0".repeat(32)}`;

const E164 = /(?<![\w+])\+\d{10,15}(?!\w)/g;
const US_FORMATTED = /\(\d{3}\)\s?\d{3}-\d{4}/g;

export function createRedactor(ids: {
  accountSid: string;
  keySid: string;
}): (text: string) => string {
  const fakes = new Map<string, number>();

  function fakeIndex(digits: string): number {
    const key = digits.slice(-10);
    let index = fakes.get(key);
    if (index === undefined) {
      index = fakes.size;
      fakes.set(key, index);
    }
    return index;
  }

  return (text) =>
    text
      .replaceAll(ids.accountSid, FAKE_ACCOUNT_SID)
      .replaceAll(ids.keySid, FAKE_KEY_SID)
      .replace(E164, (match) => `+1202555${fakeSuffix(fakeIndex(match))}`)
      .replace(
        US_FORMATTED,
        (match) =>
          `(202) 555-${fakeSuffix(fakeIndex(match.replace(/\D/g, "")))}`,
      );
}

function fakeSuffix(index: number): string {
  return `01${String(index % 100).padStart(2, "0")}`;
}

export function redact(snapshot: Snapshot): Snapshot {
  const redactText = createRedactor(snapshot);
  const json = JSON.stringify(snapshot, (_key, value: unknown) =>
    typeof value === "string" ? redactText(value) : value,
  );
  return JSON.parse(json) as Snapshot;
}
