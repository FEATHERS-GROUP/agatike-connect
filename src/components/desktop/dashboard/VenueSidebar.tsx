import { Link, useRouterState, useParams } from "@tanstack/react-router";
import {
  CalendarDays,
  Users,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { rentableVenues } from "@/lib/mock-data";

export function VenueSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const venueId = params.venueId as string;
  const workspaceSlug = params.workspaceSlug as string;
  const venue = rentableVenues.find((v) => v.id === venueId);

  const nav = [
    { label: "Overview", href: `/dashboard/${workspaceSlug}/venues/${venueId}/overview`, icon: CalendarDays },
    { label: "Bookings", href: `/dashboard/${workspaceSlug}/venues/${venueId}/bookings`, icon: Users },
    { label: "Settings", href: `/dashboard/${workspaceSlug}/venues/${venueId}/settings`, icon: Settings },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:block">
      <div className="mb-6 px-2">
        <Link to="/dashboard/$workspaceSlug/venue-rent" params={{ workspaceSlug: workspaceSlug || "" }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-secondary">
            {venue?.cover && <img src={venue.cover} alt={venue.name} className="h-full w-full object-cover" />}
          </div>
          <div>
            <p className="font-semibold leading-tight line-clamp-1">{venue?.name}</p>
            <p className="text-xs text-muted-foreground">{venue?.type}</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1 text-sm">
        {nav.map((n) => {
          const isActive = location.pathname.includes(n.href);
          return (
            <Link
              key={n.label}
              to={n.href}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
