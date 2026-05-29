import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, Film, Trophy, Mountain, Check, Plus, ArrowRight, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace, WorkspaceType } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";

export const Route = createFileRoute("/dashboard/workspaces")({
  head: () => ({
    meta: [
      { title: "Workspaces — Agatike Dashboard" },
      { name: "description", content: "Create and switch between your workspaces." },
    ],
  }),
  component: Workspaces,
});

const types: { id: WorkspaceType; title: string; desc: string; icon: any; defaultModules: string[] }[] = [
  {
    id: "EVENT",
    title: "Event Organizer",
    desc: "Host concerts, festivals, conferences or recurring events.",
    icon: Trophy,
    defaultModules: ["events", "tickets", "attendees", "scanner", "merchandise"],
  },
  {
    id: "VENUE",
    title: "Venue Owner",
    desc: "Rentable space hosting concerts, weddings, conferences.",
    icon: Building2,
    defaultModules: ["venue_listings", "venue_designer"],
  },
  {
    id: "CINEMA",
    title: "Movie Theater",
    desc: "Sell reserved seats, screenings and snack bundles.",
    icon: Film,
    defaultModules: ["events", "tickets", "scanner"],
  },
  {
    id: "EXPERIENCE",
    title: "Experience Host",
    desc: "Hikes, run clubs, surf camps, wellness retreats.",
    icon: Mountain,
    defaultModules: ["experiences", "attendees"],
  },
];

const EMOJI_OPTIONS = ["🏟️", "🎪", "🎭", "🎬", "⛰️", "🎉", "🎫", "🎸", "🎵", "🏆", "🌟", "🔥"];

function Workspaces() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { data: platformModules = [], isLoading: isLoadingModules } = usePlatformModules();

  const [isWizardOpen, setIsWizardOpen] = useState(workspaces.length === 0);
  const [step, setStep] = useState(1);

  // Form State
  const [type, setType] = useState<WorkspaceType>("EVENT");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("🏟️");
  const [modules, setModules] = useState<string[]>([]);
  const [created, setCreated] = useState(false);

  // When type or platformModules changes, pre-fill modules
  useEffect(() => {
    const selectedType = types.find(t => t.id === type);
    if (selectedType && platformModules.length > 0) {
      const base = ["dashboard", "analytics", "settings", "campaigns", "withdrawals"];
      const legacyIds = [...base, ...selectedType.defaultModules];
      
      const legacyIdToLabel: Record<string, string> = {
        dashboard: "Dashboard",
        events: "Events",
        tickets: "Tickets",
        attendees: "Attendees",
        scanner: "Scanning",
        merchandise: "Merchandise",
        vip: "VIP Access",
        campaigns: "Campaigns",
        venue_listings: "Venue Listings",
        venue_designer: "Venue Designer",
        experiences: "Experiences",
        analytics: "Analytics",
        withdrawals: "Withdrawals",
        settings: "Settings"
      };

      const uuids = legacyIds.map(legacyId => {
        const label = legacyIdToLabel[legacyId];
        return platformModules.find(m => m.label === label)?.id;
      }).filter(Boolean) as string[];

      setModules(uuids);
    }
  }, [type, platformModules]);

  const toggleModule = (id: string) => {
    if (modules.includes(id)) {
      setModules(modules.filter(m => m !== id));
    } else {
      setModules([...modules, id]);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const computedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    createWorkspace({ 
      name, type, city, address, email, phone, instagram, tiktok, youtube, icon, modules 
    });
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      setIsWizardOpen(false);
      navigate({ to: `/dashboard/${computedSlug}` });
    }, 1500);
  };

  if (!isWizardOpen) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Each venue, cinema or organizer brand gets its own workspace with separate analytics and payouts.
            </p>
          </div>
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="rounded-full shadow-[var(--shadow-glow)] gap-2"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> New Workspace
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => {
            const t = types.find((x) => x.id === w.type) || types[0];
            const isActive = activeWorkspace?.id === w.id;
            
            return (
              <div
                key={w.id}
                className={`flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-all ${
                  isActive ? "border-primary ring-1 ring-primary" : "border-border/60"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shrink-0 overflow-hidden`}
                    style={{ background: isActive ? "var(--gradient-primary)" : "var(--card-muted)", color: isActive ? "white" : "inherit" }}
                  >
                    {w.icon?.startsWith("data:image") ? (
                      <img src={w.icon} alt="Workspace Logo" className="w-full h-full object-cover" />
                    ) : (
                      w.icon || <t.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg truncate">{w.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {t.title} · {w.city}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant={isActive ? "default" : "outline"}
                  className={`w-full rounded-xl gap-2 ${isActive && "shadow-[var(--shadow-glow)]"}`}
                  style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                  onClick={() => {
                    setActiveWorkspace(w);
                    navigate({ to: `/dashboard/${w.slug}` });
                  }}
                >
                  {isActive ? "Currently Active" : "Switch to Workspace"} 
                  {!isActive && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // WIZARD UI
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-between p-6 md:p-8 shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Workspace Setup</h2>
        {workspaces.length > 0 && !created && (
          <Button variant="ghost" className="rounded-full" onClick={() => setIsWizardOpen(false)}>
            Cancel & Close
          </Button>
        )}
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 flex flex-col justify-center min-h-[600px]">
        {created ? (
          <div className="text-center animate-scale-in">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full text-white shadow-[var(--shadow-glow)] mb-8" style={{ background: "var(--gradient-primary)" }}>
              <Check className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Workspace Created!</h1>
            <p className="text-lg text-muted-foreground">Preparing your custom dashboard...</p>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="flex gap-2 mb-12">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-primary/20"}`} style={step >= s ? { background: "var(--gradient-primary)" } : {}} />
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">What kind of workspace are you building?</h1>
                  <p className="text-lg text-muted-foreground">This helps us customize your dashboard with the right tools.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex flex-col items-start gap-4 rounded-3xl border-2 p-6 text-left transition ${
                        type === t.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border/60 bg-card hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                        type === t.id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-secondary text-muted-foreground"
                      }`}>
                        <t.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-xl font-bold ${type === t.id ? "text-primary" : "text-foreground"}`}>{t.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Let's get the details down</h1>
                  <p className="text-lg text-muted-foreground">Tell us about your organization and how customers can reach you.</p>
                </div>

                <div className="bg-card border border-border/60 p-6 md:p-8 rounded-3xl shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Workspace Name *</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kigali Arena" className="h-12 text-lg rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Primary City</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kigali, Rwanda" className="h-12 text-lg rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Full Address</Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Event Street" className="h-12 text-lg rounded-xl bg-secondary/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/60">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="hello@example.com" className="h-12 text-lg rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Phone Number</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+250 788 123 456" className="h-12 text-lg rounded-xl bg-secondary/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/60">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Instagram</Label>
                      <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" className="rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">TikTok</Label>
                      <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@handle" className="rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">YouTube</Label>
                      <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Channel URL" className="rounded-xl bg-secondary/50" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/60 space-y-4">
                    <Label className="text-base font-semibold">Workspace Icon or Logo</Label>
                    <div className="flex flex-wrap gap-3">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setIcon(emoji)}
                          className={`h-12 w-12 text-2xl rounded-xl border flex items-center justify-center transition-all ${
                            icon === emoji ? "border-primary bg-primary/10 shadow-md scale-110" : "border-border/60 bg-secondary/30 hover:bg-secondary"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                      <label className={`h-12 w-12 rounded-xl border border-dashed flex items-center justify-center cursor-pointer transition-all ${
                        icon.startsWith("data:image") ? "border-primary bg-primary/10 shadow-md scale-110" : "border-border text-muted-foreground bg-secondary/10 hover:bg-secondary"
                      }`} title="Upload Custom Logo">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => setIcon(e.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {icon.startsWith("data:image") ? (
                          <img src={icon} alt="Logo" className="h-8 w-8 object-contain" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Customize Your Dashboard Tools</h1>
                  <p className="text-lg text-muted-foreground">Select the specific modules you need. You can always change this later.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoadingModules ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      Loading modules...
                    </div>
                  ) : platformModules.map(m => {
                    const isSelected = modules.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        disabled={m.mandatory}
                        onClick={() => toggleModule(m.id)}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border/60 bg-card hover:bg-secondary/50"
                        } ${m.mandatory ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                        }`}>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <m.icon className="h-4 w-4 text-muted-foreground" />
                            <p className="font-semibold text-foreground">{m.label}</p>
                            {m.mandatory && <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">Required</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="animate-fade-in space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-5xl mb-6 shadow-sm border border-border/60 overflow-hidden">
                    {icon.startsWith("data:image") ? (
                      <img src={icon} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      icon
                    )}
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">{name}</h1>
                  <p className="text-lg text-muted-foreground">{types.find(t => t.id === type)?.title} based in {city || "an unknown city"}.</p>
                </div>

                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> Included Modules ({modules.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {platformModules.filter(m => modules.includes(m.id)).map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium">
                        <m.icon className="h-4 w-4 text-muted-foreground" /> {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/60">
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-full gap-2 text-base"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="h-5 w-5" /> Back
              </Button>

              {step < 4 ? (
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 px-8 text-base shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 2 && !name.trim())}
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 px-8 text-base shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={handleCreate}
                >
                  <Check className="h-5 w-5" /> Launch Workspace
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
