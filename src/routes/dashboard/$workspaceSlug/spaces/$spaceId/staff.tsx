import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Users, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceManagers, addSpaceManager, removeSpaceManager } from "@/api/spaces";
import { getWorkspaceUsers } from "@/api/workspace_users";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/staff")({
  component: SpaceStaffPage,
});

function SpaceStaffPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("manager");
  const [searchQuery, setSearchQuery] = useState("");

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
    (wu: any) => !managers.find((m: any) => m.workspace_user_id === wu.id),
  );

  const filteredManagers = managers.filter((m: any) => {
    const q = searchQuery.toLowerCase();
    return (
      m.workspace_user?.name?.toLowerCase().includes(q) ||
      m.workspace_user?.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  });

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
        <p className="text-muted-foreground animate-pulse">Loading staff...</p>
      ) : managers.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] p-12 text-center text-muted-foreground shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-[#1b1b1c] rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-[#333333]">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No staff added yet
          </h3>
          <p className="text-sm max-w-md mx-auto mb-6">
            Workspace admins automatically have access. Add local managers here to give them access
            specifically to this branch.
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add your first staff member
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-[#333333] flex items-center justify-between bg-gray-50/50 dark:bg-[#1b1b1c]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#888888]" />
              <input
                type="text"
                placeholder="Search staff by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#333333] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] transition-all placeholder:text-gray-400 dark:placeholder:text-[#666666]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#1b1b1c] text-gray-500 dark:text-[#888888]">
                <tr>
                  <th className="px-6 py-4 font-medium">Staff Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {filteredManagers.map((manager: any) => (
                  <tr
                    key={manager.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1b1b1c]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316]/20 to-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center shrink-0">
                          <span className="text-[#f97316] font-semibold text-sm">
                            {manager.workspace_user?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {manager.workspace_user?.name || "Unknown User"}
                          </div>
                          <div className="text-gray-500 dark:text-[#888888] text-xs mt-0.5">
                            {manager.workspace_user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 capitalize">
                        {manager.role?.replace("_", " ") || "Manager"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove ${manager.workspace_user?.name || "this staff member"}?`,
                            )
                          ) {
                            removeMutation.mutate({ data: { id: manager.id } });
                          }
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 px-2"
                        title="Remove staff member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredManagers.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-gray-500 dark:text-[#888888]"
                    >
                      <div className="flex flex-col items-center">
                        <Search className="w-8 h-8 mb-3 text-gray-300 dark:text-[#444444]" />
                        <p>No staff members found matching "{searchQuery}".</p>
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="text-[#f97316] mt-2 h-auto p-0"
                        >
                          Clear search
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
