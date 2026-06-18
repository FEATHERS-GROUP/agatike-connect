import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { LayoutDashboard, MapPin, Users, Settings, ArrowLeft, CreditCard, ListChecks, Link as LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { cn } from "@/lib/utils";

export function SpaceSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  // Extract spaceId from the pathname: /dashboard/:workspaceSlug/spaces/:spaceId/...
  const pathParts = location.pathname.split("/");
  const spaceId = pathParts[4] || "";

  const { data: space } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const nav = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Subscriptions",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/subscriptions`,
      icon: ListChecks,
    },
    {
      label: "Locations",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/locations`,
      icon: MapPin,
    },
    {
      label: "Membership Plans",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/plans`,
      icon: CreditCard,
    },
    {
      label: "Integrations",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/integrations`,
      icon: LinkIcon,
    },
    {
      label: "Settings",
      href: `/dashboard/${workspaceSlug}/spaces/${spaceId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        to="/dashboard/$workspaceSlug/spaces"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Spaces</span>
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 overflow-hidden rounded-lg bg-secondary shrink-0">
          {space?.cover_url && (
            <img
              src={space.cover_url}
              alt={space.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{space?.name || "Loading..."}</p>
          <p className="text-xs text-muted-foreground">{space?.type || "Space Workspace"}</p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4">
        Workspace
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

      {/* Workspace-level shortcut */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Workspace
        </p>
        <Link
          to={`/dashboard/${workspaceSlug}/memberships`}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
            location.pathname.includes(`/${workspaceSlug}/memberships`)
              ? "bg-accent text-accent-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Users className={cn(
            "h-4 w-4 shrink-0",
            location.pathname.includes(`/${workspaceSlug}/memberships`) ? "text-primary" : ""
          )} />
          <span className="truncate">Memberships</span>
        </Link>
      </div>
    </aside>
  );
}
