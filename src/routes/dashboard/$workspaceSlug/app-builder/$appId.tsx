import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Settings2,
  Save,
  Loader2,
  ScanLine,
  Users,
  CreditCard,
  MapPin,
  CalendarDays,
  UserCheck,
  Plus,
  Trash2,
  GripVertical,
  LayoutGrid,
  Lock,
  Activity,
  Wallet,
  CalendarCheck,
  UserPlus,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import {
  getAppById,
  updateWorkspaceApp,
  upsertAppModules,
  deleteAppModule,
} from "@/api/app-studio";
import { getWorkspaceEvents, updateEvent } from "@/api/events";
import { uploadFormData } from "@/api/storage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/dashboard/$workspaceSlug/app-builder/$appId")({
  component: AppBuilderStudio,
});

const AVAILABLE_MODULES = [
  { type: "scanner", title: "Access Scanner", icon: ScanLine, desc: "Scan tickets and badges" },
  { type: "attendees", title: "Event Attendees", icon: Users, desc: "Manage registered attendees" },
  { type: "transactions", title: "Sales & Transactions", icon: CreditCard, desc: "View payments" },
  { type: "venues", title: "Venues", icon: MapPin, desc: "Manage locations" },
  { type: "bookings", title: "Bookings", icon: CalendarDays, desc: "View reservations" },
  { type: "members", title: "Team Members", icon: UserCheck, desc: "Workspace staff directory" },
  { type: "stats", title: "Live Stats", icon: Activity, desc: "Checked-in & scans per hour" },
  { type: "wallet", title: "Wallet & Withdraw", icon: Wallet, desc: "Manage balances" },
  { type: "events_list", title: "Event Ticketing", icon: Ticket, desc: "Browse events and select tickets" },
  { type: "venue_bookings", title: "Venue Bookings", icon: CalendarCheck, desc: "Manage venue bookings" },
  { type: "memberships", title: "Memberships", icon: UserPlus, desc: "Register membership users" },
];

function SortableModuleItem({ module, isSelected, onClick, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const Icon = AVAILABLE_MODULES.find((m) => m.type === module.type)?.icon || LayoutGrid;

  if (module.type === "stats") {
    const config = module.config || {};
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        className={`relative w-full space-y-4 p-4 rounded-3xl border bg-card/60 backdrop-blur-xl transition-all group ${
          isSelected ? "border-primary shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50"
        }`}
      >
        <div {...attributes} {...listeners} className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-2">Live Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {config.show_checked_in !== false && (
            <div className="bg-background/60 border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
              <p className="text-3xl font-black mb-0.5 tracking-tighter">0</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Checked In</p>
            </div>
          )}
          {config.show_scans_per_hour !== false && (
            <div className="bg-background/60 border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
              <p className="text-3xl font-black mb-0.5 tracking-tighter">0</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Scans/Hour</p>
            </div>
          )}
          {config.show_tickets_scanned && (
            <div className="bg-background/60 border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
              <p className="text-3xl font-black mb-0.5 tracking-tighter">0</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Scanned</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`relative w-full bg-background/60 backdrop-blur-xl border rounded-[2rem] p-5 text-left transition-all group ${
        isSelected ? "border-primary shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-0 right-0 p-5 opacity-5 transform translate-x-4 -translate-y-4 pointer-events-none">
        <Icon className="h-20 w-20 text-foreground" />
      </div>
      <div className="relative z-10 flex flex-col gap-3 ml-2">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-black text-lg tracking-tight mb-0.5">{module.title}</h4>
          <p className="text-muted-foreground text-xs font-medium">
             {module.type === "events_list" ? "Select tickets" : "Open Module"}
          </p>
        </div>
      </div>
    </div>
  );
}

function getDefaultConfig(type: string) {
  switch (type) {
    case "scanner":
      return { scan_tickets: true, scan_vouchers: true, scan_badges: true, record_entry: true, visibility_roles: "" };
    case "attendees":
      return { view_contact: false, allow_edit: false, visibility_roles: "" };
    case "transactions":
      return { view_financials: false, allow_refunds: false, visibility_roles: "" };
    case "stats":
      return { show_checked_in: true, show_scans_per_hour: true, show_tickets_scanned: false, visibility_roles: "" };
    default:
      return { visibility_roles: "" };
  }
}

function AppBuilderStudio() {
  const { workspaceSlug, appId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appData, isLoading } = useQuery({
    queryKey: ["app-studio", appId],
    queryFn: () => getAppById({ data: { id: appId } } as any),
    enabled: !!appId,
  });

  const [previewScreen, setPreviewScreen] = useState<"login" | "home">("home");
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number | null>(null);
  const { activeWorkspace } = useWorkspace();
  const [appConfig, setAppConfig] = useState({
    name: "",
    description: "",
    theme_color: "#f97316",
    logo_url: "",
    is_active: true,
  });
  const [brandingConfig, setBrandingConfig] = useState({
    font_family: "inter",
    background_color: "#ffffff",
    dashboard_columns: "2",
    mobile_layout: "grid",
    logout_style: "subtle"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [assignedEventId, setAssignedEventId] = useState<string>("");

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  useEffect(() => {
    if (appData) {
      setAppConfig({
        name: appData.name || "",
        description: appData.description || "",
        theme_color: appData.theme_color || "#f97316",
        logo_url: appData.logo_url || "",
        is_active: appData.is_active ?? true,
      });
      
      const parsedModules = (appData.app_modules || []).map((m: any) => ({
          ...m,
          config: typeof m.config === "string" ? JSON.parse(m.config) : m.config || {},
      }));

      const bConfigModule = parsedModules.find((m: any) => m.type === "branding_config");
      if (bConfigModule) {
        setBrandingConfig({
          font_family: bConfigModule.config.font_family || "inter",
          background_color: bConfigModule.config.background_color || "#ffffff",
          dashboard_columns: bConfigModule.config.dashboard_columns || "2",
          mobile_layout: bConfigModule.config.mobile_layout || "grid",
          logout_style: bConfigModule.config.logout_style || "subtle"
        });
      }

      setModules(parsedModules.filter((m: any) => m.type !== "branding_config"));
    }
  }, [appData]);

  useEffect(() => {
    if (events && events.length > 0 && appId) {
      const linkedEvent = events.find((e: any) => e.app_id === appId);
      if (linkedEvent) setAssignedEventId(linkedEvent.id);
    }
  }, [events, appId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateWorkspaceApp({
        data: {
          id: appId,
          set: {
            name: appConfig.name,
            description: appConfig.description,
            theme_color: appConfig.theme_color,
            logo_url: appConfig.logo_url,
            is_active: appConfig.is_active,
          },
        },
      } as any);

      const modulesToUpsert = modules.map((m, idx) => ({
        id: m.id,
        app_id: appId,
        type: m.type,
        title: m.title,
        icon: m.icon,
        config: m.config,
        order: idx + 1,
      }));

      const brandingModId = appData?.app_modules?.find((m: any) => m.type === "branding_config")?.id || crypto.randomUUID();
      
      modulesToUpsert.unshift({
        id: brandingModId,
        app_id: appId,
        type: "branding_config",
        title: "Branding Config",
        icon: "Settings",
        config: brandingConfig,
        order: 0
      });

      if (modulesToUpsert.length > 0) {
        await upsertAppModules({ data: { objects: modulesToUpsert } } as any);
      }

      if (assignedEventId) {
        await updateEvent({ data: { id: assignedEventId, set: { app_id: appId } } } as any);
      }
    },
    onSuccess: () => {
      toast.success("App saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["app-studio", appId] });
      // Reset isNew flag
      setModules(modules.map(m => ({ ...m, isNew: false })));
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save app");
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "app_logos");
      
      const res = await uploadFormData({ data: formData } as any);
      setAppConfig({ ...appConfig, logo_url: res.url });
      toast.success("Logo uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddModule = (modType: any) => {
    const newMod = {
      id: crypto.randomUUID(),
      type: modType.type,
      title: modType.title,
      icon: modType.icon.name || "LayoutGrid",
      config: getDefaultConfig(modType.type),
      isNew: true,
    };
    setModules([...modules, newMod]);
    setSelectedModuleIdx(modules.length);
  };

  const handleDeleteModule = async (idx: number, modId: string) => {
    const isNew = modules[idx].isNew;
    if (!isNew) {
      try {
        await deleteAppModule({ data: { id: modId } } as any);
      } catch (err: any) {
        toast.error("Failed to delete module from database");
        return;
      }
    }
    const newMods = [...modules];
    newMods.splice(idx, 1);
    setModules(newMods);
    if (selectedModuleIdx === idx) setSelectedModuleIdx(null);
    else if (selectedModuleIdx && selectedModuleIdx > idx) setSelectedModuleIdx(selectedModuleIdx - 1);
  };

  const updateSelectedModuleConfig = (key: string, value: any) => {
    if (selectedModuleIdx === null) return;
    const newMods = [...modules];
    newMods[selectedModuleIdx].config = {
      ...newMods[selectedModuleIdx].config,
      [key]: value,
    };
    setModules(newMods);
  };

  const updateSelectedModuleProp = (key: string, value: any) => {
    if (selectedModuleIdx === null) return;
    const newMods = [...modules];
    newMods[selectedModuleIdx][key] = value;
    setModules(newMods);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        // Ensure selectedModuleIdx stays in sync if the selected module was moved
        if (selectedModuleIdx === oldIndex) {
           setSelectedModuleIdx(newIndex);
        } else if (selectedModuleIdx !== null) {
           // Adjust if it was shifted
           if (oldIndex < selectedModuleIdx && newIndex >= selectedModuleIdx) setSelectedModuleIdx(selectedModuleIdx - 1);
           else if (oldIndex > selectedModuleIdx && newIndex <= selectedModuleIdx) setSelectedModuleIdx(selectedModuleIdx + 1);
        }
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedModule = selectedModuleIdx !== null ? modules[selectedModuleIdx] : null;

  return (
    <div className="flex h-screen flex-col bg-muted/20 font-sans fixed inset-0 z-50">
      {/* Top Navigation / Toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background px-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/$workspaceSlug/app-builder" params={{ workspaceSlug }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/50 mx-1" />
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{appConfig.name || "Untitled App"}</span>
            <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-2">Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <Label htmlFor="active-toggle" className="text-xs text-muted-foreground">App Status</Label>
            <Switch
              id="active-toggle"
              checked={appConfig.is_active}
              onCheckedChange={(c) => setAppConfig({ ...appConfig, is_active: c })}
              className="scale-90"
            />
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            size="sm"
            className="gap-2 rounded-lg shadow-sm px-4"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Changes
          </Button>
        </div>
      </header>

      {/* Main Figma-like Workspace */}
      <div className="flex flex-1 overflow-hidden bg-muted/30">

        {/* Left Panel - Layers & Tools */}
        <aside className="w-[280px] shrink-0 border-r border-border/50 bg-background flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">UI Components</h2>
            <p className="text-[11px] text-muted-foreground">Click to add modules to the canvas.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
            {AVAILABLE_MODULES.map((mod) => (
              <div
                key={mod.type}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-secondary hover:border-border/50 cursor-pointer transition-colors group"
                onClick={() => handleAddModule(mod)}
              >
                <div className="text-muted-foreground group-hover:text-foreground">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{mod.title}</p>
                </div>
                <Plus className="h-3 w-3 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </aside>

        {/* Center Panel - Canvas */}
        <main className="flex-1 overflow-y-auto flex flex-col relative" onClick={() => setSelectedModuleIdx(null)}>
          <div className="absolute top-6 inset-x-0 flex justify-center z-10 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-md shadow-sm border border-border/50 rounded-full p-1 flex pointer-events-auto">
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${previewScreen === "login" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={(e) => { e.stopPropagation(); setPreviewScreen("login"); }}
              >
                Login State
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${previewScreen === "home" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={(e) => { e.stopPropagation(); setPreviewScreen("home"); }}
              >
                Authenticated State
              </button>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center justify-center p-8 py-24 min-h-max">
            <div 
              className="w-[375px] h-[812px] bg-card rounded-[3rem] shadow-2xl border-[12px] border-[#1e1e1e] relative overflow-hidden flex flex-col shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
                <div className="w-32 h-6 bg-[#1e1e1e] rounded-b-[18px]"></div>
              </div>

              {previewScreen === "login" ? (
                <div 
                  className="h-full w-full flex flex-col items-center justify-center text-foreground px-6 relative overflow-hidden"
                  style={{ 
                    "--color-primary": appConfig.theme_color,
                    backgroundColor: brandingConfig.background_color,
                    fontFamily: brandingConfig.font_family === "sans" ? "sans-serif" : brandingConfig.font_family 
                  } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="z-10 w-full flex flex-col items-center">
                    {appConfig.logo_url ? (
                      <img
                        src={appConfig.logo_url}
                        alt="Logo"
                        className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] border border-black/10"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] border border-primary/20">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <h1 className="text-2xl font-bold mb-1 text-center">{appConfig.name || "App Name"}</h1>
                    <p className="text-muted-foreground text-sm mb-8 text-center">
                      Enter your 9-digit security PIN
                    </p>

                    <div className="flex gap-2 mb-10">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-black/10 dark:bg-white/20" />
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div key={num} className="w-14 h-14 rounded-full bg-black/5 border border-black/10 text-xl font-medium flex items-center justify-center mx-auto">
                          {num}
                        </div>
                      ))}
                      <div />
                      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 text-xl font-medium flex items-center justify-center mx-auto">0</div>
                      <div className="w-14 h-14 rounded-full text-muted-foreground text-sm font-medium flex items-center justify-center mx-auto">DEL</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex flex-col h-full relative overflow-hidden" 
                  style={{ 
                    "--color-primary": appConfig.theme_color,
                    backgroundColor: brandingConfig.background_color,
                    fontFamily: brandingConfig.font_family === "sans" ? "sans-serif" : brandingConfig.font_family 
                  } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
                  <div className="absolute top-0 left-0 right-0 h-64 bg-primary/10 blur-[80px] pointer-events-none -z-10 rounded-full mix-blend-screen" />
                  
                  <header className="px-5 pt-12 pb-2 flex items-center justify-between relative z-10">
                    <div className="p-2 -ml-2 text-foreground/60 bg-secondary/50 backdrop-blur-md rounded-full border border-border/50">
                      <ArrowLeft className="h-5 w-5" />
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                      <span className="text-primary text-[10px] font-black tracking-widest uppercase">Live</span>
                    </div>
                  </header>

                  <main className="flex-1 px-5 pt-4 pb-20 relative z-10 overflow-y-auto no-scrollbar space-y-6">
                    <div>
                      <h1 className="text-3xl font-black mb-1 leading-tight tracking-tight">
                        {appConfig.name || "App Name"}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-wider rounded-md border border-border/50">
                          Staff Role
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pb-8">
                      {modules.length === 0 ? (
                        <div className="bg-secondary/30 border border-dashed border-border/50 rounded-3xl p-6 text-center mt-8">
                          <LayoutGrid className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                          <h4 className="font-semibold text-sm mb-1">Canvas is empty</h4>
                          <p className="text-muted-foreground text-xs">
                            Add modules from the left panel.
                          </p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={modules.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className={`grid gap-3 ${
                              brandingConfig.dashboard_columns === "1" ? "grid-cols-1" :
                              brandingConfig.dashboard_columns === "2" ? "grid-cols-2" :
                              brandingConfig.dashboard_columns === "3" ? "grid-cols-3" :
                              "grid-cols-2" // fallback in small container
                            }`}>
                              {modules.map((mod, idx) => (
                                <SortableModuleItem 
                                  key={mod.id} 
                                  module={mod} 
                                  isSelected={selectedModuleIdx === idx}
                                  onClick={() => setSelectedModuleIdx(idx)}
                                  onRemove={() => handleDeleteModule(idx, mod.id)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                      
                      <div className="pt-6 flex justify-center">
                        <Button 
                          variant={brandingConfig.logout_style === "prominent" ? "default" : "outline"} 
                          className="rounded-full shadow-sm"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </main>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel - Properties Inspector */}
        <aside className="w-[320px] shrink-0 border-l border-border/50 bg-background flex flex-col">
          <div className="flex bg-muted p-1 m-3 rounded-lg">
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${!selectedModule ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setSelectedModuleIdx(null)}
            >
              App
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${selectedModule ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              disabled={!selectedModule}
            >
              Module
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {!selectedModule ? (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
                  <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                  <TabsTrigger value="branding" className="text-xs">Branding</TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">App Name</Label>
                      <Input
                        value={appConfig.name}
                        onChange={(e) => setAppConfig({ ...appConfig, name: e.target.value })}
                        placeholder="My Portal"
                        className="h-8 text-sm bg-secondary/50 border-border/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={appConfig.description}
                        onChange={(e) => setAppConfig({ ...appConfig, description: e.target.value })}
                        placeholder="Brief description..."
                        className="text-sm bg-secondary/50 border-border/50 resize-none h-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-sm font-bold">Event Link (Optional)</h3>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Assigned Event</Label>
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        value={assignedEventId}
                        onChange={(e) => setAssignedEventId(e.target.value)}
                      >
                        <option value="">No event linked</option>
                        {events.map((evt: any) => (
                          <option key={evt.id} value={evt.id}>{evt.title}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        Link this app to an event to use it as the Event Staff Portal.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">App Logo (Max 5MB)</Label>
                      <div className="flex items-center gap-3">
                        {appConfig.logo_url && (
                          <img src={appConfig.logo_url} alt="Logo" className="w-10 h-10 rounded-md object-cover border border-border/50" />
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                            className="h-8 text-xs file:h-8 file:-my-1.5 file:px-3 file:-ml-3 file:bg-secondary file:text-secondary-foreground file:border-0 file:mr-3 cursor-pointer"
                          />
                        </div>
                      </div>
                      {isUploading && <p className="text-[10px] text-primary animate-pulse">Uploading...</p>}
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <Label className="text-xs">Primary Theme Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={appConfig.theme_color}
                          onChange={(e) => setAppConfig({ ...appConfig, theme_color: e.target.value })}
                          className="h-8 w-12 p-0 border-0 bg-transparent rounded cursor-pointer"
                        />
                        <Input
                          value={appConfig.theme_color}
                          onChange={(e) => setAppConfig({ ...appConfig, theme_color: e.target.value })}
                          className="h-8 text-xs font-mono uppercase bg-secondary/50 border-border/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <Label className="text-xs">Page Background Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={brandingConfig.background_color}
                          onChange={(e) => setBrandingConfig({ ...brandingConfig, background_color: e.target.value })}
                          className="h-8 w-12 p-0 border-0 bg-transparent rounded cursor-pointer"
                        />
                        <Input
                          value={brandingConfig.background_color}
                          onChange={(e) => setBrandingConfig({ ...brandingConfig, background_color: e.target.value })}
                          className="h-8 text-xs font-mono uppercase bg-secondary/50 border-border/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <Label className="text-xs">Global Font Family</Label>
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        value={brandingConfig.font_family}
                        onChange={(e) => setBrandingConfig({ ...brandingConfig, font_family: e.target.value })}
                      >
                        <option value="inter">Inter (Default)</option>
                        <option value="roboto">Roboto</option>
                        <option value="sans">System Sans</option>
                        <option value="serif">System Serif</option>
                        <option value="mono">System Mono</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Dashboard Columns (Grid)</Label>
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        value={brandingConfig.dashboard_columns}
                        onChange={(e) => setBrandingConfig({ ...brandingConfig, dashboard_columns: e.target.value })}
                      >
                        <option value="1">1 Column (List)</option>
                        <option value="2">2 Columns</option>
                        <option value="3">3 Columns</option>
                        <option value="4">4 Columns</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Controls how modules are arranged on tablets and desktops.</p>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <Label className="text-xs">Mobile Layout</Label>
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        value={brandingConfig.mobile_layout}
                        onChange={(e) => setBrandingConfig({ ...brandingConfig, mobile_layout: e.target.value })}
                      >
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Layout</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <Label className="text-xs">Logout Button Style</Label>
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        value={brandingConfig.logout_style}
                        onChange={(e) => setBrandingConfig({ ...brandingConfig, logout_style: e.target.value })}
                      >
                        <option value="subtle">Subtle (Outline)</option>
                        <option value="prominent">Prominent (Solid Color)</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center text-primary">
                      {(() => {
                         const ModIcon = AVAILABLE_MODULES.find(m => m.type === selectedModule.type)?.icon || LayoutGrid;
                         return <ModIcon className="h-4 w-4" />
                      })()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-none mb-1">Properties</h3>
                      <p className="text-[10px] text-muted-foreground capitalize">{selectedModule.type}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Display Title</Label>
                    <Input
                      value={selectedModule.title}
                      onChange={(e) => updateSelectedModuleProp("title", e.target.value)}
                      className="h-8 text-sm bg-secondary/50 border-border/50"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs">Visibility Rules (Roles)</Label>
                    <Input
                      value={selectedModule.config?.visibility_roles || ""}
                      onChange={(e) => updateSelectedModuleConfig("visibility_roles", e.target.value)}
                      placeholder="e.g. admin, scanner"
                      className="h-8 text-sm bg-secondary/50 border-border/50"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">Comma separated list of roles. Leave empty to allow all.</p>
                  </div>

                  {/* Module Specific Settings */}
                  {selectedModule.type === "scanner" && (
                    <div className="space-y-3 pt-3 border-t border-border/50 mt-4">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Scanner Options</Label>
                      {["scan_tickets", "scan_vouchers", "scan_badges", "record_entry"].map((opt) => (
                        <div key={opt} className="flex items-center justify-between">
                          <Label className="text-xs font-normal capitalize">{opt.replace("_", " ")}</Label>
                          <Switch
                            checked={selectedModule.config?.[opt] ?? true}
                            onCheckedChange={(c) => updateSelectedModuleConfig(opt, c)}
                            className="scale-75 origin-right"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedModule.type === "attendees" && (
                    <div className="space-y-3 pt-3 border-t border-border/50 mt-4">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Guest List Options</Label>
                      {["view_contact", "allow_edit"].map((opt) => (
                        <div key={opt} className="flex items-center justify-between">
                          <Label className="text-xs font-normal capitalize">{opt.replace("_", " ")}</Label>
                          <Switch
                            checked={selectedModule.config?.[opt] ?? false}
                            onCheckedChange={(c) => updateSelectedModuleConfig(opt, c)}
                            className="scale-75 origin-right"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedModule.type === "transactions" && (
                    <div className="space-y-3 pt-3 border-t border-border/50 mt-4">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Transaction Options</Label>
                      {["view_financials", "allow_refunds"].map((opt) => (
                        <div key={opt} className="flex items-center justify-between">
                          <Label className="text-xs font-normal capitalize">{opt.replace("_", " ")}</Label>
                          <Switch
                            checked={selectedModule.config?.[opt] ?? false}
                            onCheckedChange={(c) => updateSelectedModuleConfig(opt, c)}
                            className="scale-75 origin-right"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedModule.type === "stats" && (
                    <div className="space-y-3 pt-3 border-t border-border/50 mt-4">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Stat Cards</Label>
                      {["show_checked_in", "show_scans_per_hour", "show_tickets_scanned"].map((opt) => (
                        <div key={opt} className="flex items-center justify-between">
                          <Label className="text-xs font-normal capitalize">{opt.replace(/_/g, " ").replace("show ", "")}</Label>
                          <Switch
                            checked={selectedModule.config?.[opt] ?? (opt !== "show_tickets_scanned")}
                            onCheckedChange={(c) => updateSelectedModuleConfig(opt, c)}
                            className="scale-75 origin-right"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
