import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pin, PinOff, Trash2, Tag, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceNoteById, updateWorkspaceNote, deleteWorkspaceNote } from "@/api/notes";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TagSelector, type Tag as TagType, TAG_COLORS } from "./components/-TagSelector";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceNotes } from "@/api/notes";
import { lazy, Suspense } from "react";
const BlockNoteEditor = lazy(() => import("./components/-BlockNoteEditor"));

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/notes_/$noteId")({
  component: NoteFullPage,
});

function NoteFullPage() {
  const { workspaceSlug, noteId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;

  const { data: note, isLoading } = useQuery({
    queryKey: ["workspace-note", noteId],
    queryFn: () => getWorkspaceNoteById({ data: { id: noteId } } as any),
  });

  const { data: allNotes = [] } = useQuery({
    queryKey: ["workspace-notes", wsId],
    queryFn: () => getWorkspaceNotes({ data: { workspace_id: wsId! } } as any) as any,
    enabled: !!wsId,
  });

  const DEFAULT_TAGS: TagType[] = [
    { label: "Important", color: TAG_COLORS[4] },
    { label: "Meeting", color: TAG_COLORS[0] },
    { label: "To-Do", color: TAG_COLORS[3] },
    { label: "Idea", color: TAG_COLORS[2] },
    { label: "Project", color: TAG_COLORS[1] },
    { label: "Draft", color: TAG_COLORS[6] },
  ];

  const dbTags = allNotes.flatMap((n: any) => n.tags || []) as TagType[];
  const allTagObjects = [...DEFAULT_TAGS, ...dbTags].filter(
    (t) => typeof t === "object" && t.label,
  );
  const availableTags = Array.from(
    new Map(allTagObjects.map((item) => [item.label, item])).values(),
  );

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; [k: string]: any }) =>
      updateWorkspaceNote({ data: vars } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspaceNote({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Note deleted");
      navigate({ to: `/dashboard/${workspaceSlug}/book/notes` as any });
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<TagType[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
    }
  }, [note]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Note not found</p>
        <Button
          variant="link"
          onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/book/notes` as any })}
        >
          Return to notes
        </Button>
      </div>
    );
  }

  useEffect(() => {
    if (!note || !dirty) return;
    const timeout = setTimeout(() => {
      updateMutation.mutate({ id: note.id, title, content, tags });
      setDirty(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, tags, dirty, note, updateMutation]);

  const handlePin = () => {
    updateMutation.mutate({ id: note.id, pinned: !note.pinned });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(note.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Navigation / Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-secondary/40 rounded-full"
            onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/book/notes` as any })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs text-muted-foreground flex items-center">
            {note.pinned && (
              <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-sm inline-flex mr-3">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            <span>
              Last edited{" "}
              {new Date(note.updated_at || note.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {updateMutation.isPending ? (
              <span className="flex items-center gap-1 text-muted-foreground/60 ml-4">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            ) : dirty ? (
              <span className="text-muted-foreground/60 ml-4 italic">Saving soon...</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePin}>
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <input
        className="text-4xl md:text-5xl font-extrabold bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/30 mb-6"
        placeholder="Untitled"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
      />

      <div className="mb-8">
        <TagSelector
          tags={tags}
          onChange={(newTags) => {
            setTags(newTags);
            setDirty(true);
          }}
          availableTags={availableTags}
        />
      </div>

      <div className="flex-1 -mx-10 mt-4 relative z-10">
        <Suspense
          fallback={
            <div className="h-full min-h-[300px] animate-pulse bg-muted/10 rounded-xl mx-4" />
          }
        >
          <BlockNoteEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              setDirty(true);
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
