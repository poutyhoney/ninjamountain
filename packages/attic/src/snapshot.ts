// The data model: everything the auditor knows about one account.
//
// collect.ts fills a Snapshot from the live API. Fixtures and
// --from-snapshot files are the same shape saved as JSON. Rules only ever see
// a Snapshot, never the API, which is what makes them pure functions that can
// be tested offline. Field names are camelCase versions of Twilio's
// snake_case, cut down to what the rules use.

// A discriminated union. `available` is the discriminant: checking it narrows
// the type, so `data` can only be read after `available` is known to be true,
// and `reason` only when it's false. This is how the tool records "this key
// couldn't read that endpoint" instead of crashing or pretending the list was
// empty.
export type Section<T> =
  | { available: true; data: T }
  | { available: false; reason: string };

export interface FlexConfiguration {
  // ui_version, such as "2.18.0" or "~2.18.0". Null when the field was
  // missing. majorVersion() in flex-version.ts turns it into a number.
  uiVersion: string | null;
}

export interface PhoneNumber {
  sid: string;
  // E.164 format, such as +12025550100.
  phoneNumber: string;
  friendlyName: string;
  // Null when unset. collect.ts turns Twilio's empty string "" into null so
  // rules only have one "no URL" case to check.
  smsUrl: string | null;
  smsApplicationSid: string | null;
  voiceUrl: string | null;
}

// The Flex UI 1.x way of routing a channel into Flex. On 2.x, Conversations
// Addresses replace these, which is what rule R2 looks for.
export interface FlexFlow {
  sid: string;
  friendlyName: string;
  enabled: boolean;
  channelType: string;
  // The sender this flow handles, such as a phone number. R2 compares it to
  // Address values.
  contactIdentity: string | null;
  integrationType: string;
  studioFlowSid: string | null;
}

// The Flex UI 2.x way: a sender (number, WhatsApp, chat) that creates a
// Conversation and, through autoCreation, hands it to a Studio flow.
export interface ConversationsAddress {
  sid: string;
  friendlyName: string | null;
  type: string;
  address: string;
  // A nested object type. R3 and R4 follow studioFlowSid to the flow that
  // should create the Flex task.
  autoCreation: {
    enabled: boolean;
    type: string | null;
    studioFlowSid: string | null;
  };
}

// One output of a Studio widget, such as the Trigger's
// "incomingConversationMessage". next is the widget it connects to, or null
// when nothing is connected (the root cause R4 catches).
export interface StudioTransition {
  event: string;
  next: string | null;
}

export interface StudioState {
  name: string;
  type: string;
  transitions: StudioTransition[];
}

export interface StudioFlow {
  sid: string;
  friendlyName: string;
  // A union of string literals: TypeScript rejects any other status value.
  status: "draft" | "published";
  revision: number;
  // The flow definition's widgets. Null when the definition couldn't be
  // fetched, so R4 can say "couldn't check" instead of guessing.
  states: StudioState[] | null;
}

export interface TwimlApp {
  sid: string;
  friendlyName: string;
  voiceUrl: string | null;
  smsUrl: string | null;
  statusCallback: string | null;
}

export interface ProxyService {
  sid: string;
  uniqueName: string;
  // The PN SIDs in this service's number pool. R1 checks membership.
  phoneNumberSids: string[];
}

export interface Snapshot {
  // A literal type, not number. Saved files carry it so a future format
  // change can be detected (cli.ts rejects anything that isn't 1).
  schemaVersion: 1;
  // ISO 8601 timestamp of the collection.
  collectedAt: string;
  accountSid: string;
  // The key SID only, never the secret, so a saved snapshot holds no
  // credentials.
  keySid: string;
  // Each section is collected and reported independently. A Restricted key
  // typically gets flexConfiguration and flexFlows as unavailable and
  // everything else as available.
  flexConfiguration: Section<FlexConfiguration>;
  phoneNumbers: Section<PhoneNumber[]>;
  flexFlows: Section<FlexFlow[]>;
  addresses: Section<ConversationsAddress[]>;
  studioFlows: Section<StudioFlow[]>;
  twimlApps: Section<TwimlApp[]>;
  proxyServices: Section<ProxyService[]>;
}
