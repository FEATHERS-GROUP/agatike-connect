import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { Settings, Save, UploadCloud, Phone, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/settings")({
  component: SpaceSettingsPage,
});

function SpaceSettingsPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Space Settings</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Update your space's general information and branding.
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6 shadow-sm" style={{ background: "var(--gradient-primary)" }}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Cover Image</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="h-40 w-full sm:w-64 rounded-2xl overflow-hidden bg-secondary border border-border/60 shrink-0">
                {space.cover_url ? (
                  <img src={space.cover_url} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
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
                <Label htmlFor="name">Space Name</Label>
                <Input id="name" defaultValue={space.name} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Space Type</Label>
                <Input id="type" defaultValue={space.type} className="rounded-xl h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                defaultValue={space.description} 
                className="rounded-xl min-h-[120px] resize-y" 
              />
            </div>
          </div>

          <hr className="border-border/60" />

          <div className="space-y-6">
            <h3 className="font-bold text-lg">Contact & Socials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Phone Number</Label>
                <Input id="phone" defaultValue={space.socials?.phone || ""} className="rounded-xl h-11" placeholder="+250 788 000 000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-muted-foreground" /> WhatsApp</Label>
                <Input id="whatsapp" defaultValue={space.socials?.whatsapp || ""} className="rounded-xl h-11" placeholder="+250 788 000 000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-muted-foreground" /> Instagram Handle</Label>
                <Input id="instagram" defaultValue={space.socials?.instagram || ""} className="rounded-xl h-11" placeholder="@yourspace" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
