// Replaces identifying values in a Snapshot with consistent fakes.
//
// Used by `scan --redact` in cli.ts, so a snapshot or report can be pasted
// or shared without exposing the account. It replaces the account SID, the
// key SID, and phone numbers. Other SIDs (flows, apps, Addresses) stay real,
// because they aren't secret and the printed fix commands need them.
// scripts/fake-sids.ts goes further, for building test fixtures.
import type { Snapshot } from "./snapshot";

// All zeros after the prefix, the same 34-character length as a real SID.
export const FAKE_ACCOUNT_SID = `AC${"0".repeat(32)}`;
export const FAKE_KEY_SID = `SK${"0".repeat(32)}`;

// E.164 numbers such as +12025550100: a plus sign, then 10 to 15 digits.
// (?<![\w+]) is a negative lookbehind: don't match if a letter, digit, or +
// comes right before. (?!\w) is a negative lookahead for the end. Together
// they stop the pattern from matching digits inside a longer token, such as
// part of a SID. The g flag replaces every match, not only the first.
const E164 = /(?<![\w+])\+\d{10,15}(?!\w)/g;
// US display format such as (202) 555-0100, which shows up in friendly names.
const US_FORMATTED = /\(\d{3}\)\s?\d{3}-\d{4}/g;

// Returns a function that redacts one string. The fakes Map lives in the
// closure, so every string redacted by the same redactor shares it. That's
// what makes the fakes consistent: the same real number gets the same fake
// everywhere in the snapshot, so a number in an SMS URL still matches the
// same number in phoneNumbers and addresses.
export function createRedactor(ids: {
  accountSid: string;
  keySid: string;
}): (text: string) => string {
  const fakes = new Map<string, number>();

  // Gives each distinct real number the next index (0, 1, 2, ...).
  function fakeIndex(digits: string): number {
    // Keys on the last 10 digits, so +12025550100 and (202) 555-0100 count as
    // the same number and get the same fake.
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
      // replaceAll with a string replaces every occurrence, including SIDs
      // inside URLs.
      .replaceAll(ids.accountSid, FAKE_ACCOUNT_SID)
      .replaceAll(ids.keySid, FAKE_KEY_SID)
      // A replacer callback builds each fake from the match.
      .replace(E164, (match) => `+1202555${fakeSuffix(fakeIndex(match))}`)
      .replace(
        US_FORMATTED,
        (match) =>
          // \D matches non-digits. Stripping them turns "(202) 555-0100" into
          // "2025550100" so it shares an index with the E.164 form.
          `(202) 555-${fakeSuffix(fakeIndex(match.replace(/\D/g, "")))}`,
      );
}

// 555-0100 to 555-0199 is the range set aside for fiction, so fakes can never
// be a real person's number. % 100 wraps around if an account ever had more
// than 100 numbers.
function fakeSuffix(index: number): string {
  return `01${String(index % 100).padStart(2, "0")}`;
}

export function redact(snapshot: Snapshot): Snapshot {
  // A Snapshot has accountSid and keySid fields, so it fits the ids
  // parameter directly (structural typing).
  const redactText = createRedactor(snapshot);
  // JSON.stringify's second argument is a replacer: it's called for every
  // value in the tree. Redacting each string there reaches every nested
  // field without walking the object by hand. Parsing the result back gives
  // a new object, so the input snapshot is left unchanged.
  const json = JSON.stringify(snapshot, (_key, value: unknown) =>
    typeof value === "string" ? redactText(value) : value,
  );
  return JSON.parse(json) as Snapshot;
}
