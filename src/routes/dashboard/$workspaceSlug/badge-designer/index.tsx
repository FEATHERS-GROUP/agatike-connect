import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  ShieldAlert,
  Star,
  Briefcase,
  ChevronRight,
  UserCheck,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWorkspaceEvents } from "@/api/events";
import {
  getAllBadgeProjects,
  saveBadgeProject,
  deleteBadgeProject,
  updateBadgeProjectFolder,
} from "@/api/badges";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { FolderManager } from "@/components/ui/FolderManager";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";

export const Route = createFileRoute("/dashboard/$workspaceSlug/badge-designer/")({
  component: BadgeDesignerIndex,
});

const TEMPLATE_DEFAULTS: Record<
  string,
  { theme: string; gradientClass: string; accentColor: string }
> = {
  glass: { theme: "glass", gradientClass: "from-slate-900 to-black", accentColor: "#f59e0b" },
  security: { theme: "solid", gradientClass: "from-red-800 to-rose-950", accentColor: "#ef4444" },
  vip: { theme: "glass", gradientClass: "from-amber-700 to-amber-950", accentColor: "#f59e0b" },
  minimalist: {
    theme: "minimal",
    gradientClass: "from-slate-900 to-black",
    accentColor: "#6366f1",
  },
};

const templates = [
  {
    id: "glass",
    label: "Glassmorphism",
    icon: Sparkles,
    desc: "Premium translucent badges for high-end events.",
    bg: "bg-slate-500/10 text-slate-500",
  },
  {
    id: "security",
    label: "Security / Staff",
    icon: ShieldAlert,
    desc: "High-contrast, highly legible matte design.",
    bg: "bg-red-500/10 text-red-500",
  },
  {
    id: "vip",
    label: "VIP Access",
    icon: Star,
    desc: "Gold/Amber accented for exclusive guests.",
    bg: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    icon: UserCheck,
    desc: "Clean and simple with max white space.",
    bg: "bg-blue-500/10 text-blue-500",
  },
];

function BadgeDesignerIndex() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/badge-designer/" });
  const { activeWorkspace } = useWorkspace();

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { hasStudioAccess, canCreateBadgeDesign, isLoading: limitsLoading } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const {
    data: dbProjects = [],
    isLoading: isLoadingProjects,
    refetch,
  } = useQuery({
    queryKey: ["badge-projects", activeWorkspace?.id],
    queryFn: () => getAllBadgeProjects({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("Untitled Badge");
  const [selectedEventId, setSelectedEventId] = useState("");

  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateBadgeProjectFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["badge-projects", activeWorkspace?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteBadgeProject({ data: { id } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["badge-projects", activeWorkspace?.id] }),
  });

  const handleBulkMove = async (itemIds: string[], folderId: string | null) => {
    const promises = itemIds.map((id) => moveMutation.mutateAsync({ id, folderId }));
    await Promise.all(promises);
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    const promises = itemIds.map((id) => deleteMutation.mutateAsync(id));
    await Promise.all(promises);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate || !selectedEventId) throw new Error("Missing fields");
      const defaults = TEMPLATE_DEFAULTS[selectedTemplate] || TEMPLATE_DEFAULTS.glass;
      const selectedEvent = events.find((e: any) => e.id === selectedEventId);
      const newId = crypto.randomUUID(); // Always generate a real UUID

      await saveBadgeProject({
        data: {
          id: newId,
          accent_color: defaults.accentColor,
          back_design: { text: "NON-TRANSFERABLE\nValid only for the specified event date." },
          bg_image_url: "",
          event_id: selectedEventId,
          font_family: "font-sans",
          front_design: {
            qrPlacement: "front",
            sectionPlacement: "front",
            sponsorsPlacement: "back",
            textSize: "text-3xl",
          },
          gradient_class: defaults.gradientClass,
          logo_text: selectedEvent?.title || newProjectName,
          show_user_image: true,
          sponsors_json: [],
          theme: defaults.theme,
        },
      } as any);

      return newId; // return the generated ID for navigation
    },
    onSuccess: (newId: string) => {
      toast.success("Badge project created!");
      refetch();
      setIsModalOpen(false);
      navigate({
        to: "/dashboard/$workspaceSlug/badge-designer/$projectId",
        params: { workspaceSlug, projectId: newId },
      });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to create badge project. Please try again.");
    },
  });

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateBadgeDesign()) {
      toast.error("Badge Design Limit Reached", {
        description: "You have reached the maximum number of badge designs for your plan."
      });
      setIsModalOpen(false);
      return;
    }
    if (!selectedTemplate || !selectedEventId) {
      toast.error("Please select a template and an event.");
      return;
    }
    createMutation.mutate();
  };

  const openSetupModal = (templateId: string) => {
    if (!canCreateBadgeDesign()) {
      toast.error("Badge Design Limit Reached", {
        description: "You have reached the maximum number of badge designs for your plan."
      });
      return;
    }
    setSelectedTemplate(templateId);
    setNewProjectName("Untitled Badge");
    setSelectedEventId("");
    setIsModalOpen(true);
  };

  if (limitsLoading) return null;
  if (!hasStudioAccess()) {
    return (
      <div className="p-6 h-full flex flex-col justify-center">
        <UpgradePrompt 
          title="Upgrade to Access Badge Designer" 
          description="Badge Designer is a premium feature available in higher tier plans. Upgrade your subscription to start designing digital credentials."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Dashboard / Tools</p>
            <h1 className="text-lg font-semibold">Staff Badge Designer</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 lg:p-10 space-y-12">
        {/* New Project Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Create New Badge Design</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a starting template for your staff digital credentials.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => openSetupModal(t.id)}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border border-border/60 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className={`p-3 rounded-2xl ${t.bg}`}>
                  <t.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  Select Template <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Setup Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Setup Badge Project</DialogTitle>
              <DialogDescription>
                Link this badge design to an existing event. The event name will be pre-filled on
                the badge.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNew} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. VIP Security Badges"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventSelect">Select Event *</Label>
                <select
                  id="eventSelect"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select Event --</option>
                  {events.map((ev: any) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Start Designing"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Saved Projects Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Saved Badge Designs</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and edit your existing badge templates.
              </p>
            </div>
          </div>

          <FolderManager
            moduleType="badge_projects"
            items={dbProjects}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds, ItemMenu }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {isLoadingProjects ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60 p-8">
                    <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No Saved Designs</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first badge design by selecting a template above.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((proj: any) => {
                    const eventObj = events.find((e: any) => e.id === proj.event_id);
                    const displayTitle = proj.logo_text || "Untitled Badge";
                    const gradient = proj.gradient_class || "from-slate-900 to-black";
                    const accent = proj.accent_color || "#f59e0b";
                    const isSelected = selectedIds.has(proj.id);

                    return (
                      <ItemMenu key={proj.id} itemId={proj.id} folderId={proj.folder_id}>
                        <div
                          className="relative group rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
                          style={{
                            borderColor: isSelected
                              ? "hsl(var(--primary))"
                              : "hsl(var(--border) / 0.6)",
                          }}
                        >
                          <div
                            className="absolute top-3 left-3 z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(c) => handleSelect(proj.id, c as boolean)}
                              className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary"
                            />
                          </div>
                          <Link
                            to="/dashboard/$workspaceSlug/badge-designer/$projectId"
                            params={{ workspaceSlug, projectId: proj.id }}
                            className="block"
                          >
                            <div
                              className={`h-36 p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br ${gradient}`}
                            >
                              <div className="absolute inset-0 bg-white/5 backdrop-blur-md pointer-events-none" />
                              <div className="relative z-10 flex justify-between items-start">
                                <span
                                  className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                  style={{ background: `${accent}33`, color: accent }}
                                >
                                  {proj.theme || "glass"}
                                </span>
                              </div>
                              <div className="relative z-10 text-white drop-shadow-md">
                                <p className="text-xs opacity-70">
                                  {eventObj?.title || "No event linked"}
                                </p>
                                <h3 className="text-xl font-bold leading-tight">{displayTitle}</h3>
                              </div>
                            </div>
                            <div className="px-5 py-3 flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                              <span>Edit Design</span>
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors z-20"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (
                                      confirm("Are you sure you want to delete this badge design?")
                                    ) {
                                      deleteMutation.mutate(proj.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        </div>
                      </ItemMenu>
                    );
                  })
                )}
              </div>
            )}
          </FolderManager>
        </section>
      </main>
    </div>
  );
}
