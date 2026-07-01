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
  const toolboxItems = [
    { type: "text", icon: Type, label: "Text" },
    { type: "image", icon: ImageIcon, label: "Image" },
    { type: "split_block", icon: Columns, label: "Split" },
    { type: "button", icon: Link2, label: "Button" },
    { type: "payment_button", icon: CreditCard, label: "Pay" },
    { type: "qr_code", icon: QrCode, label: "QR" },
    { type: "form_link", icon: LayoutTemplate, label: "Form Link" },
    {
      type: "form_grid",
      icon: Grid,
      label: "Form Grid",
      highlight: true,
    },
    { type: "sponsor_logos", icon: Users2, label: "Logos" },
  ];

  return (
    <div className="flex flex-col gap-px bg-border/40 rounded-xl overflow-hidden border border-border/50 shadow-sm min-h-full">
      {/* Toolbox */}
      <div className="bg-card p-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
          <Grid className="w-3 h-3" />
          Content Blocks
        </h2>
        <div className="grid grid-cols-2 gap-1">
          {toolboxItems.map((item) => (
            <Button
              key={item.type}
              variant="ghost"
              className={`justify-start gap-2 h-8 px-2.5 text-[11px] font-medium rounded-md transition-colors ${
                item.highlight
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
              onClick={() => addComponent(item.type)}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>
        
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-5 mb-2 flex items-center gap-2">
          <FileText className="w-3 h-3" />
          Internal Forms
        </h2>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start gap-2 h-8 px-2.5 text-[11px] font-medium rounded-md text-red-600/80 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            onClick={() => addComponent("damage_report")}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Damage Report
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-8 px-2.5 text-[11px] font-medium rounded-md text-blue-600/80 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
            onClick={() => addComponent("budget_request")}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Budget Request
          </Button>
        </div>
      </div>

      {/* Page Settings */}
      <div className="bg-card p-4 flex-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2">
          <LayoutTemplate className="w-3 h-3" />
          Page Settings
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">URL Slug</Label>
            <div className="flex items-center bg-secondary/20 rounded-md border border-border/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <span className="px-2 text-[11px] text-muted-foreground border-r border-border/40 select-none">/p/</span>
              <Input
                value={editorState.slug}
                onChange={(e) =>
                  set("slug")(
                    e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="my-page"
                className="h-7 text-[11px] rounded-none border-0 bg-transparent focus-visible:ring-0 px-2"
              />
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Theme Color</Label>
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-md overflow-hidden border border-border/60 shrink-0 cursor-pointer group">
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
                className="h-7 text-[11px] font-mono bg-secondary/20 border-border/40 uppercase"
              />
            </div>
          </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Logo Position</Label>
                <Select value={editorState.logoPosition} onValueChange={set("logoPosition")}>
                  <SelectTrigger className="h-7 text-[11px] bg-secondary/20 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero" className="text-[11px]">Hero</SelectItem>
                    <SelectItem value="navbar" className="text-[11px]">Navbar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Navbar Style</Label>
                <Select value={editorState.navbarStyle || "transparent"} onValueChange={set("navbarStyle")}>
                  <SelectTrigger className="h-7 text-[11px] bg-secondary/20 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent" className="text-[11px]">Transparent Overlay</SelectItem>
                    <SelectItem value="solid" className="text-[11px]">Solid Top Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Font Family</Label>
                <Select value={editorState.fontFamily} onValueChange={set("fontFamily")}>
                  <SelectTrigger className="h-7 text-[11px] bg-secondary/20 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter" className="text-[11px]">Inter</SelectItem>
                    <SelectItem value="Outfit" className="text-[11px]">Outfit</SelectItem>
                    <SelectItem value="Montserrat" className="text-[11px]">Montserrat</SelectItem>
                    <SelectItem value="Playfair Display" className="text-[11px]">Playfair</SelectItem>
                    <SelectItem value="Lora" className="text-[11px]">Lora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Element Shape</Label>
                <Select value={editorState.elementShape || "rounded-2xl"} onValueChange={set("elementShape")}>
                  <SelectTrigger className="h-7 text-[11px] bg-secondary/20 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded-none" className="text-[11px]">Sharp (Square)</SelectItem>
                    <SelectItem value="rounded-lg" className="text-[11px]">Classic (Rounded)</SelectItem>
                    <SelectItem value="rounded-2xl" className="text-[11px]">Soft (Very Round)</SelectItem>
                    <SelectItem value="rounded-full" className="text-[11px]">Pill / Circle</SelectItem>
                    <SelectItem value="rounded-tr-[3rem] rounded-bl-[3rem]" className="text-[11px]">Leaf</SelectItem>
                    <SelectItem value="rounded-tl-[3rem] rounded-br-[3rem]" className="text-[11px]">Diagonal Leaf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Brand Logo</Label>
            {editorState.logoUrl ? (
              <div className="relative w-12 h-12 rounded-lg border border-border/60 overflow-hidden group">
                <img src={editorState.logoUrl} alt="Logo" className="w-full h-full object-contain bg-black/5" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Trash2
                    className="w-3.5 h-3.5 text-white cursor-pointer hover:text-red-400 transition-colors"
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
                <div className="border border-dashed border-border/60 rounded-lg p-3 text-center bg-secondary/10 hover:bg-secondary/30 transition-colors flex flex-col items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Upload Logo</span>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
