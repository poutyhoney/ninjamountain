'use client';

import { useSyncExternalStore } from 'react';

const CHECKS = [
  { key: 'shared',   label: 'Identify the shared operation both code snippets implement' },
  { key: 'notFound', label: 'Identify how each language handles the "not found" case' },
  { key: 'check',    label: 'Determine what you would check before modifying either function safely' },
  { key: 'test',     label: 'Describe what test you would want passing before merging a change here' },
  { key: 'rollout',  label: 'Describe how you would roll this change out safely on a high-traffic endpoint' },
] as const;

type CheckKey = (typeof CHECKS)[number]['key'];
type CheckedState = Record<CheckKey, boolean>;

const storageKey = (key: CheckKey) => `webdev-prodbar-lesson-${key}`;

// All unchecked: the server render and the pre-hydration client render.
const SERVER_SNAPSHOT: CheckedState = {
  shared: false, notFound: false, check: false, test: false, rollout: false,
};

// Module-level store backed by localStorage. useSyncExternalStore reads from it
// after hydration, so there is no setState-in-effect and no SSR mismatch.
const listeners = new Set<() => void>();
let snapshot: CheckedState | null = null;

function readStorage(): CheckedState {
  return Object.fromEntries(
    CHECKS.map(({ key }) => [key, localStorage.getItem(storageKey(key)) === 'true'])
  ) as CheckedState;
}

function getSnapshot(): CheckedState {
  if (snapshot === null) snapshot = readStorage();
  return snapshot;
}

function getServerSnapshot(): CheckedState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toggle(key: CheckKey) {
  const current = getSnapshot();
  const value = !current[key];
  localStorage.setItem(storageKey(key), String(value));
  snapshot = { ...current, [key]: value };
  listeners.forEach((listener) => listener());
}

export default function ProdBarScenarioChecklist() {
  const checked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]">
      <h3 className="mb-1 text-lg font-semibold text-[#E9ECF2]">Scenario checklist</h3>
      <p className="mb-4 text-sm text-[#6F7684]">
        Work through the sample Go/Ruby comparison and check each item off. Progress is saved in your browser.
      </p>
      <div>
        {CHECKS.map(({ key, label }, i) => (
          <label
            key={key}
            className={`flex cursor-pointer gap-3 py-3 text-[#6F7684] ${
              i < CHECKS.length - 1 ? 'border-b border-[#202431]' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={checked[key]}
              onChange={() => toggle(key)}
              className="mt-1 accent-[#8B6CFF]"
            />
            <span
              className={
                checked[key]
                  ? 'text-[#E9ECF2] line-through decoration-[#8B6CFF]/40'
                  : ''
              }
            >
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
