import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createCinema } from "@/api/cinemas";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ImageIcon,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/create")({
  component: CreateCinemaPage,
});

const STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "location", label: "Location" },
  { id: "contact", label: "Contact" },
  { id: "media", label: "Media & Status" },
];

const EMPTY = {
  name: "",
  description: "",
  city: "",
  address: "",
  country: "Rwanda",
  phone: "",
  email: "",
  website: "",
  cover_url: "",
  logo_url: "",
  status: "active",
};

function CreateCinemaPage() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) => setForm((p: any) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Cinema name is required");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const result = await createCinema({
        data: { ...form, workspace_id: activeWorkspace?.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success(`🎬 ${form.name} created!`);
      navigate({
        to: "/dashboard/$workspaceSlug/Cinema/$cinemaId/overview",
        params: { workspaceSlug, cinemaId: result.id },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to create cinema");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Back */}
        <button
          onClick={() =>
            navigate({ to: "/dashboard/$workspaceSlug/Cinema", params: { workspaceSlug } })
          }
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Cinemas</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Cinema / Theater</h1>
            <p className="text-muted-foreground mt-0.5">
              Set up your venue — you can add screens and movies after creation.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => setStep(i)} className="flex flex-col items-center gap-1 group">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < step
                      ? "bg-primary border-primary text-primary-foreground"
                      : i === step
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border/60 text-muted-foreground bg-secondary/40"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i === step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                    i < step ? "bg-primary" : "bg-border/50"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border/60 rounded-3xl p-7 shadow-sm">
          {/* ── Step 0: Basic Info ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Give your cinema a name and description.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Cinema / Theater Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  autoFocus
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Century Cinema Kigali"
                  className="rounded-xl h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe what makes this cinema special — screens, experience, location..."
                  className="rounded-xl min-h-[120px] resize-none text-base"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "active", label: "Active", desc: "Open & showing" },
                    { value: "coming_soon", label: "Coming Soon", desc: "Opening soon" },
                    { value: "inactive", label: "Inactive", desc: "Temporarily closed" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("status", opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.status === opt.value
                          ? "bg-primary/10 border-primary/50 text-primary"
                          : "bg-secondary/30 border-border/50 hover:bg-secondary/60"
                      }`}
                    >
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Location ───────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Location</h2>
                <p className="text-sm text-muted-foreground">Where is this cinema located?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> City
                  </Label>
                  <Input
                    autoFocus
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Kigali"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    placeholder="Rwanda"
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Address</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="KG 123 St, Kimironko, Kigali, Rwanda"
                  className="rounded-xl min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Contact ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Contact Details</h2>
                <p className="text-sm text-muted-foreground">
                  How can customers reach this cinema?
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </Label>
                <Input
                  autoFocus
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="info@cinema.com"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Website
                </Label>
                <Input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://www.cinema.com"
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Media ──────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Media</h2>
                <p className="text-sm text-muted-foreground">
                  Add a cover image and logo for this cinema.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Cover Image URL
                </Label>
                <Input
                  autoFocus
                  value={form.cover_url}
                  onChange={(e) => set("cover_url", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-xl h-11"
                />
                {form.cover_url && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-border/60 aspect-video bg-secondary">
                    <img
                      src={form.cover_url}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Logo URL
                </Label>
                <Input
                  value={form.logo_url}
                  onChange={(e) => set("logo_url", e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-11"
                />
              </div>

              {/* Summary before submit */}
              <div className="bg-secondary/40 rounded-2xl p-4 border border-border/50 space-y-2 text-sm mt-2">
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Summary
                </p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium truncate">{form.name || "—"}</span>
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">
                    {[form.city, form.country].filter(Boolean).join(", ") || "—"}
                  </span>
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{form.status}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium truncate">{form.email || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}

          <div className="flex-1" />

          {step < STEPS.length - 1 ? (
            <Button
              className="rounded-xl h-12 px-8 font-semibold"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !form.name.trim()}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="rounded-xl h-12 px-8 font-bold gap-2 shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Creating..." : "Create Cinema"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
