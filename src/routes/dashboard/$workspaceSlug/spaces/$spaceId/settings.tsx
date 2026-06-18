import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpaceById, updateSpace } from "@/api/spaces";
import { uploadFile } from "@/api/storage";
import { Settings, Save, UploadCloud, Phone, Instagram, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/settings")({
  component: SpaceSettingsPage,
});

const SPACE_TYPES = [
  { value: "office", label: "Co-working Space / Office" },
  { value: "coworking", label: "Co-working Space" },
  { value: "gym", label: "Fitness Center / Gym" },
  { value: "studio", label: "Creative Studio" },
  { value: "event_space", label: "Event Space" },
  { value: "meeting_room", label: "Meeting Room" },
];

function SpaceSettingsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const [form, setForm] = useState({
    name: "",
    type: "office",
    description: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    cover_url: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (space) {
      setForm({
        name: space.name || "",
        type: space.type || "office",
        description: space.description || "",
        phone: space.socials?.phone || "",
        whatsapp: space.socials?.whatsapp || "",
        instagram: space.socials?.instagram || "",
        cover_url: space.cover_url || "",
      });
    }
  }, [space]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = (reader.result as string).split(",")[1];
          const res = await uploadFile({
            data: {
              base64: base64String,
              contentType: file.type,
              folder: "spaces",
              ext: file.name.split(".").pop() || "jpg",
            }
          });
          if (res?.url) {
            setForm(prev => ({ ...prev, cover_url: res.url }));
            toast.success("Image uploaded! Don't forget to save changes.");
          }
        } catch (err) {
          toast.error("Failed to upload image.");
          console.error(err);
        } finally {
          setIsUploadingImage(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Error reading file.");
      console.error(err);
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!space) return;
    setIsSaving(true);
    try {
      await updateSpace({
        data: {
          id: space.id,
          name: form.name,
          type: form.type,
          description: form.description,
          cover_url: form.cover_url,
          socials: {
            ...space.socials,
            phone: form.phone,
            whatsapp: form.whatsapp,
            instagram: form.instagram,
          },
        },
      });
      queryClient.invalidateQueries({ queryKey: ["space", space.id] });
      toast.success("Space settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update space settings");
    } finally {
      setIsSaving(false);
    }
  };

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
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="gap-2 rounded-xl h-11 px-6 shadow-sm font-bold" 
          style={{ background: "var(--gradient-primary)" }}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Cover Image</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div 
                className="h-40 w-full sm:w-64 rounded-2xl overflow-hidden bg-secondary border border-border/60 shrink-0 relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.cover_url ? (
                  <img src={form.cover_url} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <UploadCloud className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {isUploadingImage ? "Uploading..." : "Upload New Image"}
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
                <Input 
                  id="name" 
                  name="name"
                  value={form.name} 
                  onChange={handleChange}
                  className="rounded-xl h-11" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Space Type</Label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SPACE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                value={form.description} 
                onChange={handleChange}
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
                <Input 
                  id="phone" 
                  name="phone"
                  value={form.phone} 
                  onChange={handleChange}
                  className="rounded-xl h-11" 
                  placeholder="+250 788 000 000" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-muted-foreground" /> WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  name="whatsapp"
                  value={form.whatsapp} 
                  onChange={handleChange}
                  className="rounded-xl h-11" 
                  placeholder="+250 788 000 000" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-muted-foreground" /> Instagram Handle</Label>
                <Input 
                  id="instagram" 
                  name="instagram"
                  value={form.instagram} 
                  onChange={handleChange}
                  className="rounded-xl h-11" 
                  placeholder="https://instagram.com/yourspace" 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

