import {
  Building2,
  Plus,
  ArrowRight,
  LogOut,
  Settings,
  LayoutDashboard,
  RefreshCw,
  BarChart2,
  LayoutGrid,
  List,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "@tanstack/react-router";
import { logout } from "@/api/auth";
import { useState, useEffect, SetStateAction } from "react";
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

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("workspaceViewMode");
      return (saved as "grid" | "list") || "grid";
    }
    return "grid";
  });

  useEffect(() => {
    localStorage.setItem("workspaceViewMode", viewMode);
  }, [viewMode]);

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
    <div className="space-y-6 pb-32 px-6 md:px-12 w-full max-w-[1600px] mx-auto pt-10">
      <div className="flex justify-center w-full mb-8">
        <img
          src="/agatike-logo.svg"
          alt="Agatike"
          className="h-8 w-auto object-contain opacity-90"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-[13px] text-muted-foreground max-w-md">
            Each venue, cinema or organizer brand gets its own workspace with separate analytics and
            payouts.
          </p>
          <div className="md:hidden mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-yellow-800 dark:text-yellow-200 leading-tight">
              <strong>Note:</strong> You need to use a computer to fully access and manage your
              workspaces.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end mt-4 sm:mt-0">
          {currentUser?.role === "organizer" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/dashboard/analytics" })}
              className="hidden sm:flex rounded-full flex-none border-primary/20 hover:bg-primary/5 text-[13px]"
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Analytics</span>
            </Button>
          )}

          <div className="hidden sm:flex bg-card border border-border/40 rounded-full p-0.5 mx-1">
            <button
              className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                viewMode === "list"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-full flex-[0.5] sm:flex-none text-[13px] px-2 sm:px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1.5">Refresh</span>
          </Button>
          {currentUser?.role === "organizer" && (
            <Button
              size="sm"
              onClick={handleCreateClick}
              className="rounded-full shadow-[var(--shadow-glow)] gap-1.5 flex-[2] sm:flex-none text-[13px]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-3.5 w-3.5" /> New Workspace
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/60 bg-card/30">
          <Building2 className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h2 className="text-lg font-semibold mb-1">No Workspace Found</h2>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-sm mx-auto">
            You haven't created a workspace yet. Create one to start managing your events, venues,
            and experiences.
          </p>
          {currentUser?.role === "organizer" && (
            <Button
              size="sm"
              onClick={handleCreateClick}
              className="rounded-full shadow-[var(--shadow-glow)] gap-1.5 text-[13px]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Create Your First Workspace
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4 mx-auto w-full"
          }
        >
          {workspaces.map((w: Workspace) => {
            const t = types.find((x) => x.id === w.type) || types[0];
            const isActive = activeWorkspace?.id === w.id;

            const ActionButtons = () => (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Manage Modules"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModulesModalWorkspace(w);
                  }}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Workspace Settings"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: `/dashboard/${w.slug}/settings` });
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </>
            );

            return (
              <div
                key={w.id}
                className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col sm:flex-row sm:items-center"} rounded-2xl border bg-card/60 backdrop-blur-sm p-4 hover:shadow-md transition-all relative group ${
                  isActive
                    ? "border-primary/50 shadow-[0_4px_24px_rgba(var(--primary),0.08)] bg-primary/[0.02]"
                    : "border-border/40 hover:border-border"
                }`}
              >
                {viewMode === "grid" && (
                  <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {currentUser?.role === "organizer" && <ActionButtons />}
                  </div>
                )}

                <div
                  className={`flex items-center gap-3 ${viewMode === "grid" ? "mb-5 pr-12" : "flex-1 mb-4 sm:mb-0"}`}
                >
                  <div
                    className={`grid ${viewMode === "grid" ? "h-10 w-10 rounded-[14px]" : "h-12 w-12 rounded-xl"} place-items-center shrink-0 overflow-hidden shadow-sm`}
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
                      w.icon || <t.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-semibold ${viewMode === "grid" ? "text-[15px]" : "text-base"} truncate ${isActive ? "text-primary" : ""}`}
                    >
                      {w.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate opacity-80">
                      {t.title} · {w.city}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between sm:justify-end gap-2 ${viewMode === "grid" ? "w-full" : "sm:ml-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border/40 sm:border-t-0"}`}
                >
                  {viewMode === "list" && currentUser?.role === "organizer" && (
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <ActionButtons />
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`${viewMode === "grid" ? "w-full" : "w-auto px-4"} rounded-xl gap-1.5 h-8 text-xs font-medium transition-all ${
                      isActive
                        ? "shadow-[var(--shadow-glow)] opacity-100"
                        : "opacity-90 hover:opacity-100 bg-background/50 border-border/50"
                    }`}
                    style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                    onClick={() => {
                      setActiveWorkspace(w);
                      navigate({ to: `/dashboard/${w.slug}` });
                    }}
                  >
                    {isActive ? "Currently Active" : "Switch Workspace"}
                    {!isActive && <ArrowRight className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-xl p-2 border border-border/40 shadow-xl shadow-black/10 rounded-[1.5rem] sm:rounded-full z-10 flex items-center justify-between sm:justify-center gap-2 w-[92vw] sm:w-auto max-w-lg">
        {currentUser?.role === "organizer" && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2.5 h-10 px-3 sm:px-4 text-[14px] font-medium hover:bg-card transition-all flex items-center shrink-0"
            onClick={() => navigate({ to: "/dashboard/settings" })}
          >
            {currentUser?.profile?.image || currentUser?.image ? (
              <img
                src={currentUser?.profile?.image || currentUser?.image}
                alt={currentUser?.name || currentUser?.username || "Organizer"}
                className="w-6 h-6 rounded-full object-cover shadow-sm ring-1 ring-border/50"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold ring-1 ring-primary/20">
                {(currentUser?.name || currentUser?.username || "O").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate max-w-[120px] sm:max-w-[150px]">
              {currentUser?.name || currentUser?.username || "Organizer Profile"}
            </span>
          </Button>
        )}

        {currentUser?.role === "organizer" && (
          <div className="hidden sm:block w-px h-6 bg-border/40 shrink-0" />
        )}

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5 h-10 px-3 sm:px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[14px] shrink-0"
          onClick={async () => {
            await logout();
            window.location.href = "/dashboard/login";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      <WorkspaceModulesModal
        workspace={modulesModalWorkspace}
        isOpen={!!modulesModalWorkspace}
        onClose={() => setModulesModalWorkspace(null)}
      />
    </div>
  );
}
