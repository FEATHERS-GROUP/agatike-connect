import { createFileRoute, useNavigate, useParams, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { LocationSearchInput } from "@/components/desktop/LocationSearchInput";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  MapPin,
  Building2,
  Dumbbell,
  Laptop,
  Camera,
  Coffee,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  UploadCloud,
  Clock,
  Phone,
  Instagram,
  MessageCircle,
  Eye,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createSpace } from "@/api/spaces";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { COUNTRIES } from "@/lib/countries";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/create-space")({
  validateSearch: z.object({
    step: z.number().catch(0),
  }),
  component: NewSpaceWizard,
});

const SPACE_TYPES = [
  {
    id: "Coworking",
    title: "Co-working Space",
    description: "Shared workspace for freelancers, startups, and remote workers.",
    icon: "Laptop",
  },
  {
    id: "Gym",
    title: "Gym & Fitness",
    description: "Fitness center with equipment, classes, and personal training.",
    icon: "Dumbbell",
  },
  {
    id: "Office",
    title: "Private Office",
    description: "Dedicated office spaces for teams and companies.",
    icon: "Building2",
  },
  {
    id: "Studio",
    title: "Creative Studio",
    description: "Photography, recording, or art studios for rent.",
    icon: "Camera",
  },
  {
    id: "Cafe",
    title: "Work Cafe",
    description: "Cafes that offer dedicated workspace and internet for patrons.",
    icon: "Coffee",
  },
  {
    id: "Other",
    title: "Other Space",
    description: "Any other type of membership or rentable space.",
    icon: "MapPin",
  },
];

function NewSpaceWizard() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/spaces/create-space" });
  const navigate = useNavigate();
  const { step } = useSearch({ from: "/dashboard/$workspaceSlug/spaces/create-space" }) as {
    step: number;
  };
  const { activeWorkspace } = useWorkspace();

  const DRAFT_KEY = `space_draft_${workspaceSlug}`;

  const DEFAULT_FORM_DATA = {
    name: "",
    type: "",
    description: "",
    locations: [
      {
        name: "Main Location",
        city: "",
        country: "RW",
        address: "",
        lat: "",
        lng: "",
        opening_hours: {
          monday: { open: "08:00", close: "18:00", closed: false, is24Hours: false },
          tuesday: { open: "08:00", close: "18:00", closed: false, is24Hours: false },
          wednesday: { open: "08:00", close: "18:00", closed: false, is24Hours: false },
          thursday: { open: "08:00", close: "18:00", closed: false, is24Hours: false },
          friday: { open: "08:00", close: "18:00", closed: false, is24Hours: false },
          saturday: { open: "09:00", close: "15:00", closed: false, is24Hours: false },
          sunday: { open: "09:00", close: "15:00", closed: true, is24Hours: false },
        },
      },
    ],
    plans: [
      {
        name: "Day Pass",
        price: "",
        billing_cycle: "Daily",
        description: "",
        features: ["Access to space"],
      },
    ],
    cover_url: "",
    socials: { instagram: "", whatsapp: "", phone: "" },
  };

  const [isUploading, setIsUploading] = useState(false);
  const [expandedHoursLoc, setExpandedHoursLoc] = useState<number>(0);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).formData;
        const legacyHours = parsed?.opening_hours;

        return {
          ...DEFAULT_FORM_DATA,
          ...parsed,
          socials: { ...DEFAULT_FORM_DATA.socials, ...(parsed?.socials || {}) },
          locations: (parsed?.locations || DEFAULT_FORM_DATA.locations).map((loc: any) => ({
            ...loc,
            opening_hours:
              loc.opening_hours || legacyHours || DEFAULT_FORM_DATA.locations[0].opening_hours,
          })),
        };
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    return DEFAULT_FORM_DATA;
  });

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved && step === 0) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.step > 0) {
          navigate({ search: { step: parsed.step } as any, replace: true });
        }
      } catch (e) {}
    }
  }, [workspaceSlug]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, formData }));
  }, [step, formData, DRAFT_KEY]);

  const { mutate: handleCreateSpace, isPending } = useMutation({
    mutationFn: async () => {
      const workspace_id = activeWorkspace?.id;
      if (!workspace_id) throw new Error("No active workspace found");

      return createSpace({
        data: {
          workspace_id,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          currency: activeWorkspace?.currency || "RWF",
          cover_url:
            formData.cover_url ||
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
          socials: formData.socials,
          locations: formData.locations.map((loc: any, idx: number) => ({
            ...loc,
            id: `loc-${idx + 1}`,
          })),
          plans: formData.plans,
        },
      });
    },
    onSuccess: () => {
      toast.success("Space created successfully");
      localStorage.removeItem(DRAFT_KEY);
      navigate({ to: `/dashboard/${workspaceSlug}/spaces` });
    },
    onError: (error) => {
      toast.error("Failed to create space");
      console.error(error);
    },
  });

  const setStep = (newStep: number) => {
    navigate({ search: { step: newStep } as any, replace: true });
  };

  const nextStep = () => {
    if (step === 0 && !formData.type) return toast.error("Please select a space type");
    if (step === 1 && !formData.name) return toast.error("Space name is required");
    if (step === 2 && formData.locations.some((l: any) => !l.city || !l.address || !l.name))
      return toast.error("Please fill in all details for your locations");

    setStep(Math.min(step + 1, 5));
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 0));
  };

  const updateLocationHours = (locIdx: number, day: string, field: string, val: any) => {
    setFormData((p: any) => ({
      ...p,
      locations: p.locations.map((loc: any, i: number) => {
        if (i !== locIdx) return loc;
        return {
          ...loc,
          opening_hours: {
            ...loc.opening_hours,
            [day]: { ...loc.opening_hours[day], [field]: val },
          },
        };
      }),
    }));
  };

  const addPlan = () => {
    setFormData((p) => ({
      ...p,
      plans: [
        ...p.plans,
        { name: "", price: "", billing_cycle: "Monthly", description: "", features: [""] },
      ],
    }));
  };

  const updatePlan = (idx: number, field: string, val: any) => {
    setFormData((p) => ({
      ...p,
      plans: p.plans.map((t, i) => (i === idx ? { ...t, [field]: val } : t)),
    }));
  };

  const addFeature = (planIdx: number) => {
    setFormData((p) => ({
      ...p,
      plans: p.plans.map((t, i) =>
        i === planIdx ? { ...t, features: [...(t.features || []), ""] } : t,
      ),
    }));
  };

  const updateFeature = (planIdx: number, featIdx: number, val: string) => {
    setFormData((p) => ({
      ...p,
      plans: p.plans.map((t, i) =>
        i === planIdx
          ? {
              ...t,
              features: (t.features || []).map((f: string, fi: number) =>
                fi === featIdx ? val : f,
              ),
            }
          : t,
      ),
    }));
  };

  const removeFeature = (planIdx: number, featIdx: number) => {
    setFormData((p) => ({
      ...p,
      plans: p.plans.map((t, i) =>
        i === planIdx
          ? { ...t, features: (t.features || []).filter((_: string, fi: number) => fi !== featIdx) }
          : t,
      ),
    }));
  };

  const removePlan = (idx: number) => {
    setFormData((p) => ({ ...p, plans: p.plans.filter((_, i) => i !== idx) }));
  };

  const addLocation = () => {
    setFormData((p) => ({
      ...p,
      locations: [
        ...p.locations,
        {
          name: "",
          city: "",
          country: "RW",
          address: "",
          lat: "",
          lng: "",
          opening_hours: DEFAULT_FORM_DATA.locations[0].opening_hours,
        },
      ],
    }));
  };

  const updateLocation = (idx: number, field: string, val: any) => {
    setFormData((p) => ({
      ...p,
      locations: p.locations.map((t: any, i: number) => (i === idx ? { ...t, [field]: val } : t)),
    }));
  };

  const removeLocation = (idx: number) => {
    setFormData((p) => ({ ...p, locations: p.locations.filter((_: any, i: number) => i !== idx) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, "spaces/covers");
      setFormData((prev) => ({ ...prev, cover_url: url }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Left Sidebar - Sticky Progress */}
      <div className="hidden lg:flex w-80 flex-col border-r border-border/60 bg-secondary/10 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full shrink-0">
        <h3 className="font-bold text-lg mb-6">Setup Progress</h3>
        <div className="space-y-5 flex-1">
          {[
            { label: "Space Type", desc: "Category" },
            { label: "Details", desc: "Name & info" },
            { label: "Locations", desc: "Addresses" },
            { label: "Plans", desc: "Pricing setup" },
            { label: "Opening Hours", desc: "Weekly schedule" },
            { label: "Review", desc: "Final check" },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== 5 && (
                <div
                  className={cn(
                    "absolute left-[11px] top-8 bottom-[-16px] w-[2px]",
                    step > i ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-[11px] transition-colors shadow-sm",
                  step > i
                    ? "bg-primary text-primary-foreground"
                    : step === i
                      ? "bg-background border-2 border-primary text-primary"
                      : "bg-secondary text-muted-foreground border border-border",
                )}
              >
                {step > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div className="-mt-1">
                <p className={cn("font-semibold text-sm", step === i ? "text-primary" : "")}>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 p-4 lg:p-10 relative">
        <div className="max-w-4xl w-full mx-auto">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">What kind of space are you creating?</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Select the type that best describes your property.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {SPACE_TYPES.map((st) => {
                  const iconsMap: Record<string, any> = {
                    Laptop,
                    Dumbbell,
                    Building2,
                    Camera,
                    Coffee,
                    MapPin,
                  };
                  const Icon = iconsMap[st.icon];

                  return (
                    <button
                      key={st.id}
                      onClick={() => setFormData((p) => ({ ...p, type: st.id }))}
                      className={cn(
                        "flex items-start text-left gap-4 p-6 rounded-2xl border-2 transition-all hover:border-primary/50 cursor-pointer",
                        formData.type === st.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-secondary/20",
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl shrink-0 transition-colors",
                          formData.type === st.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {Icon && <Icon className="h-7 w-7" />}
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{st.title}</span>
                        <span className="text-muted-foreground text-sm mt-1 block leading-snug">
                          {st.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Space Details</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  What should we call your space and what is it about?
                </p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label className="text-base">
                    Space Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="h-12 text-lg rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Impact Hub Kigali"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <Textarea
                    className="min-h-[140px] rounded-xl resize-none text-base p-4"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the vibe, layout, and what makes your space special..."
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <Label className="text-base">Cover Image</Label>
                  {formData.cover_url ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border">
                      <img
                        src={formData.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData((p) => ({ ...p, cover_url: "" }))}
                        className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full hover:bg-red-500 text-sm font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-48 bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60 relative hover:bg-secondary/40 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 mb-3 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Click to upload cover image
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-border/60">
                  <h3 className="text-xl font-bold mb-4">Contact & Socials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        className="rounded-xl"
                        placeholder="+250 788 123 456"
                        value={formData.socials.phone}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            socials: { ...p.socials, phone: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input
                        className="rounded-xl"
                        placeholder="+250 788 123 456"
                        value={formData.socials.whatsapp}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            socials: { ...p.socials, whatsapp: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram Link</Label>
                      <Input
                        className="rounded-xl"
                        placeholder="https://instagram.com/yourspace"
                        value={formData.socials.instagram}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            socials: { ...p.socials, instagram: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Space Locations</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Where are your spaces located? You can add multiple locations.
                </p>
              </div>
              <div className="space-y-6 mt-8">
                {formData.locations.map((loc: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 bg-secondary/20 rounded-2xl border border-border/60 relative space-y-6"
                  >
                    <div className="space-y-2">
                      <Label className="text-base">
                        Location Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="h-12 text-lg rounded-xl"
                        value={loc.name}
                        onChange={(e) => updateLocation(idx, "name", e.target.value)}
                        placeholder="e.g. Kigali HQ"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <select
                          className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base"
                          value={loc.country}
                          onChange={(e) => updateLocation(idx, "country", e.target.value)}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">
                          City / Area <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          className="h-12 text-lg rounded-xl"
                          value={loc.city}
                          onChange={(e) => updateLocation(idx, "city", e.target.value)}
                          placeholder="e.g. Kigali"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base">
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                      <LocationSearchInput
                        className="h-12 text-lg rounded-xl flex items-center px-3"
                        value={loc.address}
                        onChange={(val) => updateLocation(idx, "address", val)}
                        onSelectCoordinates={(lat, lng) => {
                          if (lat && lng) {
                            updateLocation(idx, "lat", lat);
                            updateLocation(idx, "lng", lng);
                          }
                        }}
                        placeholder="e.g. KG 11 Ave"
                      />
                    </div>
                    {formData.locations.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-3 -right-3 rounded-full h-8 w-8"
                        onClick={() => removeLocation(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed py-8 rounded-2xl"
                  onClick={addLocation}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Location
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Membership Plans</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Define your pricing plans and what's included in each.
                </p>
              </div>
              <div className="space-y-6 mt-8">
                {formData.plans.map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-secondary/20 rounded-2xl border border-border/60 relative space-y-4"
                  >
                    {/* Plan Name, Price, Cycle */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Plan Name</Label>
                        <Input
                          value={plan.name}
                          onChange={(e) => updatePlan(idx, "name", e.target.value)}
                          placeholder="e.g. Day Pass"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price ({activeWorkspace?.currency || "RWF"})</Label>
                        <Input
                          type="number"
                          value={plan.price}
                          onChange={(e) => updatePlan(idx, "price", e.target.value)}
                          placeholder="Amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Billing Cycle</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={plan.billing_cycle || "Monthly"}
                          onChange={(e) => updatePlan(idx, "billing_cycle", e.target.value)}
                        >
                          <option value="One-time">One-time</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Annually">Annually</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        className="min-h-[80px] rounded-xl resize-none text-sm p-3"
                        value={plan.description || ""}
                        onChange={(e) => updatePlan(idx, "description", e.target.value)}
                        placeholder="What makes this plan special? Who is it for?"
                      />
                    </div>

                    {/* Features / What's Included */}
                    <div className="space-y-2">
                      <Label>What's Included</Label>
                      <div className="space-y-2">
                        {(plan.features || []).map((feature: string, featIdx: number) => (
                          <div key={featIdx} className="flex gap-2 items-center">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(idx, featIdx, e.target.value)}
                              placeholder="e.g. High-speed WiFi"
                              className="flex-1"
                            />
                            {(plan.features || []).length > 1 && (
                              <button
                                onClick={() => removeFeature(idx, featIdx)}
                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addFeature(idx)}
                          className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add feature
                        </button>
                      </div>
                    </div>

                    {formData.plans.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-3 -right-3 rounded-full h-8 w-8"
                        onClick={() => removePlan(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed py-8 rounded-2xl"
                  onClick={addPlan}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Plan
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Opening Hours</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Set your weekly schedule — when is your space open?
                </p>
              </div>
              <div className="space-y-4 mt-8">
                {formData.locations.map((loc: any, locIdx: number) => (
                  <div
                    key={locIdx}
                    className="border border-border/60 rounded-2xl overflow-hidden bg-secondary/10"
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      onClick={() => setExpandedHoursLoc(expandedHoursLoc === locIdx ? -1 : locIdx)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-bold text-lg">
                          {loc.name || `Location ${locIdx + 1}`}
                        </span>
                      </div>
                      {expandedHoursLoc === locIdx ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {expandedHoursLoc === locIdx && (
                      <div className="p-4 space-y-3 bg-background/50 border-t border-border/60">
                        {(
                          [
                            ["monday", "Monday"],
                            ["tuesday", "Tuesday"],
                            ["wednesday", "Wednesday"],
                            ["thursday", "Thursday"],
                            ["friday", "Friday"],
                            ["saturday", "Saturday"],
                            ["sunday", "Sunday"],
                          ] as [string, string][]
                        ).map(([day, label]) => {
                          const h = loc.opening_hours[day];
                          return (
                            <div
                              key={day}
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors",
                                h.closed
                                  ? "bg-secondary/10 border-border/40 opacity-60"
                                  : "bg-secondary/20 border-border/60",
                              )}
                            >
                              <div className="w-28 font-semibold text-sm shrink-0">{label}</div>

                              <div className="flex items-center gap-4 shrink-0">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={h.closed}
                                    onChange={(e) => {
                                      updateLocationHours(locIdx, day, "closed", e.target.checked);
                                      if (e.target.checked)
                                        updateLocationHours(locIdx, day, "is24Hours", false);
                                    }}
                                    className="w-4 h-4 rounded accent-primary"
                                  />
                                  <span className="text-sm text-muted-foreground">Closed</span>
                                </label>

                                {!h.closed && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={h.is24Hours}
                                      onChange={(e) =>
                                        updateLocationHours(
                                          locIdx,
                                          day,
                                          "is24Hours",
                                          e.target.checked,
                                        )
                                      }
                                      className="w-4 h-4 rounded accent-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">24 Hours</span>
                                  </label>
                                )}
                              </div>

                              {!h.closed && !h.is24Hours && (
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Input
                                      type="time"
                                      value={h.open}
                                      onChange={(e) =>
                                        updateLocationHours(locIdx, day, "open", e.target.value)
                                      }
                                      className="h-10 rounded-xl flex-1"
                                    />
                                  </div>
                                  <span className="text-muted-foreground text-sm">to</span>
                                  <Input
                                    type="time"
                                    value={h.close}
                                    onChange={(e) =>
                                      updateLocationHours(locIdx, day, "close", e.target.value)
                                    }
                                    className="h-10 rounded-xl flex-1"
                                  />
                                </div>
                              )}

                              {!h.closed && h.is24Hours && (
                                <div className="flex items-center gap-3 flex-1 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-xl justify-center">
                                  Open All Day
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Review Your Space</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Everything looks good? Hit Complete Setup to publish.
                </p>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Space Type
                </h3>
                <div className="px-4 py-3 bg-secondary/20 rounded-2xl border border-border/60 text-sm">
                  {formData.type || "—"}
                </div>
              </div>

              {/* Cover + Details */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" /> Details
                </h3>
                <div className="bg-secondary/20 rounded-2xl border border-border/60 overflow-hidden">
                  {formData.cover_url && (
                    <img
                      src={formData.cover_url}
                      alt="Cover"
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-1">
                    <p className="font-bold text-lg">{formData.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" /> Contact & Socials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formData.socials.phone && (
                    <div className="px-4 py-3 bg-secondary/20 rounded-2xl border border-border/60 text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formData.socials.phone}
                    </div>
                  )}
                  {formData.socials.whatsapp && (
                    <div className="px-4 py-3 bg-secondary/20 rounded-2xl border border-border/60 text-sm flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {formData.socials.whatsapp}
                    </div>
                  )}
                  {formData.socials.instagram && (
                    <div className="px-4 py-3 bg-secondary/20 rounded-2xl border border-border/60 text-sm flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      {formData.socials.instagram}
                    </div>
                  )}
                </div>
              </div>

              {/* Locations & Opening Hours */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Locations & Hours
                </h3>
                <div className="space-y-4">
                  {formData.locations.map((loc: any, i: number) => (
                    <div
                      key={i}
                      className="bg-secondary/20 rounded-2xl border border-border/60 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-border/60 bg-secondary/30">
                        <p className="font-semibold text-lg">{loc.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {loc.address}, {loc.city}
                        </p>
                      </div>
                      <div className="p-5">
                        <p className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> Operating Hours
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(loc.opening_hours).map(([day, h]: any) => (
                            <div
                              key={day}
                              className="flex justify-between items-center px-4 py-2 bg-background rounded-lg border border-border/40 text-sm"
                            >
                              <span className="font-medium capitalize">{day}</span>
                              <span
                                className={
                                  h.closed ? "text-muted-foreground" : "text-foreground font-medium"
                                }
                              >
                                {h.closed
                                  ? "Closed"
                                  : h.is24Hours
                                    ? "Open 24 Hours"
                                    : `${h.open} – ${h.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Save className="h-5 w-5 text-primary" /> Plans ({formData.plans.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.plans.map((plan: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-secondary/20 rounded-2xl border border-border/60"
                    >
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-primary font-semibold text-sm">
                        {plan.price} {activeWorkspace?.currency}
                        {plan.billing_cycle &&
                          plan.billing_cycle !== "One-time" &&
                          ` / ${plan.billing_cycle}`}
                      </p>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                      )}
                      <ul className="mt-2 space-y-0.5">
                        {(plan.features || []).filter(Boolean).map((f: string, fi: number) => (
                          <li
                            key={fi}
                            className="text-xs text-muted-foreground flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-12 flex justify-between items-center pt-6 border-t border-border/60">
            <div>
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={step === 0}
                className="gap-2 rounded-xl px-6"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
            <div>
              {step < 5 ? (
                <Button
                  onClick={nextStep}
                  className="gap-2 rounded-xl shadow-[var(--shadow-glow)] px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleCreateSpace()}
                  disabled={isPending}
                  className="gap-2 rounded-xl shadow-[var(--shadow-glow)] px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
