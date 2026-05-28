import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EventCard } from "@/components/site/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
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

        <div className="mt-6 flex flex-wrap gap-2">
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
      <Footer />
    </div>
  );
}