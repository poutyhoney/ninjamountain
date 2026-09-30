import type { BillingPeriod } from "@/lib/offers";

type PriceTagProps = {
  priceCents: number;
  billingPeriod: BillingPeriod;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  return priceFormatter.format(priceCents / 100);
}

export default function PriceTag({ priceCents, billingPeriod }: PriceTagProps) {
  return (
    <p>
      <span className="text-4xl font-bold">{formatPrice(priceCents)}</span>
      {priceCents > 0 && (
        <span className="text-nm-silver"> / {billingPeriod}</span>
      )}
    </p>
  );
}