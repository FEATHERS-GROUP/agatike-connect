import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EventCard } from "@/components/site/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, events } from "@/lib/mock-data";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All events — Agatike" },
      { name: "description", content: "Browse nightlife, music, sports, conferences and festivals across Africa." },
      { property: "og:title", content: "All events — Agatike" },
      { property: "og:description", content: "Browse nightlife, music, sports, conferences and festivals across Africa." },
    ],
  }),
  component: EventsBrowse,
});

function EventsBrowse() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQ = !q || `${e.title} ${e.organizer} ${e.city}`.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !cat || e.category === cat;
      return matchesQ && matchesCat;
    });
  }, [q, cat]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none">
      <div className="hidden md:block"><Navbar /></div>
      
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3">
        <button onClick={() => router.history.back()} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg tracking-tight">All Events</h1>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
        <header className="hidden md:flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">All events</h1>
            <p className="mt-1 text-sm text-muted-foreground">{filtered.length} events across Africa</p>
          </div>
          <div className="flex w-full max-w-md gap-2 md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, city, organizer" className="pl-9 rounded-full bg-secondary/60 border-transparent" />
            </div>
            <Button variant="outline" className="rounded-full"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
        </header>

        {/* Mobile Search - Only shows on mobile since desktop search is in navbar or header */}
        <div className="md:hidden flex w-full gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, city..." className="pl-9 rounded-full bg-secondary/60 border-transparent text-sm" />
          </div>
          <Button variant="outline" size="icon" className="rounded-full shrink-0"><SlidersHorizontal className="h-4 w-4" /></Button>
        </div>

        <div className="mt-2 md:mt-6 flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          <button onClick={() => setCat(null)} className={`rounded-full border px-3 py-1 text-sm transition ${cat === null ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>All</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-sm transition ${cat === c ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-lg font-semibold">No events match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different city or category.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
      <div className="hidden md:block"><Footer /></div>
    </div>
  );
}