import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Eye,
  Edit2,
  Ban,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceEvents } from "@/api/events";
import { formatCurrency } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/")({
  component: DashboardEvents,
});

function getEventStatus(createdAt: string): "Live" | "Past" {
  // Events default to "Live" — extend later with explicit status column
  return "Live";
}

function computeStats(tickets: any[]) {
  const totalSold = tickets.reduce((acc, t) => acc + Number(t.sold || 0), 0);
  const totalRemaining = tickets.reduce((acc, t) => acc + Number(t.remaining || 0), 0);
  const totalCapacity = totalSold + totalRemaining;
  const salesPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const revenue = tickets.reduce((acc, t) => acc + Number(t.sold || 0) * Number(t.cost || 0), 0);
  return { totalSold, salesPct, revenue };
}

function DashboardEvents() {
  const [filter, setFilter] = useState<"All" | "Live" | "Drafts" | "Past">("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const experienceCategories = ["Hiking", "Running", "Surf", "Wellness", "Drawing", "Art", "Trips", "Experience"];

  const events = useMemo(() => {
    return rawEvents
      .filter((e: any) => !experienceCategories.includes(e.category))
      .map((e: any) => {
      const firstStop = Array.isArray(e.tour_stops) ? e.tour_stops[0] : null;
      const { salesPct, revenue } = computeStats(e.event_tickets || []);
      return {
        ...e,
        date: firstStop?.date || "TBD",
        city: firstStop
          ? `${firstStop.venue ? firstStop.venue + ", " : ""}${firstStop.city || ""}`
          : "TBD",
        status: getEventStatus(e.created_at),
        salesPct,
        revenue,
      };
    });
  }, [rawEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || e.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">Manage and track your events.</p>
        </div>
        <Link
          to="/dashboard/$workspaceSlug/events/create-event"
          params={{ workspaceSlug: activeWorkspace?.slug || "" }}
        >
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="mr-1 h-4 w-4" /> Create Event
          </Button>
        </Link>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-secondary/50 border-transparent"
            />
          </div>
          <Button variant="outline" className="rounded-full shrink-0">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="flex bg-secondary/50 p-1 rounded-full w-full md:w-auto">
          {["All", "Live", "Drafts", "Past"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                filter === f
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-medium">No events found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Date &amp; Location</th>
                  <th className="px-6 py-4 font-medium">Sales</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEvents.map((event: any) => (
                  <tr
                    key={event.id}
                    className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                    onClick={() =>
                      navigate({
                        to: "/dashboard/$workspaceSlug/events/$eventId",
                        params: {
                          workspaceSlug: activeWorkspace?.slug || "",
                          eventId: event.id,
                        },
                      })
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.cover ? (
                          <img
                            src={event.cover}
                            className="h-12 w-12 rounded-xl object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                            <Ticket className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {Array.isArray((event as any).tour_stops) &&
                        (event as any).tour_stops.length > 0 ? (
                          (event as any).tour_stops.map((stop: any, i: number) => (
                            <div key={i} className="text-xs">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {stop.date || "TBD"} {stop.time ? `· ${stop.time}` : ""}
                              </div>
                              <div className="flex items-center text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">
                                  {stop.venue ? `${stop.venue}, ` : ""}
                                  {stop.city || ""}
                                </span>
                              </div>
                              {(event as any).tour_stops.length > 1 &&
                                i < (event as any).tour_stops.length - 1 && (
                                  <div className="border-b border-border/40 mt-1.5" />
                                )}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center text-muted-foreground text-xs">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            <span>{(event as any).date || "TBD"}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center font-medium">
                          <Ticket className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          <span>{event.salesPct}% sold</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-[120px]">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(event.revenue, activeWorkspace?.currency)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === "Live"
                            ? "bg-green-500/10 text-green-500"
                            : event.status === "Drafts"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: "/dashboard/$workspaceSlug/events/$eventId",
                                params: {
                                  workspaceSlug: activeWorkspace?.slug || "",
                                  eventId: event.id,
                                },
                              })
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: "/dashboard/$workspaceSlug/events/$eventId/edit",
                                params: {
                                  workspaceSlug: activeWorkspace?.slug || "",
                                  eventId: event.id,
                                },
                              })
                            }
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            <Ban className="mr-2 h-4 w-4" /> Suspend Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
