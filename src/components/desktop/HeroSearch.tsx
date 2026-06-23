import { Search, MapPin, Music, Ticket, Trophy, Palette, Pizza, Mic, Film, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const CATEGORIES = [
  { name: "Music", icon: Music },
  { name: "Theatre", icon: Ticket },
  { name: "Sports", icon: Trophy },
  { name: "Art", icon: Palette },
  { name: "Food", icon: Pizza },
  { name: "Comedy", icon: Mic },
  { name: "Film", icon: Film },
  { name: "Culture", icon: Globe },
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent, category?: string) => {
    e?.preventDefault();
    const q = category || query;
    if (!q && !city) return;
    
    // Navigate to explore page with search params
    navigate({
      to: "/explore",
      search: { q, city } as any,
    });
  };

  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
      <form onSubmit={handleSearch} className="grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Events, organizers, artists…"
            className="h-12 border-transparent bg-secondary/60 pl-9"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="h-12 border-transparent bg-secondary/60 pl-9"
          />
        </div>
        <Button
          type="submit"
          className="h-12 rounded-xl px-6"
          style={{ background: "var(--gradient-primary)" }}
        >
          Search
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => handleSearch(undefined, c.name)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
