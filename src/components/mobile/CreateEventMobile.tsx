import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, Crown, ShoppingBag, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/mock-data";

const steps = ["Basics", "Media", "Tickets", "Venue", "Publish"] as const;

type Ticket = { id: string; name: string; price: number; quantity: number; type: "paid" | "free" | "vip" };

export function CreateEventMobile() {
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
    coverPreview: "",
    published: false,
  });
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
  ]);

  const updateField = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData({ ...data, [k]: v });

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };

  if (data.published) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Event Published!</h1>
        <p className="text-muted-foreground mb-8">"{data.title}" is now live and ready for tickets.</p>
        <Link to="/events/$eventId" params={{ eventId: '1' }} className="w-full">
          <Button className="w-full h-12 rounded-full font-bold text-lg mb-3">View Event Page</Button>
        </Link>
        <Link to="/dashboard" className="w-full">
          <Button variant="outline" className="w-full h-12 rounded-full font-bold text-lg">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe-top">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <Link to="/dashboard" className="p-2 -ml-2 text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex gap-1 items-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : i < step ? "bg-primary/50" : "bg-border"}`} />
          ))}
        </div>
        <button className="text-primary font-bold text-sm p-2 -mr-2">Save</button>
      </div>

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{steps[step]}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {step === 0 && "Let's start with the essential details."}
          {step === 1 && "Add visuals to make your event stand out."}
          {step === 2 && "Set up ticket tiers and pricing."}
          {step === 3 && "Where is the magic happening?"}
          {step === 4 && "Review and make it live."}
        </p>

        <div className="space-y-6">
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <Label className="text-base font-semibold">Event Title</Label>
                <Input value={data.title} onChange={(e) => updateField("title", e.target.value)} placeholder="AfroFuture Festival" className="mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent text-lg px-4" />
              </div>
              <div>
                <Label className="text-base font-semibold">Category</Label>
                <select value={data.category} onChange={(e) => updateField("category", e.target.value)} className="mt-2 h-14 w-full rounded-2xl bg-secondary/50 border-transparent text-base px-4">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold">Date</Label>
                  <Input type="date" value={data.date} onChange={(e) => updateField("date", e.target.value)} className="mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Time</Label>
                  <Input type="time" value={data.time} onChange={(e) => updateField("time", e.target.value)} className="mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4" />
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold">Description</Label>
                <Textarea rows={4} value={data.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Tell people what to expect..." className="mt-2 rounded-2xl bg-secondary/50 border-transparent p-4 text-base" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label className="text-base font-semibold">Cover Media</Label>
              <label className="block relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 transition active:scale-95 cursor-pointer">
                {data.coverPreview ? (
                  <img src={data.coverPreview} alt="cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <ImageIcon className="h-10 w-10 mb-4 opacity-50" />
                    <p className="font-semibold text-foreground mb-1">Tap to upload poster</p>
                    <p className="text-xs">Supports Images & Vertical Video</p>
                  </div>
                )}
                <input type="file" accept="image/*,video/*" hidden onChange={onCoverUpload} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-3xl border border-border/40 bg-card p-4 shadow-sm relative overflow-hidden">
                  {t.type === "vip" && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl font-bold text-[10px] uppercase">VIP</div>}
                  <div className="grid gap-3 pt-2">
                    <Input value={t.name} onChange={(e) => setTickets(tickets.map(x => x.id === t.id ? { ...x, name: e.target.value } : x))} placeholder="Ticket Name" className="h-12 rounded-xl bg-secondary/50 border-transparent font-bold" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                        <Input type="number" value={t.price} onChange={(e) => setTickets(tickets.map(x => x.id === t.id ? { ...x, price: Number(e.target.value) } : x))} className="h-12 rounded-xl bg-secondary/50 border-transparent pl-8 font-bold" />
                      </div>
                      <Input type="number" value={t.quantity} onChange={(e) => setTickets(tickets.map(x => x.id === t.id ? { ...x, quantity: Number(e.target.value) } : x))} placeholder="Qty" className="h-12 rounded-xl bg-secondary/50 border-transparent font-bold" />
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full mt-2 text-destructive hover:bg-destructive/10 h-10 rounded-xl" onClick={() => setTickets(tickets.filter((x) => x.id !== t.id))}>
                    Remove
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-2xl h-12 border-dashed font-bold" onClick={() => setTickets([...tickets, { id: crypto.randomUUID(), name: "General Admission", price: 25, quantity: 100, type: "paid" }])}>
                  + Paid Ticket
                </Button>
                <Button variant="outline" className="flex-1 rounded-2xl h-12 border-dashed font-bold border-primary text-primary hover:bg-primary/10" onClick={() => setTickets([...tickets, { id: crypto.randomUUID(), name: "VIP Pass", price: 100, quantity: 20, type: "vip" }])}>
                  <Crown className="h-4 w-4 mr-2" /> VIP Pass
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <Label className="text-base font-semibold">Venue Name</Label>
                <Input value={data.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="e.g. BK Arena" className="mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4" />
              </div>
              <div>
                <Label className="text-base font-semibold">City</Label>
                <Input value={data.city} onChange={(e) => updateField("city", e.target.value)} placeholder="e.g. Kigali, RW" className="mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4" />
              </div>
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-secondary relative mt-4">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mb-2 opacity-50" />
                  <p className="font-semibold text-foreground">Interactive Map Preview</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-3xl border border-border/40 overflow-hidden bg-card">
                <div className="aspect-[4/3] bg-secondary relative">
                  {data.coverPreview && <img src={data.coverPreview} className="w-full h-full object-cover" />}
                  <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md">
                    {data.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">{data.title || "Untitled Event"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {data.date} at {data.time} • {data.venue}
                  </p>
                  
                  <div className="border-t border-border/40 pt-4 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tickets Configured</p>
                    {tickets.map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span>{t.quantity}x {t.name}</span>
                        <span className="font-bold">${t.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe">
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={prev} className="h-14 rounded-full px-6 font-bold">
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={next} className="flex-1 h-14 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              Next Step
            </Button>
          ) : (
            <Button onClick={() => setData({ ...data, published: true })} className="flex-1 h-14 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              Publish Event
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}