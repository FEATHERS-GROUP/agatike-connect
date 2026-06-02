export function DesktopRecentOrders() {
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-card">
      <div className="flex items-center justify-between p-6">
        <h3 className="font-semibold">Recent orders</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      <div className="p-6 text-center text-sm text-muted-foreground border-t border-border/60">
        No recent orders
      </div>
    </div>
  );
}
