import Link from 'next/link';
import NinjaMark from './NinjaMark';

type FooterLink = { href: string; label: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: 'Navigate',
    links: [
      { href: '/projects/onboard', label: 'Dojo'        },
      { href: '/trails',           label: 'Trails'      },
      { href: '/projects/gallery', label: 'Artifacts'   },
      { href: '/projects/notes',   label: 'Field Notes' },
      { href: '/about',            label: 'About'       },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/projects/notes',    label: 'Field Notes'           },
      { href: 'https://github.com', label: 'GitHub', external: true },
      { href: '/#',                 label: 'Changelog'             },
      { href: '/#',                 label: 'RSS'                   },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/#', label: 'Discord'     },
      { href: '/#', label: 'X (Twitter)' },
      { href: '/#', label: 'YouTube'     },
      { href: '/#', label: 'LinkedIn'    },
    ],
  },
];

function FooterLinkItem({ href, label, external }: FooterLink) {
  const className = 'text-sm text-[#6F7684] transition-colors hover:text-[#E9ECF2]';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#202431] bg-[#0A0B0F]">
      <div className="mx-auto max-w-[1180px] px-5 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2.5">
              <NinjaMark size={36} />
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#C8CCD4]">
                Ninja<span className="text-[#8B6CFF]">Mountain</span>
              </span>
            </div>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-[#6F7684]">
              Build with focus. Ship with purpose. Climb together.
            </p>
            <p className="mt-4 text-sm font-medium text-[#8B6CFF]">ninjamountain.black</p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-[#E9ECF2]">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Built for builders */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[#E9ECF2]">Built for builders.</h3>
            <p className="mb-5 text-sm leading-relaxed text-[#6F7684]">
              Open source. Privacy first. No ads. No noise.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#202431] bg-[#151821] px-4 py-2.5 text-sm font-medium text-[#E9ECF2] transition-colors hover:border-[#8B6CFF]/40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-[#202431] pt-8 text-center text-xs text-[#6F7684]">
          © {new Date().getFullYear()} Ninja Mountain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
