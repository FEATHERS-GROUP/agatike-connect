import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { getSpaces } from "@/api/spaces";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { getWorkspaceWallet } from "@/api/wallet";
import { getWorkspaceTicketProjects } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Wallet,
  LayoutTemplate,
  Ticket,
  MapPin,
  Building2,
  Users,
  Box,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function SpaceDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  // -- Queries --
  const { data: spaces = [] } = useQuery({
    queryKey: ["workspace-spaces", workspaceId],
    queryFn: () => getSpaces({ data: { workspace_id: workspaceId! } } as any),
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
    let activeSpacesCount = 0;
    let totalPlans = 0;

    const spaceList = spaces.map((s: any) => {
      if (s.status === "Active") activeSpacesCount++;

      const plansCount = Array.isArray(s.plans) ? s.plans.length : 0;
      totalPlans += plansCount;

      return {
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status,
        plansCount,
      };
    });

    // Sort Top Spaces by plans count
    spaceList.sort((a, b) => b.plansCount - a.plansCount);
    const topSpaces = spaceList.slice(0, 5);

    return {
      totalSpaces: spaces.length,
      activeSpacesCount,
      totalPlans,
      topSpaces,
    };
  }, [spaces]);

  const kpis = [
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet?.amount || 0, activeWorkspace?.currency),
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Spaces",
      value: stats.totalSpaces,
      icon: Building2,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Active Spaces",
      value: stats.activeSpacesCount,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Subscription Plans",
      value: stats.totalPlans,
      icon: Box,
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
          <h2 className="text-xl font-bold">Space Subscriptions & Analytics</h2>
          <p className="text-muted-foreground text-sm max-w-md mt-2">
            Detailed tracking of members and subscription renewals will appear here once you
            start onboarding members to your spaces.
          </p>
        </section>

        {/* Top Spaces Leaderboard */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Box className="h-5 w-5 text-indigo-500" /> Top Spaces
          </h2>

          {stats.topSpaces.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border border-dashed border-border/60 rounded-2xl">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm">No spaces found.</p>
              <p className="text-xs mt-1">Create a space to see it here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.topSpaces.map((space: any, idx: number) => (
                <div
                  key={space.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">#{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0 flex items-center justify-center bg-indigo-500/10 text-indigo-500 font-bold">
                    {space.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{space.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-indigo-500 font-medium">
                        {space.plansCount} plans
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {space.status === "Active" ? (
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {space.status || "Draft"}
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
