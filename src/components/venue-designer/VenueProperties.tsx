import { useState } from "react";
import {
  Crown,
  Square,
  Users,
  Layers,
  Settings2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "./types";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm mb-5 overflow-hidden transition-all duration-200">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-secondary/20 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
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

/** A numeric input that lets users freely clear the field and type a new value.
 *  The actual section state is only updated when the user leaves the field (blur)
 *  or presses Enter — not on every keystroke, so empty strings never trigger a reset. */
function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  className,
  suffix,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  suffix?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string>(value != null ? String(value) : "");

  // Sync draft when the external value changes (e.g. from canvas drag)
  const strValue = value != null ? String(value) : "";
  if (draft !== strValue && document.activeElement?.getAttribute("data-numericinput") !== "true") {
    // Only sync if the field isn't focused (user isn't actively typing)
  }

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      // Reset draft to last known good value
      setDraft(value != null ? String(value) : "");
    }
  };

  return (
    <div className="relative">
      <Input
        data-numericinput="true"
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        placeholder={placeholder}
        className={suffix ? `pr-8 ${className ?? ""}` : className}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {suffix && (
        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3 bg-secondary/20">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}

export function VenueProperties({
  stats,
  activeSection,
  sections,
  updateSection,
  addSection,
  removeSection,
  canvasBg,
  setCanvasBg,
}: {
  stats: { total: number; vip: number; acc: number; blocked: number; revenue: number };
  activeSection: string | null;
  sections: Section[];
  updateSection: (id: string, patch: Partial<Section>) => void;
  addSection: (
    shape: "rect" | "arc" | "polygon" | "path" | "pitch",
    type?: "reserved" | "general_admission" | "vip",
    customPoints?: string,
    customPathData?: string,
    pitchType?: any,
  ) => void;
  removeSection: (id: string) => void;
  canvasBg: string;
  setCanvasBg: (color: string) => void;
}) {
  const sec = activeSection ? sections.find((s) => s.id === activeSection) : null;

  const pitchOptions = [
    { id: "basketball", label: "Basketball Court" },
    { id: "football", label: "Football Pitch" },
    { id: "handball", label: "Handball Court" },
    { id: "volleyball", label: "Volleyball Court" },
    { id: "tennis_court", label: "Tennis Court" },
    { id: "ice_rink", label: "Ice Rink" },
    { id: "ring_boxing", label: "Boxing Ring" },
    { id: "wrestling_mat", label: "Wrestling Mat" },
    { id: "stage_concert", label: "Concert Stage" },
    { id: "stage_thrust", label: "Thrust Stage" },
    { id: "stage_round", label: "360° Stage" },
    { id: "runway", label: "Fashion Runway" },
    { id: "orchestra_pit", label: "Orchestra Pit" },
    { id: "choral_risers", label: "Choral Risers" },
    { id: "dj_booth", label: "DJ Booth" },
    { id: "speaker_panel", label: "Speaker Panel" },
    { id: "podium_classic", label: "Classic Lectern" },
    { id: "podium_glass", label: "Glass Podium" },
    { id: "panel_table", label: "Panel Table" },
  ];

  return (
    <aside className="h-[calc(100vh-80px)] overflow-y-auto pb-20 pr-2 custom-scrollbar">
      <Panel title="Stages & Podiums" icon={Crown}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Add a new focal point to your venue. You can move and rotate it later.
          </p>
          <div className="flex gap-2">
            <select
              id="new-pitch-select"
              className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {pitchOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                const sel = document.getElementById("new-pitch-select") as HTMLSelectElement;
                addSection("pitch", "reserved", undefined, undefined, sel.value as any);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Venue Capacity" icon={Users}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Total capacity"
            value={sections.reduce((acc, s) => acc + (s.capacity || 0), 0).toLocaleString()}
          />
          <Stat label="Sections" value={sections.filter((s) => s.shape !== "pitch").length} />
        </div>
      </Panel>

      {!activeSection && (
        <Panel title="Canvas Settings" icon={Crown} defaultOpen={false}>
          <div className="space-y-4">
            <Field label="Background Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border/60 bg-transparent p-1"
                />
                <Input
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value)}
                  className="font-mono text-xs text-muted-foreground"
                />
              </div>
            </Field>
          </div>
        </Panel>
      )}

      {activeSection && sec && (
        <>
          <Panel title="Metadata & Inventory" icon={Settings2}>
            <div className="space-y-4">
              <Field label="Section Name">
                <Input
                  value={sec.name}
                  onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                />
              </Field>

              {sec.shape !== "pitch" && (
                <div className="rounded-xl border border-border/60 bg-secondary/10 p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Seating Capacity</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Number of Rows">
                      <Input
                        type="number"
                        value={sec.rows || 0}
                        onChange={(e) => {
                          const rows = +e.target.value;
                          const cols = sec.cols || 0;
                          updateSection(sec.id, { rows, capacity: rows * cols });
                        }}
                      />
                    </Field>
                    <Field label="Seats per row">
                      <Input
                        type="number"
                        value={sec.cols || 0}
                        onChange={(e) => {
                          const cols = +e.target.value;
                          const rows = sec.rows || 0;
                          updateSection(sec.id, { cols, capacity: rows * cols });
                        }}
                      />
                    </Field>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <Field label="Total Calculated Seats">
                      <div className="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-lg text-lg font-bold text-primary">
                        <span>{sec.capacity || 0}</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {sec.shape !== "pitch" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={sec.type || "reserved"}
                      onChange={(e) => updateSection(sec.id, { type: e.target.value as any })}
                    >
                      <option value="reserved">Reserved</option>
                      <option value="general_admission">General Adm.</option>
                      <option value="vip">VIP</option>
                    </select>
                  </Field>
                  <Field label="Price Zone">
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={sec.priceZone || "A"}
                      onChange={(e) => updateSection(sec.id, { priceZone: e.target.value })}
                    >
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                      <option value="D">Zone D</option>
                    </select>
                  </Field>
                </div>
              )}

              {sec.shape === "pitch" ? (
                <Field label="Stage / Pitch Type">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={sec.pitchType || "none"}
                    onChange={(e) => updateSection(sec.id, { pitchType: e.target.value as any })}
                  >
                    {pitchOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sec.color}
                      onChange={(e) => updateSection(sec.id, { color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-border/60 bg-transparent p-1"
                    />
                    <Input
                      value={sec.color}
                      readOnly
                      className="font-mono text-xs text-muted-foreground"
                    />
                  </div>
                </Field>
              )}

              {sec.shape !== "pitch" && (
                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    <Layers className="w-4 h-4 mr-2" />
                    Preview Seat Grid
                  </Button>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-border/50">
                <Button
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  variant="ghost"
                  onClick={() => removeSection(sec.id)}
                >
                  Delete {sec.shape === "pitch" ? "Stage" : "Section"}
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Vector Geometry" icon={Square} defaultOpen={false}>
            <div className="space-y-4">
              {sec.shape !== "pitch" && (
                <Field label="Shape Type">
                  <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                    <button
                      onClick={() =>
                        updateSection(sec.id, { shape: "rect", width: 150, height: 80 })
                      }
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === "rect" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Rectangle
                    </button>
                    <button
                      onClick={() =>
                        updateSection(sec.id, {
                          shape: "arc",
                          innerRadius: 150,
                          outerRadius: 220,
                          startAngle: 0,
                          endAngle: 90,
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === "arc" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Curved Arc
                    </button>
                    <button
                      onClick={() =>
                        updateSection(sec.id, { shape: "polygon", points: "0,0 100,0 80,80 20,80" })
                      }
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === "polygon" || sec.shape === "path" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Custom
                    </button>
                  </div>
                </Field>
              )}

              <div className="rounded-xl border border-border p-3 space-y-3 bg-secondary/5">
                {sec.shape === "arc" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Inner Radius">
                        <Input
                          type="number"
                          value={sec.innerRadius || 100}
                          onChange={(e) => updateSection(sec.id, { innerRadius: +e.target.value })}
                        />
                      </Field>
                      <Field label="Outer Radius">
                        <Input
                          type="number"
                          value={sec.outerRadius || 150}
                          onChange={(e) => updateSection(sec.id, { outerRadius: +e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`Start Angle (${sec.startAngle || 0}°)`}>
                        <Input
                          type="number"
                          value={sec.startAngle || 0}
                          onChange={(e) => updateSection(sec.id, { startAngle: +e.target.value })}
                        />
                      </Field>
                      <Field label={`End Angle (${sec.endAngle || 90}°)`}>
                        <Input
                          type="number"
                          value={sec.endAngle || 90}
                          onChange={(e) => updateSection(sec.id, { endAngle: +e.target.value })}
                        />
                      </Field>
                    </div>
                  </>
                ) : sec.shape === "polygon" ? (
                  <Field label="Points (x,y pairs)">
                    <Input
                      value={sec.points || ""}
                      onChange={(e) => updateSection(sec.id, { points: e.target.value })}
                      placeholder="e.g. 0,0 100,0 100,100"
                    />
                  </Field>
                ) : sec.shape === "path" ? (
                  <Field label="Path Data">
                    <Input
                      value={sec.pathData || ""}
                      onChange={(e) => updateSection(sec.id, { pathData: e.target.value })}
                      placeholder="e.g. M 0,0 L 100,0 Z"
                    />
                  </Field>
                ) : sec.shape === "rect" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Width (px)">
                      <NumericInput
                        value={sec.width}
                        onChange={(v) => updateSection(sec.id, { width: v })}
                        min={1}
                        placeholder="e.g. 150"
                      />
                    </Field>
                    <Field label="Height (px)">
                      <NumericInput
                        value={sec.height}
                        onChange={(v) => updateSection(sec.id, { height: v })}
                        min={1}
                        placeholder="e.g. 80"
                      />
                    </Field>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <Field label="X Axis">
                    <NumericInput
                      value={sec.x}
                      onChange={(v) => updateSection(sec.id, { x: v })}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Y Axis">
                    <NumericInput
                      value={sec.y}
                      onChange={(v) => updateSection(sec.id, { y: v })}
                      placeholder="0"
                    />
                  </Field>
                </div>

                <Field label="Rotation (°)">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={sec.rotation || 0}
                      onChange={(e) => updateSection(sec.id, { rotation: +e.target.value })}
                      className="w-full accent-primary"
                    />
                    <NumericInput
                      value={sec.rotation}
                      onChange={(v) => updateSection(sec.id, { rotation: v })}
                      min={0}
                      max={360}
                      className="w-20"
                      placeholder="0"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width Scale (%)">
                    <NumericInput
                      value={Math.round((sec.scaleX ?? 1) * 100)}
                      onChange={(v) => updateSection(sec.id, { scaleX: v / 100 })}
                      min={1}
                      max={2000}
                      suffix="%"
                      placeholder="100"
                    />
                  </Field>
                  <Field label="Height Scale (%)">
                    <NumericInput
                      value={Math.round((sec.scaleY ?? 1) * 100)}
                      onChange={(v) => updateSection(sec.id, { scaleY: v / 100 })}
                      min={1}
                      max={2000}
                      suffix="%"
                      placeholder="100"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </Panel>
        </>
      )}

      {!activeSection && (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-xl border-border/50 bg-secondary/10">
          <Square className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-medium">No Section Selected</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Click a section on the canvas to edit its properties, capacity, and seat inventory.
          </p>
        </div>
      )}
    </aside>
  );
}
