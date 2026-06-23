import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Film,
  Ticket,
  ArrowLeft,
  Play,
  Star,
  Calendar,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/currency";

export function DesktopMoviesView({
  active,
  setActive,
  movies,
  cinemas,
}: {
  active: string;
  setActive: (id: string) => void;
  movies: any[];
  cinemas: any[];
}) {
  const activeMovie = movies.find((m) => m.id === active)!;

  // Calculate the starting price across ALL schedules for this movie
  const allPrices = activeMovie?.showtimes?.flatMap((st: any) =>
    st.tiers?.length > 0
      ? st.tiers.map((t: any) => t.price_override || t.ticket_tier.price)
      : [st.basePrice],
  ) || [];
  const startingPrice = allPrices.length > 0 ? Math.min(...allPrices) : (activeMovie?.price || 10);

  const uniqueDates = Array.from(
    new Set((activeMovie?.showtimes || []).map((st: any) => st.date)),
  ).sort() as string[];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentDate =
    selectedDate && uniqueDates.includes(selectedDate) ? selectedDate : uniqueDates[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <section className="relative w-full transition-all duration-700 ease-in-out">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={activeMovie.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-2xl scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="flex gap-10 items-start">
            <div className="w-[320px] shrink-0 relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                key={activeMovie.id}
                src={activeMovie.cover}
                alt={activeMovie.title}
                className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500"
              />
            </div>

            <div className="w-full relative z-10 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                  <Film className="h-3.5 w-3.5" /> Now Playing
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-1 text-xs font-bold text-foreground backdrop-blur-md">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 4.8
                </span>
              </div>

              <h1 className="text-6xl font-black tracking-tight text-foreground mb-2 leading-tight drop-shadow-sm">
                {activeMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium mb-5">
                <span>{activeMovie.genre}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{activeMovie.duration}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="px-1.5 py-0.5 rounded border border-border text-xs">
                  {activeMovie.rating}
                </span>
              </div>

              <p className="text-foreground/80 text-base max-w-2xl leading-relaxed mb-8 drop-shadow-sm">
                {activeMovie.synopsis}
              </p>

              <div className="flex items-center gap-4 text-sm mb-8">
                <div className="flex items-center gap-2 text-foreground/80">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{activeMovie.cinema}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-foreground/90">Select Date</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {uniqueDates.map((d: string) => {
                    const isSelected = d === currentDate;
                    const dateObj = new Date(d);
                    const today = new Date();
                    const isToday = dateObj.toDateString() === today.toDateString();
                    const label = isToday
                      ? "Today"
                      : dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        });

                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`shrink-0 rounded-xl px-5 py-2 text-sm font-bold border transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                            : "bg-secondary border-border hover:border-primary/50 text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  asChild
                  className="h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link
                    to="/book-movie/$movieId"
                    params={{ movieId: activeMovie.id }}
                    search={{ date: currentDate }}
                  >
                    <Ticket className="mr-2 h-5 w-5" /> Book Ticket — Starting at{" "}
                    {formatCurrency(startingPrice, activeMovie.showtimes[0]?.currency || "RWF")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl text-base font-bold px-8 bg-secondary backdrop-blur-md border-border hover:bg-secondary/80 text-foreground"
                >
                  <Play className="mr-2 h-5 w-5" /> Watch Trailer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="px-6 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Now Showing</h2>
        </div>
        <div className="grid grid-cols-5 gap-4 px-6 pb-8">
          {movies.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`text-left group transition-all duration-300 ${
                active === m.id
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-60 hover:opacity-100 hover:scale-100"
              }`}
            >
              <div
                className={`relative aspect-[2/3] overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                  active === m.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                }`}
              >
                <img
                  src={m.cover}
                  alt={m.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white border border-white/10">
                  {m.rating}
                </span>
              </div>
              <h3 className="mt-4 truncate font-bold text-base">{m.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{m.cinema}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Premium Cinemas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find theaters selling reserved seating on Agatike.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-primary/20 text-primary hover:bg-primary/10"
          >
            View All Cinemas
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4 pb-6">
          {cinemas.map((c) => {
            const content = (
              <>
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center justify-between w-[calc(100%-24px)]">
                    <p className="font-bold text-sm text-white">{c.city}</p>
                    {c.isClosed && (
                      <span className="bg-red-500/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-1 truncate">{c.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{c.screens} screens</span>
                  </div>
                </div>
              </>
            );

            return c.isClosed ? (
              <div
                key={c.id}
                className="group opacity-70 cursor-not-allowed overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm"
              >
                {content}
              </div>
            ) : (
              <Link
                key={c.id}
                to="/cinemas/$cinemaId"
                params={{ cinemaId: c.id }}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:border-primary/30"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
