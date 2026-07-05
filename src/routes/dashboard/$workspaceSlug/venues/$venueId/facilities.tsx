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
      name: "New Sub-Venue",
      type: "exclusive_slot",
      pricing: { hourly_rate: "", daily_rate: "" },
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
        i === editingIndex ? { ...f, pricing: { ...(f.pricing || {}), [field]: val } } : f
      )
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
          <h2 className="text-2xl font-bold tracking-tight">Facilities & Sub-Venues</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your distinct bookable spaces (e.g. Pitches, VIP Rooms, Swimming Pools).
          </p>
        </div>
        <Button
          onClick={openAddFacility}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add Sub-Venue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility, idx) => (
          <div
            key={facility.id || idx}
            className="flex flex-col bg-card shadow-sm rounded-3xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow relative"
          >
            {facility.is_under_maintenance && (
              <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                Maintenance
              </div>
            )}
            <div className="h-40 w-full bg-secondary/30 relative">
              {facility.image_url ? (
                <img src={facility.image_url} alt={facility.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight truncate pr-2">{facility.name || "Unnamed"}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => openEditFacility(idx)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Type: <span className="font-medium text-foreground">{facility.type === "exclusive_slot" ? "Exclusive Slot" : "Shared Access"}</span></p>
                {facility.pricing?.hourly_rate && <p>Hourly: <span className="font-medium text-foreground">{activeWorkspace?.currency || "RWF"} {facility.pricing.hourly_rate}</span></p>}
                {facility.pricing?.daily_rate && <p>Daily: <span className="font-medium text-foreground">{activeWorkspace?.currency || "RWF"} {facility.pricing.daily_rate}</span></p>}
                {facility.type === "shared_access" && facility.max_capacity && (
                  <p>Capacity: <span className="font-medium text-foreground">{facility.max_capacity}</span></p>
                )}
              </div>
              
              <div className="mt-auto flex gap-2 pt-4 border-t border-border/50">
                <Link
                  to="/dashboard/$workspaceSlug/venues/$venueId/facilities_/$facilityId/bookings"
                  params={{ workspaceSlug, venueId, facilityId: facility.id }}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 rounded-xl">
                    <CalendarDays className="h-4 w-4" /> Bookings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-xl px-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 border-border/60"
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
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingIndex !== null ? "Edit Sub-Venue" : "Add Sub-Venue"}</SheetTitle>
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
                <div className="space-y-2">
                  <Label className="text-base">Booking Type</Label>
                  <select
                    className="w-full h-12 rounded-xl bg-secondary/30 border border-input px-4 text-base"
                    value={activeFacility.type}
                    onChange={(e) => updateActiveFacility("type", e.target.value)}
                  >
                    <option value="exclusive_slot">Exclusive Slot (Only 1 group per time)</option>
                    <option value="shared_access">Shared Access (Passes per day up to capacity)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="font-semibold text-lg">Pricing & Capacity</h4>
                <div className="grid grid-cols-2 gap-4">
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
                {activeFacility.type === "shared_access" && (
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
                      <Label className="text-base text-orange-600 dark:text-orange-400">Under Maintenance</Label>
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
