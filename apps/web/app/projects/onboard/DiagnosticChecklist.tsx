'use client';

import { useSyncExternalStore } from 'react';

const CHECKS = [
  { key: 'one',   label: 'Confirm timestamp, environment and production impact' },
  { key: 'two',   label: 'Validate token expiry and refresh behavior' },
  { key: 'three', label: 'Check token scopes and intended API audience' },
  { key: 'four',  label: 'Reproduce with a newly generated token' },
  { key: 'five',  label: 'Document fix and preventive guidance' },
] as const;

type CheckKey = (typeof CHECKS)[number]['key'];
type CheckedState = Record<CheckKey, boolean>;

const storageKey = (key: CheckKey) => `tse-lab-${key}`;

// All unchecked: the server render and the pre-hydration client render.
const SERVER_SNAPSHOT: CheckedState = {
  one: false, two: false, three: false, four: false, five: false,
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
  // Cache so the reference stays stable until a toggle replaces it.
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

export default function DiagnosticChecklist() {
  const checked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="rounded-[18px] border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]">
      <h3 className="mb-1 text-lg font-semibold text-zinc-100">Diagnostic checklist</h3>
      <p className="mb-4 text-sm text-zinc-400">
        Check each item as you investigate. Progress is saved in your browser.
      </p>
      <div>
        {CHECKS.map(({ key, label }, i) => (
          <label
            key={key}
            className={`flex cursor-pointer gap-3 py-3 text-zinc-400 ${
              i < CHECKS.length - 1 ? 'border-b border-zinc-800' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={checked[key]}
              onChange={() => toggle(key)}
              className="mt-1 accent-indigo-300"
            />
            <span
              className={
                checked[key]
                  ? 'text-zinc-100 line-through decoration-indigo-300/40'
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
