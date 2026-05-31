import Link from 'next/link';

// Shared sticky top navigation for project pages. Pass optional page-specific
// links (e.g. in-page section anchors) as children; they render before the
// persistent "Back to Ninja Mountain" link.
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/[0.88] backdrop-blur-[14px]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="whitespace-nowrap font-bold tracking-wide transition-colors hover:text-zinc-100"
        >
          NINJA<span className="text-indigo-400">MOUNTAIN</span>.BLACK
        </Link>
        <nav aria-label="Site" className="flex flex-wrap items-center gap-5 text-sm">
          {children}
          <Link href="/" className="text-zinc-400 transition-colors hover:text-zinc-100">
            ← Back to Ninja Mountain
          </Link>
        </nav>
      </div>
    </header>
  );
}
