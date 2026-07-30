import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, CreditCard, Ticket, Wand2, Link as LinkIcon, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  batchGenerateSponsoredVouchers,
  getWorkspaceSponsoredVoucherBatches,
  linkSponsoredVoucherBatch,
} from "@/api/vouchers";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface SponsoredVouchersPanelProps {
  entityId: string;
  entityType: "venue" | "cinema" | "experience";
  entityTickets?: { id: string; type?: string; name?: string; cost?: number }[];
  fetchBatches: () => Promise<any[]>;
  queryKey: string[];
}

export function SponsoredVouchersPanel({
  entityId,
  entityType,
  entityTickets = [],
  fetchBatches,
  queryKey,
}: SponsoredVouchersPanelProps) {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const { canCreateVoucher } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    batch_name: "",
    value_per_person: "",
    quantity: "",
    generation_type: "manual",
    linked_ticket_ids: [] as string[],
    value_type: "fixed",
    existing_batch_id: "",
  });

  const { data: batches = [], isLoading } = useQuery({
    queryKey,
    queryFn: fetchBatches,
    enabled: !!entityId,
  });

  const { data: workspaceBatches = [] } = useQuery({
    queryKey: ["workspace-sponsored-voucher-batches", activeWorkspace?.id],
    queryFn: async () =>
      getWorkspaceSponsoredVoucherBatches({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const unlinkedBatches = workspaceBatches.filter(
    (b: any) => !b.event_id && !b.rentable_venue_id && !b.cinema_id,
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (formData.generation_type === "link_existing") {
        return await linkSponsoredVoucherBatch({
          data: {
            batch_id: formData.existing_batch_id,
            event_id: entityType === "experience" ? entityId : null,
            rentable_venue_id: entityType === "venue" ? entityId : null,
            cinema_id: entityType === "cinema" ? entityId : null,
            linked_ticket_ids: formData.linked_ticket_ids,
          },
        } as any);
      }
      return await batchGenerateSponsoredVouchers({
        data: {
          event_id: entityType === "experience" ? entityId : null,
          rentable_venue_id: entityType === "venue" ? entityId : null,
          cinema_id: entityType === "cinema" ? entityId : null,
          workspace_id: activeWorkspace?.id,
          batch_name: formData.batch_name,
          value_per_person: Number(formData.value_per_person),
          quantity: formData.generation_type === "manual" ? Number(formData.quantity) : 0,
          generation_type: formData.generation_type === "on_purchase" ? "on_purchase" : formData.generation_type,
          linked_ticket_ids:
            formData.generation_type === "ticket_linked" ? formData.linked_ticket_ids : [],
          value_type: formData.generation_type === "ticket_linked" ? formData.value_type : "fixed",
        },
      } as any);
    },
    onSuccess: () => {
      toast.success(formData.generation_type === "link_existing" ? "Campaign linked!" : "Campaign created!");
      setOpen(false);
      setFormData({ batch_name: "", value_per_person: "", quantity: "", generation_type: "manual", linked_ticket_ids: [], value_type: "fixed", existing_batch_id: "" });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["workspace-sponsored-voucher-batches", activeWorkspace?.id] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save campaign"),
  });

  const totalVouchers = batches.reduce((sum: number, b: any) => sum + (b.vouchers?.length || 0), 0);
  const totalProvisioned = batches.reduce(
    (sum: number, b: any) =>
      sum + (b.vouchers || []).reduce((s: number, v: any) => s + Number(v.current_balance || 0), 0),
    0,
  );
  const entityLabel = entityType === "experience" ? "experience" : entityType === "venue" ? "venue" : "cinema";

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Sponsored Vouchers
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voucher campaigns linked to this {entityLabel}.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full"
              style={{ background: "var(--gradient-primary)" }}
              onClick={(e) => {
                if (!canCreateVoucher(totalVouchers)) {
                  e.preventDefault();
                  toast.error("Voucher Limit Reached");
                }
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Voucher Campaign</DialogTitle>
              <DialogDescription>Create a standalone batch or attach to ticket purchases.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-2">

              {/* Mode selector cards */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, generation_type: "manual" })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.generation_type === "manual" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className={`h-5 w-5 shrink-0 ${formData.generation_type === "manual" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold text-sm">Pre-generate Batch</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Create a set number of vouchers upfront — e.g. 200 vouchers worth 5,000 RWF each.</p>
                    </div>
                  </div>
                </button>

                {entityTickets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, generation_type: "ticket_linked" })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.generation_type === "ticket_linked" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className={`h-5 w-5 shrink-0 ${formData.generation_type === "ticket_linked" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-semibold text-sm">Per Ticket / Booking Tier</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Automatically generate one voucher for each customer who buys the selected ticket type. No quantity needed.</p>
                      </div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, generation_type: "on_purchase" })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.generation_type === "on_purchase" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className={`h-5 w-5 shrink-0 ${formData.generation_type === "on_purchase" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold text-sm">Create One On Every Purchase</p>
                      <p className="text-xs text-muted-foreground mt-0.5">One voucher is created automatically for every single booking at this {entityLabel} — no tier selection needed.</p>
                    </div>
                  </div>
                </button>

                {unlinkedBatches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, generation_type: "link_existing" })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.generation_type === "link_existing" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className={`h-5 w-5 shrink-0 ${formData.generation_type === "link_existing" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-semibold text-sm">Link Existing Batch</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Attach a batch you already created from the Products & Add-ons page.</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Link existing batch selector */}
              {formData.generation_type === "link_existing" && (
                <div className="space-y-2">
                  <Label>Select Batch</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" required value={formData.existing_batch_id} onChange={(e) => setFormData({ ...formData, existing_batch_id: e.target.value })}>
                    <option value="">Select a batch</option>
                    {unlinkedBatches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.value_per_voucher} RWF/voucher)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campaign name (not needed for link_existing) */}
              {formData.generation_type !== "link_existing" && (
                <div className="space-y-2">
                  <Label>Campaign Name <span className="text-red-500">*</span></Label>
                  <Input required value={formData.batch_name} onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })} placeholder="e.g. Welcome Drinks, Free Popcorn..." />
                </div>
              )}

              {/* Ticket selector for ticket_linked and link_existing */}
              {(formData.generation_type === "ticket_linked" || formData.generation_type === "link_existing") && entityTickets.length > 0 && (
                <div className="space-y-2">
                  <Label>Trigger on these ticket / booking types <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-muted-foreground -mt-1">A voucher will be sent automatically when any of these are purchased.</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto p-3 border rounded-xl bg-secondary/5">
                    {entityTickets.map((t) => (
                      <div key={t.id} className="flex items-center space-x-2">
                        <Checkbox id={`svp-ticket-${t.id}`} checked={formData.linked_ticket_ids.includes(t.id)} onCheckedChange={(checked) => {
                          if (checked) setFormData({ ...formData, linked_ticket_ids: [...formData.linked_ticket_ids, t.id] });
                          else setFormData({ ...formData, linked_ticket_ids: formData.linked_ticket_ids.filter((id) => id !== t.id) });
                        }} />
                        <label htmlFor={`svp-ticket-${t.id}`} className="text-sm font-medium cursor-pointer">{t.name || t.type} — {t.cost?.toLocaleString()} RWF</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voucher value type (ticket_linked only) */}
              {formData.generation_type === "ticket_linked" && (
                <div className="space-y-2">
                  <Label>Voucher Value Type</Label>
                  <Select value={formData.value_type} onValueChange={(val) => setFormData({ ...formData, value_type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match_ticket_price">Match Ticket / Booking Price</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Value per voucher */}
              {(formData.generation_type === "manual" || formData.generation_type === "on_purchase" || (formData.generation_type === "ticket_linked" && formData.value_type === "fixed")) && (
                <div className="space-y-2">
                  <Label>Value per Voucher (RWF) <span className="text-red-500">*</span></Label>
                  <Input required type="number" min="1" value={formData.value_per_person} onChange={(e) => setFormData({ ...formData, value_per_person: e.target.value })} placeholder="e.g. 5000" />
                </div>
              )}

              {/* Quantity — only for manual pre-generation */}
              {formData.generation_type === "manual" && (
                <div className="space-y-2">
                  <Label>Number of Vouchers to Generate <span className="text-red-500">*</span></Label>
                  <Input required type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="e.g. 200" />
                  <p className="text-xs text-muted-foreground">This many individual vouchers will be created immediately.</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} style={{ background: "var(--gradient-primary)" }}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formData.generation_type === "link_existing" ? "Link Batch" : "Create Campaign"}
                </Button>
              </div>
            </form>

          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary/30 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Campaigns</p>
          <p className="text-2xl font-bold mt-1">{batches.length}</p>
        </div>
        <div className="bg-secondary/30 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Value</p>
          <p className="text-2xl font-bold mt-1 text-primary">{totalProvisioned.toLocaleString()} RWF</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : batches.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground text-sm">No voucher campaigns linked yet.</div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch: any) => {
            const spent = (batch.vouchers || []).reduce((s: number, v: any) => s + Number(v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0), 0);
            const remaining = (batch.vouchers || []).reduce((s: number, v: any) => s + Number(v.current_balance || 0), 0);
            const total = spent + remaining;
            const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
            return (
              <div key={batch.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{batch.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider">{batch.generation_type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{remaining.toLocaleString()} RWF</p>
                    <p className="text-xs text-muted-foreground">remaining</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{batch.vouchers?.length || 0} vouchers · {pct}% spent</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
