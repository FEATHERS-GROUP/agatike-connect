import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspaceForms } from "@/api/rsvps";
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
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/api/events";
import { getWorkspaceVipPrivileges } from "@/api/vip";
import { getCoordinates, getPlacesAutocomplete, getPlaceDetails } from "@/api/geocoding";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { uploadFile } from "@/api/storage";

// Stubbed mock data
const eventCategories: any[] = [];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
function getCurrencySymbol(currencyStr?: string) {
  if (!currencyStr) return "$";
  const c = currencyStr.toLowerCase().trim();
  switch (c) {
    // East Africa
    case "rwf":
    case "rwandan francs":
    case "frw":
      return "RWF ";
    case "kes":
    case "kenyan shillings":
    case "kenyan shilling":
      return "KES ";
    case "ugx":
    case "ugandan shillings":
    case "ugandan shilling":
      return "UGX ";
    case "tzs":
    case "tanzanian shillings":
    case "tanzanian shilling":
      return "TZS ";
    case "bif":
    case "burundian francs":
    case "burundian franc":
      return "BIF ";

    // West/South/Other Africa
    case "ngn":
    case "naira":
    case "nigerian naira":
      return "₦";
    case "zar":
    case "rand":
    case "south african rand":
      return "R ";
    case "ghs":
    case "cedi":
    case "ghanaian cedi":
      return "GH₵";
    case "xof":
    case "xaf":
    case "cfa":
    case "cfa franc":
      return "CFA ";

    // Global
    case "euros":
    case "euro":
    case "eur":
      return "€";
    case "pounds":
    case "pound":
    case "gbp":
      return "£";
    case "inr":
    case "rupee":
      return "₹";
    case "aed":
    case "dirham":
      return "AED ";
    case "cad":
      return "CAD ";
    case "aud":
      return "AUD ";
    case "dollars":
    case "usd":
    case "dollar":
    default:
      return "$";
  }
}

const steps = ["Details", "Venue", "Tickets", "Media", "Products", "VIP", "Publish"] as const;
type Step = (typeof steps)[number];

type Merch = { id: string; name: string; price: number; image?: string };

function AddressAutocomplete({
  value,
  onChange,
  onSelectCoordinates,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectCoordinates: (lat: string, lng: string) => void;
}) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={async (e) => {
          const val = e.target.value;
          onChange(val);
          if (!val.trim()) {
            setPredictions([]);
            setIsOpen(false);
            return;
          }
          setIsOpen(true);
          setIsLoading(true);
          try {
            const results = await getPlacesAutocomplete({ data: val } as any);
            setPredictions(results);
          } catch (err) {
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        }}
        onFocus={() => value.trim() && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder="Plot 1415 Adetokunbo Ademola Street..."
        className="mt-1"
      />
      {isOpen && (predictions.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none">
          {isLoading && predictions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
          )}
          {!isLoading &&
            predictions.map((p) => (
              <div
                key={p.place_id}
                className="relative flex cursor-pointer select-none flex-col rounded-sm px-4 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={async () => {
                  onChange(p.description);
                  setIsOpen(false);
                  const coords = await getPlaceDetails({ data: p.place_id } as any);
                  if (coords && coords.lat && coords.lng) {
                    onSelectCoordinates(coords.lat, coords.lng);
                  }
                }}
              >
                <span className="font-medium text-foreground">
                  {p.structured_formatting?.main_text || p.description}
                </span>
                {p.structured_formatting?.secondary_text && (
                  <span className="text-xs text-muted-foreground">
                    {p.structured_formatting.secondary_text}
                  </span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

import { TicketEditor, Ticket } from "./TicketEditor";

export function CreateEventDesktop() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ strict: false }) as { workspaceSlug?: string };
  const { step: urlStep } = useSearch({ strict: false }) as { step?: number };
  const step = urlStep || 0;
  const { activeWorkspace } = useWorkspace();
  const currencySymbol = getCurrencySymbol(activeWorkspace?.wallet?.currency);

  const { data: forms = [] } = useQuery({
    queryKey: ["workspace_forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: vipPrivileges = [] } = useQuery({
    queryKey: ["workspace-vip-privileges", activeWorkspace?.id],
    queryFn: () => getWorkspaceVipPrivileges({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const dashboardUrl = workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard";

  const setStep = (newStep: number) => {
    navigate({ search: { step: newStep } as any, replace: true });
  };

  const defaultData = {
    title: "",
    category: eventCategories[0],
    description: "",
    locations: [
      {
        id: generateId(),
        venue: "",
        city: "",
        address: "",
        date: "",
        time: "",
        latitude: null as string | null,
        longitude: null as string | null,
      },
    ],
    coverPreview: "",
    vipPerks: "Priority entry, VIP lounge, complimentary welcome drink",
    published: false,
    isRecurring: false,
    recurrenceType: "weekly",
    recurrenceCount: 4,
  };

  const defaultTickets: Ticket[] = [
    {
      id: "1",
      name: "General Admission",
      price: 25,
      quantity: 200,
      type: "paid",
      tour_stop_idx: null,
    },
  ];

  const [data, setData] = useState(defaultData);
  const [sameTicketsForAllLocations, setSameTicketsForAllLocations] = useState(true);
  const [activeTourStopIdx, setActiveTourStopIdx] = useState(0);

  const [tickets, setTickets] = useState<Ticket[]>(defaultTickets);
  const [merch, setMerch] = useState<Merch[]>([{ id: "m1", name: "Event Tee", price: 20 }]);

  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const draft = localStorage.getItem("create_event_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.data) setData(parsed.data);
        if (parsed.tickets) setTickets(parsed.tickets);
        if (parsed.merch) setMerch(parsed.merch);
        if (parsed.sameTickets !== undefined) setSameTicketsForAllLocations(parsed.sameTickets);
        toast.info("Restored your event draft from your last session.");
      } catch (e) {
        console.error("Failed to parse event draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draftState = {
      data,
      tickets,
      merch,
      sameTickets: sameTicketsForAllLocations,
    };
    localStorage.setItem("create_event_draft", JSON.stringify(draftState));
    toast.success("Draft saved! You can safely leave and come back later.");
  };

  const clearDraft = () => {
    localStorage.removeItem("create_event_draft");
    setData(defaultData);
    setTickets(defaultTickets);
    setMerch([{ id: "m1", name: "Event Tee", price: 20 }]);
    setSameTicketsForAllLocations(true);
    setStep(0);
    toast.success("Draft cleared. Starting fresh.");
  };

  const updateField = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    setData({ ...data, [k]: v });

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };

  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));

  const publishMutation = useMutation({
    mutationFn: async () => {
      // Upload cover image to Supabase if a file was selected
      let coverUrl = data.coverPreview || "";
      if (coverFile) {
        try {
          const base64 = await fileToBase64(coverFile);
          const ext = coverFile.name.split(".").pop() || "jpg";
          const res = await uploadFile({
            data: { base64, contentType: coverFile.type, folder: "events/covers", ext },
          } as any);
          coverUrl = res.url;
        } catch (err) {
          console.error("Cover upload failed:", err);
          toast.error("Cover image upload failed. Please try again.");
          throw err;
        }
      }

      // Upload any merch images that are still blob URLs
      const uploadedMerch = await Promise.all(
        merch.map(async (m) => {
          if (m.image && m.image.startsWith("blob:")) {
            try {
              const resp = await fetch(m.image);
              const blob = await resp.blob();
              const file = new File([blob], "merch.jpg", { type: blob.type });
              const base64 = await fileToBase64(file);
              const res = await uploadFile({
                data: { base64, contentType: file.type, folder: "events/merch", ext: "jpg" },
              } as any);
              return { ...m, image: res.url };
            } catch {
              return { ...m, image: "" };
            }
          }
          return m;
        }),
      );
      // 1. Prepare payload
      const payload = {
        title: data.title,
        category: data.category,
        description: data.description,
        cover: coverUrl,
        vipPerks: data.vipPerks,
        workspace_id: activeWorkspace?.id,
        tour_stops: data.locations,
        event_requency: data.isRecurring
          ? { type: data.recurrenceType, count: data.recurrenceCount }
          : {},
        event_tickets: {
          data: tickets.map((t) => {
            let finalType = (t.type || "").toLowerCase();
            const lowerName = (t.name || "").toLowerCase();
            
            if (lowerName.includes("vip")) finalType = "vip";
            else if (lowerName.includes("early")) finalType = "early";
            else if (lowerName.includes("free") || Number(t.price) === 0) finalType = "free";
            else if (finalType !== "vip" && finalType !== "early" && finalType !== "free") finalType = "paid";

            return {
              name: t.name,
              type: finalType,
              cost: t.price.toString(),
              remaining: t.quantity.toString(),
              sold: "0",
              sale_ends_at: finalType === "early" ? t.sale_ends_at || null : null,
              tour_stop_idx: sameTicketsForAllLocations ? null : t.tour_stop_idx,
            };
          }),
        },
        merchandises: {
          data: uploadedMerch.map((m) => ({
            name: m.name,
            cost: m.price.toString(),
            image: m.image || "",
            organizer_id: activeWorkspace?.orgnizer_id,
            remaining: "100",
            sold: "0",
          })),
        },
      };

      return await createEvent({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Event created successfully!");
      setTimeout(() => {
        navigate({
          to: "/dashboard/$workspaceSlug/events",
          params: { workspaceSlug: workspaceSlug || "" },
        });
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handlePublish = () => {
    publishMutation.mutate();
  };

  // All hooks must be called before any conditional returns
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
                  {eventCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold">Event Frequency</Label>
                  <p className="text-sm text-muted-foreground">
                    Will this event happen more than once?
                  </p>
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

        {steps[step] === "Tickets" && (
          <TicketEditor
            tickets={tickets}
            setTickets={setTickets}
            currencySymbol={currencySymbol}
            locations={data.locations}
            sameTicketsForAllLocations={sameTicketsForAllLocations}
            setSameTicketsForAllLocations={setSameTicketsForAllLocations}
            activeTourStopIdx={activeTourStopIdx}
            setActiveTourStopIdx={setActiveTourStopIdx}
            forms={forms}
            vipPrivileges={vipPrivileges}
          />
        )}

        {steps[step] === "Venue" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Locations & Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Add all the places and times this event will happen.
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() =>
                  updateField("locations", [
                    ...data.locations,
                    {
                      id: generateId(),
                      venue: "",
                      city: "",
                      address: "",
                      date: "",
                      time: "",
                      latitude: null,
                      longitude: null,
                    },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Location
              </Button>
            </div>

            <div className="space-y-4">
              {data.locations.map((loc: any, idx: number) => (
                <div
                  key={loc.id}
                  className="relative rounded-2xl border border-border/60 bg-secondary/10 p-5"
                >
                  {data.locations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        updateField(
                          "locations",
                          data.locations.filter((_: any, i: number) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Stop {idx + 1}
                    </p>
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
                      <AddressAutocomplete
                        value={loc.address}
                        onChange={(val) => {
                          const newLocs = [...data.locations];
                          newLocs[idx].address = val;
                          updateField("locations", newLocs);
                        }}
                        onSelectCoordinates={(lat, lng) => {
                          const newLocs = [...data.locations];
                          newLocs[idx].latitude = lat;
                          newLocs[idx].longitude = lng;
                          updateField("locations", newLocs);
                          toast.success("Location coordinates captured!");
                        }}
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

        {steps[step] === "Products" && (
          <MerchEditor merch={merch} setMerch={setMerch} currencySymbol={currencySymbol} />
        )}

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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="rounded-full shadow-none text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={clearDraft}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Start fresh
            </Button>
            <Button variant="outline" className="rounded-full shadow-sm" onClick={saveDraft}>
              <Save className="mr-1.5 h-4 w-4" /> Save for later
            </Button>
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={prev} className="rounded-full">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                className="rounded-full px-8"
                style={{ background: "var(--gradient-primary)" }}
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="rounded-full px-8 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Event
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  tickets: Ticket[];
  setTickets: (t: Ticket[]) => void;
  currencySymbol: string;
  locations: any[];
  sameTicketsForAllLocations: boolean;
  setSameTicketsForAllLocations: (val: boolean) => void;
  activeTourStopIdx: number;
  setActiveTourStopIdx: (val: number) => void;
  forms?: any[];
  vipPrivileges?: any[];
}) {
  const displayedTickets = tickets.filter((t) =>
    sameTicketsForAllLocations ? true : t.tour_stop_idx === activeTourStopIdx,
  );

  const add = (type: Ticket["type"]) =>
    setTickets([
      ...tickets,
      {
        id: generateId(),
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
        tour_stop_idx: sameTicketsForAllLocations ? null : activeTourStopIdx,
      },
    ]);

  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-6">
      {locations.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/20 p-5">
          <div>
            <Label className="text-base font-semibold">Location-Specific Tickets</Label>
            <p className="text-sm text-muted-foreground">
              Do you want different ticket tiers or prices per location?
            </p>
          </div>
          <div className="flex bg-secondary p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setSameTicketsForAllLocations(true);
                setTickets(tickets.map((t) => ({ ...t, tour_stop_idx: null })));
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${sameTicketsForAllLocations ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Same for all
            </button>
            <button
              type="button"
              onClick={() => {
                setSameTicketsForAllLocations(false);
                setTickets(tickets.map((t) => ({ ...t, tour_stop_idx: activeTourStopIdx })));
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${!sameTicketsForAllLocations ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Set up per location
            </button>
          </div>
        </div>
      )}

      {locations.length > 1 && !sameTicketsForAllLocations && (
        <div className="flex items-center gap-2 border-b border-border/60 pb-4 overflow-x-auto">
          {locations.map((loc: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTourStopIdx(idx)}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTourStopIdx === idx ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
            >
              {loc.venue || loc.city || `Location ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

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
        {displayedTickets.map((t) => (
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
              <Label className="text-xs text-muted-foreground mb-1 block">
                Price ({currencySymbol.trim()})
              </Label>
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
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Early Bird Ends At
                </Label>
                <Input
                  type="datetime-local"
                  value={t.sale_ends_at || ""}
                  onChange={(e) => update(t.id, { sale_ends_at: e.target.value })}
                  className="w-full sm:w-auto"
                />
              </div>
            )}
            <div className="md:col-span-full">
              <Label className="text-xs text-muted-foreground mb-1 block">What's Included</Label>
              <div className="space-y-2">
                {(t.includes || [""]).map((inc: string, incIdx: number) => (
                  <div key={incIdx} className="flex items-center gap-2">
                    <Input
                      value={inc}
                      onChange={(e) => {
                        const newIncludes = [...(t.includes || [""])];
                        newIncludes[incIdx] = e.target.value;
                        update(t.id, { includes: newIncludes });
                      }}
                      placeholder="e.g. Backstage access"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        const newIncludes = [...(t.includes || [""])];
                        newIncludes.splice(incIdx, 1);
                        update(t.id, { includes: newIncludes });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-primary hover:text-primary/80"
                onClick={() => {
                  update(t.id, { includes: [...(t.includes || []), ""] });
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add included item
              </Button>
            </div>
            {(t.price === 0 || t.type === "free") && forms.length > 0 && (
              <div className="md:col-span-full">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Attach Registration Form (Optional)
                </Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={t.form_id || ""}
                  onChange={(e) => update(t.id, { form_id: e.target.value })}
                >
                  <option value="">No form (Standard checkout)</option>
                  {forms.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {vipPrivileges.length > 0 && (
              <div className="md:col-span-full mt-2 border-t border-border/40 pt-2">
                <Label className="text-xs text-muted-foreground mb-1 block">VIP Privileges & Perks</Label>
                <div className="flex flex-wrap gap-2">
                  {vipPrivileges.map((privilege: any) => {
                    const isSelected = t.vip_privilege_ids?.includes(privilege.id);
                    return (
                      <div
                        key={privilege.id}
                        className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          isSelected
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-background border-border/60 text-muted-foreground hover:border-primary/50"
                        }`}
                        onClick={() => {
                          const currentIds = t.vip_privilege_ids || [];
                          if (isSelected) {
                            update(t.id, { vip_privilege_ids: currentIds.filter((id) => id !== privilege.id) });
                          } else {
                            update(t.id, { vip_privilege_ids: [...currentIds, privilege.id] });
                          }
                        }}
                      >
                        {privilege.name}
                      </div>
                    );
                  })}
                </div>
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
        {displayedTickets.length === 0 && (
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
          <ShoppingBag className="h-4 w-4" /> Sell products, vouchers, and add-ons
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setMerch([...merch, { id: generateId(), name: "", price: 0 }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add item
        </Button>
      </div>
      <div className="space-y-3">
        {merch.map((m) => (
          <div
            key={m.id}
            className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[auto_1fr_140px_auto] items-end"
          >
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Item Image</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                {m.image ? (
                  <img
                    src={m.image}
                    alt="merch"
                    className="h-10 w-10 rounded-lg object-cover border border-border/60"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg border-2 border-dashed border-border/60 grid place-items-center text-muted-foreground hover:border-primary transition">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {m.image ? "Change" : "Upload"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setMerch(merch.map((x) => (x.id === m.id ? { ...x, image: url } : x)));
                  }}
                />
              </label>
            </div>
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
              <Label className="text-xs text-muted-foreground mb-1 block">
                Price ({currencySymbol.trim()})
              </Label>
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
          <div className="mt-3 flex flex-col gap-2">
            {data.locations.map((loc: any, i: number) => (
              <div
                key={loc.id}
                className="rounded-xl border border-border/40 bg-secondary/20 p-3 text-sm"
              >
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {data.locations.length > 1 ? `Stop ${i + 1}: ` : ""}
                  {loc.venue || "TBD"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {loc.date || "TBD"} at {loc.time || "TBD"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground pl-5.5">
                  {loc.address}, {loc.city}
                </div>
              </div>
            ))}
            {data.isRecurring && (
              <span className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                Repeats {data.recurrenceType} ({data.recurrenceCount} times)
              </span>
            )}
          </div>
          <p className="mt-4 text-sm whitespace-pre-wrap">
            {data.description || "No description yet."}
          </p>
        </div>
      </div>

      {data.vipPerks && (
        <div className="rounded-2xl border border-border/60 bg-accent/20 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Crown className="h-4 w-4 text-primary" /> VIP Perks
          </div>
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{data.vipPerks}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Tickets ({tickets.length})</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-col">
                <span>
                  · <strong className="text-foreground font-medium">{t.name}</strong> —{" "}
                  {currencySymbol}
                  {t.price} × {t.quantity}
                </span>
                {t.type === "early" && t.sale_ends_at && (
                  <span className="text-xs text-primary pl-3">
                    Sale ends: {new Date(t.sale_ends_at).toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-semibold">Products & Add-ons ({merch.length})</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {merch.map((m) => (
              <li key={m.id}>
                · {m.name || "(unnamed)"} — {currencySymbol}
                {m.price}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
