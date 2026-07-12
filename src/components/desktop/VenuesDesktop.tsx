import { Search, MapPin, Clock, Star, Ticket } from "lucide-react";
import { Link, useLoaderData } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useState } from "react";

export function VenuesDesktop() {
  const venues = useLoaderData({ from: "/venues/" }) as any[];
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const types = ["All", ...Array.from(new Set(venues.map((v) => v.type)))];

  const filteredVenues = venues.filter((venue) => {
    if (searchTerm && !venue.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== "All" && venue.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />

      <section className="relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]"></div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 lg:py-24">
          <div className="max-w-2xl text-left">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
              Discover amazing places.
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg font-medium">
              Get access tickets to parks, museums, gaming centers, and more. Skip the line and
              enjoy your time.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border/40 bg-card/60 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 max-w-[800px]">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 flex w-full bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-1 flex items-center group">
                  <Search className="absolute left-4 h-5 w-5 text-primary" />
                  <Input
                    className="w-full pl-12 h-14 bg-transparent border-0 shadow-none text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    placeholder="Search for venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex w-full md:w-[250px] shrink-0 bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-1 flex items-center group">
                  <Ticket className="absolute left-4 h-4 w-4 text-primary" />
                  <select
                    className="w-full pl-11 pr-8 h-14 bg-transparent border-0 text-[14px] font-medium focus:outline-none appearance-none"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="h-[64px] px-8 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 shrink-0 w-full md:w-auto active:scale-[0.98] transition-transform"
                style={{ background: "var(--gradient-primary)" }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">Popular Venues</h2>

        {filteredVenues.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border/60 text-muted-foreground bg-secondary/20">
            <p className="text-lg font-medium">No venues found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={venue.cover_url}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold shadow-sm">
                    {venue.type}
                  </div>
                  {venue.country && venue.source === "mock_venue" && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
                      📍 {venue.country}
                    </div>
                  )}
                  {venue.status === "Maintenance" && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-sm">
                      Maintenance
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight">{venue.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {venue.city || venue.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {venue.opening_hours || "09:00"} -{" "}
                      {venue.closing_hours || "22:00"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {venue.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        {venue.source === "space" ? "Starting At" : "Entry Fee"}
                      </p>
                      <span className="font-semibold text-lg text-primary">
                        {venue.pricing_tiers?.[0]?.amount > 0
                          ? formatCurrency(venue.pricing_tiers[0].amount, venue.currency)
                          : "Free"}
                      </span>
                    </div>
                    {venue.status === "Maintenance" ? (
                      <Button
                        disabled
                        className="rounded-xl px-6 bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      >
                        Maintenance
                      </Button>
                    ) : venue.bookingDisabled ? (
                      <Button
                        disabled
                        className="rounded-xl px-6 bg-muted text-muted-foreground cursor-not-allowed border border-border text-xs"
                      >
                        Not in your location
                      </Button>
                    ) : venue.source === "space" ? (
                      <Link to="/spaces/$spaceId" params={{ spaceId: venue.id }}>
                        <Button
                          className="rounded-xl px-6 shadow-[var(--shadow-glow)] transition-all group-hover:scale-105"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          Explore Space
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/venues/$venueId" params={{ venueId: venue.id }}>
                        <Button
                          className="rounded-xl px-6 shadow-[var(--shadow-glow)] transition-all group-hover:scale-105"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          Get Ticket
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
