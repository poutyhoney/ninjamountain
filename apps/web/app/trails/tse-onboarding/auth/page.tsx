import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import AuthConceptCheck from './AuthConceptCheck';
import AuthScenarioChecklist from './AuthScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Mechanism = { title: string; body: string };
type Resource = { href: string; title: string; desc: string };

const MECHANISMS: Mechanism[] = [
  {
    title: 'API keys',
    body: 'A single long-lived secret sent with every request. Simple, but powerful — treat it like a password and never ship one to a browser.',
  },
  {
    title: 'OAuth 2.0',
    body: 'A framework for one system to get a scoped, time-limited token to act on behalf of a user or itself — without ever handling that user’s password.',
  },
  {
    title: 'JWT (JSON Web Token)',
    body: 'A compact, signed token format — header.payload.signature — often used as the access token OAuth issues. The payload carries claims like subject, scopes and expiry.',
  },
  {
    title: 'Scopes & roles (RBAC)',
    body: 'Scopes limit what a specific token can do; roles describe what a user account is allowed to do in general. A token can be scoped down even for a highly-privileged user.',
  },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication',
    title: 'MDN: HTTP authentication',
    desc: 'The Authorization header, auth schemes, and the WWW-Authenticate flow',
  },
  {
    href: 'https://oauth.net/2/',
    title: 'OAuth 2.0',
    desc: 'The authoritative reference for grant types and terminology',
  },
  {
    href: 'https://jwt.io/introduction',
    title: 'JWT.io: Introduction to JSON Web Tokens',
    desc: 'Token structure, claims, and how signature verification works',
  },
  {
    href: 'https://owasp.org/API-Security/',
    title: 'OWASP API Security',
    desc: 'Common authentication and authorization risks to recognize',
  },
];

const TRAINING_NOTES = [
  {
    title: 'The core diagnostic split is identity vs. permission',
    body: 'Almost every auth investigation reduces to one question: does this request have a valid identity at all (401), or does that identity lack permission for this specific thing (403)? Leading with that split keeps the lesson focused instead of turning into a tour of every auth standard.',
  },
  {
    title: 'Reused the HTTP lesson’s exercise shapes rather than inventing new ones',
    body: 'Once a pattern works — reveal-to-check for concepts, a persisted checklist for a scenario — repeating it for the next topic is more valuable than novelty. Each lesson gets its own storage key prefix (tse-auth-lesson-*) so progress never collides across topics.',
  },
];

const CODE_EXAMPLE = `GET /v1/conversations/CH2a91 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhY2N0XzQ0MiIsInNjb3BlIjoicmVhZDpjb252ZXJzYXRpb25zIiwiZXhwIjoxNzEwMDAwMDAwfQ.xyz

HTTP/1.1 403 Forbidden
{
  "error": {
    "code": "insufficient_scope",
    "message": "Token has scope 'read:conversations', endpoint requires 'write:conversations'"
  }
}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const card = 'rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]';

function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mb-8 max-w-2xl text-[#6F7684]">{intro}</p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Auth — TSE Onboarding — Ninja Mountain',
  description: 'A primer on authentication vs. authorization, API keys, OAuth 2.0, JWTs and scopes, with exercises.',
};

export default function AuthLessonPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/trails" className="hover:text-[#E9ECF2]">Trails</Link>
          <span>›</span>
          <Link href="/trails/tse-onboarding" className="hover:text-[#E9ECF2]">TSE Onboarding</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Auth</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Auth
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Most escalations that look like a broken integration are actually an identity or
          permission problem. Learn to tell the two apart quickly.
        </p>

        {/* Definitions: identity vs. permission */}
        <section className="py-14">
          <SectionHeader
            title="Identity vs. permission"
            intro="Every auth failure is one of exactly two things. Naming which one first narrows the investigation immediately."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              <strong className="text-[#E9ECF2]">Authentication</strong> answers &quot;who is this?&quot; —
              it&apos;s the process of proving identity, usually via a credential like an API key,
              password, or token. <strong className="text-[#E9ECF2]">Authorization</strong> answers
              &quot;what is this identity allowed to do?&quot; — it&apos;s checked after authentication succeeds.
              A request can be authenticated (the platform knows who you are) and still be
              unauthorized (you&apos;re not allowed to do that specific thing).
            </p>
          </div>
        </section>

        {/* Definitions: mechanisms */}
        <section className="py-14">
          <SectionHeader
            title="Mechanisms you'll see constantly"
            intro="Different products reach for different tools, but they all reduce to identity plus permission."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {MECHANISMS.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized request and response below, then work through both exercises."
          />
          <pre
            aria-label="Example authenticated HTTP request and response"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <AuthConceptCheck />
            <AuthScenarioChecklist />
          </div>
        </section>

        {/* Resources */}
        <section className="py-14">
          <SectionHeader
            title="Go deeper"
            intro="These primers are a starting point. Read the primary sources to build real fluency."
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
