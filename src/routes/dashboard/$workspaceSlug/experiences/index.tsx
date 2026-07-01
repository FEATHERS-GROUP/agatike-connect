import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Clock, Users, Calendar, Eye, Activity, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceEvents } from "@/api/events";

// Stubbed mock data
const experienceCategories: any[] = [];

export const Route = createFileRoute("/dashboard/$workspaceSlug/experiences/")({
  component: DashboardExperiences,
});

function DashboardExperiences() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("create_experience_draft");
      if (saved) {
        setDraft(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const expList = useMemo(() => {
    return rawEvents
      .filter(
        (e: any) => e.event_type === "experience" || experienceCategories.includes(e.category),
      )
      .map((e: any) => {
        const ts = e.tour_stops || {};
        const fr = e.event_requency || {};

        // ── Tickets ─────────────────────────────────────
        let price = 0;
        let ticketSold = 0;
        let ticketRemaining = 0;
        if (e.event_tickets && e.event_tickets.length > 0) {
          price = Math.min(...e.event_tickets.map((t: any) => Number(t.cost || 0)));
          ticketSold = e.event_tickets.reduce(
            (acc: number, t: any) => acc + Number(t.sold || 0),
            0,
          );
          ticketRemaining = e.event_tickets.reduce(
            (acc: number, t: any) => acc + Number(t.remaining || 0),
            0,
          );
        }

        // ── Schedules ────────────────────────────────────
        // Primary run = event_requency date + ticket spots
        // Additional runs = DB schedules table (future occurrences of same experience)
        const dbSchedules = e.schedules || [];
        const primaryExists = !!fr.date || !!ts.date;

        // Total count: 1 for the primary event date + each additional DB schedule
        // Total sold: ticket sold (primary) + sum of DB schedule spots_filled
        // Total capacity: ticket spots (primary) + sum of DB schedule total_spots
        const dbScheduleSold = dbSchedules.reduce(
          (acc: number, s: any) => acc + Number(s.spots_filled || 0),
          0,
        );
        const dbScheduleCapacity = dbSchedules.reduce(
          (acc: number, s: any) => acc + Number(s.total_spots || 0),
          0,
        );

        const totalSold = ticketSold + dbScheduleSold;
        const totalCapacity = ticketSold + ticketRemaining + dbScheduleCapacity;
        const available = Math.max(0, totalCapacity - totalSold);

        // ── Duration & Dates ─────────────────────────────
        const dateStr = fr.date || ts.date || "";
        const numDays = fr.numberOfDays || 1;

        let durationStr = "Not specified";
        let endDateStr = dateStr;

        if (numDays > 1) {
          durationStr = `${numDays} Days`;
          if (dateStr) {
            const d = new Date(dateStr);
            d.setDate(d.getDate() + numDays - 1);
            endDateStr = d.toISOString().split("T")[0];
          }
        } else {
          const itin = ts.itinerary || [];
          if (itin.length >= 2) {
            const firstTime = itin[0].time;
            const lastTime = itin[itin.length - 1].time;
            if (firstTime && lastTime) {
              const [h1, m1] = firstTime.split(":").map(Number);
              const [h2, m2] = lastTime.split(":").map(Number);
              const diff = h2 + m2 / 60 - (h1 + m1 / 60);
              durationStr = diff > 0 ? `${Math.round(diff * 10) / 10} hours` : "Not specified";
            } else {
              durationStr = "Not specified";
            }
          } else {
            durationStr = "Not specified";
          }
        }

        // Total schedules = 1 primary (if event has a date) + additional DB schedule rows
        const schedulesCount = (primaryExists ? 1 : 0) + dbSchedules.length;

        const isUpcoming = ts.is_upcoming === true;
        const displayDate = isUpcoming
          ? ts.timer_date
            ? `Drops on ${new Date(ts.timer_date).toLocaleDateString("en-US")}`
            : "Coming Soon"
          : numDays > 1 && dateStr
            ? `${dateStr} to ${endDateStr}`
            : dateStr || "Not scheduled";
        const city = ts.city || ts.venueName || "Location not set";

        return {
          id: e.id,
          title: e.title || "Untitled Experience",
          description: e.description || "No description provided.",
          cover:
            e.cover ||
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80",
          category: e.category,
          date: displayDate,
          city: city,
          price,
          currency: activeWorkspace?.currency || "USD",
          duration: durationStr,
          totalSold,
          totalCapacity,
          available,
          schedulesCount,
          isUpcoming,
        };
      });
  }, [rawEvents, activeWorkspace]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
          <p className="text-sm text-muted-foreground">
            Manage your guided tours, activities, and special experiences.
          </p>
        </div>
        <Link
          to="/dashboard/$workspaceSlug/experiences/create-experience"
          params={{ workspaceSlug: activeWorkspace?.slug || "workspace" }}
        >
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="mr-1 h-4 w-4" /> Create Experience
          </Button>
        </Link>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Experiences</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold mt-1">{expList.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active listings</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Bookings</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">
            {expList.reduce((acc, curr) => acc + curr.totalSold, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Across all experiences</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Available Spots</span>
            <Calendar className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">
            {expList.reduce((acc, curr) => acc + curr.available, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Remaining capacity</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Schedules</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">
            {expList.reduce((acc, curr) => acc + curr.schedulesCount, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Across all experiences</p>
        </div>
      </div>

      {/* Experience List Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Draft Card */}
          {draft && (
            <div className="group rounded-3xl border-2 border-dashed border-primary/50 bg-primary/5 overflow-hidden flex flex-col items-center justify-center p-6 text-center hover:bg-primary/10 transition-colors">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary shadow-sm">
                <Edit3 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
                {draft.title || "Unpublished Draft"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                You have an unsaved experience draft. Click to resume editing.
              </p>
              <Button
                onClick={() =>
                  navigate({
                    to: "/dashboard/$workspaceSlug/experiences/create-experience",
                    params: { workspaceSlug: activeWorkspace?.slug || "workspace" },
                  })
                }
                className="rounded-full shadow-sm"
              >
                Resume Editing
              </Button>
            </div>
          )}

          {expList.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)] hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={exp.cover}
                  alt={exp.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/90 backdrop-blur text-foreground shadow-sm">
                    {exp.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  {exp.isUpcoming ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/90 backdrop-blur text-white shadow-sm">
                      Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/90 backdrop-blur text-primary-foreground shadow-sm">
                      {exp.price === 0 ? "Free" : formatCurrency(exp.price, exp.currency)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {exp.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{exp.description}</p>

                <div className="mt-auto space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{exp.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{exp.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{exp.duration}</span>
                    </div>
                    {!exp.isUpcoming && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{exp.available} spots left</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs rounded-xl"
                    onClick={() =>
                      navigate({
                        to: "/dashboard/$workspaceSlug/experiences/$experienceId/edit",
                        params: {
                          workspaceSlug: activeWorkspace?.slug || "workspace",
                          experienceId: exp.id,
                        },
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full h-9 text-xs rounded-xl"
                    onClick={() =>
                      navigate({
                        to: "/dashboard/$workspaceSlug/experiences/$experienceId",
                        params: {
                          workspaceSlug: activeWorkspace?.slug || "workspace",
                          experienceId: exp.id,
                        },
                      })
                    }
                  >
                    <Eye className="mr-1.5 h-3 w-3" /> View
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {expList.length === 0 && !draft && (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border/60">
              <p className="text-lg font-medium text-foreground mb-1">No experiences yet</p>
              <p className="text-sm">Create your first experience to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
