import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, User, Clock, Building2, Puzzle, FileText, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWorkspaceUser, resendWorkspaceUserInvite } from "@/api/workspace_users";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Route as UsersRoute } from "@/routes/dashboard/$workspaceSlug/users/index";

export function UsersTable({ users, workspaces = [] }: { users: any[], workspaces?: any[] }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { workspaceSlug } = UsersRoute.useParams();

  const resendMutation = useMutation({
    mutationFn: async (userId: string) => {
      await resendWorkspaceUserInvite({ data: { userId } } as any);
    },
    onSuccess: () => {
      toast.success("Invite email resent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend invite");
    }
  });

  const handleResendEmail = () => {
    if (selectedUsers.length === 1) {
      resendMutation.mutate(selectedUsers[0]);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedUsers) {
        await removeWorkspaceUser({ data: { id } } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success(`${selectedUsers.length} user(s) deleted successfully`);
      setSelectedUsers([]);
      setDetailsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete users");
    }
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      deleteMutation.mutate();
    }
  };

  
  const getWorkspaceNames = (wsIds: any) => {
    if (!wsIds) return "None";
    if (wsIds.includes("ALL")) return "All Workspaces";
    const names = wsIds.map((id: string) => workspaces.find(w => w.id === id)?.name || id);
    return names.join(", ");
  };

  const { data: platformModules = [] } = usePlatformModules();

  const getModuleNames = (modIds: string[]) => {
    if (!modIds || modIds.length === 0) return "None";
    if (modIds.includes("ALL")) return "All Modules";
    const names = modIds.map((id) => {
      const found = platformModules.find((m) => m.id === id);
      return found ? found.label : id;
    });
    return names.join(", ");
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const selectedUser = selectedUsers.length === 1 ? users.find(u => u.id === selectedUsers[0]) : null;

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Floating Action Bar */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-secondary/40 border border-border/60 rounded-xl animate-in slide-in-from-top-2">
          <span className="text-sm font-medium px-2">
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            {selectedUsers.length === 1 && (
              <>
                <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => setDetailsOpen(true)}>
                  <Eye className="h-4 w-4" /> View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-2"
                  onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/users/${selectedUsers[0]}/edit` })}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                {selectedUser?.status === "pending" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 gap-2 text-primary border-primary/20 hover:bg-primary/10"
                    onClick={handleResendEmail} 
                    disabled={resendMutation.isPending}
                  >
                    <Mail className="h-4 w-4" /> 
                    {resendMutation.isPending ? "Sending..." : "Resend Invite"}
                  </Button>
                )}
              </>
            )}
            <Button size="sm" variant="destructive" className="h-8 gap-2" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Workspaces</TableHead>
            <TableHead>Modules Access</TableHead>
            <TableHead>Expiry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={selectedUsers.includes(user.id) ? "bg-primary/5" : ""}>
              <TableCell>
                <Checkbox 
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleSelectUser(user.id)}
                  aria-label={`Select ${user.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden shrink-0">
                    <img 
                      src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=f97316`} 
                      alt={user.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{getWorkspaceNames(user.workspaces)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.modules && user.modules.length > 0 ? (
                    user.modules.map((mId: string) => {
                      const mod = platformModules.find(p => p.id === mId);
                      return (
                        <span key={mId} className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium">
                          {mod ? mod.label : mId}
                        </span>
                      );
                    })
                  ) : "None"}
                </div>
              </TableCell>
              <TableCell>
                {user.is_temporary && user.expires_at 
                  ? format(new Date(user.expires_at), "PPP") 
                  : "Never"}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Details Drawer */}
    <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>Detailed access information for this user.</SheetDescription>
        </SheetHeader>
        
        {(() => {
          const u = selectedUsers.length === 1 ? users.find((x) => x.id === selectedUsers[0]) : null;
          if (!u) return null;

          return (
            <div className="mt-8 space-y-6 pb-12">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-border/50">
                  <img 
                    src={u.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=f97316`} 
                    alt={u.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{u.name}</h3>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/40">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="h-3 w-3" /> Role & Status</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    <Badge variant={u.status === 'active' ? 'default' : 'secondary'} className="capitalize">{u.status}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Expiry</h4>
                  <p className="text-sm">
                    {u.is_temporary && u.expires_at ? format(new Date(u.expires_at), "PPP") : "Permanent Access (Never Expires)"}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Workspaces</h4>
                  <p className="text-sm text-foreground/80">{getWorkspaceNames(u.workspaces)}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Puzzle className="h-3 w-3" /> Module Access</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {u.modules && u.modules.length > 0 ? (
                      u.modules.map((mId: string) => {
                        const mod = platformModules.find(p => p.id === mId);
                        return (
                          <span key={mId} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                            {mod ? mod.label : mId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="h-3 w-3" /> Route Access</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {u.pages && u.pages.length > 0 ? (
                      u.pages.map((p: string) => (
                        <span key={p} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-medium font-mono">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </SheetContent>
    </Sheet>
    </div>
  );
}
