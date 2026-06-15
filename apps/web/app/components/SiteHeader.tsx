import Link from 'next/link';
import NinjaMark from './NinjaMark';

const NAV = [
  { href: '/projects/onboard', label: 'Dojo'      },
  { href: '/trails',           label: 'Trails'    },
  { href: '/projects/gallery', label: 'Artifacts' },
  { href: '/about',            label: 'About'     },
];

// Sticky top nav shared across the site.
// Pass optional page-specific links (e.g. in-page anchors) as children;
// they render before the persistent site nav.
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#202431] bg-[#0A0B0F]/90 backdrop-blur-[14px]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-80"
        >
          <NinjaMark size={38} />
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#C8CCD4]">
            Ninja<span className="text-[#8B6CFF]">Mountain</span>
          </span>
        </Link>

        <nav aria-label="Site" className="flex flex-wrap items-center gap-6 text-sm">
          {children}
          <span className="hidden items-center gap-6 md:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[#6F7684] transition-colors hover:text-[#E9ECF2]"
              >
                {label}
              </Link>
            ))}
          </span>
          <Link
            href="/projects/onboard"
            className="rounded-full bg-[#8B6CFF] px-4 py-2 text-sm font-semibold text-[#0A0B0F] transition hover:-translate-y-px hover:bg-[#B7A7FF]"
          >
            Start the Climb
          </Link>
        </nav>
      </div>
    </header>
  );
}
