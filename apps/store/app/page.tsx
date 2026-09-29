// The store's home route ("/"): the belt-tier pricing page.
//
// In the App Router, a file named page.tsx inside app/ becomes a route, and
// its default export is the page component. Next wraps it in app/layout.tsx,
// which supplies <html>, <body>, fonts, and global styles.
//
// Data flows one way: Contentful (lib/contentful.ts) -> this page -> OfferCard.
// No dynamic data, so `next build` prerenders this page as static HTML.

import { Suspense } from "react";

import EntitlementsPanel, { EntitlementsSkeleton } from "@/app/components/EntitlementsPanel";
import OfferCard from "@/app/components/OfferCard";
import { getTierOffers } from "@/lib/contentful";

export default async function Home() {
  const apiUrl = process.env.API_URL;
  const offers = await getTierOffers();
  return (
    // `mx-auto` + `max-w-6xl` centers the content with a max width.
    // `px-4` keeps a 16px gutter on phones; `sm:` and `lg:` add more room on
    // larger screens. `flex-1` fills the body's height (body is flex-col).
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
      <header className="flex flex-col gap-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-nm-violet">
          Ninja Mountain Arcade
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">Choose your belt</h1>
        {/* Written without apostrophes on purpose: ESLint's
            react/no-unescaped-entities flags a bare ' in JSX text.
            Use &apos; if you want contractions. */}
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

      {/* Responsive grid, mobile first. `grid-cols-1` applies at every width;
          `lg:grid-cols-3` switches to three columns at 1024px and up.
          Tailwind breakpoints are minimum widths, so style the phone first
          and layer on larger screens. aria-label names the section for
          screen readers, since it has no visible heading. */}
      <section
        aria-label="Membership tiers"
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* The `key` goes on the outermost element returned from .map, here
            the OfferCard itself. offer.id is stable and unique, which makes
            it a better key than the array index. */}
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </section>
    </main>
  );
}
