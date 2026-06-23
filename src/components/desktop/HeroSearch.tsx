import { Search, MapPin, Music, Ticket, Trophy, Palette, Pizza, Mic, Film, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const CITIES = [
  "Nairobi, Kenya",
  "Lagos, Nigeria",
  "Accra, Ghana",
  "Kigali, Rwanda",
  "Cape Town, South Africa",
  "Johannesburg, South Africa",
  "Dar es Salaam, Tanzania",
  "Kampala, Uganda",
  "Dakar, Senegal",
  "Abidjan, Ivory Coast",
  "Cairo, Egypt",
  "Casablanca, Morocco",
  "Dubai, UAE",
  "London, UK",
  "Paris, France",
  "New York, USA",
  "Sydney, Australia",
  "Berlin, Germany",
  "Doha, Qatar",
  "Lisbon, Portugal"
].sort();

const CATEGORIES = [
  { name: "Events", icon: Ticket },
  { name: "Movies", icon: Film },
  { name: "Experiences", icon: Globe },
  { name: "Music", icon: Music },
  { name: "Sports", icon: Trophy },
  { name: "Comedy", icon: Mic },
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent, category?: string) => {
    e?.preventDefault();
    const q = category || query;
    const finalCity = city === "all" ? "" : city;
    if (!q && !finalCity) return;
    
    // Navigate to explore page with search params
    navigate({
      to: "/explore",
      search: { q, city: finalCity } as any,
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
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 border-transparent bg-secondary/60 pl-9 pr-4 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none border-0 ring-offset-transparent">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
