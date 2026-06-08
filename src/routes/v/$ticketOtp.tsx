import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVenueBookingByOtp } from "@/api/venue_bookings";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/v/$ticketOtp")({
  component: PublicTicketValidationRoute,
});

function PublicTicketValidationRoute() {
  const { ticketOtp } = Route.useParams();

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["validate-ticket", ticketOtp],
    queryFn: async () => {
      const res = await getVenueBookingByOtp({ data: { otp: ticketOtp } } as any);
      if (!res) throw new Error("Ticket not found");
      return res;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Validating Ticket...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Invalid Ticket</h1>
        <p className="text-muted-foreground">
          The scanned QR code does not match any valid ticket in our system.
        </p>
      </div>
    );
  }

  // Find the specific ticket inside tickets_data
  const ticket = booking.tickets_data?.issued?.find((t: any) => t.otp === ticketOtp);

  let displayId = ticket?.id_document;
  if (!displayId && ticket) {
    if (!ticket.attendee_name || ticket.attendee_name === booking.customer_name) {
      displayId = booking.customer_id_document;
    } else if (booking.attendees_info && Array.isArray(booking.attendees_info)) {
      const matchedAttendee = booking.attendees_info.find(
        (a: any) => a.name === ticket.attendee_name,
      );
      if (matchedAttendee?.id_document) {
        displayId = matchedAttendee.id_document;
      }
    }
  }

  if (ticket?.status === "Cancelled") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-24 w-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2 text-red-400">
          Cancelled Ticket
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          This ticket has been cancelled by the organizer and is no longer valid for entry.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full max-w-sm backdrop-blur-md text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Attempted Attendee
          </p>
          <p className="text-lg font-bold text-white/50">
            {ticket.attendee_name || booking.customer_name}
          </p>
          {displayId && <p className="text-sm text-red-400/80 mt-1">ID: {displayId}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="h-24 w-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>

      <h1 className="text-3xl font-black uppercase tracking-widest mb-2 text-emerald-400">
        Valid Ticket
      </h1>
      <p className="text-muted-foreground mb-12 uppercase tracking-widest text-xs">
        Scan Successful
      </p>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-sm backdrop-blur-md">
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Attendee</p>
          <p className="text-xl font-bold text-white">
            {ticket?.attendee_name || booking.customer_name}
          </p>
          {displayId && (
            <p className="text-sm text-white/60 mt-1 tracking-wider font-mono">ID: {displayId}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tier</p>
            <p className="font-semibold text-white truncate">
              {ticket?.tier || "General Admission"}
            </p>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Location
            </p>
            <p className="font-semibold text-white truncate">{booking.venue_name || "Venue"}</p>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl py-3 px-4 flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket OTP</p>
          <p className="font-mono text-sm text-white/80 tracking-widest">{ticketOtp}</p>
        </div>
      </div>

      <p className="text-xs text-white/30 mt-12 font-mono">Agatike Verified Secure Ticket</p>
    </div>
  );
}
