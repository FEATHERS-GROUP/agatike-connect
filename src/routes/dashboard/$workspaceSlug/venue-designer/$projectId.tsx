import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Save,
  Plus,
  LayoutTemplate,
  Circle,
  Square,
  LayoutDashboard,
  Loader2,
  MousePointer2,
  Type,
  Share2,
  PenTool,
} from "lucide-react";

import { VenueCanvas } from "@/components/venue-designer/VenueCanvas";
import { VenueSidebar } from "@/components/venue-designer/VenueSidebar";
import { VenueProperties } from "@/components/venue-designer/VenueProperties";
import { Section, TemplateId, VenueTemplate, PitchType } from "@/components/venue-designer/types";
import { templates, getTemplate } from "@/components/venue-designer/templates";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspaceEvents } from "@/api/events";
import { getEventSections } from "@/api/staff";
import { saveVenueProject, getWorkspaceVenueProjects } from "@/api/venues";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venue-designer/$projectId")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      template: search.template as TemplateId | undefined,
      pitchType: search.pitchType as PitchType | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Venue Seating & Ticketing — Agatike" },
      {
        name: "description",
        content: "Commercial interactive ticketing map.",
      },
    ],
  }),
  component: VenueDesignerPage,
});

function VenueDesignerPage() {
  const { workspaceSlug, projectId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });
  const { activeWorkspace } = useWorkspace();

  const { data: dbProjects = [] } = useQuery({
    queryKey: ["venue-projects", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceVenueProjects({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const currentProject = dbProjects.find((p: any) => p.id === projectId);

  // Calculate target capacity based on remaining tickets for the matching tour stop
  const currentEvent = events.find((e: any) => e.id === currentProject?.event_id);
  const targetStopIdx = currentProject?.tour_stop_idx ?? 0;
  const targetCapacity = currentEvent?.event_tickets
    ?.filter((t: any) => t.tour_stop_idx === targetStopIdx)
    .reduce((sum: number, t: any) => sum + (parseInt(t.remaining) || 0), 0) || 0;

  // Global State for the Venue Template
  const [template, setTemplate] = useState<VenueTemplate>(getTemplate(search.template || "blank"));
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState<string>("#ffffff");
  const [toolMode, setToolMode] = useState<"select" | "draw" | "text">("select");

  // Load project or initialize from template
  useEffect(() => {
    if (currentProject) {
      if (currentProject.sections_data && currentProject.sections_data.length > 0) {
        setSections(currentProject.sections_data);
      } else if (search.template && search.template !== "blank") {
        setSections(getTemplate(search.template).sections);
      } else if (search.template === "blank" && search.pitchType && search.pitchType !== "none") {
        setSections([
          {
            id: `sec-pitch-${Date.now()}`,
            name: "Stage/Pitch",
            color: "transparent",
            rows: 0,
            cols: 0,
            capacity: 0,
            type: "reserved",
            priceZone: "A",
            visible: true,
            shape: "pitch",
            pitchType: search.pitchType,
            x: 0,
            y: 0,
            rotation: 0,
          },
        ]);
      }
      setCanvasBg(currentProject.canvas_bg || "#ffffff");

      const t = getTemplate(search.template || "blank");
      t.boundaryShape = currentProject.boundary_shape || t.boundaryShape;
      t.boundaryWidth = currentProject.boundary_width || t.boundaryWidth;
      t.boundaryHeight = currentProject.boundary_height || t.boundaryHeight;
      t.boundaryRx = currentProject.boundary_rx || t.boundaryRx;
      setTemplate(t);
    }
  }, [currentProject, search.template, search.pitchType]);

  const [past, setPast] = useState<Section[][]>([]);

  const saveHistory = useCallback((currentSections: Section[]) => {
    setPast((p) => {
      if (p.length > 0 && JSON.stringify(p[p.length - 1]) === JSON.stringify(currentSections))
        return p;
      return [...p, currentSections].slice(-50);
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const newPast = [...p];
      const previous = newPast.pop()!;
      setSections(previous);
      return newPast;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      if (!activeSection) return;

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setSections((prev) => {
          saveHistory(prev);
          return prev.filter((s) => s.id !== activeSection);
        });
        setActiveSection(null);
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setSections((prev) => {
          saveHistory(prev);
          return prev.map((s) => {
            if (s.id !== activeSection) return s;
            const step = e.shiftKey ? 10 : 1;
            let dx = 0,
              dy = 0;
            if (e.key === "ArrowUp") dy = -step;
            if (e.key === "ArrowDown") dy = step;
            if (e.key === "ArrowLeft") dx = -step;
            if (e.key === "ArrowRight") dx = step;
            return { ...s, x: s.x + dx, y: s.y + dy };
          });
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, saveHistory, undo]);

  // (loadTemplate and startDesign removed since they belong to setup phase)

  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const duplicateSection = (id: string) => {
    const original = sections.find((s) => s.id === id);
    if (!original) return;
    saveHistory(sections);
    const clone: Section = {
      ...original,
      id: `sec-${Date.now()}`,
      name: `${original.name} (copy)`,
      x: (original.x ?? 0) + 30,
      y: (original.y ?? 0) + 30,
    };
    setSections((prev) => [...prev, clone]);
    setActiveSection(clone.id);
  };

  const addSection = (
    shape: "rect" | "arc" | "polygon" | "path" | "pitch",
    type: "reserved" | "general_admission" | "vip" = "reserved",
    customPoints?: string,
    customPathData?: string,
    pitchType?: PitchType,
    config?: Partial<Section>,
  ) => {
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      name: shape === "pitch" ? "Stage/Pitch" : `New Section ${sections.length + 1}`,
      color: type === "vip" ? "#f59e0b" : shape === "pitch" ? "transparent" : "#0ea5e9",
      rows: shape === "pitch" ? 0 : 10,
      cols: shape === "pitch" ? 0 : 20,
      capacity: shape === "pitch" ? 0 : 200,
      type: type,
      priceZone: "A",
      visible: true,
      shape: shape,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: shape === "rect" ? 100 : undefined,
      height: shape === "rect" ? 80 : undefined,
      innerRadius: shape === "arc" ? 100 : undefined,
      outerRadius: shape === "arc" ? 180 : undefined,
      startAngle: shape === "arc" ? -30 : undefined,
      endAngle: shape === "arc" ? 30 : undefined,
      points: shape === "polygon" ? customPoints || "-40,-40 40,-40 40,40 -40,40" : undefined,
      pathData: shape === "path" ? customPathData : undefined,
      pitchType: shape === "pitch" ? pitchType : undefined,
      ...config,
    };
    saveHistory(sections);
    setSections([...sections, newSec]);
    setActiveSection(newSec.id);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveVenueProject({
        data: {
          venue_project_id: projectId,
          workspace_id: activeWorkspace?.id,
          name: currentProject?.name,
          event_id: currentProject?.event_id,
          canvas_bg: canvasBg,
          boundary: {
            shape: template.boundaryShape,
            width: template.boundaryWidth,
            height: template.boundaryHeight,
            rx: template.boundaryRx,
          },
          sections,
        },
      } as any),
    onSuccess: () => {
      toast.success("Venue project saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save venue project.");
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  // Mock stats
  const stats = {
    total: sections.reduce((acc, s) => acc + (s.capacity || 0), 0),
    vip: sections.filter((s) => s.type === "vip").reduce((acc, s) => acc + (s.capacity || 0), 0),
    acc: 0,
    blocked: 0,
    revenue: sections.reduce((acc, s) => acc + (s.capacity || 0) * 100, 0),
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <header className="flex-none flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/$workspaceSlug/venue-designer"
            params={{ workspaceSlug }}
            className="rounded-full hover:bg-secondary transition-colors p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Dashboard / Ticketing</p>
            <h1 className="text-lg font-semibold tracking-tight">
              {currentProject?.name || "Venue Builder"}
            </h1>
          </div>
        </div>

        {/* Center Toolbar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/60 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2.5 ${toolMode === "select" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setToolMode("select")}
          >
            <MousePointer2 className="h-4 w-4 mr-1.5" /> Select
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={() =>
              addSection("rect", "reserved", undefined, undefined, undefined, {
                name: "Text",
                width: 150,
                height: 40,
                color: "transparent",
              })
            }
          >
            <Type className="h-4 w-4 mr-1.5" /> Text
          </Button>
          <div className="w-px h-4 bg-border/60 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2.5 ${toolMode === "draw" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => {
              setToolMode("draw");
              setActiveSection(null);
            }}
          >
            <PenTool className="h-4 w-4 mr-1.5" /> Draw
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4 mr-1.5" /> Share
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full flex items-center gap-2 border">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Auto-saving
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Template
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Elements Palette */}
        <div className="w-80 border-r flex flex-col bg-card/30 h-full overflow-y-auto custom-scrollbar">
          <VenueSidebar
            venueName={currentProject?.name || "Untitled"}
            setVenueName={() => {}}
            eventName={
              events.find((e) => e.id === currentProject?.event_id)?.title || "Unknown Event"
            }
            setEventName={() => {}}
            templateId={search.template || "blank"}
            applyTemplate={() => {}}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            addSection={addSection}
            removeSection={(id) => {
              saveHistory(sections);
              setSections((prev) => prev.filter((s) => s.id !== id));
            }}
          />
        </div>

        {/* Center: Interactive SVG Canvas */}
        <div className="flex-1 p-6 bg-secondary/5">
          <VenueCanvas
            venueName={currentProject?.name || "Untitled"}
            eventName={
              events.find((e) => e.id === currentProject?.event_id)?.title || "Unknown Event"
            }
            template={template}
            sections={sections}
            seats={[]}
            paintSeat={() => {}}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            updateSection={updateSection}
            saveHistory={() => saveHistory(sections)}
            canvasBg={canvasBg}
            removeSection={(id) => {
              saveHistory(sections);
              setSections((prev) => prev.filter((s) => s.id !== id));
              setActiveSection(null);
            }}
            duplicateSection={duplicateSection}
            addSection={addSection}
            toolMode={toolMode}
            setToolMode={setToolMode}
          />
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 border-l bg-card/30 p-4">
          <VenueProperties
            stats={stats}
            targetCapacity={targetCapacity}
            activeSection={activeSection}
            sections={sections}
            updateSection={updateSection}
            addSection={addSection}
            removeSection={(id) => {
              saveHistory(sections);
              setSections((prev) => prev.filter((s) => s.id !== id));
              setActiveSection(null);
            }}
            canvasBg={canvasBg}
            setCanvasBg={setCanvasBg}
          />
        </div>
      </div>
    </div>
  );
}
