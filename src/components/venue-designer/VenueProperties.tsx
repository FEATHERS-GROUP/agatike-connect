import { Crown, Square, Users, Layers, Settings2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "./types";
import { Button } from "@/components/ui/button";

function Panel({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm mb-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        {action}
      </div>
      {children}
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
}: {
  stats: { total: number; vip: number; acc: number; blocked: number; revenue: number };
  activeSection: string | null;
  sections: Section[];
  updateSection: (id: string, patch: Partial<Section>) => void;
}) {
  const sec = activeSection ? sections.find((s) => s.id === activeSection) : null;

  return (
    <aside className="h-[calc(100vh-80px)] overflow-y-auto pb-20 pr-2 custom-scrollbar">
      <Panel title="Venue Capacity" icon={Users}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Total capacity" value={sections.reduce((acc, s) => acc + (s.capacity || 0), 0).toLocaleString()} />
          <Stat label="Sections" value={sections.length} />
        </div>
      </Panel>

      {sec ? (
        <>
          <Panel title="Metadata & Inventory" icon={Settings2}>
            <div className="space-y-4">
              <Field label="Section Name">
                <Input
                  value={sec.name}
                  onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                />
              </Field>

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

              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sec.color}
                    onChange={(e) => updateSection(sec.id, { color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border/60 bg-transparent p-1"
                  />
                  <Input value={sec.color} readOnly className="font-mono text-xs text-muted-foreground" />
                </div>
              </Field>

              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  <Layers className="w-4 h-4 mr-2" />
                  Preview Seat Grid
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Vector Geometry" icon={Square}>
            <div className="space-y-4">
              <Field label="Shape Type">
                <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                  <button
                    onClick={() => updateSection(sec.id, { shape: "rect", width: 150, height: 80 })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === 'rect' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Rectangle
                  </button>
                  <button
                    onClick={() => updateSection(sec.id, { shape: "arc", innerRadius: 150, outerRadius: 220, startAngle: 0, endAngle: 90 })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === 'arc' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Curved Arc
                  </button>
                  <button
                    onClick={() => updateSection(sec.id, { shape: "polygon", points: "0,0 100,0 80,80 20,80" })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${sec.shape === 'polygon' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Custom
                  </button>
                </div>
              </Field>

              <div className="rounded-xl border border-border p-3 space-y-3 bg-secondary/5">
                
                {sec.shape === 'arc' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Inner Radius">
                        <Input type="number" value={sec.innerRadius || 100} onChange={(e) => updateSection(sec.id, { innerRadius: +e.target.value })} />
                      </Field>
                      <Field label="Outer Radius">
                        <Input type="number" value={sec.outerRadius || 150} onChange={(e) => updateSection(sec.id, { outerRadius: +e.target.value })} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`Start Angle (${sec.startAngle || 0}°)`}>
                        <Input type="number" value={sec.startAngle || 0} onChange={(e) => updateSection(sec.id, { startAngle: +e.target.value })} />
                      </Field>
                      <Field label={`End Angle (${sec.endAngle || 90}°)`}>
                        <Input type="number" value={sec.endAngle || 90} onChange={(e) => updateSection(sec.id, { endAngle: +e.target.value })} />
                      </Field>
                    </div>
                  </>
                ) : sec.shape === 'polygon' ? (
                  <Field label="Points (x,y pairs)">
                    <Input 
                      value={sec.points || ""} 
                      onChange={(e) => updateSection(sec.id, { points: e.target.value })} 
                      placeholder="e.g. 0,0 100,0 100,100"
                    />
                  </Field>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Width">
                      <Input type="number" value={sec.width || 100} onChange={(e) => updateSection(sec.id, { width: +e.target.value })} />
                    </Field>
                    <Field label="Height">
                      <Input type="number" value={sec.height || 50} onChange={(e) => updateSection(sec.id, { height: +e.target.value })} />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <Field label={`X Axis (${sec.x || 0})`}>
                    <Input type="number" value={sec.x || 0} onChange={(e) => updateSection(sec.id, { x: +e.target.value || 0 })} />
                  </Field>
                  <Field label={`Y Axis (${sec.y || 0})`}>
                    <Input type="number" value={sec.y || 0} onChange={(e) => updateSection(sec.id, { y: +e.target.value || 0 })} />
                  </Field>
                </div>

                <Field label={`Rotation · ${sec.rotation || 0}°`}>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={360} value={sec.rotation || 0} onChange={(e) => updateSection(sec.id, { rotation: +e.target.value })} className="w-full accent-primary" />
                    <span className="text-xs text-muted-foreground w-8">{sec.rotation || 0}°</span>
                  </div>
                </Field>
              </div>
            </div>
          </Panel>
        </>
      ) : (
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
