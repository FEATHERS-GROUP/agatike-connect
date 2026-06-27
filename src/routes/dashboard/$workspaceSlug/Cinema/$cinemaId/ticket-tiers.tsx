import { createFileRoute } from "@tanstack/react-router";
import { Tag, Loader2, Unlink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import { unlinkTierFromCinema } from "@/api/cinema_ticket_tiers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/ticket-tiers")({
  component: CinemaTicketTiers,
});

function CinemaTicketTiers() {
  const { cinemaId } = Route.useParams();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const { data: cinema, isLoading } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } } as any),
    enabled: !!cinemaId,
  });

  const unlinkMutation = useMutation({
    mutationFn: (ticketTierId: string) =>
      unlinkTierFromCinema({ data: { cinema_id: cinemaId, ticket_tier_id: ticketTierId } }),
    onSuccess: (_, tierId) => {
      toast.success("Ticket tier unlinked from all schedules in this cinema.");
      queryClient.invalidateQueries({ queryKey: ["cinema", cinemaId] });
    },
    onError: () => {
      toast.error("Failed to unlink ticket tier.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-lg">Cinema not found.</p>
      </div>
    );
  }

  // Extract ticket tiers and map them to their movies
  const ticketTiersMap = new Map();
  (cinema.schedules || []).forEach((schedule: any) => {
    if (!schedule.movie || !schedule.ticket_tiers) return;
    schedule.ticket_tiers.forEach((tt: any) => {
      if (!tt.ticket_tier) return;
      const tierId = tt.ticket_tier.id;
      if (!ticketTiersMap.has(tierId)) {
        ticketTiersMap.set(tierId, {
          tier: tt.ticket_tier,
          movies: new Map(),
        });
      }
      ticketTiersMap.get(tierId).movies.set(schedule.movie.id, schedule.movie);
    });
  });

  const connectedTiers = Array.from(ticketTiersMap.values()).map((x: any) => ({
    ...x.tier,
    movies: Array.from(x.movies.values()),
  }));

  const handleUnlink = (tierId: string) => {
    if (
      confirm("This will remove this ticket tier from all schedules in this cinema. Are you sure?")
    ) {
      unlinkMutation.mutate(tierId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Connected Ticket Tiers</h2>
        <p className="text-muted-foreground">
          Ticket tiers currently active on this cinema's schedules.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
        {connectedTiers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Tag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No Ticket Tiers Linked</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Create a schedule and assign ticket tiers to see them appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connectedTiers.map((tier: any) => (
              <div
                key={tier.id}
                className="p-6 rounded-2xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-xl">{tier.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{tier.type} Tier</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg bg-background px-3 py-1.5 rounded-lg border border-border/40 text-primary">
                      {formatCurrency(
                        tier.price,
                        activeWorkspace?.currency || tier.currency || "RWF",
                      )}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      disabled={unlinkMutation.isPending}
                      onClick={() => handleUnlink(tier.id)}
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Unlink
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Linked Movies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tier.movies.map((m: any) => (
                      <span
                        key={m.id}
                        className="text-sm px-3 py-1.5 bg-background border border-border/60 rounded-full font-medium"
                      >
                        {m.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
