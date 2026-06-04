import { useState } from "react";
import { Grid3x3, LayoutGrid, Plus, Trash2, Square, CircleDashed, Star, Hexagon, Settings, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, TemplateId, VenueTemplate } from "./types";

function Panel({
  title,
  icon: Icon,
  children,
  action,
  defaultOpen = true,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm mb-4 overflow-hidden transition-all duration-200">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-secondary/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function VenueSidebar({
  venueName,
  setVenueName,
  eventName,
  setEventName,
  templateId,
  applyTemplate,
  sections,
  activeSection,
  setActiveSection,
  addSection,
  removeSection,
}: {
  venueName: string;
  setVenueName: (v: string) => void;
  eventName: string;
  setEventName: (v: string) => void;
  templateId: TemplateId;
  applyTemplate: (id: TemplateId) => void;
  sections: Section[];
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
  addSection: (shape: "rect" | "arc" | "polygon" | "path" | "pitch", type?: "reserved" | "general_admission" | "vip", customPoints?: string, customPathData?: string, pitchType?: any, config?: Partial<Section>) => void;
  removeSection: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'elements' | 'sections' | 'settings'>('elements');
  return (
    <aside className="flex flex-col h-full overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-border/60 bg-card">
        <button 
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'elements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}
        >
          <Plus className="w-4 h-4 mx-auto mb-1" />
          Elements
        </button>
        <button 
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'sections' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}
        >
          <Layers className="w-4 h-4 mx-auto mb-1" />
          Sections
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}
        >
          <Settings className="w-4 h-4 mx-auto mb-1" />
          Settings
        </button>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {activeTab === 'settings' && (
          <Panel title="Venue Settings" icon={Grid3x3}>
            <div className="space-y-4">
              <Field label="Venue name">
                <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              </Field>
              <Field label="Event name">
                <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </Field>
              {/* Note: Changing Pitch mid-design can be added here later */}
            </div>
          </Panel>
        )}

        {activeTab === 'elements' && (
          <>
            <Panel title="Basic Blocks" icon={Plus}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('rect', 'reserved')}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-medium">Standard Block</span>
                </button>
                <button
                  onClick={() => addSection('arc', 'reserved')}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <CircleDashed className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-medium">Curved Area</span>
                </button>
                <button
                  onClick={() => addSection('rect', 'vip')}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-orange-500/50 hover:bg-secondary/50"
                >
                  <Star className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium">VIP Box</span>
                </button>
                <button
                  onClick={() => addSection('rect', 'reserved', undefined)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <div className="w-2 h-6 border-2 border-muted-foreground rounded-sm"></div>
                  <span className="text-xs font-medium">Connector Tab</span>
                </button>
              </div>
            </Panel>

            <Panel title="Drawing Blocks" icon={Plus} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('path', 'general_admission', undefined, "M 0,-40 A 40 40 0 1 1 0,40 A 40 40 0 1 1 0,-40 Z", undefined, { name: 'Circle Block' })}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <CircleDashed className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-medium">Circle</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'general_admission', "0,-40 40,40 -40,40", undefined, undefined, { name: 'Triangle Block' })}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-50 -50 100 100" fill="currentColor" className="text-muted-foreground"><polygon points="0,-40 40,40 -40,40"/></svg>
                  <span className="text-xs font-medium">Triangle</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'general_admission', "0,-40 40,0 0,40 -40,0", undefined, undefined, { name: 'Diamond Block' })}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-50 -50 100 100" fill="currentColor" className="text-muted-foreground"><polygon points="0,-40 40,0 0,40 -40,0"/></svg>
                  <span className="text-xs font-medium">Diamond</span>
                </button>
                <button
                  onClick={() => addSection('rect', 'general_admission', undefined, undefined, undefined, { name: 'Divider Line', height: 8, capacity: 0, rows: 0, cols: 0, width: 200, color: '#444444' })}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <div className="w-10 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-xs font-medium">Divider Line</span>
                </button>
              </div>
            </Panel>

            <Panel title="Angles & Notches" icon={LayoutGrid} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('polygon', 'reserved', "-63,-22 -63,22 3,-12 63,-12 63,-22")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-70 -30 140 60" fill="currentColor" className="text-muted-foreground"><polygon points="-63,-22 -63,22 3,-12 63,-12 63,-22"/></svg>
                  <span className="text-xs font-medium">Notch Top-Left</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-63,-22 63,-22 63,-12 3,22 -63,-12")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-70 -30 140 60" fill="currentColor" className="text-muted-foreground"><polygon points="-63,-22 63,-22 63,-12 3,22 -63,-12"/></svg>
                  <span className="text-xs font-medium">Notch Btm-Left</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-40,-50 -40,50 0,50 40,10 40,-50")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-50 -60 100 120" fill="currentColor" className="text-muted-foreground"><polygon points="-40,-50 -40,50 0,50 40,10 40,-50"/></svg>
                  <span className="text-xs font-medium">Outer Top-Left</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-50,-10 -10,-50 50,-50 50,50 -50,50")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                   <svg width="24" height="24" viewBox="-60 -60 120 120" fill="currentColor" className="text-muted-foreground"><polygon points="-50,-10 -10,-50 50,-50 50,50 -50,50"/></svg>
                  <span className="text-xs font-medium">Outer Corner</span>
                </button>
              </div>
            </Panel>

            <Panel title="Wedges" icon={LayoutGrid} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('polygon', 'reserved', "-70,85 -70,-15 0,-85 70,-85 30,85")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-80 -90 160 180" fill="currentColor" className="text-muted-foreground"><polygon points="-70,85 -70,-15 0,-85 70,-85 30,85"/></svg>
                  <span className="text-xs font-medium">Wedge Top-Left</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "70,85 70,-15 0,-85 -70,-85 -30,85")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-80 -90 160 180" fill="currentColor" className="text-muted-foreground"><polygon points="70,85 70,-15 0,-85 -70,-85 -30,85"/></svg>
                  <span className="text-xs font-medium">Wedge Top-Right</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-70,-80 30,-80 70,80 0,80 -70,0")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-80 -90 160 180" fill="currentColor" className="text-muted-foreground"><polygon points="-70,-80 30,-80 70,80 0,80 -70,0"/></svg>
                  <span className="text-xs font-medium">Wedge Btm-Left</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "70,-80 -30,-80 -70,80 0,80 70,0")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-80 -90 160 180" fill="currentColor" className="text-muted-foreground"><polygon points="70,-80 -30,-80 -70,80 0,80 70,0"/></svg>
                  <span className="text-xs font-medium">Wedge Btm-Right</span>
                </button>
              </div>
            </Panel>

            <Panel title="Trapezoids & Diagonals" icon={LayoutGrid} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection('polygon', 'reserved', "-37,-19 37,-19 29,19 -29,19")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-50 -30 100 60" fill="currentColor" className="text-muted-foreground"><polygon points="-37,-19 37,-19 29,19 -29,19"/></svg>
                  <span className="text-xs font-medium">Inner Top</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-40,-20 40,-20 34,20 -34,20")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-50 -30 100 60" fill="currentColor" className="text-muted-foreground"><polygon points="-40,-20 40,-20 34,20 -34,20"/></svg>
                  <span className="text-xs font-medium">Inner Bottom</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-52,22 52,22 40,-22 -40,-22")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-60 -30 120 60" fill="currentColor" className="text-muted-foreground"><polygon points="-52,22 52,22 40,-22 -40,-22"/></svg>
                  <span className="text-xs font-medium">Outer Top</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-56,-22 56,-22 48,22 -48,22")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-60 -30 120 60" fill="currentColor" className="text-muted-foreground"><polygon points="-56,-22 56,-22 48,22 -48,22"/></svg>
                  <span className="text-xs font-medium">Outer Bottom</span>
                </button>
                <button
                  onClick={() => addSection('path', 'reserved', undefined, "M -50,5 Q 0,-45 50,5 L 40,45 Q 0,0 -40,45 Z")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-60 -50 120 100" fill="currentColor" className="text-muted-foreground"><path d="M -50,5 Q 0,-45 50,5 L 40,45 Q 0,0 -40,45 Z"/></svg>
                  <span className="text-xs font-medium">Inner Ring Curve</span>
                </button>
                <button
                  onClick={() => addSection('polygon', 'reserved', "-25,66 -25,-54 25,-66 25,54")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-center transition hover:border-primary/50 hover:bg-secondary/50"
                >
                  <svg width="24" height="24" viewBox="-30 -70 60 140" fill="currentColor" className="text-muted-foreground"><polygon points="-25,66 -25,-54 25,-66 25,54"/></svg>
                  <span className="text-xs font-medium">Narrow Angle</span>
                </button>
              </div>
            </Panel>
          </>
        )}

        {activeTab === 'sections' && (
          <Panel title="Added Sections" icon={Layers}>
            <div className="space-y-2">
              {sections.length === 0 && (
                <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  No sections yet. Add some from the Elements tab.
                </p>
              )}
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                    activeSection === s.id
                      ? "border-primary bg-accent/40 shadow-sm"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <span className="h-5 w-5 rounded-md shadow-sm" style={{ background: s.color }} />
                  <span className="flex-1 font-medium truncate">{s.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {s.rows}×{s.cols}
                  </span>
                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(s.id);
                    }}
                    className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors ml-1"
                  />
                </button>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </aside>
  );
}
