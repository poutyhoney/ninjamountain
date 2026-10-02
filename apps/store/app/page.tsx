import { Suspense } from "react";

import CheckoutButton from "@/app/components/CheckoutButton";
import EntitlementsPanel from "@/app/components/EntitlementsPanel";
import { EntitlementsSkeleton } from "@/app/components/EntitlementsSummary";
import OfferCard from "@/app/components/OfferCard";
import { getTierOffers } from "@/lib/contentful";

export default async function Home() {
  const apiUrl = process.env.API_URL;
  const offers = await getTierOffers();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
      <header className="flex flex-col gap-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-nm-violet">
          Ninja Mountain Arcade
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">Choose your belt</h1>
        <p className="mx-auto max-w-xl text-nm-silver">
          Train across the training grounds of the mountain. Start free and
          level up when you are ready.
        </p>
      </header>

      {apiUrl && (
        <Suspense fallback={<EntitlementsSkeleton />}>
          <EntitlementsPanel apiUrl={apiUrl} />
        </Suspense>
      )}

      <section
        aria-label="Membership tiers"
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            action={<CheckoutButton offer={offer} />}
          />
        ))}
      </section>
    </main>
  );
}