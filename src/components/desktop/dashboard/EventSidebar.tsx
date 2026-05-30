import { Link, useRouterState, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Car,
  Wallet,
  UserCheck,
  MapPin,
  ShoppingBag,
  Sparkles,
  Check,
} from "lucide-react";

const steps = ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP", "Publish"] as const;

export function EventSidebar() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;
  
  // Extract eventId from the pathname: /dashboard/kigali-arenas/events/123/...
  const pathParts = location.pathname.split('/');
  const eventId = pathParts[4] || "";
  const isCreateEvent = eventId === "create-event";

  // For create event, get current step from URL search params
  const currentStep = (location.search as any)?.step || 0;

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
      <Link to="/dashboard/$workspaceSlug/events" params={{ workspaceSlug: workspaceSlug || "" }} className="mb-6 flex items-center gap-2 px-2 text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>
      
        {isCreateEvent ? (
          <div className="px-2 mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1.5 text-xs text-accent-foreground font-medium border border-border/50">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Draft auto-saved
            </span>
          </div>
        ) : (
          <div className="px-2 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Event Workspace</h2>
          </div>
        )}

      <nav className={isCreateEvent ? "space-y-1.5 flex-1 px-2" : "space-y-1 text-sm flex-1"}>
        {isCreateEvent ? (
          steps.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <button
                key={s}
                onClick={() => navigate({ to: location.pathname, search: { step: i } })}
                disabled={i > currentStep && !isCompleted}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isCurrent 
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                    : isCompleted 
                      ? "text-foreground hover:bg-secondary/80" 
                      : "text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                  isCurrent ? "bg-primary text-primary-foreground shadow-sm" : 
                  isCompleted ? "bg-foreground text-background" : 
                  "bg-secondary text-muted-foreground border border-border"
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : (i + 1)}
                </div>
                {s}
              </button>
            )
          })
        ) : (
          nav.map((n) => {
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
          })
        )}
      </nav>
    </aside>
  );
}
