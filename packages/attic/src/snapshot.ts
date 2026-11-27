export type Section<T> =
  | { available: true; data: T }
  | { available: false; reason: string };

export interface FlexConfiguration {
  uiVersion: string | null;
}

export interface PhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  smsUrl: string | null;
  smsApplicationSid: string | null;
  voiceUrl: string | null;
}

export interface FlexFlow {
  sid: string;
  friendlyName: string;
  enabled: boolean;
  channelType: string;
  contactIdentity: string | null;
  integrationType: string;
  studioFlowSid: string | null;
}

export interface ConversationsAddress {
  sid: string;
  friendlyName: string | null;
  type: string;
  address: string;
  autoCreation: {
    enabled: boolean;
    type: string | null;
    studioFlowSid: string | null;
  };
}

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
  status: "draft" | "published";
  revision: number;
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
  phoneNumberSids: string[];
}

export interface Snapshot {
  schemaVersion: 1;
  collectedAt: string;
  accountSid: string;
  keySid: string;
  flexConfiguration: Section<FlexConfiguration>;
  phoneNumbers: Section<PhoneNumber[]>;
  flexFlows: Section<FlexFlow[]>;
  addresses: Section<ConversationsAddress[]>;
  studioFlows: Section<StudioFlow[]>;
  twimlApps: Section<TwimlApp[]>;
  proxyServices: Section<ProxyService[]>;
}
