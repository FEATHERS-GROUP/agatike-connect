import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Bus,
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  X,
} from "lucide-react";
const mockBusTrips: any[] = [];
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buses/mobile")({
  head: () => ({
    meta: [
      { title: "Bus Tickets — Agatike" },
      { name: "description", content: "Find and book bus tickets across East Africa." },
    ],
  }),
  component: BusMobile,
});

const POPULAR_ROUTES = [
  { from: "Kigali", to: "Kampala", emoji: "🇷🇼→🇺🇬" },
  { from: "Kigali", to: "Nairobi", emoji: "🇷🇼→🇰🇪" },
  { from: "Nairobi", to: "Dar es Salaam", emoji: "🇰🇪→🇹🇿" },
  { from: "Kampala", to: "Kigali", emoji: "🇺🇬→🇷🇼" },
];

function BusMobile() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [searched, setSearched] = useState(false);

  const agencies = ["All", ...Array.from(new Set(mockBusTrips.map((t) => t.agency)))];

  const filteredTrips = mockBusTrips.filter((trip) => {
    if (from && !trip.origin.toLowerCase().includes(from.toLowerCase())) return false;
    if (to && !trip.destination.toLowerCase().includes(to.toLowerCase())) return false;
    if (date && trip.date !== date) return false;
    if (agencyFilter !== "All" && trip.agency !== agencyFilter) return false;
    return true;
  });

  const handleSearch = () => setSearched(true);

  const applyPopular = (route: { from: string; to: string }) => {
    setFrom(route.from);
    setTo(route.to);
    setSearched(true);
  };

  const clearSearch = () => {
    setFrom("");
    setTo("");
    setDate("");
    setAgencyFilter("All");
    setSearched(false);
  };

  if (searched) {
    return (
      <div className="min-h-screen bg-secondary/20 text-foreground pb-28 font-sans">
        {/* Results Curved Header (Matches Reference) */}
        <div
          className="relative pt-12 pb-16 px-4 rounded-b-[2rem] z-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 text-primary-foreground"
            >
              <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg">Available Buses</span>
            </button>
          </div>

          <div className="max-w-5xl mx-auto text-center text-primary-foreground space-y-2 mt-2">
            <div className="flex items-center justify-center gap-4 text-2xl font-bold py-1">
              <span>{from || "Anywhere"}</span>
              <ArrowLeftRight className="h-5 w-5 opacity-90" />
              <span>{to || "Anywhere"}</span>
            </div>
            <p className="text-sm text-primary-foreground/80 font-medium">{date || "All dates"}</p>
          </div>
        </div>

        {/* Results List */}
        <div className="px-4 mt-6 space-y-3 relative z-10 -mt-6">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/60 bg-card">
              <Bus className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-medium">No trips found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different route or date</p>
              <button onClick={clearSearch} className="mt-4 text-primary font-medium text-sm">
                Clear Search
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const totalSeats = trip.layout.seats.length;
              const bookedSeats = trip.layout.seats.filter((s) => s.isBooked).length;
              const available = totalSeats - bookedSeats;
              const isFull = available === 0;

              if (isFull) {
                return (
                  <div
                    key={trip.id}
                    className="bg-card rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-border/40 p-5 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-[17px] text-muted-foreground">
                          {trip.agency}
                        </h3>
                        <p className="text-[13px] text-muted-foreground">{trip.busType}</p>
                        <p className="text-[14px] font-semibold pt-1 text-muted-foreground">
                          {trip.departureTime} - {trip.arrivalTime}
                        </p>
                        <p className="text-xs font-bold text-destructive pt-1.5">Sold Out</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold text-muted-foreground">
                          {formatCurrency(trip.price, trip.currency)}
                        </p>
                        <p className="text-[13px] text-muted-foreground font-medium">Direct</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={trip.id}
                  to="/buses/$tripId"
                  params={{ tripId: trip.id }}
                  className="block active:scale-[0.98] transition-transform"
                >
                  <div className="bg-card rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-border/40 p-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-[17px] leading-none text-foreground/90">
                          {trip.agency}
                        </h3>
                        <p className="text-[13px] text-muted-foreground">{trip.busType}</p>
                        <p className="text-[14px] font-semibold pt-1 text-foreground/80">
                          {trip.departureTime} - {trip.arrivalTime}
                        </p>
                        <p className="text-xs font-bold text-emerald-500 pt-1.5">
                          {available} Seats left
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(trip.price, trip.currency)}
                        </p>
                        <p className="text-[13px] text-muted-foreground font-medium">Direct</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Default Search Header */}
      <div
        className="relative overflow-hidden px-4 pt-12 pb-12 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url('/kigali-bus-park.png')",
        }}
      >
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
                <Bus className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground font-semibold">Agatike</span>
            </div>
          </div>
          <h1 className="text-[28px] font-bold text-primary-foreground leading-[1.1] tracking-tight">
            Where are you
            <br />
            headed today?
          </h1>
        </div>
      </div>

      {/* Premium Search Card */}
      <div className="mx-4 -mt-6 rounded-3xl bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 space-y-3 relative z-10 backdrop-blur-xl backdrop-saturate-150">
        <div className="relative bg-secondary/30 rounded-2xl p-1 border border-border/40">
          <div className="relative flex items-center bg-background rounded-xl shadow-sm border border-border/40 overflow-hidden">
            <div className="pl-3 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <input
              className="w-full pl-3 pr-4 h-12 bg-transparent text-[15px] focus:outline-none font-medium placeholder:text-muted-foreground/60"
              placeholder="Leaving from…"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => {
                const tmp = from;
                setFrom(to);
                setTo(tmp);
              }}
              className="h-9 w-9 rounded-full bg-background flex items-center justify-center text-primary shadow-md border border-border/40 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowLeftRight className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <div className="relative flex items-center bg-background rounded-xl shadow-sm border border-border/40 overflow-hidden mt-2">
            <div className="pl-3 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              className="w-full pl-3 pr-4 h-12 bg-transparent text-[15px] focus:outline-none font-medium placeholder:text-muted-foreground/60"
              placeholder="Going to…"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative flex items-center bg-secondary/30 rounded-2xl border border-border/40 overflow-hidden group focus-within:border-primary/40 focus-within:bg-background transition-colors">
            <div className="pl-3">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <input
              type="date"
              className="w-full pl-2 pr-2 h-12 bg-transparent text-[14px] focus:outline-none font-medium text-foreground"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="relative flex items-center bg-secondary/30 rounded-2xl border border-border/40 overflow-hidden group focus-within:border-primary/40 focus-within:bg-background transition-colors">
            <div className="pl-3">
              <Bus className="h-4 w-4 text-primary" />
            </div>
            <select
              className="w-full pl-2 pr-8 h-12 bg-transparent text-[14px] focus:outline-none appearance-none font-medium text-foreground"
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
            >
              {agencies.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full h-14 rounded-2xl font-bold text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 mt-1"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Search className="h-5 w-5" />
          Search Buses
        </button>
      </div>

      <div className="px-4 mt-8 space-y-8">
        {/* Popular Routes */}
        <div>
          <h2 className="text-[15px] font-bold text-foreground/90 mb-3 px-1">Popular Routes</h2>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_ROUTES.map((route, i) => (
              <button
                key={i}
                onClick={() => applyPopular(route)}
                className="text-left p-3 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-sm active:scale-[0.98] transition-all"
              >
                <span className="text-xl">{route.emoji}</span>
                <p className="text-[13px] font-bold mt-1.5 text-foreground/90">{route.from}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                  <ArrowRight className="h-3 w-3 inline opacity-70" /> {route.to}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Available Today Preview */}
        <div>
          <h2 className="text-[15px] font-bold text-foreground/90 mb-3 px-1">Available Today</h2>
          <div className="space-y-3">
            {mockBusTrips.slice(0, 3).map((trip) => {
              const available = trip.layout.seats.filter((s) => !s.isBooked).length;
              const isFull = available === 0;

              if (isFull) {
                return (
                  <div
                    key={trip.id}
                    className="bg-card rounded-2xl shadow-sm border border-border/40 p-4 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[15px] text-muted-foreground">
                          {trip.agency}
                        </h3>
                        <p className="text-[12px] text-muted-foreground">{trip.busType}</p>
                        <p className="text-[13px] font-semibold pt-1 text-muted-foreground">
                          {trip.departureTime} - {trip.arrivalTime}
                        </p>
                        <p className="text-[11px] font-bold text-destructive pt-1">Sold Out</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-base font-bold text-muted-foreground">
                          {formatCurrency(trip.price, trip.currency)}
                        </p>
                        <p className="text-[12px] text-muted-foreground font-medium">Direct</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={trip.id}
                  to="/buses/$tripId"
                  params={{ tripId: trip.id }}
                  className="block active:scale-[0.98] transition-transform"
                >
                  <div className="bg-card rounded-2xl shadow-sm border border-border/40 p-4 hover:border-primary/40 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[15px] leading-none text-foreground/90">
                          {trip.agency}
                        </h3>
                        <p className="text-[12px] text-muted-foreground">{trip.busType}</p>
                        <p className="text-[13px] font-semibold pt-1 text-foreground/80">
                          {trip.departureTime} - {trip.arrivalTime}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-500 pt-1">
                          {available} Seats left
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-base font-bold text-primary">
                          {formatCurrency(trip.price, trip.currency)}
                        </p>
                        <p className="text-[12px] text-muted-foreground font-medium">Direct</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
