import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Camera, Loader2, Check, Instagram, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEventById, updateEvent } from "@/api/events";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

function extractInstagramUsername(input: string) {
  if (!input) return "";
  try {
    if (input.includes("instagram.com")) {
      const urlString = input.startsWith("http") ? input : `https://${input}`;
      const url = new URL(urlString);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[0];
      }
    }
  } catch (e) {}
  return input.replace(/^@/, "").split("?")[0].replace(/\/$/, "").trim();
}

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/lineup")({
  component: LineupPage,
});

function LineupPage() {
  const { eventId } = Route.useParams();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const [lineup, setLineup] = useState<any[]>([]);

  useEffect(() => {
    if (!event) return;
    setLineup(Array.isArray(event.lineup) ? event.lineup : []);
  }, [event]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const processedLineup = await Promise.all(
        lineup.map(async (member) => {
          if (member.avatarFile) {
            const url = await uploadFileToStorage(member.avatarFile, "events/lineup");
            return { ...member, avatarUrl: url, avatarFile: undefined };
          }
          return member;
        }),
      );

      // We need to keep the other event data intact when updating just the lineup
      return updateEvent({
        data: {
          id: eventId,
          title: event.title,
          category: event.category,
          description: event.description,
          cover: event.cover,
          tour_stops: event.tour_stops,
          vipPerks: event.vipPerks,
          event_requency: event.event_requency || {},
          allowed_public: event.allowed_public,
          lineup: processedLineup,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Lineup updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-events"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update lineup");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lineup & Speakers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the artists, speakers, or DJs for this event.
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="rounded-full shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Save Lineup
            </>
          )}
        </Button>
      </div>

      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" /> Members
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() =>
              setLineup([
                ...lineup,
                { id: generateId(), name: "", role: "", instagram: "", avatarUrl: "" },
              ])
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Member
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lineup.map((member: any, idx: number) => (
            <div
              key={member.id || idx}
              className="rounded-2xl border border-border/60 bg-secondary/10 p-4 space-y-4 relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full text-muted-foreground hover:text-red-500"
                onClick={() => setLineup(lineup.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="flex flex-col items-center gap-3">
                <label className="relative block h-20 w-20 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border bg-background hover:border-primary">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const n = [...lineup];
                      n[idx] = { ...n[idx], avatarFile: f, avatarUrl: URL.createObjectURL(f) };
                      setLineup(n);
                    }}
                  />
                </label>
                <div className="w-full space-y-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => {
                        const n = [...lineup];
                        n[idx] = { ...n[idx], name: e.target.value };
                        setLineup(n);
                      }}
                      placeholder="John Doe"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input
                      value={member.role}
                      onChange={(e) => {
                        const n = [...lineup];
                        n[idx] = { ...n[idx], role: e.target.value };
                        setLineup(n);
                      }}
                      placeholder="Guest Speaker, DJ..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <Instagram className="h-3 w-3" /> Instagram Handle or Link
                    </Label>
                    <Input
                      value={member.instagram}
                      onChange={(e) => {
                        const n = [...lineup];
                        n[idx] = { ...n[idx], instagram: e.target.value };
                        setLineup(n);
                      }}
                      onBlur={(e) => {
                        const n = [...lineup];
                        n[idx] = { ...n[idx], instagram: extractInstagramUsername(e.target.value) };
                        setLineup(n);
                      }}
                      placeholder="@handle or profile link"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lineup.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            No lineup members added yet. Add speakers, artists, or DJs to display them on your event
            page!
          </div>
        )}
      </div>
    </div>
  );
}
