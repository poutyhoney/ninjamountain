export interface RetryOptions {
  maxAttempts?: number;
  label:        string;
  isRetryable:  (err: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, label, isRetryable }: RetryOptions
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isRetryable(err) || attempt >= maxAttempts) {
        throw new Error(`${label}: failed after ${attempt} attempt(s): ${message}`);
      }
      const backoffMs = 1000 * 2 ** (attempt - 1);
      console.warn(`${label}: ${message} — retry ${attempt}/${maxAttempts} in ${backoffMs}ms`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}