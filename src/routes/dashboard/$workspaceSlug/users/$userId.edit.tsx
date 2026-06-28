import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateWorkspaceUser, getWorkspaceUsers } from "@/api/workspace_users";
import { getUserWorkspaces } from "@/api/workspaces";
import { uploadFile } from "@/api/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  User,
  Shield,
  Image as ImageIcon,
  Upload,
  X,
  Dices,
  Clock,
  Building2,
  Puzzle,
  CheckCircle2,
  Loader2,
  Pencil,
  CalendarDays,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/users/$userId/edit")({
  head: () => ({
    meta: [
      { title: "Edit User — Agatike Dashboard" },
      { name: "description", content: "Edit a workspace user's permissions." },
    ],
  }),
  component: EditUserPage,
});

const AVATAR_CATEGORIES = [
  { id: "bottts", label: "Robots" },
  { id: "shapes", label: "Shapes" },
  { id: "identicon", label: "Patterns" },
  { id: "adventurer", label: "Characters" },
  { id: "fun-emoji", label: "Emojis" },
  { id: "micah", label: "Stylized" },
  { id: "avataaars", label: "People" },
  { id: "big-smile", label: "Smiles" },
  { id: "lorelei", label: "Cute" },
  { id: "pixel-art", label: "8-Bit" },
  { id: "initials", label: "Initials" },
  { id: "rings", label: "Rings" },
];

const BG_COLORS = ["b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9", "c0aede", "b6e3f4", "ffdfbf"];

function generateAvatars(category: string) {
  return Array.from({ length: 16 }).map(() => {
    const bg = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${bg}`;
  });
}

function EditUserPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug, userId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const { data: workspacesUsers = [], isLoading: isLoadingUser } = useQuery({
    queryKey: ["workspace_users"],
    queryFn: () => getWorkspaceUsers(),
  });

  const existingUser = workspacesUsers.find((u: any) => u.id === userId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [image, setImage] = useState("");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("avataaars");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const [isAllWorkspaces, setIsAllWorkspaces] = useState(true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);

  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const [isAllRoutes, setIsAllRoutes] = useState(true);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Initialize state once existingUser loads
  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name || "");
      setEmail(existingUser.email || "");
      setRole(existingUser.role || "user");
      setImage(existingUser.image || "");

      const w = existingUser.workspaces;
      let wsArr = Array.isArray(w) ? w : typeof w === "string" ? [w] : w ? Object.keys(w) : [];
      setIsAllWorkspaces(wsArr.includes("ALL") || wsArr.length === 0);
      setSelectedWorkspaces(wsArr.includes("ALL") ? [] : wsArr);

      const m = existingUser.modules;
      let modArr = Array.isArray(m) ? m : typeof m === "string" ? [m] : m ? Object.keys(m) : [];
      setSelectedModules(modArr);

      const p = existingUser.pages;
      let pageArr = Array.isArray(p) ? p : typeof p === "string" ? [p] : p ? Object.keys(p) : [];
      setIsAllRoutes(pageArr.includes("ALL") || pageArr.length === 0);
      setSelectedRoutes(pageArr.includes("ALL") ? [] : pageArr);

      setIsTemporary(existingUser.is_temporary || false);
      if (existingUser.expires_at) {
        setExpiresAt(new Date(existingUser.expires_at).toISOString().split("T")[0]);
      }
    }
  }, [existingUser]);

  const { data: workspaces = [] } = useQuery({
    queryKey: ["organizer_workspaces"],
    queryFn: async () => {
      try {
        return (await getUserWorkspaces()).workspaces;
      } catch {
        return [];
      }
    },
  });

  const { data: platformModules = [] } = usePlatformModules();

  const MODULE_ROUTES_MAP: Record<string, { id: string; label: string; path: string }[]> = {
    Dashboard: [{ id: "dashboard:view", label: "View Dashboard", path: "/" }],
    Events: [
      { id: "events:view", label: "View Events List", path: "/events" },
      { id: "events:create", label: "Create Event", path: "/events/create-event" },
      { id: "events:manage", label: "Manage Event Settings", path: "/events/:id" },
    ],
    "Cinema / Theater": [
      { id: "cinema:view", label: "View Cinemas", path: "/Cinema" },
      { id: "cinema:create", label: "Create Cinema", path: "/Cinema/create" },
      { id: "cinema:movies", label: "Manage Movies", path: "/Cinema/movies" },
    ],
    Spaces: [
      { id: "spaces:view", label: "View Spaces", path: "/spaces" },
      { id: "spaces:create", label: "Create Space", path: "/spaces/create-space" },
    ],
    "Venue Listings": [
      { id: "venues:view", label: "View Venues", path: "/venues" },
      { id: "venues:create", label: "Create Venue", path: "/venues/create-venue" },
    ],
    Experiences: [
      { id: "experiences:view", label: "View Experiences", path: "/experiences" },
      {
        id: "experiences:create",
        label: "Create Experience",
        path: "/experiences/create-experience",
      },
    ],
    RSVPs: [
      { id: "rsvps:view", label: "View RSVPs", path: "/rsvps" },
      { id: "rsvps:create", label: "Create RSVP Form", path: "/rsvps/create" },
    ],
    Settings: [{ id: "settings:view", label: "View Settings", path: "/settings" }],
    Users: [
      { id: "users:view", label: "View Users", path: "/users" },
      { id: "users:create", label: "Add User", path: "/users/add-user" },
    ],
    "Page Builder": [{ id: "pages:builder", label: "Page Builder", path: "/page-builder" }],
    "Badge Designer": [{ id: "badge:designer", label: "Badge Designer", path: "/badge-designer" }],
    "Venue Designer": [{ id: "venue:designer", label: "Venue Designer", path: "/venue-designer" }],
    Withdrawals: [{ id: "withdrawals:view", label: "View Withdrawals", path: "/withdrawals" }],
  };

  function getRoutesForModule(module: any) {
    if (MODULE_ROUTES_MAP[module.label]) return MODULE_ROUTES_MAP[module.label];
    return [
      {
        id: `${module.id}:view`,
        label: `View ${module.label}`,
        path: `/${module.href || module.id}`,
      },
    ];
  }

  const activeModulesIds = activeWorkspace?.modules || [];

  const legacyIdMap: Record<string, string> = {
    Dashboard: "dashboard",
    Events: "events",
    Tickets: "tickets",
    RSVPs: "rsvps",
    Attendees: "rsvps",
    Scanning: "scanner",
    "Products & Add-ons": "products&add-ons",
    Merchandise: "merchandise",
    "VIP Access": "vip",
    Campaigns: "campaigns",
    "Venue Listings": "venue_listings",
    "Venue Designer": "venue_designer",
    Experiences: "experiences",
    Analytics: "analytics",
    Users: "users",
    Withdrawals: "withdrawals",
    Settings: "settings",
    "Page Builder": "page_builder",
    "Badge Designer": "badge_designer",
    "Ticket Designer": "ticket_designer",
  };

  const availableModules = platformModules.filter((m) => {
    if (m.mandatory) return true;
    if (activeModulesIds.includes(m.id)) return true;
    const legacyId = legacyIdMap[m.label];
    return legacyId && activeModulesIds.includes(legacyId);
  });

  useEffect(() => {
    if (isAvatarPickerOpen) {
      setAvatarOptions(generateAvatars(activeCategory));
    }
  }, [activeCategory, isAvatarPickerOpen]);

  const editMutation = useMutation({
    mutationFn: async (payload: any) => {
      let finalImage = payload.image;
      if (finalImage && finalImage.startsWith("data:")) {
        const match = finalImage.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const res = await uploadFile({
            data: {
              base64: match[2],
              contentType: match[1],
              folder: "workspace-users/avatars",
              ext: match[1].split("/")[1] || "png",
            },
          } as any);
          finalImage = res.url;
        }
      }
      return updateWorkspaceUser({
        data: { ...payload, image: finalImage, id: userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success("User updated successfully!");
      navigate({ to: "/dashboard/$workspaceSlug/users", params: { workspaceSlug } });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setIsAvatarPickerOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required");
      return;
    }
    if (!isAllWorkspaces && selectedWorkspaces.length === 0) {
      toast.error("Please select at least one workspace");
      return;
    }
    if (!isAllRoutes && selectedRoutes.length === 0) {
      toast.error("Please select at least one route access");
      return;
    }
    if (isTemporary && !expiresAt) {
      toast.error("Please set an expiration date for temporary access");
      return;
    }

    editMutation.mutate({
      name,
      email,
      role,
      image,
      workspaces: isAllWorkspaces ? ["ALL"] : selectedWorkspaces,
      modules: selectedModules,
      pages: isAllRoutes ? ["ALL"] : selectedRoutes,
      is_temporary: isTemporary,
      expires_at: isTemporary && expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleWorkspace = (id: string) => {
    setSelectedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  };

  const toggleRoute = (path: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const defaultAvatar = name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=f97316`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=user&backgroundColor=f3f4f6`;

  const displayImage = image || defaultAvatar;

  if (isLoadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!existingUser) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center space-y-4">
        <h2 className="text-xl font-bold">User not found</h2>
        <Button
          onClick={() =>
            navigate({ to: "/dashboard/$workspaceSlug/users", params: { workspaceSlug } })
          }
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-32">
      <div className="mb-8">
        <Link to="/dashboard/$workspaceSlug/users" params={{ workspaceSlug }}>
          <Button
            variant="ghost"
            className="rounded-full gap-2 -ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground mt-1">
          Modify access and permissions for {existingUser.name}
        </p>
      </div>

      <div className="space-y-12">
        {/* ========== STEP 1: Basic Info & Avatar ========== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/60 pb-2">
            <User className="h-5 w-5 text-primary" /> User Profile
          </h2>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-border/60 bg-card">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-border/60 bg-secondary shadow-md">
                <img src={displayImage} alt="User avatar" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ImageIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setIsAvatarPickerOpen(true)}
              >
                <ImageIcon className="h-4 w-4" /> Choose Avatar
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileUpload}
                />
                <div className="inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-medium hover:bg-secondary/80 transition-colors">
                  <Upload className="h-4 w-4" /> Upload Photo
                </div>
              </label>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl gap-2 text-muted-foreground"
                  onClick={() => setImage("")}
                >
                  <X className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="h-11 rounded-xl bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="h-11 rounded-xl bg-secondary/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="user-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="user-role" className="h-11 rounded-xl bg-secondary/50">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> Normal User — Standard
                        workspace access
                      </span>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <span className="flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-muted-foreground" /> Contributor — Can
                        create and edit content
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* ========== STEP 2: Workspace Access ========== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/60 pb-2">
            <Building2 className="h-5 w-5 text-primary" /> Workspace Access
          </h2>
          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isAllWorkspaces ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsAllWorkspaces(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">All Workspaces</p>
                  <p className="text-sm text-muted-foreground">Access to every workspace you own</p>
                </div>
                {isAllWorkspaces && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!isAllWorkspaces ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsAllWorkspaces(false)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Specific Workspaces</p>
                  <p className="text-sm text-muted-foreground">
                    Limit access to selected workspaces only
                  </p>
                </div>
                {!isAllWorkspaces && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            {!isAllWorkspaces && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-2">
                {workspaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No workspaces available.
                  </p>
                ) : (
                  workspaces.map((ws: any) => (
                    <div
                      key={ws.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedWorkspaces.includes(ws.id) ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                      onClick={() => toggleWorkspace(ws.id)}
                    >
                      <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {ws.logo?.startsWith("http") || ws.logo?.startsWith("data:") ? (
                          <img src={ws.logo} alt={ws.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{ws.name}</span>
                      {selectedWorkspaces.includes(ws.id) && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* ========== STEP 3: Module Access ========== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/60 pb-2">
            <Puzzle className="h-5 w-5 text-primary" /> Module Access
          </h2>
          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {selectedModules.length} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModules(availableModules.map((m) => m.id))}
                className="text-xs h-7 rounded-md text-primary"
              >
                Select All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableModules.map((mod) => {
                const isSelected = selectedModules.includes(mod.id);
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border/60 hover:border-border bg-card"}`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {Icon ? <Icon className="h-5 w-5" /> : <Puzzle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{mod.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.desc}</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
              {availableModules.length === 0 && (
                <p className="col-span-2 text-center text-sm text-muted-foreground py-10">
                  No modules available in the current workspace.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ========== STEP 4: Route Access ========== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/60 pb-2">
            <FileText className="h-5 w-5 text-primary" /> App Route Access
          </h2>
          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isAllRoutes ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsAllRoutes(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">All Routes</p>
                  <p className="text-sm text-muted-foreground">
                    Access to all features inside assigned modules
                  </p>
                </div>
                {isAllRoutes && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!isAllRoutes ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsAllRoutes(false)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Specific Routes</p>
                  <p className="text-sm text-muted-foreground">
                    Limit access to selected features only
                  </p>
                </div>
                {!isAllRoutes && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            {!isAllRoutes && (
              <div className="space-y-6 pt-2 pl-2">
                {selectedModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Select at least one module in the section above first.
                  </p>
                ) : (
                  selectedModules.map((modId) => {
                    const mod = availableModules.find((m) => m.id === modId);
                    if (!mod) return null;
                    const routes = getRoutesForModule(mod);
                    return (
                      <div key={modId} className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                          {mod.icon && <mod.icon className="h-4 w-4 text-primary" />} {mod.label}{" "}
                          Routes
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {routes.map((route) => (
                            <div
                              key={route.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedRoutes.includes(route.path) ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                              onClick={() => toggleRoute(route.path)}
                            >
                              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm truncate block">
                                  {route.label}
                                </span>
                                <span className="text-xs text-muted-foreground block truncate font-mono">
                                  {route.path}
                                </span>
                              </div>
                              {selectedRoutes.includes(route.path) && (
                                <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {/* ========== STEP 5: Access Duration ========== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/60 pb-2">
            <Clock className="h-5 w-5 text-primary" /> Access Duration
          </h2>
          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!isTemporary ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsTemporary(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Permanent Access</p>
                    <p className="text-sm text-muted-foreground">
                      No expiration — access until manually revoked
                    </p>
                  </div>
                </div>
                {!isTemporary && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isTemporary ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              onClick={() => setIsTemporary(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Temporary Access</p>
                    <p className="text-sm text-muted-foreground">
                      Set a date when access automatically expires
                    </p>
                  </div>
                </div>
                {isTemporary && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
            {isTemporary && (
              <div className="space-y-2 pl-[3.25rem] mt-4 animate-in slide-in-from-top-2">
                <Label htmlFor="expires-at">Expiration Date *</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-11 rounded-xl bg-secondary/50 max-w-xs"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Navigation Buttons (Fixed to Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-background/80 backdrop-blur-md border-t border-border/60 p-6 flex justify-end">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2 rounded-xl"
            onClick={() =>
              navigate({ to: "/dashboard/$workspaceSlug/users", params: { workspaceSlug } })
            }
          >
            Cancel
          </Button>
          <Button
            className="gap-2 rounded-xl px-8 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            onClick={handleSubmit}
            disabled={editMutation.isPending}
          >
            {editMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-lg">Choose an Avatar</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsAvatarPickerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 border-b border-border/60 bg-secondary/10">
              <label className="cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileUpload}
                />
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload custom photo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or GIF up to 5MB</p>
                </div>
              </label>
            </div>
            <div className="p-4 border-b border-border/60 bg-secondary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2">
                {AVATAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    setImage(av);
                    setIsAvatarPickerOpen(false);
                  }}
                  className={`aspect-square w-full rounded-2xl border-2 flex items-center justify-center transition-all overflow-hidden ${image === av ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-105"}`}
                >
                  <img src={av} alt="avatar" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border bg-secondary/20 flex gap-2">
              <Button
                onClick={() => setAvatarOptions(generateAvatars(activeCategory))}
                variant="outline"
                className="rounded-xl gap-2 flex-1"
              >
                <Dices className="h-4 w-4" /> Randomize
              </Button>
              <Button
                onClick={() => setIsAvatarPickerOpen(false)}
                variant="ghost"
                className="rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
