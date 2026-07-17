import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  MapPin,
  Building2,
  CalendarDays,
  MoreHorizontal,
  CreditCard,
  AlertCircle,
  Clock,
  Star,
  Users,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getSpaces } from "@/api/spaces";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/")({
  head: () => ({
    meta: [
      { title: "Spaces — Agatike" },
      { name: "description", content: "Manage your coworking spaces, gyms, and studios." },
    ],
  }),
  component: SpacesListingsPage,
});

function SpacesListingsPage() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/spaces/" });
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { canCreateSpace } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const handleCreate = () => {
    if (!canCreateSpace()) {
      toast.error(
        "You have reached the maximum number of spaces allowed on your plan. Please upgrade to create more.",
      );
      return;
    }
    navigate({
      to: "/dashboard/$workspaceSlug/spaces/create-space",
      params: { workspaceSlug: workspaceSlug as string },
    });
  };

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["spaces", activeWorkspace?.id],
    queryFn: () => getSpaces({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const totalSpaces = spaces.length;
  // Calculate total plans across all spaces
  const activePlans = spaces.reduce(
    (acc: number, space: any) => acc + (space.plans?.length || 0),
    0,
  );
  // Calculate total locations across all spaces
  const totalLocations = spaces.reduce(
    (acc: number, space: any) => acc + (space.locations?.length || 0),
    0,
  );

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Dashboard Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your gyms, co-working spaces, offices, and studios.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!canCreateSpace()}
            className="shrink-0 gap-2 rounded-full h-10 px-5 shadow-[var(--shadow-glow)] disabled:opacity-70"
            style={{ background: "var(--gradient-primary)" }}
          >
            {canCreateSpace() ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            Create Space
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="group bg-background/60 backdrop-blur-xl rounded-3xl border border-border/40 p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{totalSpaces}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                Total Spaces
              </p>
            </div>
          </div>
          <div className="group bg-background/60 backdrop-blur-xl rounded-3xl border border-border/40 p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{totalLocations}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                Locations
              </p>
            </div>
          </div>
          <div className="group bg-background/60 backdrop-blur-xl rounded-3xl border border-border/40 p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-orange-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{activePlans}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                Active Plans
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Your Spaces</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            Loading spaces...
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-secondary/10 backdrop-blur-sm rounded-3xl border-2 border-dashed border-border/60 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-background rounded-full shadow-lg border border-border/50 flex items-center justify-center mb-6">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">No spaces yet</h3>
              <p className="text-muted-foreground max-w-sm mb-8 text-sm md:text-base">
                Create your first coworking space, gym, or studio to start managing locations, plans, and members.
              </p>
              <Button
                onClick={handleCreate}
                disabled={!canCreateSpace()}
                style={{ background: "var(--gradient-primary)" }}
                className="rounded-full h-12 px-8 text-base shadow-[var(--shadow-glow)] gap-2 disabled:opacity-70 hover:scale-105 transition-transform duration-300"
              >
                {canCreateSpace() ? <Plus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                Create Your First Space
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {spaces.map((space: any) => (
              <Link
                key={space.id}
                to={`/dashboard/${workspaceSlug}/spaces/${space.id}`}
                className="group flex flex-col rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Image side */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-secondary">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <img
                    src={
                      space.cover_url ||
                      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <StatusBadge status={(space.status as any) || "Active"} />
                    <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {space.type}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="font-bold text-2xl text-white leading-tight drop-shadow-md truncate">
                      {space.name}
                    </h3>
                  </div>
                </div>

                {/* Content side */}
                <div className="p-5 flex flex-col flex-1 bg-background">
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-6">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl text-primary">
                      <MapPin className="h-4 w-4" />
                      <span className="font-bold">{space.locations?.length || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold">Locs</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-xl text-orange-500">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-bold">{space.plans?.length || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold">Plans</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl h-11 font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full rounded-2xl h-11 font-semibold gap-2 bg-secondary/60 hover:bg-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Users className="h-4 w-4" /> Members
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
      className={`${styles[status as keyof typeof styles] || styles.Draft} backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}
    >
      {status}
    </span>
  );
}
