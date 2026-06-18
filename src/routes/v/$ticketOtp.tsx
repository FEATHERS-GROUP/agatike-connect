import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVenueBookingByOtp } from "@/api/venue_bookings";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/v/$ticketOtp")({
  component: PublicTicketValidationRoute,
});

/** Determine if a subscription is still valid based on next_billing_date */
function getSubscriptionValidity(sub: any): { isValid: boolean; label: string; color: string } {
  const status = (sub.status || "").toLowerCase();
  if (status === "cancelled" || status === "inactive") {
    return { isValid: false, label: "Cancelled", color: "bg-red-500/10 text-red-500" };
  }

  if (sub.next_billing_date) {
    const nextBilling = new Date(sub.next_billing_date);
    const now = new Date();
    if (nextBilling < now) {
      return { isValid: false, label: "Expired", color: "bg-red-500/10 text-red-500" };
    }
    // Expiring within 3 days
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (nextBilling.getTime() - now.getTime() < threeDays) {
      return { isValid: true, label: "Expiring Soon", color: "bg-amber-500/10 text-amber-500" };
    }
  }

  return { isValid: true, label: "Active", color: "bg-green-500/10 text-green-500" };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function PublicTicketValidationRoute() {
  const { ticketOtp } = Route.useParams();

  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["validate-ticket-or-sub", ticketOtp],
    queryFn: async () => {
      const res = await getVenueBookingByOtp({ data: { otp: ticketOtp } } as any);
      if (!res) throw new Error("Verification target not found");
      return res;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Validating...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Verification Failed</h1>
        <p className="text-muted-foreground">
          The scanned QR code is invalid or does not exist in our system.
        </p>
      </div>
    );
  }

  if (result.type === "subscription") {
    const sub = result.data;
    const validity = getSubscriptionValidity(sub);
    const currency = sub.space?.currency || "RWF";

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div
          className={`h-24 w-24 rounded-full ${validity.isValid ? "bg-emerald-500/20" : "bg-red-500/20"} flex items-center justify-center mb-6 shadow-[0_0_40px_${validity.isValid ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}]`}
        >
          {validity.isValid ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-12 w-12 text-red-500" />
          )}
        </div>

        <h1
          className={`text-3xl font-black uppercase tracking-widest mb-2 ${validity.isValid ? "text-emerald-400" : "text-red-400"}`}
        >
          {validity.label} Subscription
        </h1>
        <p className="text-muted-foreground mb-12 uppercase tracking-widest text-xs">
          Scan Successful
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-sm backdrop-blur-md text-left">
          {sub.space?.cover_url && (
            <img
              src={sub.space.cover_url}
              alt={sub.space.name}
              className="w-full h-32 object-cover rounded-2xl mb-6 border border-white/10"
            />
          )}

          <div className="mb-6 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Subscriber
            </p>
            <p className="text-xl font-bold text-white">{sub.customer_name}</p>
            {sub.customer_email && (
              <p className="text-xs text-white/60 mt-0.5">{sub.customer_email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Plan
              </p>
              <p className="font-semibold text-white truncate">{sub.plan_name}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Venue
              </p>
              <p className="font-semibold text-white truncate">{sub.space?.name || "Space"}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="font-semibold text-white truncate">
                {sub.price} {currency}
              </p>
            </div>
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Cycle
              </p>
              <p className="font-semibold text-white truncate capitalize">{sub.billing_cycle}</p>
            </div>
          </div>

          {sub.booking_type === "team" && sub.team_members && sub.team_members.length > 0 && (
            <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Team Members
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sub.team_members.map((member: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white/80">{member.name || member.email}</span>
                    {member.membership_id && (
                      <span className="font-mono text-[10px] text-white/40">
                        {member.membership_id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-black/50 rounded-xl py-3 px-4 flex justify-between items-center text-left">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {sub.billing_cycle?.toLowerCase() === "one-time" ||
                sub.billing_cycle?.toLowerCase() === "onetime"
                  ? "Start Date"
                  : "Valid Until"}
              </p>
              <p className="font-semibold text-sm text-white/80 mt-0.5">
                {sub.billing_cycle?.toLowerCase() === "one-time" ||
                sub.billing_cycle?.toLowerCase() === "onetime"
                  ? formatDate(sub.start_date)
                  : formatDate(sub.next_billing_date)}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${validity.color}`}>
              {validity.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-white/30 mt-12 font-mono">Agatike Verified Space Pass</p>
      </div>
    );
  }

  // Otherwise, it is a ticket validation
  const booking = result.data;

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

        <div className="bg-black/50 rounded-xl py-3 px-4 flex justify-between items-center text-left">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket OTP</p>
          <p className="font-mono text-sm text-white/80 tracking-widest">{ticketOtp}</p>
        </div>
      </div>

      <p className="text-xs text-white/30 mt-12 font-mono">Agatike Verified Secure Ticket</p>
    </div>
  );
}
