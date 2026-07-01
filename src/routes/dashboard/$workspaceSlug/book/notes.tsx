import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Pin,
  PinOff,
  Trash2,
  Search,
  StickyNote,
  Loader2,
  X,
  Tag,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceNotes,
  createWorkspaceNote,
  updateWorkspaceNote,
  deleteWorkspaceNote,
} from "@/api/notes";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TagSelector, type Tag as TagType, TAG_COLORS } from "./components/-TagSelector";
import { lazy, Suspense } from "react";
const BlockNoteEditor = lazy(() => import("./components/-BlockNoteEditor"));

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/notes")({
  component: NotesPage,
});

function NotesPage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.id });

  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState<TagType[]>([]);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["workspace-notes", wsId],
    queryFn: () => getWorkspaceNotes({ data: { workspace_id: wsId! } } as any) as any,
    enabled: !!wsId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createWorkspaceNote({
        data: {
          workspace_id: wsId,
          title: draftTitle || "Untitled Note",
          content: draftContent,
          pinned: false,
          tags: draftTags,
        },
      } as any),
    onSuccess: () => {
      toast.success("Note saved!");
      setIsCreating(false);
      setDraftTitle("");
      setDraftContent("");
      setDraftTags([]);
      queryClient.invalidateQueries({ queryKey: ["workspace-notes", wsId] });
    },
    onError: () => toast.error("Failed to save note"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; [k: string]: any }) =>
      updateWorkspaceNote({ data: vars } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-notes", wsId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspaceNote({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Note deleted");
      if (activeNote) setActiveNote(null);
      queryClient.invalidateQueries({ queryKey: ["workspace-notes", wsId] });
    },
  });

  const filtered = (notes as any[]).filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const pinned = filtered.filter((n: any) => n.pinned);
  const unpinned = filtered.filter((n: any) => !n.pinned);

  const handleExpand = (id: string) => {
    setActiveNote(null);
    navigate({ to: `./${id}` as any });
  };

  const DEFAULT_TAGS: TagType[] = [
    { label: "Important", color: TAG_COLORS[4] },
    { label: "Meeting", color: TAG_COLORS[0] },
    { label: "To-Do", color: TAG_COLORS[3] },
    { label: "Idea", color: TAG_COLORS[2] },
    { label: "Project", color: TAG_COLORS[1] },
    { label: "Draft", color: TAG_COLORS[6] },
  ];

  const dbTags = notes.flatMap((n: any) => n.tags || []) as TagType[];
  const allTagObjects = [...DEFAULT_TAGS, ...dbTags].filter((t) => typeof t === "object" && t.label);
  const availableTags = Array.from(new Map(allTagObjects.map(item => [item.label, item])).values());

  return (
    <div className="pb-16 max-w-6xl mx-auto space-y-6">
      {/* ── Top Bar ──────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Workspace-wide documents & ideas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-9 rounded-xl h-10 bg-secondary/50 border-transparent focus:border-border/60"
            />
          </div>
          <Button
            className="rounded-xl h-10 gap-2 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            onClick={() => { setIsCreating(true); setActiveNote(null); }}
          >
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-10">
          {pinned.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Pin className="h-4 w-4" /> Pinned
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinned.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => setActiveNote(note)}
                    onPin={() => updateMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  />
                ))}
              </div>
            </section>
          )}

          {unpinned.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <StickyNote className="h-4 w-4" /> All Notes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinned.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => setActiveNote(note)}
                    onPin={() => updateMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  />
                ))}
              </div>
            </section>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-muted-foreground gap-4 border border-dashed border-border/60 rounded-3xl">
              <StickyNote className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No notes found.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs: Peek view & Create view ──────────────── */}
      
      <Dialog open={!!activeNote} onOpenChange={(open) => !open && setActiveNote(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none h-[85vh]">
          <DialogTitle className="sr-only">Note Dialog</DialogTitle>
          <div className="bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col h-full w-full">
            {activeNote && (
              <NoteEditor
                note={activeNote}
                availableTags={availableTags}
                onExpand={() => handleExpand(activeNote.id)}
                onSave={(data: any) => {
                  updateMutation.mutate({ id: activeNote.id, ...data });
                  setActiveNote({ ...activeNote, ...data });
                }}
                onDelete={() => { deleteMutation.mutate(activeNote.id); setActiveNote(null); }}
                onPin={() => {
                  updateMutation.mutate({ id: activeNote.id, pinned: !activeNote.pinned });
                  setActiveNote({ ...activeNote, pinned: !activeNote.pinned });
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none h-[85vh]">
          <DialogTitle className="sr-only">New Note Dialog</DialogTitle>
          <div className="bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col h-full w-full">
            <div className="flex flex-col h-full px-10 py-10 w-full overflow-y-auto">
              <input
                placeholder="Untitled Note"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="text-4xl md:text-5xl font-extrabold bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/30 mb-6"
              />
              
              <div className="mb-8 border-b border-border/40 pb-4">
                <TagSelector
                  tags={draftTags}
                  onChange={setDraftTags}
                  availableTags={availableTags}
                />
              </div>

              <div className="flex-1 min-h-[300px] -mx-8 relative z-10">
                <Suspense fallback={<div className="h-full min-h-[300px] animate-pulse bg-muted/10 rounded-xl mx-4" />}>
                  <BlockNoteEditor value={draftContent} onChange={setDraftContent} />
                </Suspense>
              </div>
              
              <div className="pt-6 mt-auto">
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="rounded-lg px-6 h-10 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function NoteCard({ note, onClick, onPin }: any) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border/50 rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-48 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-bold text-lg leading-tight line-clamp-2">
          {note.title || "Untitled"}
        </h4>
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className={cn("p-1.5 rounded-lg text-muted-foreground hover:bg-secondary", note.pinned && "text-primary opacity-100")}
        >
          {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
        {note.content ? note.content.replace(/<[^>]+>/g, '') : "Empty note..."}
      </p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
        <span className="text-xs text-muted-foreground">
          {new Date(note.updated_at || note.created_at).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric"
          })}
        </span>
        {note.tags?.length > 0 && (
          <div className="flex gap-1 overflow-hidden">
            {note.tags.slice(0, 2).map((tag: TagType) => (
              <span key={tag.label} className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap", tag.color)}>
                {tag.label}
              </span>
            ))}
            {note.tags.length > 2 && <span className="text-[10px] text-muted-foreground px-1">+{note.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ note, onSave, onDelete, onPin, onExpand, availableTags }: any) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tags, setTags] = useState<TagType[]>(note.tags || []);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="flex flex-col h-full w-full px-10 py-10 overflow-y-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-8 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 group">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={onExpand}>
            <Maximize2 className="h-3 w-3" /> Open as Page
          </Button>
          {note.pinned && (
            <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-sm ml-2">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {dirty && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-primary hover:bg-primary/10 mr-2"
              onClick={() => { onSave({ title, content, tags }); setDirty(false); }}
            >
              Save Changes
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPin}>
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        className="text-4xl md:text-5xl font-extrabold bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/30 mb-6"
        placeholder="Untitled"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
      />
      
      <div className="mb-8">
        <TagSelector
          tags={tags}
          onChange={(newTags) => { setTags(newTags); setDirty(true); }}
          availableTags={availableTags}
        />
      </div>
      
      <div className="flex-1 -mx-10 mt-4 relative z-10">
        <Suspense fallback={<div className="h-full min-h-[300px] animate-pulse bg-muted/10 rounded-xl mx-4" />}>
          <BlockNoteEditor
            value={content}
            onChange={(val) => { setContent(val); setDirty(true); }}
          />
        </Suspense>
      </div>
    </div>
  );
}
