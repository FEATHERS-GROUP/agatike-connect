import { createFileRoute, useParams } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useRef, useEffect } from "react";
import { Save, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRentableVenueById, updateRentableVenue } from "@/api/rentable_venues";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/settings")({
  component: VenueSettingsPage,
});

function VenueSettingsPage() {
  const { venueId } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const [rentalType, setRentalType] = useState("Per Day");
  const [pricingTiers, setPricingTiers] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    if (venue?.rental_type) {
      setRentalType(venue.rental_type);
    }
    if (venue?.pricing_tiers) {
      setPricingTiers(venue.pricing_tiers);
    }
  }, [venue]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateRentableVenue({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      toast.success("Venue settings updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update venue settings");
    },
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Parse numeric fields safely
    const parseNum = (val: FormDataEntryValue | null) => {
      if (!val) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const updates = {
      id: venueId,
      name: formData.get("name")?.toString(),
      type: formData.get("type")?.toString(),
      city: formData.get("city")?.toString(),
      capacity: parseNum(formData.get("capacity")),
      rental_type: rentalType,
      pricing_tiers: pricingTiers,
      amenities:
        formData
          .get("amenities")
          ?.toString()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      status: formData.get("status")?.toString(),
    };

    updateMutation.mutate(updates);
  };

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading venue...</div>;
  if (!venue)
    return <div className="p-8 text-center text-red-500 font-semibold">Venue not found</div>;

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Venue Settings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Update your property's public listing information.
          </p>
        </div>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">General Information</h3>

            <div className="space-y-1.5">
              <Label>Venue Name</Label>
              <Input
                name="name"
                defaultValue={venue.name}
                className="h-10 rounded-xl bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  name="type"
                  defaultValue={venue.type}
                  className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Stadium">Stadium</option>
                  <option value="Arena">Arena</option>
                  <option value="Conference Room">Conference Room</option>
                  <option value="Wedding Garden">Wedding Garden</option>
                  <option value="Basketball Court">Basketball Court</option>
                  <option value="Football Pitch">Football Pitch</option>
                  <option value="Gaming Lounge">Gaming Lounge</option>
                  <option value="Park">Park</option>
                  <option value="Museum">Museum</option>
                  <option value="Playground">Playground</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>City / Location</Label>
                <Input
                  name="city"
                  defaultValue={venue.city}
                  className="h-10 rounded-xl bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Pricing & Capacity</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Maximum Capacity (Guests)</Label>
                <Input
                  name="capacity"
                  type="number"
                  defaultValue={venue.capacity}
                  className="h-10 rounded-xl bg-secondary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rental Type Allowed</Label>
                <select
                  value={rentalType}
                  onChange={(e) => setRentalType(e.target.value)}
                  className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Per Day">Per Day Only</option>
                  <option value="Per Hour">Per Hour Only</option>
                  <option value="Per Week">Per Week</option>
                  <option value="Annually">Annually</option>
                  <option value="Entrance Fee">Entrance Fee (Tickets)</option>
                  <option value="Multiple">Multiple Options</option>
                  <option value="Both">Both (Day & Hour)</option>
                </select>
              </div>

                <div className="space-y-3 sm:col-span-2 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Pricing Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPricingTiers([...pricingTiers, { name: "", amount: 0 }])}
                      className="h-8 rounded-full gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </Button>
                  </div>

                  {pricingTiers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-background/50 rounded-xl border border-dashed border-border">
                      No pricing options added. Click 'Add Option' to create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {pricingTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-1 space-y-1.5">
                            <Input
                              placeholder="Option Name (e.g. Per Day, Regular)"
                              value={tier.name}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers];
                                newTiers[idx].name = e.target.value;
                                setPricingTiers(newTiers);
                              }}
                              className="h-10 rounded-xl bg-background"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Input
                              type="number"
                              placeholder="Price"
                              value={tier.amount || ""}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers];
                                newTiers[idx].amount = Number(e.target.value);
                                setPricingTiers(newTiers);
                              }}
                              className="h-10 rounded-xl bg-background"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newTiers = pricingTiers.filter((_, i) => i !== idx);
                              setPricingTiers(newTiers);
                            }}
                            className="h-10 w-10 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Amenities</h3>
            <p className="text-sm text-muted-foreground">
              List the amenities included in the rental price.
            </p>
            <Input
              name="amenities"
              defaultValue={(venue.amenities || []).join(", ")}
              className="h-10 rounded-xl bg-secondary/50"
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Listing Status</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  defaultChecked={venue.status === "Active"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Active</p>
                  <p className="text-xs text-muted-foreground">Visible and bookable</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="Draft"
                  defaultChecked={venue.status === "Draft"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Draft</p>
                  <p className="text-xs text-muted-foreground">Hidden from public</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="Maintenance"
                  defaultChecked={venue.status === "Maintenance"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Maintenance</p>
                  <p className="text-xs text-muted-foreground">Temporarily unavailable</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Cover Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              {venue.cover_url ? (
                <img src={venue.cover_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/30">
                  <p className="text-sm">No cover photo</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full rounded-xl">
              Upload New Photo
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
