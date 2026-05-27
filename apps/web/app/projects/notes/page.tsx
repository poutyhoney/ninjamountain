const notes = [
  {
    title: "Localhost is enough at the beginning",
    body: "For the first version of Ninja Mountain, I am using plain localhost instead of custom local domains. This keeps the setup simple while I rebuild muscle memory."
  },
  {
    title: "The root package.json controls the workspace",
    body: "From the project root, npm run dev:web starts the Next.js app inside apps/web."
  },
  {
    title: "Small loops matter",
    body: "The goal is to edit a file, refresh the browser, see the change, and commit the checkpoint."
  }
];

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <section className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Back to Ninja Mountain
        </a>

        <h1 className="mt-8 text-4xl font-bold">Dev Notes</h1>

        <p className="mt-4 text-zinc-400">
          Notes from rebuilding the Ninja Mountain local development workflow.
        </p>

        <div className="mt-10 space-y-5">
          {notes.map((note) => (
            <article
              key={note.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <p className="mt-3 leading-7 text-zinc-400">{note.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}