import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DesktopHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back, Nala</p>
        <h1 className="text-2xl font-semibold">Here's what's happening today</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-full">
          Export
        </Button>
        <Link to="/workspaces">
          <Button variant="outline" className="rounded-full">
            Workspaces
          </Button>
        </Link>
        <Link to="/create-event">
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="mr-1 h-4 w-4" /> New event
          </Button>
        </Link>
      </div>
    </header>
  );
}
