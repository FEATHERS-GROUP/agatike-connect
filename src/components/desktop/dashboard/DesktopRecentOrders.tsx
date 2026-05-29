import { events } from "@/lib/mock-data";

export function DesktopRecentOrders() {
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-card">
      <div className="flex items-center justify-between p-6">
        <h3 className="font-semibold">Recent orders</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      <div className="divide-y divide-border/60">
        {events.slice(0, 5).map((e, i) => (
          <div key={e.id} className="flex items-center gap-4 px-6 py-3 text-sm">
            <img src={e.cover} className="h-10 w-10 rounded-lg object-cover" alt="" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">
                {e.organizer} · {e.date}
              </p>
            </div>
            <span className="hidden md:inline text-xs text-muted-foreground">x{2 + i}</span>
            <span className="font-semibold">${(e.price * (2 + i)).toFixed(0)}</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              Paid
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
