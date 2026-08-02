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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  Check,
  ChevronsUpDown,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Nunito", "Playfair Display",
  "Merriweather", "Raleway", "Rubik", "Oswald", "Ubuntu", "PT Sans", "Work Sans", "Noto Sans",
  "Quicksand", "Karla", "Lora", "Fira Sans", "Mulish", "Inconsolata", "Barlow", "Josefin Sans",
  "Cabin", "Heebo", "Mukta", "Dosis", "Arimo", "Titillium Web", "PT Serif", "Bitter", "Anton",
  "Hind", "Varela Round", "Assistant", "Oxygen", "Nanum Gothic", "Teko", "Abel", "Yanone Kaffeesatz",
  "Signika", "Righteous", "Pacifico", "Dancing Script", "Bebas Neue", "Caveat", "Satisfy", "Courgette",
  "Great Vibes", "Sacramento", "Play", "Questrial", "Asap", "Rokkitt", "Zilla Slab", "Crimson Text",
  "Domine", "Cardo", "Alfa Slab One", "Cinzel", "Exo 2", "Rajdhani", "Jost", "Kanit", "Tauri",
  "Sarabun", "Fjalla One", "Prompt", "Manrope", "Sen", "Spartan", "Syne", "Outfit", "Plus Jakarta Sans",
  "DM Sans", "Be Vietnam Pro", "Public Sans", "Space Grotesk", "Space Mono", "JetBrains Mono",
  "IBM Plex Sans", "IBM Plex Serif", "IBM Plex Mono", "Overpass", "Fira Code", "Blinker", "Literata",
  "Merriweather Sans", "Source Sans Pro", "Source Serif Pro", "Source Code Pro", "Noto Serif",
  "Slabo 27px", "Cormorant Garamond", "Libre Baskerville", "Playfair Display SC", "Vollkorn",
  "Alegreya", "Alegreya Sans"
];

export function PageSettingsPanel({
  addComponent,
  editorState,
  set,
  handleImageUpload,
  selectedElementId,
  updateComponent,
  allPages = [],
}: {
  addComponent: (type: string) => void;
  editorState: any;
  set: (key: string) => (val: any) => void;
  handleImageUpload: (file: File, callback: (url: string) => void) => void;
  selectedElementId?: string | null;
  updateComponent?: (index: number, key: string, value: any) => void;
  allPages?: any[];
}) {
  const [openFontDropdown, setOpenFontDropdown] = React.useState(false);
  const [openPageFontDropdown, setOpenPageFontDropdown] = React.useState(false);
  const parentId = selectedElementId?.split('__')[0];
  const subKey = selectedElementId?.split('__')[1] || "";
  const selectedIndex = editorState.components.findIndex((c: any) => c.id === parentId);
  const selectedComp = selectedIndex >= 0 ? editorState.components[selectedIndex] : null;

  const parentPage = editorState.parent_id ? allPages.find((p: any) => p.id === editorState.parent_id) : null;
  const parentSlugPrefix = parentPage?.slug ? `${parentPage.slug}/` : "";
  
  const displaySlug = (editorState.slug || "").startsWith(parentSlugPrefix) 
    ? (editorState.slug || "").substring(parentSlugPrefix.length) 
    : (editorState.slug || "");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-/]/g, "");
    set("slug")(parentSlugPrefix + rawVal);
  };

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
                    <div className="flex items-center bg-secondary/30 rounded-md border border-border/60 focus-within:border-primary/50 transition-all overflow-hidden">
                      <span className="px-2 py-1.5 text-xs text-muted-foreground border-r border-border/40 select-none bg-secondary/40 whitespace-nowrap">
                        /p/{parentSlugPrefix}
                      </span>
                      <Input
                        value={displaySlug}
                        onChange={handleSlugChange}
                        placeholder={parentPage ? "sub-page-name" : "my-page"}
                        className="h-7 text-xs rounded-none border-0 bg-transparent focus-visible:ring-0 px-2 min-w-0 flex-1"
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
                    <Label className="text-[10px] text-muted-foreground">Theme Font</Label>
                    <Popover open={openPageFontDropdown} onOpenChange={setOpenPageFontDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPageFontDropdown}
                          className="h-7 w-full justify-between text-xs bg-secondary/30 border-border/60 font-normal px-2"
                        >
                          {editorState.fontFamily || "Inter"}
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search font..." className="h-8 text-xs" />
                          <CommandList>
                            <CommandEmpty>No font found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-48">
                                {GOOGLE_FONTS.map((font) => (
                                  <CommandItem
                                    key={font}
                                    value={font}
                                    onSelect={() => {
                                      set("fontFamily")(font);
                                      setOpenPageFontDropdown(false);
                                    }}
                                    className="text-xs"
                                    style={{ fontFamily: `'${font}', sans-serif` }}
                                  >
                                    <Check className={cn("mr-2 h-3 w-3", editorState.fontFamily === font ? "opacity-100" : "opacity-0")} />
                                    {font}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">Page Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
                        <Input
                          type="color"
                          value={editorState.pageBackgroundColor || "#ffffff"}
                          onChange={(e) => set("pageBackgroundColor")(e.target.value)}
                          className="absolute -inset-4 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={editorState.pageBackgroundColor || "#ffffff"}
                        onChange={(e) => set("pageBackgroundColor")(e.target.value)}
                        className="h-7 text-xs font-mono bg-secondary/30 border-border/60 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">Page Text Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
                        <Input
                          type="color"
                          value={editorState.pageTextColor || "#000000"}
                          onChange={(e) => set("pageTextColor")(e.target.value)}
                          className="absolute -inset-4 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={editorState.pageTextColor || "#000000"}
                        onChange={(e) => set("pageTextColor")(e.target.value)}
                        className="h-7 text-xs font-mono bg-secondary/30 border-border/60 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col pt-2 border-t border-border/40">
                    <Label className="text-[10px] text-muted-foreground font-semibold">Navbar Appearance</Label>
                    
                    <div className="pt-1 space-y-3">
                      <div className="space-y-1.5 flex flex-col">
                        <Label className="text-[10px] text-muted-foreground">Background Color (Solid Navbar)</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
                            <Input
                              type="color"
                              value={editorState.navbarBackgroundColor || "#ffffff"}
                              onChange={(e) => set("navbarBackgroundColor")(e.target.value)}
                              className="absolute -inset-4 w-16 h-16 cursor-pointer"
                            />
                          </div>
                          <Input
                            value={editorState.navbarBackgroundColor || ""}
                            onChange={(e) => set("navbarBackgroundColor")(e.target.value)}
                            placeholder="Default (Theme)"
                            className="h-7 text-xs font-mono bg-secondary/30 border-border/60 uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 flex flex-col">
                        <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
                            <Input
                              type="color"
                              value={editorState.navbarTextColor || "#000000"}
                              onChange={(e) => set("navbarTextColor")(e.target.value)}
                              className="absolute -inset-4 w-16 h-16 cursor-pointer"
                            />
                          </div>
                          <Input
                            value={editorState.navbarTextColor || ""}
                            onChange={(e) => set("navbarTextColor")(e.target.value)}
                            placeholder="Default"
                            className="h-7 text-xs font-mono bg-secondary/30 border-border/60 uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 flex flex-col">
                        <Label className="text-[10px] text-muted-foreground">Links Alignment</Label>
                        <Select value={editorState.navbarAlignment || "right"} onValueChange={set("navbarAlignment")}>
                          <SelectTrigger className="h-7 text-xs bg-secondary/30 border-border/60">
                            <SelectValue placeholder="Align Right" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left" className="text-xs">Left Align</SelectItem>
                            <SelectItem value="center" className="text-xs">Center Align</SelectItem>
                            <SelectItem value="right" className="text-xs">Right Align</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-[10px] text-muted-foreground">Page Background Image</Label>
                    {editorState.pageBackgroundImageUrl ? (
                      <div className="relative w-full h-16 rounded-md border border-border/60 overflow-hidden group bg-black/5">
                        <img
                          src={editorState.pageBackgroundImageUrl}
                          alt="Bg"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Trash2
                            className="w-4 h-4 text-white cursor-pointer hover:text-red-400 transition-colors"
                            onClick={() => set("pageBackgroundImageUrl")("")}
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
                              handleImageUpload(e.target.files[0], set("pageBackgroundImageUrl"));
                            }
                          }}
                        />
                        <div className="border border-dashed border-border/60 rounded-md p-3 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors flex flex-col items-center justify-center h-16 gap-1">
                          <UploadCloud className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Upload Bg</span>
                        </div>
                      </label>
                    )}
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
                          <span className="text-xs text-muted-foreground">Font</span>
                          <Popover open={openFontDropdown} onOpenChange={setOpenFontDropdown}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openFontDropdown}
                                className="h-7 w-[120px] justify-between text-xs bg-secondary/30 border-border/60 font-normal px-2"
                              >
                                {getVal("fontFamily") || "Inherit"}
                                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="end">
                              <Command>
                                <CommandInput placeholder="Search font..." className="h-8 text-xs" />
                                <CommandList>
                                  <CommandEmpty>No font found.</CommandEmpty>
                                  <CommandGroup>
                                    <ScrollArea className="h-48">
                                      <CommandItem
                                        value="inherit"
                                        onSelect={() => {
                                          updateSelected("fontFamily", "");
                                          setOpenFontDropdown(false);
                                        }}
                                        className="text-xs"
                                      >
                                        <Check className={cn("mr-2 h-3 w-3", !getVal("fontFamily") ? "opacity-100" : "opacity-0")} />
                                        Inherit
                                      </CommandItem>
                                      {GOOGLE_FONTS.map((font) => (
                                        <CommandItem
                                          key={font}
                                          value={font}
                                          onSelect={() => {
                                            updateSelected("fontFamily", font);
                                            setOpenFontDropdown(false);
                                          }}
                                          className="text-xs"
                                          style={{ fontFamily: `'${font}', sans-serif` }}
                                        >
                                          <Check className={cn("mr-2 h-3 w-3", getVal("fontFamily") === font ? "opacity-100" : "opacity-0")} />
                                          {font}
                                        </CommandItem>
                                      ))}
                                    </ScrollArea>
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
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
