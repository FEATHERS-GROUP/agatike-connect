import { createFileRoute, Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ChevronDown,
  ArrowLeftRight,
  Bus,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockBusTrips } from "@/lib/mock-bus-data";

export const Route = createFileRoute("/buses/")({
  head: () => ({
    meta: [
      { title: "Bus Tickets — Agatike" },
      { name: "description", content: "Book bus tickets across East Africa instantly." },
    ],
  }),
  component: BusesIndex,
});

function BusesIndex() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("All");

  const agencies = ["All", ...Array.from(new Set(mockBusTrips.map((t) => t.agency)))];

  const filteredTrips = mockBusTrips.filter((trip) => {
    if (from && !trip.origin.toLowerCase().includes(from.toLowerCase())) return false;
    if (to && !trip.destination.toLowerCase().includes(to.toLowerCase())) return false;
    if (date && trip.date !== date) return false;
    if (agencyFilter !== "All" && trip.agency !== agencyFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />

      {/* Hero & Search Section */}
      <section className="relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]"></div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 lg:py-24">
          <div className="max-w-2xl text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
              Cross borders with ease.
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg font-medium">
              Book bus tickets across East Africa instantly. Choose your seat, pay with mobile
              money, and get your digital ticket.
            </p>
          </div>

          {/* Premium Desktop Search Card */}
          <div className="mt-10 rounded-3xl border border-border/40 bg-card/60 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 max-w-[1000px] mx-auto md:mx-0">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Locations */}
              <div className="flex-1 flex w-full bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-1 flex items-center group">
                  <MapPin className="absolute left-4 h-5 w-5 text-primary" />
                  <Input
                    className="w-full pl-12 h-14 bg-transparent border-0 shadow-none text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    placeholder="Leaving from..."
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="w-px bg-border/60 my-2 mx-1" />
                <button
                  onClick={() => {
                    const tmp = from;
                    setFrom(to);
                    setTo(tmp);
                  }}
                  className="h-10 w-10 shrink-0 self-center rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/40 shadow-sm z-10 hover:scale-105 active:scale-95"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
                <div className="w-px bg-border/60 my-2 mx-1" />
                <div className="relative flex-1 flex items-center group">
                  <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="w-full pl-12 h-14 bg-transparent border-0 shadow-none text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    placeholder="Going to..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Date & Agency */}
              <div className="flex w-full md:w-[380px] shrink-0 bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-[0.8] flex items-center group">
                  <Calendar className="absolute left-4 h-4 w-4 text-primary" />
                  <Input
                    type="date"
                    className="w-full pl-11 pr-2 h-14 bg-transparent border-0 shadow-none text-[14px] font-medium focus-visible:ring-0"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="w-px bg-border/60 my-2 mx-1" />
                <div className="relative flex-1 flex items-center group">
                  <Bus className="absolute left-4 h-4 w-4 text-primary" />
                  <select
                    className="w-full pl-11 pr-8 h-14 bg-transparent border-0 text-[14px] font-medium focus:outline-none appearance-none"
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                  >
                    {agencies.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Search Action */}
              <Button
                className="h-[64px] px-8 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 shrink-0 w-full md:w-auto active:scale-[0.98] transition-transform"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Search className="h-5 w-5 mr-2" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Trip Listings */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {filteredTrips.length} trips available
              </h2>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-border/60 text-muted-foreground bg-secondary/20">
                <p className="text-lg font-medium">No trips found</p>
                <p className="mt-1 text-sm">Try adjusting your filters or date.</p>
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {/* Left: Agency & Type */}
                    <div className="flex items-center gap-4 md:w-56 shrink-0">
                      <div className="h-14 w-14 rounded-2xl border border-border/40 p-1 bg-secondary/30 shrink-0">
                        <img
                          src={trip.agencyLogo}
                          alt={trip.agency}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{trip.agency}</p>
                        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground mt-1">
                          {trip.busType}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Route & Time (Ticket Style) */}
                    <div className="flex-1 flex items-center justify-between gap-4 text-center">
                      <div className="flex flex-col items-end flex-1">
                        <span className="text-2xl font-bold tracking-tight">
                          {trip.departureTime}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium mt-1">
                          {trip.origin}
                        </span>
                      </div>

                      <div className="flex flex-col items-center px-2 sm:px-6 w-32 shrink-0 relative">
                        <span className="text-xs font-medium text-primary mb-2 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> {trip.date}
                        </span>

                        <div className="w-full flex items-center relative">
                          <div className="h-2 w-2 rounded-full border-2 border-primary bg-background z-10" />
                          <div className="flex-1 h-[2px] bg-border border-t-2 border-dashed border-border" />
                          <div className="h-2 w-2 rounded-full border-2 border-primary bg-primary z-10 shadow-[0_0_8px_var(--primary)]" />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">
                          Direct
                        </span>
                      </div>

                      <div className="flex flex-col items-start flex-1">
                        <span className="text-2xl font-bold tracking-tight">
                          {trip.arrivalTime}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium mt-1">
                          {trip.destination}
                        </span>
                      </div>
                    </div>

                    {/* Right: Price & CTA */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center md:w-48 shrink-0 gap-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-border/40 md:pl-8">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          From
                        </p>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(trip.price, trip.currency)}
                        </p>
                      </div>
                      <Link
                        to="/buses/$tripId"
                        params={{ tripId: trip.id }}
                        className="w-full md:w-auto"
                      >
                        <Button
                          className="w-full rounded-xl px-8 shadow-[var(--shadow-glow)] transition-all group-hover:scale-105"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          View Seats <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
