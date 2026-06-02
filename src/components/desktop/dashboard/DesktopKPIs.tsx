import { DollarSign, Ticket, Calendar, Users } from "lucide-react";

interface KPIStats {
  totalRevenue: number;
  totalSold: number;
  totalDrafted: number;
  totalEvents: number;
  totalRegistered?: number;
}

export function DesktopKPIs({ stats }: { stats?: KPIStats }) {
  const kpis = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Tickets Sold", value: (stats?.totalSold || 0).toLocaleString(), icon: Ticket },
    { label: "RSVP Registrations", value: (stats?.totalRegistered || 0).toLocaleString(), icon: Users },
    { label: "Total Events", value: (stats?.totalEvents || 0).toString(), icon: Calendar },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
            <k.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{k.value}</p>
        </div>
      ))}
    </div>
  );
}
