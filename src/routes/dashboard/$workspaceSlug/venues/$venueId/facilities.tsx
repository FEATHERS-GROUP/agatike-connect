import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, X, UploadCloud, Loader2, CalendarDays, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRentableVenueById, updateRentableVenue } from "@/api/rentable_venues";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { uploadFileToStorage } from "@/lib/firebase-storage";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/facilities")({
  component: VenueFacilitiesPage,
});

function VenueFacilitiesPage() {
  const { venueId, workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const [facilities, setFacilities] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (venue?.facilities_data) {
      setFacilities(venue.facilities_data);
    }
  }, [venue]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateRentableVenue({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      toast.success("Sub-Venues updated successfully!");
      setIsSheetOpen(false);
      setEditingIndex(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update sub-venues");
    },
  });

  const saveAll = (newFacilities: any[]) => {
    updateMutation.mutate({
      id: venueId,
      facilities_data: newFacilities,
    });
  };

  const openAddFacility = () => {
    const newFac = {
      id: `fac-${Date.now()}`,
      name: "New Space or Activity",
      category: "space",
      type: "exclusive_slot",
      pricing: { hourly_rate: "", daily_rate: "", per_session_rate: "" },
      duration_minutes: "60",
      max_capacity: "",
      requires_approval: false,
      is_under_maintenance: false,
      image_url: "",
    };
    const newFacilities = [...facilities, newFac];
    setFacilities(newFacilities);
    setEditingIndex(newFacilities.length - 1);
    setIsSheetOpen(true);
  };

  const openEditFacility = (idx: number) => {
    setEditingIndex(idx);
    setIsSheetOpen(true);
  };

  const removeFacility = (idx: number) => {
    const newFacilities = facilities.filter((_, i) => i !== idx);
    setFacilities(newFacilities);
    saveAll(newFacilities);
  };

  const updateActiveFacility = (field: string, val: any) => {
    if (editingIndex === null) return;
    setFacilities(facilities.map((f, i) => (i === editingIndex ? { ...f, [field]: val } : f)));
  };

  const updateActiveFacilityPricing = (field: string, val: any) => {
    if (editingIndex === null) return;
    setFacilities(
      facilities.map((f, i) =>
        i === editingIndex ? { ...f, pricing: { ...(f.pricing || {}), [field]: val } } : f,
      ),
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File exceeds 5MB limit");

    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, "venues");
      updateActiveFacility("image_url", url);
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSheetClose = () => {
    // If they close without saving, we could revert, but since it's local state, it's fine.
    // Real save happens when they click "Save Changes" inside the sheet.
    setIsSheetOpen(false);
    setEditingIndex(null);
  };

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading sub-venues...</div>;
  if (!venue)
    return <div className="p-8 text-center text-red-500 font-semibold">Venue not found</div>;

  const activeFacility = editingIndex !== null ? facilities[editingIndex] : null;

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spaces & Activities</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your distinct bookable spaces (e.g. Pitches, VIP Rooms) and activities (e.g.
            Zipline, Paintball).
          </p>
        </div>
        <Button
          onClick={openAddFacility}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add Space/Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility, idx) => (
          <div
            key={facility.id || idx}
            className="flex flex-col bg-card shadow-sm rounded-3xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 relative group"
          >
            {facility.is_under_maintenance && (
              <div className="absolute top-3 left-3 z-20 bg-red-500/90 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg">
                Maintenance
              </div>
            )}
            <div className="absolute top-3 right-3 z-20 flex gap-2">
              <span className="bg-background/90 backdrop-blur-md text-foreground text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-border/50">
                {facility.category || "Space"}
              </span>
            </div>

            <div className="h-48 w-full bg-secondary/30 relative overflow-hidden">
              {facility.image_url ? (
                <img
                  src={facility.image_url}
                  alt={facility.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-secondary/50 to-secondary/10">
                  <span className="text-sm font-medium">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-20">
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-11 right-5 h-12 w-12 rounded-full shadow-lg border border-border/50 bg-background hover:bg-secondary text-primary transition-transform hover:scale-110"
                onClick={() => openEditFacility(idx)}
              >
                <Edit2 className="h-5 w-5" />
              </Button>

              <div className="mb-4 pr-12">
                <h3 className="font-bold text-xl leading-tight text-foreground mb-1">
                  {facility.name || "Unnamed"}
                </h3>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {facility.type === "exclusive_slot"
                    ? "Exclusive Slot"
                    : facility.type === "shared_slot"
                      ? "Shared Session"
                      : "Shared Access"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 bg-secondary/20 p-3 rounded-2xl border border-border/40">
                {facility.pricing?.per_session_rate && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">
                      Session
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {activeWorkspace?.currency || "RWF"} {facility.pricing.per_session_rate}
                    </span>
                  </div>
                )}
                {facility.pricing?.hourly_rate && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">
                      Hourly
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {activeWorkspace?.currency || "RWF"} {facility.pricing.hourly_rate}
                    </span>
                  </div>
                )}
                {facility.pricing?.daily_rate && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">
                      Daily
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {activeWorkspace?.currency || "RWF"} {facility.pricing.daily_rate}
                    </span>
                  </div>
                )}
                {(facility.type === "shared_access" || facility.type === "shared_slot") &&
                  facility.max_capacity && (
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">
                        Capacity
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {facility.max_capacity}
                      </span>
                    </div>
                  )}
              </div>

              <div className="mt-auto flex gap-3 pt-4 border-t border-border/40">
                <Link
                  to="/dashboard/$workspaceSlug/venues/$venueId/facilities/$facilityId/bookings"
                  params={{ workspaceSlug, venueId, facilityId: facility.id }}
                  className="flex-1"
                >
                  <Button
                    variant="default"
                    className="w-full gap-2 rounded-xl shadow-md transition-transform hover:translate-y-[-2px]"
                  >
                    <CalendarDays className="h-4 w-4" /> Bookings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-xl px-4 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 hover:border-red-500 transition-all shadow-sm"
                  onClick={() => removeFacility(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent className="w-[400px] sm:w-[900px] sm:max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingIndex !== null ? "Edit Space/Activity" : "Add Space/Activity"}
            </SheetTitle>
          </SheetHeader>

          {activeFacility && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Facility Name</Label>
                  <Input
                    className="h-12 bg-secondary/30 rounded-xl"
                    value={activeFacility.name}
                    onChange={(e) => updateActiveFacility("name", e.target.value)}
                    placeholder="e.g. Football Pitch A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Category</Label>
                    <select
                      className="w-full h-12 rounded-xl bg-secondary/30 border border-input px-4 text-base"
                      value={activeFacility.category || "space"}
                      onChange={(e) => updateActiveFacility("category", e.target.value)}
                    >
                      <option value="space">Space (e.g. Pitch, Room)</option>
                      <option value="activity">Activity (e.g. Zipline, Game)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Booking Type</Label>
                    <select
                      className="w-full h-12 rounded-xl bg-secondary/30 border border-input px-4 text-base"
                      value={activeFacility.type}
                      onChange={(e) => updateActiveFacility("type", e.target.value)}
                    >
                      <option value="exclusive_slot">Exclusive Slot (Only 1 group per time)</option>
                      <option value="shared_slot">
                        Shared Session (Multiple groups per time slot up to capacity)
                      </option>
                      <option value="shared_access">
                        Shared Access (Passes per day up to capacity)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="font-semibold text-lg">Pricing & Capacity</h4>
                <div className="grid grid-cols-2 gap-4">
                  {activeFacility.category === "activity" ? (
                    <div className="space-y-2">
                      <Label className="text-base">Per Session Rate</Label>
                      <Input
                        type="number"
                        className="h-12 bg-secondary/30 rounded-xl"
                        value={activeFacility.pricing?.per_session_rate || ""}
                        onChange={(e) =>
                          updateActiveFacilityPricing("per_session_rate", e.target.value)
                        }
                        placeholder="e.g. 5000"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-base">Hourly Rate</Label>
                      <Input
                        type="number"
                        className="h-12 bg-secondary/30 rounded-xl"
                        value={activeFacility.pricing?.hourly_rate || ""}
                        onChange={(e) => updateActiveFacilityPricing("hourly_rate", e.target.value)}
                        placeholder="e.g. 15000"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-base">Daily Rate</Label>
                    <Input
                      type="number"
                      className="h-12 bg-secondary/30 rounded-xl"
                      value={activeFacility.pricing?.daily_rate || ""}
                      onChange={(e) => updateActiveFacilityPricing("daily_rate", e.target.value)}
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Session/Slot Duration</Label>
                    <select
                      className="w-full h-12 rounded-xl bg-secondary/30 border border-input px-4 text-base"
                      value={activeFacility.duration_minutes || "60"}
                      onChange={(e) => updateActiveFacility("duration_minutes", e.target.value)}
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour (60 Mins)</option>
                      <option value="90">1.5 Hours (90 Mins)</option>
                      <option value="120">2 Hours (120 Mins)</option>
                      <option value="180">3 Hours (180 Mins)</option>
                      <option value="240">4 Hours (240 Mins)</option>
                    </select>
                  </div>
                  {(activeFacility.type === "shared_access" ||
                    activeFacility.type === "shared_slot") && (
                    <div className="space-y-2">
                      <Label className="text-base">Max Capacity</Label>
                      <Input
                        type="number"
                        className="h-12 bg-secondary/30 rounded-xl"
                        value={activeFacility.max_capacity}
                        onChange={(e) => updateActiveFacility("max_capacity", e.target.value)}
                        placeholder="e.g. 100 people"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="font-semibold text-lg">Media</h4>
                <div className="space-y-2">
                  {activeFacility.image_url ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border">
                      <img
                        src={activeFacility.image_url}
                        alt={activeFacility.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updateActiveFacility("image_url", "")}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-40 bg-secondary/30 rounded-xl border border-dashed relative hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <div className="flex flex-col items-center text-muted-foreground text-sm">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                        ) : (
                          <UploadCloud className="h-6 w-6 mb-2" />
                        )}
                        {isUploading ? "Uploading..." : "Click to upload Image"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="font-semibold text-lg">Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border/60 rounded-xl h-fit">
                    <div className="space-y-1">
                      <Label className="text-base">Require Admin Approval</Label>
                      <p className="text-xs text-muted-foreground">
                        Require manual approval for bookings.
                      </p>
                    </div>
                    <Switch
                      checked={activeFacility.requires_approval}
                      onCheckedChange={(v) => updateActiveFacility("requires_approval", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl h-fit">
                    <div className="space-y-1">
                      <Label className="text-base text-orange-600 dark:text-orange-400">
                        Under Maintenance
                      </Label>
                      <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
                        Temporarily disable bookings.
                      </p>
                    </div>
                    <Switch
                      checked={activeFacility.is_under_maintenance}
                      onCheckedChange={(v) => updateActiveFacility("is_under_maintenance", v)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => saveAll(facilities)}
                  disabled={updateMutation.isPending || isUploading}
                  className="w-full h-12 rounded-xl text-base shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
