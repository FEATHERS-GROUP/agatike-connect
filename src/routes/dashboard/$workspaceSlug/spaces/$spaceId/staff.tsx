import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceManagers, addSpaceManager, removeSpaceManager } from "@/api/spaces";
import { getWorkspaceUsers } from "@/api/workspace_users";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/staff")({
  component: SpaceStaffPage,
});

function SpaceStaffPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("manager");

  const { data: managers = [], isLoading: isLoadingManagers } = useQuery({
    queryKey: ["space_managers", spaceId],
    queryFn: () => getSpaceManagers({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: workspaceUsers = [] } = useQuery({
    queryKey: ["workspace_users"],
    queryFn: () => getWorkspaceUsers(),
  });

  const addMutation = useMutation({
    mutationFn: addSpaceManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_managers", spaceId] });
      toast.success("Staff manager added!");
      setShowAddModal(false);
      setSelectedUser("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to add staff manager"),
  });

  const removeMutation = useMutation({
    mutationFn: removeSpaceManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_managers", spaceId] });
      toast.success("Staff manager removed.");
    },
    onError: () => toast.error("Failed to remove staff manager"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return toast.error("Please select a user");
    addMutation.mutate({
      data: { space_id: spaceId, workspace_user_id: selectedUser, role },
    });
  };

  // Filter out users who are already managers
  const availableUsers = workspaceUsers.filter(
    (wu: any) => !managers.find((m: any) => m.workspace_user_id === wu.id)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Managers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Restrict workspace users to manage only this specific branch.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 rounded-xl h-10">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {isLoadingManagers ? (
        <p className="text-muted-foreground">Loading staff...</p>
      ) : managers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-8 text-center text-muted-foreground shadow-sm">
          <Users className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No local staff added</h3>
          <p className="text-sm">Workspace admins automatically have access. Add local managers here.</p>
          <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-4 rounded-xl">
            Add staff member
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {managers.map((manager: any) => (
            <div
              key={manager.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card"
            >
              <div>
                <p className="font-semibold">{manager.workspace_user?.name || "Unknown User"}</p>
                <p className="text-sm text-muted-foreground">{manager.workspace_user?.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider font-semibold bg-secondary/50 px-2 py-1 rounded-md">
                  {manager.role || "Manager"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Remove this staff member?")) {
                      removeMutation.mutate({ data: { id: manager.id } });
                    }
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Manager</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Workspace User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">-- Choose a user --</option>
                {availableUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Only users invited to your Workspace can be assigned to manage a specific space.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="manager">Manager</option>
                <option value="instructor">Instructor</option>
                <option value="front_desk">Front Desk</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending || !selectedUser}>
                {addMutation.isPending ? "Adding..." : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
