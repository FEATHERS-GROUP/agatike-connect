import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Crown,
  Loader2,
  Check,
  Users,
  Instagram,
  Camera,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getEventById, updateEvent } from "@/api/events";
import { getWorkspaceVipPrivileges } from "@/api/vip";
import { getPlacesAutocomplete, getPlaceDetails } from "@/api/geocoding";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { TicketEditor, Ticket } from "@/components/desktop/TicketEditor";

// Stubbed mock data
const categories: any[] = [];

function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/edit")({
  component: EditEventPage,
});

// ── Inline address autocomplete ───────────────────────────────────────────────
export function AddressInput({
  value,
  onChange,
  onSelectCoords,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelectCoords: (lat: string, lng: string) => void;
}) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={async (e) => {
          const val = e.target.value;
          onChange(val);
          if (val.trim().length < 3) {
            setPredictions([]);
            setIsOpen(false);
            return;
          }
          setIsOpen(true);
          setIsLoading(true);
          try {
            const results = await getPlacesAutocomplete({ data: val } as any);
            setPredictions(Array.isArray(results) ? results : []);
          } catch {
            setPredictions([]);
          } finally {
            setIsLoading(false);
          }
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder="Plot 1415 Adetokunbo Ademola Street..."
        className="mt-1"
      />
      {isOpen && (predictions.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-popover shadow-md">
          {isLoading && predictions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
          )}
          {predictions.map((p) => (
            <div
              key={p.place_id}
              className="cursor-pointer px-4 py-3 text-sm hover:bg-accent"
              onMouseDown={async () => {
                onChange(p.description);
                setIsOpen(false);
                try {
                  const coords = await getPlaceDetails({ data: p.place_id } as any);
                  if (coords?.lat && coords?.lng) onSelectCoords(coords.lat, coords.lng);
                } catch {}
              }}
            >
              {p.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function EditEventPage() {
  const { eventId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const [form, setForm] = useState({
    title: "",
    category: categories[0],
    description: "",
    vipPerks: "",
    locations: [] as any[],
    coverPreview: "",
    allowed_public: false,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sameTicketsForAllLocations, setSameTicketsForAllLocations] = useState(true);
  const [activeTourStopIdx, setActiveTourStopIdx] = useState(0);

  // Additional Queries
  const { data: vipPrivileges = [] } = useQuery({
    queryKey: ["vip_privileges", activeWorkspace?.id],
    queryFn: () => getWorkspaceVipPrivileges({ data: { workspace_id: activeWorkspace!.id } } as any),
    enabled: !!activeWorkspace,
  });

  // Reusing a stub or actual getWorkspaceForms call if available
  // Here we'll fallback to empty array since getWorkspaceForms doesn't exist in events.ts yet
  // We'll stub forms for now.
  const forms: any[] = [];

  // Populate form once event loads
  useEffect(() => {
    if (!event) return;
    setForm({
      title: event.title || "",
      category: event.category || categories[0],
      description: event.description || "",
      vipPerks: event.vipPerks || "",
      locations:
        Array.isArray(event.tour_stops) && event.tour_stops.length > 0
          ? event.tour_stops
          : [
              {
                id: generateId(),
                venue: "",
                city: "",
                address: "",
                date: "",
                time: "",
                latitude: null,
                longitude: null,
              },
            ],
      coverPreview: event.cover || "",
      allowed_public: !!event.allowed_public,
    });

    if (event.event_tickets) {
      setTickets(
        event.event_tickets.map((t: any) => ({
          ...t,
          name: t.name || t.type, // Fallback to type if name was null (old data)
          type: t.name ? t.type : (Number(t.cost) === 0 ? "free" : "paid"), // Deduce type for old data
          price: Number(t.cost || 0),
          quantity: Number(t.remaining || 0) + Number(t.sold || 0),
        }))
      );
    }
  }, [event]);

  const updateField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      let coverUrl = form.coverPreview;
      if (coverFile) {
        coverUrl = await uploadFileToStorage(coverFile, "events/covers");
      }
      return updateEvent({
        data: {
          id: eventId,
          title: form.title,
          category: form.category,
          description: form.description,
          cover: coverUrl,
          tour_stops: form.locations,
          vipPerks: form.vipPerks,
          event_requency: event?.event_requency || {},
          allowed_public: form.allowed_public,
          event_tickets: {
            data: tickets.map((t) => ({
              ...t,
              name: t.name,
              type: t.type,
              cost: String(t.price),
              remaining: String(t.quantity),
            })),
          },
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-events"] });
      navigate({
        to: "/dashboard/$workspaceSlug/events/$eventId",
        params: { workspaceSlug: workspaceSlug || "", eventId: eventId || "" },
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update event");
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() =>
            navigate({
              to: "/dashboard/$workspaceSlug/events/$eventId",
              params: { workspaceSlug: workspaceSlug || "", eventId: eventId || "" },
            })
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Edit Event</h1>
          <p className="text-sm text-muted-foreground">Update your event information</p>
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
              <Check className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Cover Image */}
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <h2 className="font-semibold text-lg">Cover Image</h2>
        <label
          className="block aspect-[16/7] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          {form.coverPreview ? (
            <img src={form.coverPreview} alt="cover" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 mb-2" />
                <p>Click to upload a new cover image</p>
              </div>
            </div>
          )}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setCoverFile(f);
            updateField("coverPreview", URL.createObjectURL(f));
          }}
        />
        {form.coverPreview && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Change Image
          </Button>
        )}
      </div>

      {/* Basic Details */}
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Basic Details</h2>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <Label className="text-sm font-semibold">Public Event</Label>
              <p className="text-xs text-muted-foreground">List on explore page</p>
            </div>
            <Switch
              checked={form.allowed_public}
              onCheckedChange={(checked) => updateField("allowed_public", checked)}
            />
          </div>
        </div>
        <div>
          <Label>Event Title</Label>
          <Input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="mt-1"
            placeholder="Afrobeats Night Live"
          />
        </div>
        <div>
          <Label>Category</Label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="mt-1 flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:border-primary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={5}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Locations / Tour Stops */}
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Locations</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() =>
              updateField("locations", [
                ...form.locations,
                {
                  id: generateId(),
                  venue: "",
                  city: "",
                  address: "",
                  date: "",
                  time: "",
                  latitude: null,
                  longitude: null,
                },
              ])
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Location
          </Button>
        </div>
        {form.locations.map((loc: any, idx: number) => (
          <div
            key={loc.id || idx}
            className="rounded-2xl border border-border/60 bg-secondary/10 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {form.locations.length > 1 ? `Stop ${idx + 1}` : "Location"}
              </p>
              {form.locations.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500"
                  onClick={() =>
                    updateField(
                      "locations",
                      form.locations.filter((_: any, i: number) => i !== idx),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Venue Name</Label>
                <Input
                  value={loc.venue}
                  onChange={(e) => {
                    const n = [...form.locations];
                    n[idx] = { ...n[idx], venue: e.target.value };
                    updateField("locations", n);
                  }}
                  placeholder="Club Kigali"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={loc.city}
                  onChange={(e) => {
                    const n = [...form.locations];
                    n[idx] = { ...n[idx], city: e.target.value };
                    updateField("locations", n);
                  }}
                  placeholder="Kigali, RW"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={loc.date}
                  onChange={(e) => {
                    const n = [...form.locations];
                    n[idx] = { ...n[idx], date: e.target.value };
                    updateField("locations", n);
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={loc.time}
                  onChange={(e) => {
                    const n = [...form.locations];
                    n[idx] = { ...n[idx], time: e.target.value };
                    updateField("locations", n);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <AddressInput
                value={loc.address}
                onChange={(val) => {
                  const n = [...form.locations];
                  n[idx] = { ...n[idx], address: val };
                  updateField("locations", n);
                }}
                onSelectCoords={(lat, lng) => {
                  const n = [...form.locations];
                  n[idx] = { ...n[idx], latitude: lat, longitude: lng };
                  updateField("locations", n);
                  toast.success("Location coordinates captured!");
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">Tickets</h2>
            <p className="text-sm text-muted-foreground">Manage tickets and assign VIP Privileges</p>
          </div>
        </div>
        <TicketEditor
          tickets={tickets}
          setTickets={setTickets}
          currencySymbol={activeWorkspace?.currency || "$"}
          locations={form.locations}
          sameTicketsForAllLocations={sameTicketsForAllLocations}
          setSameTicketsForAllLocations={setSameTicketsForAllLocations}
          activeTourStopIdx={activeTourStopIdx}
          setActiveTourStopIdx={setActiveTourStopIdx}
          forms={forms}
          vipPrivileges={vipPrivileges}
        />
      </div>

      {/* VIP Perks */}
      <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" /> VIP Perks
        </h2>
        <Textarea
          rows={4}
          value={form.vipPerks}
          onChange={(e) => updateField("vipPerks", e.target.value)}
          placeholder="Free drinks, meet & greet, lounge access..."
          className="mt-1"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="h-12 px-8 rounded-2xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
