import { DollarSign, Ticket, Eye, TrendingUp } from "lucide-react";

export function DesktopKPIs() {
  const kpis = [
    { label: "Revenue (30d)", value: "$48,920", delta: "+18.4%", icon: DollarSign },
    { label: "Tickets sold", value: "1,284", delta: "+9.1%", icon: Ticket },
    { label: "Page views", value: "92,310", delta: "+24%", icon: Eye },
    { label: "Conversion", value: "6.8%", delta: "+1.2pt", icon: TrendingUp },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {k.label}
            </p>
            <k.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{k.value}</p>
          <p className="mt-1 text-xs text-primary">{k.delta} vs last period</p>
        </div>
      ))}
    </div>
  );
}
