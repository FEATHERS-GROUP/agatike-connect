import { createFileRoute, useNavigate, useParams, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  const { step } = useSearch({ from: "/dashboard/$workspaceSlug/spaces/create-space" }) as { step: number };
  const { activeWorkspace } = useWorkspace();

  const DRAFT_KEY = `space_draft_${workspaceSlug}`;

  const DEFAULT_FORM_DATA = {
    name: "",
    type: "",
    description: "",
    city: "",
    country: "RW",
    address: "",
    plans: [{ name: "Day Pass", price: "", features: ["Access to space"] }],
    cover_url: "",
  };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).formData;
        return {
          ...DEFAULT_FORM_DATA,
          ...parsed,
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
          cover_url: formData.cover_url || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
          locations: [
            {
              id: "loc-1",
              name: "Main Location",
              city: formData.city,
              country: formData.country,
              address: formData.address,
            }
          ],
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
    if (step === 2 && (!formData.city || !formData.address))
      return toast.error("City and Address are required");

    setStep(Math.min(step + 1, 4));
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 0));
  };

  const addPlan = () => {
    setFormData((p) => ({ ...p, plans: [...p.plans, { name: "", price: "", features: [""] }] }));
  };

  const updatePlan = (idx: number, field: string, val: any) => {
    setFormData((p) => ({
      ...p,
      plans: p.plans.map((t, i) => (i === idx ? { ...t, [field]: val } : t)),
    }));
  };

  const removePlan = (idx: number) => {
    setFormData((p) => ({ ...p, plans: p.plans.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="flex w-full">
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto pb-24 p-4 lg:p-10">
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
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Primary Location</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Where is your main space located? (You can add more locations later)
                </p>
              </div>
              <div className="space-y-6 mt-8">
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
                      City / Area <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-12 text-lg rounded-xl"
                      value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Kigali"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="h-12 text-lg rounded-xl"
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. KG 11 Ave"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Membership Plans</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Set up the basic pricing plans for your space.
                </p>
              </div>
              <div className="space-y-6 mt-8">
                {formData.plans.map((plan, idx) => (
                  <div key={idx} className="p-6 bg-secondary/20 rounded-2xl border border-border/60 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <Button variant="outline" className="w-full border-dashed py-8 rounded-2xl" onClick={addPlan}>
                  <Plus className="mr-2 h-4 w-4" /> Add Another Plan
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-background/80 backdrop-blur-xl border-t border-border/60 p-4 px-6 flex justify-between items-center z-50">
        <Button variant="ghost" onClick={prevStep} disabled={step === 0} className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={nextStep}
            className="gap-2 rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => handleCreateSpace()}
            disabled={isPending}
            className="gap-2 rounded-xl shadow-[var(--shadow-glow)]"
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
  );
}
