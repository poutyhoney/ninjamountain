import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type ListItem = { title: string; body: string };

const AI_CLOUD_EXAMPLES: ListItem[] = [
  { title: 'Speech recognition', body: 'Convert a recorded customer-service call into text.' },
  { title: 'Text-to-speech', body: 'Generate a spoken version of an article.' },
  { title: 'Language translation', body: 'Translate an English support message into Japanese.' },
  { title: 'Image recognition', body: 'Identify objects, faces, or text in an uploaded image.' },
  { title: 'Chatbots', body: "Answer customers' questions using natural language." },
  { title: 'Document analysis', body: 'Extract names, dates, totals, and addresses from invoices.' },
  { title: 'Generative AI', body: 'Create text, summaries, images, or code from instructions.' },
];

const ML_CLOUD_STEPS: string[] = [
  'Preparing and labeling training data',
  'Selecting an ML algorithm',
  'Training a model on cloud servers',
  'Testing how accurate the model is',
  'Adjusting model settings',
  'Deploying the model as an API',
  'Monitoring whether its predictions become less accurate over time',
];

const RETAILER_EXAMPLES: string[] = [
  'Which products a customer may buy',
  'How much inventory will be needed next month',
  'Whether a transaction might be fraudulent',
  'Whether a customer is likely to cancel a subscription',
];

type ComparisonRow = { situation: string; ai: string; ml: string };

const COMPARISON: ComparisonRow[] = [
  { situation: 'Analyze customer reviews', ai: 'Use a ready-made service to identify positive or negative sentiment', ml: 'Train a custom sentiment model using reviews from your industry' },
  { situation: 'Detect objects in photos', ai: 'Use a service that already recognizes cars, people, and buildings', ml: "Train a model to recognize a company's specific products" },
  { situation: 'Predict fraud', ai: 'Use a prebuilt fraud-detection service', ml: "Train a model using the company's historical transaction data" },
  { situation: 'Build a chatbot', ai: 'Use a conversational AI service', ml: 'Train or fine-tune a model using company documentation' },
  { situation: 'Forecast sales', ai: 'Use an automated forecasting service', ml: 'Build and test a custom forecasting model with selected algorithms' },
];

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
  title: 'AI vs. ML: The Basic Distinction — Knowledge — Ninja Mountain',
  description: 'What separates the overall goal of AI from ML as one technique used to build it, with a spam-filter example and a cloud tools comparison.',
};

export default function AiVsMlPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/knowledge" className="hover:text-[#E9ECF2]">Knowledge</Link>
          <span>›</span>
          <Link href="/knowledge/concepts" className="hover:text-[#E9ECF2]">Concepts</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">AI vs. ML</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Basic distinction
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          AI vs. ML
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Two terms that get used almost interchangeably, but describe different things — one is
          a goal, the other is a technique for reaching it.
        </p>

        {/* Core definitions */}
        <section className="py-14">
          <div className="grid gap-4 sm:grid-cols-2">
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Artificial intelligence (AI)</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                The broader goal of creating computer systems that perform tasks associated with
                human intelligence — such as understanding language, recognizing images, planning,
                reasoning, or making decisions.
              </p>
            </article>
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Machine learning (ML)</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                One way to build AI systems. Instead of programming every rule manually, developers
                train an ML model using data so it can recognize patterns and make predictions.
              </p>
            </article>
          </div>

          <blockquote className="mt-6 rounded-2xl border border-[#8B6CFF]/30 bg-[#8B6CFF]/10 px-6 py-5 text-lg font-semibold leading-relaxed text-[#E9ECF2]">
            AI is the overall capability; ML is a technique used to create that capability.
          </blockquote>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#6F7684]">
            Not every AI system uses machine learning — an AI system could rely entirely on
            hand-written rules. Most modern AI products use ML heavily, but the two words aren&apos;t
            synonyms.
          </p>
        </section>

        {/* Spam email example */}
        <section className="py-14">
          <SectionHeader
            title="Example: identifying spam email"
            intro="The same problem, solved two different ways, shows the distinction clearly."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <article className={card}>
              <h3 className="mb-3 font-semibold text-[#E9ECF2]">Rule-based AI approach</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-[#6F7684]">
                <li>If the subject contains &ldquo;You won!&rdquo;</li>
                <li>and the email contains several suspicious links,</li>
                <li>move it to the spam folder.</li>
              </ul>
              <p className="mt-4 text-sm text-[#6F7684]">A developer manually defines those rules.</p>
            </article>
            <article className={card}>
              <h3 className="mb-3 font-semibold text-[#E9ECF2]">ML approach</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-[#6F7684]">
                <li>Provide thousands of emails labeled &ldquo;spam&rdquo; or &ldquo;not spam.&rdquo;</li>
                <li>The ML system learns patterns from those examples.</li>
                <li>It predicts whether a new email is spam.</li>
              </ul>
            </article>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#6F7684]">
            The finished spam filter is an <strong className="text-[#C8CCD4]">AI application</strong>.
            The pattern-learning process behind it is <strong className="text-[#C8CCD4]">machine learning</strong>.
          </p>
        </section>

        {/* Cloud AI vs ML tools */}
        <section className="py-14">
          <SectionHeader
            title="AI tools vs. ML tools in the cloud"
            intro="Cloud AI tools hand you a finished capability. Cloud ML tools hand you the infrastructure to build your own."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <article className={card}>
              <h3 className="mb-1 font-semibold text-[#E9ECF2]">AI tools</h3>
              <p className="mb-4 text-sm text-[#6F7684]">
                Ready-to-use intelligent capabilities — send data, get a result. The provider has
                usually already trained the underlying model.
              </p>
              <ul className="space-y-3">
                {AI_CLOUD_EXAMPLES.map(({ title, body }) => (
                  <li key={title} className="text-sm">
                    <span className="font-medium text-[#8B6CFF]">{title}:</span>{' '}
                    <span className="text-[#6F7684]">{body}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className={card}>
              <h3 className="mb-1 font-semibold text-[#E9ECF2]">ML tools</h3>
              <p className="mb-4 text-sm text-[#6F7684]">
                Generally used to build, train, evaluate, deploy, and monitor custom models:
              </p>
              <ul className="mb-5 space-y-2 text-sm text-[#6F7684]">
                {ML_CLOUD_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <p className="mb-2 text-sm text-[#C8CCD4]">
                A retailer might use ML tools to train a model that predicts:
              </p>
              <ul className="space-y-2 text-sm text-[#6F7684]">
                {RETAILER_EXAMPLES.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Side-by-side comparison table */}
        <section className="py-14">
          <SectionHeader
            title="Side-by-side examples"
            intro="The same situation, approached as a consumed AI service versus a custom-trained ML model."
          />
          <div className="overflow-x-auto rounded-[18px] border border-[#202431]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#202431] bg-[#151821] text-[#C8CCD4]">
                  <th className="px-5 py-3 font-semibold">Situation</th>
                  <th className="px-5 py-3 font-semibold">AI tool</th>
                  <th className="px-5 py-3 font-semibold">ML tool</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.situation} className={i % 2 === 0 ? 'bg-[#0A0B0F]' : 'bg-[#0D0F16]'}>
                    <td className="px-5 py-4 align-top font-medium text-[#E9ECF2]">{row.situation}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.ai}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.ml}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Analogy */}
        <section className="py-14">
          <SectionHeader title="A practical analogy" intro="" />
          <article className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Think of <strong className="text-[#C8CCD4]">AI as a finished meal</strong> and{' '}
              <strong className="text-[#C8CCD4]">ML as part of the cooking process</strong>.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#6F7684]">
              <li>
                An <strong className="text-[#C8CCD4]">AI service</strong> is like ordering a
                prepared meal. It is ready to use.
              </li>
              <li>
                An <strong className="text-[#C8CCD4]">ML platform</strong> is like having a
                professional kitchen, ingredients, equipment, and tools so you can create your own
                meal.
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[#6F7684]">
              The terms sometimes overlap because an ML platform may also include ready-made AI
              services. Course material often uses{' '}
              <strong className="text-[#C8CCD4]">&ldquo;AI/ML tools&rdquo;</strong> as an umbrella
              phrase covering both: ready-to-use intelligent services, and tools for developing
              custom machine-learning models.
            </p>
          </article>
        </section>

        {/* Related glossary terms */}
        <section className="py-14">
          <div className={card}>
            <h3 className="mb-2 font-semibold text-[#E9ECF2]">Related terms</h3>
            <p className="text-sm text-[#6F7684]">
              See <strong className="text-[#C8CCD4]">AI</strong>, <strong className="text-[#C8CCD4]">ML</strong>,{' '}
              <strong className="text-[#C8CCD4]">inference</strong>, and{' '}
              <strong className="text-[#C8CCD4]">fine-tuning</strong> in the{' '}
              <Link href="/knowledge/glossary" className="text-[#8B6CFF] hover:underline">
                Glossary
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
