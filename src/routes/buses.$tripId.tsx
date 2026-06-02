import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowLeftRight, Bell, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-secondary/20 text-foreground font-sans relative">
      
      {/* ================================================================================= */}
      {/* MOBILE VIEW */}
      {/* ================================================================================= */}
      <div className="block md:hidden pb-24">
        {/* Mobile Premium Curved Header */}
        <div 
          className="relative pt-12 pb-24 px-4 rounded-b-[2rem] z-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="mx-auto flex items-center justify-between mb-6">
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

          <div className="mx-auto text-center text-primary-foreground space-y-2 mt-4">
            <p className="text-primary-foreground/90 font-medium text-lg">Select your Seats</p>
            <div className="flex items-center justify-center gap-4 text-2xl font-bold py-2">
              <span>{trip.origin.split(",")[0]}</span>
              <ArrowLeftRight className="h-5 w-5 opacity-90" />
              <span>{trip.destination.split(",")[0]}</span>
            </div>
            <p className="text-sm text-primary-foreground/80 font-medium">{trip.date} | {trip.departureTime}</p>
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="mx-4 grid gap-6 relative z-10 -mt-10">
          
          {/* Trip Details Card */}
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

          {/* Seat Map Area */}
          <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm mb-8">
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

            <div className="relative mx-auto bg-card border-[3px] border-border/50 rounded-[3rem] p-6 pb-12 w-fit min-w-[280px]">
              <div className="absolute top-0 left-0 right-0 h-16 bg-secondary/30 rounded-t-[2.5rem] border-b border-border/30 flex items-center justify-end px-6">
                <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center mt-4">
                   <div className="w-2 h-2 rounded-full bg-border"></div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-4 mt-16">
                 <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <span className="text-border text-2xl font-bold tracking-[0.5em] -rotate-90 whitespace-nowrap opacity-60">LOWER DECK</span>
                 </div>

                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4 justify-center relative z-10">
                    {row.map((seat, colIndex) => {
                      if (seat === null) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-8"></div>;

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
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-background/95 backdrop-blur-xl border-t border-border/60 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
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

      {/* ================================================================================= */}
      {/* DESKTOP VIEW */}
      {/* ================================================================================= */}
      <div className="hidden md:flex flex-col min-h-screen bg-background">
        <Navbar />
        
        {/* Desktop Header */}
        <div className="border-b border-border/60 bg-secondary/10 relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 py-10 relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/buses" className="h-12 w-12 bg-background border border-border/60 shadow-sm flex items-center justify-center rounded-2xl hover:bg-secondary transition-colors shrink-0 group">
                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              <div>
                <div className="flex items-center gap-4 text-3xl font-bold tracking-tight text-foreground">
                  <span>{trip.origin.split(",")[0]}</span>
                  <ArrowLeftRight className="h-6 w-6 text-muted-foreground/60" />
                  <span>{trip.destination.split(",")[0]}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-2 bg-background border border-border/40 shadow-sm px-3 py-1.5 rounded-full text-foreground">
                    <img src={trip.agencyLogo} alt={trip.agency} className="w-5 h-5 rounded-full" />
                    {trip.agency}
                  </span>
                  <span>•</span>
                  <span>{trip.date} at {trip.departureTime}</span>
                  <span>•</span>
                  <span className="text-primary font-bold">{trip.currency} {trip.price.toLocaleString()} base</span>
                </div>
              </div>
            </div>
            
            <div className="text-right bg-background border border-border/40 p-4 rounded-2xl shadow-sm">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
               {isBusFull ? (
                 <span className="inline-flex items-center gap-1.5 text-destructive font-semibold"><AlertCircle className="h-4 w-4" /> Fully Booked</span>
               ) : (
                 <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold"><CheckCircle2 className="h-4 w-4" /> {totalSeats - bookedSeatsCount} Seats Available</span>
               )}
            </div>
          </div>
        </div>

        {/* Desktop Main Content Grid */}
        <div className="mx-auto max-w-6xl w-full px-6 py-12 grid grid-cols-[1fr_380px] gap-10 items-start">
          
          {/* Left Column: Seating Map */}
          <div className="flex flex-col gap-6">
            <div className="bg-card border border-border/60 rounded-3xl p-10 shadow-sm">
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold">Select Your Seats</h2>
                <p className="text-muted-foreground mt-2">Click on any available seat to add it to your booking.</p>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 mb-12 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-secondary border border-border/60"></div>
                  <span className="text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-secondary/30 border border-border"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary shadow-sm shadow-primary/40"></div>
                  <span className="text-primary">Selected</span>
                </div>
              </div>

              {/* Bus Layout Container */}
              <div className="relative mx-auto bg-background border-4 border-border/50 rounded-[4rem] rounded-b-[2rem] p-8 pb-16 w-fit min-w-[320px] shadow-inner">
                <div className="absolute top-0 left-0 right-0 h-20 bg-secondary/30 rounded-t-[3.5rem] border-b border-border/40 flex items-center justify-end px-8">
                  <div className="w-10 h-10 rounded-full border-2 border-border/60 bg-background flex items-center justify-center mt-6">
                     <div className="w-3 h-3 rounded-full bg-border"></div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col gap-5 mt-24">
                   <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                      <span className="text-border text-3xl font-bold tracking-[0.5em] -rotate-90 whitespace-nowrap opacity-50">LOWER DECK</span>
                   </div>

                  {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-5 justify-center relative z-10">
                      {row.map((seat, colIndex) => {
                        if (seat === null) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10"></div>;

                        const isSelected = selectedSeats.includes(seat.id);
                        let bgColorClass = "bg-secondary/40 border-border hover:border-primary/40 hover:shadow-sm";
                        
                        if (seat.isBooked) {
                          bgColorClass = "bg-secondary border-border/60 cursor-not-allowed opacity-60";
                        } else if (isSelected) {
                          bgColorClass = "bg-primary border-primary shadow-md";
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={seat.isBooked}
                            onClick={() => toggleSeat(seat.id)}
                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${bgColorClass} ${isSelected ? 'scale-110' : 'active:scale-95'}`}
                          >
                             {isSelected && <CheckCircle2 className="h-5 w-5 text-primary-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Ticket Summary */}
          <div className="sticky top-24">
            <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] overflow-hidden border border-border/60">
              <div className="bg-secondary/30 p-8 border-b border-border/60">
                <h3 className="font-bold text-xl mb-6">Booking Summary</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-even:text-left">
                       <p className="text-sm font-bold">{trip.origin}</p>
                       <p className="text-xs text-muted-foreground font-medium">{trip.departureTime}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-even:text-left">
                       <p className="text-sm font-bold">{trip.destination}</p>
                       <p className="text-xs text-muted-foreground font-medium">{trip.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Selected Seats</span>
                    <span className="font-bold">{selectedSeats.length > 0 ? selectedSeats.length : 'None'}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
                      {selectedSeats.map(id => {
                        const seat = layout.seats.find(s => s.id === id);
                        return (
                          <span key={id} className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                            Seat {seat?.number}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Price per seat</span>
                    <span className="font-bold">{trip.currency} {trip.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-background rounded-2xl p-5 flex justify-between items-center mb-8 border border-border/60 shadow-sm">
                  <span className="font-bold text-lg text-muted-foreground">Total</span>
                  <span className="text-3xl font-black text-primary">{trip.currency} {totalPrice.toLocaleString()}</span>
                </div>

                <Button 
                  className="w-full rounded-2xl h-16 text-lg font-bold shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]" 
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={selectedSeats.length === 0 || isBusFull}
                >
                  {isBusFull ? "Trip Fully Booked" : selectedSeats.length === 0 ? "Select Seats" : "Continue to Payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

