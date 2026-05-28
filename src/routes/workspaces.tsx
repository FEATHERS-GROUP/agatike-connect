import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Music2, Film, Trophy, Mountain, Check, ArrowLeft, Plus } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/workspaces")({
  head: () => ({
    meta: [
      { title: "Workspaces — Agatike" },
      {
        name: "description",
        content: "Create a workspace for your venue, cinema, club or festival.",
      },
    ],
  }),
  component: Workspaces,
});

type WorkspaceType = "venue" | "cinema" | "club" | "festival" | "tour";

const types: { id: WorkspaceType; title: string; desc: string; icon: any }[] = [
  {
    id: "venue",
    title: "Event venue",
    desc: "Rentable space hosting concerts, weddings, conferences.",
    icon: Building2,
  },
  {
    id: "cinema",
    title: "Movie theater",
    desc: "Sell reserved seats, screenings and snack bundles.",
    icon: Film,
  },
  {
    id: "club",
    title: "Nightclub",
    desc: "Recurring nights, guestlists, bottle tables.",
    icon: Music2,
  },
  {
    id: "festival",
    title: "Festival / stadium",
    desc: "Multi-day events with VIP, parking and merch.",
    icon: Trophy,
  },
  {
    id: "tour",
    title: "Experience host",
    desc: "Hikes, run clubs, surf camps, wellness retreats.",
    icon: Mountain,
  },
];

type Workspace = { id: string; name: string; type: WorkspaceType; city: string };

function Workspaces() {
  const [list, setList] = useState<Workspace[]>([
    { id: "w1", name: "Nala Sound", type: "club", city: "Lagos, NG" },
  ]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkspaceType>("venue");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    setList([...list, { id: crypto.randomUUID(), name, type, city: city || "—" }]);
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      setOpen(false);
      setName("");
      setCity("");
      setDesc("");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Each venue, cinema or tour brand gets its own workspace with separate analytics,
              payouts and staff.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="mr-1 h-4 w-4" /> New workspace
          </Button>
        </div>

        {/* Existing workspaces */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((w) => {
            const t = types.find((x) => x.id === w.type)!;
            return (
              <div
                key={w.id}
                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.title} · {w.city}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Open
                </Button>
              </div>
            );
          })}
        </div>

        {/* Create modal */}
        {open && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-glow)] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {created ? (
                <div className="py-10 text-center">
                  <div
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">Workspace created</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You can now publish events under this workspace.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">Create a new workspace</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick the type of organization you're running.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${type === t.id ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-secondary"}`}
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                          <t.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <Label>Workspace name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Silverbird Cinemas, Karura Run Club"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Primary city</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lagos, NG"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>About</Label>
                      <Textarea
                        rows={3}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="What does this workspace host?"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={create}
                      disabled={!name.trim()}
                      className="rounded-full"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Create workspace
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
