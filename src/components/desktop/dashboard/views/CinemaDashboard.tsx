import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { getCinemas } from "@/api/cinemas";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { getWorkspaceWallet } from "@/api/wallet";
import { getWorkspaceTicketProjects } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Wallet,
  LayoutTemplate,
  Ticket,
  Film,
  MonitorPlay,
  Clapperboard,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function CinemaDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  // -- Queries --
  const { data: cinemas = [] } = useQuery({
    queryKey: ["workspace-cinemas", workspaceId],
    queryFn: () => getCinemas({ data: { workspace_id: workspaceId! } } as any),
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
    let totalScreens = 0;
    let totalMovies = 0;

    const cinemaList = cinemas.map((c: any) => {
      const screensCount = c.screens_aggregate?.aggregate?.count || 0;
      const moviesCount = c.movies_aggregate?.aggregate?.count || 0;

      totalScreens += screensCount;
      totalMovies += moviesCount;

      return {
        id: c.id,
        name: c.name,
        cover: c.cover_url || c.logo_url,
        city: c.city,
        screensCount,
        moviesCount,
      };
    });

    // Sort Top Cinemas by Movie Count (primary) and Screens (secondary)
    cinemaList.sort((a, b) => b.moviesCount - a.moviesCount || b.screensCount - a.screensCount);
    const topCinemas = cinemaList.slice(0, 5);

    return {
      totalCinemas: cinemas.length,
      totalScreens,
      totalMovies,
      topCinemas,
    };
  }, [cinemas]);

  const kpis = [
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet?.amount || 0, activeWorkspace?.currency),
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active Cinemas",
      value: stats.totalCinemas,
      icon: Clapperboard,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Screens",
      value: stats.totalScreens,
      icon: MonitorPlay,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Movies Showing",
      value: stats.totalMovies,
      icon: Film,
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
        {/* Main Section placeholder (e.g. schedules or analytics in the future) */}
        <section className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col min-h-[400px] justify-center items-center text-center">
          <Clapperboard className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold">Cinema Analytics Overview</h2>
          <p className="text-muted-foreground text-sm max-w-md mt-2">
            Detailed booking schedules and analytics charts will be displayed here soon as your
            cinemas start receiving ticket orders.
          </p>
        </section>

        {/* Top Cinemas Leaderboard */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Film className="h-5 w-5 text-red-500" /> Top Cinemas
          </h2>

          {stats.topCinemas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border border-dashed border-border/60 rounded-2xl">
              <Clapperboard className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm">No cinemas found.</p>
              <p className="text-xs mt-1">Add your first cinema branch.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.topCinemas.map((cinema: any, idx: number) => (
                <div
                  key={cinema.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">#{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0">
                    {cinema.cover ? (
                      <img src={cinema.cover} alt={cinema.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-500 font-bold">
                        {cinema.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{cinema.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {cinema.city || "N/A"}
                      </span>
                      <span className="flex items-center gap-1 text-blue-500 font-medium">
                        <MonitorPlay className="h-3 w-3" /> {cinema.screensCount} screens
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-500">
                      {cinema.moviesCount} movies
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
