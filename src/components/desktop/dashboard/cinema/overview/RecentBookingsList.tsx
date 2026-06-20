import { formatCurrency } from "@/lib/currency";

interface RecentBookingsListProps {
  recentBookings: any[];
  workspaceCurrency: string;
}

export function RecentBookingsList({ recentBookings, workspaceCurrency }: RecentBookingsListProps) {
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
      {recentBookings.length === 0 ? (
        <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-border/40 flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Bookings will appear here once movies are live.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentBookings.map((b: any) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center font-bold">
                  <span className="text-sm">{b.quantity}x</span>
                </div>
                <div>
                  <p className="font-bold">{b.schedule?.movie?.title}</p>
                  <p className="text-sm text-muted-foreground">{b.names || "Walk-in"} • {b.ticket_tier?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(b.total_price, b.currency || workspaceCurrency)}</p>
                <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
