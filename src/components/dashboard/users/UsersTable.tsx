import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlatformModules } from "@/hooks/usePlatformModules";

export function UsersTable({ users, workspaces }: { users: any[], workspaces: any[] }) {
  
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
            <TableRow key={user.id}>
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
              <TableCell colSpan={7} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
