import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCinemaBookings } from "@/api/cinema_bookings";
import { Ticket, Search, Plus, Loader2, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/bookings")({
  component: CinemaBookings,
});

function CinemaBookings() {
  const { workspaceSlug, cinemaId } = Route.useParams() as any;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["cinema_bookings", cinemaId],
    queryFn: () => getCinemaBookings({ data: { cinema_id: cinemaId, limit: 50 } }),
    enabled: !!cinemaId,
  });

  const filtered = bookings.filter((b: any) => {
    const q = search.toLowerCase();
    return (
      (b.names || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q) ||
      (b.qrcode_number || "").toLowerCase().includes(q) ||
      (b.schedule?.movie?.title || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Box Office Bookings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your recent ticket sales and reservations.
          </p>
        </div>
        <Button
          onClick={() => navigate({ search: (prev: any) => ({ ...prev, pos: "true" }) })}
          className="gap-2 rounded-xl h-11 px-6 font-bold shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-5 w-5" /> New Booking
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, ticket ID, movie..."
            className="pl-9 rounded-xl h-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Booking Info</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden md:table-cell">Movie & Schedule</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden lg:table-cell">Ticket Tier</th>
                <th className="text-right px-4 py-4 font-semibold text-muted-foreground">Amount</th>
                <th className="text-right px-6 py-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{booking.names || "Guest User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{booking.qrcode_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <p className="font-semibold text-foreground truncate max-w-[200px]">{booking.schedule?.movie?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.schedule?.show_date).toLocaleDateString()} at {booking.schedule?.start_time.slice(0,5)}
                    </p>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium border border-border/40">
                      {booking.quantity}x {booking.ticket_tier?.name || "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-bold">{formatCurrency(booking.total_price, booking.currency)}</p>
                    <p className="text-xs text-muted-foreground">{booking.payment_method}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ to: `/dashboard/$workspaceSlug/Cinema/$cinemaId/receipt/$bookingId`, params: { workspaceSlug, cinemaId, bookingId: booking.id } })}
                      className="h-8 rounded-lg gap-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <Ticket className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
