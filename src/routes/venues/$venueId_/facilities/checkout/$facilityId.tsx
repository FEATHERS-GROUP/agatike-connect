import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { getRentableVenueById } from "@/api/rentable_venues";
import { createVenueBooking } from "@/api/venue_bookings";
import { getUserSession } from "@/api/auth";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { format, differenceInHours } from "date-fns";

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

function FacilityCheckoutPage() {
  const { session } = Route.useRouteContext();
  const venue = Route.useLoaderData();
  const params = Route.useParams() as any;
  const venueId = params.venueId || params.venueId_;
  const facilityId = params.facilityId;
  const navigate = useNavigate();

  const facility = venue?.facilities_data?.find((f: any) => f.id === facilityId);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [name, setName] = useState(session?.username || "");
  const [email, setEmail] = useState(session?.email || "");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const hourlyRate = Number(facility?.pricing?.hourly_rate) || 0;
  const currency = venue?.currency || "RWF";

  // Calculate total price based on selected hours
  const totalAmount = useMemo(() => {
    if (!date || !startTime || !endTime) return 0;
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      const hours = Math.max(0, differenceInHours(end, start));
      return hours * hourlyRate;
    } catch {
      return 0;
    }
  }, [date, startTime, endTime, hourlyRate]);

  const bookingMutation = useMutation({
    mutationFn: (data: any) => createVenueBooking({ data }),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking.");
    },
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !name || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}`).toISOString();

    const bookingStatus = facility?.requires_approval ? "Pending" : "Confirmed";

    bookingMutation.mutate({
      workspace_id: venue.workspace_id,
      venue_id: venue.id,
      user_id: session?.id,
      facility_id: facilityId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      start_time: startDateTime,
      end_time: endDateTime,
      status: bookingStatus,
      payment_status: totalAmount > 0 ? "Pending" : "Paid",
      amount: totalAmount,
      total_amount: totalAmount,
      venue_name: venue.name,
      venue_currency: currency,
      booking_type: "facility",
      tickets_data: {},
    });
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
                Select your date, time, and enter your details to complete your booking.
              </p>
            </div>

            <form id="booking-form" onSubmit={handleBook} className="space-y-8">
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">1. Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Select Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-secondary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-secondary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-secondary/30"
                      />
                    </div>
                  </div>
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
              {date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-right">
                    {format(new Date(date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {date && startTime && endTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-right">
                    {startTime} - {endTime}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-4 space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span>{formatCurrency(hourlyRate, currency)} / hr</span>
              </div>
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
              disabled={bookingMutation.isPending || !date || !startTime || !endTime}
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
