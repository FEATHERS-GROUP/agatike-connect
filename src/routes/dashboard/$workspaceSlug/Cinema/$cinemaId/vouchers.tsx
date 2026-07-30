import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { SponsoredVouchersPanel } from "@/components/shared/SponsoredVouchersPanel";
import { getCinemaSponsoredVoucherBatches } from "@/api/vouchers";
import { getCinemaTicketTiers } from "@/api/cinema_ticket_tiers";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/vouchers")({
  component: CinemaVouchersPage,
});

function CinemaVouchersPage() {
  const { cinemaId } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();

  const { data: ticketTiers = [] } = useQuery({
    queryKey: ["cinema_ticket_tiers", activeWorkspace?.id],
    queryFn: () => getCinemaTicketTiers({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const entityTickets = ticketTiers.map((t: any) => ({
    id: t.id,
    name: t.name,
    cost: t.price || 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sponsored Vouchers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage voucher campaigns for this cinema. Pre-generate a batch or automatically
          issue one per ticket purchase.
        </p>
      </header>

      <SponsoredVouchersPanel
        entityId={cinemaId}
        entityType="cinema"
        fetchBatches={() =>
          getCinemaSponsoredVoucherBatches({ data: { cinema_id: cinemaId } } as any)
        }
        queryKey={["cinema-sponsored-voucher-batches", cinemaId]}
        entityTickets={entityTickets}
      />
    </div>
  );
}
