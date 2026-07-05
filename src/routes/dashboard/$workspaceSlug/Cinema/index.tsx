import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getCinemas, deleteCinema } from "@/api/cinemas";
import { Plus, MapPin, Film, MoreVertical, Building2, Loader2, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/")({
  component: CinemaDashboardList,
});

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  inactive: "bg-secondary text-muted-foreground border-border/60",
  coming_soon: "bg-blue-500/15 text-blue-600 border-blue-500/30",
};

function CinemaDashboardList() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { canCreateCinema } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const { data: cinemas = [], isLoading } = useQuery({
    queryKey: ["cinemas", activeWorkspace?.id],
    queryFn: () => getCinemas({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCinema({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success(`${name} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const goCreate = () => {
    if (!canCreateCinema()) {
      toast.error(
        "You have reached the maximum number of cinemas allowed on your plan. Please upgrade to create more.",
      );
      return;
    }
    navigate({ to: "/dashboard/$workspaceSlug/Cinema/create", params: { workspaceSlug } });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Cinemas & Theaters
            </h1>
            <p className="text-muted-foreground">
              Manage your cinema venues, schedules, and premieres.
            </p>
          </div>
          <Button
            onClick={goCreate}
            disabled={!canCreateCinema()}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)] disabled:opacity-70"
            style={{ background: "var(--gradient-primary)" }}
          >
            {canCreateCinema() ? <Plus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            Add New Cinema
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && cinemas.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Cinemas Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first cinema or theater to start scheduling movies and selling tickets.
            </p>
            <Button
              onClick={goCreate}
              disabled={!canCreateCinema()}
              className="gap-2 rounded-xl h-11 px-6 font-bold disabled:opacity-70"
            >
              {canCreateCinema() ? <Plus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              Create First Cinema
            </Button>
          </div>
        )}

        {/* Cinema Cards Grid */}
        {!isLoading && cinemas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemas.map((cinema: any) => (
              <div
                key={cinema.id}
                className="group flex flex-col bg-card/40 hover:bg-card border border-border/40 hover:border-border/80 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {/* Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                  {cinema.cover_url ? (
                    <img
                      src={cinema.cover_url}
                      alt={cinema.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Building2 className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[cinema.status] || STATUS_COLORS.active}`}
                    >
                      {cinema.status === "coming_soon"
                        ? "Coming Soon"
                        : cinema.status.charAt(0).toUpperCase() + cinema.status.slice(1)}
                    </span>
                  </div>

                  {/* Context menu */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive gap-2"
                          onClick={() => handleDelete(cinema.id, cinema.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Cinema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{cinema.name}</h3>
                    {cinema.city && (
                      <div className="flex items-center gap-1 text-sm font-medium text-white/80">
                        <MapPin className="h-3.5 w-3.5" /> {cinema.city}
                        {cinema.country && `, ${cinema.country}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" />
                      {cinema.screens_aggregate?.aggregate?.count ?? 0} Screens
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" />
                      {cinema.movies_aggregate?.aggregate?.count ?? 0} Movies Active
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-2"
                  >
                    <Link
                      to="/dashboard/$workspaceSlug/Cinema/$cinemaId/overview"
                      params={{ workspaceSlug, cinemaId: cinema.id }}
                    >
                      Manage Cinema
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
