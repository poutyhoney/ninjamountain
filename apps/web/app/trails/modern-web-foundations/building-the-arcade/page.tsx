import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import TrainingNotes from "../../../components/TrainingNotes";

// ─── Data ─────────────────────────────────────────────────────────────────────

type CodeLink = { label: string; href: string };
type Topic = { title: string; body: string; links: CodeLink[] };
type Stat = { value: string; label: string };
type Resource = { href: string; title: string; desc: string };

const REPO = "https://github.com/poutyhoney/ninjamountain/blob/main/apps/store";

const STATS: Stat[] = [
  { value: "40", label: "store unit tests (Vitest)" },
  { value: "6", label: "Playwright e2e tests, with axe scans" },
  { value: "0", label: "WCAG 2.2 A/AA violations in CI" },
  { value: "100", label: "Lighthouse Accessibility, live mobile" },
];

const TOPICS: Topic[] = [
  {
    title: "Server components on React 19 and Next 16",
    body: "The pricing page is an async server component: it fetches offers on the server and sends finished HTML. The entitlements panel is its own async server component with a loading skeleton, so a slow API never blocks the offers. Checkout is a server action, so the Stripe secret key never reaches the browser.",
    links: [
      { label: "app/page.tsx", href: `${REPO}/app/page.tsx` },
      {
        label: "EntitlementsPanel.tsx",
        href: `${REPO}/app/components/EntitlementsPanel.tsx`,
      },
      { label: "checkout/actions.ts", href: `${REPO}/app/checkout/actions.ts` },
    ],
  },
  {
    title: "Typed data from Contentful",
    body: "Offers (names, prices, perks, badges) live in Contentful, not in code. One Offer type describes them, and the fetch maps Contentful's response into that type at the edge of the app, so components never see raw CMS data. The page rebuilds every 60 seconds (ISR), so a price change goes live without a deploy.",
    links: [
      { label: "lib/offers.ts", href: `${REPO}/lib/offers.ts` },
      { label: "lib/contentful.ts", href: `${REPO}/lib/contentful.ts` },
    ],
  },
  {
    title: "Testing and accessibility",
    body: "Four layers, each catching what the others miss. Vitest and React Testing Library query by role, so a lost heading fails a test. Storybook runs axe on every component state. Playwright runs the checkout flow and axe on real pages in CI. Then a keyboard pass and a VoiceOver pass, which found three problems the tools passed.",
    links: [
      { label: "e2e/a11y.spec.ts", href: `${REPO}/e2e/a11y.spec.ts` },
      {
        label: "README: Accessibility",
        href: `${REPO}/README.md#accessibility`,
      },
      {
        label: "Storybook",
        href: "https://ninjamountain-storybook.vercel.app/",
      },
    ],
  },
  {
    title: "The streaming UI",
    body: "The Sensei streams a hint from Claude as it's written. The browser calls a store route handler, which adds the API token and passes the stream through from FastAPI unchanged. One abort signal runs through every hop, so Stop really stops the request to Claude instead of just hiding the text.",
    links: [
      {
        label: "SenseiPanel.tsx",
        href: `${REPO}/app/components/SenseiPanel.tsx`,
      },
      { label: "api/sensei/route.ts", href: `${REPO}/app/api/sensei/route.ts` },
      { label: "lib/ndjson.ts", href: `${REPO}/lib/ndjson.ts` },
    ],
  },
];

const RESOURCES: Resource[] = [
  {
    href: "https://ninjamountain-store.vercel.app/",
    title: "The live store",
    desc: "The pricing page and Stripe test-mode checkout",
  },
  {
    href: `${REPO}/README.md`,
    title: "Store README",
    desc: "Architecture diagram, measured results, and known gaps",
  },
  {
    href: `${REPO}/EXPERIMENTS.md`,
    title: "Experiment readout",
    desc: "The CTA-first A/B test: hypothesis, results, decision",
  },
  {
    href: "https://react.dev/reference/rsc/server-components",
    title: "React docs: Server Components",
    desc: "What runs on the server, what ships to the browser, and why",
  },
];

const TRAINING_NOTES = [
  {
    title: "Hard: Stop used two hints",
    body: "Ask and Stop were rendered in the same spot with a ternary, so React reused one button element. A click on Stop landed as a second Ask. Giving each its own key fixed it. Lesson: when two controls swap in place, React needs to know they're different elements.",
  },
  {
    title: "Hard: the tools passed what a screen reader caught",
    body: 'axe found nothing, but VoiceOver read the "Most popular" badge before the belt name, read prices as "slash month," and the focus ring was hard to see on the dark background. Automated checks are a floor, not proof.',
  },
  {
    title: "Differently: write the test with the component",
    body: "Tested components and libs sit at 87 to 100%, but overall line coverage is 64% because pages and server glue lean on e2e. Next time, a small test lands in the same PR as each component, not in a catch-up week.",
  },
  {
    title: "Differently: announce results, not just loading",
    body: "The entitlements panel tells screen readers it's loading, but not when it finishes or fails (WCAG 4.1.3). It's listed as a known gap. A status region designed in from the start would have covered all three states.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const card =
  "rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]";

function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mb-8 max-w-2xl text-[#6F7684]">{intro}</p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Building the Arcade — Modern Web Foundations — Ninja Mountain",
  description:
    "How the Ninja Mountain Arcade store was built: server components, typed CMS data, testing and accessibility, and a streaming UI.",
};

export default function BuildingTheArcadePage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#6F7684]"
        >
          <Link href="/" className="hover:text-[#E9ECF2]">
            Home
          </Link>
          <span>›</span>
          <Link href="/trails" className="hover:text-[#E9ECF2]">
            Trails
          </Link>
          <span>›</span>
          <Link
            href="/trails/modern-web-foundations"
            className="hover:text-[#E9ECF2]"
          >
            Modern Web Foundations
          </Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Building the Arcade</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 3 of 3 · Project case study
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Building the Arcade
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Eight weeks building a real storefront: belt-tier subscriptions,
          Stripe checkout, and a Sensei that streams hints from Claude. Each
          topic below links to the code that does it.
        </p>

        {/* Stats */}
        <section className="py-14">
          <SectionHeader
            title="By the numbers"
            intro="Measured in week 8. The store README lists the command behind each one."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className={card}>
                <p className="text-4xl font-bold text-[#8B6CFF]">{value}</p>
                <p className="mt-2 text-sm text-[#6F7684]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section className="py-14">
          <SectionHeader
            title="What's in it"
            intro="Four parts of the build worth a closer look, with links to the files."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {TOPICS.map(({ title, body, links }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold text-[#E9ECF2]">{title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#6F7684]">
                  {body}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-[#202431] px-3 py-1 font-mono text-xs text-[#8B6CFF] transition-colors hover:border-[#8B6CFF]/40"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="py-14">
          <SectionHeader
            title="Go deeper"
            intro="The live store, the project docs, and the primary source for the trickiest idea here."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {RESOURCES.map(({ href, title, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-[#202431] bg-[#151821] px-5 py-4 transition-colors hover:border-[#8B6CFF]/30"
              >
                <strong className="text-[#E9ECF2]">{title}</strong>
                <small className="mt-1 block text-[#6F7684]">{desc}</small>
              </a>
            ))}
          </div>
        </section>

        {/* Training Notes */}
        <section className="py-14">
          <TrainingNotes notes={TRAINING_NOTES} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
