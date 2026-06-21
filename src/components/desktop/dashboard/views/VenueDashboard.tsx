import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { getWorkspaceWallet } from "@/api/wallet";
import { getWorkspaceTicketProjects } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Wallet, LayoutTemplate, Ticket, MapPin, Building2, Brush } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function VenueDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  // -- Queries --
  const { data: venueProjects = [] } = useQuery({
    queryKey: ["workspace-venue-projects", workspaceId],
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id: workspaceId! } } as any),
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

  // -- Computations --
  const stats = useMemo(() => {
    let assignedProjects = 0;

    const projectList = venueProjects.map((p: any) => {
      const isAssigned = !!p.event_id;
      if (isAssigned) assignedProjects++;

      const sectionsCount = Array.isArray(p.sections_data) ? p.sections_data.length : 0;

      return {
        id: p.id,
        name: p.name,
        isAssigned,
        sectionsCount,
      };
    });

    // Sort Top Projects by sections count (complexity)
    projectList.sort((a, b) => b.sectionsCount - a.sectionsCount);
    const topProjects = projectList.slice(0, 5);

    return {
      totalProjects: venueProjects.length,
      assignedProjects,
      topProjects,
    };
  }, [venueProjects]);

  const kpis = [
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet?.amount || 0, activeWorkspace?.currency),
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Venue Projects",
      value: stats.totalProjects,
      icon: Building2,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Assigned Projects",
      value: stats.assignedProjects,
      icon: MapPin,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Unassigned Drafts",
      value: stats.totalProjects - stats.assignedProjects,
      icon: Brush,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Page Designs",
      value: pages.length,
      icon: LayoutTemplate,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Ticket Tiers",
      value: ticketProjects.length,
      icon: Ticket,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
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
        {/* Main Section placeholder */}
        <section className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col min-h-[400px] justify-center items-center text-center">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold">Venue Designs Overview</h2>
          <p className="text-muted-foreground text-sm max-w-md mt-2">
            This space will feature interactive seating charts and venue analytics once ticket
            projects are fully integrated with seat-selection.
          </p>
        </section>

        {/* Top Venue Projects Leaderboard */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Brush className="h-5 w-5 text-indigo-500" /> Top Venue Projects
          </h2>

          {stats.topProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border border-dashed border-border/60 rounded-2xl">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm">No venue projects found.</p>
              <p className="text-xs mt-1">Design a venue map to see it here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.topProjects.map((project: any, idx: number) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">#{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0 flex items-center justify-center bg-indigo-500/10 text-indigo-500 font-bold">
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{project.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-indigo-500 font-medium">
                        {project.sectionsCount} sections drawn
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {project.isAssigned ? (
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Assigned
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                        Draft
                      </span>
                    )}
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
