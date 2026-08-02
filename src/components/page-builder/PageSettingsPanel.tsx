import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Type,
  Image as ImageIcon,
  Columns,
  Link2,
  LayoutTemplate,
  Grid,
  Users2,
  Trash2,
  CreditCard,
  QrCode,
  AlertTriangle,
  UploadCloud,
  FileText,
  DollarSign,
  Package,
  CalendarDays,
  Building,
  Film,
  MapPin,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
  MoveHorizontal,
  MoveVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Zap,
} from "lucide-react";

export function PageSettingsPanel({
  addComponent,
  editorState,
  set,
  handleImageUpload,
  selectedElementId,
  updateComponent,
}: {
  addComponent: (type: string) => void;
  editorState: any;
  set: (key: string) => (val: any) => void;
  handleImageUpload: (file: File, callback: (url: string) => void) => void;
  selectedElementId?: string | null;
  updateComponent?: (index: number, key: string, value: any) => void;
}) {
  const parentId = selectedElementId?.split('__')[0];
  const subKey = selectedElementId?.split('__')[1] || "";
  const selectedIndex = editorState.components.findIndex((c: any) => c.id === parentId);
  const selectedComp = selectedIndex >= 0 ? editorState.components[selectedIndex] : null;

  const getVal = (key: string) => {
    if (!selectedComp) return undefined;
    if (subKey) {
      return selectedComp[`${subKey}_${key}`];
    }
    return selectedComp[key];
  };

  const updateSelected = (key: string, value: any) => {
    if (selectedIndex >= 0 && updateComponent) {
      if (subKey) {
        updateComponent(selectedIndex, `${subKey}_${key}`, value);
      } else {
        updateComponent(selectedIndex, key, value);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion type="multiple" defaultValue={["link", "position", "size", "layout", "styles", "page"]}>
            
            {!selectedComp && (
              <AccordionItem value="page" className="border-border/60">
                <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1">
                  Page Setup
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-4 pt-1 space-y-4">
                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">URL Slug</Label>
                    <div className="flex items-center bg-secondary/30 rounded-md border border-border/60 focus-within:border-primary/50 transition-all">
                      <span className="px-2 text-xs text-muted-foreground border-r border-border/40 select-none">
                        /p/
                      </span>
                      <Input
                        value={editorState.slug}
                        onChange={(e) =>
                          set("slug")(
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        placeholder="my-page"
                        className="h-7 text-xs rounded-none border-0 bg-transparent focus-visible:ring-0 px-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">Theme Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
                        <Input
                          type="color"
                          value={editorState.themeColor}
                          onChange={(e) => set("themeColor")(e.target.value)}
                          className="absolute -inset-4 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={editorState.themeColor}
                        onChange={(e) => set("themeColor")(e.target.value)}
                        className="h-7 text-xs font-mono bg-secondary/30 border-border/60 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">Brand Logo</Label>
                    {editorState.logoUrl ? (
                      <div className="relative w-full h-16 rounded-md border border-border/60 overflow-hidden group bg-black/5">
                        <img
                          src={editorState.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Trash2
                            className="w-4 h-4 text-white cursor-pointer hover:text-red-400 transition-colors"
                            onClick={() => set("logoUrl")("")}
                          />
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block w-full">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              if (e.target.files[0].size > 2 * 1024 * 1024)
                                return alert("File too large (max 2MB)");
                              handleImageUpload(e.target.files[0], set("logoUrl"));
                            }
                          }}
                        />
                        <div className="border border-dashed border-border/60 rounded-md p-3 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors flex flex-col items-center justify-center h-16 gap-1">
                          <UploadCloud className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                      </label>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {selectedComp && (
              <>
                {/* Link */}
                <AccordionItem value="link" className="border-border/60">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                    <span>Link</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">URL</Label>
                      <Input 
                        value={getVal("url") || getVal("button_url") || ""}
                        onChange={(e) => {
                          if (getVal("button_url") !== undefined) updateSelected("button_url", e.target.value);
                          else updateSelected("url", e.target.value);
                        }}
                        placeholder="https://..." 
                        className="h-8 text-xs bg-secondary/30 border-border/60" 
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Size */}
                <AccordionItem value="size" className="border-border/60">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                    <span>Size</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-4">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-secondary/30 rounded-md border border-border/60 px-2 h-8 focus-within:border-primary/50">
                        <span className="text-[10px] text-muted-foreground w-4">W</span>
                        <Input 
                          value={getVal("width") || "100%"} 
                          onChange={(e) => updateSelected("width", e.target.value)}
                          className="h-6 px-1 border-0 bg-transparent text-xs text-right focus-visible:ring-0" 
                        />
                      </div>
                      <div className="flex-1 flex items-center bg-secondary/30 rounded-md border border-border/60 px-2 h-8 focus-within:border-primary/50">
                        <span className="text-[10px] text-muted-foreground w-4">H</span>
                        <Input 
                          value={getVal("height") || "auto"} 
                          onChange={(e) => updateSelected("height", e.target.value)}
                          className="h-6 px-1 border-0 bg-transparent text-xs text-right focus-visible:ring-0" 
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Layout */}
                <AccordionItem value="layout" className="border-border/60">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                    <span>Layout</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Padding</span>
                      <div className="flex gap-1 items-center">
                        <Input 
                          value={getVal("padding") || "4"} 
                          onChange={(e) => updateSelected("padding", e.target.value)}
                          className="w-12 h-7 text-xs text-center bg-secondary/30 border-border/60" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Align</span>
                      <Select value={getVal("alignment") || "center"} onValueChange={(val) => updateSelected("alignment", val)}>
                        <SelectTrigger className="h-7 w-24 text-xs bg-secondary/30 border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="start" className="text-xs">Left</SelectItem>
                          <SelectItem value="center" className="text-xs">Center</SelectItem>
                          <SelectItem value="end" className="text-xs">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Styles */}
                <AccordionItem value="styles" className="border-border/60">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                    <span>Styles</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-4 space-y-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        Background
                      </div>
                      <div className="flex items-center gap-2 relative">
                        <Input 
                          type="color"
                          value={getVal("backgroundColor") || "#ffffff"}
                          onChange={(e) => updateSelected("backgroundColor", e.target.value)}
                          className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        Radius
                      </div>
                      <Input 
                        value={getVal("borderRadius") || "16"} 
                        onChange={(e) => updateSelected("borderRadius", e.target.value)}
                        className="w-16 h-7 text-xs text-center bg-secondary/30 border-border/60" 
                      />
                    </div>
                    <div className="border-b border-border/40 pb-4 mb-4">
                      <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => {
                        const el = document.getElementById('typography-section');
                        if (el) el.classList.toggle('hidden');
                      }}>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Typography</h3>
                        <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-[10px] leading-none">+</span>
                        </div>
                      </div>
                      <div id="typography-section" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Size (px)</span>
                          <Input 
                            value={getVal("fontSize") || ""} 
                            onChange={(e) => updateSelected("fontSize", e.target.value)}
                            placeholder="Inherit"
                            className="w-16 h-7 text-xs text-center bg-secondary/30 border-border/60" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Color</span>
                          <Input 
                            type="color"
                            value={getVal("color") || "#000000"}
                            onChange={(e) => updateSelected("color", e.target.value)}
                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Weight</span>
                          <Select value={getVal("fontWeight") || ""} onValueChange={(val) => updateSelected("fontWeight", val === "normal" ? "" : val)}>
                            <SelectTrigger className="h-7 w-24 text-xs bg-secondary/30 border-border/60">
                              <SelectValue placeholder="Inherit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Inherit</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="600">Semi Bold</SelectItem>
                              <SelectItem value="400">Regular</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Decoration</span>
                          <Select value={getVal("textDecoration") || ""} onValueChange={(val) => updateSelected("textDecoration", val === "none" ? "" : val)}>
                            <SelectTrigger className="h-7 w-24 text-xs bg-secondary/30 border-border/60">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="underline">Underline</SelectItem>
                              <SelectItem value="line-through">Strike</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
            
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
