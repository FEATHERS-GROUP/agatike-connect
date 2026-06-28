import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  MapPin,
  Users,
  CalendarDays,
  MoreHorizontal,
  Store,
  BarChart3,
  Clock,
  AlertCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getRentableVenues, updateRentableVenue } from "@/api/rentable_venues";
import { getWorkspaceVenueBookings } from "@/api/venue_bookings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venue-rent")({
  head: () => ({
    meta: [
      { title: "Venue Listings — Agatike" },
      { name: "description", content: "Manage your rentable venues and bookings." },
    ],
  }),
  component: VenueListingsPage,
});

function VenueListingsPage() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/venue-rent" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateRentableVenue({ data: { id, status } }),
    onSuccess: () => {
      toast.success("Venue status updated");
      queryClient.invalidateQueries({ queryKey: ["rentable_venues"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["workspace_venue_bookings", activeWorkspace?.id],
    queryFn: () => getWorkspaceVenueBookings({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const totalVenues = venues.length;
  const activeRentals = bookings.filter((b: any) => b.status === "Confirmed").length;
  const pendingRequests = bookings.filter((b: any) => b.status === "Pending").length;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Venue Listings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage the properties you rent out to organizers.
              </p>
            </div>
            <Button
              className="shrink-0 gap-2 rounded-full h-10 px-5 shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
              asChild
            >
              <Link to="/dashboard/$workspaceSlug/venues/create-venue" params={{ workspaceSlug }}>
                <Plus className="h-4 w-4" /> List New Venue
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVenues}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Listings
                </p>
              </div>
            </div>
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRentals}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Active Rentals
                </p>
              </div>
            </div>
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Pending Requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Your Properties</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            Loading venues...
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-2xl border border-dashed">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues listed</h3>
            <p className="text-muted-foreground mb-6">You haven't added any rentable venues yet.</p>
            <Button
              asChild
              style={{ background: "var(--gradient-primary)" }}
              className="shadow-[var(--shadow-glow)]"
            >
              <Link to="/dashboard/$workspaceSlug/venues/create-venue" params={{ workspaceSlug }}>
                List Your First Venue
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {venues.map((venue: any) => (
              <Link
                key={venue.id}
                to="/dashboard/$workspaceSlug/venues/$venueId/overview"
                params={{ workspaceSlug, venueId: venue.id }}
                className="group flex flex-col rounded-3xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Image side */}
                <div className="relative w-full aspect-[16/9] shrink-0">
                  <img
                    src={
                      venue.cover_url ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={venue.name}
                    className="w-full h-full object-cover bg-secondary"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <StatusBadge status={(venue.status as any) || "Active"} />
                  </div>
                </div>

                {/* Content side */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg leading-tight">{venue.name}</h3>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: venue.id, status: "Maintenance" });
                              }}
                            >
                              Disable (Maintenance)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: venue.id, status: "Active" });
                              }}
                            >
                              Set Active
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {venue.city}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {venue.capacity?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Management Details */}
                  <div className="mt-2 pt-4 border-t border-border/60 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        Requests
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">
                          {bookings.filter((b: any) => b.venue_id === venue.id).length}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {venue.rental_type}
                      </p>
                      <p
                        className="font-semibold text-foreground truncate max-w-[120px]"
                        title={venue.pricing_tiers?.[0]?.name}
                      >
                        {formatCurrency(
                          venue.pricing_tiers?.[0]?.amount || 0,
                          activeWorkspace?.currency || venue.currency || "RWF",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate({
                          to: "/dashboard/$workspaceSlug/venues/$venueId/settings",
                          params: { workspaceSlug, venueId: venue.id },
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 rounded-xl gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate({
                          to: "/dashboard/$workspaceSlug/venues/$venueId/bookings",
                          params: { workspaceSlug, venueId: venue.id },
                        });
                      }}
                    >
                      <CalendarDays className="h-4 w-4" /> Calendar
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "Active" | "Draft" | "Maintenance" }) {
  const styles = {
    Active: "bg-green-500/90 text-white",
    Draft: "bg-muted/90 text-muted-foreground",
    Maintenance: "bg-orange-500/90 text-white",
  };

  return (
    <span
      className={`${styles[status]} backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}
    >
      {status}
    </span>
  );
}
