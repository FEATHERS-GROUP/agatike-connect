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
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number | null>(null);
  const [appConfig, setAppConfig] = useState({
    name: "",
    description: "",
    theme_color: "#f97316",
    logo_url: "",
    is_active: true,
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
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8 flex justify-center">
          <div className="w-[375px] h-[812px] bg-card rounded-[3rem] shadow-2xl border-[12px] border-foreground/10 relative overflow-hidden flex flex-col shrink-0">
            
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-foreground/10 rounded-b-xl"></div>
            </div>

            {/* App Header (Brand) */}
            <div 
              className="pt-12 pb-6 px-6 text-white shrink-0 relative transition-colors duration-300"
              style={{ backgroundColor: appConfig.theme_color }}
            >
              <div className="flex items-center gap-3">
                {appConfig.logo_url ? (
                  <img src={appConfig.logo_url} alt="Logo" className="h-10 w-10 rounded-lg bg-white/20 object-cover border border-white/20" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg leading-tight">{appConfig.name || "App Name"}</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{appConfig.description || "Welcome to your portal"}</p>
                </div>
              </div>
            </div>

            {/* App Body - Grid of Modules */}
            <div className="flex-1 bg-secondary/10 p-4 overflow-y-auto">
              {modules.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                  <LayoutGrid className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Your app is empty.</p>
                  <p className="text-xs mt-1">Add modules from the left panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((m, idx) => {
                    const ModIcon = AVAILABLE_MODULES.find(am => am.type === m.type)?.icon || LayoutGrid;
                    return (
                      <div
                        key={m.id || idx}
                        onClick={() => {
                          setSelectedModuleIdx(idx);
                          setActiveTab("settings");
                        }}
                        className={`aspect-square rounded-2xl bg-card border shadow-sm p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all ${
                          selectedModuleIdx === idx ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-border/60 hover:border-primary/50"
                        }`}
                      >
                        <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center">
                          <ModIcon className={`h-6 w-6 ${selectedModuleIdx === idx ? "text-primary" : "text-foreground"}`} />
                        </div>
                        <span className="text-xs font-semibold line-clamp-2">{m.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                  <Input value={appConfig.name} onChange={e => setAppConfig({...appConfig, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={appConfig.description} onChange={e => setAppConfig({...appConfig, description: e.target.value})} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={appConfig.theme_color} onChange={e => setAppConfig({...appConfig, theme_color: e.target.value})} className="w-12 h-10 p-1" />
                    <Input value={appConfig.theme_color} onChange={e => setAppConfig({...appConfig, theme_color: e.target.value})} className="flex-1 uppercase font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custom Logo URL</Label>
                  <Input value={appConfig.logo_url} onChange={e => setAppConfig({...appConfig, logo_url: e.target.value})} placeholder="https://..." />
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
    case "scanner": return { scan_tickets: true, scan_vouchers: true, scan_badges: false, record_entry: true };
    case "attendees": return { view_contact: false, allow_edit: false };
    case "transactions": return { view_financials: false, allow_refunds: false };
    default: return {};
  }
}
