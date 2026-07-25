import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ContainersConceptCheck from './ContainersConceptCheck';
import ContainersScenarioChecklist from './ContainersScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type K8sObject = { name: string; body: string };
type FailureMode = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const K8S_OBJECTS: K8sObject[] = [
  { name: 'Pod',        body: 'The smallest deployable unit — one or more containers sharing network and storage. Pods are disposable; you rarely create them directly.' },
  { name: 'Deployment', body: 'Manages a set of identical Pod replicas, handling rolling updates and self-healing by replacing failed Pods.' },
  { name: 'Service',    body: 'A stable network endpoint that load-balances traffic across a set of Pods, even as individual Pods come and go.' },
  { name: 'Namespace',  body: 'A way to partition a cluster into isolated groups of resources — for teams, environments, or tenants.' },
];

const FAILURE_MODES: FailureMode[] = [
  { name: 'CrashLoopBackOff',  body: 'The container starts, exits, and Kubernetes keeps restarting it with increasing backoff. Usually an application-level crash, not an infra problem.' },
  { name: 'ImagePullBackOff',  body: "The node can't pull the image — wrong tag, missing registry auth, or a typo in the image name." },
  { name: 'OOMKilled',         body: "The container exceeded its memory limit and the kernel killed it. Check `resources.limits.memory` against actual usage." },
  { name: 'Pending',           body: "The scheduler can't place the Pod — insufficient node resources, an unsatisfied node selector, or an unbound volume claim." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.docker.com/get-started/docker-overview/',
    title: 'Docker docs: Docker overview',
    desc: 'Images, containers, and the layered filesystem, from first principles',
  },
  {
    href: 'https://kubernetes.io/docs/concepts/workloads/pods/',
    title: 'Kubernetes docs: Pods',
    desc: 'What a Pod actually is and why it’s the atomic scheduling unit',
  },
  {
    href: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/',
    title: 'Kubernetes docs: Debug Running Pods',
    desc: 'The official troubleshooting flow for CrashLoopBackOff and friends',
  },
  {
    href: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
    title: 'Kubernetes docs: Deployments',
    desc: 'Rolling updates, rollbacks, and how self-healing actually works',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Containers & Orchestration hands-on depth was Tom's #1 self-identified gap across a scan of 30+ job descriptions — it's sequenced first in this trail for that reason, not because it's the easiest starting point.",
  },
  {
    title: 'The example output is representative, not exact',
    body: 'kubectl output formatting varies by version and configuration; the shape here (Restart Count, Last State, Reason) is what matters, not exact spacing or field order.',
  },
];

const CODE_EXAMPLE = `$ kubectl describe pod payments-worker-7d9f8c6b45-x2kqp
...
State:          Waiting
  Reason:       CrashLoopBackOff
Last State:     Terminated
  Reason:       Error
  Exit Code:    1
Restart Count:  6
...
Events:
  Warning  BackOff  32s (x12 over 4m)  kubelet  Back-off restarting failed container

$ kubectl logs payments-worker-7d9f8c6b45-x2kqp --previous
Error: connect ECONNREFUSED redis:6379
    at TCPConnectWrap.afterConnect [as oncomplete]`;

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
  title: 'Containers & Orchestration — Cloud Native Essentials — Ninja Mountain',
  description: 'A primer on images vs. containers, core Kubernetes objects, and common failure modes, with exercises.',
};

export default function ContainersLessonPage() {
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
          <Link href="/trails/cloud-native-essentials" className="hover:text-[#E9ECF2]">Cloud Native Essentials</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Containers &amp; Orchestration</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 4 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Containers &amp; Orchestration
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A crash-looping pod at 2am doesn&apos;t care that you&apos;ve never run kubectl before. Get
          fluent in the container and orchestration primitives before you&apos;re debugging them live.
        </p>

        {/* Definitions: images vs containers */}
        <section className="py-14">
          <SectionHeader
            title="Images vs. containers"
            intro="The distinction trips up almost everyone new to Docker — get it straight once and diagnosis gets much easier."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              An <strong className="text-[#E9ECF2]">image</strong> is a read-only, layered filesystem
              snapshot — a Dockerfile compiled into something runnable. A{' '}
              <strong className="text-[#E9ECF2]">container</strong> is a running (or stopped)
              instance of an image, with its own writable layer on top. Deleting a container doesn&apos;t
              touch the image it came from; rebuilding an image doesn&apos;t affect containers already
              running from the old one.
            </p>
          </div>
        </section>

        {/* Definitions: core k8s objects */}
        <section className="py-14">
          <SectionHeader
            title="Core Kubernetes objects"
            intro="Four objects cover most of what you'll touch day to day."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {K8S_OBJECTS.map(({ name, body }) => (
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
            title="Common failure modes"
            intro="You'll see these four constantly. Knowing which is which cuts diagnosis time dramatically."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {FAILURE_MODES.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized kubectl output below, then work through both exercises."
          />
          <pre
            aria-label="Example kubectl describe and logs output"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ContainersConceptCheck />
            <ContainersScenarioChecklist />
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
