import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Lock, MapPin, Calendar, CheckCircle2, Ticket } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMovieSchedulesByMovieId } from "@/api/cinemas";
import { createCinemaBooking } from "@/api/cinema_bookings";
import { toast } from "sonner";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { Route } from "@/routes/book-movie/$movieId";

export function MovieBookingMobile({ movieId }: { movieId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { user } = useUserAuth();
  const { date: searchDate } = Route.useSearch();

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  
  const [attendeeInfo, setAttendeeInfo] = useState({
    firstName: user?.username?.split(" ")[0] || "",
    lastName: user?.username?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const actualMovieId = movieId.substring(0, 36);
  const actualCinemaId = movieId.substring(37);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["movie-schedules", actualMovieId, actualCinemaId],
    queryFn: () => getMovieSchedulesByMovieId({ data: { movieId: actualMovieId, cinemaId: actualCinemaId } } as any),
  });

  const activeMovie = schedules.length > 0 ? schedules[0].movie : null;
  const cinema = schedules.length > 0 ? schedules[0].cinema : null;
  const currency = schedules.length > 0 ? schedules[0].currency : "RWF";

  // Compute unique dates
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(schedules.map((st: any) => st.show_date))).sort() as string[];
  }, [schedules]);

  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      if (searchDate && uniqueDates.includes(searchDate)) {
        setSelectedDate(searchDate);
      } else {
        setSelectedDate(uniqueDates[0]);
      }
    }
  }, [uniqueDates, selectedDate, searchDate]);

  const schedulesForDate = useMemo(() => {
    return schedules.filter((st: any) => st.show_date === selectedDate);
  }, [schedules, selectedDate]);

  const currentSchedule = useMemo(() => {
    if (!selectedScheduleId && schedulesForDate.length > 0) {
      return schedulesForDate[0];
    }
    return schedulesForDate.find((s: any) => s.id === selectedScheduleId) || schedulesForDate[0];
  }, [schedulesForDate, selectedScheduleId]);

  useEffect(() => {
    if (currentSchedule && currentSchedule.id !== selectedScheduleId) {
      setSelectedScheduleId(currentSchedule.id);
      setTicketQuantities({}); // Reset cart on schedule change
    }
  }, [currentSchedule, selectedScheduleId]);

  const activeTiers = useMemo(() => {
    if (!currentSchedule) return [];
    if (currentSchedule.ticket_tiers && currentSchedule.ticket_tiers.length > 0) {
      return currentSchedule.ticket_tiers.map((t: any) => ({
        id: t.id,
        tierId: t.ticket_tier.id,
        name: t.ticket_tier.name,
        price: t.price_override || t.ticket_tier.price,
      }));
    }
    // Fallback if no tiers
    return [
      {
        id: "default",
        tierId: "default",
        name: "General Admission",
        price: currentSchedule.base_price || 10,
      }
    ];
  }, [currentSchedule]);

  const updateQuantity = (tierId: string, delta: number) => {
    setTicketQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const totalTickets = Object.values(ticketQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(ticketQuantities).reduce((sum, [tierId, qty]) => {
    const tier = activeTiers.find((t: any) => t.id === tierId);
    return sum + (tier ? parseFloat(tier.price) * qty : 0);
  }, 0);

  const isFormValid =
    totalTickets > 0 &&
    attendeeInfo.firstName &&
    attendeeInfo.lastName &&
    attendeeInfo.email;

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      const promises = [];
      const fullName = `${attendeeInfo.firstName} ${attendeeInfo.lastName}`.trim();
      
      for (const [tierId, qty] of Object.entries(ticketQuantities)) {
        if (qty <= 0) continue;
        
        const payload = {
          cinema_id: cinema.id,
          schedule_id: currentSchedule.id,
          ticket_tier_id: tierId === "default" ? null : activeTiers.find((t: any) => t.id === tierId)?.tierId,
          names: fullName,
          email: attendeeInfo.email,
          phone: attendeeInfo.phone,
          quantity: qty,
          total_price: activeTiers.find((t: any) => t.id === tierId)?.price * qty,
          currency: currency,
          payment_method: paymentMethod,
          status: "Confirmed", // In reality, depends on payment validation
        };

        promises.push(createCinemaBooking({ data: { object: payload } } as any));
      }
      return Promise.all(promises);
    },
    onSuccess: () => {
      setIsPaymentModalOpen(false);
      setIsSuccess(true);
    },
    onError: (e: any) => {
      toast.error(e.message || "Checkout failed");
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Movie ticket booked!");
      const timer = setTimeout(() => {
        navigate({ to: "/movies", replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  if (isLoading || !activeMovie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
          Your tickets for {activeMovie.title} have been secured. 
          A confirmation with your QR code has been sent to {attendeeInfo.email}.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          Redirecting to movies...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 pt-safe-top flex items-center bg-background/80 backdrop-blur-xl border-b border-border/40">
        <button
          onClick={() => router.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg tracking-tight ml-2">Checkout</h1>
      </div>

      <main className="px-4 py-6 space-y-8">
        {/* Movie Info */}
        <div className="flex gap-4">
          <img src={activeMovie.cover_url} alt={activeMovie.title} className="h-24 w-20 rounded-xl object-cover" />
          <div className="flex flex-col">
            <h3 className="font-semibold leading-tight">{activeMovie.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {cinema?.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentSchedule?.show_date} • {currentSchedule?.start_time?.substring(0, 5)}
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Step 1: Select Showtime
            </h3>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
              {schedulesForDate.map((st: any) => {
                const isSelected = st.id === currentSchedule?.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedScheduleId(st.id)}
                    className={`shrink-0 rounded-xl px-5 py-2 text-sm font-bold border transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                        : "bg-background border-border/60 hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {st.start_time.substring(0, 5)}
                  </button>
                );
              })}
            </div>
            <div className="pt-4">
              <Button className="w-full" onClick={() => setStep(2)}>Continue to Tickets</Button>
            </div>
          </div>
        )}

        {step === 2 && currentSchedule && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" /> Step 2: Select Tickets
            </h3>
            <div className="space-y-3">
              {activeTiers.map((tier: any) => {
                const qty = ticketQuantities[tier.id] || 0;
                return (
                  <div key={tier.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card/40 shadow-sm">
                    <div>
                      <p className="font-bold">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(parseFloat(tier.price), currency)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateQuantity(tier.id, -1)}
                        disabled={qty === 0}
                        className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{qty}</span>
                      <button
                        onClick={() => updateQuantity(tier.id, 1)}
                        className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={totalTickets === 0} onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Step 3: Your Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={attendeeInfo.firstName}
                  onChange={(e) => setAttendeeInfo({ ...attendeeInfo, firstName: e.target.value })}
                  placeholder="Alex"
                  className="bg-card/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={attendeeInfo.lastName}
                  onChange={(e) => setAttendeeInfo({ ...attendeeInfo, lastName: e.target.value })}
                  placeholder="Doe"
                  className="bg-card/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={attendeeInfo.email}
                onChange={(e) => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })}
                placeholder="alex@example.com"
                className="bg-card/40"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone (Optional)</Label>
              <Input
                type="tel"
                value={attendeeInfo.phone}
                onChange={(e) => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })}
                placeholder="+250 788 123 456"
                className="bg-card/40"
              />
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Back</Button>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/80 backdrop-blur-xl border-t border-border/40 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{totalTickets} Ticket(s)</span>
          <span className="font-black text-lg">{formatCurrency(totalPrice, currency)}</span>
        </div>
        <Button
          disabled={
            (step === 1 && !selectedScheduleId) || 
            (step === 2 && totalTickets === 0) || 
            (step === 3 && (!isFormValid || isCheckingOut))
          }
          className="w-full h-14 rounded-2xl text-base font-bold shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
          onClick={() => {
            if (step === 1) setStep(2);
            else if (step === 2) setStep(3);
            else setIsPaymentModalOpen(true);
          }}
        >
          {step === 1 ? (
            "Continue to Tickets"
          ) : step === 2 ? (
            totalTickets > 0 ? "Continue to Details" : "Select Tickets"
          ) : isCheckingOut ? (
            "Processing..."
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" /> Pay Now
            </>
          )}
        </Button>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={doCheckout as any}
        amount={totalPrice}
        currency={currency}
      />
    </div>
  );
}
