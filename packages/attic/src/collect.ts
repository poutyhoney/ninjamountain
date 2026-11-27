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

type Raw = Record<string, unknown>;

const FLEX = "https://flex-api.twilio.com/v1";
const CONVERSATIONS = "https://conversations.twilio.com/v1";
const STUDIO = "https://studio.twilio.com/v2";
const PROXY = "https://proxy.twilio.com/v1";

const UNAVAILABLE_CODES = new Set([8021, 70051]);

export async function collect(
  client: TwilioClient,
  ids: { accountSid: string; keySid: string },
): Promise<Snapshot> {
  const core = `https://api.twilio.com/2010-04-01/Accounts/${ids.accountSid}`;

  return {
    schemaVersion: 1,
    collectedAt: new Date().toISOString(),
    accountSid: ids.accountSid,
    keySid: ids.keySid,
    flexConfiguration: await section(async () => {
      const raw = await client.get<Raw>(`${FLEX}/Configuration`);
      return { uiVersion: strOrNull(raw, "ui_version") };
    }),
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

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
  try {
    return { available: true, data: await load() };
  } catch (error) {
    if (error instanceof TwilioApiError && isUnavailable(error)) {
      return {
        available: false,
        reason: `${error.status} code ${error.code ?? "none"}: ${error.message}`,
      };
    }
    throw error;
  }
}

function isUnavailable(error: TwilioApiError): boolean {
  if (error.code !== undefined && UNAVAILABLE_CODES.has(error.code))
    return true;
  return error.status === 403 || error.status === 404;
}

async function loadStudioFlows(client: TwilioClient): Promise<StudioFlow[]> {
  const flows = await listAll<Raw>(
    client,
    `${STUDIO}/Flows?PageSize=50`,
    "flows",
  );
  const result: StudioFlow[] = [];
  for (const flow of flows) {
    const full = await client.get<Raw>(`${STUDIO}/Flows/${str(flow, "sid")}`);
    result.push({
      sid: str(flow, "sid"),
      friendlyName: str(flow, "friendly_name"),
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
      phoneNumberSids: numbers.map((number) => str(number, "sid")),
    });
  }
  return result;
}

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
    enabled: raw.enabled === true,
    channelType: str(raw, "channel_type"),
    contactIdentity: strOrNull(raw, "contact_identity"),
    integrationType: str(raw, "integration_type"),
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

function toStates(definition: unknown): StudioState[] | null {
  if (!isRecord(definition) || !Array.isArray(definition.states)) return null;
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

function str(raw: Raw, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value : "";
}

function strOrNull(raw: Raw, key: string): string | null {
  const value = raw[key];
  return typeof value === "string" && value !== "" ? value : null;
}

function num(raw: Raw, key: string): number {
  const value = raw[key];
  return typeof value === "number" ? value : 0;
}

function obj(raw: Raw, key: string): Raw {
  const value = raw[key];
  return isRecord(value) ? value : {};
}
