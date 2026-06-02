import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowLeftRight, Bell } from "lucide-react";
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
          <Link to="/buses/mobile" className="text-primary hover:underline mt-4 inline-block">Back to search</Link>
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
    <div className="min-h-screen bg-secondary/20 text-foreground pb-24 md:pb-0 font-sans relative">
      <div className="hidden md:block bg-background">
        <Navbar />
      </div>

      {/* Mobile Premium Curved Header */}
      <div 
        className="relative pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] md:rounded-none z-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
          <Link to="/buses/mobile" className="flex items-center gap-2 text-primary-foreground">
            <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg">Booking Details</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm text-primary-foreground">
            <Bell className="h-4 w-4 fill-current" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center text-primary-foreground space-y-2 mt-4">
          <p className="text-primary-foreground/90 font-medium text-lg">Select your Seats</p>
          <div className="flex items-center justify-center gap-4 text-2xl font-bold py-2">
            <span>{trip.origin.split(",")[0]}</span>
            <ArrowLeftRight className="h-5 w-5 opacity-90" />
            <span>{trip.destination.split(",")[0]}</span>
          </div>
          <p className="text-sm text-primary-foreground/80 font-medium">{trip.date} | {trip.departureTime}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start relative z-10 -mt-10">
        
        {/* Left Column: Seating Map */}
        <div className="flex flex-col gap-6">
          {/* Trip Details Card (Floating) */}
          <div className="bg-card rounded-2xl shadow-lg border border-border/40 p-5 flex items-center justify-between">
             <div className="space-y-1">
               <p className="font-bold text-lg">{trip.agency}</p>
               <p className="text-xs text-muted-foreground font-medium">{trip.busType}</p>
               <p className="text-sm font-semibold mt-2">{trip.departureTime} - {trip.arrivalTime}</p>
               <p className="text-xs text-primary font-bold mt-1">{totalSeats - bookedSeatsCount} Seats left</p>
             </div>
             <div className="text-right space-y-1 flex flex-col justify-between h-full">
               <p className="font-bold text-xl text-primary">{trip.currency} {trip.price.toLocaleString()}</p>
               <p className="text-xs text-muted-foreground font-medium mt-auto">Direct</p>
             </div>
          </div>

          <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm mb-8 md:mb-0">
            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mb-8 text-xs font-semibold">
              <div className="flex items-center gap-2 flex-col">
                <div className="w-6 h-6 rounded-md bg-secondary border border-border/60"></div>
                <span className="text-muted-foreground">Booked</span>
              </div>
              <div className="flex items-center gap-2 flex-col">
                <div className="w-6 h-6 rounded-md bg-secondary/30 border border-border"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2 flex-col">
                <div className="w-6 h-6 rounded-md bg-primary shadow-sm shadow-primary/40"></div>
                <span className="text-primary">Your Seat</span>
              </div>
            </div>

            {/* Bus Layout Container */}
            <div className="relative mx-auto bg-card border-[3px] border-border/50 rounded-[3rem] p-6 pb-12 w-fit min-w-[280px]">
              
              {/* Bus Front */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-secondary/30 rounded-t-[2.5rem] border-b border-border/30 flex items-center justify-end px-6">
                <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center mt-4">
                   {/* Steering wheel dot */}
                   <div className="w-2 h-2 rounded-full bg-border"></div>
                </div>
              </div>

              {/* Seats Matrix */}
              <div className="relative z-10 flex flex-col gap-4 mt-16">
                 {/* Lower Deck Text in Aisle */}
                 <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <span className="text-border text-2xl font-bold tracking-[0.5em] -rotate-90 whitespace-nowrap opacity-60">LOWER DECK</span>
                 </div>

                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4 justify-center relative z-10">
                    {row.map((seat, colIndex) => {
                      if (seat === null) {
                        return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-8"></div>;
                      }

                      const isSelected = selectedSeats.includes(seat.id);
                      
                      let bgColorClass = "bg-secondary/40 border-border";
                      
                      if (seat.isBooked) {
                        bgColorClass = "bg-secondary border-border/60 cursor-not-allowed opacity-60";
                      } else if (isSelected) {
                        bgColorClass = "bg-primary border-primary shadow-sm shadow-primary/40";
                      } else if (seat.isVip) {
                        bgColorClass = "bg-amber-100 border-amber-300";
                      }

                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.id)}
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${bgColorClass} ${isSelected ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
                        >
                           {/* Empty square for seat */}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Bottom Bar: Ticket Summary */}
        <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-24 z-50 md:z-auto">
          <div className="bg-background/95 backdrop-blur-xl md:bg-card md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[var(--shadow-card)] border-t md:border border-border/60 p-4 md:p-6 pb-safe">
            
            <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Price</p>
                  <p className="text-2xl font-bold text-primary">{trip.currency} {totalPrice.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-sm font-bold">{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1 min-h-[16px]">
                    {selectedSeats.length > 0 ? selectedSeats.map(id => layout.seats.find(s => s.id === id)?.number).join(", ") : "None selected"}
                  </p>
               </div>
            </div>

            <Button 
              className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg transition-transform active:scale-[0.98]" 
              style={{ background: "var(--gradient-primary)" }}
              disabled={selectedSeats.length === 0 || isBusFull}
            >
              {isBusFull ? "Trip Fully Booked" : selectedSeats.length === 0 ? "Select Seats" : "Continue"}
            </Button>
          </div>
        </div>

      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

