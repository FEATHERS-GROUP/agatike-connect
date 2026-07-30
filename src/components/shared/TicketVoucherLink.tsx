import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSponsoredVoucherBatches } from "@/api/experiences";
import { setTicketLinkedBatch } from "@/api/vouchers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function TicketVoucherLink({ ticketId, workspaceId }: { ticketId: string; workspaceId: string }) {
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ["workspace-voucher-batches", workspaceId],
    queryFn: async () => {
      const { hasuraRequest } = await import("@/api/graphql.server");
      const data = await hasuraRequest<{ sponsored_voucher_batches: any[] }>(`
        query GetBatches($ws: uuid!) {
          sponsored_voucher_batches(where: { workspace_id: { _eq: $ws }, generation_type: { _eq: "ticket_linked" }, is_active: { _eq: true } }) {
            id
            name
            linked_ticket_ids
          }
        }
      `, { ws: workspaceId });
      return data?.sponsored_voucher_batches || [];
    },
    enabled: !!workspaceId,
  });

  const mutation = useMutation({
    mutationFn: async (batchId: string) => {
      return await setTicketLinkedBatch({ data: { ticket_id: ticketId, batch_id: batchId, workspace_id: workspaceId } } as any);
    },
    onSuccess: () => {
      toast.success("Linked voucher batch updated");
      queryClient.invalidateQueries({ queryKey: ["workspace-voucher-batches"] });
    },
    onError: () => toast.error("Failed to update linked voucher batch"),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline" /> Loading batches...</div>;
  if (!batches || batches.length === 0) return null;

  const currentBatch = batches.find((b) => {
    const linked = Array.isArray(b.linked_ticket_ids) ? b.linked_ticket_ids : [];
    return linked.includes(ticketId);
  });

  return (
    <div className="space-y-2 col-span-full mt-2">
      <Label className="flex items-center gap-2">
        Link to Sponsored Voucher Batch
        {mutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      </Label>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={currentBatch?.id || ""}
        disabled={mutation.isPending}
        onChange={(e) => mutation.mutate(e.target.value)}
      >
        <option value="">None</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">When customers buy this ticket, they will automatically receive a voucher from the selected batch.</p>
    </div>
  );
}
