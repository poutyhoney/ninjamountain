// The only code in the package that talks to Twilio.
//
// createClient() returns an object with a single method, get(). There is no
// post, update, or delete, so the "read-only" promise is enforced by the code
// itself, not only by the API key's permissions. client.test.ts checks that
// get is the only method. paginate.ts and collect.ts build on top of this.
import type { Credentials } from "./config";

// A custom error class so callers can tell Twilio API failures apart from
// everything else with `instanceof TwilioApiError`. collect.ts reads status
// and code to decide whether a section is "unavailable" (8021, 70051, 403,
// 404) or whether the whole run should stop (20003, bad credentials).
export class TwilioApiError extends Error {
  readonly status: number;
  // Twilio's own error code from the JSON body, such as 8021. Undefined when
  // the body had none (for example an HTML error page from a proxy).
  readonly code: number | undefined;
  readonly url: string;

  constructor(
    status: number,
    code: number | undefined,
    url: string,
    message: string,
  ) {
    super(message);
    // Without this, stack traces and console output show "Error" instead of
    // the subclass name.
    this.name = "TwilioApiError";
    this.status = status;
    this.code = code;
    this.url = url;
  }
}

// The interface is what the rest of the code depends on, not the
// implementation. Tests swap in fake fetch responses, and nothing else needs
// to know (a light form of dependency injection).
export interface TwilioClient {
  // A generic method: the caller says what shape it expects back. The default
  // of unknown forces callers that don't say to check the shape themselves.
  get<T = unknown>(url: string): Promise<T>;
}

// A factory function instead of a class: the credentials live in a closure,
// so they can't be read back off the returned object.
export function createClient(credentials: Credentials): TwilioClient {
  // HTTP Basic auth: base64 of "username:password". For an API key, the
  // username is the key SID and the password is the key secret.
  const token = Buffer.from(
    `${credentials.keySid}:${credentials.keySecret}`,
  ).toString("base64");
  const headers = {
    Authorization: `Basic ${token}`,
    Accept: "application/json",
  };

  async function get<T = unknown>(url: string): Promise<T> {
    // fetch is built into Node 18 and later, so no HTTP library is needed.
    // method is spelled out so a reader can see at a glance that only GET
    // is ever sent.
    const response = await fetch(url, { method: "GET", headers });
    // Error responses aren't always JSON. If parsing fails, fall back to
    // undefined instead of throwing a SyntaxError that hides the real status.
    const body: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      // body is unknown, so its shape has to be checked before reading
      // fields. isRecord narrows it, then typeof narrows each field.
      const code =
        isRecord(body) && typeof body.code === "number" ? body.code : undefined;
      const message =
        isRecord(body) && typeof body.message === "string"
          ? body.message
          : response.statusText;
      throw new TwilioApiError(response.status, code, url, message);
    }

    // A type assertion: trusting the caller's T. collect.ts still checks each
    // field with its str/num/obj readers, so a surprise shape fails loudly
    // there instead of silently here.
    return body as T;
  }

  return { get };
}

// A type predicate (the `value is ...` return type). When it returns true,
// TypeScript treats value as an object with string keys, so fields can be
// read without a cast. Shared by paginate.ts and collect.ts.
export function isRecord(value: unknown): value is Record<string, unknown> {
  // typeof null is "object" in JavaScript, so null has to be excluded by hand.
  return typeof value === "object" && value !== null;
}
