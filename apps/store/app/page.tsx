import OfferCard from "@/app/components/OfferCard";
import { offers } from "@/lib/offers";

export default function Home() {
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

      <section
        aria-label="Membership tiers"
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </section>
    </main>
  );
}