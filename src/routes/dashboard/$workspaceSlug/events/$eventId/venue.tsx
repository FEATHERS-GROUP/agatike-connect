import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Image as ImageIcon,
  Map,
  Check,
  Plus,
  Trash2,
  Loader2,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEventById, updateEvent } from "@/api/events";
import { getWorkspaceVenueProjects, assignVenueProjectToStop, saveVenueProject } from "@/api/venues";
import { getEventAttendees } from "@/api/attendees";
import { VenueSeatSelector } from "@/components/shared/VenueSeatSelector";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { AddressInput } from "./edit";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/venue")({
  component: VenueView,
});

function VenueView() {
  const { eventId, workspaceSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const venueImageRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const [tourStops, setTourStops] = useState<any[]>([]);

  useEffect(() => {
    if (!event) return;
    const stops = Array.isArray(event.tour_stops) ? event.tour_stops : [];
    // Ensure amenities is an array for each stop
    const normalized = stops.map((s: any) => ({
      ...s,
      amenities: Array.isArray(s.amenities) ? s.amenities : [],
    }));
    setTourStops(normalized);
  }, [event]);

  const { data: workspaceVenueProjects, refetch: refetchVenueProjects } = useQuery({
    queryKey: ["workspace-venues", workspaceSlug],
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id: event?.workspace_id } } as any),
    enabled: !!event?.workspace_id,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ venue_project_id, tour_stop_idx }: { venue_project_id: string, tour_stop_idx: number }) => {
      return assignVenueProjectToStop({
        data: { venue_project_id, event_id: eventId, tour_stop_idx }
      } as any);
    },
    onSuccess: () => {
      toast.success("Venue layout assigned!");
      refetchVenueProjects();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign layout");
    }
  });

  const saveMappingMutation = useMutation({
    mutationFn: async (updatedProject: any) => {
      return saveVenueProject({
        data: {
          venue_project_id: updatedProject.id,
          workspace_id: updatedProject.workspace_id,
          name: updatedProject.name,
          event_id: updatedProject.event_id,
          tour_stop_idx: updatedProject.tour_stop_idx,
          canvas_bg: updatedProject.canvas_bg,
          boundary: {
            shape: updatedProject.boundary_shape,
            width: updatedProject.boundary_width,
            height: updatedProject.boundary_height,
            rx: updatedProject.boundary_rx,
          },
          sections: updatedProject.sections_data,
        }
      } as any);
    },
    onSuccess: () => {
      toast.success("Ticket mapping saved!");
      refetchVenueProjects();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save mapping");
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Process file uploads for venue images if any
      const processedStops = await Promise.all(
        tourStops.map(async (stop) => {
          let updatedStop = { ...stop };

          if (updatedStop.venueImageFile) {
            const url = await uploadFileToStorage(
              updatedStop.venueImageFile,
              "events/venues/images",
            );
            updatedStop.venue_image_url = url;
            updatedStop.venueImageFile = undefined;
          }

          return updatedStop;
        }),
      );

      return updateEvent({
        data: {
          id: eventId,
          title: event.title,
          category: event.category,
          description: event.description,
          cover: event.cover,
          vipPerks: event.vipPerks,
          event_requency: event.event_requency || {},
          allowed_public: event.allowed_public,
          lineup: event.lineup,
          tour_stops: processedStops,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Venue details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-events"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update venue details");
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
    <div className="max-w-5xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Venue Details</h1>
          <p className="text-sm text-muted-foreground">
            Manage locations, amenities, and floor plans for this event.
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
              <Check className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </header>

      {tourStops.length === 0 ? (
        <div className="rounded-[2rem] border border-border/60 bg-card p-12 text-center text-muted-foreground shadow-[var(--shadow-card)]">
          No locations added to this event yet. Go to Edit Event to add tour stops.
        </div>
      ) : (
        tourStops.map((stop: any, idx: number) => {
          const stopId = stop.id || idx;
          const assignedProject = workspaceVenueProjects?.find(
            (v) => v.event_id === eventId && v.tour_stop_idx === idx
          );
          const templates = workspaceVenueProjects?.filter((v) => v.id !== assignedProject?.id) || [];
          const stopBookedSeats = attendees
            ?.filter((a: any) => a.custom_fields?.tour_stop_idx === idx)
            .map((a: any) => a.custom_fields?.seat)
            .filter(Boolean) || [];

          return (
            <div
              key={stopId}
              className="rounded-[2rem] border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]"
            >
              <div className="bg-secondary/30 px-6 py-4 border-b border-border/60">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {tourStops.length > 1
                    ? `Stop ${idx + 1}: ${stop.venue || stop.city || "Unnamed"}`
                    : stop.venue || stop.city || "Event Venue"}
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  {/* Location Basic Info */}
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">
                        Venue Name
                      </label>
                      <Input
                        value={stop.venue || ""}
                        onChange={(e) => {
                          const newStops = [...tourStops];
                          newStops[idx].venue = e.target.value;
                          setTourStops(newStops);
                        }}
                        placeholder="Club Kigali"
                        className="h-10 text-sm bg-secondary/20"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">
                        Address
                      </label>
                      <AddressInput
                        value={stop.address || stop.city || ""}
                        onChange={(val: string) => {
                          const newStops = [...tourStops];
                          newStops[idx].address = val;
                          // If there's no city, set city to the address initially
                          if (!newStops[idx].city) newStops[idx].city = val;
                          setTourStops(newStops);
                        }}
                        onSelectCoords={(lat: string, lng: string) => {
                          const newStops = [...tourStops];
                          newStops[idx].latitude = lat;
                          newStops[idx].longitude = lng;
                          setTourStops(newStops);
                          toast.success("Location coordinates captured!");
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={stop.date || ""}
                          onChange={(e) => {
                            const newStops = [...tourStops];
                            newStops[idx].date = e.target.value;
                            setTourStops(newStops);
                          }}
                          className="h-10 text-sm bg-secondary/20"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">
                          Time
                        </label>
                        <Input
                          type="time"
                          value={stop.time || ""}
                          onChange={(e) => {
                            const newStops = [...tourStops];
                            newStops[idx].time = e.target.value;
                            setTourStops(newStops);
                          }}
                          className="h-10 text-sm bg-secondary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" /> Amenities
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] sm:max-w-sm">
                          Physical features of the location (e.g., "Wheelchair Accessible", "500
                          Parking Spots"). Note: Use the VIP tab for special ticket perks.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-8"
                        onClick={() => {
                          const newStops = [...tourStops];
                          newStops[idx].amenities = [...(newStops[idx].amenities || []), ""];
                          setTourStops(newStops);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Amenity
                      </Button>
                    </div>

                    {!stop.amenities || stop.amenities.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No amenities added.</p>
                    ) : (
                      <ul className="space-y-2">
                        {stop.amenities.map((amenity: string, amenityIdx: number) => (
                          <li key={amenityIdx} className="flex items-center gap-2">
                            <Input
                              value={amenity}
                              placeholder="e.g. VIP Lounge Access"
                              className="h-9 text-sm"
                              onChange={(e) => {
                                const newStops = [...tourStops];
                                newStops[idx].amenities[amenityIdx] = e.target.value;
                                setTourStops(newStops);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-500"
                              onClick={() => {
                                const newStops = [...tourStops];
                                newStops[idx].amenities = newStops[idx].amenities.filter(
                                  (_: any, i: number) => i !== amenityIdx,
                                );
                                setTourStops(newStops);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Media Column */}
                <div className="space-y-8">
                  {/* Venue Image */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-primary" /> Venue Photo
                    </h3>
                    <label
                      className="block aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary"
                      onClick={() => {
                        if (venueImageRefs.current[stopId]) {
                          venueImageRefs.current[stopId]?.click();
                        }
                      }}
                    >
                      {stop.venue_image_url ? (
                        <img
                          src={stop.venue_image_url}
                          alt="Venue"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-sm text-muted-foreground">
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>Upload Venue Image</p>
                            <p className="text-xs opacity-70 mt-1">Max size: 5MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                    <input
                      ref={(el) => {
                        venueImageRefs.current[stopId] = el;
                      }}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 5 * 1024 * 1024) {
                          toast.error("Image must be smaller than 5MB");
                          return;
                        }
                        const newStops = [...tourStops];
                        newStops[idx] = {
                          ...newStops[idx],
                          venueImageFile: f,
                          venue_image_url: URL.createObjectURL(f),
                        };
                        setTourStops(newStops);
                      }}
                    />
                    {stop.venue_image_url && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => venueImageRefs.current[stopId]?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Change Photo
                        </Button>
                      </div>
                    )}
                  </div>

                  </div>
                </div>

                {/* Interactive Seating Layout (Full Width, 2-Column inner grid) */}
              <div className="mt-8 border-t border-border/50 pt-8 px-6 pb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-6 text-lg">
                  <Map className="h-6 w-6 text-primary" /> Interactive Seating Layout
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Live Occupancy Map */}
                  <div className="flex flex-col">
                    {!assignedProject || !assignedProject.sections_data || assignedProject.sections_data.length === 0 ? (
                      <div className="h-full min-h-[400px] border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center bg-secondary/10 p-6 text-center">
                        <Map className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <h4 className="font-medium text-muted-foreground">No Layout Assigned</h4>
                        <p className="text-sm text-muted-foreground/70 mt-1">Assign a venue layout to view the live occupancy map here.</p>
                      </div>
                    ) : (
                      <div className="bg-secondary/10 rounded-2xl border border-border/50 h-full">
                        <VenueSeatSelector
                          venueProject={assignedProject}
                          eventTickets={event.event_tickets || []}
                          bookedSeats={stopBookedSeats}
                          selectedSeats={[]}
                          maxSelectable={0}
                          onSeatSelect={() => {}}
                          onSeatDeselect={() => {}}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Mapping Controls */}
                  <div className="space-y-6">
                    {!assignedProject ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Assign a venue layout to enable interactive seat selection for this tour stop.
                        </p>
                        <div className="flex gap-2">
                          <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                assignMutation.mutate({ venue_project_id: val, tour_stop_idx: idx });
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select a layout template...</option>
                            {templates.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium">{assignedProject.name}</p>
                            <p className="text-xs text-muted-foreground">Assigned Layout</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              refetchVenueProjects();
                              toast.success("Synced latest layout data from designer.");
                            }}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync Layout
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              window.open(`/dashboard/${workspaceSlug}/venue-designer/${assignedProject.id}`, '_blank');
                            }}>
                              Edit Layout
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          <h4 className="text-sm font-medium">Map Tickets to Sections</h4>
                          {(!assignedProject.sections_data || assignedProject.sections_data.filter((s: any) => s.shape !== "pitch").length === 0) ? (
                            <p className="text-sm text-muted-foreground italic">No mappable sections defined in this layout.</p>
                          ) : (
                            assignedProject.sections_data.map((section: any, sIdx: number) => {
                              if (section.shape === "pitch") return null;
                              return (
                                <div key={section.id || sIdx} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-secondary/20 border border-transparent hover:border-border/50 transition-colors">
                                  <span className="text-sm font-medium flex-1">{section.name || 'Unnamed Section'}</span>
                                  <select
                                    className="flex h-9 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={section.ticketId || ""}
                                    onChange={(e) => {
                                      const newSections = [...assignedProject.sections_data];
                                      newSections[sIdx] = { ...section, ticketId: e.target.value };
                                      const updatedProject = { ...assignedProject, sections_data: newSections };
                                      saveMappingMutation.mutate(updatedProject);
                                    }}
                                  >
                                    <option value="">No Ticket Mapped</option>
                                    {event.event_tickets?.filter((t: any) => !t.deleted).map((t: any) => (
                                      <option key={t.id} value={t.id}>{t.type} - {event.event_tickets?.[0]?.cost ? `${t.cost}` : 'Free'}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
