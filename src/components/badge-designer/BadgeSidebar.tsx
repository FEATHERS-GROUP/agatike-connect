import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Type,
  Image as ImageIcon,
  Briefcase,
  Plus,
  Trash2,
  Upload,
  Loader2,
  LayoutTemplate,
  Lock,
} from "lucide-react";
import { FONTS, GRADIENTS, Sponsor } from "./constants";

interface BadgeSidebarProps {
  isLocked: boolean;
  config: any;
  setConfig: (config: any) => void;
  setActiveSide: (side: "front" | "back") => void;
  uploadingState: Record<string, boolean>;
  handleUpload: (file: File, key: string, callback: (url: string) => void) => void;
  sponsors: Sponsor[];
  addSponsor: () => void;
  updateSponsor: (id: string, field: keyof Sponsor, value: any) => void;
  removeSponsor: (id: string) => void;
}

export function BadgeSidebar({
  isLocked,
  config,
  setConfig,
  setActiveSide,
  uploadingState,
  handleUpload,
  sponsors,
  addSponsor,
  updateSponsor,
  removeSponsor,
}: BadgeSidebarProps) {
  return (
    <div className="w-full lg:w-[450px] border-r border-border/60 bg-card/50 overflow-y-auto flex-none z-10 custom-scrollbar relative">
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Designer Locked</h3>
          <p className="text-sm text-muted-foreground">
            Please select an event from the dropdown in the top right to unlock the designer tools.
          </p>
        </div>
      )}

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full rounded-none border-b border-border/60 bg-transparent p-0 grid grid-cols-5 h-auto">
          <TabsTrigger
            value="style"
            className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2"
          >
            <Palette className="h-4 w-4" />{" "}
            <span className="text-[9px] uppercase tracking-wider">Style</span>
          </TabsTrigger>
          <TabsTrigger
            value="layout"
            className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />{" "}
            <span className="text-[9px] uppercase tracking-wider">Layout</span>
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2"
          >
            <Type className="h-4 w-4" />{" "}
            <span className="text-[9px] uppercase tracking-wider">Text</span>
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2"
          >
            <ImageIcon className="h-4 w-4" />{" "}
            <span className="text-[9px] uppercase tracking-wider">Media</span>
          </TabsTrigger>
          <TabsTrigger
            value="sponsors"
            onClick={() => setActiveSide(config.sponsorsPlacement === "front" ? "front" : "back")}
            className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2"
          >
            <Briefcase className="h-4 w-4" />{" "}
            <span className="text-[9px] uppercase tracking-wider">Sponsors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="p-6 space-y-8 animate-in fade-in">
          <section>
            <Label className="text-base font-semibold mb-4 block">Card Material</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setConfig({ ...config, theme: "glass" })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === "glass" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}`}
              >
                <div className="w-full h-10 rounded bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md border border-white/10 mb-2"></div>
                <span className="text-xs font-medium">Glass</span>
              </button>
              <button
                onClick={() => setConfig({ ...config, theme: "solid" })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === "solid" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}`}
              >
                <div className="w-full h-10 rounded bg-slate-800 mb-2"></div>
                <span className="text-xs font-medium">Matte</span>
              </button>
              <button
                onClick={() => setConfig({ ...config, theme: "minimal" })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === "minimal" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}`}
              >
                <div className="w-full h-10 rounded bg-white border border-slate-200 mb-2"></div>
                <span className="text-xs font-medium">Minimal</span>
              </button>
            </div>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">Color Palette</Label>
            <div className="grid grid-cols-2 gap-3">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setConfig({ ...config, gradientClass: g.class })}
                  className={`relative flex items-center p-3 rounded-xl border-2 transition-all overflow-hidden ${config.gradientClass === g.class ? "border-primary" : "border-transparent hover:border-border/60"}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.class} opacity-20`}></div>
                  <div
                    className={`h-6 w-6 rounded-full bg-gradient-to-br ${g.class} border border-white/20 mr-3 shadow-sm`}
                  ></div>
                  <span className="text-xs font-medium relative z-10">{g.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">
              Accent Color (Highlights & QR)
            </Label>
            <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border/60">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-sm font-mono text-muted-foreground uppercase bg-background px-3 py-1.5 rounded-md border border-border">
                {config.accentColor}
              </span>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="layout" className="p-6 space-y-8 animate-in fade-in">
          <section>
            <Label className="text-base font-semibold mb-4 block">Sponsors Placement</Label>
            <Select
              value={config.sponsorsPlacement}
              onValueChange={(v) => {
                setConfig({ ...config, sponsorsPlacement: v });
                setActiveSide(v === "front" ? "front" : "back");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front Side</SelectItem>
                <SelectItem value="back">Back Side</SelectItem>
                <SelectItem value="none">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose which side the sponsor logos show on. You can then drag to position them.
            </p>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">QR Code Placement</Label>
            <Select
              value={config.qrPlacement}
              onValueChange={(v) => {
                setConfig({ ...config, qrPlacement: v });
                setActiveSide(v === "back" ? "back" : "front");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front Side</SelectItem>
                <SelectItem value="back">Back Side</SelectItem>
                <SelectItem value="none">Hidden (Not Recommended)</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">
              Section / VIP Access Footer
            </Label>
            <Select
              value={config.sectionPlacement}
              onValueChange={(v) => {
                setConfig({ ...config, sectionPlacement: v });
                setActiveSide(v === "back" ? "back" : "front");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front Side</SelectItem>
                <SelectItem value="back">Back Side</SelectItem>
                <SelectItem value="none">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">Staff Name Size</Label>
            <Select
              value={config.frontTextSize}
              onValueChange={(v) => setConfig({ ...config, frontTextSize: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-xl">Small</SelectItem>
                <SelectItem value="text-2xl">Medium</SelectItem>
                <SelectItem value="text-3xl">Large (Default)</SelectItem>
                <SelectItem value="text-4xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </section>
        </TabsContent>

        <TabsContent value="branding" className="p-6 space-y-8 animate-in fade-in">
          <section>
            <Label className="text-base font-semibold mb-4 block">Typography</Label>
            <Select
              value={config.fontFamily}
              onValueChange={(v) => setConfig({ ...config, fontFamily: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.id} value={f.id} className={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">Event Name / Header Text</Label>
            <Input
              value={config.logoText}
              onChange={(e) => setConfig({ ...config, logoText: e.target.value })}
              placeholder="e.g. AGATIKE FESTIVAL"
            />
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">Back Side Rules / Text</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Custom rules or information to show on the back of the badge.
            </p>
            <textarea
              value={config.backText}
              onChange={(e) => {
                setConfig({ ...config, backText: e.target.value });
                setActiveSide("back");
              }}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="NON-TRANSFERABLE\nValid only for the specified event date."
            />
          </section>
        </TabsContent>

        <TabsContent value="images" className="p-6 space-y-8 animate-in fade-in">
          <section className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-secondary/30">
            <div>
              <Label className="text-base font-semibold block">Show Staff Photo</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Display the staff's profile picture
              </p>
            </div>
            <Switch
              checked={config.showUserImage}
              onCheckedChange={(checked) => {
                setConfig({ ...config, showUserImage: checked });
                setActiveSide("front");
              }}
            />
          </section>

          <section>
            <Label className="text-base font-semibold mb-4 block">Custom Background Image</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a pattern or photo (Max 5MB).
            </p>
            <div className="flex gap-2">
              <Input
                value={config.bgImageUrl}
                onChange={(e) => setConfig({ ...config, bgImageUrl: e.target.value })}
                placeholder="https://... or upload"
              />
              <Button variant="outline" size="icon" className="shrink-0 relative overflow-hidden">
                {uploadingState["bg"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleUpload(e.target.files[0], "bg", (url) =>
                      setConfig({ ...config, bgImageUrl: url }),
                    )
                  }
                />
              </Button>
            </div>
            {config.bgImageUrl && (
              <div className="mt-4 space-y-4">
                <div className="h-24 rounded-lg overflow-hidden border border-border/60 relative group">
                  <img
                    src={config.bgImageUrl}
                    alt="Bg preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setConfig({ ...config, bgImageUrl: "" })}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">Background Opacity</Label>
                    <span className="text-xs text-muted-foreground">{config.bgOpacity}%</span>
                  </div>
                  <Slider
                    value={[config.bgOpacity]}
                    onValueChange={(v) => setConfig({ ...config, bgOpacity: v[0] })}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="sponsors" className="p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold block">Sponsor Logos</Label>
              <p className="text-xs text-muted-foreground">
                Click and drag them directly on the preview to position them!
              </p>
            </div>
            <Button onClick={addSponsor} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          {sponsors.length === 0 && (
            <div className="text-center p-8 border border-dashed border-border/60 rounded-xl bg-secondary/20">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No sponsors added yet.</p>
            </div>
          )}

          <div className="space-y-4">
            {sponsors.map((s, idx) => (
              <div
                key={s.id}
                className="p-4 border border-border/60 rounded-xl bg-secondary/10 relative"
              >
                <button
                  onClick={() => removeSponsor(s.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Label className="text-xs mb-2 block">Sponsor {idx + 1} Label</Label>
                <Input
                  value={s.text}
                  onChange={(e) => updateSponsor(s.id, "text", e.target.value)}
                  placeholder="e.g. POWERED BY"
                  className="mb-3 h-8"
                />
                <Label className="text-xs mb-2 block">Sponsor {idx + 1} Logo</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={s.logoUrl}
                    onChange={(e) => updateSponsor(s.id, "logoUrl", e.target.value)}
                    placeholder="Image URL"
                    className="h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0 relative overflow-hidden"
                  >
                    {uploadingState[`sp_${s.id}`] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleUpload(e.target.files[0], `sp_${s.id}`, (url) =>
                          updateSponsor(s.id, "logoUrl", url),
                        )
                      }
                    />
                  </Button>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] text-muted-foreground uppercase">
                      Logo Scale
                    </Label>
                  </div>
                  <Slider
                    value={[s.scale || 24]}
                    onValueChange={(v) => updateSponsor(s.id, "scale", v[0])}
                    max={100}
                    min={10}
                    step={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
