'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "What's the difference between `terraform plan` and `terraform apply`?",
    a: '`plan` shows what would change without touching anything; `apply` actually executes those changes.',
  },
  {
    q: 'Why does a plan sometimes say a resource "must be replaced" instead of "updated in-place"?',
    a: "Some attributes (like an EC2 instance's AMI) can't be changed on a running resource, so Terraform destroys and recreates it instead — that's what \"forces replacement\" means.",
  },
  {
    q: 'What is Terraform state, and why is losing it dangerous?',
    a: "State is Terraform's record mapping your config to real resource IDs. Without it, Terraform can't tell what it already created — it may try to recreate resources that already exist, or lose track of real ones entirely.",
  },
  {
    q: 'Someone changes a tag directly in the AWS console instead of through Terraform. What happens on the next plan?',
    a: "Terraform detects the drift and shows a change to bring the resource back in line with config — which can look like an unexpected revert to whoever runs the next plan.",
  },
  {
    q: 'When would you reach for Pulumi over Terraform?',
    a: 'When the team wants infra defined in a general-purpose language — loops, functions, existing test tooling — rather than HCL. Same underlying model, different authoring experience.',
  },
] as const;

export default function IacConceptCheck() {
  const [revealed, setRevealed] = useState<boolean[]>(() => QUESTIONS.map(() => false));

  const toggle = (i: number) => {
    setRevealed((prev) => prev.map((value, index) => (index === i ? !value : value)));
  };

  return (
    <div className="rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]">
      <h3 className="mb-1 text-lg font-semibold text-[#E9ECF2]">Concept check</h3>
      <p className="mb-4 text-sm text-[#6F7684]">
        Answer in your head first, then click a question to reveal the answer.
      </p>
      <div className="space-y-2">
        {QUESTIONS.map(({ q, a }, i) => (
          <div key={q} className="rounded-2xl border border-[#202431] bg-[#0A0B0F]">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={revealed[i]}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm text-[#C8CCD4]"
            >
              <span>{q}</span>
              <span className="shrink-0 text-[#8B6CFF]" aria-hidden="true">
                {revealed[i] ? '−' : '+'}
              </span>
            </button>
            {revealed[i] && (
              <p className="border-t border-[#202431] px-4 py-3 text-sm text-[#6F7684]">{a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
