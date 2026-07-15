import { Building2, Plus, ArrowRight, LogOut, User, Settings, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "@tanstack/react-router";
import { logout } from "@/api/auth";
import { useState } from "react";
import { WorkspaceModulesModal } from "./WorkspaceModulesModal";
import { Workspace } from "@/contexts/WorkspaceContext";
import { types } from "./constants";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";

interface WorkspaceListProps {
  onOpenWizard: () => void;
}

export function WorkspaceList({ onOpenWizard }: WorkspaceListProps) {
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading, currentUser, refetch } =
    useWorkspace() as any;
  const navigate = useNavigate();

  const [modulesModalWorkspace, setModulesModalWorkspace] = useState<Workspace | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { canCreateWorkspace } = useSubscriptionLimits(currentUser?.id);

  const handleCreateClick = () => {
    if (!canCreateWorkspace()) {
      toast.error("Workspace limit reached", {
        description:
          "Your current subscription plan does not allow creating more workspaces. Please upgrade your plan.",
      });
      return;
    }
    onOpenWizard();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each venue, cinema or organizer brand gets its own workspace with separate analytics and
            payouts.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-full flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {currentUser?.role === "organizer" && (
            <Button
              onClick={handleCreateClick}
              className="rounded-full shadow-[var(--shadow-glow)] gap-2 flex-1 sm:flex-none"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> New Workspace
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-border/60 bg-card/50">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No Workspace Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't created a workspace yet. Create one to start managing your events, venues,
            and experiences.
          </p>
          {currentUser?.role === "organizer" && (
            <Button
              onClick={handleCreateClick}
              className="rounded-full shadow-[var(--shadow-glow)] gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> Create Your First Workspace
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => {
            const t = types.find((x) => x.id === w.type) || types[0];
            const isActive = activeWorkspace?.id === w.id;

            return (
              <div
                key={w.id}
                className={`flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-all relative group ${
                  isActive ? "border-primary ring-1 ring-primary" : "border-border/60"
                }`}
              >
                <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {currentUser?.role === "organizer" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Manage Modules"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModulesModalWorkspace(w);
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Workspace Settings"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ to: `/dashboard/${w.slug}/settings` });
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-6 pr-10">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shrink-0 overflow-hidden`}
                    style={{
                      background: isActive ? "var(--gradient-primary)" : "var(--card-muted)",
                      color: isActive ? "white" : "inherit",
                    }}
                  >
                    {w.icon?.startsWith("data:image") || w.icon?.startsWith("http") ? (
                      <img
                        src={w.icon}
                        alt="Workspace Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      w.icon || <t.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg truncate">{w.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {t.title} · {w.city}
                    </p>
                  </div>
                </div>

                <Button
                  variant={isActive ? "default" : "outline"}
                  className={`w-full rounded-xl gap-2 ${isActive && "shadow-[var(--shadow-glow)]"}`}
                  style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                  onClick={() => {
                    setActiveWorkspace(w);
                    navigate({ to: `/dashboard/${w.slug}` });
                  }}
                >
                  {isActive ? "Currently Active" : "Switch to Workspace"}
                  {!isActive && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-4 border-t border-border/60 z-10 flex items-center justify-between gap-4 md:px-8">
        <Button
          variant="ghost"
          className="rounded-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await logout();
            window.location.href = "/dashboard/login";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>

        {currentUser?.role === "organizer" && (
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => navigate({ to: "/dashboard/settings" })}
          >
            <User className="h-4 w-4" /> Organizer Profile
          </Button>
        )}
      </div>

      <WorkspaceModulesModal
        workspace={modulesModalWorkspace}
        isOpen={!!modulesModalWorkspace}
        onClose={() => setModulesModalWorkspace(null)}
      />
    </div>
  );
}
