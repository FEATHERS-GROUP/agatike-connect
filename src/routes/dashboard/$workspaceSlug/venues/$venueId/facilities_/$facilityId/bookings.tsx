import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRentableVenueById } from "@/api/rentable_venues";
import { getVenueBookings, createVenueBooking } from "@/api/venue_bookings";
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { getUserSession } from "@/api/auth";

export const Route = createFileRoute(
  "/dashboard/$workspaceSlug/venues/$venueId/facilities_/$facilityId/bookings",
)({
  component: FacilityBookingsPage,
});

function FacilityBookingsPage() {
  const { workspaceSlug, venueId, facilityId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: startOfDay(new Date()),
  });
  
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => getUserSession(),
  });

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["venue_bookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
    enabled: !!venueId,
  });

  const facility = venue?.facilities_data?.find((f: any) => f.id === facilityId);
  const isSharedAccess = facility?.type === "shared_access";
  const isSharedSlot = facility?.type === "shared_slot";
  const durationMinutes = Number(facility?.duration_minutes) || 60;
  const perSessionRate = Number(facility?.pricing?.per_session_rate) || 0;
  const hourlyRate = Number(facility?.pricing?.hourly_rate) || 0;
  const currency = venue?.currency || "RWF";

  // Dynamic slots logic
  const DYNAMIC_SLOTS = useMemo(() => {
    const slots = [];
    const startMins = 6 * 60; // 06:00
    const endMins = 23 * 60; // 23:00
    for (let m = startMins; m < endMins; m += durationMinutes) {
      slots.push(m);
    }
    return slots;
  }, [durationMinutes]);

  const formatSlot = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const facilityBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (b.status === "Cancelled") return false;
      return b.facility_id === facilityId || (!b.facility_id && b.status === "Blocked");
    });
  }, [bookings, facilityId]);

  const getSlotStatus = (dateToCheck: Date, slotStartMins: number) => {
    if (isSharedSlot) {
      const slotStart = new Date(dateToCheck);
      slotStart.setHours(Math.floor(slotStartMins / 60), slotStartMins % 60, 0, 0);
      
      let hasCustomerBooking = false;
      let hasBlock = false;

      const totalBooked = facilityBookings.filter((b: any) => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        const slotEnd = new Date(dateToCheck);
        const endMins = slotStartMins + durationMinutes;
        slotEnd.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

        if (bStart < slotEnd.getTime() && slotStart.getTime() < bEnd) {
          if (b.status === "Blocked" || (!b.facility_id && b.status === "Blocked")) {
            hasBlock = true;
          } else {
            hasCustomerBooking = true;
          }
          return true;
        }
        return false;
      }).reduce((sum: number, b: any) => {
        if (!b.facility_id && b.status === "Blocked") return Infinity;
        return sum + (b.tickets_data?.["Facility Access"] || 1);
      }, 0);

      const maxCap = Number(facility?.max_capacity);
      if (isNaN(maxCap) || maxCap === -1) return { status: "available", bookedCount: totalBooked, maxCapacity: Infinity };
      
      if (totalBooked + 1 > maxCap) {
         if (hasCustomerBooking && !hasBlock) return { status: "booked", bookedCount: totalBooked, maxCapacity: maxCap };
         return { status: "blocked", bookedCount: totalBooked, maxCapacity: maxCap };
      }
      return { status: "available", bookedCount: totalBooked, maxCapacity: maxCap };
    }

    const booking = facilityBookings.find((b: any) => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      const slotStart = new Date(dateToCheck);
      slotStart.setHours(Math.floor(slotStartMins / 60), slotStartMins % 60, 0, 0);
      const slotEnd = new Date(dateToCheck);
      const endMins = slotStartMins + durationMinutes;
      slotEnd.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);
      return bStart < slotEnd.getTime() && slotStart.getTime() < bEnd;
    });

    if (!booking) return { status: "available", bookedCount: 0, maxCapacity: 1 };
    if (booking.status === "Blocked" || (!booking.facility_id && booking.status === "Blocked")) return { status: "blocked", bookedCount: 1, maxCapacity: 1 };
    return { status: "booked", bookedCount: 1, maxCapacity: 1 };
  };

  const daysInRange = useMemo(() => {
    const days = [];
    if (date?.from) {
      let current = new Date(date.from);
      const end = date.to || date.from;
      let safety = 0;
      while (current.getTime() <= end.getTime() && safety < 100) {
        days.push(new Date(current));
        current = addDays(current, 1);
        safety++;
      }
    }
    return days;
  }, [date]);

  const getSlotStatusAcrossRange = (slotMins: number) => {
    let finalStatus = "available";
    let maxBookedCount = 0;
    let capacity = 1;

    for (const d of daysInRange) {
      const res = getSlotStatus(d, slotMins);
      capacity = res.maxCapacity;
      if (res.bookedCount > maxBookedCount) maxBookedCount = res.bookedCount;
      if (res.status === "blocked") return { status: "blocked", bookedCount: maxBookedCount, maxCapacity: capacity };
      if (res.status === "booked") finalStatus = "booked";
    }
    return { status: finalStatus, bookedCount: maxBookedCount, maxCapacity: capacity };
  };

  const bookingsInDateRange = useMemo(() => {
    if (daysInRange.length === 0) return [];
    
    const rangeStart = new Date(daysInRange[0]);
    rangeStart.setHours(0,0,0,0);
    const rangeEnd = new Date(daysInRange[daysInRange.length - 1]);
    rangeEnd.setHours(23,59,59,999);

    return facilityBookings.filter((b: any) => {
       const bStart = new Date(b.start_time).getTime();
       return bStart >= rangeStart.getTime() && bStart <= rangeEnd.getTime() && b.status !== "Blocked";
    }).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [facilityBookings, daysInRange]);

  const handleSlotClick = (slotMins: number) => {
    if (selectedSlots.includes(slotMins)) {
      setSelectedSlots((prev) => prev.filter((s) => s !== slotMins).sort((a, b) => a - b));
    } else {
      setSelectedSlots((prev) => [...prev, slotMins].sort((a, b) => a - b));
    }
  };

  const groupedSlots = useMemo(() => {
    const morning = DYNAMIC_SLOTS.filter((s) => s < 12 * 60);
    const afternoon = DYNAMIC_SLOTS.filter((s) => s >= 12 * 60 && s < 17 * 60);
    const evening = DYNAMIC_SLOTS.filter((s) => s >= 17 * 60);
    return { morning, afternoon, evening };
  }, [DYNAMIC_SLOTS]);

  const slotPrice = (isSharedAccess || isSharedSlot) || facility?.category === "activity"
    ? perSessionRate
    : hourlyRate * (durationMinutes / 60);

  const subTotal = selectedSlots.length * slotPrice * daysInRange.length;
  // Let's assume no GST or taxes for now, but we can display the total directly
  const totalAmount = subTotal;

  const createBookingMutation = useMutation({
    mutationFn: createVenueBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venueId] });
      toast.success("Booking created successfully!");
      setSelectedSlots([]);
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking.");
    },
  });

  const handleCreateBooking = () => {
    if (!date?.from || selectedSlots.length === 0) {
      toast.error("Please select a date and at least one time slot.");
      return;
    }
    if (!customerName) {
      toast.error("Customer name is required.");
      return;
    }

    const minSlot = Math.min(...selectedSlots);
    const maxSlot = Math.max(...selectedSlots);
    
    const startTime = new Date(date.from);
    startTime.setHours(Math.floor(minSlot / 60), minSlot % 60, 0, 0);

    const endDay = date.to || date.from;
    const endTime = new Date(endDay);
    const endMins = maxSlot + durationMinutes;
    endTime.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

    createBookingMutation.mutate({
      data: {
        workspace_id: venue.workspace_id,
        venue_id: venue.id,
        user_id: session?.id,
        facility_id: facilityId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: "",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "Confirmed",
        payment_status: paymentStatus,
        payment_method: paymentMethod.toLowerCase(),
        amount: totalAmount,
        total_amount: totalAmount,
        booking_type: "facility",
        tickets_data: null,
      } as any,
    });
  };

  const handleBlockSlots = () => {
    if (!date?.from || selectedSlots.length === 0) {
      toast.error("Please select a date and at least one time slot to block.");
      return;
    }

    const minSlot = Math.min(...selectedSlots);
    const maxSlot = Math.max(...selectedSlots);
    
    const startTime = new Date(date.from);
    startTime.setHours(Math.floor(minSlot / 60), minSlot % 60, 0, 0);

    const endDay = date.to || date.from;
    const endTime = new Date(endDay);
    const endMins = maxSlot + durationMinutes;
    endTime.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

    createBookingMutation.mutate({
      data: {
        workspace_id: venue.workspace_id,
        venue_id: venue.id,
        user_id: session?.id,
        facility_id: facilityId,
        customer_name: "Blocked by Admin",
        customer_phone: "",
        customer_email: "",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "Blocked",
        payment_status: "Unpaid",
        payment_method: "cash",
        amount: 0,
        total_amount: 0,
        booking_type: "facility",
        tickets_data: null,
      } as any,
    });
  };

  const handleQuickDateSelect = (daysOffset: number) => {
    const d = addDays(startOfDay(new Date()), daysOffset);
    setDate({ from: d, to: d });
    setSelectedSlots([]);
  };

  const renderSlotGrid = (label: string, slots: number[]) => {
    if (slots.length === 0) return null;
    return (
      <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0">
        <div className="w-24 shrink-0 font-medium text-muted-foreground mt-2">{label}</div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {slots.map((slotMins) => {
            const { status, bookedCount, maxCapacity } = getSlotStatusAcrossRange(slotMins);
            const isBooked = status !== "available";
            const isSelected = selectedSlots.includes(slotMins);
            const timeString = formatSlot(slotMins);

            let dynamicClass = "";

            if (status === "blocked") {
              dynamicClass = "opacity-40 cursor-not-allowed line-through bg-secondary/20 hover:bg-secondary/20";
            } else if (isSharedSlot && maxCapacity > 0 && maxCapacity !== Infinity) {
              const fillPercentage = Math.min(100, Math.round((bookedCount / maxCapacity) * 100));
              
              if (fillPercentage >= 100) {
                 dynamicClass = "opacity-80 cursor-not-allowed bg-primary text-primary-foreground border-primary hover:bg-primary";
              } else if (fillPercentage > 0) {
                 if (fillPercentage < 25) {
                   dynamicClass = "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
                 } else if (fillPercentage < 50) {
                   dynamicClass = "bg-primary/40 text-primary-foreground border-primary/50 hover:bg-primary/50";
                 } else if (fillPercentage < 75) {
                   dynamicClass = "bg-primary/60 text-primary-foreground border-primary/70 hover:bg-primary/70";
                 } else {
                   dynamicClass = "bg-primary/80 text-primary-foreground border-primary/90 hover:bg-primary/90";
                 }
              }
            } else if (status === "booked") {
              dynamicClass = "opacity-80 cursor-not-allowed bg-primary/10 text-primary border-primary/30 hover:bg-primary/10";
            }

            return (
              <Button
                key={slotMins}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-12 rounded-xl transition-all font-medium text-sm border-border/60",
                  dynamicClass,
                  isSelected && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 border-transparent",
                )}
                disabled={isBooked}
                onClick={() => handleSlotClick(slotMins)}
              >
                {timeString}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  if (venueLoading || bookingsLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading facility data...</div>;

  if (!facility)
    return <div className="p-8 text-center text-red-500 font-semibold">Facility not found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <Link
          to="/dashboard/$workspaceSlug/venues/$venueId/facilities"
          params={{ workspaceSlug, venueId }}
        >
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{facility.name} - Bookings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage bookings and availability for this space/activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left Column: Grid */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm">
          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Button
              variant={date?.from && date?.from?.getTime() === startOfDay(new Date()).getTime() && date?.to?.getTime() === startOfDay(new Date()).getTime() ? "default" : "outline"}
              className="rounded-xl px-6 h-10"
              onClick={() => handleQuickDateSelect(0)}
            >
              Today
            </Button>
            <Button
              variant={date?.from && date?.from?.getTime() === addDays(startOfDay(new Date()), 1).getTime() && date?.to?.getTime() === addDays(startOfDay(new Date()), 1).getTime() ? "default" : "outline"}
              className="rounded-xl px-6 h-10"
              onClick={() => handleQuickDateSelect(1)}
            >
              Tomorrow
            </Button>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            {[2, 3, 4, 5].map(offset => {
              const d = addDays(startOfDay(new Date()), offset);
              const isSelected = date?.from?.getTime() === d.getTime() && date?.to?.getTime() === d.getTime();
              return (
                <Button
                  key={offset}
                  variant={isSelected ? "default" : "outline"}
                  className="rounded-xl px-4 h-10"
                  onClick={() => handleQuickDateSelect(offset)}
                >
                  {format(d, "EEE, dd")}
                </Button>
              );
            })}

            <div className="h-6 w-px bg-border mx-2" />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-xl h-10 px-6",
                    date?.from && date.from.getTime() !== date.to?.getTime() && "border-primary text-primary bg-primary/5"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Custom Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setSelectedSlots([]);
                  }}
                  disabled={(d) => isBefore(d, startOfDay(new Date()))}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Grid Area */}
          <div className="bg-background/50 rounded-2xl p-6 border border-border/60 shadow-inner">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg">{facility.name}</h3>
                <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
              <div className="text-right text-sm font-medium text-muted-foreground flex items-center gap-2">
                {formatCurrency(slotPrice, currency)} / {durationMinutes} mins
              </div>
            </div>

            <div className="space-y-2">
              {renderSlotGrid("Morning", groupedSlots.morning)}
              {renderSlotGrid("Afternoon", groupedSlots.afternoon)}
              {renderSlotGrid("Evening", groupedSlots.evening)}
            </div>

            {bookingsInDateRange.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/60 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Customer Bookings on Selected Dates
                </h4>
                <div className="space-y-3">
                  {bookingsInDateRange.map((booking: any) => (
                    <div key={booking.id} className="bg-secondary/20 border border-border/40 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <p className="font-bold text-sm">{booking.customer_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          {booking.customer_phone} {booking.customer_email ? `• ${booking.customer_email}` : ''}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-sm text-primary">
                          {format(new Date(booking.start_time), "MMM dd, yyyy")} 
                          <span className="text-muted-foreground ml-1 font-normal">
                            {format(new Date(booking.start_time), "HH:mm")} - {format(new Date(booking.end_time), "HH:mm")}
                          </span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mt-1 bg-green-500/10 inline-block px-2 py-0.5 rounded-full">
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm sticky top-24">
          <h3 className="text-xl font-bold mb-6">New Booking</h3>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Phone Number</Label>
                <Input
                  className="h-12 bg-secondary/30 rounded-xl"
                  placeholder="+250 700 000 000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  className="h-12 bg-secondary/30 rounded-xl"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl border border-border/60 p-5 space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Invoice</h4>
              
              <div className="space-y-2 min-h-[100px] max-h-[250px] overflow-y-auto pr-2">
                {selectedSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No slots selected</p>
                ) : (
                  selectedSlots.map((slot) => (
                    <div key={slot} className="flex justify-between text-sm items-center py-1">
                      <span className="text-foreground font-medium">
                        {facility.name} ({formatSlot(slot)} - {formatSlot(slot + durationMinutes)})
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {formatCurrency(slotPrice, currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2">
                {daysInRange.length > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Days</span>
                    <span className="font-semibold text-foreground">× {daysInRange.length}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Sub Total</span>
                  <span className="font-semibold text-foreground">{formatCurrency(subTotal, currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-black text-xl text-primary">{formatCurrency(totalAmount, currency)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <Input
                className="h-12 bg-secondary/30 rounded-xl font-bold"
                placeholder={totalAmount.toString()}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={paymentStatus === "Paid" ? "default" : "outline"}
                    className={cn("flex-1 h-10 rounded-xl", paymentStatus === "Paid" && "bg-green-500 hover:bg-green-600 text-white")}
                    onClick={() => setPaymentStatus("Paid")}
                  >
                    Paid
                  </Button>
                  <Button
                    type="button"
                    variant={paymentStatus === "Unpaid" ? "default" : "outline"}
                    className={cn("flex-1 h-10 rounded-xl", paymentStatus === "Unpaid" && "bg-orange-500 hover:bg-orange-600 text-white")}
                    onClick={() => setPaymentStatus("Unpaid")}
                  >
                    Unpaid
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="flex gap-2">
                  {["Cash", "MoMo", "Card"].map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={paymentMethod === mode ? "default" : "outline"}
                      className="flex-1 h-10 rounded-xl px-0 text-xs"
                      onClick={() => setPaymentMethod(mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={handleCreateBooking}
                disabled={createBookingMutation.isPending || selectedSlots.length === 0}
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-bold rounded-2xl border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onClick={handleBlockSlots}
                disabled={createBookingMutation.isPending || selectedSlots.length === 0}
              >
                Block Selected Slots
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
