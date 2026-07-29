'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

type Trail = {
  title: string;
  body: string;
  category: string;
  difficulty: Difficulty;
  lessons: number;
  progress: number; // 0–100
  href?: string;
};

const TRAILS: Trail[] = [
  {
    title: 'TSE Onboarding',
    body: 'HTTP, auth, events, incidents, AI as a force multiplier, support tooling, live demos, and enterprise identity — the field skills for supporting API products.',
    category: 'Support',
    difficulty: 'Beginner',
    lessons: 9,
    progress: 100,
    href: '/trails/tse-onboarding',
  },
  {
    title: 'Modern Web Foundations',
    body: 'Scripting fluency across languages, and the full-stack production bar for shipping safely.',
    category: 'Web Dev',
    difficulty: 'Beginner',
    lessons: 2,
    progress: 100,
    href: '/trails/modern-web-foundations',
  },
  {
    title: 'APIs & Integrations',
    body: 'API and integration design, plus enough SQL and data modeling to read an unfamiliar schema.',
    category: 'Web Dev',
    difficulty: 'Intermediate',
    lessons: 2,
    progress: 100,
    href: '/trails/apis-integrations',
  },
  {
    title: 'Cloud Native Essentials',
    body: 'Containers, orchestration, cloud platforms, infrastructure as code, and production deployment models.',
    category: 'DevOps',
    difficulty: 'Intermediate',
    lessons: 4,
    progress: 100,
    href: '/trails/cloud-native-essentials',
  },
  {
    title: 'Data Engineering Trail',
    body: 'Observability and log analysis, the modern data stack, and pipelines and transformation.',
    category: 'Data',
    difficulty: 'Advanced',
    lessons: 3,
    progress: 100,
    href: '/trails/data-engineering-trail',
  },
  {
    title: 'Frontend Craft',
    body: 'Components, state, accessibility, and the details that make UIs feel right.',
    category: 'Web Dev',
    difficulty: 'Intermediate',
    lessons: 7,
    progress: 0,
  },
  {
    title: 'Applied AI/ML',
    body: 'LLM APIs and prompting, agentic engineering in production, AI-assisted dev tooling, and low-code automation.',
    category: 'AI/ML',
    difficulty: 'Advanced',
    lessons: 4,
    progress: 100,
    href: '/trails/applied-ai-ml',
  },
];

const CATEGORIES = ['All Trails', 'Support', 'Web Dev', 'Data', 'DevOps', 'AI/ML'] as const;

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner:     'bg-[#202431] text-[#C8CCD4]',
  Intermediate: 'bg-[#8B6CFF]/10 text-[#8B6CFF] ring-1 ring-inset ring-[#8B6CFF]/30',
  Advanced:     'bg-[#B7A7FF]/10 text-[#B7A7FF] ring-1 ring-inset ring-[#B7A7FF]/30',
};

const TRAIL_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20 L9 8 L13 14 L16 9 L21 20 Z" />
    <path d="M7.5 13.5 L10.5 13.5" />
  </svg>
);

export default function TrailsList() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('All Trails');
  const [recommendedFirst, setRecommendedFirst] = useState(true);

  const visible = useMemo(() => {
    const filtered =
      active === 'All Trails' ? TRAILS : TRAILS.filter((t) => t.category === active);
    // "Recommended" surfaces in-progress trails first; otherwise alphabetical.
    return [...filtered].sort((a, b) =>
      recommendedFirst ? b.progress - a.progress : a.title.localeCompare(b.title)
    );
  }, [active, recommendedFirst]);

  return (
    <div>
      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#202431] pb-5">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                active === cat
                  ? 'bg-[#8B6CFF] font-semibold text-[#0A0B0F]'
                  : 'border border-[#202431] text-[#6F7684] hover:border-[#8B6CFF]/40 hover:text-[#E9ECF2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRecommendedFirst((v) => !v)}
          className="text-sm text-[#6F7684] transition-colors hover:text-[#E9ECF2]"
        >
          Sort: <span className="text-[#C8CCD4]">{recommendedFirst ? 'Recommended' : 'A–Z'}</span>
        </button>
      </div>

      {/* Trail rows */}
      <div className="mt-6 space-y-4">
        {visible.map((trail) => {
          const rowContent = (
            <>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8B6CFF]/10 ring-1 ring-inset ring-[#8B6CFF]/20">
                {TRAIL_ICON}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#E9ECF2]">{trail.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#6F7684]">{trail.body}</p>
                {trail.progress > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-[#202431]">
                      <div className="h-full rounded-full bg-[#8B6CFF]" style={{ width: `${trail.progress}%` }} />
                    </div>
                    <span className="text-xs text-[#6F7684]">{trail.progress}%</span>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_STYLES[trail.difficulty]}`}>
                    {trail.difficulty}
                  </span>
                  <p className="mt-1.5 text-xs text-[#6F7684]">{trail.lessons} Lessons</p>
                </div>
                <span className="text-[#6F7684] transition-colors group-hover:text-[#8B6CFF]" aria-hidden="true">
                  →
                </span>
              </div>
            </>
          );

          const rowClassName =
            'group flex flex-col gap-4 rounded-2xl border border-[#202431] bg-[#151821] p-5 transition hover:border-[#8B6CFF]/40 sm:flex-row sm:items-center';

          return trail.href ? (
            <Link key={trail.title} href={trail.href} className={rowClassName}>
              {rowContent}
            </Link>
          ) : (
            <article key={trail.title} className={rowClassName}>
              {rowContent}
            </article>
          );
        })}
      </div>
    </div>
  );
}
