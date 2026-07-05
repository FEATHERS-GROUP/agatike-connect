import { Link, useRouterState, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Bus,
  Wallet,
  UserCheck,
  MapPin,
  ShoppingBag,
  Sparkles,
  Check,
  Ticket,
} from "lucide-react";

const steps = ["Details", "Vehicles", "Routes", "Tickets", "Media", "Publish"] as const;

export function TransportSidebar() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  // Extract tripId from the pathname: /dashboard/station/trips/123/...
  const pathParts = location.pathname.split("/");
  const tripId = pathParts[4] || "";
  const isCreateTrip = tripId === "create-trip";

  const currentStep = (location.search as any)?.step || 0;

  const nav = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}`,
      icon: LayoutDashboard,
    },
    {
      label: "Passengers",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/passengers`,
      icon: Users,
    },
    {
      label: "Vehicle Details",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/vehicle`,
      icon: Bus,
    },
    {
      label: "Routes & Stops",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/route`,
      icon: MapPin,
    },
    {
      label: "Tickets & Pricing",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/tickets`,
      icon: Ticket,
    },
    {
      label: "Drivers & Staff",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/staff`,
      icon: UserCheck,
    },
    {
      label: "Luggage & Add-ons",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/products&add-ons`,
      icon: ShoppingBag,
    },
    {
      label: "Budget & Revenue",
      href: `/dashboard/${workspaceSlug}/trips/${tripId}/revenue`,
      icon: Wallet,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex flex-col">
      <Link
        // @ts-expect-error: Route not yet created
        to="/dashboard/$workspaceSlug/trips"
        params={{ workspaceSlug: workspaceSlug || "" }}
        className="mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Trips</span>
      </Link>

      {isCreateTrip ? (
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Schedule Trip</h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1.5 text-xs text-accent-foreground font-medium border border-border/50">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Draft auto-saved
          </span>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Transport Workspace
          </p>
        </div>
      )}

      <nav className="space-y-0.5 text-sm flex-1">
        {isCreateTrip
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
                  <span className="truncate flex-1">{n.label}</span>
                </Link>
              );
            })}
      </nav>
    </aside>
  );
}
