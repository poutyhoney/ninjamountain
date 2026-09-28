// OfferCard: renders one offer (a belt tier today, add-ons later) as a card.
//
// `app/page.tsx` maps over the `offers` array from `lib/offers.ts` and renders
// one of these per offer. The card only knows about a single `Offer`; it
// doesn't know how many cards exist or how they're laid out.
//
// This is a server component (no "use client" at the top). It renders to HTML
// on the server and sends no JavaScript to the browser, which is fine because
// it has no state or event handlers. The monthly/annual toggle will change that.

// `import type` imports only the type, which is erased at compile time.
// `@/` is the import alias from tsconfig.json and points at apps/store/.
import type { Offer } from "@/lib/offers";

// Typed props: this component takes exactly one prop, `offer`, and it must be
// a complete Offer. Passing anything else fails typecheck.
type OfferCardProps = {
  offer: Offer;
};

// Intl.NumberFormat is the built-in browser/Node API for locale-aware number
// formatting. Created once at module level (not inside the component) so it
// isn't rebuilt on every render.
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Converts cents to a display string. This is the only place cents become
// dollars, so the rest of the code never deals with decimal money.
function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  return priceFormatter.format(priceCents / 100);
}

// Destructuring in the parameter list pulls `offer` out of the props object.
export default function OfferCard({ offer }: OfferCardProps) {
  // Destructure again so the JSX below can say `name` instead of `offer.name`.
  const { name, priceCents, billingPeriod, perks, badge, premium } = offer;
  // Brand rule: violet is the main accent, honey is reserved for premium
  // content (about 80/20 violet to honey).
  const accentText = premium ? "text-nm-honey" : "text-nm-violet";

  return (
    // `relative` makes this the positioning context for the absolutely
    // positioned badge below. `bg-nm-charcoal` and friends exist because
    // globals.css registers the --nm-* colors as Tailwind theme variables.
    <article
      className={`relative flex flex-col gap-6 rounded-2xl border bg-nm-charcoal p-8 ${
        premium ? "border-nm-honey" : "border-nm-slate"
      }`}
    >
      {/* Conditional rendering with &&. Safe here because a missing badge is
          `undefined`, which React renders as nothing. `-top-3` pulls the pill
          up so it sits on the card's top border. */}
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
        {/* `priceCents > 0 &&`, not `priceCents &&`. With a number on the left,
            && returns 0 for the free tier and React renders a stray "0".
            Comparing first gives a real boolean, and React skips `false`. */}
        {priceCents > 0 && (
          <span className="text-nm-silver"> / {billingPeriod}</span>
        )}
      </p>

      <ul className="flex flex-col gap-2 text-nm-silver">
        {/* Rendering a list: each item returned from .map needs a stable,
            unique `key` so React can match items between renders. Perk text
            is unique within one card, so it works as the key. */}
        {perks.map((perk) => (
          <li key={perk} className="flex gap-2">
            {/* aria-hidden: the checkmark is decoration, so screen readers
                skip it and read only the perk text. */}
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
