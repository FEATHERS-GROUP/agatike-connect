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
}: {
  addComponent: (type: string) => void;
  editorState: any;
  set: (key: string) => (val: any) => void;
  handleImageUpload: (file: File, callback: (url: string) => void) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-card">
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion type="multiple" defaultValue={["link", "position", "size", "layout", "styles", "page"]}>
            
            {/* Page General Settings (Our underlying data) */}
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

            {/* Link Placeholder */}
            <AccordionItem value="link" className="border-border/60">
              <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                <span>Link</span>
                <Plus className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-2">
                <div className="text-[10px] text-muted-foreground p-2 bg-secondary/30 rounded-md border border-border/40 text-center">
                  Select an element to add a link
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Position Placeholder */}
            <AccordionItem value="position" className="border-border/60">
              <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1">
                Position
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-4">
                <Select defaultValue="relative">
                  <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relative" className="text-xs">Relative</SelectItem>
                    <SelectItem value="absolute" className="text-xs">Absolute</SelectItem>
                    <SelectItem value="fixed" className="text-xs">Fixed</SelectItem>
                    <SelectItem value="sticky" className="text-xs">Sticky</SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Size Placeholder */}
            <AccordionItem value="size" className="border-border/60">
              <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                <span>Size</span>
                <Plus className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-4">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-secondary/30 rounded-md border border-border/60 px-2 h-8">
                    <span className="text-[10px] text-muted-foreground w-4">W</span>
                    <Input defaultValue="100%" className="h-6 px-1 border-0 bg-transparent text-xs text-right" />
                  </div>
                  <div className="flex-1 flex items-center bg-secondary/30 rounded-md border border-border/60 px-2 h-8">
                    <span className="text-[10px] text-muted-foreground w-4">H</span>
                    <Input defaultValue="Auto" className="h-6 px-1 border-0 bg-transparent text-xs text-right" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Layout Placeholder */}
            <AccordionItem value="layout" className="border-border/60">
              <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                <span>Layout</span>
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <div className="flex bg-secondary/50 rounded-md p-0.5 border border-border/40">
                    <Button variant="ghost" size="sm" className="h-6 px-3 text-xs bg-background shadow-sm rounded-sm">
                      Stack
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-3 text-xs text-muted-foreground rounded-sm">
                      Grid
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Direction</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md bg-background border-border/60 text-primary">
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md bg-secondary/30 border-transparent text-muted-foreground">
                      <MoveVertical className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Distribute</span>
                  <Select defaultValue="center">
                    <SelectTrigger className="h-7 w-24 text-xs bg-secondary/30 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start" className="text-xs">Start</SelectItem>
                      <SelectItem value="center" className="text-xs">Center</SelectItem>
                      <SelectItem value="end" className="text-xs">End</SelectItem>
                      <SelectItem value="space-between" className="text-xs">Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Wrap</span>
                  <div className="flex bg-secondary/50 rounded-md p-0.5 border border-border/40">
                    <Button variant="ghost" size="sm" className="h-6 px-3 text-xs bg-background shadow-sm rounded-sm">
                      Yes
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-3 text-xs text-muted-foreground rounded-sm">
                      No
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Padding</span>
                  <div className="flex gap-1 items-center">
                    <Input defaultValue="0" className="w-12 h-7 text-xs text-center bg-secondary/30 border-border/60" />
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md bg-secondary/30 border-transparent text-muted-foreground">
                      <div className="w-3 h-3 border border-current rounded-sm" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md bg-secondary/30 border-transparent text-muted-foreground">
                      <div className="w-3 h-3 border border-current border-t-0 rounded-sm" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Styles Placeholder */}
            <AccordionItem value="styles" className="border-border/60">
              <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline px-1 flex items-center justify-between">
                <span>Styles</span>
                <Plus className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-4 space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 border border-muted-foreground rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    </div>
                    Transition
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    <Zap className="w-3 h-3 fill-current" />
                    Instant
                  </div>
                </div>

                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 border border-muted-foreground rounded-full" />
                    Fill
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <div className="w-3 h-3 bg-[#004B03] border border-border rounded-sm" />
                    #004B03
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
