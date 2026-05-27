const samplePhotos = [
  "Mountain Gate",
  "Hidden Trail",
  "Signal Lantern",
  "Archive Stone",
  "Night Path",
  "Cloud Bridge"
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <section className="mx-auto max-w-5xl">
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Back to Ninja Mountain
        </a>

        <h1 className="mt-8 text-4xl font-bold">Photo Dojo</h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          This is the future home of the photo upload and gallery experiment.
          For now, these are placeholder tiles.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {samplePhotos.map((photo, index) => (
            <div
              key={photo}
              className="aspect-square rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex h-full flex-col justify-between">
                <span className="text-sm text-zinc-500">
                  Sample #{index + 1}
                </span>

                <h2 className="text-2xl font-semibold">{photo}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}