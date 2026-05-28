import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Clock, Users, Star, Mountain, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { experiences } from "@/lib/mock-data";

const cats = ["All", "Hiking", "Running", "Surf", "Wellness", "Food", "Carft"] as const;

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Experiences — Agatike" },
      {
        name: "description",
        content: "Join hikes, run clubs, surf camps and wellness retreats across Africa.",
      },
      { property: "og:title", content: "Experiences — Agatike" },
      {
        property: "og:description",
        content: "Hike, run, surf and explore with curated local hosts.",
      },
    ],
  }),
  component: Experiences,
});

function Experiences() {
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const list = useMemo(
    () => (cat === "All" ? experiences : experiences.filter((e) => e.category === cat)),
    [cat],
  );

  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3">
        <button
          onClick={() => router.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg tracking-tight">Experiences</h1>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden hidden md:block">
        <div className="absolute inset-0" style={{ background: "var(--gradient-warm)" }} />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-primary-foreground md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs backdrop-blur">
            <Mountain className="h-3.5 w-3.5" /> Outdoor & active
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">
            Hike, run, surf — book it like a ticket.
          </h1>
          <p className="mt-3 max-w-xl opacity-90">
            Local hosts running curated outdoor experiences and recurring clubs across the
            continent.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-10">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm shrink-0 transition ${cat === c ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((x) => (
            <article
              key={x.id}
              className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={x.cover}
                  alt={x.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs backdrop-blur">
                  {x.category}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                  <Star className="h-3 w-3 fill-primary text-primary" /> {x.rating}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold leading-tight">{x.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Hosted by {x.host}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {x.city}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {x.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {x.spots} spots
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{x.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {x.price === 0 ? "Free · Join club" : `From ${x.currency || "$"}${x.price}`}
                  </p>
                  <Button
                    asChild
                    className="rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Link to="/events/$eventId" params={{ eventId: x.id }}>
                      {x.price === 0 ? "Join" : "Book"}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
