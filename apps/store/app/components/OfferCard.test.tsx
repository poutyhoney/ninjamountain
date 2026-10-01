import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Offer } from "@/lib/offers";

import OfferCard from "./OfferCard";

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "brown-belt",
    name: "Brown Belt",
    priceCents: 699,
    billingPeriod: "month",
    perks: ["Unlimited challenges"],
    ...overrides,
  };
}

describe("OfferCard", () => {
  it("shows the name as a heading, the price, and the perks", () => {
    render(<OfferCard offer={makeOffer()} />);

    expect(screen.getByRole("heading", { name: "Brown Belt" })).toBeInTheDocument();
    expect(screen.getByText("$6.99")).toBeInTheDocument();
    expect(screen.getByText("Unlimited challenges")).toBeInTheDocument();
  });

  it("shows the badge when the offer has one", () => {
    render(<OfferCard offer={makeOffer({ badge: "Most popular" })} />);

    expect(screen.getByText("Most popular")).toBeInTheDocument();
  });

  it("shows no badge when the offer has none", () => {
    render(<OfferCard offer={makeOffer()} />);

    expect(screen.queryByText("Most popular")).not.toBeInTheDocument();
  });
});