import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Settings2,
  Save,
  Loader2,
  Smartphone,
  ScanLine,
  Users,
  CreditCard,
  MapPin,
  CalendarDays,
  UserCheck,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Lock,
  Activity,
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
];

function AppBuilderStudio() {
  const { workspaceSlug, appId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appData, isLoading } = useQuery({
    queryKey: ["app-studio", appId],
    queryFn: () => getAppById({ data: { id: appId } } as any),
    enabled: !!appId,
  });

  const [activeTab, setActiveTab] = useState<"modules" | "settings" | "permissions">("modules");
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
  const [assignedEventId, setAssignedEventId] = useState<string>("");

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  // Load initial data
  useEffect(() => {
    if (appData) {
      setAppConfig({
        name: appData.name || "",
        description: appData.description || "",
        theme_color: appData.theme_color || "#f97316",
        logo_url: appData.logo_url || "",
        is_active: appData.is_active ?? true,
      });
      setModules(
        (appData.app_modules || []).map((m: any) => ({
          ...m,
          // ensure config is parsed if it came as string somehow
          config: typeof m.config === "string" ? JSON.parse(m.config) : m.config || {},
        }))
      );
    }
  }, [appData]);

  // Load the assigned event if one exists
  useEffect(() => {
    if (events && events.length > 0 && appId) {
      const linkedEvent = events.find((e: any) => e.app_id === appId);
      if (linkedEvent) setAssignedEventId(linkedEvent.id);
    }
  }, [events, appId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Save App Settings
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

      // 2. Save Modules
      const modulesToUpsert = modules.map((m, idx) => ({
        id: m.id,
        app_id: appId,
        type: m.type,
        title: m.title,
        icon: m.icon,
        config: m.config,
        order: idx,
      }));

      if (modulesToUpsert.length > 0) {
        await upsertAppModules({ data: { objects: modulesToUpsert } } as any);
      }

      // 3. Link to Event (if changed)
      if (assignedEventId) {
        await updateEvent({ data: { id: assignedEventId, set: { app_id: appId } } } as any);
      }
    },
    onSuccess: () => {
      toast.success("App saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["app-studio", appId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save app");
    },
  });

  const handleAddModule = (modType: any) => {
    const newMod = {
      id: crypto.randomUUID(),
      type: modType.type,
      title: modType.title,
      icon: modType.icon.name || "LayoutGrid", // Storing icon name as string
      config: getDefaultConfig(modType.type),
      isNew: true,
    };
    setModules([...modules, newMod]);
    setSelectedModuleIdx(modules.length);
    setActiveTab("settings");
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedModule = selectedModuleIdx !== null ? modules[selectedModuleIdx] : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-muted/20">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-card px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/$workspaceSlug/app-builder" params={{ workspaceSlug }}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">{appConfig.name || "Untitled App"}</h1>
            <p className="text-xs text-muted-foreground">App Studio Designer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <Switch
              checked={appConfig.is_active}
              onCheckedChange={(c) => setAppConfig({ ...appConfig, is_active: c })}
            />
            <span className="text-sm font-medium">{appConfig.is_active ? "Active" : "Disabled"}</span>
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="gap-2 rounded-full shadow-[var(--shadow-glow)] px-6"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save App
          </Button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar - Available Modules */}
        <aside className="w-80 border-r border-border/50 bg-card overflow-y-auto">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold text-lg">Add Modules</h2>
            <p className="text-xs text-muted-foreground mt-1">Drag or click to add to your app.</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {AVAILABLE_MODULES.map((mod) => (
              <div
                key={mod.type}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 hover:border-primary/40 cursor-pointer transition-all group"
                onClick={() => handleAddModule(mod)}
              >
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm text-primary group-hover:scale-105 transition-transform">
                  <mod.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{mod.title}</p>
                  <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </aside>

        {/* Center Canvas - Mobile Preview */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8 flex flex-col items-center">
          <div className="flex bg-secondary p-1 rounded-xl mb-6 shadow-sm">
            <button
              className={`px-5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${previewScreen === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setPreviewScreen("login")}
            >
              Login Page
            </button>
            <button
              className={`px-5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${previewScreen === "home" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setPreviewScreen("home")}
            >
              App Home
            </button>
          </div>

          <div className="w-[375px] h-[812px] bg-card rounded-[3rem] shadow-2xl border-[12px] border-foreground/10 relative overflow-hidden flex flex-col shrink-0">
            
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-foreground/10 rounded-b-xl"></div>
            </div>

            {previewScreen === "login" ? (
              <div 
                className="h-full w-full flex flex-col items-center justify-center text-foreground px-6 relative overflow-hidden bg-background"
                style={{ "--color-primary": appConfig.theme_color } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="z-10 w-full flex flex-col items-center">
                  {appConfig.logo_url ? (
                    <img
                      src={appConfig.logo_url}
                      alt="Logo"
                      className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-[0_0_30px_var(--color-primary)]/30 border border-black/10"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_var(--color-primary)]/30 border border-primary/20">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold mb-1 text-center">{appConfig.name || "App Name"}</h1>
                  <p className="text-muted-foreground text-sm mb-8 text-center">
                    Enter your 9-digit security PIN
                  </p>

                  <div className="flex gap-2 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-black/10 dark:bg-white/20"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <div
                        key={num}
                        className="w-14 h-14 rounded-full bg-black/5 border border-black/10 text-xl font-medium flex items-center justify-center mx-auto"
                      >
                        {num}
                      </div>
                    ))}
                    <div />
                    <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 text-xl font-medium flex items-center justify-center mx-auto">
                      0
                    </div>
                    <div className="w-14 h-14 rounded-full text-muted-foreground text-sm font-medium flex items-center justify-center mx-auto">
                      DEL
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="flex flex-col h-full bg-background relative overflow-hidden" 
                style={{ "--color-primary": appConfig.theme_color } as React.CSSProperties}
              >
                <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none -z-10" />
                <div className="absolute top-0 left-0 right-0 h-64 bg-primary/10 blur-[80px] pointer-events-none -z-10 rounded-full mix-blend-screen" />
                
                <header className="px-6 pt-12 pb-2 flex items-center justify-between relative z-10">
                  <div className="p-2.5 -ml-2.5 text-foreground/60 bg-secondary/50 backdrop-blur-md rounded-full border border-border/50">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                  <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                    <span className="text-primary text-xs font-black tracking-widest uppercase">Live</span>
                  </div>
                </header>

                <main className="flex-1 px-6 pt-4 pb-24 relative z-10 overflow-y-auto space-y-8 no-scrollbar">
                  <div>
                    <h1 className="text-3xl font-black mb-2 leading-tight tracking-tight">
                      {appConfig.name || "App Name"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border/50">
                        Staff Role
                      </span>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/20">
                        All Access
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                      App Modules
                    </h3>
                    {modules.length === 0 ? (
                      <div className="bg-secondary/30 border border-dashed border-border/50 rounded-[2rem] p-8 text-center">
                        <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h4 className="font-bold text-lg mb-2">No Modules Added</h4>
                        <p className="text-muted-foreground text-sm">
                          Add modules from the left panel to build your app.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {modules.map((m, idx) => {
                          const ModIcon = AVAILABLE_MODULES.find(am => am.type === m.type)?.icon || LayoutGrid;
                          return (
                            <button
                              key={m.id || idx}
                              onClick={() => {
                                setSelectedModuleIdx(idx);
                                setActiveTab("settings");
                              }}
                              className={`w-full relative overflow-hidden border rounded-[2rem] p-6 text-left transition-all group ${
                                selectedModuleIdx === idx 
                                  ? "border-primary ring-2 ring-primary/20 bg-primary shadow-[0_15px_40px_rgba(var(--color-primary),0.25)]" 
                                  : "bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/50"
                              }`}
                            >
                              <div className={`absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 ${selectedModuleIdx === idx ? "opacity-20" : ""}`}>
                                <ModIcon className={`h-24 w-24 ${selectedModuleIdx === idx ? "text-primary-foreground" : "text-foreground"}`} />
                              </div>
                              <div className="relative z-10 flex flex-col gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center border ${
                                  selectedModuleIdx === idx 
                                    ? "bg-white/20 backdrop-blur-md border-white/30 text-white" 
                                    : "bg-secondary border-border/50 text-foreground"
                                }`}>
                                  <ModIcon className="h-6 w-6" />
                                </div>
                                <div>
                                  <h4 className={`font-black text-xl tracking-tight mb-1 ${selectedModuleIdx === idx ? "text-primary-foreground" : ""}`}>
                                    {m.title}
                                  </h4>
                                  <p className={`text-sm font-medium ${selectedModuleIdx === idx ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {m.desc || "Configure this module"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </main>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Properties/Settings */}
        <aside className="w-80 border-l border-border/50 bg-card flex flex-col">
          <div className="flex p-2 border-b border-border/50 bg-secondary/20">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "modules" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("modules")}
            >
              App Setup
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "settings" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("settings")}
            >
              Module Settings
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "permissions" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("permissions")}
            >
              Access
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "modules" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <Label>App Name</Label>
                  <Input value={appConfig.name} onChange={e => setAppConfig({ ...appConfig, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={appConfig.description} onChange={e => setAppConfig({ ...appConfig, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={appConfig.theme_color} onChange={e => setAppConfig({ ...appConfig, theme_color: e.target.value })} className="w-12 h-10 p-1" />
                    <Input value={appConfig.theme_color} onChange={e => setAppConfig({ ...appConfig, theme_color: e.target.value })} className="flex-1 uppercase font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custom Logo URL</Label>
                  <Input value={appConfig.logo_url} onChange={e => setAppConfig({ ...appConfig, logo_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <Label>Assign to Event</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={assignedEventId}
                    onChange={(e) => setAssignedEventId(e.target.value)}
                  >
                    <option value="">None (Workspace App)</option>
                    {events.map((evt: any) => (
                      <option key={evt.id} value={evt.id}>{evt.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link this app design to an event so event staff can see it.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in">
                {!selectedModule ? (
                  <div className="text-center text-muted-foreground p-6 pt-12">
                    <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Select a module on the mobile preview to edit its settings.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Settings2 className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold">Module Details</h3>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg" onClick={() => handleDeleteModule(selectedModuleIdx!, selectedModule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-border/50">
                      <div className="space-y-2">
                        <Label>Display Title</Label>
                        <Input value={selectedModule.title} onChange={e => updateSelectedModuleProp("title", e.target.value)} />
                      </div>

                      {/* Dynamic config fields based on module type */}
                      {selectedModule.type === "scanner" && (
                        <div className="space-y-4 border rounded-xl p-4 bg-secondary/10">
                          <Label className="text-xs uppercase text-muted-foreground font-bold">Scanning Capabilities</Label>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Scan Tickets</Label>
                            <Switch checked={selectedModule.config.scan_tickets ?? true} onCheckedChange={c => updateSelectedModuleConfig("scan_tickets", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Scan Vouchers</Label>
                            <Switch checked={selectedModule.config.scan_vouchers ?? true} onCheckedChange={c => updateSelectedModuleConfig("scan_vouchers", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Scan Staff Badges</Label>
                            <Switch checked={selectedModule.config.scan_badges ?? false} onCheckedChange={c => updateSelectedModuleConfig("scan_badges", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Record Entry</Label>
                            <Switch checked={selectedModule.config.record_entry ?? true} onCheckedChange={c => updateSelectedModuleConfig("record_entry", c)} />
                          </div>
                        </div>
                      )}

                      {selectedModule.type === "attendees" && (
                        <div className="space-y-4 border rounded-xl p-4 bg-secondary/10">
                          <Label className="text-xs uppercase text-muted-foreground font-bold">Data Access</Label>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">View Contact Info</Label>
                            <Switch checked={selectedModule.config.view_contact ?? false} onCheckedChange={c => updateSelectedModuleConfig("view_contact", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Allow Editing</Label>
                            <Switch checked={selectedModule.config.allow_edit ?? false} onCheckedChange={c => updateSelectedModuleConfig("allow_edit", c)} />
                          </div>
                        </div>
                      )}

                      {selectedModule.type === "transactions" && (
                        <div className="space-y-4 border rounded-xl p-4 bg-secondary/10">
                          <Label className="text-xs uppercase text-muted-foreground font-bold">Permissions</Label>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">View Financials</Label>
                            <Switch checked={selectedModule.config.view_financials ?? false} onCheckedChange={c => updateSelectedModuleConfig("view_financials", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Process Refunds</Label>
                            <Switch checked={selectedModule.config.allow_refunds ?? false} onCheckedChange={c => updateSelectedModuleConfig("allow_refunds", c)} />
                          </div>
                        </div>
                      )}

                      {selectedModule.type === "stats" && (
                        <div className="space-y-4 border rounded-xl p-4 bg-secondary/10">
                          <Label className="text-xs uppercase text-muted-foreground font-bold">Metrics</Label>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Checked-In</Label>
                            <Switch checked={selectedModule.config.show_checked_in ?? true} onCheckedChange={c => updateSelectedModuleConfig("show_checked_in", c)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Show Scans/Hour</Label>
                            <Switch checked={selectedModule.config.show_scans_per_hour ?? true} onCheckedChange={c => updateSelectedModuleConfig("show_scans_per_hour", c)} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 border rounded-xl p-4 bg-secondary/10 mt-4">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Visibility Control</Label>
                        <div className="space-y-2">
                          <Label className="text-sm">Visible to Roles / Sections</Label>
                          <Input 
                            value={selectedModule.config.visibility_roles || ""} 
                            onChange={e => updateSelectedModuleConfig("visibility_roles", e.target.value)} 
                            placeholder="e.g. Scanner, Admin, VIP (comma separated)" 
                          />
                          <p className="text-xs text-muted-foreground mt-1 leading-snug">
                            Restrict this module to specific Workspace User roles OR Event Staff sections. Leave empty so everyone can see it.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "permissions" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="text-center text-muted-foreground p-6 pt-12 border-b border-border/50">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium text-foreground mb-1">Access Control</p>
                  <p className="text-xs">Define which user roles can access this specific app on their device.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Staff Role</Label>
                      <p className="text-xs text-muted-foreground">General event staff</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Vendor Role</Label>
                      <p className="text-xs text-muted-foreground">External contractors</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Admin Role</Label>
                      <p className="text-xs text-muted-foreground">Workspace admins</p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function getDefaultConfig(type: string) {
  switch (type) {
    case "scanner": return { scan_tickets: true, scan_vouchers: true, scan_badges: false, record_entry: true, visibility_roles: "" };
    case "attendees": return { view_contact: false, allow_edit: false, visibility_roles: "" };
    case "transactions": return { view_financials: false, allow_refunds: false, visibility_roles: "" };
    case "stats": return { show_checked_in: true, show_scans_per_hour: true, visibility_roles: "" };
    default: return { visibility_roles: "" };
  }
}
