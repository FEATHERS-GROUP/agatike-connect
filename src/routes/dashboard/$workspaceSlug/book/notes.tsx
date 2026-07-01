import { createFileRoute, useParams } from "@tanstack/react-router";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/notes")({
  component: NotesPage,
});

const TAG_COLORS = [
  "bg-blue-500/15 text-blue-600",
  "bg-purple-500/15 text-purple-600",
  "bg-green-500/15 text-green-700",
  "bg-amber-500/15 text-amber-700",
  "bg-rose-500/15 text-rose-600",
  "bg-cyan-500/15 text-cyan-700",
];

function tagColor(tag: string) {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function NotesPage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");

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
          tags: draftTags
            ? draftTags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        },
      } as any),
    onSuccess: () => {
      toast.success("Note saved!");
      setIsCreating(false);
      setDraftTitle("");
      setDraftContent("");
      setDraftTags("");
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

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)] pb-4 -mx-2">
      {/* ── Left panel: note list ──────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-4 border-r border-border/40 pr-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-8 rounded-lg h-9 bg-secondary/40 border-transparent focus:border-border/60 shadow-none text-sm transition-all"
            />
          </div>
          <Button
            size="icon"
            className="h-9 w-9 rounded-lg shrink-0"
            variant="outline"
            onClick={() => { setIsCreating(true); setActiveNote(null); }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {pinned.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5 flex items-center gap-1.5">
                <Pin className="h-3 w-3" /> Pinned
              </p>
              {pinned.map((note: any) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onClick={() => { setActiveNote(note); setIsCreating(false); }}
                  onPin={() => updateMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  onDelete={() => deleteMutation.mutate(note.id)}
                />
              ))}
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5 flex items-center gap-1.5 mt-2">
                  <StickyNote className="h-3 w-3" /> All Notes
                </p>
              )}
              {unpinned.map((note: any) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onClick={() => { setActiveNote(note); setIsCreating(false); }}
                  onPin={() => updateMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  onDelete={() => deleteMutation.mutate(note.id)}
                />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">No notes found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: note editor / create ─────────────── */}
      <div className="flex-1 flex flex-col pl-4">
        {isCreating ? (
          <div className="flex flex-col h-full max-w-3xl w-full mx-auto py-8">
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsCreating(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <input
              placeholder="Untitled"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="text-4xl font-extrabold bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/30 mb-6"
            />
            
            <div className="flex items-center gap-2 mb-8 border-b border-border/40 pb-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add tags (comma separated)"
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                className="h-8 rounded-md text-sm border-0 bg-transparent shadow-none px-1 placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
            </div>

            <textarea
              placeholder="Start writing..."
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="flex-1 resize-none bg-transparent text-base leading-relaxed focus:outline-none placeholder:text-muted-foreground/30"
            />
            
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
        ) : activeNote ? (
          <NoteEditor
            note={activeNote}
            onSave={(data: any) => {
              updateMutation.mutate({ id: activeNote.id, ...data });
              setActiveNote({ ...activeNote, ...data });
            }}
            onDelete={() => deleteMutation.mutate(activeNote.id)}
            onPin={() => {
              updateMutation.mutate({ id: activeNote.id, pinned: !activeNote.pinned });
              setActiveNote({ ...activeNote, pinned: !activeNote.pinned });
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4">
            <StickyNote className="h-16 w-16 opacity-10" />
            <p className="text-sm font-medium">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteListItem({ note, isActive, onClick, onPin, onDelete }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-lg px-3 py-2 cursor-pointer transition-colors flex items-start gap-2",
        isActive ? "bg-secondary/60 text-foreground font-medium" : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{note.title || "Untitled"}</p>
        {note.content && (
          <p className="text-xs truncate opacity-70 mt-0.5">{note.content}</p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary">
          {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-secondary">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NoteEditor({ note, onSave, onDelete, onPin }: any) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [dirty, setDirty] = useState(false);

  return (
    <div className="flex flex-col h-full max-w-3xl w-full mx-auto py-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-8 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 group">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {note.pinned && (
            <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <span>
            Last edited{" "}
            {new Date(note.updated_at || note.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {dirty && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => { onSave({ title, content }); setDirty(false); }}
            >
              Save Changes
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPin}>
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
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
      
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {note.tags.map((tag: string) => (
            <span key={tag} className={cn("text-xs px-2 py-0.5 rounded-md font-medium", tagColor(tag))}>
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <textarea
        className="flex-1 bg-transparent resize-none text-base leading-relaxed outline-none placeholder:text-muted-foreground/30 font-sans"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); }}
      />
    </div>
  );
}
