// Reads one account through the read-only client and builds a Snapshot.
//
// This is the only file that knows Twilio's raw JSON shapes. It turns
// snake_case API fields into the camelCase types in snapshot.ts, so rules
// never see raw API data. cli.ts calls collect() for live runs. Each section
// is wrapped by section(), so one endpoint the key can't read becomes
// "unavailable" instead of failing the whole scan.
import { TwilioApiError, isRecord, type TwilioClient } from "./client";
import { listAll } from "./paginate";
import type {
  ConversationsAddress,
  FlexFlow,
  PhoneNumber,
  ProxyService,
  Section,
  Snapshot,
  StudioFlow,
  StudioState,
  TwimlApp,
} from "./snapshot";

// A type alias for "a JSON object we haven't checked yet". Shorter to read
// than the full Record type in every mapper signature.
type Raw = Record<string, unknown>;

// Each Twilio product has its own host and API version.
const FLEX = "https://flex-api.twilio.com/v1";
const CONVERSATIONS = "https://conversations.twilio.com/v1";
const STUDIO = "https://studio.twilio.com/v2";
const PROXY = "https://proxy.twilio.com/v1";

// Twilio error codes that mean "this key can't read this endpoint", found by
// running scripts/probe.ts with a Restricted key:
// - 8021: the key is missing a permission. Twilio returns this as HTTP 401,
//   not 403.
// - 70051: the endpoint isn't available to Restricted keys at all.
// A Set gives a quick has() check.
const UNAVAILABLE_CODES = new Set([8021, 70051]);

export async function collect(
  client: TwilioClient,
  ids: { accountSid: string; keySid: string },
): Promise<Snapshot> {
  // The 2010 API puts the account SID in the path. The newer APIs don't.
  const core = `https://api.twilio.com/2010-04-01/Accounts/${ids.accountSid}`;

  // Sections load one after another (each `await` finishes before the next
  // starts). That keeps the request rate low and the order of errors
  // predictable. Promise.all could run them in parallel if speed ever
  // mattered.
  return {
    schemaVersion: 1,
    collectedAt: new Date().toISOString(),
    accountSid: ids.accountSid,
    keySid: ids.keySid,
    flexConfiguration: await section(async () => {
      // A single object, not a list, so no pagination.
      const raw = await client.get<Raw>(`${FLEX}/Configuration`);
      return { uiVersion: strOrNull(raw, "ui_version") };
    }),
    // PageSize is the largest each API allows, so most accounts fit in one
    // request per list.
    phoneNumbers: await section(async () =>
      (
        await listAll<Raw>(
          client,
          `${core}/IncomingPhoneNumbers.json?PageSize=100`,
          "incoming_phone_numbers",
        )
      ).map(toPhoneNumber),
    ),
    flexFlows: await section(async () =>
      (
        await listAll<Raw>(
          client,
          `${FLEX}/FlexFlows?PageSize=50`,
          "flex_flows",
        )
      ).map(toFlexFlow),
    ),
    addresses: await section(async () =>
      (
        await listAll<Raw>(
          client,
          `${CONVERSATIONS}/Configuration/Addresses?PageSize=50`,
          "address_configurations",
        )
      ).map(toAddress),
    ),
    studioFlows: await section(() => loadStudioFlows(client)),
    twimlApps: await section(async () =>
      (
        await listAll<Raw>(
          client,
          `${core}/Applications.json?PageSize=100`,
          "applications",
        )
      ).map(toTwimlApp),
    ),
    proxyServices: await section(() => loadProxyServices(client)),
  };
}

// Wraps one section's loading. `load` is a callback (a function passed in),
// so section() can run it inside its own try/catch. Generic over T, the
// section's data type, so the returned Section<T> matches each field of
// Snapshot.
async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
  try {
    return { available: true, data: await load() };
  } catch (error) {
    // instanceof narrows error from unknown to TwilioApiError, so status and
    // code can be read.
    if (error instanceof TwilioApiError && isUnavailable(error)) {
      return {
        available: false,
        // This string ends up in the report's SKIPPED section. ?? (nullish
        // coalescing) fills in "none" when Twilio sent no code.
        reason: `${error.status} code ${error.code ?? "none"}: ${error.message}`,
      };
    }
    // Anything else stops the scan. Bad credentials (20003) or a network
    // failure would make every section fail, so reporting them all as
    // "skipped" would hide the real problem.
    throw error;
  }
}

function isUnavailable(error: TwilioApiError): boolean {
  if (error.code !== undefined && UNAVAILABLE_CODES.has(error.code))
    return true;
  // 403: the product isn't enabled on the account. 404: the resource doesn't
  // exist, such as the Flex Configuration on an account without Flex.
  return error.status === 403 || error.status === 404;
}

async function loadStudioFlows(client: TwilioClient): Promise<StudioFlow[]> {
  // The list endpoint has no flow definitions, only summaries.
  const flows = await listAll<Raw>(
    client,
    `${STUDIO}/Flows?PageSize=50`,
    "flows",
  );
  const result: StudioFlow[] = [];
  // One extra request per flow to get its definition (the widgets and their
  // transitions). R4 needs that. A for...of loop keeps the requests
  // sequential. This is also why a Restricted key needs both the Studio list
  // and read permissions.
  for (const flow of flows) {
    const full = await client.get<Raw>(`${STUDIO}/Flows/${str(flow, "sid")}`);
    result.push({
      sid: str(flow, "sid"),
      friendlyName: str(flow, "friendly_name"),
      // Squeezes any value into the "draft" | "published" union. Anything
      // that isn't "published" is treated as a draft, the safer reading for
      // R3 and R10.
      status: flow.status === "published" ? "published" : "draft",
      revision: num(flow, "revision"),
      states: toStates(full.definition),
    });
  }
  return result;
}

async function loadProxyServices(
  client: TwilioClient,
): Promise<ProxyService[]> {
  const services = await listAll<Raw>(
    client,
    `${PROXY}/Services?PageSize=50`,
    "services",
  );
  const result: ProxyService[] = [];
  // A nested list: each service has its own pool of numbers. R1 uses the
  // pool to find numbers that are still in Proxy even after their SMS URL
  // was cleared.
  for (const service of services) {
    const sid = str(service, "sid");
    const numbers = await listAll<Raw>(
      client,
      `${PROXY}/Services/${sid}/PhoneNumbers?PageSize=50`,
      "phone_numbers",
    );
    result.push({
      sid,
      uniqueName: str(service, "unique_name"),
      // A Proxy phone number's sid is the same PN SID as the incoming number,
      // so R1 can match pool members to phoneNumbers directly.
      phoneNumberSids: numbers.map((number) => str(number, "sid")),
    });
  }
  return result;
}

// The mappers below each turn one raw API item into a typed object. Every
// field goes through a reader (str, strOrNull, num, obj), so a missing or
// odd value becomes a safe default instead of undefined leaking into the
// rules.

function toPhoneNumber(raw: Raw): PhoneNumber {
  return {
    sid: str(raw, "sid"),
    phoneNumber: str(raw, "phone_number"),
    friendlyName: str(raw, "friendly_name"),
    smsUrl: strOrNull(raw, "sms_url"),
    smsApplicationSid: strOrNull(raw, "sms_application_sid"),
    voiceUrl: strOrNull(raw, "voice_url"),
  };
}

function toFlexFlow(raw: Raw): FlexFlow {
  return {
    sid: str(raw, "sid"),
    friendlyName: str(raw, "friendly_name"),
    // === true, not a truthy check, so only a real boolean true counts.
    enabled: raw.enabled === true,
    channelType: str(raw, "channel_type"),
    contactIdentity: strOrNull(raw, "contact_identity"),
    integrationType: str(raw, "integration_type"),
    // The Studio flow lives one level down, in integration.flow_sid. obj()
    // returns {} when integration is missing, so the lookup can't throw.
    studioFlowSid: strOrNull(obj(raw, "integration"), "flow_sid"),
  };
}

function toAddress(raw: Raw): ConversationsAddress {
  const autoCreation = obj(raw, "auto_creation");
  return {
    sid: str(raw, "sid"),
    friendlyName: strOrNull(raw, "friendly_name"),
    type: str(raw, "type"),
    address: str(raw, "address"),
    autoCreation: {
      enabled: autoCreation.enabled === true,
      type: strOrNull(autoCreation, "type"),
      studioFlowSid: strOrNull(autoCreation, "studio_flow_sid"),
    },
  };
}

function toTwimlApp(raw: Raw): TwimlApp {
  return {
    sid: str(raw, "sid"),
    friendlyName: str(raw, "friendly_name"),
    voiceUrl: strOrNull(raw, "voice_url"),
    smsUrl: strOrNull(raw, "sms_url"),
    statusCallback: strOrNull(raw, "status_callback"),
  };
}

// Pulls the widgets out of a Studio flow definition. Returns null (not [])
// when the definition is missing, so "couldn't read the flow" stays
// different from "the flow has no widgets".
function toStates(definition: unknown): StudioState[] | null {
  if (!isRecord(definition) || !Array.isArray(definition.states)) return null;
  // filter(isRecord) uses the type predicate as a filter: the result is
  // typed as an array of records, so the map can read their fields.
  return definition.states.filter(isRecord).map((state) => ({
    name: str(state, "name"),
    type: str(state, "type"),
    transitions: Array.isArray(state.transitions)
      ? state.transitions.filter(isRecord).map((transition) => ({
          event: str(transition, "event"),
          next: strOrNull(transition, "next"),
        }))
      : [],
  }));
}

// Small readers that check a field's runtime type before using it. The API
// response is unknown at compile time, so these are where the runtime checks
// happen.

// For fields that are always present, such as sid. Falls back to "".
function str(raw: Raw, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value : "";
}

// For optional fields. Twilio often sends "" for "not set", so both "" and a
// missing value become null. Rules then check for null only.
function strOrNull(raw: Raw, key: string): string | null {
  const value = raw[key];
  return typeof value === "string" && value !== "" ? value : null;
}

function num(raw: Raw, key: string): number {
  const value = raw[key];
  return typeof value === "number" ? value : 0;
}

// For nested objects. An empty object is a safe stand-in: reading any field
// from it gives undefined, which the other readers turn into defaults.
function obj(raw: Raw, key: string): Raw {
  const value = raw[key];
  return isRecord(value) ? value : {};
}
