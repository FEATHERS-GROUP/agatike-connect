import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceResources, createSpaceResource, deleteSpaceResource } from "@/api/space_resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Plus, Trash2, Building, GripVertical } from "lucide-react";
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

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("meeting_room");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    createMutation.mutate({
      data: {
        object: {
          space_id: spaceId,
          name: newName,
          type: newType,
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
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
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
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            className="h-10 shrink-0 gap-2 px-5 rounded-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            Add
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
