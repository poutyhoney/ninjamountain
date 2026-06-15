'use client';

import { useMemo, useState } from 'react';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

type Trail = {
  title: string;
  body: string;
  category: string;
  difficulty: Difficulty;
  lessons: number;
  progress: number; // 0–100
};

const TRAILS: Trail[] = [
  {
    title: 'Modern Web Foundations',
    body: 'HTML, CSS, and JavaScript done right. Build solid foundations.',
    category: 'Web Dev',
    difficulty: 'Beginner',
    lessons: 8,
    progress: 30,
  },
  {
    title: 'APIs & Integrations',
    body: 'Design, build, and consume robust APIs. Connect systems with confidence.',
    category: 'Web Dev',
    difficulty: 'Intermediate',
    lessons: 10,
    progress: 30,
  },
  {
    title: 'Cloud Native Essentials',
    body: 'Containers, orchestration, and infrastructure as code.',
    category: 'DevOps',
    difficulty: 'Intermediate',
    lessons: 9,
    progress: 0,
  },
  {
    title: 'Data Engineering Trail',
    body: 'Pipelines, warehouses, and transformations at scale.',
    category: 'Data',
    difficulty: 'Advanced',
    lessons: 12,
    progress: 5,
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
    body: 'Prompting, evals, and wiring models into real product surfaces.',
    category: 'AI/ML',
    difficulty: 'Advanced',
    lessons: 11,
    progress: 0,
  },
];

const CATEGORIES = ['All Trails', 'Web Dev', 'Data', 'DevOps', 'AI/ML'] as const;

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
        {visible.map((trail) => (
          <article
            key={trail.title}
            className="group flex flex-col gap-4 rounded-2xl border border-[#202431] bg-[#151821] p-5 transition hover:border-[#8B6CFF]/40 sm:flex-row sm:items-center"
          >
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
          </article>
        ))}
      </div>
    </div>
  );
}
