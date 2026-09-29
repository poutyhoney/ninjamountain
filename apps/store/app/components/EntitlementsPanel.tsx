import { getEntitlements, type Belt } from "@/lib/entitlements";

const BELT_NAMES: Record<Belt, string> = {
  "white-belt": "White Belt",
  "brown-belt": "Brown Belt",
  "black-belt": "Black Belt",
};

type EntitlementsPanelProps = {
  apiUrl: string;
};

export default async function EntitlementsPanel({ apiUrl }: EntitlementsPanelProps) {
  const result = await getEntitlements(apiUrl);

  if (!result.ok) {
    return (
      <section
        aria-label="Your training"
        className="rounded-2xl border border-nm-slate bg-nm-charcoal p-6 text-nm-silver"
      >
        Your training progress is unavailable right now. {result.error}
      </section>
    );
  }

  const { belt, unlocked_grounds, owned_addons } = result.data;
  const groundsLabel = unlocked_grounds.length === 1 ? "training ground" : "training grounds";
  const addonsLabel = owned_addons.length === 1 ? "add-on" : "add-ons";

  return (
    <section
      aria-label="Your training"
      className="flex flex-col gap-2 rounded-2xl border border-nm-slate bg-nm-charcoal p-6"
    >
      <h2 className="text-lg font-semibold">
        You are a <span className="text-nm-violet">{BELT_NAMES[belt]}</span>
      </h2>
      <p className="text-nm-silver">
        {unlocked_grounds.length} {groundsLabel} unlocked, {owned_addons.length} {addonsLabel} owned
      </p>
    </section>
  );
}

export function EntitlementsSkeleton() {
  return (
    <div
      role="status"
      className="h-24 animate-pulse rounded-2xl border border-nm-slate bg-nm-charcoal"
    >
      <span className="sr-only">Loading your training progress</span>
    </div>
  );
}