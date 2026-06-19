import { createFileRoute } from "@tanstack/react-router";
import { Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/settings")({
  component: CinemaSettings,
});

function CinemaSettings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cinema Settings</h2>
          <p className="text-muted-foreground mt-1">Update global details and branding for this cinema.</p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6 font-bold shadow-sm" style={{ background: "var(--gradient-primary)" }}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 mt-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Cover Image</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-40 w-full sm:w-64 rounded-2xl overflow-hidden bg-secondary border border-border/60 shrink-0 relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600" alt="Cover" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <Button variant="outline" className="gap-2 rounded-xl">
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
              <Input defaultValue="Century Cinema" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>City / Location</Label>
              <Input defaultValue="Kigali" className="rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description / Address</Label>
            <Textarea defaultValue="Located in the heart of the city." className="rounded-xl min-h-[120px] resize-y" />
          </div>
        </div>
      </div>
    </div>
  );
}
