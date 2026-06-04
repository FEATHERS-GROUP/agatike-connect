import { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, Image as ImageIcon, Dices, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useWorkspace, WorkspaceType } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import { useNavigate } from "@tanstack/react-router";
import { types, COUNTRIES, CATEGORIES } from "./constants";

interface WorkspaceWizardProps {
  onClose: () => void;
}

export function WorkspaceWizard({ onClose }: WorkspaceWizardProps) {
  const { workspaces, createWorkspace } = useWorkspace();
  const { data: platformModules = [], isLoading: isLoadingModules } = usePlatformModules();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<WorkspaceType>("EVENT");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Rwanda");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("rwf");
  const [icon, setIcon] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("bottts");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const generateAvatarsForCategory = (category: string) => {
    const BACKGROUND_COLORS = [
      "b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9", "c0aede", "b6e3f4", "ffdfbf",
    ];
    return Array.from({ length: 12 }).map(() => {
      const bg = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${bg}`;
    });
  };

  useEffect(() => {
    if (isAvatarModalOpen) {
      setAvatarOptions(generateAvatarsForCategory(activeCategory));
    }
  }, [activeCategory, isAvatarModalOpen]);

  useEffect(() => {
    if (platformModules.length > 0) {
      const mandatoryIds = platformModules.filter((m) => m.mandatory).map((m) => m.id);
      setModules(mandatoryIds);
    }
  }, [platformModules]);

  const toggleModule = (id: string) => {
    if (modules.includes(id)) {
      setModules(modules.filter((m) => m !== id));
    } else {
      setModules([...modules, id]);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const computedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    createWorkspace({
      name,
      type,
      city,
      country,
      address,
      icon,
      modules,
      currency,
    });
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      onClose();
      navigate({ to: `/dashboard/${computedSlug}` });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-between p-6 md:p-8 shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Workspace Setup</h2>
        {workspaces.length > 0 && !created && (
          <Button variant="ghost" className="rounded-full" onClick={onClose}>
            Cancel & Close
          </Button>
        )}
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 flex flex-col justify-center min-h-[600px]">
        {created ? (
          <div className="text-center animate-scale-in">
            <div
              className="mx-auto grid h-24 w-24 place-items-center rounded-full text-white shadow-[var(--shadow-glow)] mb-8"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Check className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Workspace Created!</h1>
            <p className="text-lg text-muted-foreground">Preparing your custom dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-primary/20"}`}
                  style={step >= s ? { background: "var(--gradient-primary)" } : {}}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    What kind of workspace are you building?
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    This helps us customize your dashboard with the right tools.
                  </p>
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
                      <div
                        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                          type === t.id
                            ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <t.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p
                          className={`text-xl font-bold ${type === t.id ? "text-primary" : "text-foreground"}`}
                        >
                          {t.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Let's get the details down
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Tell us about your organization and how customers can reach you.
                  </p>
                </div>

                <div className="bg-card border border-border/60 p-6 md:p-8 rounded-3xl shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Workspace Name *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Kigali Arena"
                        className="h-12 text-lg rounded-xl bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Country</Label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Primary City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kigali"
                        className="h-12 text-lg rounded-xl bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Wallet Currency</Label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <optgroup label="Global">
                          <option value="dollars">US Dollars ($)</option>
                          <option value="euros">Euros (€)</option>
                          <option value="pounds">British Pounds (£)</option>
                        </optgroup>
                        <optgroup label="East Africa">
                          <option value="rwf">Rwandan Francs (RWF)</option>
                          <option value="kes">Kenyan Shillings (KES)</option>
                          <option value="ugx">Ugandan Shillings (UGX)</option>
                          <option value="tzs">Tanzanian Shillings (TZS)</option>
                          <option value="bif">Burundian Francs (BIF)</option>
                        </optgroup>
                        <optgroup label="West & South Africa">
                          <option value="ngn">Nigerian Naira (₦)</option>
                          <option value="ghs">Ghanaian Cedi (GH₵)</option>
                          <option value="zar">South African Rand (R)</option>
                          <option value="cfa">CFA Franc (CFA)</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="cad">Canadian Dollars (CAD)</option>
                          <option value="aud">Australian Dollars (AUD)</option>
                          <option value="inr">Indian Rupee (₹)</option>
                          <option value="aed">UAE Dirham (AED)</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Full Address</Label>
                      <AddressAutocomplete
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Event Street"
                        className="h-12 text-lg rounded-xl bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/60 space-y-4">
                    <Label className="text-base font-semibold">Workspace Icon or Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 shrink-0 rounded-2xl border-2 border-border/60 overflow-hidden bg-secondary/30 flex items-center justify-center">
                        {icon.startsWith("data:image") || icon.startsWith("http") ? (
                          <img src={icon} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setIcon(ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
                              Upload Logo
                            </div>
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl h-10"
                            onClick={() => setIsAvatarModalOpen(true)}
                          >
                            Choose Avatar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload a custom logo or pick a fun avatar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Customize Your Dashboard Tools
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Select the specific modules you need. You can always change this later.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoadingModules ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      Loading modules...
                    </div>
                  ) : (
                    platformModules.map((m) => {
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
                          <div
                            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-background"
                            }`}
                          >
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <m.icon className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold text-foreground">{m.label}</p>
                              {m.mandatory && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-5xl mb-6 shadow-sm border border-border/60 overflow-hidden">
                    {icon.startsWith("data:image") || icon.startsWith("http") ? (
                      <img src={icon} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">{name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {types.find((t) => t.id === type)?.title} based in {city || "an unknown city"}.
                  </p>
                </div>

                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> Included Modules ({modules.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {platformModules
                      .filter((m) => modules.includes(m.id))
                      .map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium"
                        >
                          <m.icon className="h-4 w-4 text-muted-foreground" /> {m.label}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

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
                  disabled={step === 2 && !name.trim()}
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

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">Choose an Avatar</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b border-border/60 bg-secondary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-4 gap-4">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => {
                    setIcon(avatar);
                    setIsAvatarModalOpen(false);
                  }}
                  className={`aspect-square w-full rounded-2xl border-2 flex items-center justify-center transition-all overflow-hidden ${
                    icon === avatar
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                      : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-105"
                  }`}
                >
                  <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-secondary/20 flex justify-end">
              <Button
                onClick={() => setAvatarOptions(generateAvatarsForCategory(activeCategory))}
                variant="outline"
                className="rounded-xl gap-2 w-full"
              >
                <Dices className="h-4 w-4" /> Randomize Options
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
