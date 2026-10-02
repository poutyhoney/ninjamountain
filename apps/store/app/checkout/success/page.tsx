import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Welcome to the dojo | Ninja Mountain Arcade",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

async function findSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const session = typeof sessionId === "string" ? await findSession(sessionId) : null;

  if (!session || session.status !== "complete") {
    redirect("/");
  }

  const email = session.customer_details?.email;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">Welcome to the dojo</h1>
      <p className="text-nm-silver">
        Your subscription is active.
        {email && ` A receipt is on its way to ${email}.`}
      </p>
      <Link
        href="/"
        className="rounded-full bg-nm-violet px-6 py-2 font-semibold text-nm-obsidian"
      >
        Back to the store
      </Link>
    </main>
  );
}