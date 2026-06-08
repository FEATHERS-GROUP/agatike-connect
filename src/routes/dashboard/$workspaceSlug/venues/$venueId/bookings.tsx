import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRentableVenueById } from "@/api/rentable_venues";
import { rentableVenues } from "@/lib/mock-data";
import { getVenueBookings, updateTicketStatus } from "@/api/venue_bookings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/bookings")({
  component: VenueBookingsPage,
});

function VenueBookingsPage() {
  const { venueId } = useParams({ strict: false }) as any;
  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const queryClient = useQueryClient();
  const [selectedTicketAction, setSelectedTicketAction] = useState<{
    bookingId: string;
    ticketId: string;
    action: "Cancel" | "Reactivate";
  } | null>(null);

  const [selectedViewTicket, setSelectedViewTicket] = useState<any | null>(null);

  const ticketMutation = useMutation({
    mutationFn: (data: { booking_id: string; ticket_id: string; new_status: string }) =>
      updateTicketStatus({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venueId] });
      toast.success("Ticket status updated successfully.");
      setSelectedTicketAction(null);
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to update ticket status");
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["venue_bookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
    enabled: !!venueId,
  });

  const flattenedBookings = useMemo(() => {
    return bookings.flatMap((b: any) => {
      if (b.tickets_data?.issued && b.tickets_data.issued.length > 0) {
        return b.tickets_data.issued.map((t: any) => {
          let displayId = t.id_document;
          if (!displayId) {
            if (!t.attendee_name || t.attendee_name === b.customer_name) {
              displayId = b.customer_id_document;
            } else if (b.attendees_info && Array.isArray(b.attendees_info)) {
              const matchedAttendee = b.attendees_info.find((a: any) => a.name === t.attendee_name);
              if (matchedAttendee?.id_document) {
                displayId = matchedAttendee.id_document;
              }
            }
          }
          return { ...b, ticket: { ...t, displayId } };
        });
      }
      return [{ ...b, ticket: null }];
    });
  }, [bookings]);

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading venue...</div>;
  if (!venue)
    return <div className="p-8 text-center text-red-500 font-semibold">Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage customers who have rented {venue.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 h-10 rounded-full w-64 bg-secondary/50 border-border/60"
            />
          </div>
          <Button variant="outline" className="rounded-full h-10 px-4 gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border/60">
              <tr>
                <th className="px-6 py-4">Attendee</th>
                <th className="px-6 py-4">ID / Passport</th>
                <th className="px-6 py-4">Booking Contact</th>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Booking Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {flattenedBookings.length > 0 ? (
                flattenedBookings.map((b, i) => (
                  <tr key={`${b.id}-${i}`} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {b.ticket ? (b.ticket.attendee_name || b.customer_name) : b.customer_name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {b.ticket?.displayId ? (
                        <span className="font-medium text-foreground">{b.ticket.displayId}</span>
                      ) : (
                        <span className="text-xs italic">Not Provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <p className="font-medium text-foreground">{b.customer_name}</p>
                      <p className="text-xs">{b.customer_email || "N/A"}</p>
                      <p className="text-xs">{b.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {b.ticket ? (
                        <div className="bg-secondary/40 rounded px-2 py-1.5 text-xs border border-border/50 w-max">
                          <p className="font-semibold">{b.ticket.tier}</p>
                          <p className="font-mono text-primary font-bold tracking-widest mt-0.5">{b.ticket.otp}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Not Generated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p>{new Date(b.start_time).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(b.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {venue.currency}
                      {Number(b.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "Confirmed"
                              ? "bg-green-500/10 text-green-500"
                              : b.status === "Pending"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          Booking: {b.status}
                        </span>
                        <span
                          className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.payment_status === "Paid"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.payment_status}
                        </span>
                        {b.ticket && (
                          <span
                            className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                              b.ticket.status === "Cancelled"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            Ticket: {b.ticket.status || "Active"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/60">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/60" />
                          <DropdownMenuItem onClick={() => setSelectedViewTicket(b)}>
                            View Ticket Details
                          </DropdownMenuItem>
                          {b.ticket && (!b.ticket.status || b.ticket.status === "Active") && (
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                              onClick={() => setSelectedTicketAction({ bookingId: b.id, ticketId: b.ticket.id, action: "Cancel" })}
                            >
                              Cancel Ticket
                            </DropdownMenuItem>
                          )}
                          {b.ticket && b.ticket.status === "Cancelled" && (
                            <DropdownMenuItem 
                              className="text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
                              onClick={() => setSelectedTicketAction({ bookingId: b.id, ticketId: b.ticket.id, action: "Reactivate" })}
                            >
                              Reactivate Ticket
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No bookings found for this venue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={!!selectedTicketAction}
        onOpenChange={(open) => !open && setSelectedTicketAction(null)}
      >
        <DialogContent className="sm:max-w-md rounded-[28px] border-border/60">
          <DialogHeader>
            <DialogTitle>
              {selectedTicketAction?.action === "Cancel" ? "Cancel Ticket" : "Reactivate Ticket"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedTicketAction?.action.toLowerCase()} this ticket?
              {selectedTicketAction?.action === "Cancel" 
                ? " The ticket will no longer be valid for entry."
                : " The ticket will become valid for entry again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setSelectedTicketAction(null)}
              disabled={ticketMutation.isPending}
            >
              Go Back
            </Button>
            <Button
              variant={selectedTicketAction?.action === "Cancel" ? "destructive" : "default"}
              className="rounded-full"
              disabled={ticketMutation.isPending}
              onClick={() => {
                if (!selectedTicketAction) return;
                ticketMutation.mutate({
                  booking_id: selectedTicketAction.bookingId,
                  ticket_id: selectedTicketAction.ticketId,
                  new_status: selectedTicketAction.action === "Cancel" ? "Cancelled" : "Active"
                });
              }}
            >
              {ticketMutation.isPending ? "Processing..." : `Yes, ${selectedTicketAction?.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedViewTicket}
        onOpenChange={(open) => !open && setSelectedViewTicket(null)}
      >
        <DialogContent className="sm:max-w-2xl rounded-[32px] border-border/60 p-0 overflow-hidden bg-background">
          {selectedViewTicket && (
            <>
              <div className="bg-secondary/30 p-8 border-b border-border/60">
                <DialogTitle className="text-2xl font-bold tracking-tight mb-2">Ticket Details</DialogTitle>
                <DialogDescription>
                  Full information for this specific ticket and its parent booking.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/40 pb-2">
                    Ticket Holder
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Attendee Name</p>
                      <p className="font-semibold">{selectedViewTicket.ticket?.attendee_name || selectedViewTicket.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ticket Tier</p>
                      <p className="font-semibold">{selectedViewTicket.ticket?.tier || "General"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ticket OTP</p>
                      <p className="font-mono font-bold text-primary tracking-widest">{selectedViewTicket.ticket?.otp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">ID / Passport</p>
                      <p className="font-semibold">
                        {selectedViewTicket.ticket?.displayId || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ticket Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          selectedViewTicket.ticket?.status === "Cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {selectedViewTicket.ticket?.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/40 pb-2">
                    Parent Booking Info
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary Customer</p>
                      <p className="font-semibold">{selectedViewTicket.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Email</p>
                      <p className="font-semibold">{selectedViewTicket.customer_email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Phone</p>
                      <p className="font-semibold">{selectedViewTicket.customer_phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary ID / Passport</p>
                      <p className="font-semibold">{selectedViewTicket.customer_id_document || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Event/Visit Date</p>
                      <p className="font-semibold">
                        {new Date(selectedViewTicket.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time Window</p>
                      <p className="font-semibold">
                        {new Date(selectedViewTicket.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(selectedViewTicket.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Booking Status</p>
                      <p className="font-semibold">{selectedViewTicket.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                      <p className="font-semibold">{venue.currency} {Number(selectedViewTicket.amount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedViewTicket.internal_notes && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-border/40 pb-2">
                      Internal Notes
                    </h3>
                    <p className="text-sm text-foreground bg-secondary/20 p-4 rounded-xl border border-border/40 whitespace-pre-wrap">
                      {selectedViewTicket.internal_notes}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="bg-secondary/30 p-6 border-t border-border/60 sm:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setSelectedViewTicket(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
