import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWorkspaceUser } from "@/api/workspace_users";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const AVAILABLE_MODULES = [
  "Events",
  "Ticket Designer",
  "Venue Designer",
  "Venues",
  "Spaces",
  "Cinema",
  "Users",
  "Settings",
];

export function AddUserModal({ workspaces }: { workspaces: any[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isAllWorkspaces, setIsAllWorkspaces] = useState(true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  const addMutation = useMutation({
    mutationFn: (input: any) => addWorkspaceUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success("User added successfully and invitation sent.");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add user");
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setIsAllWorkspaces(true);
    setSelectedWorkspaces([]);
    setSelectedModules([]);
    setIsTemporary(false);
    setExpiresAt("");
  };

  const handleSave = () => {
    if (!name || !email || !password) {
      toast.error("Please fill in name, email and password");
      return;
    }
    if (!isAllWorkspaces && selectedWorkspaces.length === 0) {
      toast.error("Please select at least one workspace");
      return;
    }

    addMutation.mutate({
      data: {
        name,
        email,
        password,
        role,
        workspaces: isAllWorkspaces ? ["ALL"] : selectedWorkspaces,
        modules: selectedModules,
        pages: [], // Could be expanded later
        is_temporary: isTemporary,
        expires_at: isTemporary && expiresAt ? new Date(expiresAt).toISOString() : null,
      },
    });
  };

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const toggleWorkspace = (id: string) => {
    setSelectedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Workspace User</DialogTitle>
          <DialogDescription>
            Create a new user and assign them to your workspaces. An invitation will be sent to
            their email.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secret123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Normal User</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">Workspace Access</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-ws"
                checked={isAllWorkspaces}
                onCheckedChange={(c) => setIsAllWorkspaces(!!c)}
              />
              <Label htmlFor="all-ws">All Workspaces</Label>
            </div>
            {!isAllWorkspaces && (
              <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ws-${ws.id}`}
                      checked={selectedWorkspaces.includes(ws.id)}
                      onCheckedChange={() => toggleWorkspace(ws.id)}
                    />
                    <Label htmlFor={`ws-${ws.id}`} className="font-normal">
                      {ws.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">Module Access</h4>
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_MODULES.map((mod) => (
                <div key={mod} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mod-${mod}`}
                    checked={selectedModules.includes(mod)}
                    onCheckedChange={() => toggleModule(mod)}
                  />
                  <Label htmlFor={`mod-${mod}`} className="font-normal">
                    {mod}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temp-access"
                checked={isTemporary}
                onCheckedChange={(c) => setIsTemporary(!!c)}
              />
              <Label htmlFor="temp-access">Temporary Access (Expires)</Label>
            </div>
            {isTemporary && (
              <div className="grid gap-2 pl-6">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
