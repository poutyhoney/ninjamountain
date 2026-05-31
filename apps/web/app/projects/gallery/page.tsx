import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";

const samplePhotos = [
  {
    title: "Seeking Knowledge",
    src: "/sample-photos/seeking_knowledge.jpg",
    caption: "The first real image in the Photo Dojo."
  },
  {
    title: "Later Today",
    src:  "/sample-photos/signal_lantern.jpg",
    caption: "The second real image in the Photo Dojo."
  },
  {
    title: "Taunting Temptation",
    src:  "/sample-photos/hidden_trail.jpg",
    caption: "The third real image in the Photo Dojo."
  }
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Photo Dojo</h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          This is the future home of the photo upload and gallery experiment.
          For now, it mixes real images with placeholder tiles.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {samplePhotos.map((photo, index) => (
            <article
              key={photo.title}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <div className="relative aspect-square bg-zinc-800">
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Sample #{index + 1}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-xl font-semibold">{photo.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {photo.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}