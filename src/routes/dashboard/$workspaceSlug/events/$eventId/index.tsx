import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Edit2,
  Share2,
  Ticket,
  Users,
  DollarSign,
  MapPin,
  Ban,
  Loader2,
  Calendar as CalendarIcon,
  TrendingUp,
  Star,
  Camera,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventById, updateEvent } from "@/api/events";
import { getEventAttendees } from "@/api/attendees";
import { getEventFeedback } from "@/api/feedback";
import { getEventStories, getEventPosts } from "@/api/experience";
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
import { useState, useMemo, useEffect, Fragment } from "react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/")({
  component: DashboardEventDetails,
});

import { formatCurrency } from "@/lib/currency";

// ── Colour helpers ─────────────────────────────────────────────────────────────
const PALETTE = [
  "var(--color-primary)",
  "color-mix(in oklch, var(--color-primary) 75%, var(--color-background))",
  "color-mix(in oklch, var(--color-primary) 50%, var(--color-background))",
  "color-mix(in oklch, var(--color-primary) 30%, var(--color-background))",
  "color-mix(in oklch, var(--color-primary) 15%, var(--color-background))",
];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">
            {p.name?.toLowerCase().includes("revenue")
              ? formatCurrency(p.value, currency)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── SVG icon set for Experience cards ─────────────────────────────────────────
function IconStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconCamera({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconBubble({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function DashboardEventDetails() {
  const { eventId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // ── Queries ────────────────────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["event-feedback", eventId],
    queryFn: () => getEventFeedback({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["event-stories", eventId],
    queryFn: () => getEventStories({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["event-posts", eventId],
    queryFn: () => getEventPosts({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const toggleSuspend = useMutation({
    mutationFn: (data: { id: string; suspended: boolean }) => updateEvent({ data } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-events", activeWorkspace?.id] });
    },
  });

  const currency = activeWorkspace?.currency;

  // ── Computed: ticket metrics ───────────────────────────────────────────────
  const { stats, ticketBreakdown, chartData, sortedByRevenue, soldVsUnsold, ticketsByStop } =
    useMemo(() => {
      if (!event?.event_tickets) {
        return {
          stats: { totalSold: 0, totalCapacity: 0, salesPct: 0, revenue: 0 },
          ticketBreakdown: [],
          chartData: [],
          sortedByRevenue: [],
          soldVsUnsold: [],
          ticketsByStop: [],
        };
      }
      const tickets = event.event_tickets as any[];
      const totalSold = tickets.reduce((acc, t) => acc + Number(t.sold || 0), 0);
      const totalRemaining = tickets.reduce((acc, t) => acc + Number(t.remaining || 0), 0);
      const totalCapacity = totalSold + totalRemaining;
      const salesPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
      const revenue = tickets.reduce(
        (acc, t) => acc + Number(t.sold || 0) * Number(t.cost || 0),
        0,
      );

      // Sorted by sold desc (best sellers first)
      const sorted = [...tickets]
        .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
        .map((t, idx) => ({
          ...t,
          color: PALETTE[idx % PALETTE.length],
          capacity: Number(t.sold || 0) + Number(t.remaining || 0),
          revenue: Number(t.sold || 0) * Number(t.cost || 0),
        }));

      // Pie breakdown (sold segments)
      const breakdown = sorted
        .filter((t) => Number(t.sold || 0) > 0)
        .map((t, idx) => ({
          id: t.id,
          name: t.type,
          stopIdx: t.tour_stop_idx,
          value: Number(t.sold || 0),
          color: PALETTE[idx % PALETTE.length],
        }));
      const displayBreakdown =
        breakdown.length > 0
          ? breakdown
          : sorted.map((t, idx) => ({
              id: t.id,
              name: t.type,
              stopIdx: t.tour_stop_idx,
              value: Number(t.remaining || 0),
              color: PALETTE[idx % PALETTE.length],
            }));

      // Revenue by ticket type sorted desc
      const sortedByRevenue = [...tickets]
        .map((t) => ({
          name: t.type,
          revenue: Number(t.sold || 0) * Number(t.cost || 0),
          sold: Number(t.sold || 0),
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Sold vs unsold donut
      const soldVsUnsold = [
        { name: "Sold", value: totalSold, color: "#f97316" },
        { name: "Remaining", value: totalRemaining, color: "var(--color-secondary)" },
      ];

      // Group tickets by tour stop for the classification table
      const stops: any[] = Array.isArray(event.tour_stops) ? event.tour_stops : [];
      // Collect unique stop indices from tickets (including null/undefined → "All Locations")
      const stopGroups: { label: string; stopIdx: number | null; tickets: any[] }[] = [];
      const seenIdx = new Set<number | null>();
      // First pass: stops in order
      stops.forEach((stop: any, idx: number) => {
        const stopTickets = sorted.filter((t: any) => t.tour_stop_idx === idx);
        if (stopTickets.length > 0) {
          seenIdx.add(idx);
          stopGroups.push({
            label: stop.venue || stop.city || `Stop ${idx + 1}`,
            stopIdx: idx,
            tickets: stopTickets,
          });
        }
      });
      // Second pass: tickets not assigned to any stop
      const globalTickets = sorted.filter(
        (t: any) => t.tour_stop_idx == null && !seenIdx.has(t.tour_stop_idx),
      );
      if (globalTickets.length > 0) {
        stopGroups.push({ label: "All Locations", stopIdx: null, tickets: globalTickets });
      }
      // If no grouping possible (single venue, all null), just put everything in one group
      const ticketsByStop =
        stopGroups.length > 0
          ? stopGroups
          : [{ label: "All Locations", stopIdx: null, tickets: sorted }];

      return {
        stats: { totalSold, totalCapacity, salesPct, revenue },
        ticketBreakdown: displayBreakdown,
        chartData: sorted,
        sortedByRevenue,
        soldVsUnsold,
        ticketsByStop,
      };
    }, [event]);

  // ── Computed: per-stop breakdown ───────────────────────────────────────────
  const stopBreakdown = useMemo(() => {
    if (!event?.tour_stops || !event?.event_tickets) return [];
    const stops = event.tour_stops as any[];
    const tickets = event.event_tickets as any[];
    return stops.map((stop: any, idx: number) => {
      const stopTickets = tickets.filter((t: any) => t.tour_stop_idx === idx);
      const sold = stopTickets.reduce((acc: number, t: any) => acc + Number(t.sold || 0), 0);
      const remaining = stopTickets.reduce(
        (acc: number, t: any) => acc + Number(t.remaining || 0),
        0,
      );
      const capacity = sold + remaining;
      const revenue = stopTickets.reduce(
        (acc: number, t: any) => acc + Number(t.sold || 0) * Number(t.cost || 0),
        0,
      );
      const fill = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
      return {
        name: stop.venue || stop.city || `Stop ${idx + 1}`,
        venue: stop.venue || "—",
        date: stop.date || "—",
        sold,
        capacity,
        revenue,
        fill,
        color: PALETTE[idx % PALETTE.length],
      };
    });
  }, [event]);

  const hasMultipleStops = stopBreakdown.length > 1;

  // ── Computed: experience ──────────────────────────────────────────────────
  const reviews = feedbackData?.reviews || [];
  const avgRating = feedbackData?.aggregate?.avg?.rating
    ? parseFloat(feedbackData.aggregate.avg.rating).toFixed(1)
    : "—";
  const totalReviews = feedbackData?.aggregate?.count || 0;
  const totalLikes = (posts as any[]).reduce(
    (a: number, p: any) => a + Number(p.likes_count || 0),
    0,
  );
  const totalComments = (posts as any[]).reduce(
    (a: number, p: any) => a + Number(p.comments_count || 0),
    0,
  );
  const pinnedPosts = (posts as any[]).filter((p: any) => p.is_pinned).length;

  // ── Simulated week-on-week progression ────────────────────────────────────
  const attendanceProgressData = [
    {
      name: "Wk 1",
      target: Math.round(stats.totalCapacity * 0.2),
      attended: Math.round(stats.totalSold * 0.15),
    },
    {
      name: "Wk 2",
      target: Math.round(stats.totalCapacity * 0.4),
      attended: Math.round(stats.totalSold * 0.35),
    },
    {
      name: "Wk 3",
      target: Math.round(stats.totalCapacity * 0.6),
      attended: Math.round(stats.totalSold * 0.55),
    },
    {
      name: "Wk 4",
      target: Math.round(stats.totalCapacity * 0.8),
      attended: Math.round(stats.totalSold * 0.75),
    },
    { name: "Now", target: stats.totalCapacity, attended: stats.totalSold },
  ];

  // ── Calendar sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (event?.tour_stops?.[0]?.date) {
      const parsed = new Date(event.tour_stops[0].date);
      if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
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
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events` })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events` })}
        >
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
            onClick={() =>
              navigate({
                to: "/dashboard/$workspaceSlug/events/$eventId/edit",
                params: { workspaceSlug: workspaceSlug || "", eventId: eventId || "" },
              })
            }
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Event
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — 6 KPI CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(stats.revenue, currency)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">from ticket sales</p>
        </div>

        {/* Tickets Sold */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Sold</span>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">
            {stats.totalSold}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {stats.totalCapacity}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">total tickets</p>
        </div>

        {/* Sales Pace */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Pace</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{stats.salesPct}%</p>
          <p className="text-[11px] text-muted-foreground mt-1">capacity filled</p>
        </div>

        {/* Attendees */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Attendees</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{attendees.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">registered</p>
        </div>

        {/* Avg Rating */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Rating</span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500">{avgRating}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{totalReviews} reviews</p>
        </div>

        {/* Experience Posts */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Content</span>
            <Camera className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-500">{posts.length + stories.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stories.length} stories · {posts.length} posts
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN GRID: 2/3 analytics | 1/3 sidebar
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Analytics Column ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── SECTION 2: Sold vs Unsold + Best Sellers ─────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sold vs Unsold Donut */}
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold mb-1">Sold vs Available</h3>
              <p className="text-xs text-muted-foreground mb-4">Overall ticket fill rate</p>
              <div className="relative h-52">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={soldVsUnsold}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {soldVsUnsold.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip currency={currency} />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-primary">{stats.salesPct}%</span>
                  <span className="text-[11px] text-muted-foreground">sold</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {soldVsUnsold.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-semibold">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Sellers Bar */}
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold mb-1">Ticket Performance</h3>
              <p className="text-xs text-muted-foreground mb-4">Best to least sold, by type</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      type="number"
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <RechartsTooltip content={<ChartTooltip currency={currency} />} />
                    <Bar dataKey="sold" name="Sold" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Per-Stop Breakdown ────────────────────────── */}
          {hasMultipleStops && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
              <div>
                <h3 className="font-semibold">Tour Stop Comparison</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tickets sold vs capacity across all {stopBreakdown.length} stops
                </p>
              </div>

              {/* Stop bar chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={stopBreakdown}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip content={<ChartTooltip currency={currency} />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="capacity" name="Capacity" fill="#fed7aa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sold" name="Sold" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stop financial table */}
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Stop</th>
                      <th className="px-4 py-3 font-medium">Venue</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Sold</th>
                      <th className="px-4 py-3 font-medium text-right">Capacity</th>
                      <th className="px-4 py-3 font-medium text-right">Revenue</th>
                      <th className="px-4 py-3 font-medium text-right">Fill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stopBreakdown.map((stop, idx) => (
                      <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: stop.color }}
                            />
                            <span className="font-medium text-foreground">{stop.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{stop.venue}</td>
                        <td className="px-4 py-3 text-muted-foreground">{stop.date}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {stop.sold.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {stop.capacity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-500">
                          {formatCurrency(stop.revenue, currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${stop.fill}%` }}
                              />
                            </div>
                            <span
                              className={`font-semibold text-xs ${stop.fill >= 80 ? "text-green-500" : stop.fill >= 40 ? "text-amber-500" : "text-muted-foreground"}`}
                            >
                              {stop.fill}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SECTION 4: Revenue by Ticket Type ───────────────────── */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold mb-1">Revenue by Ticket Type</h3>
            <p className="text-xs text-muted-foreground mb-5">Highest-grossing to lowest</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={sortedByRevenue}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrency(v, currency)}
                  />
                  <RechartsTooltip content={<ChartTooltip currency={currency} />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                    {sortedByRevenue.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SECTION 5: Sales Progression (existing) ──────────────── */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold mb-1">Sales Progression</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Anticipated capacity vs actual tickets sold
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={attendanceProgressData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip content={<ChartTooltip currency={currency} />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="target"
                    name="Target Capacity"
                    fill="var(--color-secondary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="attended"
                    name="Tickets Sold"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SECTION 6: All Ticket Classifications — grouped by stop ── */}
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <div className="p-6 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">All Ticket Classifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Grouped by tour stop · location and status
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Sold / Total</th>
                  <th className="px-6 py-4 font-medium">Revenue</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ticketsByStop.map((group: any, gIdx: number) => (
                  <Fragment key={`stop-group-${gIdx}`}>
                    {/* Stop group header */}
                    <tr key={`group-${gIdx}`}>
                      <td
                        colSpan={5}
                        className="px-6 py-2.5 bg-primary/8 border-y border-primary/15"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: "#f97316" }}
                          />
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            {group.label}
                          </span>
                          <span className="ml-auto text-[11px] text-muted-foreground">
                            {group.tickets.length} ticket type
                            {group.tickets.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Tickets in this stop */}
                    {group.tickets.map((tier: any) => {
                      const isSoldOut = Number(tier.remaining || 0) === 0;
                      return (
                        <tr
                          key={tier.id}
                          className="hover:bg-secondary/20 transition-colors border-t border-border/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: tier.color }}
                              />
                              <span className="font-medium">{tier.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-green-500 font-medium">
                            {Number(tier.cost) === 0 ? (
                              <span className="text-muted-foreground">Free</span>
                            ) : (
                              <>{formatCurrency(tier.cost, currency)}</>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    background: "#f97316",
                                    width: `${tier.capacity > 0 ? Math.round((Number(tier.sold) / tier.capacity) * 100) : 0}%`,
                                  }}
                                />
                              </div>
                              <span>
                                {tier.sold}
                                <span className="text-muted-foreground"> / {tier.capacity}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-green-500">
                            {formatCurrency(tier.revenue, currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                isSoldOut
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-green-500/10 text-green-500"
                              }`}
                            >
                              {isSoldOut ? "Sold Out" : "Available"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Cover Image */}
          {event.cover && (
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
              <img src={event.cover} alt="Event cover" className="w-full h-48 object-cover" />
            </div>
          )}

          {/* ── EXPERIENCE STATS ──────────────────────────────────────── */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Experience</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Reviews, stories & posts</p>
              </div>
              <Link
                to="/dashboard/$workspaceSlug/events/$eventId/experience"
                params={{ workspaceSlug: workspaceSlug || "", eventId: eventId || "" }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Avg Rating */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <IconStar className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                  <p className="font-bold text-amber-500">
                    {avgRating}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / 5 · {totalReviews} reviews
                    </span>
                  </p>
                </div>
              </div>

              {/* Stories */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                  <IconCamera className="w-5 h-5 text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Stories Posted</p>
                  <p className="font-bold">
                    {stories.length}{" "}
                    <span className="text-xs font-normal text-muted-foreground">active</span>
                  </p>
                </div>
              </div>

              {/* Posts */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <IconBubble className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Posts Published</p>
                  <p className="font-bold">
                    {posts.length}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {pinnedPosts} pinned
                    </span>
                  </p>
                </div>
              </div>

              {/* Engagements */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                  <IconHeart className="w-5 h-5 text-rose-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Engagements</p>
                  <p className="font-bold">
                    {(totalLikes + totalComments).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {totalLikes} likes · {totalComments} comments
                    </span>
                  </p>
                </div>
              </div>

              {/* Location / Stops */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                  <IconPin className="w-5 h-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Tour Stops</p>
                  <p className="font-bold">
                    {((event.tour_stops as any[]) || []).length}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      location{((event.tour_stops as any[]) || []).length !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SCHEDULE: Calendar + Stops ────────────────────────────── */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
            <h3 className="font-semibold">Event Schedule</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-xl border border-border/60 mx-auto"
            />
            <div className="space-y-2 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Locations / Stops
              </p>
              {Array.isArray(event.tour_stops) &&
                event.tour_stops.map((stop: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-secondary/50 rounded-xl border border-border text-xs space-y-1"
                  >
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

          {/* ── Ticket Breakdown Pie ──────────────────────────────────── */}
          {ticketBreakdown.length > 0 && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold mb-1">Sales Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-4">By ticket type</p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={ticketBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {ticketBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderRadius: "12px",
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-3">
                {(() => {
                  // Group legend items by stop
                  const stops: any[] = Array.isArray(event.tour_stops) ? event.tour_stops : [];
                  const groups: { label: string; items: any[] }[] = [];
                  const seen = new Set<number | null>();
                  stops.forEach((stop: any, idx: number) => {
                    const items = ticketBreakdown.filter((e: any) => e.stopIdx === idx);
                    if (items.length > 0) {
                      seen.add(idx);
                      groups.push({ label: stop.venue || stop.city || `Stop ${idx + 1}`, items });
                    }
                  });
                  const global = ticketBreakdown.filter(
                    (e: any) => e.stopIdx == null || !seen.has(e.stopIdx),
                  );
                  if (global.length > 0) groups.push({ label: "All Locations", items: global });
                  const finalGroups =
                    groups.length > 0 ? groups : [{ label: "", items: ticketBreakdown }];
                  return finalGroups.map((group, gi) => (
                    <div key={gi}>
                      {group.label && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-1.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.label}
                        </p>
                      )}
                      <div className="space-y-1.5">
                        {group.items.map((entry: any, index: number) => (
                          <div
                            key={entry.id || index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground text-xs">{entry.name}</span>
                            </div>
                            <span className="font-semibold text-xs">
                              {entry.value} {entry.value === 1 ? "ticket" : "tickets"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* ── Danger Zone ──────────────────────────────────────────── */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="font-semibold text-red-500 flex items-center gap-2 mb-2">
              <Ban className="h-5 w-5" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Suspending this event will immediately halt all ticket sales and hide it from the
              public.
            </p>
            <Button
              variant="destructive"
              className="w-full rounded-full"
              onClick={() => {
                toggleSuspend.mutate({ id: event.id, suspended: !event.suspended });
              }}
              disabled={toggleSuspend.isPending}
            >
              {toggleSuspend.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {event.suspended ? "Unsuspending..." : "Suspending..."}
                </>
              ) : event.suspended ? (
                "Unsuspend Event"
              ) : (
                "Suspend Event"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
