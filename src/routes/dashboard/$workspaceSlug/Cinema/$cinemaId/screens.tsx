import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getScreens, createScreen, updateScreen, deleteScreen } from "@/api/cinema_management";
import {
  Plus,
  MonitorPlay,
  MoreVertical,
  Loader2,
  Trash2,
  Edit2,
  Users,
  Check,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/screens")({
  component: CinemaScreensPage,
});

const EMPTY_FORM = {
  name: "",
  screen_type: "standard",
  capacity: 100,
  has_3d: false,
  has_imax: false,
  has_dolby: false,
  has_4dx: false,
  status: "active",
};

function CinemaScreensPage() {
  const { cinemaId } = Route.useParams();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const { canCreateCinemaScreen } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: screens = [], isLoading } = useQuery({
    queryKey: ["cinema_screens", cinemaId],
    queryFn: () => getScreens({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    if (!canCreateCinemaScreen()) {
      toast.error("Screen Limit Reached", {
        description: "You have reached the maximum number of screens allowed by your plan."
      });
      return;
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const handleOpenEdit = (screen: any) => {
    setEditingId(screen.id);
    setForm({ ...screen });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Screen name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateScreen({ data: { id: editingId, ...form } });
        toast.success("Screen updated");
      } else {
        await createScreen({ data: { ...form, cinema_id: cinemaId } });
        toast.success("Screen created");
      }
      await queryClient.invalidateQueries({ queryKey: ["cinema_screens"] });
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save screen");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? Schedules tied to this screen will be affected.`)) return;
    try {
      await deleteScreen({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["cinema_screens"] });
      toast.success(`${name} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Screens & Halls</h1>
            <p className="text-muted-foreground">
              Manage your cinema's physical screens, capacities, and formats.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" /> Add Screen
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && screens.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <MonitorPlay className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Screens Configured</h3>
            <p className="text-muted-foreground mb-6">
              Add your first screen (e.g. Screen 1, VIP Lounge, IMAX Hall) to start scheduling.
            </p>
            <Button onClick={handleOpenCreate} className="gap-2 rounded-xl h-11 px-6 font-bold">
              <Plus className="h-5 w-5" /> Add First Screen
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && screens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screens.map((screen: any) => (
              <div
                key={screen.id}
                className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col group relative overflow-hidden"
              >
                {/* Context menu */}
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full hover:bg-secondary"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleOpenEdit(screen)} className="gap-2">
                        <Edit2 className="h-3.5 w-3.5" /> Edit Screen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2"
                        onClick={() => handleDelete(screen.id, screen.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Screen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MonitorPlay className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{screen.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {screen.screen_type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/40 rounded-xl p-3 border border-border/40">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase">Capacity</span>
                    </div>
                    <p className="font-bold text-xl">{screen.capacity}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-xl p-3 border border-border/40">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Check className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase">Status</span>
                    </div>
                    <p className="font-bold text-base capitalize text-emerald-500">
                      {screen.status}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-auto flex flex-wrap gap-2">
                  {screen.has_3d && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                      3D Ready
                    </span>
                  )}
                  {screen.has_imax && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      IMAX
                    </span>
                  )}
                  {screen.has_dolby && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      Dolby Atmos
                    </span>
                  )}
                  {screen.has_4dx && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      4DX
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Form Sheet ────────────────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">
                {editingId ? "Edit Screen" : "Add Screen / Hall"}
              </SheetTitle>
              <SheetDescription>
                Configure the physical attributes of this cinema room.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>
                  Screen Name / Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Screen 1, VIP Lounge"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (Seats)</Label>
                  <Input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => set("capacity", parseInt(e.target.value))}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Screen Type</Label>
                  <select
                    value={form.screen_type}
                    onChange={(e) => set("screen_type", e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium / VIP</option>
                    <option value="imax">IMAX</option>
                    <option value="drive_in">Drive-In</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Label className="mb-3 block">Supported Formats & Technologies</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.has_3d}
                      onChange={(e) => set("has_3d", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">3D Ready</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.has_imax}
                      onChange={(e) => set("has_imax", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">IMAX</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.has_dolby}
                      onChange={(e) => set("has_dolby", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Dolby Atmos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.has_4dx}
                      onChange={(e) => set("has_4dx", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">4DX Capable</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active (Available for booking)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-border/40">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setSheetOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl h-11 gap-2 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Screen"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
