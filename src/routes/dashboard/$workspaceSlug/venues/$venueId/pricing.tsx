import { createFileRoute, useParams } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRentableVenueById, updateRentableVenue } from "@/api/rentable_venues";
import { getActiveSubscription } from "@/api/billing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/pricing")({
  component: VenuePricingPage,
});

function VenuePricingPage() {
  const { venueId } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const { data: subscription } = useQuery({
    queryKey: ["active-subscription", activeWorkspace?.orgnizer_id],
    queryFn: () => getActiveSubscription({ data: { organizer_id: activeWorkspace!.orgnizer_id } } as any),
    enabled: !!activeWorkspace?.orgnizer_id,
  });

  const [rentalType, setRentalType] = useState("Per Day");
  const [entranceType, setEntranceType] = useState("free");
  const [pricingTiers, setPricingTiers] = useState<{ name: string; amount: string | number }[]>([]);

  useEffect(() => {
    if (venue) {
      if (venue.rental_type) setRentalType(venue.rental_type);
      if (venue.entrance_type) setEntranceType(venue.entrance_type);
      if (venue.pricing_tiers) setPricingTiers(venue.pricing_tiers);
    }
  }, [venue]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateRentableVenue({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      toast.success("Pricing updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update pricing");
    },
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const parseNum = (val: FormDataEntryValue | null) => {
      if (!val) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    const updates: any = {
      id: venueId,
      pricing_tiers: pricingTiers,
    };

    if (venue.rental_model === "ENTIRE_VENUE") {
      updates.rental_type = rentalType;
    } else {
      updates.entrance_type = entranceType;
      updates.entrance_fee = parseNum(formData.get("entrance_fee"));
      if (entranceType === "consumable") {
        updates.consumable_value = parseNum(formData.get("consumable_value"));
      }
    }

    updateMutation.mutate(updates);
  };

  const updatePricingTier = (idx: number, field: string, val: string) => {
    setPricingTiers(pricingTiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading pricing...</div>;
  if (!venue)
    return <div className="p-8 text-center text-red-500 font-semibold">Venue not found</div>;

  return (
    <form
      onSubmit={handleSave}
      className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your rental rates, entrance fees, and pricing tiers.
          </p>
        </div>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving..." : "Save Pricing"}
        </Button>
      </div>

      <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base">Workspace Currency</Label>
            <div className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 flex items-center text-base text-muted-foreground cursor-not-allowed">
              {activeWorkspace?.currency || "RWF"}
            </div>
          </div>
          {venue.rental_model === "ENTIRE_VENUE" && (
            <div className="space-y-2">
              <Label className="text-base">Rental Rate Type</Label>
              <select
                className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base"
                value={rentalType}
                onChange={(e) => setRentalType(e.target.value)}
              >
                <option value="Per Day">Per Day</option>
                <option value="Per Hour">Per Hour</option>
                <option value="Per Week">Per Week</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          )}
        </div>

        {venue.rental_model !== "ENTIRE_VENUE" && (
          <div className="space-y-4 pt-4 border-t border-border/60">
            <Label className="text-xl font-semibold">Entrance & Admission</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label className="text-base">Entrance Policy</Label>
                <select
                  className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base"
                  value={entranceType}
                  onChange={(e) => setEntranceType(e.target.value)}
                >
                  <option value="free">Free Entrance</option>
                  <option value="standard">Standard Paid Entrance</option>
                  <option value="consumable">Consumable Voucher (Credit)</option>
                </select>
              </div>
              {entranceType !== "free" && (
                <div className="space-y-2">
                  <Label className="text-base">
                    Entrance Fee ({activeWorkspace?.currency || "RWF"})
                  </Label>
                  <Input
                    name="entrance_fee"
                    type="number"
                    className="h-12 bg-background rounded-xl"
                    defaultValue={venue.entrance_fee}
                    placeholder="e.g. 5000"
                  />
                  {subscription?.pricing_plan && (
                    <p className="text-sm text-muted-foreground mt-2 bg-secondary/30 p-3 rounded-lg border border-border/50">
                      <strong>Note:</strong> Your plan includes an Organizer Collection Fee of{" "}
                      <strong>{subscription.pricing_plan.organizer_collection_fee_percentage}%</strong>. 
                      This, along with standard network provider fees, is deducted from ticket sales. Customers pay an additional{" "}
                      <strong>{subscription.pricing_plan.customer_collection_fee_percentage}%</strong> service fee at checkout.
                    </p>
                  )}
                </div>
              )}
            </div>

            {entranceType === "consumable" && (
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <Label className="text-base text-orange-600 dark:text-orange-400">
                  Voucher Value ({activeWorkspace?.currency || "RWF"})
                </Label>
                <Input
                  name="consumable_value"
                  type="number"
                  className="h-12 bg-background rounded-xl max-w-sm mt-2"
                  defaultValue={venue.consumable_value}
                  placeholder="e.g. 10000"
                />
              </div>
            )}
          </div>
        )}

        {(venue.rental_model === "ENTIRE_VENUE" || entranceType !== "free") && (
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div>
              <Label className="text-xl font-semibold">Additional Pricing Options</Label>
              <p className="text-sm text-muted-foreground mt-1">
                (Optional) Add different ticket tiers or rental packages.
              </p>
            </div>
            <div className="space-y-4">
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-start p-6 bg-secondary/20 rounded-2xl border border-border/60 relative"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base">Option Name</Label>
                      <Input
                        className="h-12 bg-background rounded-xl"
                        value={tier.name}
                        onChange={(e) => updatePricingTier(idx, "name", e.target.value)}
                        placeholder="e.g. VIP Access"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base">
                        Amount ({activeWorkspace?.currency || "RWF"})
                      </Label>
                      <Input
                        type="number"
                        className="h-12 bg-background rounded-xl"
                        value={tier.amount}
                        onChange={(e) => updatePricingTier(idx, "amount", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {pricingTiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 absolute top-4 right-4 hover:bg-red-500/10"
                      onClick={() => setPricingTiers(pricingTiers.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-dashed rounded-xl"
                onClick={() => setPricingTiers([...pricingTiers, { name: "", amount: "" }])}
              >
                <Plus className="h-5 w-5 mr-2" /> Add Pricing Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
