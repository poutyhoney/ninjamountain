import "server-only";

import { GrowthBookClient } from "@growthbook/growthbook";

export type OfferCardLayout = "control" | "cta-first";

export const OFFER_CARD_EXPERIMENT = "offer-card-layout";

let clientPromise: Promise<GrowthBookClient> | undefined;

export function isExperimentEnabled(): boolean {
  return Boolean(
    process.env.GROWTHBOOK_API_HOST && process.env.GROWTHBOOK_CLIENT_KEY,
  );
}

function getClient(): Promise<GrowthBookClient> | undefined {
  const apiHost = process.env.GROWTHBOOK_API_HOST;
  const clientKey = process.env.GROWTHBOOK_CLIENT_KEY;
  if (!apiHost || !clientKey) {
    return undefined;
  }

  if (!clientPromise) {
    const client = new GrowthBookClient({ apiHost, clientKey });
    clientPromise = client.init({ timeout: 2000 }).then(() => client);
  }
  return clientPromise;
}

export async function getOfferCardLayout(
  visitorId: string,
  onExposure: (experimentKey: string, variationId: string) => void,
): Promise<OfferCardLayout> {
  const pending = getClient();
  if (!pending) {
    return "control";
  }

  const client = await pending;
  const value = client.getFeatureValue(OFFER_CARD_EXPERIMENT, "control", {
    attributes: { id: visitorId },
    trackingCallback: (experiment, result) =>
      onExposure(experiment.key, result.key),
  });

  return value === "cta-first" ? "cta-first" : "control";
}
