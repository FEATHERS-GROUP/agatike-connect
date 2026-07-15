import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function DesktopHeader() {
  const { activeWorkspace } = useWorkspace();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back, Nala</p>
        <h1 className="text-2xl font-semibold">Here's what's happening today</h1>
      </div>
      <div className="flex items-center gap-2">

        <Button asChild variant="outline" className="rounded-full">
          <Link to="/dashboard/workspaces">Workspaces</Link>
        </Button>
        {activeWorkspace?.slug ? (
          <Link
            to="/dashboard/$workspaceSlug/events/create-event"
            params={{ workspaceSlug: activeWorkspace.slug }}
          >
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> New event
            </Button>
          </Link>
        ) : (
          <Button
            className="rounded-full shadow-[var(--shadow-glow)] opacity-50 cursor-not-allowed"
            style={{ background: "var(--gradient-primary)" }}
            disabled
          >
            <Plus className="mr-1 h-4 w-4" /> New event
          </Button>
        )}
      </div>
    </header>
  );
}
