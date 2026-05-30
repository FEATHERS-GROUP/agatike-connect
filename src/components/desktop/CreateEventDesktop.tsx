import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Upload,
  Crown,
  ShoppingBag,
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/mock-data";
import { createEvent } from "@/api/events";
import { getCoordinates } from "@/api/geocoding";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

function getCurrencySymbol(currencyStr?: string) {
  if (!currencyStr) return "$";
  const c = currencyStr.toLowerCase().trim();
  switch (c) {
    // East Africa
    case "rwf": case "rwandan francs": case "frw": return "RWF ";
    case "kes": case "kenyan shillings": case "kenyan shilling": return "KES ";
    case "ugx": case "ugandan shillings": case "ugandan shilling": return "UGX ";
    case "tzs": case "tanzanian shillings": case "tanzanian shilling": return "TZS ";
    case "bif": case "burundian francs": case "burundian franc": return "BIF ";
    
    // West/South/Other Africa
    case "ngn": case "naira": case "nigerian naira": return "₦";
    case "zar": case "rand": case "south african rand": return "R ";
    case "ghs": case "cedi": case "ghanaian cedi": return "GH₵";
    case "xof": case "xaf": case "cfa": case "cfa franc": return "CFA ";

    // Global
    case "euros": case "euro": case "eur": return "€";
    case "pounds": case "pound": case "gbp": return "£";
    case "inr": case "rupee": return "₹";
    case "aed": case "dirham": return "AED ";
    case "cad": return "CAD ";
    case "aud": return "AUD ";
    case "dollars": case "usd": case "dollar": default: return "$";
  }
}

const steps = ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP", "Publish"] as const;
type Step = (typeof steps)[number];

type Ticket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "free" | "paid" | "vip" | "early";
  sale_ends_at?: string;
};
type Merch = { id: string; name: string; price: number };

export function CreateEventDesktop() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ strict: false }) as { workspaceSlug?: string };
  const { step: urlStep } = useSearch({ strict: false }) as { step?: number };
  const step = urlStep || 0;
  const { activeWorkspace } = useWorkspace();
  const currencySymbol = getCurrencySymbol(activeWorkspace?.wallet?.currency);
  
  const dashboardUrl = workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard";
  
  const setStep = (newStep: number) => {
    navigate({ search: { step: newStep }, replace: true });
  };

  const [data, setData] = useState({
    title: "",
    category: categories[0],
    description: "",
    locations: [
      { id: crypto.randomUUID(), venue: "", city: "", address: "", date: "", time: "" }
    ],
    coverPreview: "",
    vipPerks: "Priority entry, VIP lounge, complimentary welcome drink",
    published: false,
    isRecurring: false,
    recurrenceType: "weekly",
    recurrenceCount: 4,
  });
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
  ]);
  const [merch, setMerch] = useState<Merch[]>([{ id: "m1", name: "Event Tee", price: 20 }]);



  const updateField = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    setData({ ...data, [k]: v });

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };

  if (data.published) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground animate-scale-in"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {data.title || "Your event"} is live
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share the link with your community and start selling tickets.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to={dashboardUrl}>
              <Button variant="outline" className="rounded-full">
                Back to dashboard
              </Button>
            </Link>
            <Link to="/events">
              <Button className="rounded-full" style={{ background: "var(--gradient-primary)" }}>
                View on Agatike
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));

  const publishMutation = useMutation({
    mutationFn: async () => {
      // 1. Geocode all locations
      const geocodedLocations = await Promise.all(
        data.locations.map(async (loc) => {
          const fullAddress = `${loc.address}, ${loc.city}`;
          const coords = await getCoordinates({ data: fullAddress });
          return {
            ...loc,
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
          };
        })
      );

      // 2. Prepare payload
      const payload = {
        title: data.title,
        category: data.category,
        description: data.description,
        date: geocodedLocations[0]?.date || "",
        time: geocodedLocations[0]?.time || "",
        venue: geocodedLocations[0]?.venue || "",
        city: geocodedLocations[0]?.city || "",
        address: geocodedLocations[0]?.address || "",
        latitude: geocodedLocations[0]?.latitude || null,
        longitude: geocodedLocations[0]?.longitude || null,
        cover: data.coverPreview,
        vipPerks: data.vipPerks,
        workspace_id: workspaceSlug, // In a real scenario, map this to actual UUID
        tour_stops: geocodedLocations,
        event_requency: data.isRecurring ? { type: data.recurrenceType, count: data.recurrenceCount } : null,
        event_tickets: {
          data: tickets.map(t => ({
            type: t.name,
            cost: t.price.toString(),
            remaining: t.quantity.toString(),
            sold: "0",
            sale_ends_at: t.type === "early" ? t.sale_ends_at || null : null,
          }))
        },
        merchandises: {
          data: merch.map(m => ({
            name: m.name,
            cost: m.price.toString(),
            remaining: "100", // default if no quantity is provided in merch UI
            sold: "0"
          }))
        }
      };
      
      return await createEvent(payload);
    },
    onSuccess: () => {
      toast.success("Event created successfully!");
      setData({ ...data, published: true });
      setTimeout(() => {
        navigate({ to: dashboardUrl });
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    }
  });

  const handlePublish = () => {
    publishMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 sm:p-10 shadow-[var(--shadow-card)]">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{steps[step]}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step + 1} of {steps.length}
          </p>
        </div>
          {steps[step] === "Details" && (
            <div className="space-y-5">
              <div>
                <Label>Event title</Label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Afrobeats Night Live"
                  className="mt-1"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <select
                    value={data.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="mt-1 flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10 hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Label className="text-base font-semibold">Event Frequency</Label>
                    <p className="text-sm text-muted-foreground">Will this event happen more than once?</p>
                  </div>
                  <div className="flex bg-secondary p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => updateField("isRecurring", false)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${!data.isRecurring ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      One-time
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("isRecurring", true)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${data.isRecurring ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Recurring
                    </button>
                  </div>
                </div>

                {data.isRecurring && (
                  <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border/60 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <Label>Repeats</Label>
                      <select
                        value={data.recurrenceType}
                        onChange={(e) => updateField("recurrenceType", e.target.value)}
                        className="mt-1 flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10 hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <Label>How many times?</Label>
                      <Input
                        type="number"
                        min="2"
                        max="365"
                        value={data.recurrenceCount}
                        onChange={(e) => updateField("recurrenceCount", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Tell people what makes this night special…"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {steps[step] === "Tickets" && <TicketEditor tickets={tickets} setTickets={setTickets} currencySymbol={currencySymbol} />}

          {steps[step] === "Venue" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Locations & Schedule</h3>
                  <p className="text-sm text-muted-foreground">Add all the places and times this event will happen.</p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => updateField("locations", [...data.locations, { id: crypto.randomUUID(), venue: "", city: "", address: "", date: "", time: "" }])}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Location
                </Button>
              </div>

              <div className="space-y-4">
                {data.locations.map((loc: any, idx: number) => (
                  <div key={loc.id} className="relative rounded-2xl border border-border/60 bg-secondary/10 p-5">
                    {data.locations.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => updateField("locations", data.locations.filter((_: any, i: number) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-primary uppercase tracking-wider">Stop {idx + 1}</p>
                    </div>
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={loc.date}
                            onChange={(e) => {
                              const newLocs = [...data.locations];
                              newLocs[idx].date = e.target.value;
                              updateField("locations", newLocs);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={loc.time}
                            onChange={(e) => {
                              const newLocs = [...data.locations];
                              newLocs[idx].time = e.target.value;
                              updateField("locations", newLocs);
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Venue name</Label>
                          <Input
                            value={loc.venue}
                            onChange={(e) => {
                              const newLocs = [...data.locations];
                              newLocs[idx].venue = e.target.value;
                              updateField("locations", newLocs);
                            }}
                            placeholder="Eko Convention Centre"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input
                            value={loc.city}
                            onChange={(e) => {
                              const newLocs = [...data.locations];
                              newLocs[idx].city = e.target.value;
                              updateField("locations", newLocs);
                            }}
                            placeholder="Lagos, NG"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={loc.address}
                          onChange={(e) => {
                            const newLocs = [...data.locations];
                            newLocs[idx].address = e.target.value;
                            updateField("locations", newLocs);
                          }}
                          placeholder="Plot 1415 Adetokunbo Ademola Street, Victoria Island"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
              <p className="text-xs text-muted-foreground">
                Recommended 1920×1080. We auto-generate social cards.
              </p>
            </div>
          )}

          {steps[step] === "Merchandise" && <MerchEditor merch={merch} setMerch={setMerch} currencySymbol={currencySymbol} />}

          {steps[step] === "VIP" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 p-4">
                <Crown className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">VIP access</p>
                  <p className="text-muted-foreground">
                    Define the experience for premium ticket holders.
                  </p>
                </div>
              </div>
              <div>
                <Label>VIP perks</Label>
                <Textarea
                  rows={5}
                  value={data.vipPerks}
                  onChange={(e) => updateField("vipPerks", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {steps[step] === "Publish" && (
            <PublishReview
              data={data}
              tickets={tickets}
              merch={merch}
              onPublish={handlePublish}
              isPending={publishMutation.isPending}
              currencySymbol={currencySymbol}
            />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
            <Button variant="outline" onClick={prev} disabled={step === 0} className="rounded-full">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate({ to: dashboardUrl })} className="rounded-full">
                Save & exit
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  onClick={next}
                  className="rounded-full"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
    </div>
  );
}

function TicketEditor({
  tickets,
  setTickets,
  currencySymbol,
}: {
  tickets: Ticket[];
  setTickets: (t: Ticket[]) => void;
  currencySymbol: string;
}) {
  const add = (type: Ticket["type"]) =>
    setTickets([
      ...tickets,
      {
        id: crypto.randomUUID(),
        name:
          type === "free"
            ? "Free RSVP"
            : type === "vip"
              ? "VIP"
              : type === "early"
                ? "Early Bird"
                : "Paid Ticket",
        price: type === "free" ? 0 : type === "vip" ? 95 : 25,
        quantity: 100,
        type,
      },
    ]);

  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["paid", "free", "early", "vip"] as const).map((t) => (
          <Button
            key={t}
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => add(t)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />{" "}
            {t === "paid" ? "Paid" : t === "free" ? "Free" : t === "early" ? "Early bird" : "VIP"}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_120px_120px_auto] items-end"
          >
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ticket Name</Label>
              <Input
                value={t.name}
                onChange={(e) => update(t.id, { name: e.target.value })}
                placeholder="Ticket name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Price ({currencySymbol.trim()})</Label>
              <Input
                type="number"
                value={t.price}
                onChange={(e) => update(t.id, { price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
              <Input
                type="number"
                value={t.quantity}
                onChange={(e) => update(t.id, { quantity: Number(e.target.value) })}
                placeholder="100"
              />
            </div>
            {t.type === "early" && (
              <div className="md:col-span-full">
                <Label className="text-xs text-muted-foreground mb-1 block">Early Bird Ends At</Label>
                <Input
                  type="datetime-local"
                  value={t.sale_ends_at || ""}
                  onChange={(e) => update(t.id, { sale_ends_at: e.target.value })}
                  className="w-full sm:w-auto"
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="mb-1"
              onClick={() => setTickets(tickets.filter((x) => x.id !== t.id))}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-sm text-muted-foreground">No tickets yet — add one above.</p>
        )}
      </div>
    </div>
  );
}

function MerchEditor({
  merch,
  setMerch,
  currencySymbol,
}: {
  merch: Merch[];
  setMerch: (m: Merch[]) => void;
  currencySymbol: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingBag className="h-4 w-4" /> Sell merch alongside tickets
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setMerch([...merch, { id: crypto.randomUUID(), name: "", price: 0 }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add item
        </Button>
      </div>
      <div className="space-y-3">
        {merch.map((m) => (
          <div
            key={m.id}
            className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_140px_auto] items-end"
          >
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Item Name</Label>
              <Input
                value={m.name}
                onChange={(e) =>
                  setMerch(merch.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))
                }
                placeholder="Tour Tee, Parking Pass…"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Price ({currencySymbol.trim()})</Label>
              <Input
                type="number"
                value={m.price}
                onChange={(e) =>
                  setMerch(
                    merch.map((x) => (x.id === m.id ? { ...x, price: Number(e.target.value) } : x)),
                  )
                }
                placeholder="0"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mb-1"
              onClick={() => setMerch(merch.filter((x) => x.id !== m.id))}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishReview({
  data,
  tickets,
  merch,
  onPublish,
  isPending,
  currencySymbol,
}: {
  data: any;
  tickets: Ticket[];
  merch: Merch[];
  onPublish: () => void;
  isPending?: boolean;
  currencySymbol: string;
}) {
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
            {data.locations.length === 1 ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {data.locations[0]?.date || "TBD"} · {data.locations[0]?.time || "TBD"}
                  {data.isRecurring && (
                    <span className="ml-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Repeats {data.recurrenceType} ({data.recurrenceCount} times)
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {data.locations[0]?.venue || "TBD"}, {data.locations[0]?.city || ""}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-xl">
                <MapPin className="h-4 w-4" /> {data.locations.length} Tour Stops / Locations
              </span>
            )}
          </div>
          <p className="mt-3 text-sm">{data.description || "No description yet."}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Tickets ({tickets.length})</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {tickets.map((t) => (
              <li key={t.id}>
                · {t.name} — {currencySymbol}{t.price} × {t.quantity}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Merchandise ({merch.length})</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {merch.map((m) => (
              <li key={m.id}>
                · {m.name || "(unnamed)"} — {currencySymbol}{m.price}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        onClick={onPublish}
        disabled={isPending}
        className="w-full h-12 rounded-2xl shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
        ) : (
          "Publish event"
        )}
      </Button>
    </div>
  );
}
