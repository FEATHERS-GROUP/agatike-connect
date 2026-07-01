import { useState } from "react";
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
  GripVertical,
  Image as ImageIcon,
  Trash2,
  AlignLeft,
  AlignRight,
  Plus,
} from "lucide-react";
import { PreviewComponent } from "./PreviewComponent";

export function ComponentBlock({
  comp,
  idx,
  forms,
  workspace_id,
  updateComponent,
  removeComponent,
  moveComponent,
  handleImageUpload,
  canMoveUp,
  canMoveDown,
  eventId,
  themeColor,
}: any) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative group border border-border/40 rounded-xl p-4 bg-secondary/20 hover:border-primary/40 transition-colors">
      {/* Move / delete controls */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canMoveUp && (
          <button onClick={() => moveComponent(idx, -1)} className="p-0.5 hover:text-primary">
            <GripVertical className="w-4 h-4 rotate-90" />
          </button>
        )}
        {canMoveDown && (
          <button onClick={() => moveComponent(idx, 1)} className="p-0.5 hover:text-primary">
            <GripVertical className="w-4 h-4 -rotate-90" />
          </button>
        )}
      </div>
      <button
        onClick={() => removeComponent(idx)}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive bg-background shadow-sm hover:bg-destructive/10 p-1.5 rounded-md z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Block header */}
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {comp.type.replace(/_/g, " ")}
          </span>
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done Editing" : "Edit Settings"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] uppercase text-muted-foreground whitespace-nowrap">
            Nav Label
          </Label>
          <Input
            placeholder="e.g. About"
            value={comp.menuName || ""}
            onChange={(e) => updateComponent(idx, "menuName", e.target.value)}
            className="h-6 text-xs w-28 bg-background"
          />
        </div>
      </div>

      {!isEditing ? (
        <PreviewComponent comp={comp} themeColor={themeColor} activeForms={forms} />
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* TEXT */}
          {comp.type === "text" && (
            <textarea
              value={comp.content}
              onChange={(e) => updateComponent(idx, "content", e.target.value)}
              placeholder="Write something..."
              className="w-full min-h-[100px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          )}

          {/* IMAGE */}
          {comp.type === "image" && (
            <div>
              {comp.url ? (
                <div className="relative rounded-lg overflow-hidden border border-border/60 group/img">
                  <img
                    src={comp.url}
                    alt="Custom"
                    className="w-full h-auto max-h-[400px] object-contain bg-background"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateComponent(idx, "url", "")}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border/60 rounded-lg p-8 flex flex-col items-center justify-center bg-background cursor-pointer hover:border-primary/50">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        if (e.target.files[0].size > 5 * 1024 * 1024)
                          return alert("File too large (max 5MB)");
                        handleImageUpload(e.target.files[0], (url: string) =>
                          updateComponent(idx, "url", url),
                        );
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Upload Image (Max 5MB)</span>
                </label>
              )}
            </div>
          )}

          {/* SPLIT BLOCK */}
          {comp.type === "split_block" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Image + Text Layout</Label>
                <div className="flex items-center bg-background rounded-md border border-border/60 p-0.5">
                  <button
                    className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                      comp.imagePosition === "left"
                        ? "bg-secondary font-medium"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => updateComponent(idx, "imagePosition", "left")}
                  >
                    <AlignLeft className="w-3 h-3" /> Img Left
                  </button>
                  <button
                    className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                      comp.imagePosition === "right"
                        ? "bg-secondary font-medium"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => updateComponent(idx, "imagePosition", "right")}
                  >
                    Img Right <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div
                className={`flex flex-col md:flex-row gap-4 ${
                  comp.imagePosition === "right" ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 bg-background rounded-lg border border-border/60 overflow-hidden min-h-[180px] flex flex-col relative group/img">
                  {comp.imageUrl ? (
                    <>
                      <img
                        src={comp.imageUrl}
                        alt="Split"
                        className="w-full h-full object-cover absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateComponent(idx, "imageUrl", "")}
                        >
                          Remove
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                      <label className="cursor-pointer text-xs underline">
                        Choose File
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              if (e.target.files[0].size > 5 * 1024 * 1024)
                                return alert("File too large (max 5MB)");
                              handleImageUpload(e.target.files[0], (url: string) =>
                                updateComponent(idx, "imageUrl", url),
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comp.text}
                    onChange={(e) => updateComponent(idx, "text", e.target.value)}
                    placeholder="Write accompanying text..."
                    className="w-full h-full min-h-[180px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BUTTON */}
          {comp.type === "button" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Button Label</Label>
                <Input
                  value={comp.label}
                  onChange={(e) => updateComponent(idx, "label", e.target.value)}
                  placeholder="e.g. Buy Tickets"
                  className="bg-background"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Link URL</Label>
                <Input
                  value={comp.url}
                  onChange={(e) => updateComponent(idx, "url", e.target.value)}
                  placeholder="https://..."
                  className="bg-background"
                />
              </div>
            </div>
          )}

          {/* BUDGET & DAMAGE REQUEST */}
          {(comp.type === "budget_request" || comp.type === "damage_report") && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">Form Title</Label>
                <Input
                  value={comp.title || ""}
                  onChange={(e) => updateComponent(idx, "title", e.target.value)}
                  placeholder={comp.type === "damage_report" ? "e.g. Damage Report" : "e.g. Budget Request"}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <textarea
                  value={comp.description || ""}
                  onChange={(e) => updateComponent(idx, "description", e.target.value)}
                  placeholder="e.g. Please list items below."
                  className="w-full bg-background border border-border/60 rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[60px]"
                />
              </div>

              {/* Columns Designer */}
              <div className="space-y-2 mt-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Spreadsheet Columns</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1 px-2"
                    onClick={() => {
                      const cols = comp.columns || [];
                      updateComponent(idx, "columns", [...cols, { name: "New Column", type: "text" }]);
                    }}
                  >
                    <Plus className="w-3 h-3" /> Add Column
                  </Button>
                </div>
                <div className="space-y-2">
                  {(comp.columns || []).map((col: any, colIdx: number) => (
                    <div key={colIdx} className="flex gap-2 items-center bg-secondary/20 p-2 rounded-lg border border-border/40">
                      <Input
                        value={col.name}
                        onChange={(e) => {
                          const newCols = [...comp.columns];
                          newCols[colIdx].name = e.target.value;
                          updateComponent(idx, "columns", newCols);
                        }}
                        className="h-8 text-xs bg-background flex-1"
                        placeholder="Column Name"
                      />
                      <Select
                        value={col.type}
                        onValueChange={(val) => {
                          const newCols = [...comp.columns];
                          newCols[colIdx].type = val;
                          updateComponent(idx, "columns", newCols);
                        }}
                      >
                        <SelectTrigger className="h-8 w-24 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          const newCols = [...comp.columns];
                          newCols.splice(colIdx, 1);
                          updateComponent(idx, "columns", newCols);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {(!comp.columns || comp.columns.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No columns added yet. Click "Add Column".</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT BUTTON */}
          {comp.type === "payment_button" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Button Label</Label>
                  <Input
                    value={comp.label || ""}
                    onChange={(e) => updateComponent(idx, "label", e.target.value)}
                    placeholder="e.g. Pay Now"
                    className="bg-background"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Amount (Optional)</Label>
                  <Input
                    type="number"
                    value={comp.amount || ""}
                    onChange={(e) => updateComponent(idx, "amount", e.target.value)}
                    placeholder="e.g. 500"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Custom Payment Link (Optional)</Label>
                <Input
                  value={comp.paymentLink || ""}
                  onChange={(e) => updateComponent(idx, "paymentLink", e.target.value)}
                  placeholder="https://... (Leave blank to use internal checkout)"
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description (Optional)</Label>
                <textarea
                  value={comp.description || ""}
                  onChange={(e) => updateComponent(idx, "description", e.target.value)}
                  placeholder="What is this payment for?"
                  className="w-full bg-background border border-border/60 rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* QR CODE */}
          {comp.type === "qr_code" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">QR Code Content (URL or Text)</Label>
                <Input
                  value={comp.content || ""}
                  onChange={(e) => updateComponent(idx, "content", e.target.value)}
                  placeholder="https://your-link.com"
                  className="bg-background"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-[2] space-y-1">
                  <Label className="text-xs">Caption / Title (Optional)</Label>
                  <Input
                    value={comp.title || ""}
                    onChange={(e) => updateComponent(idx, "title", e.target.value)}
                    placeholder="e.g. Scan to view menu"
                    className="bg-background"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Size</Label>
                  <Select
                    value={comp.size?.toString() || "128"}
                    onValueChange={(val) => updateComponent(idx, "size", parseInt(val))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="96">Small</SelectItem>
                      <SelectItem value="128">Medium</SelectItem>
                      <SelectItem value="192">Large</SelectItem>
                      <SelectItem value="256">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* FORM LINK */}
          {comp.type === "form_link" && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-[2] space-y-1">
                  <Label className="text-xs">Select Form</Label>
                  <Select
                    value={comp.content}
                    onValueChange={(val) => updateComponent(idx, "content", val)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms
                        .filter((f: any) => f.is_active)
                        .map((f: any) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Design</Label>
                  <Select
                    value={comp.design || "card"}
                    onValueChange={(val) => updateComponent(idx, "design", val)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Large Card</SelectItem>
                      <SelectItem value="button">Simple Button</SelectItem>
                      <SelectItem value="embedded">Embedded Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {comp.content && comp.design !== "button" && (
                <div className="p-3 border border-primary/20 rounded-lg bg-primary/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/20 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {forms.find((f: any) => f.id === comp.content)?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Auto-generated card</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SPONSOR LOGOS */}
          {comp.type === "sponsor_logos" && (
            <div className="space-y-3">
              <Input
                value={comp.title}
                onChange={(e) => updateComponent(idx, "title", e.target.value)}
                placeholder="Section title (e.g. Our Sponsors)"
                className="bg-background"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {comp.logos?.map((logo: any, logoIdx: number) => (
                  <div
                    key={logoIdx}
                    className="relative group/logo border border-border/60 rounded-md overflow-hidden aspect-video bg-background flex items-center justify-center p-2"
                  >
                    <img src={logo.url} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      onClick={() => {
                        const n = [...comp.logos];
                        n.splice(logoIdx, 1);
                        updateComponent(idx, "logos", n);
                      }}
                      className="absolute top-1 right-1 bg-destructive/90 text-white p-0.5 rounded opacity-0 group-hover/logo:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="relative border-2 border-dashed border-border/60 rounded-md aspect-video flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary transition-colors cursor-pointer">
                  <Plus className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">Add Logo</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        handleImageUpload(e.target.files[0], (url: string) => {
                          updateComponent(idx, "logos", [...(comp.logos || []), { url }]);
                        });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FORM GRID */}
          {comp.type === "form_grid" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-xs text-muted-foreground">Advanced Form Grid</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded px-2 h-8">
                    <Label
                      className="text-[10px] text-muted-foreground cursor-pointer"
                      htmlFor={`bg-${idx}`}
                    >
                      Bg
                    </Label>
                    <Input
                      id={`bg-${idx}`}
                      type="color"
                      value={comp.cardBgColor || "#ffffff"}
                      onChange={(e) => updateComponent(idx, "cardBgColor", e.target.value)}
                      className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded px-2 h-8">
                    <Label
                      className="text-[10px] text-muted-foreground cursor-pointer"
                      htmlFor={`text-${idx}`}
                    >
                      Text
                    </Label>
                    <Input
                      id={`text-${idx}`}
                      type="color"
                      value={comp.cardTextColor || "#000000"}
                      onChange={(e) => updateComponent(idx, "cardTextColor", e.target.value)}
                      className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </div>
                  <Select
                    value={comp.columns || "2"}
                    onValueChange={(val) => updateComponent(idx, "columns", val)}
                  >
                    <SelectTrigger className="w-28 bg-background h-8 text-xs">
                      <SelectValue placeholder="Columns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {comp.cards?.map((card: any, cardIdx: number) => (
                  <div
                    key={card.id || cardIdx}
                    className="bg-background border border-border/60 rounded-xl p-4 relative group/card"
                  >
                    <button
                      onClick={() => {
                        const n = [...comp.cards];
                        n.splice(cardIdx, 1);
                        updateComponent(idx, "cards", n);
                      }}
                      className="absolute top-2 right-2 text-destructive opacity-0 group-hover/card:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                            Link to Form
                          </Label>
                          <Select
                            value={card.formId}
                            onValueChange={(val) => {
                              const n = [...comp.cards];
                              n[cardIdx].formId = val;
                              updateComponent(idx, "cards", n);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Form" />
                            </SelectTrigger>
                            <SelectContent>
                              {forms
                                .filter((f: any) => f.is_active)
                                .map((f: any) => (
                                  <SelectItem key={f.id} value={f.id}>
                                    {f.title}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                            Custom Title
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={card.customTitle || ""}
                            onChange={(e) => {
                              const n = [...comp.cards];
                              n[cardIdx].customTitle = e.target.value;
                              updateComponent(idx, "cards", n);
                            }}
                            placeholder="e.g. VIP Registration"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                            Button Label
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={card.buttonLabel || ""}
                            onChange={(e) => {
                              const n = [...comp.cards];
                              n[cardIdx].buttonLabel = e.target.value;
                              updateComponent(idx, "cards", n);
                            }}
                            placeholder="e.g. Register Now"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                          Bullet Points / Description
                        </Label>
                        <textarea
                          className="w-full h-full min-h-[100px] bg-secondary/30 border border-border/60 rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          value={card.bulletPoints || ""}
                          onChange={(e) => {
                            const n = [...comp.cards];
                            n[cardIdx].bulletPoints = e.target.value;
                            updateComponent(idx, "cards", n);
                          }}
                          placeholder={"• Name\n• Email\n• Ticket Type"}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => {
                    const newCard = {
                      id: Date.now().toString(),
                      formId: "",
                      customTitle: "",
                      bulletPoints: "",
                      buttonLabel: "Register",
                    };
                    updateComponent(idx, "cards", [...(comp.cards || []), newCard]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Form Card
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
