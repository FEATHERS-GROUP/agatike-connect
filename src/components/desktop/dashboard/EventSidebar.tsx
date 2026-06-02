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

const steps = ["Details", "Tickets", "Venue", "Media", "Products", "VIP", "Publish"] as const;

export function EventSidebar() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  // Extract eventId from the pathname: /dashboard/kigali-arenas/events/123/...
  const pathParts = location.pathname.split("/");
  const eventId = pathParts[4] || "";
  const isCreateEvent = eventId === "create-event";

  // For create event, get current step from URL search params
  const currentStep = (location.search as any)?.step || 0;

  const nav = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceSlug}/events/${eventId}`,
      icon: LayoutDashboard,
    },
    {
      label: "Attendees",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/attendees`,
      icon: Users,
    },
    { label: "Parking", href: `/dashboard/${workspaceSlug}/events/${eventId}/parking`, icon: Car },
    {
      label: "Budget & Planning",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/planning`,
      icon: Wallet,
    },
    {
      label: "Staff Members",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/staff`,
      icon: UserCheck,
    },
    {
      label: "Venue Details",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/venue`,
      icon: MapPin,
    },
    {
      label: "Products & Add-ons",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/products&add-ons`,
      icon: ShoppingBag,
    },
    {
      label: "Experience",
      href: `/dashboard/${workspaceSlug}/events/${eventId}/experience`,
      icon: Sparkles,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        to="/dashboard/$workspaceSlug/events"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>

      {isCreateEvent ? (
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Create Event</h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1.5 text-xs text-accent-foreground font-medium border border-border/50">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Draft auto-saved
          </span>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Event Workspace
          </p>
        </div>
      )}

      <nav className="space-y-0.5 text-sm flex-1">
        {isCreateEvent
          ? steps.map((s, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <button
                  key={s}
                  onClick={() => navigate({ to: location.pathname, search: { step: i } })}
                  disabled={i > currentStep && !isCompleted}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : isCompleted
                        ? "text-foreground hover:bg-secondary/80"
                        : "text-muted-foreground opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="truncate">{s}</span>
                </button>
              );
            })
          : nav.map((n) => {
              const isOverview = n.label === "Overview";
              const isActive = isOverview
                ? location.pathname === n.href
                : location.pathname.startsWith(n.href);

              const cls = `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`;

              return (
                <Link key={n.label} to={n.href} className={cls}>
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{n.label}</span>
                </Link>
              );
            })}
      </nav>
    </aside>
  );
}
