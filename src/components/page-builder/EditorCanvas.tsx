import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Trash2, Plus } from "lucide-react";
import { ComponentBlock } from "./ComponentBlock";
import { PageSettingsPanel } from "./PageSettingsPanel";

export function EditorCanvas({
  addComponent,
  editorState,
  set,
  handleImageUpload,
  forms,
  allPages,
  workspace_id,
  updateComponent,
  removeComponent,
  moveComponent,
}: any) {
  return (
    <div className="p-4 md:p-6 bg-background/50 w-full relative">
      <div className="flex flex-col md:flex-row items-start gap-6 max-w-[1400px] mx-auto">
        {/* ─── Builder Canvas ───────────────────────────────────── */}
        <div className="flex-1 space-y-5 min-w-0">
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
            {/* Hero Header */}
            <div
              className={`relative h-[400px] bg-secondary flex flex-col p-8 transition-all ${
                editorState.heroAlign === "top-left"
                  ? "justify-start items-start text-left"
                  : editorState.heroAlign === "top-center"
                    ? "justify-start items-center text-center"
                    : editorState.heroAlign === "top-right"
                      ? "justify-start items-end text-right"
                      : editorState.heroAlign === "center-left"
                        ? "justify-center items-start text-left"
                        : editorState.heroAlign === "center"
                          ? "justify-center items-center text-center"
                          : editorState.heroAlign === "center-right"
                            ? "justify-center items-end text-right"
                            : editorState.heroAlign === "bottom-left"
                              ? "justify-end items-start text-left"
                              : editorState.heroAlign === "bottom-center"
                                ? "justify-end items-center text-center"
                                : "justify-end items-end text-right"
              }`}
            >
              {editorState.headerImageUrl ? (
                <img
                  src={editorState.headerImageUrl}
                  alt="Header"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-primary/5">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                  <span className="text-sm">Add Hero Cover Image</span>
                </div>
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: editorState.heroOverlayColor || "#000000",
                  opacity: (editorState.heroOverlayOpacity ?? 40) / 100,
                }}
              />

              {/* Top Right Controls */}
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <div className="bg-card/90 backdrop-blur border border-border/50 rounded-md flex items-center p-1 shadow-sm gap-1">
                  <div className="flex flex-col gap-1 pr-2 border-r border-border/50">
                    <span className="text-[9px] font-bold text-muted-foreground px-1 uppercase leading-none">
                      Align
                    </span>
                    <div className="grid grid-cols-3 gap-0.5 px-1">
                      {[
                        "top-left",
                        "top-center",
                        "top-right",
                        "center-left",
                        "center",
                        "center-right",
                        "bottom-left",
                        "bottom-center",
                        "bottom-right",
                      ].map((align) => (
                        <button
                          key={align}
                          onClick={() => set("heroAlign")(align)}
                          className={`w-3 h-3 rounded-[2px] transition-all ${editorState.heroAlign === align ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
                          title={align}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-2 border-r border-border/50">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                      Overlay
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={editorState.heroOverlayColor || "#000000"}
                        onChange={(e) => set("heroOverlayColor")(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editorState.heroOverlayOpacity ?? 40}
                        onChange={(e) => set("heroOverlayOpacity")(Number(e.target.value))}
                        className="w-12 h-1 accent-primary"
                      />
                    </div>
                  </div>
                  <div className="px-1 flex gap-1 border-r border-border/50 pr-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            if (e.target.files[0].size > 5 * 1024 * 1024)
                              return alert("File too large (max 5MB)");
                            handleImageUpload(e.target.files[0], set("headerImageUrl"));
                          }
                        }}
                      />
                      <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 flex items-center px-2 rounded-sm text-[10px] font-medium">
                        <ImageIcon className="w-3 h-3 mr-1" /> Bg Cover
                      </div>
                    </label>
                    {editorState.headerImageUrl && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-sm"
                        onClick={() => set("headerImageUrl")("")}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="px-1 flex gap-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            if (e.target.files[0].size > 5 * 1024 * 1024)
                              return alert("File too large (max 5MB)");
                            handleImageUpload(e.target.files[0], set("heroForegroundImageUrl"));
                          }
                        }}
                      />
                      <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 flex items-center px-2 rounded-sm text-[10px] font-medium">
                        <ImageIcon className="w-3 h-3 mr-1" /> Foreground
                      </div>
                    </label>
                    {editorState.heroForegroundImageUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] bg-black/20 text-white rounded-sm hover:bg-black/40"
                          onClick={() =>
                            set("heroForegroundPosition")(
                              editorState.heroForegroundPosition === "left" ? "right" : "left",
                            )
                          }
                        >
                          {editorState.heroForegroundPosition === "left" ? "Img Left" : "Img Right"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-sm"
                          onClick={() => set("heroForegroundImageUrl")("")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`relative z-10 w-full max-w-5xl mx-auto flex items-center gap-8 ${
                  editorState.heroForegroundImageUrl &&
                  editorState.heroForegroundPosition === "left"
                    ? "flex-row-reverse"
                    : ""
                }`}
              >
                <div
                  className={`flex flex-col space-y-3 flex-1 ${
                    editorState.heroAlign?.includes("left")
                      ? "items-start text-left"
                      : editorState.heroAlign?.includes("right")
                        ? "items-end text-right"
                        : "items-center text-center"
                  }`}
                >
                  <Input
                    value={editorState.title}
                    onChange={(e) => set("title")(e.target.value)}
                    placeholder="Hero Title (e.g. Welcome to Acme)"
                    className={`text-3xl md:text-5xl font-bold bg-transparent border-transparent text-white placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20 px-2 h-auto py-1 w-full ${
                      editorState.heroAlign?.includes("left")
                        ? "text-left"
                        : editorState.heroAlign?.includes("right")
                          ? "text-right"
                          : "text-center"
                    }`}
                  />
                  <textarea
                    value={editorState.description}
                    onChange={(e) => set("description")(e.target.value)}
                    placeholder="Hero subtitle or description..."
                    className={`w-full text-lg bg-transparent border-transparent text-white/90 placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20 resize-none rounded-md p-2 outline-none focus:ring-1 focus:ring-white/30 ${
                      editorState.heroAlign?.includes("left")
                        ? "text-left"
                        : editorState.heroAlign?.includes("right")
                          ? "text-right"
                          : "text-center"
                    }`}
                    rows={2}
                  />

                  <div
                    className={`flex flex-wrap items-center gap-2 mt-4 bg-black/40 p-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors`}
                  >
                    <Input
                      value={editorState.heroButtonText || ""}
                      onChange={(e) => set("heroButtonText")(e.target.value)}
                      placeholder="Button Text"
                      className="h-8 bg-transparent border-white/20 text-white placeholder:text-white/50 w-[140px]"
                    />
                    <select
                      value={editorState.heroButtonActionType || "url"}
                      onChange={(e) => {
                        set("heroButtonActionType")(e.target.value);
                        set("heroButtonLink")("");
                      }}
                      className="h-8 bg-black/50 text-white text-xs border border-white/20 rounded-md px-2 outline-none"
                    >
                      <option value="url">Custom Link</option>
                      <option value="page">Internal Page</option>
                      <option value="form">Form / Pay</option>
                      <option value="phone">Phone Call</option>
                    </select>

                    {editorState.heroButtonActionType === "page" ? (
                      <select
                        value={editorState.heroButtonLink || ""}
                        onChange={(e) => set("heroButtonLink")(e.target.value)}
                        className="h-8 bg-transparent border border-white/20 text-white placeholder:text-white/50 w-[160px] text-xs rounded-md px-2 outline-none"
                      >
                        <option value="" className="text-black">
                          Select Page...
                        </option>
                        {allPages?.map((p: any) => (
                          <option key={p.id} value={`/p/${p.slug}`} className="text-black">
                            {p.title || p.slug}
                          </option>
                        ))}
                      </select>
                    ) : editorState.heroButtonActionType === "form" ? (
                      <select
                        value={editorState.heroButtonLink || ""}
                        onChange={(e) => set("heroButtonLink")(e.target.value)}
                        className="h-8 bg-transparent border border-white/20 text-white placeholder:text-white/50 w-[160px] text-xs rounded-md px-2 outline-none"
                      >
                        <option value="" className="text-black">
                          Select Form...
                        </option>
                        {forms
                          ?.filter((f: any) => f.is_active)
                          .map((f: any) => (
                            <option key={f.id} value={`#form-${f.id}`} className="text-black">
                              {f.title}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <Input
                        value={editorState.heroButtonLink || ""}
                        onChange={(e) => set("heroButtonLink")(e.target.value)}
                        placeholder={
                          editorState.heroButtonActionType === "phone"
                            ? "+1234567890"
                            : "https://..."
                        }
                        className="h-8 bg-transparent border-white/20 text-white placeholder:text-white/50 w-[160px]"
                      />
                    )}
                  </div>
                </div>

                {editorState.heroForegroundImageUrl && (
                  <div className="flex-1 hidden md:block relative h-64 border-2 border-dashed border-white/30 rounded-xl bg-black/20 overflow-hidden">
                    <img
                      src={editorState.heroForegroundImageUrl}
                      alt="Foreground"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Components */}
            <div className="p-5 space-y-4">
              {editorState.components.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                  <Plus className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">
                    Add blocks from the panel on the right to build your page.
                  </p>
                </div>
              )}

              {editorState.components.map((comp: any, idx: number) => (
                <ComponentBlock
                  key={comp.id}
                  comp={comp}
                  idx={idx}
                  forms={forms}
                  workspace_id={workspace_id}
                  updateComponent={updateComponent}
                  removeComponent={removeComponent}
                  moveComponent={moveComponent}
                  handleImageUpload={handleImageUpload}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < editorState.components.length - 1}
                  eventId={undefined}
                  themeColor={editorState.themeColor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Settings + Toolbox Panel ─────────────────────────── */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 md:sticky top-6 md:top-20 md:max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide rounded-xl">
          <PageSettingsPanel
            addComponent={addComponent}
            editorState={editorState}
            set={set}
            handleImageUpload={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
