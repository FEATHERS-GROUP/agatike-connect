import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { CalendarDays, Users, Settings, ArrowLeft } from "lucide-react";
import { rentableVenues } from "@/lib/mock-data";

export function VenueSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const venueId = params.venueId as string;
  const workspaceSlug = params.workspaceSlug as string;
  const venue = rentableVenues.find((v) => v.id === venueId);

  const nav = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceSlug}/venues/${venueId}/overview`,
      icon: CalendarDays,
    },
    {
      label: "Bookings",
      href: `/dashboard/${workspaceSlug}/venues/${venueId}/bookings`,
      icon: Users,
    },
    {
      label: "Settings",
      href: `/dashboard/${workspaceSlug}/venues/${venueId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        to="/dashboard/$workspaceSlug/venue-rent"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Listings</span>
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 overflow-hidden rounded-lg bg-secondary shrink-0">
          {venue?.cover && (
            <img src={venue.cover} alt={venue.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{venue?.name}</p>
          <p className="text-xs text-muted-foreground">{venue?.type}</p>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Venue Workspace
      </p>

      <nav className="space-y-0.5 text-sm flex-1">
        {nav.map((n) => {
          const isActive = location.pathname.includes(n.href);
          return (
            <Link
              key={n.label}
              to={n.href}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
