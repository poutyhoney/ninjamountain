import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import SsoConceptCheck from './SsoConceptCheck';
import SsoScenarioChecklist from './SsoScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { name: string; body: string };
type FailureMode = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  { name: 'SAML',      body: 'An XML-based protocol where the IdP asserts identity to your app via a signed assertion — common in older enterprise SSO setups.' },
  { name: 'OAuth / OIDC', body: "OIDC layers identity on top of OAuth's authorization framework — the modern default for federated \"login with X.\"" },
  { name: 'SCIM',      body: 'System for Cross-domain Identity Management — how an IdP provisions and deprovisions accounts in your app automatically, not just authenticates them.' },
  { name: 'IdP',       body: 'Okta, Azure AD/Entra, Google Workspace — the system of record for who an employee is and what they should have access to.' },
];

const FAILURE_MODES: FailureMode[] = [
  { name: 'Stale signing certificate', body: "The IdP rotates its signing cert; your app still has the old one cached, so every login fails at once for that customer." },
  { name: 'SCIM deprovisioning lag',   body: "A user is removed from the IdP but still has access in your app because the SCIM sync failed or ran late." },
  { name: 'Clock skew',                body: "SAML assertions have a validity window. If the IdP's or your service's clock has drifted, valid assertions get rejected as expired." },
  { name: 'Attribute mapping mismatch', body: "The IdP sends a group or role claim under one field name; your app expects another, so everyone logs in with the wrong — usually no — permissions." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://developer.okta.com/docs/concepts/saml/',
    title: 'Okta: SAML concepts',
    desc: 'Assertions, signing, and why certificate rotation is the single most common SSO incident',
  },
  {
    href: 'https://developer.okta.com/docs/concepts/scim/',
    title: 'Okta: SCIM concepts',
    desc: 'Provisioning and deprovisioning, distinct from authentication itself',
  },
  {
    href: 'https://openid.net/developers/how-connect-works/',
    title: 'OpenID Foundation: How OpenID Connect works',
    desc: 'The modern OAuth-based alternative to SAML, from the standards body itself',
  },
  {
    href: 'https://developer.okta.com/docs/concepts/oauth-openid/',
    title: 'Okta: OAuth 2.0 and OpenID Connect overview',
    desc: 'How the two specs relate, for anyone who only knows one of them',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This deepens Auth, it doesn\'t repeat it',
    body: "The existing Auth lesson covers API keys, OAuth, JWTs, scopes and roles from a request-level view. This lesson is enterprise identity federation — what breaks when a whole company's login goes through their own IdP instead of your app's own user table.",
  },
  {
    title: 'The failure log below is illustrative',
    body: 'Real SAML error messages vary significantly by IdP and service provider library — the shape (a rejected assertion, a cert fingerprint, a rotation date) is what to look for, not this exact wording.',
  },
];

const CODE_EXAMPLE = `[SP]  SAML assertion rejected: signature validation failed
[SP]  Certificate fingerprint: 3B:2F:9A:1C:... (expires: 2026-06-01)
[IdP] New signing certificate active since: 2026-06-01`;

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
  title: 'SSO & Identity Edge Cases — TSE Onboarding — Ninja Mountain',
  description: 'A primer on enterprise identity federation — SAML, OAuth/OIDC, SCIM — and what breaks in production, with exercises.',
};

export default function SsoLessonPage() {
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
          <span className="text-[#C8CCD4]">SSO &amp; Identity Edge Cases</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 9 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          SSO &amp; Identity Edge Cases
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A customer&apos;s SSO breaks after their identity provider migration, and suddenly nobody at
          that company can log in at all. Enterprise identity fails differently than a password does.
        </p>

        {/* Definitions: core concepts */}
        <section className="py-14">
          <SectionHeader
            title="Beyond username and password"
            intro="Four terms cover most of what you'll need to read an enterprise identity issue."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {CONCEPTS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: failure modes */}
        <section className="py-14">
          <SectionHeader
            title="What actually breaks"
            intro="Four failure modes account for most enterprise SSO incidents you'll see."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {FAILURE_MODES.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized failure log below, then work through both exercises."
          />
          <pre
            aria-label="Example SAML assertion failure log"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <SsoConceptCheck />
            <SsoScenarioChecklist />
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
