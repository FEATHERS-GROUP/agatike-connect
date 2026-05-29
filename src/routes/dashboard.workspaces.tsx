import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Film, Trophy, Mountain, Check, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace, WorkspaceType } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/workspaces")({
  head: () => ({
    meta: [
      { title: "Workspaces — Agatike Dashboard" },
      {
        name: "description",
        content: "Create and switch between your workspaces.",
      },
    ],
  }),
  component: Workspaces,
});

const types: { id: WorkspaceType; title: string; desc: string; icon: any }[] = [
  {
    id: "EVENT",
    title: "Event Organizer",
    desc: "Host concerts, festivals, conferences or recurring events.",
    icon: Trophy,
  },
  {
    id: "VENUE",
    title: "Venue Owner",
    desc: "Rentable space hosting concerts, weddings, conferences.",
    icon: Building2,
  },
  {
    id: "CINEMA",
    title: "Movie Theater",
    desc: "Sell reserved seats, screenings and snack bundles.",
    icon: Film,
  },
  {
    id: "EXPERIENCE",
    title: "Experience Host",
    desc: "Hikes, run clubs, surf camps, wellness retreats.",
    icon: Mountain,
  },
];

function Workspaces() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [open, setOpen] = useState(workspaces.length === 0);
  const [type, setType] = useState<WorkspaceType>("EVENT");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    createWorkspace({ name, type, city: city || "—" });
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      setOpen(false);
      setName("");
      setCity("");
      setDesc("");
      navigate({ to: "/dashboard" });
    }, 1400);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each venue, cinema or organizer brand gets its own workspace with separate analytics and payouts.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-[var(--shadow-glow)] gap-2"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> New Workspace
        </Button>
      </div>

      {/* Existing workspaces */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((w) => {
          const t = types.find((x) => x.id === w.type) || types[0];
          const isActive = activeWorkspace?.id === w.id;
          
          return (
            <div
              key={w.id}
              className={`flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-all ${
                isActive ? "border-primary ring-1 ring-primary" : "border-border/60"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shrink-0"
                  style={{ background: isActive ? "var(--gradient-primary)" : "var(--card-muted)" }}
                >
                  <t.icon className={`h-5 w-5 ${!isActive && "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-lg truncate">{w.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {t.title} · {w.city}
                  </p>
                </div>
              </div>
              
              <Button 
                variant={isActive ? "default" : "outline"}
                className={`w-full rounded-xl gap-2 ${isActive && "shadow-[var(--shadow-glow)]"}`}
                style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                onClick={() => {
                  setActiveWorkspace(w);
                  navigate({ to: "/dashboard" });
                }}
              >
                {isActive ? "Currently Active" : "Switch to Workspace"} 
                {!isActive && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-glow)] animate-scale-in"
          >
            {created ? (
              <div className="py-10 text-center">
                <div
                  className="mx-auto grid h-14 w-14 place-items-center rounded-full text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Workspace Created!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Redirecting you to your new dashboard...
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Create a new workspace</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick the type of organization you're running.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        type === t.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border bg-card hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        type === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        <t.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-semibold ${type === t.id ? "text-primary" : "text-foreground"}`}>{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  <div className="space-y-1.5">
                    <Label>Workspace Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Silverbird Cinemas, Karura Run Club"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Primary City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lagos, NG"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>About</Label>
                    <Textarea
                      rows={3}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="What does this workspace host?"
                      className="rounded-xl bg-secondary/50 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  {workspaces.length > 0 && (
                    <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={create}
                    disabled={!name.trim()}
                    className="rounded-xl gap-2 shadow-[var(--shadow-glow)] px-6"
                    style={name.trim() ? { background: "var(--gradient-primary)" } : {}}
                  >
                    <Plus className="h-4 w-4" /> Create Workspace
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
