import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizerProfile, updateOrganizerProfile } from "@/api/organizers";
import { ArrowLeft, Save, User, Link as LinkIcon, Instagram, Twitter, Youtube, Building2, LayoutList, Heart, MessageSquare, Send, Pencil, Share, Trash2, MapPin, Tag, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateDatabaseWorkspace, disableDatabaseWorkspace } from "@/api/workspaces";
import { stories as defaultStories } from "@/lib/mock-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StoryViewer } from "@/components/site/StoryViewer";
import { usePlatformModules } from "@/hooks/usePlatformModules";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Organizer Profile — Agatike Dashboard" },
      { name: "description", content: "Manage your organizer profile settings." },
    ],
  }),
  component: OrganizerSettings,
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(3, "Handle must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function OrganizerSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "workspaces">("posts");
  const [activePost, setActivePost] = useState<any>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [avatar, setAvatar] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("bottts");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const CATEGORIES = [
    { id: "bottts", label: "Robots" },
    { id: "shapes", label: "Shapes" },
    { id: "identicon", label: "Patterns" },
    { id: "adventurer", label: "Characters" },
    { id: "fun-emoji", label: "Emojis" },
    { id: "micah", label: "Stylized" },
  ];

  const generateAvatarsForCategory = (category: string) => {
    const BACKGROUND_COLORS = ["b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9", "c0aede", "b6e3f4", "ffdfbf"];
    return Array.from({ length: 12 }).map(() => {
      const bg = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${bg}`;
    });
  };

  useEffect(() => {
    if (isAvatarModalOpen) {
      setAvatarOptions(generateAvatarsForCategory(activeCategory));
    }
  }, [activeCategory, isAvatarModalOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        // Optionally close modal immediately when they upload their own photo
        setIsAvatarModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const [editingWorkspace, setEditingWorkspace] = useState<any>(null);
  const [disableConfirmWorkspace, setDisableConfirmWorkspace] = useState<any>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["organizerProfile"],
    queryFn: async () => await getOrganizerProfile(),
  });

  const { data: platformModules = [] } = usePlatformModules();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      handle: "",
      email: "",
      phone: "",
      bio: "",
      instagram: "",
      twitter: "",
      youtube: "",
      password: "",
    }
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue !== undefined) {
      const computedHandle = nameValue.toLowerCase().replace(/[^a-z0-9]/g, '');
      setValue("handle", computedHandle, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        handle: profile.handle || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        instagram: profile.socials?.instagram || "",
        twitter: profile.socials?.twitter || "",
        youtube: profile.socials?.youtube || "",
      });
      // Use real image if available, else dicebear
      if (profile.image) {
        setAvatar(profile.image);
      } else {
        setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.id || "org"}&backgroundColor=f3f4f6`);
      }
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { instagram, twitter, youtube, ...core } = values;
      return await updateOrganizerProfile({
        data: {
          ...core,
          image: avatar,
          socials: { instagram, twitter, youtube },
        }
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile.");
    }
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: any) => await updateDatabaseWorkspace({ data }),
    onSuccess: () => {
      toast.success("Workspace updated successfully!");
      setEditingWorkspace(null);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => toast.error(error.message || "Failed to update workspace.")
  });

  const disableWorkspaceMutation = useMutation({
    mutationFn: async (id: string) => await disableDatabaseWorkspace({ data: { id } }),
    onSuccess: () => {
      toast.success("Workspace disabled successfully!");
      setDisableConfirmWorkspace(null);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => toast.error(error.message || "Failed to disable workspace.")
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // --- MOCK DATA ---
  const mockHighlights = defaultStories.slice(0, 5);
  const mockPosts = Array.from({ length: 5 }).map((_, i) => ({
    id: `post-${i}`,
    title: `Event Announcement ${i + 1}`,
    description: "Get ready for the biggest event of the year! We are bringing the heat with amazing performances and unbeatable vibes. Tickets dropping soon!",
    image: `https://picsum.photos/seed/${i + 200}/600/400`,
    likes: Math.floor(Math.random() * 1000) + 120,
    comments: Math.floor(Math.random() * 50) + 5,
    date: "2 days ago"
  }));

  const mockComments = [
    { id: 1, user: "johndoe", text: "Can't wait for this! 🔥" },
    { id: 2, user: "sarah_m", text: "Are VIP tickets available yet?" },
    { id: 3, user: "kigali_vibes", text: "This is going to be epic!" },
    { id: 4, user: "alex.b", text: "Who is the surprise guest???" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
              if (isEditing) setIsEditing(false);
              else navigate({ to: "/dashboard/workspaces" });
            }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{isEditing ? "Edit Profile" : profile?.handle || "Profile"}</h1>
          </div>
          {isEditing && (
            <Button 
              onClick={handleSubmit((d) => updateMutation.mutate(d))} 
              disabled={updateMutation.isPending}
              className="rounded-full gap-2" 
            >
              {updateMutation.isPending ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 md:px-8 py-8">
        {!isEditing ? (
          /* =========================================
             VIEW MODE
             ========================================= */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Section */}
            <div className="flex items-center gap-6 md:gap-10">
              <div className="relative shrink-0">
                <div className="h-20 w-20 md:h-28 md:w-28 rounded-full overflow-hidden border border-border/40 bg-secondary">
                  {avatar && <img src={avatar} alt={profile?.name} className="w-full h-full object-cover" />}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-around md:justify-start md:gap-10">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg md:text-xl">{profile?.numberOfEvents || 0}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">Posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg md:text-xl">{profile?.followers || 0}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2">
              <h2 className="font-bold text-base md:text-lg">{profile?.name}</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-lg">
                {profile?.bio || "No bio added yet. Click Edit Profile to add one!"}
              </p>
              
              {/* Social Links rendering */}
              {profile?.socials && Object.values(profile.socials).some(val => val) && (
                <div className="flex items-center gap-3 pt-1">
                  {profile.socials.instagram && (
                    <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                  {profile.socials.twitter && (
                    <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                      <Twitter className="h-4 w-4" /> Twitter
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1 font-semibold rounded-xl h-10 bg-orange-500 hover:bg-orange-600 text-white border-transparent shadow-sm gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="default" className="flex-1 font-semibold rounded-xl h-10 bg-orange-500 hover:bg-orange-600 text-white border-transparent shadow-sm gap-2">
                <Share className="h-4 w-4" /> Share Profile
              </Button>
            </div>

            {/* Highlights Section */}
            <div className="pt-4">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {mockHighlights.map((highlight, index) => (
                  <div 
                    key={highlight.id} 
                    className="flex shrink-0 flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setActiveStoryIndex(index)}
                  >
                    <div className="rounded-full overflow-hidden border border-border/40">
                      <img
                        src={highlight.avatar}
                        alt={highlight.name}
                        className="h-16 w-16 md:h-20 md:w-20 object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">{highlight.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 mt-4">
              <button 
                onClick={() => setActiveTab("posts")}
                className={`flex-1 flex justify-center py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "posts" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutList className="h-5 w-5 mr-2" /> Updates
              </button>
              <button 
                onClick={() => setActiveTab("workspaces")}
                className={`flex-1 flex justify-center py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "workspaces" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Building2 className="h-5 w-5 mr-2" /> Workspaces
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "posts" && (
              <div className="space-y-6 pt-2">
                {mockPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="flex flex-col bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActivePost(post)}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-border/40 shrink-0">
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm leading-tight">{profile?.name || "Organizer"}</p>
                        <p className="text-xs text-muted-foreground">{post.date}</p>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-2">
                      <p className="text-sm line-clamp-2">{post.description}</p>
                    </div>

                    <div className="w-full aspect-video bg-muted relative">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-4 flex items-center gap-6">
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Heart className="h-5 w-5" /> <span className="text-sm font-medium">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare className="h-5 w-5" /> <span className="text-sm font-medium">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "workspaces" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {workspaces.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                    No workspaces created yet.
                  </div>
                ) : workspaces.map((w) => {
                  return (
                    <div
                      key={w.id}
                      className="flex flex-col rounded-3xl border bg-card p-5 shadow-sm transition-all border-border/60 hover:border-primary/50 relative group"
                    >
                      {/* Action Overlay */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 rounded-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setEditingWorkspace(w)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 rounded-full bg-secondary/80 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setDisableConfirmWorkspace(w)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-start gap-4 mb-4 pr-20">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl text-xl shrink-0 overflow-hidden bg-secondary text-secondary-foreground"
                        >
                          {w.icon?.startsWith("http") || w.icon?.startsWith("data:") ? (
                            <img src={w.icon} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            w.icon || <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-base truncate">{w.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                            <Tag className="h-3 w-3 shrink-0" /> {w.type || "General Workspace"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" /> {w.city}{w.country ? `, ${w.country}` : ""}
                          </p>
                        </div>
                      </div>
                      
                      {w.address && (
                        <div className="text-sm bg-secondary/30 p-3 rounded-xl border border-border/40 mt-auto">
                          <p className="font-medium mb-1">Address Details</p>
                          <p className="text-xs text-muted-foreground">{w.address}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =========================================
             EDIT MODE 
             ========================================= */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Core Information
              </h2>

              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary bg-secondary">
                      {avatar && <img src={avatar} alt="Profile" className="h-full w-full object-cover" />}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organizer Name</Label>
                    <Input {...register("name")} className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Handle / Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">@</span>
                      <Input {...register("handle")} disabled className="pl-7 rounded-xl bg-secondary/50 border-transparent focus:border-primary font-mono text-sm opacity-70 cursor-not-allowed" />
                    </div>
                    {errors.handle && <p className="text-xs text-red-500">{errors.handle.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...register("email")} type="email" className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input {...register("phone")} className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Change Password (Optional)</Label>
                  <Input {...register("password")} type="password" placeholder="Leave blank to keep current password" className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                </div>

                <div className="space-y-2">
                  <Label>Bio / Description</Label>
                  <Textarea {...register("bio")} className="rounded-xl bg-secondary/50 border-transparent focus:border-primary min-h-[100px]" placeholder="Tell your audience about your brand..." />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" /> Social Links
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input {...register("instagram")} placeholder="https://instagram.com/..." className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X URL</Label>
                  <Input {...register("twitter")} placeholder="https://twitter.com/..." className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input {...register("youtube")} placeholder="https://youtube.com/..." className="rounded-xl bg-secondary/50 border-transparent focus:border-primary" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Post Conversation Viewer Dialog */}
      <Dialog open={!!activePost} onOpenChange={(open) => !open && setActivePost(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl bg-background border-border/60 sm:max-h-[85vh] flex flex-col md:flex-row">
          <DialogHeader className="sr-only">
            <DialogTitle>Post View</DialogTitle>
            <DialogDescription>Viewing conversation for post</DialogDescription>
          </DialogHeader>
          
          {activePost && (
            <>
              {/* Image side (Desktop) / Top (Mobile) */}
              <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
                <img src={activePost.image} alt={activePost.title} className="w-full h-auto max-h-[40vh] md:max-h-full object-contain" />
              </div>
              
              {/* Conversation side */}
              <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto max-h-full bg-card">
                {/* Header */}
                <div className="p-4 border-b border-border/40 flex items-center gap-3 shrink-0">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-border/40 shrink-0">
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{profile?.name}</p>
                  </div>
                </div>

                {/* Scrollable Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 mt-1">
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-bold mr-2">{profile?.handle || "organizer"}</span>{activePost.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activePost.date}</p>
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {mockComments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-bold mr-2">{c.user}</span>{c.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">Reply</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="p-4 border-t border-border/40 shrink-0">
                  <div className="flex items-center gap-4 mb-4">
                    <Heart className="h-6 w-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                    <MessageSquare className="h-6 w-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                    <Send className="h-6 w-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                  </div>
                  <p className="font-bold text-sm mb-1">{activePost.likes} likes</p>
                  <p className="text-xs text-muted-foreground mb-4">{activePost.date}</p>
                  
                  <div className="relative">
                    <Input placeholder="Add a comment..." className="pr-10 rounded-full bg-secondary/50 border-transparent focus:border-border" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm font-bold opacity-70 hover:opacity-100">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Workspace Modal */}
      <Dialog open={!!editingWorkspace} onOpenChange={(open) => !open && setEditingWorkspace(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] rounded-3xl bg-card border-border/60 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update the core details and active modules for this workspace.
            </DialogDescription>
          </DialogHeader>
          {editingWorkspace && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Left Column: Basic Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Workspace Details</h3>
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input 
                    defaultValue={editingWorkspace.name} 
                    className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                    onChange={(e) => setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input 
                    defaultValue={editingWorkspace.type} 
                    placeholder="e.g. Venue, Club, Agency"
                    className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                    onChange={(e) => setEditingWorkspace({ ...editingWorkspace, type: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      defaultValue={editingWorkspace.city} 
                      className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                      onChange={(e) => setEditingWorkspace({ ...editingWorkspace, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      defaultValue={editingWorkspace.country} 
                      className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                      onChange={(e) => setEditingWorkspace({ ...editingWorkspace, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Full Address</Label>
                  <Input 
                    defaultValue={editingWorkspace.address} 
                    className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                    onChange={(e) => setEditingWorkspace({ ...editingWorkspace, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: Platform Modules */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Active Modules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {platformModules.map((mod) => {
                    const currentModules = editingWorkspace.moduls || [];
                    const isSelected = currentModules.includes(mod.id);
                    const isMandatory = mod.mandatory;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (isMandatory) return;
                          if (isSelected) {
                            setEditingWorkspace({ ...editingWorkspace, moduls: currentModules.filter((m: string) => m !== mod.id) });
                          } else {
                            setEditingWorkspace({ ...editingWorkspace, moduls: [...currentModules, mod.id] });
                          }
                        }}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isMandatory ? 'opacity-70 cursor-not-allowed bg-secondary/30' : 'cursor-pointer hover:border-primary/50'} ${isSelected ? 'border-primary bg-primary/5' : 'border-border/60 bg-card'}`}
                      >
                        <div className={`mt-0.5 rounded-xl p-2 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                          <mod.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm leading-tight flex items-center gap-2">
                            {mod.label}
                            {isMandatory && <span className="text-[10px] uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Req</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mod.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons span full width */}
              <div className="col-span-full pt-6 flex gap-3 border-t border-border/40">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => setEditingWorkspace(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-xl bg-primary text-primary-foreground"
                  disabled={updateWorkspaceMutation.isPending}
                  onClick={() => updateWorkspaceMutation.mutate(editingWorkspace)}
                >
                  {updateWorkspaceMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Workspace Confirmation Modal */}
      <Dialog open={!!disableConfirmWorkspace} onOpenChange={(open) => !open && setDisableConfirmWorkspace(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl bg-card border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl">Disable Workspace?</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to disable <strong>{disableConfirmWorkspace?.name}</strong>? 
              This will remove your access and hide it from the platform. This action cannot be undone from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-6 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-11"
              onClick={() => setDisableConfirmWorkspace(null)}
            >
              Keep Workspace
            </Button>
            <Button 
              variant="destructive"
              className="flex-1 rounded-xl h-11"
              disabled={disableWorkspaceMutation.isPending}
              onClick={() => disableWorkspaceMutation.mutate(disableConfirmWorkspace.id)}
            >
              {disableWorkspaceMutation.isPending ? "Disabling..." : "Yes, Disable it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Avatar Selection Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>Choose Profile Image</DialogTitle>
            <DialogDescription>
              Select an avatar for your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4 w-full min-w-0">
            {/* Category Tabs & Upload */}
            <div className="w-full overflow-hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center w-full">
              <Button
                variant="outline"
                className="rounded-full shrink-0 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload className="h-4 w-4" /> Upload Custom
              </Button>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              
              {/* Divider */}
              <div className="h-6 w-px bg-border/60 mx-1 shrink-0" />

              {CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "secondary"}
                  className={`rounded-full shrink-0 ${activeCategory === cat.id ? 'bg-primary' : 'bg-secondary/60 hover:bg-secondary'}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {avatarOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${avatar === opt ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                  onClick={() => setAvatar(opt)}
                >
                  <img src={opt} alt="Avatar option" className="w-full aspect-square object-cover bg-secondary/30" />
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3 border-t border-border/40">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={mockHighlights}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
      
      {/* Hide Scrollbar Style for Highlights */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
