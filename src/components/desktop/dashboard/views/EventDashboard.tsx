import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { getWorkspaceEvents, getWorkspaceTicketProjects } from "@/api/events";
import { DesktopRecentOrders } from "@/components/desktop/dashboard/DesktopRecentOrders";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { getWorkspaceWallet } from "@/api/wallet";
import { getWorkspaceProducts } from "@/api/products";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Wallet,
  CalendarDays,
  CheckCircle2,
  LayoutTemplate,
  Ticket,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

import { Suspense, lazy } from "react";
const Calendar = lazy(() => import("@/components/lazy/LazyCalendar"));
import { formatCurrency } from "@/lib/currency";

export function EventDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  // -- Queries --
  const { data: rawEvents = [] } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: wallet } = useQuery({
    queryKey: ["workspace-wallet", workspaceId],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["workspace-pages", workspaceId],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: ticketProjects = [] } = useQuery({
    queryKey: ["workspace-ticket-projects", workspaceId],
    queryFn: () => getWorkspaceTicketProjects({ data: { workspaceId: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["workspace-products", workspaceId],
    queryFn: () => getWorkspaceProducts({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  // -- Computations --
  const stats = useMemo(() => {
    let pendingEvents = 0;
    let completedEvents = 0;
    const now = new Date();
    const currentYear = now.getFullYear();

    const topEventsList = rawEvents.map((e: any) => {
      let sold = 0;
      let rev = 0;
      (e.event_tickets || []).forEach((t: any) => {
        sold += Number(t.sold || 0);
        rev += Number(t.sold || 0) * Number(t.cost || 0);
      });

      const avgRating = e.event_feedback_aggregate?.aggregate?.avg?.rating || 0;

      // Determine completed vs pending
      // Use the last tour stop date if available, else fallback to current date comparison (simplified)
      let isCompleted = false;
      const stops = Array.isArray(e.tour_stops) ? e.tour_stops : [];
      if (stops.length > 0) {
        const lastStop = stops[stops.length - 1];
        if (lastStop && lastStop.date) {
          const stopDate = new Date(lastStop.date);
          if (stopDate < now) {
            isCompleted = true;
            if (stopDate.getFullYear() === currentYear) completedEvents++;
          } else {
            pendingEvents++;
          }
        } else {
          pendingEvents++; // fallback
        }
      } else {
        pendingEvents++; // fallback
      }

      return {
        id: e.id,
        title: e.title,
        cover: e.cover,
        sold,
        rev,
        avgRating,
      };
    });

    // Sort Top Events by Sold (primary) and Rating (secondary)
    topEventsList.sort((a, b) => b.sold - a.sold || b.avgRating - a.avgRating);
    const topEvents = topEventsList.slice(0, 5);

    return {
      pendingEvents,
      completedEvents,
      topEvents,
    };
  }, [rawEvents]);

  // Calendar Events Mapping
  const calendarEvents = useMemo(() => {
    const evs: any[] = [];
    rawEvents.forEach((e: any) => {
      const stops = Array.isArray(e.tour_stops) ? e.tour_stops : [];
      stops.forEach((stop: any, idx: number) => {
        if (stop.date) {
          const startDate = new Date(stop.date);
          // Assuming 4 hour duration if not specified
          const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
          evs.push({
            id: `${e.id}-${idx}`,
            title: `${e.title}${stops.length > 1 ? ` (Stop ${idx + 1})` : ""}`,
            start: startDate,
            end: endDate,
            allDay: false,
          });
        }
      });
    });
    return evs;
  }, [rawEvents]);

  const kpis = [
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet?.amount || 0, activeWorkspace?.currency),
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Events",
      value: stats.pendingEvents,
      icon: CalendarDays,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Completed (YTD)",
      value: stats.completedEvents,
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Page Designs",
      value: pages.length,
      icon: LayoutTemplate,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Ticket Projects",
      value: ticketProjects.length,
      icon: Ticket,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Product Add-ons",
      value: products.length,
      icon: ShoppingBag,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DesktopHeader />

      {/* KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <div
              className={`w-10 h-10 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4`}
            >
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Calendar Section */}
          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col h-[600px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Workspace Schedule
            </h2>
            <div className="flex-1 bg-secondary/20 rounded-2xl overflow-hidden border border-border/40 p-2">
              <Suspense fallback={<div className="animate-pulse bg-muted/20 h-full rounded-xl" />}>
                <Calendar
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  views={["month", "agenda"]}
                  className="text-sm font-sans"
                  eventPropGetter={() => ({
                    style: {
                      background: "var(--gradient-primary)",
                      color: "#fff",
                    },
                  })}
                />
              </Suspense>
            </div>
          </section>

          <DesktopRecentOrders />
        </div>

        {/* Top Events Leaderboard */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" /> Top Events
          </h2>

          {stats.topEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border border-dashed border-border/60 rounded-2xl">
              <Star className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm">No events found.</p>
              <p className="text-xs mt-1">Create an event to see it here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.topEvents.map((ev: any, idx: number) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">#{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0">
                    {ev.cover ? (
                      <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                        {ev.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {ev.sold.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-orange-500 font-medium">
                        <Star className="h-3 w-3 fill-orange-500" />{" "}
                        {ev.avgRating ? ev.avgRating.toFixed(1) : "0.0"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(ev.rev, activeWorkspace?.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
