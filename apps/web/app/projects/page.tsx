import Link from "next/link";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
  title: "Projects",
  description: "Everything built on Ninja Mountain, and what each project demonstrates.",
};

const REPO = "https://github.com/poutyhoney/ninjamountain";

type ProjectLink = { label: string; href: string; external?: boolean };

type Project = {
  name: string;
  summary: string;
  shows: string[];
  links: ProjectLink[];
};

const FEATURED: Project = {
  name: "Support Triage Assistant",
  summary:
    "Classifies support tickets with an LLM: category, severity, summary, first response, escalation. Built in five stages, from one model call to a scored comparison of Anthropic and OpenAI.",
  shows: [
    "LLM evaluation against hand-labeled data",
    "Retrieval-augmented generation (RAG)",
    "Tool-using agents and an MCP server",
    "A provider-agnostic adapter, Claude vs GPT",
    "A static Next.js results dashboard",
  ],
  links: [
    { label: "Try it", href: "/projects/triage" },
    { label: "How it was built", href: "/projects/triage/story" },
    { label: "Compare the models", href: "/projects/triage/runs/compare" },
  ],
};

const PROJECTS: Project[] = [
  {
    name: "Ninja Mountain Arcade",
    summary:
      "A subscription storefront where training challenges are sold as belt tiers. The web UI ramp-up project, built in its own Next.js app.",
    shows: [
      "Component design documented in Storybook",
      "Accessibility checks with axe",
      "Unit tests with coverage, Playwright end-to-end tests",
    ],
    links: [
      { label: "Live store", href: "https://ninjamountain-store.vercel.app/", external: true },
      { label: "Storybook", href: "https://ninjamountain-storybook.vercel.app", external: true },
    ],
  },
  {
    name: "This site's delivery pipeline",
    summary:
      "Every change goes through a pull request. CI must pass before merge, and merging to main deploys to production.",
    shows: [
      "GitHub Actions and GitLab CI for the same monorepo",
      "A Semgrep static analysis scan on every PR",
      "Vercel preview deploys posted back to the PR",
    ],
    links: [
      { label: "CI workflow", href: `${REPO}/blob/main/.github/workflows/ci.yml`, external: true },
      { label: "Repository", href: REPO, external: true },
    ],
  },
  {
    name: "APIs for TSEs",
    summary:
      "A field guide for diagnosing API integrations, communicating during incidents, and earning customer trust as a support engineer.",
    shows: ["Support engineering practice", "Structured troubleshooting"],
    links: [{ label: "Open the guide", href: "/projects/onboard" }],
  },
  {
    name: "Photo Dojo",
    summary: "An image gallery experiment, the start of a photo upload feature.",
    shows: ["next/image layout and sizing", "Serving static assets"],
    links: [{ label: "View the gallery", href: "/projects/gallery" }],
  },
  {
    name: "Field Notes",
    summary: "A running log of what each build taught, written as it happened.",
    shows: ["Learning in public"],
    links: [{ label: "Read the notes", href: "/projects/notes" }],
  },
];

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
      {links.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            className="text-[#8B6CFF] underline-offset-4 hover:underline"
          >
            {link.label} ↗
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className="text-[#8B6CFF] underline-offset-4 hover:underline"
          >
            {link.label} →
          </Link>
        )
      )}
    </div>
  );
}

function Shows({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-[#202431] px-3 py-1 text-xs text-[#C8CCD4]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">Projects</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">What I&rsquo;ve built</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6F7684]">
          Each project is small, working, and shipped through the same pipeline. Each one lists
          what it demonstrates and links to the proof.
        </p>

        <section className="mt-12 rounded-2xl border border-[#8B6CFF]/40 bg-[#151821] p-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
            Featured project
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{FEATURED.name}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#C8CCD4]">{FEATURED.summary}</p>
          <Shows items={FEATURED.shows} />
          <ProjectLinks links={FEATURED.links} />
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <section
              key={project.name}
              className="rounded-2xl border border-[#202431] bg-[#151821] p-6"
            >
              <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6F7684]">{project.summary}</p>
              <Shows items={project.shows} />
              <ProjectLinks links={project.links} />
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
