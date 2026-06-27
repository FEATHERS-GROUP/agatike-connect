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
  workspace_id,
  updateComponent,
  removeComponent,
  moveComponent,
}: any) {
  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* ─── Settings + Toolbox Panel ─────────────────────────── */}
        <PageSettingsPanel
          addComponent={addComponent}
          editorState={editorState}
          set={set}
          handleImageUpload={handleImageUpload}
        />

        {/* ─── Builder Canvas ───────────────────────────────────── */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
            {/* Hero Header */}
            <div className="relative h-72 bg-secondary flex flex-col items-center justify-center text-center p-6">
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
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              <div className="absolute top-3 right-3 z-20 flex gap-2">
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
                  <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 flex items-center px-3 rounded-md text-xs">
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Change Cover
                  </div>
                </label>
                {editorState.headerImageUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => set("headerImageUrl")("")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="relative z-10 w-full max-w-2xl mx-auto space-y-3">
                <Input
                  value={editorState.title}
                  onChange={(e) => set("title")(e.target.value)}
                  placeholder="Hero Title (e.g. Welcome to Acme)"
                  className="text-2xl md:text-4xl font-bold text-center bg-transparent border-transparent text-white placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20"
                />
                <textarea
                  value={editorState.description}
                  onChange={(e) => set("description")(e.target.value)}
                  placeholder="Hero subtitle or description..."
                  className="w-full text-base text-center bg-transparent border-transparent text-white/90 placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20 resize-none rounded-md p-2 outline-none focus:ring-1 focus:ring-white/30"
                  rows={2}
                />
              </div>
            </div>

            {/* Components */}
            <div className="p-5 space-y-4">
              {editorState.components.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                  <Plus className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">
                    Add blocks from the panel on the left to build your page.
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
      </div>
    </div>
  );
}
