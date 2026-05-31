type Project = {
  title: string;
  slug: string;
  status: string;
};

async function getProjects(): Promise<Project[]> {
  const response = await fetch("http://localhost:8000/projects", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load projects");
  }

  return response.json();
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <h2 className="sm:text-7xl text-indigo-300">
          Ninja Mountain
        </h2>

        <span className="max-w-5xl text-5xl tracking-tight sm:text-5xl">
          <span className="block text-zinc-100">You're not a dot.</span>
          <span className="block text-indigo-300">
            You're the one who connects the dots.
          </span>
        </span>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300">
          A personal project dojo for rebuilding web development skills<br />(a.k.a. "The Mountain"), one
          small trail at a time.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.title}
              href={`/projects/${project.href}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-900"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                  {project.status}
                </span>
              </div>

              <p className="text-sm leading-6 text-zinc-400">
                {project.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}