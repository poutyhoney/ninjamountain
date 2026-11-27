// Helpers for the Flex UI version, which decides whether R1 and R2 apply.
//
// On Flex UI 1.x, Proxy and Flex Flows are the correct setup. On 2.x they are
// leftovers. R1 (rules/sms-url-proxy.ts) and R2 (rules/flex-flows-on-2x.ts)
// call majorVersion(). The reports call readUiVersion() for the header.
// cli.ts calls withFlexUi() for the --flex-ui flag.
import type { Snapshot } from "./snapshot";

// Turns a ui_version string into its major number: "2.18.0" and "~2.18.0"
// both give 2. Returns null when there's no number to read, and the rules
// then report "skipped" instead of guessing.
export function majorVersion(uiVersion: string | null): number | null {
  if (uiVersion === null) return null;
  // ^\D* skips any leading non-digits (a range prefix such as ~ or ^).
  // (\d+) captures the first run of digits. exec returns null on no match,
  // so ?.[1] (optional chaining) gives undefined instead of throwing.
  // With noUncheckedIndexedAccess, [1] is typed string | undefined either way.
  const digits = /^\D*(\d+)/.exec(uiVersion)?.[1];
  return digits === undefined ? null : Number(digits);
}

// The version string if the key could read the Flex Configuration, else null.
// Checking config.available narrows the Section union so config.data can be
// read.
export function readUiVersion(snapshot: Snapshot): string | null {
  const config = snapshot.flexConfiguration;
  return config.available ? config.data.uiVersion : null;
}

// Supplies a version for --flex-ui when the key couldn't read one. The flag
// only fills a gap: a version the key actually read always wins.
export function withFlexUi(snapshot: Snapshot, major: string): Snapshot {
  if (snapshot.flexConfiguration.available) return snapshot;
  // Object spread copies the snapshot and replaces one field. The input is
  // never changed (immutability), so cli.ts can save the snapshot exactly as
  // collected and give the rules this adjusted copy.
  return {
    ...snapshot,
    flexConfiguration: { available: true, data: { uiVersion: major } },
  };
}
