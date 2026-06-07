import { Link, useRouterState, useParams, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Users, Settings, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRentableVenueById } from "@/api/rentable_venues";
import { cn } from "@/lib/utils";

const steps = [
  "Venue Type",
  "Usage Category",
  "Basic Info",
  "Operating Hours",
  "Pricing",
  "Amenities & Rules",
  "Sections",
  "Images & Publish"
];

export function VenueSidebar() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const params = useParams({ strict: false });
  const workspaceSlug = params.workspaceSlug as string;

  // Extract venueId from the pathname: /dashboard/kigali-arenas/venues/123/...
  const pathParts = location.pathname.split("/");
  const venueId = pathParts[4] || "";
  const isCreateVenue = venueId === "create-venue";

  // For create venue, get current step from URL search params
  const currentStep = (location.search as any)?.step || 0;

  // We cannot easily access formData.rental_model here since it's local state in create-venue.tsx
  // But we can let them click the steps anyway, or disable clicking future steps
  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId && !isCreateVenue,
  });

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

      {isCreateVenue ? (
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Create Venue</h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1.5 text-xs text-accent-foreground font-medium border border-border/50">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Setup in progress
          </span>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-lg bg-secondary shrink-0">
            {(venue?.cover_url || venue?.images?.[0]) && (
              <img src={venue.cover_url || venue.images?.[0]} alt={venue.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{venue?.name}</p>
            <p className="text-xs text-muted-foreground">{venue?.type}</p>
          </div>
        </div>
      )}

      {!isCreateVenue && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Venue Workspace
        </p>
      )}

      <nav className="space-y-0.5 text-sm flex-1">
        {isCreateVenue ? (
          steps.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <button
                key={s}
                onClick={() => navigate({ to: location.pathname, search: { step: i } })}
                disabled={i > currentStep && !isCompleted}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isCurrent
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : isCompleted
                      ? "text-foreground hover:bg-secondary/80"
                      : "text-muted-foreground opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground border border-border"
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="truncate">{s}</span>
              </button>
            );
          })
        ) : (
          nav.map((n) => {
            const isActive = location.pathname.includes(n.href);
            return (
              <Link
                key={n.label}
                to={n.href}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
