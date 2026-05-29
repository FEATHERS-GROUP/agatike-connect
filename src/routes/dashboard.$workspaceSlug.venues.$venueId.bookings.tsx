import { createFileRoute, useParams } from "@tanstack/react-router";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { venueBookings, rentableVenues } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/bookings")({
  component: VenueBookingsPage,
});

function VenueBookingsPage() {
  const { venueId } = useParams({ strict: false });
  const venue = rentableVenues.find(v => v.id === venueId);
  const bookings = venueBookings.filter(b => b.venueId === venueId);

  if (!venue) return <div>Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage customers who have rented {venue.name}.</p>
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
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bookings.length > 0 ? bookings.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{b.customerName}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <p>{b.customerEmail}</p>
                    <p className="text-xs">{b.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{b.date}</p>
                    <p className="text-xs text-muted-foreground">{b.timeStart} - {b.timeEnd}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{venue.currency}{b.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === "Confirmed" ? "bg-green-500/10 text-green-500" :
                        b.status === "Pending" ? "bg-orange-500/10 text-orange-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {b.status}
                      </span>
                      <span className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.paymentStatus === "Paid" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No bookings found for this venue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
