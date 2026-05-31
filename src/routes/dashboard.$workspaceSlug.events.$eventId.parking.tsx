import { createFileRoute } from "@tanstack/react-router";
import { Search, Car } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/parking")({
  component: ParkingView,
});

function ParkingView() {
  const parkingData = [
    { id: 1, name: "Alice Johnson", plate: "ABC-1234", spot: "A-12", status: "Reserved" },
    { id: 2, name: "Charlie Davis", plate: "XYZ-9876", spot: "B-04", status: "Checked In" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Parking Logistics</h1>
        <p className="text-sm text-muted-foreground">
          Track customers who purchased parking add-ons.
        </p>
      </header>

      <div className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by license plate or name..."
            className="pl-9 rounded-full bg-secondary/50 border-transparent"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">License Plate</th>
              <th className="px-6 py-4 font-medium">Assigned Spot</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {parkingData.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-md font-mono text-xs font-bold border border-border">
                    <Car className="h-3 w-3 text-muted-foreground" /> {p.plate}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">{p.spot}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "Checked In"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
