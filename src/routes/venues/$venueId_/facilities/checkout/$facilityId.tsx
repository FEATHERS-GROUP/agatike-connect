import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { getRentableVenueById } from "@/api/rentable_venues";
import { createVenueBooking, getVenueBookings } from "@/api/venue_bookings";
import { getUserSession } from "@/api/auth";
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export const Route = createFileRoute("/venues/$venueId_/facilities/checkout/$facilityId")({
  beforeLoad: async ({ location }) => {
    const session = await getUserSession();
    if (!session) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href } as any,
      });
    }
    return { session };
  },
  loader: async ({ params }) => {
    return await getRentableVenueById({ data: { id: (params as any).venueId || (params as any).venueId_ } });
  },
  component: FacilityCheckoutPage,
});

const SLOTS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

function FacilityCheckoutPage() {
  const { session } = Route.useRouteContext();
  const venue = Route.useLoaderData();
  const params = Route.useParams() as any;
  const venueId = params.venueId || params.venueId_;
  const facilityId = params.facilityId;
  const navigate = useNavigate();

  const facility = venue?.facilities_data?.find((f: any) => f.id === facilityId);

  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [name, setName] = useState(session?.username || "");
  const [email, setEmail] = useState(session?.email || "");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const hourlyRate = Number(facility?.pricing?.hourly_rate) || 0;
  const currency = venue?.currency || "RWF";

  const { data: bookings = [] } = useQuery({
    queryKey: ["venueBookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
  });

  const facilityBookings = useMemo(() => {
    return bookings.filter(
      (b: any) => b.facility_id === facilityId && b.status !== "Cancelled"
    );
  }, [bookings, facilityId]);

  const isSlotBooked = (dateToCheck: Date, startHour: number) => {
    return facilityBookings.some((b: any) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      const slotStart = new Date(dateToCheck);
      slotStart.setHours(startHour, 0, 0, 0);
      const slotEnd = new Date(dateToCheck);
      slotEnd.setHours(startHour + 1, 0, 0, 0);
      
      return bStart < slotEnd && slotStart < bEnd;
    });
  };

  const isDateFullyBooked = (dateToCheck: Date) => {
    return SLOTS.every((hour) => isSlotBooked(dateToCheck, hour));
  };

  const daysInRange = useMemo(() => {
    const days = [];
    if (date?.from) {
      let current = new Date(date.from);
      const end = date.to || date.from;
      let safety = 0;
      while (current <= end && safety < 365) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        safety++;
      }
    }
    return days;
  }, [date]);

  const isSlotBookedAcrossRange = (hour: number) => {
    return daysInRange.some(d => isSlotBooked(d, hour));
  };

  const totalAmount = useMemo(() => {
    if (daysInRange.length === 0 || selectedSlots.length === 0) return 0;
    return daysInRange.length * selectedSlots.length * hourlyRate;
  }, [daysInRange.length, selectedSlots.length, hourlyRate]);

  const bookingMutation = useMutation({
    mutationFn: async (dataList: any[]) => {
      const results = [];
      for (const data of dataList) {
        results.push(await createVenueBooking({ data }));
      }
      return results;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking.");
    },
  });

  const handleSlotClick = (hour: number) => {
    if (selectedSlots.includes(hour)) {
      const newSlots = selectedSlots.filter(s => s !== hour).sort((a, b) => a - b);
      const isContiguous = newSlots.every((s, i) => i === 0 || s === newSlots[i-1] + 1);
      if (isContiguous) {
        setSelectedSlots(newSlots);
      } else {
        setSelectedSlots([hour]);
      }
    } else {
      const newSlots = [...selectedSlots, hour].sort((a, b) => a - b);
      const isContiguous = newSlots.every((s, i) => i === 0 || s === newSlots[i-1] + 1);
      if (isContiguous) {
        setSelectedSlots(newSlots);
      } else {
        setSelectedSlots([hour]);
      }
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date?.from || selectedSlots.length === 0 || !name || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const minSlot = Math.min(...selectedSlots);
    const maxSlot = Math.max(...selectedSlots);

    const bookingStatus = facility?.requires_approval ? "Pending" : "Confirmed";

    const basePayload = {
      workspace_id: venue.workspace_id,
      venue_id: venue.id,
      user_id: session?.id,
      facility_id: facilityId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      status: bookingStatus,
      payment_status: totalAmount > 0 ? "Pending" : "Paid",
      amount: selectedSlots.length * hourlyRate, // Per-day amount
      total_amount: selectedSlots.length * hourlyRate, // Keep total_amount as per-day for consistency with single records
      venue_name: venue.name,
      venue_currency: currency,
      booking_type: "facility",
      tickets_data: {},
    };

    const payloads = daysInRange.map(d => {
      const startDateTime = new Date(d);
      startDateTime.setHours(minSlot, 0, 0, 0);
      const endDateTime = new Date(d);
      endDateTime.setHours(maxSlot + 1, 0, 0, 0);
      
      return {
        ...basePayload,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };
    });

    bookingMutation.mutate(payloads);
  };

  if (!venue || !facility) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Facility not found.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Submitted!</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {facility.requires_approval
              ? "Your request has been sent to the venue for approval. You will receive an email once it is confirmed."
              : "Your booking is confirmed! We have sent the details to your email address."}
          </p>
          <Button
            onClick={() => navigate({ to: `/venues/${venueId}` })}
            className="rounded-xl h-12 px-8"
          >
            Return to Venue
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <Link
          to={`/venues/${venueId}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Venue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Book {facility.name}</h1>
              <p className="text-muted-foreground">
                Select your date(s), time, and enter your details to complete your booking.
              </p>
            </div>

            <form id="booking-form" onSubmit={handleBook} className="space-y-8">
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">1. Date & Time</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Select Date (Click to pick a single day or a range)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal rounded-xl bg-secondary/30",
                            !date?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
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
                          disabled={(d) => isBefore(d, startOfDay(new Date())) || isDateFullyBooked(d)}
                          initialFocus
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {date?.from && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label>Available Time Slots (1 Hour)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Select one or more continuous hours. These hours will be booked for <strong>every day</strong> in your selected range.
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                        {SLOTS.map((hour) => {
                          const booked = isSlotBookedAcrossRange(hour);
                          const isSelected = selectedSlots.includes(hour);
                          const timeString = `${hour.toString().padStart(2, "0")}:00`;

                          return (
                            <Button
                              key={hour}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "h-10 rounded-xl transition-all",
                                booked && "opacity-50 cursor-not-allowed line-through",
                                isSelected && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                              )}
                              disabled={booked}
                              onClick={() => handleSlotClick(hour)}
                            >
                              {timeString}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">2. Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number (Optional)</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 700 000 000"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>

            <div className="space-y-4 mb-6">
              {facility.image_url && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                  <img
                    src={facility.image_url}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Facility</span>
                <span className="font-medium text-right">{facility.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Venue</span>
                <span className="font-medium text-right">{venue.name}</span>
              </div>
              {date?.from && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date Range</span>
                  <span className="font-medium text-right">
                    {date.to && date.to > date.from
                      ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`
                      : format(date.from, "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {date?.from && selectedSlots.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time (Daily)</span>
                  <span className="font-medium text-right">
                    {`${Math.min(...selectedSlots).toString().padStart(2, "0")}:00`} - {`${(Math.max(...selectedSlots) + 1).toString().padStart(2, "0")}:00`}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-4 space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span>{formatCurrency(hourlyRate, currency)} / hr</span>
              </div>
              {daysInRange.length > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days</span>
                  <span>{daysInRange.length} days</span>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total Due</span>
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(totalAmount, currency)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              form="booking-form"
              disabled={bookingMutation.isPending || !date?.from || selectedSlots.length === 0}
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {bookingMutation.isPending
                ? "Processing..."
                : facility.requires_approval
                  ? "Request Booking"
                  : "Confirm Booking"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {facility.requires_approval && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                This facility requires manual approval from the venue.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
