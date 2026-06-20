import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createCinemaTicketTier } from "@/api/cinema_ticket_tiers";
import {
  ArrowLeft,
  ArrowRight,
  Ticket,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
  DollarSign,
  Star,
  Glasses,
  Baby,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/create-ticket-tier")({
  component: CreateTicketTierWizard,
});

const TIER_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "3d", label: "3D" },
  { value: "imax", label: "IMAX" },
  { value: "4dx", label: "4DX" },
  { value: "premium", label: "Premium" },
  { value: "kids", label: "Kids" },
  { value: "family", label: "Family Pack" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "standard",
  price: 0,
  currency: "RWF",
  includes_glasses: false,
  is_kids: false,
  is_vip: false,
  is_3d: false,
  is_imax: false,
};

function CreateTicketTierWizard() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await createCinemaTicketTier({ data: { ...form, currency: activeWorkspace?.currency || "RWF", workspace_id: activeWorkspace?.id } });
      toast.success("Ticket tier created!");
      await queryClient.invalidateQueries({ queryKey: ["cinema_ticket_tiers"] });
      navigate({ to: "/dashboard/$workspaceSlug/Cinema/ticket-tiers", params: { workspaceSlug } });
    } catch (err: any) {
      toast.error(err.message || "Failed to create ticket tier");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: "Basic Details", desc: "Name & Type" },
    { label: "Pricing", desc: "Cost & Currency" },
    { label: "Features", desc: "Perks & Restrictions" },
    { label: "Review", desc: "Confirm & Save" },
  ];

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Left Sidebar - Sticky Progress */}
      <div className="hidden lg:flex w-80 flex-col border-r border-border/60 bg-secondary/10 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full shrink-0">
        <button
          onClick={() => navigate({ to: "/dashboard/$workspaceSlug/Cinema/ticket-tiers", params: { workspaceSlug } })}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Ticket Tiers</span>
        </button>

        <h3 className="font-bold text-lg mb-6">Create Ticket Tier</h3>
        <div className="space-y-5 flex-1">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== steps.length - 1 && (
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
                <p className={cn("font-semibold text-sm", step === i ? "text-primary" : "")}>{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 p-4 lg:p-10 relative">
        <div className="max-w-5xl w-full mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate({ to: "/dashboard/$workspaceSlug/Cinema/ticket-tiers", params: { workspaceSlug } })}
              className="p-2 rounded-full bg-secondary text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-medium text-primary mb-1">
                Step {step + 1} of {steps.length}
              </p>
              <h1 className="text-xl font-bold">{steps[step].label}</h1>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {/* ── STEP 0: Basic Details ──────────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Ticket className="h-6 w-6 text-primary" />
                    Basic Details
                  </h2>
                  <p className="text-muted-foreground">Give your ticket tier a name and choose its core type.</p>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Tier Name <span className="text-destructive">*</span></Label>
                    <Input autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. VIP Front Row" className="rounded-xl h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe what this ticket includes..." className="rounded-xl min-h-[120px] resize-none" />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>Base Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {TIER_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => set("type", t.value)}
                          className={cn(
                            "py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all",
                            form.type === t.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/50 text-muted-foreground"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Pricing ───────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Pricing
                  </h2>
                  <p className="text-muted-foreground">Set the default global price for this ticket tier.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Price <span className="text-destructive">*</span></Label>
                    <Input type="number" value={form.price} onChange={(e) => set("price", parseInt(e.target.value) || 0)} className="rounded-xl h-12 text-lg font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <div className="flex h-12 w-full items-center rounded-xl border border-input bg-secondary/30 px-4 text-sm font-semibold text-muted-foreground">
                      {activeWorkspace?.currency || "RWF"}
                      <span className="ml-2 text-xs font-normal opacity-70">(Workspace Default)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Features & Rules ───────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    Features & Perks
                  </h2>
                  <p className="text-muted-foreground">Select the special attributes and perks associated with this ticket.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                  {[
                    { key: "includes_glasses", label: "Includes 3D Glasses", icon: <Glasses className="h-5 w-5" /> },
                    { key: "is_kids", label: "Kids Ticket", icon: <Baby className="h-5 w-5" /> },
                    { key: "is_vip", label: "VIP Ticket", icon: <Star className="h-5 w-5" /> },
                    { key: "is_3d", label: "3D Ready", icon: <Box className="h-5 w-5" /> },
                    { key: "is_imax", label: "IMAX Ready", icon: <Layers className="h-5 w-5" /> },
                  ].map((feat) => (
                    <label key={feat.key} className="flex items-center gap-4 cursor-pointer p-5 border border-border/60 rounded-2xl hover:bg-secondary/50 transition-colors">
                      <input type="checkbox" checked={form[feat.key]} onChange={(e) => set(feat.key, e.target.checked)} className="rounded border-border text-primary focus:ring-primary h-5 w-5" />
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">{feat.icon}</div>
                        <span className="font-bold">{feat.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ─────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    Review & Save
                  </h2>
                  <p className="text-muted-foreground">Verify the ticket tier details before adding it to your catalog.</p>
                </div>

                <div className="p-6 rounded-3xl bg-secondary/30 border border-border/40 max-w-2xl">
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-border/50">
                    <div>
                      <h3 className="text-2xl font-black">{form.name || "Unnamed Tier"}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{form.description || "No description provided."}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground uppercase">{form.type}</p>
                      <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(form.price, activeWorkspace?.currency || "RWF")}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-3">Included Perks & Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {form.includes_glasses && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center gap-2"><Glasses className="h-4 w-4" /> Glasses</span>}
                      {form.is_kids && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center gap-2"><Baby className="h-4 w-4" /> Kids</span>}
                      {form.is_vip && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center gap-2"><Star className="h-4 w-4" /> VIP</span>}
                      {form.is_3d && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center gap-2"><Box className="h-4 w-4" /> 3D</span>}
                      {form.is_imax && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center gap-2"><Layers className="h-4 w-4" /> IMAX</span>}
                      
                      {!form.includes_glasses && !form.is_kids && !form.is_vip && !form.is_3d && !form.is_imax && (
                        <span className="text-sm text-muted-foreground">Standard admission ticket</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Fixed */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-4 bg-background/80 backdrop-blur-md border-t border-border/60 z-10">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                className="rounded-xl h-11 px-6"
                onClick={() => {
                  if (step === 0) {
                    navigate({ to: "/dashboard/$workspaceSlug/Cinema/ticket-tiers", params: { workspaceSlug } });
                  } else {
                    setStep(step - 1);
                  }
                }}
              >
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              <div className="flex gap-3">
                {step < steps.length - 1 ? (
                  <Button
                    className="rounded-xl h-11 px-8 gap-2"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 && !form.name.trim()}
                  >
                    Next Step <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl h-11 px-10 gap-2 font-bold shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving..." : "Create Tier"}
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
