import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import SenseiPanel from "@/app/components/SenseiPanel";
import { getChallenges } from "@/lib/sensei";

export const metadata: Metadata = {
  title: "Ask the Sensei | Ninja Mountain Arcade",
};

export default async function SenseiPage() {
  await connection();
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    notFound();
  }

  const result = await getChallenges(apiUrl);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-nm-violet">
          Back to the store
        </Link>
        <h1 className="text-4xl font-bold">The Sensei</h1>
        <p className="text-nm-silver">
          Stuck on a challenge? The Sensei gives hints, never answers.
        </p>
      </header>

      {result.ok ? (
        <SenseiPanel challenges={result.data} />
      ) : (
        <p className="rounded-2xl border border-nm-slate bg-nm-charcoal p-6 text-nm-silver">
          The Sensei is unavailable right now. {result.error}
        </p>
      )}
    </main>
  );
}
