import { Link, useRouterState, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Car,
  Wallet,
  UserCheck,
  MapPin,
  ShoppingBag,
} from "lucide-react";

export function EventSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;
  
  // Extract eventId from the pathname: /dashboard/kigali-arenas/events/123/...
  const pathParts = location.pathname.split('/');
  const eventId = pathParts[4] || "";

  const nav = [
    { label: "Overview", href: `/dashboard/${workspaceSlug}/events/${eventId}`, icon: LayoutDashboard },
    { label: "Customers", href: `/dashboard/${workspaceSlug}/events/${eventId}/customers`, icon: Users },
    { label: "Parking", href: `/dashboard/${workspaceSlug}/events/${eventId}/parking`, icon: Car },
    { label: "Budget & Planning", href: `/dashboard/${workspaceSlug}/events/${eventId}/planning`, icon: Wallet },
    { label: "Staff Members", href: `/dashboard/${workspaceSlug}/events/${eventId}/staff`, icon: UserCheck },
    { label: "Venue Details", href: `/dashboard/${workspaceSlug}/events/${eventId}/venue`, icon: MapPin },
    { label: "Merchandise", href: `/dashboard/${workspaceSlug}/events/${eventId}/merchandise`, icon: ShoppingBag },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link to={`/dashboard/${workspaceSlug}/events`} className="mb-6 flex items-center gap-2 px-2 text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>
      
      <div className="px-2 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Event Workspace</h2>
      </div>

      <nav className="space-y-1 text-sm flex-1">
        {nav.map((n) => {
          // Exact match for Overview, startsWith for others to allow sub-pages if they exist
          const isOverview = n.label === "Overview";
          const isActive = isOverview 
            ? location.pathname === n.href 
            : location.pathname.startsWith(n.href);
          
          const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${isActive ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary"}`;
          
          return (
            <Link key={n.label} to={n.href} className={cls}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
