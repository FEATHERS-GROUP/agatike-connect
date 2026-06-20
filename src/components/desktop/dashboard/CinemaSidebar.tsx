import { Link, useRouterState, useParams } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Film,
  CalendarDays,
  MonitorPlay,
  Settings,
  ArrowLeft,
  Ticket,
  LayoutTemplate,
  FormInput,
  Archive,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import { cn } from "@/lib/utils";

// Mock Data instead of query for now to keep it consistent
const MOCK_CINEMA = {
  id: "CenturyCinema",
  name: "Century Cinema",
  city: "Kigali",
  screens: 4,
  image:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600",
};

export function CinemaSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  // Extract cinemaId from the pathname: /dashboard/:workspaceSlug/Cinema/:cinemaId/...
  const pathParts = location.pathname.split("/");
  const cinemaId = pathParts[4] || "";

  const { data: cinema } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } } as any),
    enabled: !!cinemaId && cinemaId !== "create" && cinemaId !== "movies" && cinemaId !== "ticket-tiers" && cinemaId !== "create-movie" && cinemaId !== "create-ticket-tier",
  });

  const nav = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Movies",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/movies`,
      icon: Film,
    },
    {
      label: "Schedules",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/schedules`,
      icon: CalendarDays,
    },
    {
      label: "Screens / Halls",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/screens`,
      icon: MonitorPlay,
    },
    {
      label: "Past & Finished",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/archive`,
      icon: Archive,
    },
    {
      label: "Settings",
      href: `/dashboard/${workspaceSlug}/Cinema/${cinemaId}/settings`,
      icon: Settings,
    },
  ];

  const toolsNav = [
    {
      label: "Ticket Designer",
      href: `/dashboard/${workspaceSlug}/ticket-designer`,
      icon: Ticket,
    },
    {
      label: "Page Builder",
      href: `/dashboard/${workspaceSlug}/page-builder`,
      icon: LayoutTemplate,
    },
    // Adding form builder stub if it doesn't exist yet, using a general route
    {
      label: "Form Builder",
      href: `/dashboard/${workspaceSlug}/forms`,
      icon: FormInput,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        to="/dashboard/$workspaceSlug/Cinema"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Cinemas</span>
      </Link>

      <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary overflow-hidden">
            {cinema?.logo_url || cinema?.cover_url ? (
              <img src={cinema?.logo_url || cinema?.cover_url} alt={cinema.name} className="h-full w-full object-cover" />
            ) : (
              <Film className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold truncate" title={cinema?.name || "Loading..."}>
              {cinema?.name || "Loading..."}
            </span>
            <span className="text-xs text-muted-foreground truncate" title={cinema?.city || "..."}>
              {cinema?.city || "..."}
            </span>
          </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 px-1">
        Management
      </p>

      <nav className="space-y-0.5 text-sm flex-1">
        {nav.map((n) => {
          const isActive = location.pathname.includes(n.href);
          return (
            <Link
              key={n.label}
              to={n.href}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <n.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Tools Section */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Design Tools
        </p>
        <nav className="space-y-0.5 text-sm">
          {toolsNav.map((n) => {
            const isActive = location.pathname.includes(n.href);
            return (
              <Link
                key={n.label}
                to={n.href}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <n.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
