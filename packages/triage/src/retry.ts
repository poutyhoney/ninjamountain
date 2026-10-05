// Shared retry with exponential backoff, used by every provider adapter.
// The loop is generic; each adapter injects its own isRetryable() because
// only the adapter knows its SDK's error classes and status codes.

export interface RetryOptions {
  maxAttempts?: number;
  // Prefix for log lines and error messages, e.g. "anthropic" or "openai",
  // so a failure in a long scored run says which provider it came from.
  label:        string;
  // Dependency injection: the caller decides what counts as transient.
  isRetryable:  (err: unknown) => boolean;
}

// Generic over T: withRetry returns whatever fn returns, so the same helper
// works for any SDK call without casts.
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, label, isRetryable }: RetryOptions
): Promise<T> {
  // No loop condition: every path either returns or throws, so the loop can
  // never fall through. That also removes the "unreachable" throw that the
  // old hand-written loop in client.ts needed after the loop.
  for (let attempt = 1; ; attempt++) {
    try {
      // `return await` (not plain `return`) so a rejected promise is caught
      // by this try block instead of escaping to the caller.
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Fail fast on errors that will never succeed (bad request, bad key),
      // and stop once the attempt budget is spent.
      if (!isRetryable(err) || attempt >= maxAttempts) {
        throw new Error(`${label}: failed after ${attempt} attempt(s): ${message}`);
      }
      // Exponential backoff: 1s, 2s, 4s. Waiting longer each time gives a
      // rate-limited or overloaded API room to recover.
      const backoffMs = 1000 * 2 ** (attempt - 1);
      console.warn(`${label}: ${message} — retry ${attempt}/${maxAttempts} in ${backoffMs}ms`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}
