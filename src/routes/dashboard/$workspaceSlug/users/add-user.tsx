import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addWorkspaceUser } from "@/api/workspace_users";
import { getUserWorkspaces } from "@/api/workspaces";
import { getAllWorkspacePages } from "@/api/workspace-pages";
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
  ArrowRight,
  Check,
  User,
  Shield,
  Eye,
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
  Lock,
  CalendarDays,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/users/add-user")({
  head: () => ({
    meta: [
      { title: "Add New User — Agatike Dashboard" },
      { name: "description", content: "Create a new workspace user with custom permissions." },
    ],
  }),
  component: AddUserPage,
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

function AddUserPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 7;

  // Step 1: Profile Info & Avatar
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [image, setImage] = useState("");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("avataaars");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  // Step 2: Workspace Access
  const [isAllWorkspaces, setIsAllWorkspaces] = useState(true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);

  // Step 3: Module Access
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Step 4: Route Access (Pages)
  const [isAllRoutes, setIsAllRoutes] = useState(true);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  // Step 5: Access Duration
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Step 6: Security Setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: workspaces = [] } = useQuery({
    queryKey: ["organizer_workspaces"],
    queryFn: async () => {
      try {
        return await getUserWorkspaces();
      } catch {
        return [];
      }
    },
  });

  const { data: platformModules = [] } = usePlatformModules();

  const MODULE_ROUTES_MAP: Record<string, { id: string; label: string; path: string }[]> = {
    "Dashboard": [
      { id: "dashboard:view", label: "View Dashboard", path: "/" }
    ],
    "Events": [
      { id: "events:view", label: "View Events List", path: "/events" },
      { id: "events:create", label: "Create Event", path: "/events/create-event" },
      { id: "events:manage", label: "Manage Event Settings", path: "/events/:id" },
    ],
    "Cinema / Theater": [
      { id: "cinema:view", label: "View Cinemas", path: "/Cinema" },
      { id: "cinema:create", label: "Create Cinema", path: "/Cinema/create" },
      { id: "cinema:movies", label: "Manage Movies", path: "/Cinema/movies" },
    ],
    "Spaces": [
      { id: "spaces:view", label: "View Spaces", path: "/spaces" },
      { id: "spaces:create", label: "Create Space", path: "/spaces/create-space" },
    ],
    "Venue Listings": [
      { id: "venues:view", label: "View Venues", path: "/venues" },
      { id: "venues:create", label: "Create Venue", path: "/venues/create-venue" },
    ],
    "Experiences": [
      { id: "experiences:view", label: "View Experiences", path: "/experiences" },
      { id: "experiences:create", label: "Create Experience", path: "/experiences/create-experience" },
    ],
    "RSVPs": [
      { id: "rsvps:view", label: "View RSVPs", path: "/rsvps" },
      { id: "rsvps:create", label: "Create RSVP Form", path: "/rsvps/create" },
    ],
    "Settings": [
      { id: "settings:view", label: "View Settings", path: "/settings" },
    ],
    "Users": [
      { id: "users:view", label: "View Users", path: "/users" },
      { id: "users:create", label: "Add User", path: "/users/add-user" },
    ],
    "Page Builder": [
      { id: "pages:builder", label: "Page Builder", path: "/page-builder" },
    ],
    "Badge Designer": [
      { id: "badge:designer", label: "Badge Designer", path: "/badge-designer" },
    ],
    "Venue Designer": [
      { id: "venue:designer", label: "Venue Designer", path: "/venue-designer" },
    ],
    "Withdrawals": [
      { id: "withdrawals:view", label: "View Withdrawals", path: "/withdrawals" },
    ]
  };

  function getRoutesForModule(module: any) {
    if (MODULE_ROUTES_MAP[module.label]) return MODULE_ROUTES_MAP[module.label];
    return [
      { id: `${module.id}:view`, label: `View ${module.label}`, path: `/${module.href || module.id}` }
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

  const addMutation = useMutation({
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
      return addWorkspaceUser({
        data: { ...payload, image: finalImage },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success("User added successfully! An invitation has been sent.");
      navigate({ to: `/dashboard/${workspaceSlug}/users` });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add user");
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

  const validateStep1 = () => {
    if (!name.trim()) { toast.error("Name is required"); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required"); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!isAllWorkspaces && selectedWorkspaces.length === 0) {
      toast.error("Please select at least one workspace"); return false;
    }
    return true;
  };

  const validateStep3 = () => true;

  const validateStep4 = () => {
    if (!isAllRoutes && selectedRoutes.length === 0) {
      toast.error("Please select at least one route access"); return false;
    }
    return true;
  };

  const validateStep5 = () => {
    if (isTemporary && !expiresAt) {
      toast.error("Please set an expiration date for temporary access"); return false;
    }
    return true;
  };

  const validateStep6 = () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters"); return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match"); return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    if (step === 5 && !validateStep5()) return;
    if (step === 6 && !validateStep6()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleSubmit = () => {
    addMutation.mutate({
      name,
      email,
      password,
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
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleWorkspace = (id: string) => {
    setSelectedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const toggleRoute = (path: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const defaultAvatar = name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=f97316`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=user&backgroundColor=f3f4f6`;

  const displayImage = image || defaultAvatar;

  const sidebarSteps = [
    { n: 1, label: "Profile", desc: "Name & Avatar", icon: User },
    { n: 2, label: "Workspaces", desc: "Workspace Access", icon: Building2 },
    { n: 3, label: "Modules", desc: "Module Access", icon: Puzzle },
    { n: 4, label: "App Routes", desc: "Route Access", icon: FileText },
    { n: 5, label: "Duration", desc: "Access Duration", icon: Clock },
    { n: 6, label: "Security", desc: "Password Setup", icon: Lock },
    { n: 7, label: "Review", desc: "Confirm Details", icon: Eye },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar for Desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border/60 bg-secondary/10 p-6 md:flex overflow-y-auto">
        <div className="mb-8">
          <Link to={`/dashboard/${workspaceSlug}/users`}>
            <Button variant="ghost" className="rounded-full gap-2 -ml-3 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Users
            </Button>
          </Link>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Add New User</h2>
          <p className="text-sm text-muted-foreground">Follow the steps to configure the new user.</p>
        </div>
        <div className="space-y-4">
          {sidebarSteps.map((s) => (
            <div key={s.n} className="relative flex items-start gap-4">
              {/* Line connector */}
              {s.n < TOTAL_STEPS && (
                <div 
                  className={`absolute left-[1.125rem] top-10 h-full w-[2px] -translate-x-1/2 ${
                    step > s.n ? "bg-primary" : "bg-border/60"
                  }`} 
                />
              )}
              <div 
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  step === s.n
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                    : step > s.n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-muted-foreground"
                }`}
              >
                {step > s.n ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <div className={`mt-1 flex flex-col ${step === s.n ? "opacity-100" : "opacity-60"}`}>
                <span className={`text-sm font-semibold ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to={`/dashboard/${workspaceSlug}/users`}>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-bold">Add User</h1>
            <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
        <div className="h-1 bg-border/40">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 p-6 pb-32 md:p-10 md:pb-40 max-w-4xl mx-auto w-full">
        {/* ========== STEP 1: Basic Info & Avatar ========== */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
              <p className="text-muted-foreground mt-1">
                Set up the user's basic information and choose their avatar.
              </p>
            </div>

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
                  <ImageIcon className="h-4 w-4" />
                  Choose Avatar
                </Button>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileUpload} />
                  <div className="inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-medium hover:bg-secondary/80 transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload Photo
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
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Pick a DiceBear avatar or upload a custom photo</p>
            </div>

            {/* Form Fields */}
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </h3>

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
                          <User className="h-4 w-4 text-muted-foreground" />
                          Normal User — Standard workspace access
                        </span>
                      </SelectItem>
                      <SelectItem value="contributor">
                        <span className="flex items-center gap-2">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          Contributor — Can create and edit content
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== STEP 2: Workspace Access ========== */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Workspace Access</h2>
              <p className="text-muted-foreground mt-1">
                Control which workspaces this user can access.
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isAllWorkspaces ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
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
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  !isAllWorkspaces ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
                onClick={() => setIsAllWorkspaces(false)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Specific Workspaces</p>
                    <p className="text-sm text-muted-foreground">Limit access to selected workspaces only</p>
                  </div>
                  {!isAllWorkspaces && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>

              {!isAllWorkspaces && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-2">
                  {workspaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">No workspaces available.</p>
                  ) : (
                    workspaces.map((ws: any) => (
                      <div
                        key={ws.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedWorkspaces.includes(ws.id)
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-border"
                        }`}
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
          </div>
        )}

        {/* ========== STEP 3: Module Access ========== */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Module Access</h2>
              <p className="text-muted-foreground mt-1">
                Select specific tools and features this user is allowed to use.
              </p>
            </div>

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
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-border bg-card"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        {Icon ? <Icon className="h-5 w-5" /> : <Puzzle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{mod.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{mod.desc}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary border-primary" : "border-border"
                      }`}>
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
          </div>
        )}

        {/* ========== STEP 4: Route Access ========== */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">App Route Access</h2>
              <p className="text-muted-foreground mt-1">
                Control which specific application features this user is allowed to access within the selected modules.
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
              <div
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isAllRoutes ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
                onClick={() => setIsAllRoutes(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">All Routes</p>
                    <p className="text-sm text-muted-foreground">Access to all features inside their assigned modules</p>
                  </div>
                  {isAllRoutes && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  !isAllRoutes ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
                onClick={() => setIsAllRoutes(false)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Specific Routes</p>
                    <p className="text-sm text-muted-foreground">Limit access to selected features only</p>
                  </div>
                  {!isAllRoutes && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>

              {!isAllRoutes && (
                <div className="space-y-6 pt-2 pl-2">
                  {selectedModules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Please go back to Step 3 and select at least one module first.</p>
                  ) : (
                    selectedModules.map((modId) => {
                      const mod = availableModules.find((m) => m.id === modId);
                      if (!mod) return null;
                      const routes = getRoutesForModule(mod);

                      return (
                        <div key={modId} className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                            {mod.icon && <mod.icon className="h-4 w-4 text-primary" />}
                            {mod.label} Routes
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {routes.map((route) => (
                              <div
                                key={route.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedRoutes.includes(route.path)
                                    ? "border-primary bg-primary/5"
                                    : "border-border/60 hover:border-border"
                                }`}
                                onClick={() => toggleRoute(route.path)}
                              >
                                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm truncate block">{route.label}</span>
                                  <span className="text-xs text-muted-foreground block truncate font-mono">{route.path}</span>
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
          </div>
        )}

        {/* ========== STEP 5: Access Duration ========== */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Access Duration</h2>
              <p className="text-muted-foreground mt-1">
                Will this user need permanent access, or temporary access for a specific period?
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  !isTemporary ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
                onClick={() => setIsTemporary(false)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Permanent Access</p>
                      <p className="text-sm text-muted-foreground">No expiration — access until manually revoked</p>
                    </div>
                  </div>
                  {!isTemporary && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isTemporary ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                }`}
                onClick={() => setIsTemporary(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Temporary Access</p>
                      <p className="text-sm text-muted-foreground">Set a date when access automatically expires</p>
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
          </div>
        )}

        {/* ========== STEP 6: Security ========== */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Security Setup</h2>
              <p className="text-muted-foreground mt-1">
                Configure the initial password for the user. They can change it later.
              </p>
            </div>
            
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Account Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-password">Initial Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="h-11 rounded-xl bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-confirm-password">Confirm Password *</Label>
                  <Input
                    id="user-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="h-11 rounded-xl bg-secondary/50"
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40">
                💡 The user will receive an invitation email with this initial password and a link to activate their account.
              </p>
            </div>
          </div>
        )}

        {/* ========== STEP 7: Review & Confirm ========== */}
        {step === 7 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Review & Confirm</h2>
              <p className="text-muted-foreground mt-1">
                Double-check the details before creating the user account.
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
              {/* User summary card */}
              <div className="flex items-center gap-5 p-5 bg-secondary/30 rounded-2xl border border-border/40">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border/60 shrink-0 bg-secondary">
                  <img src={displayImage} alt={name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{name || "—"}</p>
                  <p className="text-muted-foreground">{email || "—"}</p>
                  <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {role === "contributor" ? <Pencil className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Building2 className="h-4 w-4" /> Workspace Access
                  </h4>
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 min-h-[60px]">
                    {isAllWorkspaces ? (
                      <p className="font-medium">All Workspaces</p>
                    ) : selectedWorkspaces.length === 0 ? (
                      <p className="text-muted-foreground text-sm">None selected</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedWorkspaces.map((wsId) => {
                          const ws = workspaces.find((w: any) => w.id === wsId);
                          return (
                            <span key={wsId} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                              {ws?.name || wsId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Clock className="h-4 w-4" /> Access Duration
                  </h4>
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 min-h-[60px]">
                    {isTemporary && expiresAt ? (
                      <div>
                        <p className="font-medium">Temporary</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {new Date(expiresAt).toLocaleDateString("en-US", { dateStyle: "long" })}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">Permanent</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Puzzle className="h-4 w-4" /> Module Access ({selectedModules.length})
                  </h4>
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 min-h-[60px]">
                    {selectedModules.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No modules selected — user will have no module access</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedModules.map((modId) => {
                          const m = availableModules.find((x) => x.id === modId);
                          const Icon = m?.icon || Puzzle;
                          return (
                            <span key={modId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-medium">
                              <Icon className="h-4 w-4" /> {m?.label || modId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <FileText className="h-4 w-4" /> Route Access
                  </h4>
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40 min-h-[60px]">
                    {isAllRoutes ? (
                      <p className="font-medium">All Authorized Module Routes</p>
                    ) : selectedRoutes.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No routes selected — user cannot access specific application features</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedRoutes.map((routePath) => {
                          // Find route label across all modules
                          let rLabel = routePath;
                          for (const modRoutes of Object.values(MODULE_ROUTES_MAP)) {
                            const found = modRoutes.find(r => r.path === routePath);
                            if (found) { rLabel = found.label; break; }
                          }

                          return (
                            <span key={routePath} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-medium">
                              <FileText className="h-4 w-4" /> {rLabel}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>Password configured.</strong> An email will be sent to <strong>{email}</strong> containing their password and an activation link.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons (Fixed to Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 md:left-72 z-30 bg-background/80 backdrop-blur-md border-t border-border/60 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2 rounded-xl"
              onClick={() => step > 1 ? setStep(step - 1) : navigate({ to: `/dashboard/${workspaceSlug}/users` })}
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                className="gap-2 rounded-xl px-8 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={handleNext}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="gap-2 rounded-xl px-8 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={handleSubmit}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

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

            {/* Upload own photo option */}
            <div className="p-4 border-b border-border/60 bg-secondary/10">
              <label className="cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileUpload} />
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload custom photo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or GIF up to 5MB</p>
                </div>
              </label>
            </div>

            {/* Category tabs */}
            <div className="p-4 border-b border-border/60 bg-secondary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2">
                {AVATAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar grid */}
            <div className="p-5 grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    setImage(av);
                    setIsAvatarPickerOpen(false);
                  }}
                  className={`aspect-square w-full rounded-2xl border-2 flex items-center justify-center transition-all overflow-hidden ${
                    image === av
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                      : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-105"
                  }`}
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
