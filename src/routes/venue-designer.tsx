import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  ArrowLeft,
  Save,
  Download,
  Plus,
  Trash2,
  Grid3x3,
  Crown,
  Users,
  Accessibility,
  Square,
  Eraser,
  LayoutGrid,
  Trophy,
  Music2,
  Mic2,
  Presentation,
  Paintbrush,
  MapPin,
  Loader2,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/venue-designer")({
  head: () => ({
    meta: [
      { title: "Venue & Seating Designer — Agatike" },
      {
        name: "description",
        content:
          "Design your venue and seating map. Start from arena, stadium, concert or conference templates, or build from scratch.",
      },
    ],
  }),
  component: VenueDesignerPage,
});

type SeatStatus = "available" | "vip" | "accessible" | "blocked" | "stage";

type Seat = {
  id: string;
  row: number;
  col: number;
  status: SeatStatus;
  section: string;
  price: number;
};

type Section = {
  id: string;
  name: string;
  color: string;
  rows: number;
  cols: number;
  curve: number; // 0 = straight, 1 = curved
  price: number;
  tier: "General" | "VIP" | "Premium" | "Floor";
};

type TemplateId = "arena" | "stadium" | "concert" | "conference" | "blank";

const templates: {
  id: TemplateId;
  label: string;
  description: string;
  icon: any;
  sections: Section[];
  stageLabel: string;
}[] = [
  {
    id: "arena",
    label: "Basketball Arena",
    description: "Court center · 4 stands around",
    icon: Trophy,
    stageLabel: "COURT",
    sections: [
      {
        id: "n",
        name: "North Stand",
        color: "#f97316",
        rows: 6,
        cols: 18,
        curve: 0.6,
        price: 60,
        tier: "General",
      },
      {
        id: "s",
        name: "South Stand",
        color: "#0ea5e9",
        rows: 6,
        cols: 18,
        curve: 0.6,
        price: 60,
        tier: "General",
      },
      {
        id: "e",
        name: "Courtside East",
        color: "#dc2626",
        rows: 3,
        cols: 14,
        curve: 0.2,
        price: 250,
        tier: "VIP",
      },
      {
        id: "w",
        name: "Courtside West",
        color: "#7c3aed",
        rows: 3,
        cols: 14,
        curve: 0.2,
        price: 250,
        tier: "VIP",
      },
    ],
  },
  {
    id: "stadium",
    label: "Football Stadium",
    description: "Pitch with curved tribunes",
    icon: Trophy,
    stageLabel: "PITCH",
    sections: [
      {
        id: "n",
        name: "North Tribune",
        color: "#16a34a",
        rows: 10,
        cols: 24,
        curve: 0.9,
        price: 35,
        tier: "General",
      },
      {
        id: "s",
        name: "South Tribune",
        color: "#16a34a",
        rows: 10,
        cols: 24,
        curve: 0.9,
        price: 35,
        tier: "General",
      },
      {
        id: "e",
        name: "East Stand",
        color: "#f59e0b",
        rows: 8,
        cols: 20,
        curve: 0.5,
        price: 80,
        tier: "Premium",
      },
      {
        id: "w",
        name: "West VIP",
        color: "#dc2626",
        rows: 8,
        cols: 20,
        curve: 0.5,
        price: 180,
        tier: "VIP",
      },
    ],
  },
  {
    id: "concert",
    label: "Concert Hall",
    description: "Stage front · floor + balcony",
    icon: Music2,
    stageLabel: "STAGE",
    sections: [
      {
        id: "floor",
        name: "Floor / Standing",
        color: "#f97316",
        rows: 8,
        cols: 22,
        curve: 0.3,
        price: 50,
        tier: "Floor",
      },
      {
        id: "left",
        name: "Left Balcony",
        color: "#7c3aed",
        rows: 5,
        cols: 10,
        curve: 0.4,
        price: 90,
        tier: "Premium",
      },
      {
        id: "right",
        name: "Right Balcony",
        color: "#7c3aed",
        rows: 5,
        cols: 10,
        curve: 0.4,
        price: 90,
        tier: "Premium",
      },
      {
        id: "vip",
        name: "VIP Lounge",
        color: "#dc2626",
        rows: 3,
        cols: 12,
        curve: 0.2,
        price: 220,
        tier: "VIP",
      },
    ],
  },
  {
    id: "conference",
    label: "Conference Room",
    description: "Theater seating · podium front",
    icon: Presentation,
    stageLabel: "PODIUM",
    sections: [
      {
        id: "main",
        name: "Main Hall",
        color: "#0ea5e9",
        rows: 12,
        cols: 20,
        curve: 0.1,
        price: 25,
        tier: "General",
      },
      {
        id: "front",
        name: "Front Row VIP",
        color: "#dc2626",
        rows: 2,
        cols: 20,
        curve: 0.1,
        price: 120,
        tier: "VIP",
      },
    ],
  },
  {
    id: "blank",
    label: "Blank Canvas",
    description: "Start from scratch",
    icon: LayoutGrid,
    stageLabel: "STAGE",
    sections: [],
  },
];

const statusColors: Record<SeatStatus, string> = {
  available: "#cbd5e1",
  vip: "#f97316",
  accessible: "#0ea5e9",
  blocked: "#1f2937",
  stage: "#111111",
};

const tools: { id: SeatStatus; label: string; icon: any }[] = [
  { id: "available", label: "Seat", icon: Square },
  { id: "vip", label: "VIP", icon: Crown },
  { id: "accessible", label: "Accessible", icon: Accessibility },
  { id: "blocked", label: "Blocked", icon: Eraser },
];

function buildSeats(sections: Section[]): Seat[] {
  const seats: Seat[] = [];
  sections.forEach((sec) => {
    for (let r = 0; r < sec.rows; r++) {
      for (let c = 0; c < sec.cols; c++) {
        seats.push({
          id: `${sec.id}-${r}-${c}`,
          row: r,
          col: c,
          status: sec.tier === "VIP" ? "vip" : "available",
          section: sec.id,
          price: sec.price,
        });
      }
    }
  });
  return seats;
}

function VenueDesignerPage() {
  const { activeWorkspace } = useWorkspace();
  const [templateId, setTemplateId] = useState<TemplateId>("arena");
  const template = useMemo(() => templates.find((t) => t.id === templateId)!, [templateId]);
  const [sections, setSections] = useState<Section[]>(template.sections);
  const [seats, setSeats] = useState<Seat[]>(buildSeats(template.sections));
  const [tool, setTool] = useState<SeatStatus>("vip");
  const [venueName, setVenueName] = useState("Eko Convention Centre");
  const [eventName, setEventName] = useState("Afrobeats Night Live");
  const [activeSection, setActiveSection] = useState<string | null>(
    template.sections[0]?.id ?? null,
  );

  const applyTemplate = (id: TemplateId) => {
    const t = templates.find((x) => x.id === id)!;
    setTemplateId(id);
    setSections(t.sections);
    setSeats(buildSeats(t.sections));
    setActiveSection(t.sections[0]?.id ?? null);
  };

  const paintSeat = (id: string) => {
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, status: tool } : s)));
  };

  const addSection = () => {
    const id = "sec-" + Math.random().toString(36).slice(2, 6);
    const newSec: Section = {
      id,
      name: `Section ${sections.length + 1}`,
      color: "#22c55e",
      rows: 5,
      cols: 12,
      curve: 0.3,
      price: 40,
      tier: "General",
    };
    setSections([...sections, newSec]);
    setSeats([...seats, ...buildSeats([newSec])]);
    setActiveSection(id);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    setSeats(seats.filter((s) => s.section !== id));
    if (activeSection === id) setActiveSection(null);
  };

  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    if (patch.rows !== undefined || patch.cols !== undefined) {
      const sec = sections.find((s) => s.id === id);
      if (sec) {
        const next = { ...sec, ...patch };
        setSeats((prev) => [...prev.filter((s) => s.section !== id), ...buildSeats([next])]);
      }
    }
  };

  const stats = useMemo(() => {
    const total = seats.length;
    const vip = seats.filter((s) => s.status === "vip").length;
    const acc = seats.filter((s) => s.status === "accessible").length;
    const blocked = seats.filter((s) => s.status === "blocked").length;
    const revenue = seats
      .filter((s) => s.status !== "blocked")
      .reduce((sum, s) => sum + (s.status === "vip" ? s.price * 2 : s.price), 0);
    return { total, vip, acc, blocked, revenue };
  }, [seats]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Dashboard / Venues</p>
            <h1 className="text-lg font-semibold">Venue & Seating Designer</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Download className="mr-1 h-4 w-4" /> Export map
          </Button>
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Save className="mr-1 h-4 w-4" /> Save venue
          </Button>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[340px_1fr_320px]">
        {/* LEFT — templates & sections */}
        <aside className="space-y-5">
          <Panel title="Venue" icon={Grid3x3}>
            <div className="space-y-3">
              <Field label="Venue name">
                <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              </Field>
              <Field label="Event">
                <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Templates" icon={Mic2}>
            <div className="grid grid-cols-1 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                    templateId === t.id
                      ? "border-primary bg-accent/40"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <div
                    className="grid h-9 w-9 place-items-center rounded-lg"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <t.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Sections"
            icon={LayoutGrid}
            action={
              <button
                onClick={addSection}
                className="rounded-full bg-accent px-2 py-1 text-xs font-medium hover:bg-accent/70"
              >
                <Plus className="inline h-3 w-3" /> Add
              </button>
            }
          >
            <div className="space-y-2">
              {sections.length === 0 && (
                <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  No sections yet. Pick a template or add one.
                </p>
              )}
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                    activeSection === s.id
                      ? "border-primary bg-accent/40"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <span className="h-5 w-5 rounded-md" style={{ background: s.color }} />
                  <span className="flex-1 font-medium">{s.name}</span>
                  <span className="text-muted-foreground">
                    {s.rows}×{s.cols}
                  </span>
                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(s.id);
                    }}
                    className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive"
                  />
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        {/* CENTER — canvas */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3">
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                    tool === t.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {(Object.keys(statusColors) as SeatStatus[])
                .filter((k) => k !== "stage")
                .map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm" style={{ background: statusColors[k] }} />
                    {k}
                  </span>
                ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top,theme(colors.accent.DEFAULT/30),transparent_60%)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {venueName}
                </p>
                <h3 className="text-lg font-semibold">{eventName}</h3>
              </div>
              <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
                {template.stageLabel}
              </span>
            </div>

            {/* Stage bar */}
            <div className="mx-auto mb-6 h-8 max-w-3xl rounded-full bg-foreground/90 text-center text-xs font-bold leading-8 tracking-widest text-background">
              {template.stageLabel}
            </div>

            <div className="space-y-8">
              {sections.map((sec) => {
                const secSeats = seats.filter((s) => s.section === sec.id);
                return (
                  <div key={sec.id}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: sec.color }}>
                        {sec.name}
                      </span>
                      <span className="text-muted-foreground">
                        {sec.tier} · {formatCurrency(sec.price, activeWorkspace?.currency)} ·{" "}
                        {sec.rows * sec.cols} seats
                      </span>
                    </div>
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${sec.cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {secSeats.map((s) => {
                        // simulate curve: offset rows slightly
                        const offset =
                          sec.curve > 0
                            ? Math.sin(((s.col + 0.5) / sec.cols) * Math.PI) * sec.curve * 10
                            : 0;
                        return (
                          <button
                            key={s.id}
                            onClick={() => paintSeat(s.id)}
                            title={`${sec.name} R${s.row + 1} S${s.col + 1} · $${s.price}`}
                            className="aspect-square rounded-[3px] transition hover:scale-110"
                            style={{
                              background: statusColors[s.status],
                              transform: `translateY(${-offset}px)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {sections.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
                  Blank canvas — add a section from the left to start designing.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT — section editor & stats */}
        <aside className="space-y-5">
          <Panel title="Capacity" icon={Users}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Total seats" value={stats.total} />
              <Stat label="VIP" value={stats.vip} />
              <Stat label="Accessible" value={stats.acc} />
              <Stat label="Blocked" value={stats.blocked} />
            </div>
            <div
              className="mt-3 rounded-xl p-3 text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-80">Projected revenue</p>
              <p className="text-xl font-bold">${stats.revenue.toLocaleString()}</p>
            </div>
          </Panel>

          {activeSection && (
            <Panel title="Edit section" icon={Square}>
              {(() => {
                const sec = sections.find((s) => s.id === activeSection);
                if (!sec) return null;
                return (
                  <div className="space-y-3">
                    <Field label="Name">
                      <Input
                        value={sec.name}
                        onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Rows">
                        <Input
                          type="number"
                          value={sec.rows}
                          onChange={(e) =>
                            updateSection(sec.id, {
                              rows: Math.max(1, +e.target.value || 1),
                            })
                          }
                        />
                      </Field>
                      <Field label="Columns">
                        <Input
                          type="number"
                          value={sec.cols}
                          onChange={(e) =>
                            updateSection(sec.id, {
                              cols: Math.max(1, +e.target.value || 1),
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label={`Curve · ${Math.round(sec.curve * 100)}%`}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={sec.curve}
                        onChange={(e) => updateSection(sec.id, { curve: +e.target.value })}
                        className="w-full accent-primary"
                      />
                    </Field>
                    <Field label="Price (USD)">
                      <Input
                        type="number"
                        value={sec.price}
                        onChange={(e) => updateSection(sec.id, { price: +e.target.value || 0 })}
                      />
                    </Field>
                    <Field label="Tier">
                      <div className="flex flex-wrap gap-1.5">
                        {(["General", "Premium", "VIP", "Floor"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateSection(sec.id, { tier: t })}
                            className={`rounded-full border px-2.5 py-1 text-xs ${
                              sec.tier === t
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/60"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Color">
                      <input
                        type="color"
                        value={sec.color}
                        onChange={(e) => updateSection(sec.id, { color: e.target.value })}
                        className="h-9 w-full cursor-pointer rounded-lg border border-border/60"
                      />
                    </Field>
                  </div>
                );
              })()}
            </Panel>
          )}

          <Panel title="Tip" icon={Crown}>
            <p className="text-xs text-muted-foreground">
              Click any seat on the canvas to apply the current tool (Seat, VIP, Accessible, or
              Blocked). Use the curve slider to bend rows around a stage or pitch.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-border/60 bg-card p-4">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}
