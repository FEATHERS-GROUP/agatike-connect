import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { mockBusTrips } from "@/lib/mock-bus-data";

export const Route = createFileRoute("/buses/$tripId")({
  component: BusTripDetails,
});

function BusTripDetails() {
  const { tripId } = Route.useParams();
  const trip = mockBusTrips.find((t) => t.id === tripId);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Trip not found</h2>
          <Link to="/buses" className="text-primary hover:underline mt-4 inline-block">Back to search</Link>
        </div>
      </div>
    );
  }

  const { layout } = trip;

  const totalSeats = layout.seats.length;
  const bookedSeatsCount = layout.seats.filter(s => s.isBooked).length;
  const isBusFull = totalSeats === bookedSeatsCount;

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * trip.price;

  // Group seats by row for easier rendering
  // The layout.seats is a flat array, we need to reconstruct rows based on the pattern
  const rows = useMemo(() => {
    const r = [];
    let seatIndex = 0;
    for (let i = 0; i < layout.rows; i++) {
      const rowItems = [];
      for (const itemType of layout.pattern) {
        if (itemType === "seat") {
          rowItems.push(layout.seats[seatIndex]);
          seatIndex++;
        } else {
          rowItems.push(null); // represents aisle
        }
      }
      r.push(rowItems);
    }
    return r;
  }, [layout]);

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground pb-24 md:pb-0">
      <div className="hidden md:block bg-background">
        <Navbar />
      </div>

      {/* Premium Header Banner */}
      <div className="bg-background border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-5xl px-4 py-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/buses" className="h-10 w-10 bg-background border border-border/60 shadow-sm flex items-center justify-center rounded-full hover:bg-secondary transition-colors shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight">
                <span>{trip.origin.split(",")[0]}</span>
                <div className="flex items-center text-muted-foreground/50 px-2">
                  <div className="h-[2px] w-4 bg-muted-foreground/50 rounded-full" />
                  <ArrowRight className="h-5 w-5 mx-1" />
                  <div className="h-[2px] w-4 bg-muted-foreground/50 rounded-full" />
                </div>
                <span>{trip.destination.split(",")[0]}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md text-foreground">
                  <img src={trip.agencyLogo} alt={trip.agency} className="w-4 h-4 rounded-full" />
                  {trip.agency}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {trip.date} at {trip.departureTime}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-background border border-border/60 rounded-xl p-3 shadow-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Base Price</p>
              <p className="text-lg font-bold text-primary">{trip.currency} {trip.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-5xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        
        {/* Left Column: Seating Map */}
        <div className="flex flex-col gap-6">
          <div className="bg-background border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Select Your Seats</h2>
                <p className="text-sm text-muted-foreground mt-1">Click on an available seat to select it.</p>
              </div>
              {isBusFull && <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-semibold"><AlertCircle className="h-4 w-4" /> Bus Full</span>}
            </div>

            {/* Legend (Compact) */}
            <div className="flex flex-wrap items-center gap-5 mb-10 text-sm justify-center bg-secondary/40 p-3 rounded-xl border border-border/40 inline-flex mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-border bg-background"></div>
                <span className="font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-secondary border border-border/60 opacity-50 flex items-center justify-center">
                  <div className="w-3 h-[1px] bg-muted-foreground rotate-45 absolute" />
                </div>
                <span className="font-medium text-muted-foreground">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-amber-500/40 bg-amber-500/10"></div>
                <span className="font-medium text-amber-600">VIP</span>
              </div>
            </div>

            {/* Bus Layout Container (Tighter) */}
            <div className="relative mx-auto bg-card border-4 border-border/80 rounded-[3rem] rounded-b-[1.5rem] p-5 pb-10 w-fit min-w-[260px] shadow-lg">
              
              {/* Bus Front Windshield */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-secondary/80 rounded-t-[2.5rem] border-b-2 border-border/40"></div>

              {/* Driver Section */}
              <div className="relative z-10 mb-8 flex justify-end px-2 border-b border-border/40 pb-4 mt-6">
                <div className="w-10 h-10 rounded-full border-2 border-border/80 bg-background flex items-center justify-center text-muted-foreground">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40"></div>
                </div>
              </div>

              {/* Seats Matrix */}
              <div className="relative z-10 flex flex-col gap-3">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-3 justify-center">
                    {row.map((seat, colIndex) => {
                      if (seat === null) {
                        return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-6 relative"></div>; // Tighter aisle
                      }

                      const isSelected = selectedSeats.includes(seat.id);
                      
                      let seatColorClass = "text-muted-foreground";
                      let bgColorClass = "bg-background border-border hover:border-primary/60 hover:text-primary";
                      
                      if (seat.isBooked) {
                        bgColorClass = "bg-secondary border-border/60 opacity-40 cursor-not-allowed";
                        seatColorClass = "text-muted-foreground";
                      } else if (isSelected) {
                        bgColorClass = "bg-primary border-primary shadow-md";
                        seatColorClass = "text-primary-foreground";
                      } else if (seat.isVip) {
                        bgColorClass = "bg-amber-50 border-amber-300 hover:border-amber-500";
                        seatColorClass = "text-amber-700";
                      }

                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.id)}
                          className={`relative w-11 h-12 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-200 border-2 ${bgColorClass} ${seatColorClass} ${isSelected ? 'scale-105' : ''}`}
                          title={seat.isVip ? `Seat ${seat.number} (VIP)` : `Seat ${seat.number}`}
                        >
                          {/* Chair SVG Top-Down */}
                          <svg viewBox="0 0 24 24" fill="currentColor" className="absolute inset-0 w-full h-full p-1 opacity-70 z-0 pointer-events-none">
                            <rect x="5" y="2" width="14" height="4" rx="1" className="opacity-90" />
                            <rect x="6" y="7" width="12" height="12" rx="1.5" />
                            <rect x="3" y="9" width="2" height="9" rx="1" className="opacity-80" />
                            <rect x="19" y="9" width="2" height="9" rx="1" className="opacity-80" />
                          </svg>

                          <span className="relative z-10 bg-background/90 px-1 rounded shadow-sm mt-0.5 text-foreground">{seat.number}</span>
                          
                          {seat.isVip && !isSelected && !seat.isBooked && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-background z-20"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Summary Sticky */}
        <div className="sticky top-24">
          <div className="bg-background rounded-3xl shadow-[var(--shadow-card)] overflow-hidden border border-border/60">
            {/* Ticket Header */}
            <div className="bg-secondary/40 p-6 border-b border-border/60 border-dashed relative">
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-secondary/30 rounded-full border-r border-t border-border/60 rotate-45" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-secondary/30 rounded-full border-l border-t border-border/60 -rotate-45" />
              
              <h3 className="font-bold text-lg mb-4">Ticket Summary</h3>
              
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border border-dashed border-l border-border/60" />
                <div className="relative">
                  <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Departure</p>
                  <p className="font-semibold">{trip.origin}</p>
                  <p className="text-sm text-muted-foreground">{trip.departureTime}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-primary" />
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Arrival</p>
                  <p className="font-semibold">{trip.destination}</p>
                  <p className="text-sm text-muted-foreground">{trip.arrivalTime}</p>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-semibold">{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedSeats.map(id => {
                      const seat = layout.seats.find(s => s.id === id);
                      return (
                        <span key={id} className="text-xs font-medium bg-secondary px-2 py-1 rounded-md border border-border/40">
                          {seat?.number} {seat?.isVip && <span className="text-amber-600">(VIP)</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price per seat</span>
                  <span className="font-medium">{trip.currency} {trip.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-secondary/20 rounded-2xl p-4 flex justify-between items-center mb-6 border border-border/40">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">{trip.currency} {totalPrice.toLocaleString()}</span>
              </div>

              <Button 
                className="w-full rounded-xl h-12 text-md shadow-[var(--shadow-glow)] transition-transform active:scale-95" 
                style={{ background: "var(--gradient-primary)" }}
                disabled={selectedSeats.length === 0 || isBusFull}
              >
                {isBusFull ? "Trip Fully Booked" : selectedSeats.length === 0 ? "Select Seats" : "Continue to Payment"}
              </Button>
            </div>
          </div>
        </div>

      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
