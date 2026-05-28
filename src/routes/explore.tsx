import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Map as MapIcon, SlidersHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories, events, experiences, movies } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] md:pb-8 shadow-xl">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top">
        <div className="px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search events, artists, venues..." 
                className="h-12 bg-secondary/50 border-transparent pl-10 rounded-2xl text-base shadow-sm focus-visible:ring-primary/50"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shrink-0 border-border/50">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Categories Pill Scroll */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2 hide-scrollbar">
            {categories.map((c, i) => (
              <button 
                key={c} 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-secondary-foreground border border-border/40 hover:bg-secondary"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Map Entry Point */}
        <div className="relative h-40 w-full rounded-3xl overflow-hidden group cursor-pointer shadow-[var(--shadow-card)]">
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10" />
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" alt="Map View" className="w-full h-full object-cover opacity-60 dark:opacity-40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-2 group-hover:scale-110 transition-transform">
              <MapIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground bg-background/80 px-3 py-1 rounded-full backdrop-blur text-sm">Explore Map View</span>
          </div>
        </div>

        {/* Trending Section (Pinterest style masonry-ish) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Trending Nearby</h2>
            <Link to="/" className="text-sm text-primary font-medium">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {events.slice(0, 4).map((e, i) => (
              <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} className={`group relative rounded-3xl overflow-hidden bg-card shadow-[var(--shadow-card)] ${i === 0 || i === 3 ? "aspect-[3/4]" : "aspect-square"}`}>
                <img src={e.cover} alt={e.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">{e.category}</div>
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{e.title}</h3>
                  <div className="text-white/80 text-[10px] mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {e.city}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Experiences Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Unique Experiences</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
            {experiences.map(x => (
              <Link key={x.id} to="/events/$eventId" params={{ eventId: x.id }} className="w-64 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95">
                <div className="aspect-video relative">
                  <img src={x.cover} alt={x.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium">
                    ${x.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-1">{x.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{x.host}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Movies Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Now Showing</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
            {movies.map(m => (
              <Link key={m.id} to="/movies" className="w-32 shrink-0 block transition-transform active:scale-95">
                <div className="aspect-[2/3] relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2">
                  <img src={m.cover} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                    {m.rating}
                  </div>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">{m.title}</h3>
                <p className="text-muted-foreground text-[10px] mt-0.5">{m.genre}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
