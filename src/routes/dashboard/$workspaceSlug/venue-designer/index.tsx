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
import { getWorkspaceVenueProjects, createVenueProject } from "@/api/venues";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { PitchType, TemplateId } from "@/components/venue-designer/types";

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
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [newProjectName, setNewProjectName] = useState("Untitled Venue");
  const [selectedEventId, setSelectedEventId] = useState("");

  // Blank Canvas specific
  const [boundaryShape, setBoundaryShape] = useState<"rect" | "circle" | "oval" | "d_shape" | "horseshoe" | "diamond" | "hexagon" | "octagon">("rect");
  const [pitchType, setPitchType] = useState<PitchType>("none");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate || !selectedEventId) throw new Error("Missing fields");

      const newProject = await createVenueProject({
        data: {
          workspace_id: activeWorkspace?.id,
          name: newProjectName,
          event_id: selectedEventId,
          boundary: {
            shape: boundaryShape,
            width: 800,
            height: 600,
            rx: 0
          }
        }
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
        search: { template: selectedTemplate as TemplateId, pitchType }
      });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to create venue project. Please try again.");
    },
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
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

  const openSetupModal = (templateId: string) => {
    setSelectedTemplate(templateId);
    setNewProjectName("Untitled Venue");
    setSelectedEventId("");
    setModalStep(1);
    setBoundaryShape("rect");
    setPitchType("none");
    setIsModalOpen(true);
  };

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
                {modalStep === 1 ? "Link this venue map to an existing event." : "Configure your custom blank canvas boundaries."}
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
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Canvas Boundary Shape</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {['rect', 'circle', 'oval', 'horseshoe', 'diamond', 'hexagon', 'octagon', 'd_shape'].map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => setBoundaryShape(shape as any)}
                            className={`p-2 rounded-lg border text-xs capitalize text-center ${boundaryShape === shape ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-secondary'}`}
                          >
                            {shape.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Focal Point (Pitch/Stage)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: 'Empty' },
                          { id: 'basketball', label: 'Basketball' },
                          { id: 'football', label: 'Football' },
                          { id: 'tennis', label: 'Tennis' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPitchType(p.id as any)}
                            className={`p-2 rounded-lg border text-xs capitalize text-center ${pitchType === p.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-secondary'}`}
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
                  <Button type="button" variant="outline" onClick={() => setModalStep(1)} className="mr-auto">
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
                  {(selectedTemplate === "blank" && modalStep === 1) ? "Next" : "Start Designing"}
                </Button>
              </DialogFooter>
            </form>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingProjects ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : dbProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60 p-8">
                <MapIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">No Saved Venues</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Create your first venue map by selecting a layout template above.
                </p>
              </div>
            ) : (
              dbProjects.map((proj: any) => {
                const eventObj = events.find((e: any) => e.id === proj.event_id);
                const displayTitle = proj.name || "Untitled Venue";

                return (
                  <Link
                    key={proj.id}
                    to="/dashboard/$workspaceSlug/venue-designer/$projectId"
                    params={{ workspaceSlug, projectId: proj.id }}
                    search={{ template: "blank", pitchType: "none" }}
                    className="group block rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
                  >
                    <div className="h-36 p-5 flex flex-col justify-between relative overflow-hidden bg-secondary/50">
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-md pointer-events-none" />
                      <div className="relative z-10 text-foreground">
                        <p className="text-xs text-muted-foreground">{eventObj?.title || "No event linked"}</p>
                        <h3 className="text-xl font-bold leading-tight mt-1">{displayTitle}</h3>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Edit Map</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
