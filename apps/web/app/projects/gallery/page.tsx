import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TrainingNotes from "../../components/TrainingNotes";

const TRAINING_NOTES = [
  {
    title: "next/image needs a positioned parent for fill mode",
    body: "Using fill on an Image component requires the parent to have position: relative (or absolute/fixed) and an explicit size. The aspect-square utility with relative does the job cleanly for square tiles.",
  },
  {
    title: "Public folder files are served from the root path",
    body: "Files placed in apps/web/public/sample-photos/ are referenced in JSX as /sample-photos/filename.jpg — the public/ directory itself is not part of the URL.",
  },
  {
    title: "object-cover keeps portrait and landscape photos from distorting",
    body: "Without object-cover, fill images stretch to fill the box. Pairing fill + object-cover + a fixed-aspect-ratio parent gives consistent card sizes regardless of the original image dimensions.",
  },
];

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
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6CFF]">Artifacts</p>
        <h1 className="text-4xl font-bold tracking-tight">Photo Dojo</h1>
        <p className="mt-4 max-w-2xl text-[#6F7684]">
          The future home of the photo upload and gallery experiment.
          For now, real images mixed with placeholder tiles.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {samplePhotos.map((photo, index) => (
            <article
              key={photo.title}
              className="overflow-hidden rounded-2xl border border-[#202431] bg-[#151821] transition hover:-translate-y-1 hover:border-[#8B6CFF]/40"
            >
              <div className="relative aspect-square bg-[#202431]">
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#6F7684]">
                    Sample #{index + 1}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-[#E9ECF2]">{photo.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6F7684]">{photo.caption}</p>
              </div>
            </article>
          ))}
        </div>

        <TrainingNotes notes={TRAINING_NOTES} />
      </main>

      <SiteFooter />
    </div>
  );
}