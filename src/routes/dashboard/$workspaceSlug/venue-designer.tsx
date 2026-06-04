import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, LayoutTemplate, Circle, Square, LayoutDashboard } from "lucide-react";

import { VenueCanvas } from "@/components/venue-designer/VenueCanvas";
import { VenueSidebar } from "@/components/venue-designer/VenueSidebar";
import { VenueProperties } from "@/components/venue-designer/VenueProperties";
import { Section, TemplateId, VenueTemplate } from "@/components/venue-designer/types";
import { templates, getTemplate } from "@/components/venue-designer/templates";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venue-designer")({
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

type SetupStep = "SELECT_TEMPLATE" | "CONFIGURE_BLANK" | "DESIGN_CANVAS";

function VenueDesignerPage() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/venue-designer" });

  const [setupStep, setSetupStep] = useState<SetupStep>("SELECT_TEMPLATE");
  
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("blank");
  const [customBoundaryShape, setCustomBoundaryShape] = useState<"rect" | "circle" | "oval">("rect");

  const [customPitchType, setCustomPitchType] = useState<PitchType>("none");

  // Global State for the Venue Template
  const [template, setTemplate] = useState<VenueTemplate>(getTemplate("blank"));
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const loadTemplate = (id: TemplateId) => {
    const t = getTemplate(id);
    setActiveTemplate(id);
    setTemplate(t);
    setSections(t.sections);
    setActiveSection(null);
    setSetupStep("DESIGN_CANVAS");
  };

  const handleStartBlank = () => {
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
    setSections([]);
    setActiveSection(null);
    setSetupStep("DESIGN_CANVAS");
  };

  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const addSection = (shape: "rect" | "arc" | "polygon" | "path", type: "reserved" | "general_admission" | "vip" = "reserved", customPoints?: string, customPathData?: string) => {
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      name: `New Section ${sections.length + 1}`,
      color: type === "vip" ? "#f59e0b" : "#0ea5e9",
      rows: 10,
      cols: 20,
      capacity: 200,
      type: type,
      priceZone: "A",
      visible: true,
      shape: shape,
      x: 0,
      y: 0,
      rotation: 0,
      width: shape === "rect" ? 100 : undefined,
      height: shape === "rect" ? 80 : undefined,
      innerRadius: shape === "arc" ? 100 : undefined,
      outerRadius: shape === "arc" ? 180 : undefined,
      startAngle: shape === "arc" ? -30 : undefined,
      endAngle: shape === "arc" ? 30 : undefined,
      points: shape === "polygon" ? (customPoints || "-40,-40 40,-40 40,40 -40,40") : undefined,
      pathData: shape === "path" ? customPathData : undefined,
    };
    setSections([...sections, newSec]);
    setActiveSection(newSec.id);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Create a Venue</h1>
        <p className="text-muted-foreground mb-12 max-w-lg text-center">
          Choose a pre-built template to get started instantly, or start with a blank canvas to design a custom venue from scratch.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
          {/* Blank Canvas Card */}
          <div 
            className="group relative rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-card/30 p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-card/50"
            onClick={() => { setActiveTemplate("blank"); setSetupStep("CONFIGURE_BLANK"); }}
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

  if (setupStep === "CONFIGURE_BLANK") {
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 py-20">
        <Button variant="ghost" className="absolute top-8 left-8" onClick={() => setSetupStep("SELECT_TEMPLATE")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Set up your canvas</h1>
        <p className="text-muted-foreground mb-12">Configure the boundary shape and the central focal point.</p>

        <div className="w-full max-w-5xl space-y-12 mb-12">
          {/* Step 1: Boundary */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">1. Venue Boundary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`rounded-2xl border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${customBoundaryShape === 'rect' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                onClick={() => setCustomBoundaryShape('rect')}
              >
                <Square className="h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium">Rectangle</h3>
              </div>
              <div 
                className={`rounded-2xl border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${customBoundaryShape === 'circle' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                onClick={() => setCustomBoundaryShape('circle')}
              >
                <Circle className="h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium">Circle</h3>
              </div>
              <div 
                className={`rounded-2xl border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${customBoundaryShape === 'oval' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                onClick={() => setCustomBoundaryShape('oval')}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>
                <h3 className="font-medium">Oval</h3>
              </div>
            </div>
          </div>

          {/* Step 2: Focal Point */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">2. Select Focal Point (Pitch/Stage)</h2>
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
        </div>

        <Button size="lg" className="w-full max-w-sm" onClick={handleStartBlank}>
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
          <Button variant="default" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Elements Palette */}
        <div className="w-80 border-r flex flex-col bg-card/30 h-full overflow-y-auto custom-scrollbar">
          <VenueSidebar
            venueName="Custom Venue"
            setVenueName={() => {}}
            eventName="New Event"
            setEventName={() => {}}
            templateId={activeTemplate}
            applyTemplate={loadTemplate}
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            addSection={addSection}
            removeSection={(id) => setSections(prev => prev.filter(s => s.id !== id))}
          />
        </div>

        {/* Center: Interactive SVG Canvas */}
        <div className="flex-1 p-6 bg-secondary/5">
          <VenueCanvas
            venueName="Custom Venue"
            eventName="New Event"
            template={template}
            sections={sections}
            seats={[]}
            paintSeat={() => {}}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            updateSection={updateSection}
          />
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 border-l bg-card/30 p-4">
          <VenueProperties
            stats={stats}
            activeSection={activeSection}
            sections={sections}
            updateSection={updateSection}
          />
        </div>
      </div>
    </div>
  );
}
