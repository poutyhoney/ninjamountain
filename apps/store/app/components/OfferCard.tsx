import type { Offer } from "@/lib/offers";

type OfferCardProps = {
  offer: Offer;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  return priceFormatter.format(priceCents / 100);
}

export default function OfferCard({ offer }: OfferCardProps) {
  const { name, priceCents, billingPeriod, perks, badge, premium } = offer;
  const accentText = premium ? "text-nm-honey" : "text-nm-violet";

  return (
    <article
      className={`relative flex flex-col gap-6 rounded-2xl border bg-nm-charcoal p-8 ${
        premium ? "border-nm-honey" : "border-nm-slate"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-8 rounded-full bg-nm-honey px-3 py-1 text-xs font-semibold text-nm-obsidian">
          {badge}
        </span>
      )}

      <h2 className={`text-xl font-semibold ${premium ? "text-nm-honey" : ""}`}>
        {name}
      </h2>

      <p>
        <span className="text-4xl font-bold">{formatPrice(priceCents)}</span>
        {priceCents > 0 && (
          <span className="text-nm-silver"> / {billingPeriod}</span>
        )}
      </p>

      <ul className="flex flex-col gap-2 text-nm-silver">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-2">
            <span aria-hidden="true" className={accentText}>
              ✓
            </span>
            {perk}
          </li>
        ))}
      </ul>
    </article>
  );
}