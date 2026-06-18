import { createFileRoute, Link, useParams } from "@tanstack/react-router";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getSpaces } from "@/api/spaces";

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
  const { activeWorkspace } = useWorkspace();

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
            className="shrink-0 gap-2 rounded-full h-10 px-5 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            asChild
          >
            <Link to={`/dashboard/${workspaceSlug}/spaces/create-space`}>
              <Plus className="h-4 w-4" /> Create Space
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSpaces}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Total Spaces
              </p>
            </div>
          </div>
          <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLocations}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Locations
              </p>
            </div>
          </div>
          <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activePlans}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
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
          <div className="flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-2xl border border-dashed">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No spaces yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first space to start managing plans and members.
            </p>
            <Button
              asChild
              style={{ background: "var(--gradient-primary)" }}
              className="shadow-[var(--shadow-glow)]"
            >
              <Link to={`/dashboard/${workspaceSlug}/spaces/create-space`}>
                Create Your First Space
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spaces.map((space: any) => (
              <Link
                key={space.id}
                to={`/dashboard/${workspaceSlug}/spaces/${space.id}`}
                className="group flex flex-col sm:flex-row rounded-3xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Image side */}
                <div className="relative w-full sm:w-48 shrink-0 aspect-[4/3] sm:aspect-auto">
                  <img
                    src={
                      space.cover_url ||
                      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={space.name}
                    className="w-full h-full object-cover bg-secondary"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <StatusBadge status={(space.status as any) || "Active"} />
                    <span className="bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {space.type}
                    </span>
                  </div>
                </div>

                {/* Content side */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg leading-tight">{space.name}</h3>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {space.locations?.length || 0} Locations
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        {space.plans?.length || 0} Plans
                      </span>
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
                      }}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 rounded-xl gap-2"
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
