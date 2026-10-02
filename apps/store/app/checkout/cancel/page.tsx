import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout canceled | Ninja Mountain Arcade",
};

export default function CancelPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">Checkout canceled</h1>
      <p className="text-nm-silver">No charge was made. Your belt is waiting when you are ready.</p>
      <Link
        href="/"
        className="rounded-full bg-nm-violet px-6 py-2 font-semibold text-nm-obsidian"
      >
        Back to the store
      </Link>
    </main>
  );
}