import type { Credentials } from "./config";

export class TwilioApiError extends Error {
  readonly status: number;
  readonly code: number | undefined;
  readonly url: string;

  constructor(
    status: number,
    code: number | undefined,
    url: string,
    message: string,
  ) {
    super(message);
    this.name = "TwilioApiError";
    this.status = status;
    this.code = code;
    this.url = url;
  }
}

export interface TwilioClient {
  get<T = unknown>(url: string): Promise<T>;
}

export function createClient(credentials: Credentials): TwilioClient {
  const token = Buffer.from(
    `${credentials.keySid}:${credentials.keySecret}`,
  ).toString("base64");
  const headers = {
    Authorization: `Basic ${token}`,
    Accept: "application/json",
  };

  async function get<T = unknown>(url: string): Promise<T> {
    const response = await fetch(url, { method: "GET", headers });
    const body: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      const code =
        isRecord(body) && typeof body.code === "number" ? body.code : undefined;
      const message =
        isRecord(body) && typeof body.message === "string"
          ? body.message
          : response.statusText;
      throw new TwilioApiError(response.status, code, url, message);
    }

    return body as T;
  }

  return { get };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
