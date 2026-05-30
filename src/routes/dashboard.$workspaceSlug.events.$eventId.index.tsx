import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Share2, Ticket, Users, DollarSign, MapPin, Ban, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/api/events";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useMemo, useEffect } from "react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/")({
  component: DashboardEventDetails,
});

function getCurrencySymbol(currency?: string) {
  const map: Record<string, string> = {
    RWF: "RWF ", USD: "$", EUR: "€", GBP: "£", KES: "KES ", UGX: "UGX ", TZS: "TZS ",
    NGN: "₦", GHS: "GH₵", XOF: "CFA ", ZAR: "R", MAD: "MAD ", ETB: "Br ",
  };
  return map[currency || ""] || "$";
}

function DashboardEventDetails() {
  const { eventId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const currencySymbol = getCurrencySymbol(activeWorkspace?.wallet?.currency);

  // Compute ticket metrics
  const { stats, ticketBreakdown, chartData } = useMemo(() => {
    if (!event || !event.event_tickets) {
      return {
        stats: { totalSold: 0, totalCapacity: 0, salesPct: 0, revenue: 0 },
        ticketBreakdown: [],
        chartData: []
      };
    }
    const tickets = event.event_tickets;
    const totalSold = tickets.reduce((acc: number, t: any) => acc + Number(t.sold || 0), 0);
    const totalRemaining = tickets.reduce((acc: number, t: any) => acc + Number(t.remaining || 0), 0);
    const totalCapacity = totalSold + totalRemaining;
    const salesPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
    const revenue = tickets.reduce((acc: number, t: any) => acc + Number(t.sold || 0) * Number(t.cost || 0), 0);

    const colors = [
      "var(--color-primary)",
      "color-mix(in oklch, var(--color-primary) 60%, var(--color-background))",
      "color-mix(in oklch, var(--color-primary) 30%, var(--color-background))",
      "color-mix(in oklch, var(--color-primary) 15%, var(--color-background))"
    ];

    const breakdown = tickets.map((t: any, idx: number) => ({
      id: t.id,
      name: t.type,
      value: Number(t.sold || 0),
      color: colors[idx % colors.length]
    })).filter((x: any) => x.value > 0);

    // Fallback if no tickets sold yet to avoid empty chart visual
    const displayBreakdown = breakdown.length > 0 ? breakdown : tickets.map((t: any, idx: number) => ({
      id: t.id,
      name: t.type,
      value: Number(t.remaining || 0),
      color: colors[idx % colors.length]
    }));

    return {
      stats: { totalSold, totalCapacity, salesPct, revenue },
      ticketBreakdown: displayBreakdown,
      chartData: tickets
    };
  }, [event]);

  // Set the selected calendar date to the first stop's date if available
  useEffect(() => {
    if (event?.tour_stops?.[0]?.date) {
      const parsed = new Date(event.tour_stops[0].date);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
  }, [event]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-lg font-medium">Event not found.</p>
        <Button variant="outline" className="rounded-full" onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events` })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    );
  }

  // Attendance metrics (mocked but scaled to real capacity)
  const attendanceProgressData = [
    { name: "Week 1", target: Math.round(stats.totalCapacity * 0.2), attended: Math.round(stats.totalSold * 0.15) },
    { name: "Week 2", target: Math.round(stats.totalCapacity * 0.4), attended: Math.round(stats.totalSold * 0.35) },
    { name: "Week 3", target: Math.round(stats.totalCapacity * 0.6), attended: Math.round(stats.totalSold * 0.55) },
    { name: "Week 4", target: Math.round(stats.totalCapacity * 0.8), attended: Math.round(stats.totalSold * 0.75) },
    { name: "Week 5", target: stats.totalCapacity, attended: stats.totalSold },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events` })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Live
            </span>
            <span className="text-xs text-muted-foreground">{event.category}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight truncate">{event.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full shadow-sm hidden md:flex">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button
            className="rounded-full shadow-sm"
            onClick={() => navigate({
              to: "/dashboard/$workspaceSlug/events/$eventId/edit",
              params: {
                workspaceSlug: workspaceSlug || "",
                eventId: eventId || ""
              }
            })}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Revenue</span>
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-green-500">{currencySymbol}{stats.revenue.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Tickets Sold</span>
                <Ticket className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{stats.totalSold} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalCapacity}</span></p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Sales Pace</span>
                <Users className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.salesPct}%</p>
            </div>
          </div>

          {/* Anticipated vs Actual Chart */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold mb-6">Sales Progression (Anticipated vs Actual)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="target" name="Target Capacity" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attended" name="Tickets Sold" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ticket Classification List */}
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <div className="p-6 border-b border-border/60">
              <h3 className="font-semibold">All Ticket Classifications</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket Type</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Sold / Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {chartData.map((tier: any) => {
                  const capacity = Number(tier.sold || 0) + Number(tier.remaining || 0);
                  const isSoldOut = Number(tier.remaining || 0) === 0;
                  const locationName = tier.tour_stop_idx != null && event.tour_stops?.[tier.tour_stop_idx]
                    ? (event.tour_stops[tier.tour_stop_idx].city || event.tour_stops[tier.tour_stop_idx].venue || `Stop ${tier.tour_stop_idx + 1}`)
                    : "All Locations";

                  return (
                    <tr key={tier.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{tier.type}</td>
                      <td className="px-6 py-4 text-muted-foreground">{locationName}</td>
                      <td className="px-6 py-4 text-green-500 font-medium">{currencySymbol}{parseFloat(tier.cost).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {tier.sold} / {capacity}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isSoldOut ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {isSoldOut ? 'Sold Out' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Cover Preview Card */}
          {event.cover && (
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
              <img src={event.cover} alt="Event cover" className="w-full h-48 object-cover" />
            </div>
          )}

          {/* Calendar & Tour Stops Schedule */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
            <h3 className="font-semibold">Event Schedule</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-xl border border-border/60 mx-auto"
            />
            
            <div className="space-y-2 mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locations / Stops</p>
              {Array.isArray(event.tour_stops) && event.tour_stops.map((stop: any, idx: number) => (
                <div key={idx} className="p-3 bg-secondary/50 rounded-xl border border-border text-xs space-y-1">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {stop.venue || "TBD"}
                    </span>
                    <span className="text-muted-foreground">{stop.time}</span>
                  </div>
                  <p className="text-muted-foreground">{stop.address || stop.city}</p>
                  <p className="text-primary/80 font-medium flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3" />
                    {stop.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Breakdown Pie Chart */}
          {ticketBreakdown.length > 0 && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold mb-2">Sales Breakdown</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom Legend */}
              <div className="mt-4 space-y-2">
                {ticketBreakdown.map((entry: any, index: number) => (
                  <div key={entry.id || index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-semibold">{entry.value} {entry.value === 1 ? 'ticket' : 'tickets'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="font-semibold text-red-500 flex items-center gap-2 mb-2">
              <Ban className="h-5 w-5" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Suspending this event will immediately halt all ticket sales and hide it from the public.
            </p>
            <Button variant="destructive" className="w-full rounded-full">
              Suspend Event
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
