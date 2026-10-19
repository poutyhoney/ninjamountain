"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { getTierOffers } from "@/lib/contentful";
import { recordEvent } from "@/lib/events";
import { getStripe } from "@/lib/stripe";
import { VISITOR_COOKIE } from "@/lib/visitor";

export async function startCheckout(formData: FormData) {
  const slug = formData.get("slug");
  const offers = await getTierOffers();
  const offer = offers.find((candidate) => candidate.id === slug);

  if (!offer || offer.priceCents === 0) {
    throw new Error("That offer can't be purchased.");
  }

  const visitorId = (await cookies()).get(VISITOR_COOKIE)?.value;
  if (visitorId) {
    after(() =>
      recordEvent("checkout_started", visitorId, {
        offer_id: offer.id,
        price_cents: String(offer.priceCents),
      }),
    );
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    throw new Error("Missing request origin.");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: offer.priceCents,
          recurring: { interval: offer.billingPeriod },
          product_data: { name: `Ninja Mountain Arcade ${offer.name}` },
        },
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(session.url);
}
