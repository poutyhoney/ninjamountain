import type { Snapshot } from "./snapshot";

export function majorVersion(uiVersion: string | null): number | null {
  if (uiVersion === null) return null;
  const digits = /^\D*(\d+)/.exec(uiVersion)?.[1];
  return digits === undefined ? null : Number(digits);
}

export function readUiVersion(snapshot: Snapshot): string | null {
  const config = snapshot.flexConfiguration;
  return config.available ? config.data.uiVersion : null;
}
