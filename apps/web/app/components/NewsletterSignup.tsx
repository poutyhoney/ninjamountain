'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') return;
    // No backend yet — this is a design-stage placeholder.
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="flex-1 rounded-lg border border-[#202431] bg-[#0A0B0F] px-4 py-3 text-sm text-[#E9ECF2] outline-none transition-colors placeholder:text-[#6F7684] focus:border-[#8B6CFF]/60"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#8B6CFF] px-5 py-3 text-sm font-semibold text-[#0A0B0F] transition hover:-translate-y-px hover:bg-[#B7A7FF] disabled:opacity-60"
        disabled={submitted}
      >
        {submitted ? 'Subscribed ✓' : 'Subscribe'}
      </button>
    </form>
  );
}
