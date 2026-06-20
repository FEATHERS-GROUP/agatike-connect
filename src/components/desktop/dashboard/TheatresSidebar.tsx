import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { Building2, Ticket, Plus, ArrowLeft, BarChart3, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export function TheatresSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  const nav = [
    {
      label: "All Cinemas",
      href: `/dashboard/${workspaceSlug}/Cinema`,
      icon: Building2,
      exact: true,
    },
    {
      label: "Analytics",
      href: `/dashboard/${workspaceSlug}/Cinema/analytics`,
      icon: BarChart3,
    },
    {
      label: "Film Library",
      href: `/dashboard/${workspaceSlug}/Cinema/movies`,
      icon: Film,
    },
    {
      label: "Ticket Tiers",
      href: `/dashboard/${workspaceSlug}/Cinema/ticket-tiers`,
      icon: Ticket,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href || location.pathname === `${href}/`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        to="/dashboard/$workspaceSlug"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">Cinemas & Theatres</p>
          <p className="text-xs text-muted-foreground">Venue Management</p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 px-1">
        Management
      </p>

      <nav className="space-y-0.5 text-sm flex-1">
        {nav.map((n) => {
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.label}
              to={n.href}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <n.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-border/60">
        <Link
          to={`/dashboard/${workspaceSlug}/Cinema`}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Cinema</span>
        </Link>
      </div>
    </aside>
  );
}
