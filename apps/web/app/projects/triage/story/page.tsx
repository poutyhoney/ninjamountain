import Link from "next/link";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { pct } from "@/lib/format";
import { latestRunPerProvider } from "@/lib/triage-runs";

import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata = {
  title: "How the Triage Assistant Was Built",
  description:
    "Five stages, from one model call to a scored comparison of two LLM providers, and how each stage was proven.",
};

const REPO = "https://github.com/poutyhoney/ninjamountain";

type Stage = {
  tag: string;
  title: string;
  added: string;
  proof: string;
  link: { label: string; href: string };
};

const STAGES: Stage[] = [
  {
    tag: "v1",
    title: "Baseline with a scored eval",
    added:
      "One model call that returns typed JSON: category, severity, summary, first response, escalate. API errors retry with backoff. Malformed output gets re-prompted with a correction. The pipeline never throws.",
    proof:
      "A scorer against 20 hand-labeled tickets. Pinning temperature to 0 made the scores drop, which showed the earlier numbers were partly luck. After fixing the rubric and two wrong labels: 90% category, 90% severity exact.",
    link: {
      label: "Code at triage-v1",
      href: `${REPO}/tree/triage-v1/packages/triage`,
    },
  },
  {
    tag: "v2",
    title: "Grounded in a knowledge base (RAG)",
    added:
      "15 support articles embedded with Voyage. Each ticket retrieves its top 3 by cosine similarity, and the model returns the ids of the articles it actually used.",
    proof:
      "The same 5 tickets with and without retrieval, read side by side. Retrieval helped on 3, including fixing 2 confident factual errors (an SSO detail and the wrong product's error codes). It was neutral on 2 and never made an answer worse.",
    link: {
      label: "Code at triage-v2",
      href: `${REPO}/tree/triage-v2/packages/triage`,
    },
  },
  {
    tag: "v3",
    title: "A tool-using agent",
    added:
      "The model decides which tools to call: KB search, account lookup, ticket history, escalation. A loop runs the calls and feeds results back, capped at 6 turns. Every call is logged.",
    proof:
      "The exit paths were tested, not just the happy path. Forcing the cap to 1 produced a clean max_iterations failure with the tool log intact: no hang, no crash.",
    link: {
      label: "Code at triage-v3",
      href: `${REPO}/tree/triage-v3/packages/triage`,
    },
  },
  {
    tag: "v4",
    title: "Tools behind a real MCP server",
    added:
      "The account, history and escalation tools moved behind a Model Context Protocol server over stdio. The agent discovers them at runtime instead of hardcoding them.",
    proof:
      "The server was verified alone in the MCP Inspector before the agent touched it. The first live run through MCP filed the project's first real escalation.",
    link: {
      label: "Code at triage-v4",
      href: `${REPO}/tree/triage-v4/packages/triage`,
    },
  },
  {
    tag: "v5",
    title: "Anthropic vs OpenAI, side by side",
    added:
      "An interface in front of the model with one adapter per vendor, so the pipeline does not know which model it calls. Both get a byte-identical prompt. Every scored run is saved and browsable.",
    proof:
      "Saved runs on 22 labeled tickets, compared ticket by ticket in a static dashboard, with a prompt hash so runs that used different prompts are never compared by accident.",
    link: {
      label: "Code at triage-v5",
      href: `${REPO}/tree/triage-v5/packages/triage`,
    },
  },
];

export default function TriageStoryPage() {
  const latestRuns = latestRunPerProvider();

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Support Triage", href: "/projects/triage" },
            { label: "How it was built" },
          ]}
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          How it was built
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          From one model call to a model comparison
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#6F7684]">
          Five stages, each one working and runnable on its own. No stage
          counted as done because the types compiled. Each one had to pass a
          real test outside the code first.
        </p>

        <ol className="mt-12 space-y-10 border-l border-[#202431] pl-8">
          {STAGES.map((stage) => (
            <li key={stage.tag} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-[#8B6CFF] bg-[#0A0B0F]"
              />
              <p className="font-mono text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
                {stage.tag}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {stage.title}
              </h2>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#6F7684]">
                    What it added
                  </dt>
                  <dd className="mt-1 text-[#C8CCD4]">{stage.added}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#6F7684]">
                    How it was proven
                  </dt>
                  <dd className="mt-1 text-[#C8CCD4]">{stage.proof}</dd>
                </div>
              </dl>
              <a
                href={stage.link.href}
                className="mt-3 inline-block text-sm font-semibold text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                {stage.link.label} ↗
              </a>
            </li>
          ))}
        </ol>

        {latestRuns.length > 0 && (
          <section className="mt-16 rounded-2xl border border-[#202431] bg-[#151821] p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Where it stands
            </h2>
            <p className="mt-3 leading-relaxed text-[#6F7684]">
              Latest category accuracy on {latestRuns[0].summary.scored} labeled
              tickets, same prompt for both models:
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {latestRuns.map((run) => (
                <div
                  key={run.runId}
                  className="rounded-xl border border-[#202431] bg-[#0A0B0F] p-4"
                >
                  <dt className="text-sm text-[#6F7684]">
                    {run.provider} · {run.model}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {pct(run.summary.catAccuracy)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-[#6F7684]">
              The honest caveat: the prompt was tuned on Claude, so part of the
              gap is the prompt, not the model. And when both models give the
              same wrong answer, the gold label is the first suspect.
            </p>
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            See it for yourself
          </h2>
          <ul className="mt-6 space-y-3 text-sm font-semibold">
            <li>
              <Link
                href="/projects/triage"
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                Try the triage assistant →
              </Link>
            </li>
            <li>
              <Link
                href="/projects/triage/runs/compare"
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                Compare the two models ticket by ticket →
              </Link>
            </li>
            <li>
              <a
                href={`${REPO}/blob/main/packages/triage/LEARNINGS.md`}
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                Read the full build log (LEARNINGS.md) ↗
              </a>
            </li>
            <li>
              <a
                href={`${REPO}/tree/main/packages/triage`}
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                Browse the source ↗
              </a>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
