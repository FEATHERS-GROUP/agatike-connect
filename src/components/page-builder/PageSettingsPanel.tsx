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
    <div className="md:col-span-1 space-y-5">
      {/* Toolbox */}
      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Add Blocks
        </h2>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {/* Forms */}
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2 mb-1">
              Data Collection
            </div>
            {toolboxItems.map((item) => (
              <Button
                key={item.type}
                variant="outline"
                className={`justify-start gap-2 h-10 ${
                  item.highlight
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary font-semibold"
                    : "bg-secondary/20 hover:bg-secondary/40"
                }`}
                onClick={() => addComponent(item.type)}
              >
                <item.icon className={`h-4 w-4 ${item.highlight ? "text-primary" : ""}`} />
                {item.label}
              </Button>
            ))}
            
            {/* Custom Request Blocks */}
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">
              Internal Requests
            </div>
            <Button
              variant="outline"
              className="justify-start gap-2 h-10 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 text-red-600 font-semibold"
              onClick={() => addComponent("damage_report")}
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Damage Report
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-10 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-600 font-semibold"
              onClick={() => addComponent("budget_request")}
            >
              <DollarSign className="h-4 w-4 text-blue-600" />
              Budget Request
            </Button>
          </div>
      </div>

      {/* Page Settings */}
      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
          Page Settings
        </h2>

        <div className="space-y-1.5">
          <Label className="text-xs">Page URL Slug</Label>
          <div className="flex items-center">
            <span className="bg-secondary px-2.5 py-2 rounded-l-md border border-r-0 border-border/60 text-xs text-muted-foreground">
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
              placeholder="my-event-page"
              className="rounded-l-none text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Theme Color</Label>
          <div className="flex items-center gap-2.5">
            <Input
              type="color"
              value={editorState.themeColor}
              onChange={(e) => set("themeColor")(e.target.value)}
              className="w-10 h-10 p-1 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-muted-foreground font-mono">
              {editorState.themeColor}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Logo Position</Label>
          <Select value={editorState.logoPosition} onValueChange={set("logoPosition")}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Centered on Hero</SelectItem>
              <SelectItem value="navbar">Top Navigation Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Font Family</Label>
          <Select value={editorState.fontFamily} onValueChange={set("fontFamily")}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter (Modern)</SelectItem>
              <SelectItem value="Outfit">Outfit (Geometric)</SelectItem>
              <SelectItem value="Montserrat">Montserrat (Bold)</SelectItem>
              <SelectItem value="Playfair Display">Playfair (Elegant)</SelectItem>
              <SelectItem value="Lora">Lora (Serif)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Logo Image</Label>
          {editorState.logoUrl ? (
            <div className="relative w-16 h-16 rounded-xl border border-border/60 overflow-hidden group">
              <img src={editorState.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Trash2
                  className="w-4 h-4 text-white cursor-pointer"
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
              <div className="border-2 border-dashed border-border p-2 rounded-lg text-center text-xs text-muted-foreground hover:bg-secondary/50">
                Upload Logo
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
