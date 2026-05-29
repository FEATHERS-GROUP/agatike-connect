import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/events/$eventId/merchandise")({
  component: MerchandiseView,
});

function MerchandiseView() {
  const merchandise = [
    { id: 1, name: "Tour T-Shirt", price: "$25", stock: 150, sold: 45 },
    { id: 2, name: "VIP Hoodie", price: "$65", stock: 50, sold: 12 },
    { id: 3, name: "Event Poster", price: "$15", stock: 300, sold: 110 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Merchandise</h1>
          <p className="text-sm text-muted-foreground">Manage and track merch sales for this event.</p>
        </div>
        <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">$3,555</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Items Sold</p>
          <p className="text-2xl font-semibold mt-1">167</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold text-orange-500 mt-1">1 Item</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Item Name</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock Remaining</th>
              <th className="px-6 py-4 font-medium">Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {merchandise.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-foreground">{m.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{m.price}</td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${m.stock < 100 ? 'text-orange-500' : ''}`}>
                    {m.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-green-500 font-medium">{m.sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
