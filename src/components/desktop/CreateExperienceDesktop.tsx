import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { experienceCategories } from "@/lib/mock-data";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

import { CategorySelectStep } from "./CreateExperience/CategorySelectStep";
import { ExperienceVenueStep } from "./CreateExperience/ExperienceVenueStep";
import { ExperienceItineraryStep } from "./CreateExperience/ExperienceItineraryStep";

function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

const ROUTE_CATEGORIES = ["Hiking", "Running", "Trips", "Bike Rides"];

export function CreateExperienceDesktop({
  isEdit = false,
  initialData = null,
}: {
  isEdit?: boolean;
  initialData?: any;
}) {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ strict: false }) as { workspaceSlug?: string };
  const { step: urlStep } = useSearch({ strict: false }) as { step?: number };
  const step = urlStep || 0;
  const { activeWorkspace } = useWorkspace();

  const dashboardUrl = workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard";

  const [data, setData] = useState({
    title: initialData?.title || "",
    city: initialData?.city || "",
    category: initialData?.category || experienceCategories[0],
    description: initialData?.description || "",
    date: initialData?.date || "",
    duration: initialData?.duration || "",
    venueName: initialData?.venueName || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    routeDistance: initialData?.routeDistance || null,
    itinerary: initialData?.itinerary?.length > 0 ? initialData.itinerary : [
      { id: generateId(), title: "Starting Point", address: "", time: "08:00", lat: null, lng: null },
      { id: generateId(), title: "Stopping Point", address: "", time: "16:00", lat: null, lng: null },
    ],
    tickets: initialData?.tickets?.length > 0 ? initialData.tickets : [
      { id: generateId(), name: "General Admission", price: 45, quantity: 20 },
    ],
    coverPreview: initialData?.cover || "",
    published: false,
  });

  const isRouteBased = ROUTE_CATEGORIES.includes(data.category);
  const locationStepName = isRouteBased ? "Itinerary" : "Venue";
  const steps = ["Category", "Details", locationStepName, "Tickets", "Media", "Publish"] as const;

  const setStep = (newStep: number) => {
    navigate({ search: { step: newStep } as any, replace: true });
  };

  const updateField = (k: string, v: any) =>
    setData({ ...data, [k]: v });

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };

  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));

  const publishMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call to publish the experience
      return new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onSuccess: () => {
      updateField("published", true);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create experience");
    },
  });

  const handlePublish = () => {
    publishMutation.mutate();
  };

  if (data.published) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground animate-scale-in shadow-xl shadow-primary/20"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {data.title || "Your experience"} is {isEdit ? "updated" : "live"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your experience has been {isEdit ? "updated" : "published and is ready for bookings"}.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={dashboardUrl}>
            <Button variant="outline" className="rounded-full shadow-sm">
              Back to dashboard
            </Button>
          </Link>
          <Link to="/dashboard/$workspaceSlug/experiences" params={{ workspaceSlug: workspaceSlug || "workspace" }}>
            <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              View Experiences
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 sm:p-10 shadow-[var(--shadow-card)]">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{isEdit ? "Edit" : "Create"} - {steps[step]}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* STEP 0: Category */}
        {steps[step] === "Category" && (
          <CategorySelectStep
            selectedCategory={data.category}
            onSelectCategory={(cat) => updateField("category", cat)}
          />
        )}

        {/* STEP 1: Details */}
        {steps[step] === "Details" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <Label>Experience title</Label>
              <Input
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Mount Meru Sunrise Hike"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={5}
                value={data.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Tell people what makes this experience special..."
                className="mt-1 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Location (Dynamic) */}
        {steps[step] === "Itinerary" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ExperienceItineraryStep data={data} updateField={updateField} />
          </div>
        )}
        {steps[step] === "Venue" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ExperienceVenueStep data={data} updateField={updateField} />
          </div>
        )}

        {/* STEP 3: Tickets & Pricing */}
        {steps[step] === "Tickets" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-semibold mb-1">Pricing & Capacity</h3>
              <p className="text-sm text-muted-foreground">Set how much it costs and how many spots are available.</p>
            </div>

            <div className="space-y-4">
              {data.tickets.map((ticket: any, idx: number) => (
                <div key={ticket.id} className="rounded-2xl border border-border/60 p-5 bg-card shadow-sm">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Ticket Name</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) => {
                          const newTix = [...data.tickets];
                          newTix[idx].name = e.target.value;
                          updateField("tickets", newTix);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => {
                          const newTix = [...data.tickets];
                          newTix[idx].price = Number(e.target.value);
                          updateField("tickets", newTix);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity (Spots)</Label>
                      <Input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => {
                          const newTix = [...data.tickets];
                          newTix[idx].quantity = Number(e.target.value);
                          updateField("tickets", newTix);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Media */}
        {steps[step] === "Media" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label className="text-base font-semibold">Experience Cover Image</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a beautiful cover image that showcases the experience. This will be the first thing people see.
            </p>
            <label className="block aspect-[21/9] cursor-pointer overflow-hidden rounded-[2rem] border-2 border-dashed border-border/60 bg-secondary/30 transition-all hover:border-primary hover:bg-secondary/50 relative group">
              {data.coverPreview ? (
                <>
                  <img src={data.coverPreview} alt="cover" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Change Image</p>
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-background shadow-sm border border-border/60 flex items-center justify-center mx-auto mb-4 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-foreground">Click or drag image to upload</p>
                    <p className="mt-1 text-xs text-muted-foreground">High resolution, minimal text recommended.</p>
                  </div>
                </div>
              )}
              <input type="file" accept="image/*" hidden onChange={onCoverUpload} />
            </label>
          </div>
        )}

        {/* STEP 5: Publish */}
        {steps[step] === "Publish" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
              <div className="aspect-[21/9] bg-secondary/50 relative">
                {data.coverPreview ? (
                  <img src={data.coverPreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No cover image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <h3 className="text-3xl font-bold text-white drop-shadow-md">{data.title || "Untitled Experience"}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border/60">
                  <span className="inline-flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4" /> {data.city || "No City"}</span>
                  <span className="inline-flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4" /> {data.date || "No Date"}</span>
                </div>
                
                <h4 className="font-semibold mb-3">Highlights</h4>
                <div className="space-y-3">
                  {isRouteBased ? data.itinerary.map((stop: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                        {i < data.itinerary.length - 1 && <div className="w-0.5 h-full bg-border mt-2"></div>}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{stop.title || `Stop ${i+1}`}</p>
                        <p className="text-sm text-muted-foreground">{stop.time} • {stop.address}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{data.venueName || "Venue"}</p>
                        <p className="text-sm text-muted-foreground">{data.startTime} - {data.endTime}</p>
                      </div>
                    </div>
                  )}
                  {data.routeDistance && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-1.5 text-sm font-medium">
                      Route Distance: {data.routeDistance} km
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              size="lg"
              className="w-full rounded-full h-14 text-base shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isEdit ? "Save Changes" : "Publish Experience"}
            </Button>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
          <Button variant="outline" onClick={prev} disabled={step === 0 || publishMutation.isPending} className="rounded-full shadow-sm hover:bg-secondary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: dashboardUrl })}
              className="rounded-full hover:bg-secondary"
            >
              Cancel
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                className="rounded-full shadow-[var(--shadow-glow)] hover:shadow-lg transition-all"
                style={{ background: "var(--gradient-primary)" }}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
