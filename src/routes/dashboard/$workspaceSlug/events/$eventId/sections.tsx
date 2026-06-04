import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getEventSections, createEventSection } from "@/api/staff";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/sections")({
  component: EventSectionsView,
});

function AddSectionModal({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await createEventSection({
        data: {
          event_id: eventId,
          name,
          description,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Section created successfully");
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["event-sections", eventId] });
    },
    onError: () => toast.error("Failed to create section"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event Section</DialogTitle>
          <DialogDescription>
            Define an area (e.g. VIP Lounge, General Admission) to map tickets and staff to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Section Name</Label>
            <Input
              placeholder="e.g. VIP Main Stage"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!name) return toast.error("Name required");
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Section
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventSectionsView() {
  const { eventId } = Route.useParams();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["event-sections", eventId],
    queryFn: async () => {
      try {
        return await getEventSections({ data: { event_id: eventId } } as any);
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="max-w-5xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event Sections</h1>
          <p className="text-sm text-muted-foreground">
            Manage your physical event areas. Link them to the venue map, ticket types, and staff
            badges.
          </p>
        </div>
        <AddSectionModal eventId={eventId} />
      </header>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sections.map((s: any) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">
                {s.description || "No specific details provided for this section."}
              </p>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
                <span>ID: {s.id.substring(0, 8)}</span>
                <span className="bg-secondary px-2 py-1 rounded-md">Ticket Linked: No</span>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed rounded-[2rem] text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">No sections created yet</h3>
              <p>Create your first section to start mapping tickets and staff.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
