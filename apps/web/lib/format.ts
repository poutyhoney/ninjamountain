export const pct = (x: number) => `${Math.round(x * 100)}%`;
export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
export const kilo = (n: number) => `${(n / 1000).toFixed(1)}K`;
export const when = (iso: string) => `${iso.slice(0, 16).replace("T", " ")} UTC`;