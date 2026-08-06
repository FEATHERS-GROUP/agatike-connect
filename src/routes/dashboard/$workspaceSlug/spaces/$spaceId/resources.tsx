import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceResources, createSpaceResource, deleteSpaceResource } from "@/api/space_resources";
import { getSpaceById } from "@/api/spaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Plus, Trash2, Building, GripVertical, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/resources")({
  component: StructureBuilderPage,
});

function StructureBuilderPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["space_resources", spaceId],
    queryFn: () => getSpaceResources({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const createMutation = useMutation({
    mutationFn: createSpaceResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resources", spaceId] });
      toast.success("Resource added successfully.");
      setNewName("");
    },
    onError: (err) => {
      toast.error("Failed to add resource.");
      console.error(err);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpaceResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resources", spaceId] });
      toast.success("Resource deleted.");
    }
  });

  const { data: space } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("meeting_room");
  const [locationId, setLocationId] = useState("");
  const [operatingHoursStart, setOperatingHoursStart] = useState("09:00");
  const [operatingHoursEnd, setOperatingHoursEnd] = useState("17:00");
  const [requireExclusive, setRequireExclusive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    createMutation.mutate({
      data: {
        object: {
          space_id: spaceId,
          name: newName,
          type: newType,
          rules: {
            locationId,
            operatingHours: { start: operatingHoursStart, end: operatingHoursEnd },
            requireExclusiveBooking: requireExclusive
          }
        }
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Box className="h-7 w-7 text-orange-500" />
          Structure Builder
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Add buildings, walls, meeting rooms, or individual offices.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Add New Resource</h3>
                <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="e.g. Building A, Room 101, Private Office 2" 
              />
            </div>
            <div className="w-48 space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="building">Building</option>
                <option value="floor">Floor / Wall</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="private_office">Private Office</option>
                <option value="gym_studio">Gym Studio</option>
                <option value="table">Dedicated Table</option>
              </select>
            </div>
          </div>

          <div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="text-muted-foreground -ml-3">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Booking Rules
            </Button>
          </div>

          {showAdvanced && (
            <div className="bg-secondary/10 border border-border/40 p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 fade-in">
              {space?.locations?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <select 
                    value={locationId} 
                    onChange={(e) => setLocationId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Any Location</option>
                    {space.locations.map((loc: any, i: number) => (
                      <option key={i} value={i.toString()}>{[loc.address, loc.city].filter(Boolean).join(", ")}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available From</label>
                  <Input type="time" value={operatingHoursStart} onChange={(e) => setOperatingHoursStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Until</label>
                  <Input type="time" value={operatingHoursEnd} onChange={(e) => setOperatingHoursEnd(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="exclusive" checked={requireExclusive} onCheckedChange={(c) => setRequireExclusive(!!c)} />
                <Label htmlFor="exclusive" className="font-medium cursor-pointer">Require Exclusive Booking (Prevent double bookings)</Label>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            className="h-10 px-6 rounded-lg font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </form>
      </div>

      <div className="max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Existing Resources</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className="bg-secondary/30 border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No resources added yet. Build your space layout above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((res: any) => (
              <div 
                key={res.id} 
                className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="cursor-move text-muted-foreground/50 hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{res.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {res.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => deleteMutation.mutate({ data: { id: res.id } })}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
