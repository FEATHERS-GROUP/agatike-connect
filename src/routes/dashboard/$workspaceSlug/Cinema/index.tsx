import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getCinemas, createCinema, deleteCinema } from "@/api/cinemas";
import {
  Plus,
  MapPin,
  Film,
  MoreVertical,
  Building2,
  Loader2,
  Save,
  Trash2,
  X,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/")({
  component: CinemaDashboardList,
});

const EMPTY_FORM = {
  name: "",
  description: "",
  city: "",
  address: "",
  country: "Rwanda",
  phone: "",
  email: "",
  website: "",
  cover_url: "",
  status: "active",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  inactive: "bg-secondary text-muted-foreground border-border/60",
  coming_soon: "bg-blue-500/15 text-blue-600 border-blue-500/30",
};

function CinemaDashboardList() {
  const { workspaceSlug } = Route.useParams();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: cinemas = [], isLoading } = useQuery({
    queryKey: ["cinemas", activeWorkspace?.id],
    queryFn: () => getCinemas({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Cinema name is required");
      return;
    }
    setSaving(true);
    try {
      await createCinema({
        data: {
          ...form,
          workspace_id: activeWorkspace?.id,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success(`${form.name} created!`);
      setSheetOpen(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err.message || "Failed to create cinema");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCinema({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success(`${name} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const set = (key: string, val: string) =>
    setForm((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Cinemas & Theaters
            </h1>
            <p className="text-muted-foreground">
              Manage your cinema venues, schedules, and premieres.
            </p>
          </div>
          <Button
            onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true); }}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" /> Add New Cinema
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && cinemas.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Cinemas Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first cinema or theater to start scheduling movies and selling tickets.
            </p>
            <Button
              onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true); }}
              className="gap-2 rounded-xl h-11 px-6 font-bold"
            >
              <Plus className="h-5 w-5" /> Create First Cinema
            </Button>
          </div>
        )}

        {/* Cinema Cards */}
        {!isLoading && cinemas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemas.map((cinema: any) => (
              <div
                key={cinema.id}
                className="group flex flex-col bg-card/40 hover:bg-card border border-border/40 hover:border-border/80 rounded-3xl overflow-hidden transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                  {cinema.cover_url ? (
                    <img
                      src={cinema.cover_url}
                      alt={cinema.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Building2 className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[cinema.status] || STATUS_COLORS.active}`}>
                      {cinema.status === "coming_soon" ? "Coming Soon" : cinema.status.charAt(0).toUpperCase() + cinema.status.slice(1)}
                    </span>
                  </div>

                  {/* Context menu */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive gap-2"
                          onClick={() => handleDelete(cinema.id, cinema.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Cinema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Cinema name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{cinema.name}</h3>
                    {cinema.city && (
                      <div className="flex items-center gap-1 text-sm font-medium text-white/80">
                        <MapPin className="h-3.5 w-3.5" /> {cinema.city}
                        {cinema.country && `, ${cinema.country}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" />
                      {cinema.screens_aggregate?.aggregate?.count ?? 0} Screens
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" />
                      {cinema.movies_aggregate?.aggregate?.count ?? 0} Movies Active
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-2"
                  >
                    <Link
                      to="/dashboard/$workspaceSlug/Cinema/$cinemaId/overview"
                      params={{ workspaceSlug, cinemaId: cinema.id }}
                    >
                      Manage Cinema
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Cinema Sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">New Cinema / Theater</SheetTitle>
            <SheetDescription>
              Create a new cinema venue. You can add screens and movies after.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cinema / Theater Name <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Century Cinema Kigali"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the cinema..."
                  className="rounded-xl min-h-[80px] resize-none"
                />
              </div>
            </div>

            <hr className="border-border/40" />

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Kigali"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    placeholder="Rwanda"
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="KG 123 St, Kigali"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <hr className="border-border/40" />

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact</h4>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="info@cinema.com"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://www.cinema.com"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <hr className="border-border/40" />

            {/* Cover image */}
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                value={form.cover_url}
                onChange={(e) => set("cover_url", e.target.value)}
                placeholder="https://..."
                className="rounded-xl h-11"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/40">
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
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Creating..." : "Create Cinema"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
