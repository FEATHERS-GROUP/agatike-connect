import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, LayoutTemplate, Circle, Square, LayoutDashboard, Loader2 } from "lucide-react";

import { VenueCanvas } from "@/components/venue-designer/VenueCanvas";
import { VenueSidebar } from "@/components/venue-designer/VenueSidebar";
import { VenueProperties } from "@/components/venue-designer/VenueProperties";
import { Section, TemplateId, VenueTemplate, PitchType } from "@/components/venue-designer/types";
import { templates, getTemplate } from "@/components/venue-designer/templates";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspaceEvents } from "@/api/events";
import { getEventSections } from "@/api/staff";
import { saveVenueProject } from "@/api/venues";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venue-designer")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      step: search.step as string | undefined,
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

type SetupStep = "SELECT_TEMPLATE" | "CONFIGURE_PROJECT" | "DESIGN_CANVAS";

function VenueDesignerPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });
  const { activeWorkspace } = useWorkspace();

  // Fetch real events for the workspace
  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  
  // Fetch event sections for selected event
  const { data: eventSections = [] } = useQuery({
    queryKey: ["event-sections", selectedEventId],
    queryFn: () => getEventSections({ data: { event_id: selectedEventId } } as any),
    enabled: !!selectedEventId,
  });

  const setupStep = (search.step as SetupStep) || "SELECT_TEMPLATE";
  const setSetupStep = (newStep: SetupStep) => {
    navigate({ search: { step: newStep }, replace: true });
  };
  
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("blank");
  const [customBoundaryShape, setCustomBoundaryShape] = useState<"rect" | "circle" | "oval" | "d_shape" | "horseshoe" | "diamond" | "hexagon" | "octagon">("rect");
  const [customPitchType, setCustomPitchType] = useState<PitchType>("none");

  // Project Metadata
  const [projectName, setProjectName] = useState("New Venue Project");
  const [selectedEventSectionId, setSelectedEventSectionId] = useState<string>("");

  // Global State for the Venue Template
  const [template, setTemplate] = useState<VenueTemplate>(getTemplate("blank"));
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState<string>("#ffffff");

  const [past, setPast] = useState<Section[][]>([]);
  
  const saveHistory = useCallback((currentSections: Section[]) => {
    setPast(p => {
      if (p.length > 0 && JSON.stringify(p[p.length - 1]) === JSON.stringify(currentSections)) return p;
      return [...p, currentSections].slice(-50);
    });
  }, []);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const newPast = [...p];
      const previous = newPast.pop()!;
      setSections(previous);
      return newPast;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (!activeSection) return;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setSections(prev => {
          saveHistory(prev);
          return prev.filter(s => s.id !== activeSection);
        });
        setActiveSection(null);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSections(prev => {
          saveHistory(prev);
          return prev.map(s => {
            if (s.id !== activeSection) return s;
            const step = e.shiftKey ? 10 : 1;
            let dx = 0, dy = 0;
            if (e.key === 'ArrowUp') dy = -step;
            if (e.key === 'ArrowDown') dy = step;
            if (e.key === 'ArrowLeft') dx = -step;
            if (e.key === 'ArrowRight') dx = step;
            return { ...s, x: s.x + dx, y: s.y + dy };
          });
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, saveHistory, undo]);

  const loadTemplate = (id: TemplateId) => {
    const t = getTemplate(id);
    setActiveTemplate(id);
    setTemplate(t);
    setSections(t.sections);
    setActiveSection(null);
    setSetupStep("CONFIGURE_PROJECT");
  };

  const startDesign = () => {
    const blankTemplate = getTemplate("blank");
    blankTemplate.boundaryShape = customBoundaryShape;
    blankTemplate.pitchType = customPitchType;
    if (customBoundaryShape === "circle") {
      blankTemplate.boundaryWidth = 1000;
      blankTemplate.boundaryHeight = 1000;
    } else if (customBoundaryShape === "oval") {
      blankTemplate.boundaryWidth = 1200;
      blankTemplate.boundaryHeight = 800;
    } else {
      blankTemplate.boundaryWidth = 1200;
      blankTemplate.boundaryHeight = 900;
    }
    setTemplate(blankTemplate);
    if (customPitchType !== "none") {
      setSections([{
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
        pitchType: customPitchType,
        x: 0,
        y: 0,
        rotation: 0
      }]);
    } else {
      setSections([]);
    }
    setActiveSection(null);
    setSetupStep("DESIGN_CANVAS");
  };

  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const duplicateSection = (id: string) => {
    const original = sections.find(s => s.id === id);
    if (!original) return;
    saveHistory(sections);
    const clone: Section = {
      ...original,
      id: `sec-${Date.now()}`,
      name: `${original.name} (copy)`,
      x: (original.x ?? 0) + 30,
      y: (original.y ?? 0) + 30,
    };
    setSections(prev => [...prev, clone]);
    setActiveSection(clone.id);
  };

  const addSection = (shape: "rect" | "arc" | "polygon" | "path" | "pitch", type: "reserved" | "general_admission" | "vip" = "reserved", customPoints?: string, customPathData?: string, pitchType?: PitchType, config?: Partial<Section>) => {
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
      points: shape === "polygon" ? (customPoints || "-40,-40 40,-40 40,40 -40,40") : undefined,
      pathData: shape === "path" ? customPathData : undefined,
      pitchType: shape === "pitch" ? pitchType : undefined,
      ...config
    };
    saveHistory(sections);
    setSections([...sections, newSec]);
    setActiveSection(newSec.id);
  };

  const saveMutation = useMutation({
    mutationFn: () => saveVenueProject({
      data: {
        workspace_id: activeWorkspace?.id,
        name: projectName,
        canvas_bg: canvasBg,
        boundary: {
          shape: template.boundaryShape,
          width: template.boundaryWidth,
          height: template.boundaryHeight,
          rx: template.boundaryRx
        },
        sections,
        event_section_id: selectedEventSectionId || undefined
      }
    } as any),
    onSuccess: () => {
      toast.success("Venue project saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save venue project.");
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  // Mock stats
  const stats = {
    total: sections.reduce((acc, s) => acc + (s.capacity || 0), 0),
    vip: sections.filter(s => s.type === 'vip').reduce((acc, s) => acc + (s.capacity || 0), 0),
    acc: 0,
    blocked: 0,
    revenue: sections.reduce((acc, s) => acc + (s.capacity || 0) * 100, 0),
  };

  if (setupStep === "SELECT_TEMPLATE") {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Create a Venue</h1>
        <p className="text-muted-foreground mb-12 max-w-lg text-center">
          Choose a pre-built template to get started instantly, or start with a blank canvas to design a custom venue from scratch.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
          {/* Blank Canvas Card */}
          <div 
            className="group relative rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-card/30 p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-card/50"
            onClick={() => { setActiveTemplate("blank"); setSetupStep("CONFIGURE_PROJECT"); }}
          >
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Blank Canvas</h3>
              <p className="text-sm text-muted-foreground mt-1">Design a custom layout</p>
            </div>
          </div>

          {/* Templates */}
          {templates.filter(t => t.id !== "blank").map((t) => (
            <div 
              key={t.id}
              className="group relative rounded-2xl border border-border/60 bg-card p-6 flex flex-col gap-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => loadTemplate(t.id)}
            >
              <div className="h-40 w-full rounded-xl bg-secondary/50 border border-white/5 flex items-center justify-center overflow-hidden relative">
                <t.icon className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (setupStep === "CONFIGURE_PROJECT") {
    const isBlank = activeTemplate === "blank";
    const pitchOptions: {id: PitchType, label: string, icon: string}[] = [
      { id: "none", label: "Empty Center", icon: "⬛" },
      { id: "basketball", label: "Basketball", icon: "🏀" },
      { id: "football", label: "Football", icon: "⚽" },
      { id: "handball", label: "Handball", icon: "🤾" },
      { id: "volleyball", label: "Volleyball", icon: "🏐" },
      { id: "stage_concert", label: "Concert Stage", icon: "🎸" },
      { id: "stage_thrust", label: "Thrust Stage", icon: "🎭" },
      { id: "stage_round", label: "360° Stage", icon: "🏟️" },
      { id: "ring_boxing", label: "Boxing Ring", icon: "🥊" },
      { id: "runway", label: "Fashion Runway", icon: "✨" },
    ];

    return (
      <div className="w-full flex flex-col items-center justify-center py-12 relative">
        <Button variant="ghost" className="absolute top-0 left-0" onClick={() => setSetupStep("SELECT_TEMPLATE")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Project Settings</h1>
        <p className="text-muted-foreground mb-12">Configure your venue project and link it to an event.</p>

        <div className="w-full max-w-5xl space-y-12 mb-12">
          {/* Metadata Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">1. Project Details</h2>
            <div className="max-w-md mx-auto space-y-4 bg-secondary/10 p-6 rounded-2xl border border-border/60">
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link to Event</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setSelectedEventSectionId("");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">-- Select an Event --</option>
                  {events.map(evt => <option key={evt.id} value={evt.id}>{evt.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link to Event Section (Room)</label>
                <select 
                  value={selectedEventSectionId}
                  onChange={(e) => setSelectedEventSectionId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={!selectedEventId}
                >
                  <option value="">-- Select a Section --</option>
                  {eventSections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">This binds your visual map to a macro security zone / room.</p>
              </div>
            </div>
          </div>

          {/* Conditional Geometry Configuration for Blank Canvas */}
          {isBlank && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-4 text-center">2. Venue Boundary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'rect' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('rect')}
                  >
                    <Square className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Rectangle</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'circle' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('circle')}
                  >
                    <Circle className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Circle</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'oval' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('oval')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>
                    <h3 className="font-medium text-sm">Oval</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'd_shape' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('d_shape')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M 4 20 L 20 20 L 20 12 A 8 8 0 0 0 4 12 Z"/></svg>
                    <h3 className="font-medium text-sm">Stadium (D)</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'horseshoe' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('horseshoe')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M 6 20 L 6 12 A 6 6 0 0 1 18 12 L 18 20"/></svg>
                    <h3 className="font-medium text-sm">Horseshoe</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'diamond' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('diamond')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M 12 2 L 22 12 L 12 22 L 2 12 Z"/></svg>
                    <h3 className="font-medium text-sm">Diamond</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'hexagon' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('hexagon')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M 21 16 L 21 8 L 12 2 L 3 8 L 3 16 L 12 22 Z"/></svg>
                    <h3 className="font-medium text-sm">Hexagon</h3>
                  </div>
                  <div 
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customBoundaryShape === 'octagon' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                    onClick={() => setCustomBoundaryShape('octagon')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M 7.7 2 L 16.3 2 L 22 7.7 L 22 16.3 L 16.3 22 L 7.7 22 L 2 16.3 L 2 7.7 Z"/></svg>
                    <h3 className="font-medium text-sm">Octagon</h3>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-center">3. Select Focal Point (Pitch/Stage)</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {pitchOptions.map(p => (
                    <div
                      key={p.id}
                      className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${customPitchType === p.id ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                      onClick={() => setCustomPitchType(p.id)}
                    >
                      <span className="text-3xl">{p.icon}</span>
                      <span className="text-xs font-medium text-center">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Button size="lg" className="px-12 rounded-full h-12 text-md" onClick={startDesign}>
          Start Designing
        </Button>
      </div>
    );
  }

  // DESIGN_CANVAS
  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <header className="flex-none flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSetupStep("SELECT_TEMPLATE")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">Dashboard / Ticketing</p>
            <h1 className="text-lg font-semibold tracking-tight">Venue Builder</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full flex items-center gap-2 border">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Auto-saving
          </div>
          <Button variant="default" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Elements Palette */}
        <div className="w-80 border-r flex flex-col bg-card/30 h-full overflow-y-auto custom-scrollbar">
          <VenueSidebar
            venueName={projectName}
            setVenueName={setProjectName}
            eventName={events.find(e => e.id === selectedEventId)?.title || "Unknown Event"}
            setEventName={() => {}}
            templateId={activeTemplate}
            applyTemplate={loadTemplate}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            addSection={addSection}
            removeSection={(id) => {
              saveHistory(sections);
              setSections(prev => prev.filter(s => s.id !== id));
            }}
          />
        </div>

        {/* Center: Interactive SVG Canvas */}
        <div className="flex-1 p-6 bg-secondary/5">
          <VenueCanvas
            venueName={projectName}
            eventName={events.find(e => e.id === selectedEventId)?.title || "Unknown Event"}
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
              setSections(prev => prev.filter(s => s.id !== id));
              setActiveSection(null);
            }}
            duplicateSection={duplicateSection}
          />
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 border-l bg-card/30 p-4">
          <VenueProperties 
            stats={stats} 
            activeSection={activeSection} 
            sections={sections}
            updateSection={updateSection}
            addSection={addSection}
            removeSection={(id) => {
              saveHistory(sections);
              setSections(prev => prev.filter(s => s.id !== id));
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
