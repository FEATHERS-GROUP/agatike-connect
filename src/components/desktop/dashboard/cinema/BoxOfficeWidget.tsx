import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSchedules } from "@/api/cinema_management";
import { createCinemaBooking } from "@/api/cinema_bookings";
import { CreditCard, Banknote, Smartphone, Check, Loader2, CalendarDays, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function BoxOfficeWidget({ cinemaId, workspaceSlug }: { cinemaId: string, workspaceSlug: string }) {
  const navigate = useNavigate();
  const searchParams = useRouterState({ select: (s) => (s.location.search as any) });
  
  const isOpen = searchParams.pos === "true";

  const onOpenChange = (open: boolean) => {
    navigate({
      search: (prev: any) => ({ ...prev, pos: open ? "true" : undefined })
    });
  };

  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customer, setCustomer] = useState({ names: "", email: "", phone: "" });
  const [countryCode, setCountryCode] = useState("+250");
  const [searchShowtime, setSearchShowtime] = useState("");

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["cinema_schedules", cinemaId],
    queryFn: () => getSchedules({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId && isOpen,
  });

  const now = new Date();
  const activeSchedules = schedules.filter((s: any) => {
    const timeStr = s.end_time || s.start_time || "00:00:00";
    return new Date(`${s.show_date}T${timeStr}`) >= now;
  });

  const filteredSchedules = activeSchedules.filter((s: any) => {
    if (!searchShowtime) return true;
    return (s.movie?.title || "").toLowerCase().includes(searchShowtime.toLowerCase());
  }).slice(0, 8);

  const selectedSchedule = activeSchedules.find((s: any) => s.id === selectedScheduleId);
  const ticketTiers = selectedSchedule?.ticket_tiers || [];
  const selectedTier = ticketTiers.find((t: any) => t.ticket_tier.id === selectedTierId);
  
  const unitPrice = selectedTier ? (selectedTier.price_override || selectedTier.ticket_tier.price) : 0;
  const currency = selectedTier ? (selectedTier.currency || selectedTier.ticket_tier.currency || "RWF") : "RWF";
  const totalPrice = unitPrice * quantity;

  const createMutation = useMutation({
    mutationFn: (bookingData: any) => createCinemaBooking({ data: { object: bookingData } }),
    onSuccess: (data) => {
      toast.success("Booking successful!");
      // Reset state
      setSelectedScheduleId("");
      setSelectedTierId("");
      setQuantity(1);
      setCustomer({ names: "", email: "", phone: "" });
      
      // Close sheet and navigate to receipt
      onOpenChange(false);
      navigate({ to: `/dashboard/$workspaceSlug/Cinema/$cinemaId/receipt/$bookingId`, params: { workspaceSlug, cinemaId, bookingId: data.id } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking");
    }
  });

  const handleCheckout = () => {
    if (!selectedScheduleId || !selectedTierId) {
      toast.error("Please select a movie and a ticket tier");
      return;
    }
    
    createMutation.mutate({
      cinema_id: cinemaId,
      schedule_id: selectedScheduleId,
      ticket_tier_id: selectedTierId,
      names: customer.names || "Walk-in Customer",
      email: customer.email || "walkin@example.com",
      phone: customer.phone ? `${countryCode}${customer.phone}` : "0000000000",
      quantity,
      total_price: totalPrice,
      currency,
      payment_method: paymentMethod,
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-[40] flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Ticket className="h-8 w-8" />
      </button>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl p-0 flex flex-col gap-0 border-l border-border/60 z-[60] bg-background">
          <SheetHeader className="p-6 border-b border-border/60 bg-secondary/10 shrink-0">
            <SheetTitle className="text-2xl font-black text-left">Box Office POS</SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Selection */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 border-r border-border/60">
              {/* Schedule Selection */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                    Select Showtime
                  </h2>
                  <Input 
                    placeholder="Search movie..." 
                    value={searchShowtime}
                    onChange={(e) => setSearchShowtime(e.target.value)}
                    className="h-9 w-full sm:w-48 rounded-lg bg-background"
                  />
                </div>
                
                {isLoadingSchedules ? (
                  <div className="h-24 flex items-center justify-center border border-border/40 rounded-xl"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="p-6 text-center border border-border/40 rounded-xl bg-secondary/20">
                    <CalendarDays className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {searchShowtime ? "No matching showtimes." : "No upcoming showtimes."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filteredSchedules.map((s: any) => (
                      <label key={s.id} className={cn("flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all", selectedScheduleId === s.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                        <input type="radio" className="sr-only" checked={selectedScheduleId === s.id} onChange={() => { setSelectedScheduleId(s.id); setSelectedTierId(""); }} />
                        <div className="h-16 w-12 shrink-0 rounded-md bg-secondary overflow-hidden">
                          {s.movie?.cover_url && <img src={s.movie.cover_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-sm truncate">{s.movie?.title}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-primary font-bold">{s.start_time.slice(0, 5)}</span>
                            <span className="text-muted-foreground">{new Date(s.show_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* Ticket Tier Selection */}
              <section className={cn("space-y-4 transition-opacity", !selectedScheduleId && "opacity-50 pointer-events-none")}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">2</span>
                  Select Ticket
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {ticketTiers.length === 0 && selectedScheduleId ? (
                    <p className="text-xs text-destructive">No ticket tiers assigned to this showtime.</p>
                  ) : (
                    ticketTiers.map((t: any) => {
                      const price = t.price_override || t.ticket_tier.price;
                      const curr = t.currency || t.ticket_tier.currency || "RWF";
                      return (
                        <label key={t.ticket_tier.id} className={cn("flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all", selectedTierId === t.ticket_tier.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                          <input type="radio" className="sr-only" checked={selectedTierId === t.ticket_tier.id} onChange={() => setSelectedTierId(t.ticket_tier.id)} />
                          <div>
                            <p className="font-bold text-sm">{t.ticket_tier.name}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{t.ticket_tier.type}</p>
                          </div>
                          <span className="font-bold text-sm bg-background px-2 py-1 rounded-md border border-border/40">{curr} {price}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Checkout Info */}
            <div className="w-full md:w-96 shrink-0 bg-secondary/10 flex flex-col overflow-y-auto">
              <div className="p-6 space-y-6 flex-1">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                    <div className="w-12 text-center font-bold text-lg">{quantity}</div>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
                  </div>
                </div>

                <hr className="border-border/60" />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Customer Info (Optional)</Label>
                  <Input placeholder="Full Name" value={customer.names} onChange={e => setCustomer(p => ({...p, names: e.target.value}))} className="rounded-xl bg-background" />
                  <Input placeholder="Email Address" type="email" value={customer.email} onChange={e => setCustomer(p => ({...p, email: e.target.value}))} className="rounded-xl bg-background" />
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="flex h-10 w-[90px] rounded-xl border border-input bg-background px-2 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="+250">RW (+250)</option>
                      <option value="+254">KE (+254)</option>
                      <option value="+256">UG (+256)</option>
                      <option value="+255">TZ (+255)</option>
                      <option value="+243">CD (+243)</option>
                      <option value="+257">BI (+257)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                    </select>
                    <Input placeholder="Phone Number" type="tel" value={customer.phone} onChange={e => setCustomer(p => ({...p, phone: e.target.value}))} className="rounded-xl bg-background flex-1" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Cash", icon: Banknote },
                      { id: "Card", icon: CreditCard },
                      { id: "Momo", icon: Smartphone },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn("flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all gap-1", paymentMethod === method.id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-background")}
                      >
                        <method.icon className="h-4 w-4" />
                        <span className="text-[10px] font-bold">{method.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card border-t border-border/60 shrink-0">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-muted-foreground font-medium text-sm">Total</span>
                  <span className="text-2xl font-black">{currency} {totalPrice.toLocaleString()}</span>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl font-bold shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={!selectedScheduleId || !selectedTierId || createMutation.isPending}
                  onClick={handleCheckout}
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  {createMutation.isPending ? "Processing..." : "Complete Booking"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
