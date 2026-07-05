import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceUsers } from "@/api/workspace_users";
import { getUserWorkspaces } from "@/api/workspaces";
import { UsersTable } from "@/components/dashboard/users/UsersTable";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/users/")({
  component: UsersPage,
});

function UsersPage() {
  const navigate = useNavigate();
  const { workspaceSlug } = Route.useParams();
  const { workspaces, activeWorkspace } = useWorkspace();
  const { canInviteUser } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const {
    data: users = [],
    isLoading: loadingUsers,
    isError: usersError,
    error: usersErr,
  } = useQuery({
    queryKey: ["workspace_users"],
    queryFn: () => getWorkspaceUsers(),
  });

  const isOrganizer = workspaces && workspaces.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspace Users</h1>
            <p className="text-muted-foreground text-sm">
              Manage who has access to your workspaces and what they can do.
            </p>
          </div>
        </div>
        {isOrganizer && (
          <Button
            onClick={() => {
              if (!canInviteUser()) {
                toast.error("User limit reached", {
                  description:
                    "Your current subscription plan does not allow adding more users. Please upgrade your plan.",
                });
                return;
              }
              navigate({ to: `/dashboard/${workspaceSlug}/users/add-user` });
            }}
            className="gap-2 rounded-xl shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        )}
      </div>

      {loadingUsers ? (
        <div className="text-center py-10 text-muted-foreground">Loading users...</div>
      ) : usersError ? (
        <div className="text-center py-10 text-destructive">
          Error loading users: {(usersErr as Error)?.message}
        </div>
      ) : (
        <UsersTable users={users} workspaces={workspaces} />
      )}
    </div>
  );
}
