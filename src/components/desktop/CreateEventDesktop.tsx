import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, Crown, ShoppingBag, Calendar, MapPin, Sparkles } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/mock-data";

const steps = ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP", "Publish"] as const;
type Step = typeof steps[number];

type Ticket = { id: string; name: string; price: number; quantity: number; type: "free" | "paid" | "vip" | "early" };
type Merch = { id: string; name: string; price: number };

export function CreateEventDesktop() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: "",
    category: categories[0],
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    address: "",
    coverPreview: "",
    vipPerks: "Priority entry, VIP lounge, complimentary welcome drink",
    published: false,
  });
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
  ]);
  const [merch, setMerch] = useState<Merch[]>([{ id: "m1", name: "Event Tee", price: 20 }]);

  const StepIndicator = (
    <ol className="grid grid-cols-7 gap-2">
      {steps.map((s, i) => (
        <li key={s} className={`rounded-2xl border p-3 text-xs ${i < step ? "border-primary bg-accent/40" : i === step ? "border-primary bg-background shadow-[var(--shadow-glow)]" : "border-border/60 bg-background"}`}>
          <p className="text-muted-foreground">Step {i + 1}</p>
          <p className="mt-0.5 font-medium text-foreground">{s}</p>
        </li>
      ))}
    </ol>
  );

  const updateField = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData({ ...data, [k]: v });

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };

  if (data.published) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground animate-scale-in" style={{ background: "var(--gradient-primary)" }}>
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{data.title || "Your event"} is live</h1>
          <p className="mt-2 text-muted-foreground">Share the link with your community and start selling tickets.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/dashboard"><Button variant="outline" className="rounded-full">Back to dashboard</Button></Link>
            <Link to="/events"><Button className="rounded-full" style={{ background: "var(--gradient-primary)" }}>View on Agatike</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create a new event</h1>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length} · {steps[step]}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"><Sparkles className="h-3 w-3" /> Draft auto-saved</span>
        </div>

        <div className="mt-6">{StepIndicator}</div>

        <div className="mt-6 rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
          {steps[step] === "Details" && (
            <div className="space-y-5">
              <div>
                <Label>Event title</Label>
                <Input value={data.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Afrobeats Night Live" className="mt-1" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <select value={data.category} onChange={(e) => updateField("category", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={data.date} onChange={(e) => updateField("date", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={data.time} onChange={(e) => updateField("time", e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={5} value={data.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Tell people what makes this night special…" className="mt-1" />
              </div>
            </div>
          )}

          {steps[step] === "Tickets" && (
            <TicketEditor tickets={tickets} setTickets={setTickets} />
          )}

          {steps[step] === "Venue" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Venue name</Label>
                  <Input value={data.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="Eko Convention Centre" className="mt-1" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={data.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Lagos, NG" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input value={data.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Plot 1415 Adetokunbo Ademola Street, Victoria Island" className="mt-1" />
              </div>
              <div className="aspect-[16/8] rounded-2xl border border-dashed border-border bg-secondary/40 grid place-items-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Map preview appears here</span>
              </div>
            </div>
          )}

          {steps[step] === "Media" && (
            <div className="space-y-5">
              <Label>Cover image</Label>
              <label className="block aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition hover:border-primary">
                {data.coverPreview ? (
                  <img src={data.coverPreview} alt="cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6" />
                      <p className="mt-2">Click to upload (any image)</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" hidden onChange={onCoverUpload} />
              </label>
              <p className="text-xs text-muted-foreground">Recommended 1920×1080. We auto-generate social cards.</p>
            </div>
          )}

          {steps[step] === "Merchandise" && (
            <MerchEditor merch={merch} setMerch={setMerch} />
          )}

          {steps[step] === "VIP" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 p-4">
                <Crown className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">VIP access</p>
                  <p className="text-muted-foreground">Define the experience for premium ticket holders.</p>
                </div>
              </div>
              <div>
                <Label>VIP perks</Label>
                <Textarea rows={5} value={data.vipPerks} onChange={(e) => updateField("vipPerks", e.target.value)} className="mt-1" />
              </div>
            </div>
          )}

          {steps[step] === "Publish" && (
            <PublishReview data={data} tickets={tickets} merch={merch} onPublish={() => setData({ ...data, published: true })} />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
            <Button variant="outline" onClick={prev} disabled={step === 0} className="rounded-full">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>Save & exit</Button>
              {step < steps.length - 1 ? (
                <Button onClick={next} className="rounded-full" style={{ background: "var(--gradient-primary)" }}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setData({ ...data, published: true })} className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                  Publish event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketEditor({ tickets, setTickets }: { tickets: Ticket[]; setTickets: (t: Ticket[]) => void }) {
  const add = (type: Ticket["type"]) =>
    setTickets([...tickets, { id: crypto.randomUUID(), name: type === "free" ? "Free RSVP" : type === "vip" ? "VIP" : type === "early" ? "Early Bird" : "Paid Ticket", price: type === "free" ? 0 : type === "vip" ? 95 : 25, quantity: 100, type }]);

  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["paid", "free", "early", "vip"] as const).map((t) => (
          <Button key={t} variant="outline" size="sm" className="rounded-full" onClick={() => add(t)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {t === "paid" ? "Paid" : t === "free" ? "Free" : t === "early" ? "Early bird" : "VIP"}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_120px_120px_auto]">
            <Input value={t.name} onChange={(e) => update(t.id, { name: e.target.value })} placeholder="Ticket name" />
            <Input type="number" value={t.price} onChange={(e) => update(t.id, { price: Number(e.target.value) })} placeholder="Price" />
            <Input type="number" value={t.quantity} onChange={(e) => update(t.id, { quantity: Number(e.target.value) })} placeholder="Quantity" />
            <Button variant="ghost" size="icon" onClick={() => setTickets(tickets.filter((x) => x.id !== t.id))}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet — add one above.</p>}
      </div>
    </div>
  );
}

function MerchEditor({ merch, setMerch }: { merch: Merch[]; setMerch: (m: Merch[]) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ShoppingBag className="h-4 w-4" /> Sell merch alongside tickets</div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setMerch([...merch, { id: crypto.randomUUID(), name: "", price: 0 }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add item
        </Button>
      </div>
      <div className="space-y-3">
        {merch.map((m) => (
          <div key={m.id} className="grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_140px_auto]">
            <Input value={m.name} onChange={(e) => setMerch(merch.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))} placeholder="Tour Tee, Parking Pass…" />
            <Input type="number" value={m.price} onChange={(e) => setMerch(merch.map((x) => (x.id === m.id ? { ...x, price: Number(e.target.value) } : x)))} placeholder="Price" />
            <Button variant="ghost" size="icon" onClick={() => setMerch(merch.filter((x) => x.id !== m.id))}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishReview({ data, tickets, merch, onPublish }: { data: any; tickets: Ticket[]; merch: Merch[]; onPublish: () => void }) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border/60">
        {data.coverPreview ? (
          <img src={data.coverPreview} alt="" className="aspect-[16/8] w-full object-cover" />
        ) : (
          <div className="aspect-[16/8] w-full bg-secondary" />
        )}
        <div className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{data.category}</p>
          <h3 className="mt-1 text-2xl font-semibold">{data.title || "Untitled event"}</h3>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {data.date || "TBD"} · {data.time || "TBD"}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {data.venue || "TBD"}, {data.city || ""}</span>
          </div>
          <p className="mt-3 text-sm">{data.description || "No description yet."}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Tickets ({tickets.length})</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {tickets.map((t) => <li key={t.id}>· {t.name} — ${t.price} × {t.quantity}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Merchandise ({merch.length})</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {merch.map((m) => <li key={m.id}>· {m.name || "(unnamed)"} — ${m.price}</li>)}
          </ul>
        </div>
      </div>

      <Button onClick={onPublish} className="w-full h-12 rounded-2xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
        Publish event
      </Button>
    </div>
  );
}