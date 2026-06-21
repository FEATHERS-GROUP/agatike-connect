import { createFileRoute, useNavigate, useParams, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  MapPin,
  Loader2,
  CheckCircle2,
  UploadCloud,
  Plus,
  Trash2,
  X,
  Building2,
  Warehouse,
  Presentation,
  Flower2,
  Trees,
  Landmark,
  Dumbbell,
  Music,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createRentableVenue } from "@/api/rentable_venues";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { COUNTRIES } from "@/lib/countries";
import { getCoordinates, getPlacesAutocomplete } from "@/api/geocoding";
import { Switch } from "@/components/ui/switch";
import { lazy, Suspense, useState as _useState, useEffect as _useEffect } from "react";

function ClientOnly({ children, fallback }: { children: any; fallback?: any }) {
  const [mounted, setMounted] = _useState(false);
  _useEffect(() => setMounted(true), []);
  return mounted ? children : fallback || null;
}

const ReactQuill = lazy(() => import("react-quill-new"));
import "react-quill-new/dist/quill.snow.css";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/create-venue")({
  validateSearch: z.object({
    step: z.number().catch(0),
  }),
  component: NewVenueWizard,
});

const VENUE_TYPES = [
  {
    id: "Stadium & Arena",
    title: "Stadium & Arena",
    description: "Large venue with tiered seating for major events, sports, and concerts.",
    icon: "Building2",
  },
  {
    id: "Conference Room",
    title: "Conference Room",
    description: "Professional enclosed space designed for meetings and presentations.",
    icon: "Presentation",
  },
  {
    id: "Wedding Garden",
    title: "Wedding Garden",
    description: "Beautiful outdoor landscaped space perfect for wedding ceremonies.",
    icon: "Flower2",
  },
  {
    id: "Park",
    title: "Park",
    description: "Open green public space for outdoor activities and large gatherings.",
    icon: "Trees",
  },
  {
    id: "Museum",
    title: "Museum",
    description: "Cultural or historical institution offering private event spaces or tours.",
    icon: "Landmark",
  },
  {
    id: "Sports Court & Playground",
    title: "Sports Court & Playground",
    description:
      "Indoor or outdoor area designed for sports events, tournaments, or children's activities.",
    icon: "Dumbbell",
  },
  {
    id: "Nightclub / Lounge",
    title: "Nightclub / Lounge",
    description:
      "Entertainment venue operating late into the night with music, dancing, and drinks.",
    icon: "Music",
  },
  {
    id: "Gaming Center",
    title: "Gaming Center",
    description: "Recreational space featuring video games, esports setups, or arcade machines.",
    icon: "Gamepad2",
  },
  {
    id: "Other",
    title: "Other",
    description: "Any other type of venue that doesn't fit the categories above.",
    icon: "MapPin",
  },
];

const AMENITIES_LIST = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Heating",
  "Wheelchair Accessible",
  "Kitchen",
  "Bar",
  "Sound System",
  "Lighting System",
  "Projector",
  "Restrooms",
  "Security",
  "Catering",
  "Changing Rooms",
  "Lounge Area",
  "Stage",
  "Whiteboard",
  "TV Screens",
  "Microphones",
  "High-Speed Internet",
  "Elevator",
  "Outdoor Area",
  "Smoking Area",
  "VIP Section",
  "DJ Booth",
  "Dance Floor",
  "First Aid Kit",
  "Cloakroom",
  "Pool",
  "Gym",
];

function NewVenueWizard() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const { step } = useSearch({ strict: false }) as { step: number };
  const { activeWorkspace } = useWorkspace();

  const [isUploading, setIsUploading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const DRAFT_KEY = `venue_draft_${workspaceSlug}`;

  const DEFAULT_FORM_DATA = {
    name: "",
    type: "",
    rental_model: "",
    city: "",
    country: "RW",
    address: "",
    is_venue_private: false,
    is_24_hours: false,
    capacity: "",
    description: "",
    rental_type: "Per Day",
    pricing_tiers: [{ name: "", amount: "" }],
    opening_hours: "09:00",
    closing_hours: "18:00",
    instructions: "",
    amenities: [] as string[],
    sections: [] as { name: string; image_url: string }[],
    images: [] as string[],
  };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).formData;
        return {
          ...DEFAULT_FORM_DATA,
          ...parsed,
          pricing_tiers: parsed.pricing_tiers || DEFAULT_FORM_DATA.pricing_tiers,
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
  }, [workspaceSlug]); // Run once on mount

  useEffect(() => {
    if (!formData.address || !showAddressSuggestions) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const results = await getPlacesAutocomplete({ data: formData.address });
        setAddressSuggestions(results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.address, showAddressSuggestions]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, formData }));
  }, [step, formData, DRAFT_KEY]);

  const { mutate: createVenue, isPending } = useMutation({
    mutationFn: async () => {
      const workspace_id = activeWorkspace?.id;
      if (!workspace_id) throw new Error("No active workspace found");

      // Fetch Geocoding
      const addressString = `${formData.address}, ${formData.city}, ${COUNTRIES.find((c) => c.code === formData.country)?.name || formData.country}`;
      const coords = await getCoordinates({ data: addressString });
      const latitude = coords?.lat ? parseFloat(coords.lat) : null;
      const longitude = coords?.lng ? parseFloat(coords.lng) : null;

      return createRentableVenue({
        data: {
          workspace_id,
          name: formData.name,
          type: formData.type,
          rental_model: formData.rental_model,
          city: formData.city,
          country: formData.country,
          address: formData.address,
          latitude,
          longitude,
          is_venue_private: formData.is_venue_private,
          capacity: Number(formData.capacity) || 0,
          description: formData.description,
          rental_type: formData.rental_type,
          pricing_tiers: formData.pricing_tiers,
          currency: activeWorkspace?.currency || "RWF",
          opening_hours:
            formData.rental_model === "ENTRANCE_ONLY" || formData.rental_model === "HYBRID"
              ? formData.opening_hours
              : null,
          closing_hours:
            formData.rental_model === "ENTRANCE_ONLY" || formData.rental_model === "HYBRID"
              ? formData.closing_hours
              : null,
          instructions: formData.instructions,
          amenities: formData.amenities,
          sections: formData.sections,
          images: formData.images,
          cover_url: formData.images[0] || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Venue created successfully");
      localStorage.removeItem(DRAFT_KEY);
      navigate({ to: `/dashboard/${workspaceSlug}/venue-rent` });
    },
    onError: (error) => {
      toast.error("Failed to create venue");
      console.error(error);
    },
  });

  const setStep = (newStep: number) => {
    navigate({ search: { step: newStep } as any, replace: true });
  };

  const nextStep = () => {
    if (step === 0 && !formData.type) return toast.error("Please select a venue type");
    if (step === 1 && !formData.rental_model) return toast.error("Please select a usage category");
    if (step === 2 && (!formData.name || !formData.city || !formData.address))
      return toast.error("Name, City, and Address are required");

    if (step === 4) {
      if (!formData.pricing_tiers.length) return toast.error("Add at least one pricing option");
      for (const t of formData.pricing_tiers) {
        if (!t.name || !t.amount)
          return toast.error("All pricing options must have a name and amount");
      }
    }

    // Skip Step 3 (Hours) if ENTIRE_VENUE
    if (step === 2 && formData.rental_model === "ENTIRE_VENUE") {
      setStep(4);
      return;
    }
    setStep(Math.min(step + 1, 7));
  };

  const prevStep = () => {
    if (step === 4 && formData.rental_model === "ENTIRE_VENUE") {
      setStep(2);
      return;
    }
    setStep(Math.max(step - 1, 0));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        continue;
      }
      try {
        const url = await uploadFileToStorage(file, "venues");
        newUrls.push(url);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFormData((p) => ({ ...p, images: [...p.images, ...newUrls].slice(0, 3) }));
    setIsUploading(false);
  };

  const handleSectionImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, "venues");
      updateSection(idx, "image_url", url);
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((p) => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter((a) => a !== amenity)
        : [...p.amenities, amenity],
    }));
  };

  const addSection = () => {
    setFormData((p) => ({ ...p, sections: [...p.sections, { name: "", image_url: "" }] }));
  };

  const updateSection = (idx: number, field: string, val: string) => {
    setFormData((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    }));
  };

  const removeSection = (idx: number) => {
    setFormData((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }));
  };

  const addPricingTier = () => {
    setFormData((p) => ({ ...p, pricing_tiers: [...p.pricing_tiers, { name: "", amount: "" }] }));
  };

  const updatePricingTier = (idx: number, field: string, val: string) => {
    setFormData((p) => ({
      ...p,
      pricing_tiers: p.pricing_tiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t)),
    }));
  };

  const removePricingTier = (idx: number) => {
    setFormData((p) => ({ ...p, pricing_tiers: p.pricing_tiers.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="flex w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto pb-24 p-4 lg:p-10">
        <div className="max-w-5xl w-full mx-auto">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">What kind of venue are you listing?</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Select the type that best describes your property.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {VENUE_TYPES.map((vt) => {
                  const iconsMap: Record<string, any> = {
                    Building2,
                    Warehouse,
                    Presentation,
                    Flower2,
                    Trees,
                    Landmark,
                    Dumbbell,
                    Music,
                    Gamepad2,
                    MapPin,
                  };
                  const Icon = iconsMap[vt.icon];

                  return (
                    <button
                      key={vt.id}
                      onClick={() => setFormData((p) => ({ ...p, type: vt.id }))}
                      className={cn(
                        "flex items-start text-left gap-4 p-6 rounded-2xl border-2 transition-all hover:border-orange-500/50 cursor-pointer",
                        formData.type === vt.id
                          ? "border-orange-500 bg-orange-500/5 shadow-sm"
                          : "border-border/60 bg-secondary/20",
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl shrink-0 transition-colors",
                          formData.type === vt.id
                            ? "bg-orange-500 text-white"
                            : "bg-orange-500/10 text-orange-500",
                        )}
                      >
                        {Icon && <Icon className="h-7 w-7" />}
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{vt.title}</span>
                        <span className="text-muted-foreground text-sm mt-1 block leading-snug">
                          {vt.description}
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
                <h2 className="text-3xl font-bold">How do users book your venue?</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Do they rent the entire space or just buy individual entrance tickets?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <button
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      rental_model: "ENTIRE_VENUE",
                      rental_type: "Per Day",
                    }))
                  }
                  className={cn(
                    "flex flex-col text-left p-6 rounded-2xl border-2 transition-all hover:border-primary/50 cursor-pointer",
                    formData.rental_model === "ENTIRE_VENUE"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-secondary/20",
                  )}
                >
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Entire Venue Rental</h3>
                  <p className="text-muted-foreground mt-2">
                    Users rent the entire space for their private events, weddings, or parties.
                  </p>
                </button>

                <button
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      rental_model: "ENTRANCE_ONLY",
                      rental_type: "Entrance Fee",
                    }))
                  }
                  className={cn(
                    "flex flex-col text-left p-6 rounded-2xl border-2 transition-all hover:border-primary/50 cursor-pointer",
                    formData.rental_model === "ENTRANCE_ONLY"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-secondary/20",
                  )}
                >
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Entrance Tickets Only</h3>
                  <p className="text-muted-foreground mt-2">
                    Users buy tickets to enter your venue (e.g. Museum, Park, Public Pool).
                  </p>
                </button>

                <button
                  onClick={() =>
                    setFormData((p) => ({ ...p, rental_model: "HYBRID", rental_type: "Multiple" }))
                  }
                  className={cn(
                    "flex flex-col text-left p-6 rounded-2xl border-2 transition-all hover:border-primary/50 sm:col-span-2 cursor-pointer",
                    formData.rental_model === "HYBRID"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-secondary/20",
                  )}
                >
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Hybrid</h3>
                  <p className="text-muted-foreground mt-2">
                    Both available. Users can rent it entirely OR buy entrance tickets.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Tell us about your venue</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  The basics of what you're listing.
                </p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label className="text-base">
                    Venue Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="h-12 text-lg rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Grand Kigali Arena"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base"
                      value={formData.country}
                      onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
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
                      City / Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-12 text-lg rounded-xl"
                      value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Kigali"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <Label className="text-base">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-12 text-lg rounded-xl"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, address: e.target.value }));
                        setShowAddressSuggestions(true);
                      }}
                      onFocus={() => {
                        if (formData.address) setShowAddressSuggestions(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowAddressSuggestions(false), 200);
                      }}
                      placeholder="e.g. KG 11 Ave"
                    />

                    {/* Autocomplete Dropdown */}
                    {showAddressSuggestions &&
                      (addressSuggestions.length > 0 || isSearchingAddress) && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-xl shadow-lg overflow-hidden flex flex-col top-full">
                          {isSearchingAddress && addressSuggestions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-y-auto">
                              {addressSuggestions.map((s) => (
                                <button
                                  key={s.place_id}
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-secondary/50 border-b last:border-0 transition-colors truncate"
                                  onClick={() => {
                                    setFormData((p) => ({ ...p, address: s.description }));
                                    setShowAddressSuggestions(false);
                                  }}
                                >
                                  {s.description}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Maximum Capacity</Label>
                    <Input
                      type="number"
                      className="h-12 text-lg rounded-xl"
                      value={formData.capacity}
                      onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary/30 border border-border/60 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-lg">Private Venue Listing</Label>
                    <p className="text-sm text-muted-foreground">
                      If enabled, the venue will not be shown publicly and can only be accessed via
                      direct link.
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_venue_private}
                    onCheckedChange={(v) => setFormData((p) => ({ ...p, is_venue_private: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <Textarea
                    className="min-h-[140px] rounded-xl resize-none text-base p-4"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the vibe, layout, and what makes your venue special..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Operating Hours</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  When is the venue open for public entrance?
                </p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between p-6 bg-secondary/30 border border-border/60 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-lg">Open 24 Hours</Label>
                    <p className="text-sm text-muted-foreground">The venue is always open.</p>
                  </div>
                  <Switch
                    checked={formData.is_24_hours}
                    onCheckedChange={(v) => {
                      setFormData((p) => ({
                        ...p,
                        is_24_hours: v,
                        ...(v
                          ? { opening_hours: "00:00", closing_hours: "23:59" }
                          : { opening_hours: "09:00", closing_hours: "18:00" }),
                      }));
                    }}
                  />
                </div>

                {!formData.is_24_hours && (
                  <>
                    <div className="flex items-center justify-between p-6 bg-secondary/30 border border-border/60 rounded-2xl">
                      <div className="space-y-1">
                        <Label className="text-lg">Opening Hour</Label>
                        <p className="text-sm text-muted-foreground">When doors open</p>
                      </div>
                      <Input
                        type="time"
                        className="w-40 h-12 text-lg"
                        value={formData.opening_hours}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, opening_hours: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-secondary/30 border border-border/60 rounded-2xl">
                      <div className="space-y-1">
                        <Label className="text-lg">Closing Hour</Label>
                        <p className="text-sm text-muted-foreground">When doors close</p>
                      </div>
                      <Input
                        type="time"
                        className="w-40 h-12 text-lg"
                        value={formData.closing_hours}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, closing_hours: e.target.value }))
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Set your pricing</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Decide how you charge for this venue. Add multiple options if needed (e.g.
                  Students, Adults).
                </p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Workspace Currency</Label>
                    <div className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 flex items-center text-base text-muted-foreground cursor-not-allowed">
                      {activeWorkspace?.currency || "RWF"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Pricing Preference</Label>
                    <select
                      className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base"
                      value={formData.rental_type}
                      onChange={(e) => setFormData((p) => ({ ...p, rental_type: e.target.value }))}
                    >
                      {formData.rental_model === "ENTIRE_VENUE" && (
                        <>
                          <option value="Per Day">Per Day</option>
                          <option value="Per Hour">Per Hour</option>
                          <option value="Per Week">Per Week</option>
                          <option value="Annually">Annually</option>
                        </>
                      )}
                      {formData.rental_model === "ENTRANCE_ONLY" && (
                        <option value="Entrance Fee">Entrance Fee</option>
                      )}
                      {formData.rental_model === "HYBRID" && (
                        <option value="Multiple">Multiple Options</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Pricing Options</Label>
                  <div className="space-y-4">
                    {formData.pricing_tiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-start p-6 bg-secondary/20 rounded-2xl border border-border/60 relative"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-base">Option Name</Label>
                            <Input
                              className="h-12 bg-background rounded-xl"
                              value={tier.name}
                              onChange={(e) => updatePricingTier(idx, "name", e.target.value)}
                              placeholder={
                                formData.rental_model === "ENTIRE_VENUE"
                                  ? "e.g. Full Day Rental"
                                  : "e.g. Student Entrance"
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-base">
                              Amount ({activeWorkspace?.currency || "RWF"})
                            </Label>
                            <Input
                              type="number"
                              className="h-12 bg-background rounded-xl"
                              value={tier.amount}
                              onChange={(e) => updatePricingTier(idx, "amount", e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        {formData.pricing_tiers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 absolute top-4 right-4"
                            onClick={() => removePricingTier(idx)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full h-14 border-dashed rounded-xl"
                      onClick={addPricingTier}
                    >
                      <Plus className="h-5 w-5 mr-2" /> Add Pricing Option
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Amenities & Rules</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  What's included and what are the rules?
                </p>
              </div>

              <div className="space-y-4 mt-8">
                <Label className="text-lg">Included Amenities</Label>
                <div className="flex flex-wrap gap-3">
                  {AMENITIES_LIST.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        "px-5 py-2.5 rounded-full border text-sm font-medium transition-all",
                        formData.amenities.includes(amenity)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/30 border-border/60 hover:border-primary/50",
                      )}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-lg">Instructions / Rules</Label>
                <div className="bg-background rounded-xl overflow-hidden border border-input">
                  <ClientOnly
                    fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl" />}
                  >
                    <Suspense
                      fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl" />}
                    >
                      <ReactQuill
                        theme="snow"
                        value={formData.instructions}
                        onChange={(val) => setFormData((p) => ({ ...p, instructions: val }))}
                        className="h-48 [&_.ql-editor]:text-base [&_.ql-container]:border-0 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b"
                        placeholder="e.g. No loud music after 10PM. Please ensure the kitchen is cleaned before leaving."
                      />
                    </Suspense>
                  </ClientOnly>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Venue Sections (Optional)</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  List specific spaces within your venue (e.g., Main Hall, Private Room).
                </p>
              </div>

              <div className="space-y-6 mt-8">
                {formData.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-start p-6 bg-secondary/20 rounded-2xl border border-border/60 relative"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base">Section Name</Label>
                        <Input
                          className="h-12 bg-background rounded-xl"
                          value={section.name}
                          onChange={(e) => updateSection(idx, "name", e.target.value)}
                          placeholder="e.g. VIP Lounge"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">Image (Optional)</Label>
                        {section.image_url ? (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden border">
                            <img
                              src={section.image_url}
                              alt={section.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => updateSection(idx, "image_url", "")}
                              className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-12 bg-background rounded-xl border border-dashed relative hover:bg-secondary/30 transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionImageUpload(idx, e)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={isUploading}
                            />
                            <div className="flex items-center text-muted-foreground text-sm">
                              {isUploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <UploadCloud className="h-4 w-4 mr-2" />
                              )}
                              Upload Image
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 absolute top-4 right-4"
                      onClick={() => removeSection(idx)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full h-14 border-dashed rounded-xl"
                  onClick={addSection}
                >
                  <Plus className="h-5 w-5 mr-2" /> Add Section
                </Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Add some photos</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Showcase your venue. You can upload up to 3 images (Max 5MB each).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {formData.images.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] rounded-2xl bg-secondary/50 border overflow-hidden relative group"
                  >
                    <img src={url} alt={`Venue ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {formData.images.length < 3 && (
                  <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border/60 hover:bg-secondary/30 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 mb-3 text-muted-foreground" />
                          <span className="text-sm font-medium">Click to upload</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-12 flex justify-between items-center pt-6 border-t border-border/60">
            <div>
              {step > 0 && (
                <Button variant="outline" size="lg" className="rounded-xl px-8" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
            </div>
            <div>
              {step < 7 ? (
                <Button
                  size="lg"
                  className="rounded-xl px-10 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={nextStep}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="rounded-xl px-10 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => createVenue()}
                  disabled={isPending || isUploading}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Publish Venue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
