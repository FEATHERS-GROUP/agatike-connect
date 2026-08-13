import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Smartphone, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceApps, createWorkspaceApp, deleteWorkspaceApp } from "@/api/app-studio";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/$workspaceSlug/app-builder/")({
  component: AppBuilderIndex,
});

function AppBuilderIndex() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["workspace-apps", activeWorkspace?.id],
    queryFn: () => getWorkspaceApps({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return createWorkspaceApp({
        data: {
          workspace_id: activeWorkspace?.id,
          name: "Untitled App",
          description: "A new custom mobile portal",
          is_active: true,
          theme_color: "#f97316",
        },
      } as any);
    },
    onSuccess: (data: any) => {
      toast.success("App created successfully!");
      if (data?.id) {
        navigate({
          to: `/dashboard/${workspaceSlug}/app-builder/${data.id}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["workspace-apps"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create app");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteWorkspaceApp({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("App deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspace-apps"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete app");
    },
  });

  return (
    <div className="w-full p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design and manage custom mobile portals for your staff and vendors.
          </p>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="gap-2 rounded-full shadow-sm"
          style={{ background: "var(--gradient-primary)", color: "white" }}
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}{" "}
          Create Custom App
        </Button>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-3xl bg-secondary/10">
          <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-sm mb-6">
            <Smartphone className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Custom Apps Yet</h2>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            Build your first custom mobile portal to give specific roles tailored access to scanners, attendees, and more.
          </p>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="rounded-full shadow-sm"
          >
            Create Your First App
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app: any) => (
            <div
              key={app.id}
              className="group relative rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)] transition-all hover:shadow-md hover:border-primary/50"
            >
              <div
                className="h-24 w-full"
                style={{ backgroundColor: app.theme_color || "#f97316" }}
              />
              <div className="p-6 relative">
                <div className="absolute -top-12 left-6 h-16 w-16 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-border">
                  {app.logo_url ? (
                    <img src={app.logo_url} alt="Logo" className="h-12 w-12 object-cover rounded-xl" />
                  ) : (
                    <LayoutGrid className="h-8 w-8 text-primary" />
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold truncate pr-4">{app.name}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${app.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      {app.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {app.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="text-xs bg-secondary px-2.5 py-1 rounded-md text-muted-foreground font-medium">
                      {app.app_modules?.length || 0} Modules
                    </div>
                    <div className="text-xs bg-secondary px-2.5 py-1 rounded-md text-muted-foreground font-medium">
                      {app.app_permissions?.length || 0} Access Roles
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to="/dashboard/$workspaceSlug/app-builder/$appId"
                      params={{ workspaceSlug, appId: app.id }}
                      className="flex-1"
                    >
                      <Button className="w-full gap-2 rounded-xl" variant="secondary">
                        <Settings2 className="w-4 h-4" /> Open Studio
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl border-red-500/30 text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this custom app?")) {
                          deleteMutation.mutate(app.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
