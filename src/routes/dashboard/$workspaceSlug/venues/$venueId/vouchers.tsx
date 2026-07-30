import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { SponsoredVouchersPanel } from "@/components/shared/SponsoredVouchersPanel";
import { getVenueSponsoredVoucherBatches } from "@/api/vouchers";
import { getRentableVenueById } from "@/api/rentable_venues";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/vouchers")({
  component: VenueVouchersPage,
});

function VenueVouchersPage() {
  const { venueId } = useParams({ strict: false }) as any;

  const { data: venue } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const entityTickets = (venue?.pricing_tiers || []).map((t: any) => ({
    id: t.id || t.name,
    name: t.name || t.label,
    cost: t.price || t.amount || 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sponsored Vouchers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage voucher campaigns for this venue. Pre-generate a batch or automatically
          issue one per booking.
        </p>
      </header>

      <SponsoredVouchersPanel
        entityId={venueId}
        entityType="venue"
        fetchBatches={() =>
          getVenueSponsoredVoucherBatches({ data: { venue_id: venueId } } as any)
        }
        queryKey={["venue-sponsored-voucher-batches", venueId]}
        entityTickets={entityTickets}
      />
    </div>
  );
}
