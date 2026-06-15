'use client';

import { useState } from 'react';
import Link from 'next/link';
import NinjaMark from './NinjaMark';

const NAV = [
  { href: '/projects/onboard', label: 'Dojo'      },
  { href: '/trails',           label: 'Trails'    },
  { href: '/projects/gallery', label: 'Artifacts' },
  { href: '/about',            label: 'About'     },
];

export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[#202431] bg-[#0A0B0F]/90 backdrop-blur-[14px]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-80"
          onClick={() => setOpen(false)}
        >
          <NinjaMark size={38} />
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#C8CCD4]">
            Ninja<span className="text-[#8B6CFF]">Mountain</span>
          </span>
        </Link>

        <nav aria-label="Site" className="flex items-center gap-4 text-sm">
          {children}

          {/* Desktop nav */}
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

          {/* Hamburger — mobile only */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6F7684] transition-colors hover:text-[#E9ECF2] md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="border-t border-[#202431] bg-[#0A0B0F] px-5 pb-5 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1 pt-3">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm text-[#6F7684] transition-colors hover:bg-[#151821] hover:text-[#E9ECF2]"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
