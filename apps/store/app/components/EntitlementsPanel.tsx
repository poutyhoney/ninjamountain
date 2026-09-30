import { getEntitlements } from "@/lib/entitlements";

import EntitlementsSummary from "./EntitlementsSummary";

type EntitlementsPanelProps = {
  apiUrl: string;
};

export default async function EntitlementsPanel({ apiUrl }: EntitlementsPanelProps) {
  const result = await getEntitlements(apiUrl);
  return <EntitlementsSummary result={result} />;
}