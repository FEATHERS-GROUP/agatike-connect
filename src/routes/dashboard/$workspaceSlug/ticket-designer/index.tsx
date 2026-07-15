import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Ticket,
  Film,
  Mountain,
  Briefcase,
  Calendar,
  ChevronRight,
  MapPin,
  Search,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getWorkspaceEvents,
  saveTicketProject,
  getWorkspaceTicketProjects,
  updateTicketProjectFolder,
  deleteTicketProject,
} from "@/api/events";
import { FolderManager } from "@/components/ui/FolderManager";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { Folder, Trash2 } from "lucide-react";
import { getRentableVenues } from "@/api/rentable_venues";
import { getCinemas } from "@/api/cinemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";

// Stubbed mock data
const ticketProjects: any[] = [];

export const Route = createFileRoute("/dashboard/$workspaceSlug/ticket-designer/")({
  component: TicketDesignerIndex,
});

const templates = [
  {
    id: "concert",
    label: "Concert / Event",
    icon: Ticket,
    desc: "Classic stub for live shows and general admission events.",
    bg: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "movie",
    label: "Movie / Cinema",
    icon: Film,
    desc: "Tear-off stub design for screenings and premieres.",
    bg: "bg-red-500/10 text-red-500",
  },
  {
    id: "experience",
    label: "Experience",
    icon: Mountain,
    desc: "Clean and visual for outdoor activities and tours.",
    bg: "bg-green-500/10 text-green-500",
  },
  {
    id: "conference",
    label: "Conference",
    icon: Briefcase,
    desc: "Badge-style with attendee details for corporate events.",
    bg: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "entrance",
    label: "General Entrance",
    icon: MapPin,
    desc: "Clean museum/park pass with a distinct admission stub.",
    bg: "bg-violet-500/10 text-violet-500",
  },
];

function TicketDesignerIndex() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/ticket-designer/" });
  const { activeWorkspace } = useWorkspace();

  const { data: venues = [] } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: cinemas = [] } = useQuery({
    queryKey: ["workspace-cinemas", activeWorkspace?.id],
    queryFn: () => getCinemas({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: dbProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const {
    hasStudioAccess,
    canCreateTicketDesign,
    isLoading: limitsLoading,
  } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("Untitled Project");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const searchedProjects = dbProjects.filter((p: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const eventObj = p.events || events.find((e: any) => e.id === p.eventId);
    const venueObj = p.rentable_venues || venues.find((v: any) => v.id === p.venueId);
    const cinemaObj = cinemas.find((c: any) => c.id === p.cinemaId);
    const displayTitle = eventObj?.title || venueObj?.name || cinemaObj?.name || p.name || "Untitled Design";
    return displayTitle.toLowerCase().includes(q) || (p.name && p.name.toLowerCase().includes(q));
  });

  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateTicketProjectFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["workspace-ticket-projects", activeWorkspace?.id],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteTicketProject({ data: { id } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["workspace-ticket-projects", activeWorkspace?.id],
      }),
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
    mutationFn: async (variables: any) => saveTicketProject({ data: variables } as any),
    onSuccess: (data: any) => {
      const newId = data?.insert_ticket_projects?.returning?.[0]?.id;
      if (newId) {
        toast.success("Project created successfully!");
        navigate({
          to: "/dashboard/$workspaceSlug/ticket-designer/$projectId",
          params: { workspaceSlug, projectId: newId },
        });
        setIsModalOpen(false);
      } else {
        toast.error("Failed to create project (no ID returned from database).");
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error creating project!");
    },
  });

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateTicketDesign()) {
      toast.error("Ticket Design Limit Reached", {
        description: "You have reached the maximum number of ticket designs for your plan.",
      });
      setIsModalOpen(false);
      return;
    }
    if (!selectedTemplate || !selectedAssignment) {
      toast.error("Please select a template and an event or venue.");
      return;
    }

    let eventId = null;
    let venueId = null;
    let cinemaId = null;
    if (selectedAssignment.startsWith("event:")) eventId = selectedAssignment.replace("event:", "");
    if (selectedAssignment.startsWith("venue:")) venueId = selectedAssignment.replace("venue:", "");
    if (selectedAssignment.startsWith("cinema:"))
      cinemaId = selectedAssignment.replace("cinema:", "");

    createMutation.mutate({
      name: newProjectName,
      eventId: eventId,
      venueId: venueId,
      cinemaId: cinemaId,
      template: selectedTemplate,
      workspaceId: activeWorkspace?.id || "",
      updated_on: new Date().toISOString(),
    });
  };

  const openSetupModal = (templateId: string) => {
    if (!canCreateTicketDesign()) {
      toast.error("Ticket Design Limit Reached", {
        description: "You have reached the maximum number of ticket designs for your plan.",
      });
      return;
    }
    setSelectedTemplate(templateId);
    setNewProjectName("Untitled Project");
    setSelectedAssignment("");
    setIsModalOpen(true);
  };

  if (limitsLoading) return null;
  if (!hasStudioAccess()) {
    return (
      <div className="p-6 h-full flex flex-col justify-center">
        <UpgradePrompt
          title="Upgrade to Access Ticket Designer"
          description="Ticket Designer is a premium feature available in higher tier plans. Upgrade your subscription to start designing beautiful custom tickets."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Decorative subtle background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      


      <main className="mx-auto max-w-7xl p-6 lg:p-10 space-y-16 relative z-10">
        {/* New Project Section */}
        <section className="relative">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Create New Project
            </h2>
            <p className="text-base text-muted-foreground">
              Start with a beautifully crafted template and customize it for your event.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => openSetupModal(t.id)}
                className="group relative flex flex-col items-start gap-4 rounded-[2rem] border border-border/50 bg-card/60 backdrop-blur-sm p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className={`p-3.5 rounded-2xl ${t.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <t.icon className="h-6 w-6" />
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-lg tracking-tight">{t.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{t.desc}</p>
                </div>
                <div className="mt-auto pt-5 flex items-center text-sm font-semibold text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Select Template <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Setup Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-border/50 shadow-2xl">
            <div className="p-6 bg-gradient-to-b from-secondary/30 to-transparent border-b border-border/50">
              <DialogHeader>
                <DialogTitle className="text-xl">Setup Ticket Project</DialogTitle>
                <DialogDescription className="text-sm mt-1.5">
                  Link this design to an existing event to preview all ticket tiers inside the editor.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleCreateNew} className="p-6 space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="projectName" className="text-sm font-medium">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Summer VIP Tickets"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="eventSelect" className="text-sm font-medium">Assign to Event or Venue *</Label>
                <select
                  id="eventSelect"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                  required
                >
                  <option value="">-- Select Event or Venue --</option>
                  {events.length > 0 && (
                    <optgroup label="Events" className="font-semibold">
                      {events.map((ev: any) => (
                        <option key={ev.id} value={`event:${ev.id}`} className="font-normal">
                          {ev.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {venues.length > 0 && (
                    <optgroup label="Venues" className="font-semibold">
                      {venues.map((v: any) => (
                        <option key={v.id} value={`venue:${v.id}`} className="font-normal">
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {cinemas.length > 0 && (
                    <optgroup label="Cinemas / Theatres" className="font-semibold">
                      {cinemas.map((c: any) => (
                        <option key={c.id} value={`cinema:${c.id}`} className="font-normal">
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

               <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl px-6">
                  {createMutation.isPending ? "Creating..." : "Start Designing"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Saved Projects Section */}
        <section>
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Saved Projects</h2>
              <p className="text-base text-muted-foreground">
                Manage and edit your existing ticket designs.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-card/60 backdrop-blur-sm border-border/50 focus-visible:ring-primary shadow-sm"
              />
            </div>
          </div>

          <FolderManager
            moduleType="ticket_designer"
            items={searchedProjects}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, folders, handleSelect, selectedIds, ItemMenu }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {isLoadingProjects ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card/30 rounded-[2rem] border border-dashed border-border/50">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-medium text-muted-foreground mt-4">Loading ticket designs...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-24 bg-card/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-border/60">
                    <div className="mx-auto h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                      <Ticket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">No Saved Projects</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                      Create your first ticket design by selecting a template above, or select a
                      different folder.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((proj: any) => {
                    const eventObj = proj.events || events.find((e: any) => e.id === proj.eventId);
                    const venueObj =
                      proj.rentable_venues || venues.find((v: any) => v.id === proj.venueId);
                    const cinemaObj = cinemas.find((c: any) => c.id === proj.cinemaId);
                    const displayTitle =
                      eventObj?.title ||
                      venueObj?.name ||
                      cinemaObj?.name ||
                      proj.name ||
                      "Untitled Design";
                    const displaySubtitle =
                      eventObj?.category ||
                      venueObj?.type ||
                      (cinemaObj ? "Cinema" : "Ticket Design");
                    const palette = proj.palette || {
                      from: "#f97316",
                      to: "#db2777",
                      name: "Sunset",
                    };
                    const updatedAt = proj.updated_on || new Date().toISOString();
                    const coverUrl =
                      proj.coverImage ||
                      eventObj?.cover ||
                      venueObj?.cover_url ||
                      venueObj?.images?.[0] ||
                      cinemaObj?.cover_url;

                    const isSelected = selectedIds.has(proj.id);

                    return (
                      <ItemMenu key={proj.id} itemId={proj.id} folderId={proj.folder_id}>
                        <div
                          className="relative group rounded-[1.5rem] border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                          style={{
                            borderColor: isSelected
                              ? "hsl(var(--primary))"
                              : "hsl(var(--border) / 0.5)",
                          }}
                        >
                          <div
                            className="absolute top-3 left-3 z-20 transition-opacity duration-200 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                            data-state={isSelected ? "checked" : "unchecked"}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(c) => handleSelect(proj.id, c as boolean)}
                              className="bg-background/90 backdrop-blur-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm"
                            />
                          </div>
                          <Link
                            to="/dashboard/$workspaceSlug/ticket-designer/$projectId"
                            params={{ workspaceSlug, projectId: proj.id }}
                            className="flex flex-col h-full"
                          >
                            <div
                              className="h-36 p-5 flex flex-col justify-between relative overflow-hidden shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${palette.from || "#f97316"}, ${palette.to || "#db2777"})`,
                              }}
                            >
                              {coverUrl && (
                                <img
                                  src={coverUrl}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay pointer-events-none transition-transform duration-700 group-hover:scale-105"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                              <div className="relative z-10 flex justify-end items-start w-full">
                                <span className="bg-black/40 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                  {proj.template}
                                </span>
                              </div>
                              <div className="relative z-10 text-white drop-shadow-md mt-auto">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">{displaySubtitle}</p>
                                <h3 className="text-xl font-bold leading-tight line-clamp-1">{displayTitle}</h3>
                              </div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow justify-between">
                              <h4 className="font-semibold text-[15px] mb-3 group-hover:text-primary transition-colors line-clamp-1">
                                {proj.name}
                              </h4>
                              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-auto">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" /> Updated{" "}
                                  {new Date(updatedAt).toLocaleDateString()}
                                </span>
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
