import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  LayoutTemplate,
  Circle,
  Square,
  Map as MapIcon,
  ChevronRight,
  Loader2,
  Trash2,
  MapPin,
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
  getWorkspaceVenueProjects,
  createVenueProject,
  deleteVenueProject,
  updateVenueProjectFolder,
} from "@/api/venues";
import { FolderManager } from "@/components/ui/FolderManager";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { PitchType, TemplateId } from "@/components/venue-designer/types";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venue-designer/")({
  component: VenueDesignerIndex,
});

const templates = [
  {
    id: "blank",
    label: "Blank Canvas",
    icon: Plus,
    desc: "Start from scratch and build any shape.",
    bg: "bg-slate-500/10 text-slate-500",
  },
  {
    id: "concert-hall",
    label: "Concert Hall",
    icon: LayoutTemplate,
    desc: "Pre-built stage, floor, and balcony layout.",
    bg: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "football-stadium",
    label: "Stadium",
    icon: Circle,
    desc: "360-degree tiered seating around a pitch.",
    bg: "bg-green-500/10 text-green-500",
  },
  {
    id: "conference-room",
    label: "Conference Room",
    icon: Square,
    desc: "Rectangular layout for corporate events.",
    bg: "bg-blue-500/10 text-blue-500",
  },
];

function VenueDesignerIndex() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/venue-designer/" });
  const { activeWorkspace } = useWorkspace();

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const {
    data: dbProjects = [],
    isLoading: isLoadingProjects,
    refetch,
  } = useQuery({
    queryKey: ["venue-projects", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceVenueProjects({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const {
    hasStudioAccess,
    canCreateVenueDesign,
    isLoading: limitsLoading,
  } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [newProjectName, setNewProjectName] = useState("Untitled Venue");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedTourStopIdx, setSelectedTourStopIdx] = useState(0);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const activeEvent = events.find((e: any) => e.id === selectedEventId);
  const hasMultipleStops =
    activeEvent && Array.isArray(activeEvent.tour_stops) && activeEvent.tour_stops.length > 1;

  // Blank Canvas specific
  const [boundaryShape, setBoundaryShape] = useState<
    "rect" | "circle" | "oval" | "d_shape" | "horseshoe" | "diamond" | "hexagon" | "octagon"
  >("rect");
  const [pitchType, setPitchType] = useState<PitchType>("none");

  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateVenueProjectFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["workspace-venue-projects", activeWorkspace?.id],
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
    mutationFn: async () => {
      if (!selectedTemplate || !selectedEventId) throw new Error("Missing fields");

      const newProject = await createVenueProject({
        data: {
          workspace_id: activeWorkspace?.id,
          name: newProjectName,
          event_id: selectedEventId,
          tour_stop_idx: hasMultipleStops ? selectedTourStopIdx : 0,
          boundary: {
            shape: boundaryShape,
            width: 800,
            height: 600,
            rx: 0,
          },
        },
      } as any);

      return newProject.id;
    },
    onSuccess: (newId: string) => {
      toast.success("Venue project created!");
      refetch();
      setIsModalOpen(false);
      navigate({
        to: "/dashboard/$workspaceSlug/venue-designer/$projectId",
        params: { workspaceSlug, projectId: newId },
        search: { template: selectedTemplate as TemplateId, pitchType },
      });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to create venue project. Please try again.");
    },
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateVenueDesign()) {
      toast.error("Venue Design Limit Reached", {
        description: "You have reached the maximum number of venue designs for your plan."
      });
      setIsModalOpen(false);
      return;
    }

    if (!selectedTemplate || !selectedEventId) {
      toast.error("Please select a template and an event.");
      return;
    }

    if (selectedTemplate === "blank" && modalStep === 1) {
      setModalStep(2);
      return;
    }

    createMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVenueProject({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Venue map deleted.");
      setProjectToDelete(null);
      refetch();
    },
    onError: () => toast.error("Failed to delete venue map."),
  });

  const openSetupModal = (templateId: string) => {
    if (!canCreateVenueDesign()) {
      toast.error("Venue Design Limit Reached", {
        description: "You have reached the maximum number of venue designs for your plan."
      });
      return;
    }
    setSelectedTemplate(templateId);
    setNewProjectName("Untitled Venue");
    setSelectedEventId("");
    setSelectedTourStopIdx(-1);
    setModalStep(1);
    setBoundaryShape("rect");
    setPitchType("none");
    setIsModalOpen(true);
  };

  if (limitsLoading) return null;
  if (!hasStudioAccess()) {
    return (
      <div className="p-6 h-full flex flex-col justify-center">
        <UpgradePrompt 
          title="Upgrade to Access Venue Designer" 
          description="Venue Designer is a premium feature available in higher tier plans. Upgrade your subscription to start mapping out your event spaces."
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
            <h1 className="text-lg font-semibold">Venue Designer</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 lg:p-10 space-y-12">
        {/* New Project Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Create New Venue Map</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a starting template for your interactive seating map.
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Setup Venue Project</DialogTitle>
              <DialogDescription>
                {modalStep === 1
                  ? "Link this venue map to an existing event."
                  : "Configure your custom blank canvas boundaries."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNext} className="space-y-4 py-4">
              {modalStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. VIP Main Stage Map"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventSelect">Select Event *</Label>
                    <select
                      id="eventSelect"
                      value={selectedEventId}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setSelectedTourStopIdx(-1);
                      }}
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

                  {hasMultipleStops && (
                    <div className="space-y-2">
                      <Label htmlFor="tourStopSelect">Select Location / Tour Stop *</Label>
                      <select
                        id="tourStopSelect"
                        value={selectedTourStopIdx}
                        onChange={(e) => setSelectedTourStopIdx(Number(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value={-1}>All Locations (Same Design)</option>
                        {activeEvent.tour_stops.map((stop: any, idx: number) => (
                          <option key={idx} value={idx}>
                            {stop.venue || stop.city || `Location ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Canvas Boundary Shape</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          "rect",
                          "circle",
                          "oval",
                          "horseshoe",
                          "diamond",
                          "hexagon",
                          "octagon",
                          "d_shape",
                        ].map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => setBoundaryShape(shape as any)}
                            className={`p-2 rounded-lg border text-xs capitalize text-center ${boundaryShape === shape ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-secondary"}`}
                          >
                            {shape.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Focal Point (Pitch/Stage)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "none", label: "Empty" },
                          { id: "basketball", label: "Basketball" },
                          { id: "football", label: "Football" },
                          { id: "tennis", label: "Tennis" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPitchType(p.id as any)}
                            className={`p-2 rounded-lg border text-xs capitalize text-center ${pitchType === p.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-secondary"}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="pt-4">
                {modalStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalStep(1)}
                    className="mr-auto"
                  >
                    Back
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {selectedTemplate === "blank" && modalStep === 1 ? "Next" : "Start Designing"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Modal */}
        <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Venue Map</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this venue map? This action cannot be undone. If it
                is linked to an event, the event will automatically be unlinked.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setProjectToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (projectToDelete) {
                    deleteMutation.mutate(projectToDelete);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Saved Projects Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Saved Venue Maps</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and edit your existing interactive seating plans.
              </p>
            </div>
          </div>

          <FolderManager
            moduleType="venue_designer"
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
                    <p className="text-sm text-muted-foreground mt-2">Loading venue projects...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60 p-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No Venue Projects</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first venue seating map by selecting a template above.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((proj: any) => {
                    const eventObj = events.find((e: any) => e.id === proj.event_id);
                    const displayTitle = proj.name || "Untitled Venue";
                    const stopIdx = proj.tour_stop_idx ?? 0;
                    let venueImage = null;
                    let locationName = "";

                    if (stopIdx === -1) {
                      venueImage = eventObj?.cover || null;
                      if (Array.isArray(eventObj?.tour_stops) && eventObj.tour_stops.length > 1) {
                        locationName = " - All Locations";
                      }
                    } else if (
                      Array.isArray(eventObj?.tour_stops) &&
                      eventObj.tour_stops.length > stopIdx
                    ) {
                      venueImage = eventObj.tour_stops[stopIdx].venue_image_url;
                      if (eventObj.tour_stops.length > 1) {
                        locationName = ` - ${eventObj.tour_stops[stopIdx].venue || eventObj.tour_stops[stopIdx].city || `Location ${stopIdx + 1}`}`;
                      }
                    }

                    const isSelected = selectedIds.has(proj.id);

                    return (
                      <ItemMenu key={proj.id} itemId={proj.id} folderId={proj.folder_id}>
                        <div
                          className="relative group rounded-3xl border overflow-hidden shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
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
                            to="/dashboard/$workspaceSlug/venue-designer/$projectId"
                            params={{ workspaceSlug, projectId: proj.id }}
                            className="block h-full"
                          >
                            <div className="h-36 p-5 flex flex-col justify-between relative overflow-hidden bg-secondary/50">
                              {venueImage && (
                                <img
                                  src={venueImage}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
                              <div className="relative z-10 text-white drop-shadow-md">
                                <p className="text-xs opacity-80 uppercase tracking-wider line-clamp-1">
                                  {eventObj?.title || "No event linked"}
                                  {locationName}
                                </p>
                                <h3 className="text-xl font-bold leading-tight mt-1 drop-shadow-lg">
                                  {displayTitle}
                                </h3>
                              </div>
                            </div>
                            <div className="px-5 py-3 flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                              <span>Edit Map</span>
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setProjectToDelete(proj.id);
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
