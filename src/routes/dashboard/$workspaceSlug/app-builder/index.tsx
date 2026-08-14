import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Smartphone, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getWorkspaceApps,
  createWorkspaceApp,
  deleteWorkspaceApp,
  upsertAppModules,
} from "@/api/app-studio";
import { getWorkspaceEvents, updateEvent } from "@/api/events";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { QuotaExceededBanner } from "@/components/dashboard/QuotaExceededBanner";

const APP_TEMPLATES = [
  {
    id: "event-staff",
    name: "Event Staff Portal",
    description: "For event staff to scan tickets and manage attendees.",
    theme_color: "#f97316",
    modules: [
      {
        type: "scanner",
        title: "Access Scanner",
        icon: "ScanLine",
        config: { scan_tickets: true, scan_vouchers: true, scan_badges: true, record_entry: true },
      },
      {
        type: "attendees",
        title: "Guest List",
        icon: "Users",
        config: { view_contact: false, allow_edit: false },
      },
    ],
  },
  {
    id: "venue-manager",
    name: "Venue Manager App",
    description: "For venue owners to manage spaces, staff, and access.",
    theme_color: "#3b82f6",
    modules: [
      { type: "venues", title: "Venues", icon: "MapPin", config: {} },
      {
        type: "scanner",
        title: "Access Scanner",
        icon: "ScanLine",
        config: { scan_tickets: true, scan_badges: true, record_entry: true },
      },
      { type: "members", title: "Staff Directory", icon: "UserCheck", config: {} },
    ],
  },
  {
    id: "space-booking",
    name: "Space Booking App",
    description: "For space managers to handle bookings and transactions.",
    theme_color: "#8b5cf6",
    modules: [
      { type: "bookings", title: "Bookings", icon: "CalendarDays", config: {} },
      { type: "venues", title: "Spaces", icon: "MapPin", config: {} },
      {
        type: "transactions",
        title: "Transactions",
        icon: "CreditCard",
        config: { view_financials: true },
      },
    ],
  },
  {
    id: "blank",
    name: "Blank App",
    description: "Start from scratch and build your own custom app.",
    theme_color: "#64748b",
    modules: [],
  },
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/app-builder/")({
  component: AppBuilderIndex,
});

function AppBuilderIndex() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const { canCreateCustomApp, limits } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [appName, setAppName] = useState("");
  const [appType, setAppType] = useState<"workspace" | "event">("workspace");
  const [selectedEventId, setSelectedEventId] = useState("");

  const { data: rawApps = [], isLoading } = useQuery({
    queryKey: ["workspace-apps", activeWorkspace?.id],
    queryFn: () => getWorkspaceApps({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const limit = limits.max_custom_apps === undefined || limits.max_custom_apps === -1 ? Infinity : limits.max_custom_apps;
  const sortedApps = [...rawApps].sort((a: any, b: any) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
  const apps = limit === Infinity ? sortedApps : sortedApps.slice(0, limit);


  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async ({ template, name, type, eventId }: any) => {
      const res = await createWorkspaceApp({
        data: {
          workspace_id: activeWorkspace?.id,
          name: name || template.name,
          description: template.description,
          is_active: true,
          theme_color: template.theme_color,
          app_type: type,
        },
      } as any);

      const newAppId = (res as any)?.insert_workspace_apps_one?.id;
      if (!newAppId) throw new Error("Failed to get new app ID");

      if (template.modules && template.modules.length > 0) {
        const modulesToUpsert = template.modules.map((m: any, idx: number) => ({
          id: crypto.randomUUID(),
          app_id: newAppId,
          type: m.type,
          title: m.title,
          icon: m.icon,
          config: m.config || {},
          order: idx,
        }));
        await upsertAppModules({ data: { objects: modulesToUpsert } } as any);
      }

      if (type === "event" && eventId) {
        await updateEvent({ data: { id: eventId, set: { app_id: newAppId } } } as any);
      }

      return { id: newAppId };
    },
    onSuccess: (data: any) => {
      toast.success("App created successfully!");
      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
      if (data?.id) {
        navigate({
          to: `/dashboard/${workspaceSlug}/app-builder/${data.id}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["workspace-apps"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create app");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteWorkspaceApp({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("App deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspace-apps"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete app");
    },
  });

  const handleCreateNewApp = () => {
    if (!canCreateCustomApp()) {
      toast.error("Custom App limit reached", {
        description:
          "Your current subscription plan does not allow creating more custom apps. Please upgrade your plan.",
      });
      return;
    }
    setSelectedTemplate(null);
    setIsTemplateModalOpen(true);
  };

  return (
    <div className="w-full p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design and manage custom mobile portals for your staff and vendors.
          </p>
        </div>
        <Button
          onClick={handleCreateNewApp}
          className="gap-2 rounded-full shadow-sm"
          style={{ background: "var(--gradient-primary)", color: "white" }}
        >
          <Plus className="w-4 h-4" /> Create Custom App
        </Button>
      </header>

      {limit === 0 && <QuotaExceededBanner limit={limit} total={rawApps.length} centered />}
      {limit > 0 && <QuotaExceededBanner limit={limit} total={rawApps.length} />}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-3xl bg-secondary/10">
          <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-sm mb-6">
            <Smartphone className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Custom Apps Yet</h2>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            Build your first custom mobile portal to give specific roles tailored access to
            scanners, attendees, and more.
          </p>
          <Button onClick={handleCreateNewApp} className="rounded-full shadow-sm">
            Create Your First App
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">App</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{ backgroundColor: app.theme_color || "var(--primary)" }}
                      >
                        {app.logo_url ? (
                          <img
                            src={app.logo_url}
                            alt="Logo"
                            className="h-8 w-8 object-cover rounded-lg"
                          />
                        ) : (
                          <LayoutGrid className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{app.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {app.description || "No description provided."}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {app.app_type === "event" ? (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/20 whitespace-nowrap">
                        Event App
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-500/20 whitespace-nowrap">
                        Workspace App
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${app.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}
                    >
                      {app.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground font-medium">
                      {app.app_modules?.length || 0} Modules
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground font-medium">
                      {app.app_permissions?.length || 0} Access Roles
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to="/dashboard/$workspaceSlug/app-builder/$appId"
                        params={{ workspaceSlug, appId: app.id }}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-xl h-8 text-xs font-semibold gap-1.5 px-3"
                        >
                          <Settings2 className="w-3.5 h-3.5" /> Studio
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this custom app?")) {
                            deleteMutation.mutate(app.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={isTemplateModalOpen}
        onOpenChange={(open) => {
          setIsTemplateModalOpen(open);
          if (!open) setSelectedTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl rounded-3xl bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedTemplate ? "Configure App" : "Choose a Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Set up the details for your new app."
                : "Start with a pre-configured template tailored for your use case, or build from scratch."}
            </DialogDescription>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {APP_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setAppName(tpl.name);
                    setAppType(tpl.id.includes("event") ? "event" : "workspace");
                    setSelectedEventId("");
                  }}
                  className="relative p-5 rounded-2xl border-2 border-border/60 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md bg-card text-left flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-white"
                      style={{ backgroundColor: tpl.theme_color }}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-none">{tpl.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{tpl.description}</p>
                  {tpl.modules.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tpl.modules.map((m: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-bold tracking-wider bg-secondary text-muted-foreground px-2 py-1 rounded-md"
                        >
                          {m.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>App Name</Label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Event Staff App"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label>What is this app for?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setAppType("workspace")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${appType === "workspace" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}`}
                  >
                    <h4 className="font-bold mb-1">Workspace Users</h4>
                    <p className="text-xs text-muted-foreground">
                      General tools for your team members and venue staff.
                    </p>
                  </div>
                  <div
                    onClick={() => setAppType("event")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${appType === "event" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}`}
                  >
                    <h4 className="font-bold mb-1">Event Staff</h4>
                    <p className="text-xs text-muted-foreground">
                      Specific tools for managing an event like ticket scanning.
                    </p>
                  </div>
                </div>
              </div>

              {appType === "event" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Link to Event (Optional)</Label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    <option value="">Select an event to link...</option>
                    {events.map((evt: any) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    You can link this app to an event immediately, or do it later in the app
                    settings.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl"
                >
                  Back to Templates
                </Button>
                <Button
                  onClick={() => {
                    createMutation.mutate({
                      template: selectedTemplate,
                      name: appName,
                      type: appType,
                      eventId: selectedEventId,
                    });
                  }}
                  disabled={createMutation.isPending || !appName.trim()}
                  className="rounded-xl px-8"
                  style={{ background: "var(--gradient-primary)", color: "white" }}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create App"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
