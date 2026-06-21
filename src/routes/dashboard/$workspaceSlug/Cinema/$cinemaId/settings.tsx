import { createFileRoute } from "@tanstack/react-router";
import { Save, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCinemaById, updateCinema } from "@/api/cinemas";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/settings")({
  component: CinemaSettings,
});

function CinemaSettings() {
  const { cinemaId } = Route.useParams() as any;
  const queryClient = useQueryClient();

  const { data: cinema, isLoading } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    cover_url: "",
  });

  useEffect(() => {
    if (cinema) {
      setForm({
        name: cinema.name || "",
        city: cinema.city || "",
        address: cinema.address || "",
        description: cinema.description || "",
        cover_url:
          cinema.cover_url ||
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600",
      });
    }
  }, [cinema]);

  const updateMutation = useMutation({
    mutationFn: (updates: any) => updateCinema({ data: { id: cinemaId, ...updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cinema", cinemaId] });
      toast.success("Cinema settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update cinema settings");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleUploadClick = () => {
    toast.info("Image uploading would open here (mocked for now).");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cinema Settings</h2>
          <p className="text-muted-foreground mt-1">
            Update global details and branding for this cinema.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2 rounded-xl h-11 px-6 font-bold shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 mt-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Cover Image</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div
              onClick={handleUploadClick}
              className="h-40 w-full sm:w-64 rounded-2xl overflow-hidden bg-secondary border border-border/60 shrink-0 relative group cursor-pointer"
            >
              <img src={form.cover_url} alt="Cover" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <Button onClick={handleUploadClick} variant="outline" className="gap-2 rounded-xl">
                <UploadCloud className="h-4 w-4" /> Upload New Image
              </Button>
              <p className="text-sm text-muted-foreground">
                Recommended size: 1600x900px. Maximum file size: 5MB.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-border/60" />

        <div className="space-y-6">
          <h3 className="font-bold text-lg">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cinema Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>City / Location</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-xl min-h-[120px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
