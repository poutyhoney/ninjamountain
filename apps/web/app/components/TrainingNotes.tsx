type Note = { title: string; body: string };

export default function TrainingNotes({ notes }: { notes: Note[] }) {
  return (
    <section className="mt-16 border-t border-[#202431] py-14">
      <h2 className="text-2xl font-bold tracking-tight">Training Notes</h2>
      <p className="mt-2 mb-8 text-sm text-[#6F7684]">What building this project taught me.</p>
      <div className="space-y-4">
        {notes.map((note) => (
          <article
            key={note.title}
            className="rounded-2xl border border-[#202431] bg-[#151821] p-5"
          >
            <h3 className="font-semibold text-[#E9ECF2]">{note.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[#6F7684]">{note.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
