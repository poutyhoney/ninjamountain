import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient, TwilioApiError } from "../src/client";
import { listAll } from "../src/paginate";

const credentials = {
  accountSid: `AC${"0".repeat(32)}`,
  keySid: "SKtest",
  keySecret: "secret",
};

function fakeFetch(
  responses: Record<string, { status?: number; body: unknown }>,
) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    const match = responses[url];
    if (!match) throw new Error(`Unexpected URL in test: ${url}`);
    return new Response(JSON.stringify(match.body), {
      status: match.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createClient", () => {
  it("exposes only get", () => {
    const client = createClient(credentials);
    expect(Object.keys(client)).toEqual(["get"]);
  });

  it("sends a GET with Basic auth", async () => {
    const url = "https://studio.twilio.com/v2/Flows";
    const fetchMock = fakeFetch({ [url]: { body: { flows: [] } } });
    vi.stubGlobal("fetch", fetchMock);

    await createClient(credentials).get(url);

    const token = Buffer.from("SKtest:secret").toString("base64");
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: `Basic ${token}` }),
      }),
    );
  });

  it("throws TwilioApiError with the Twilio code", async () => {
    const url = "https://flex-api.twilio.com/v1/Configuration";
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        [url]: {
          status: 401,
          body: { code: 8021, message: "required permission is missing" },
        },
      }),
    );

    const request = createClient(credentials).get(url);

    await expect(request).rejects.toBeInstanceOf(TwilioApiError);
    await expect(request).rejects.toMatchObject({ status: 401, code: 8021 });
  });
});

describe("listAll", () => {
  it("follows meta.next_page_url on v1 and v2 APIs", async () => {
    const first = "https://studio.twilio.com/v2/Flows?PageSize=1";
    const second =
      "https://studio.twilio.com/v2/Flows?PageSize=1&Page=1&PageToken=PTabc";
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        [first]: {
          body: {
            flows: [{ sid: "FW1" }],
            meta: { key: "flows", next_page_url: second },
          },
        },
        [second]: {
          body: {
            flows: [{ sid: "FW2" }],
            meta: { key: "flows", next_page_url: null },
          },
        },
      }),
    );

    const flows = await listAll<{ sid: string }>(
      createClient(credentials),
      first,
      "flows",
    );

    expect(flows.map((flow) => flow.sid)).toEqual(["FW1", "FW2"]);
  });

  it("follows the relative next_page_uri on the 2010 API", async () => {
    const path = `/2010-04-01/Accounts/${credentials.accountSid}/IncomingPhoneNumbers.json`;
    const first = `https://api.twilio.com${path}?PageSize=1`;
    const nextPath = `${path}?PageSize=1&Page=1&PageToken=PAabc`;
    vi.stubGlobal(
      "fetch",
      fakeFetch({
        [first]: {
          body: {
            incoming_phone_numbers: [{ sid: "PN1" }],
            next_page_uri: nextPath,
          },
        },
        [`https://api.twilio.com${nextPath}`]: {
          body: {
            incoming_phone_numbers: [{ sid: "PN2" }],
            next_page_uri: null,
          },
        },
      }),
    );

    const numbers = await listAll<{ sid: string }>(
      createClient(credentials),
      first,
      "incoming_phone_numbers",
    );

    expect(numbers.map((number) => number.sid)).toEqual(["PN1", "PN2"]);
  });
});
