export function majorVersion(uiVersion: string | null): number | null {
  if (uiVersion === null) return null;
  const digits = /^\D*(\d+)/.exec(uiVersion)?.[1];
  return digits === undefined ? null : Number(digits);
}
