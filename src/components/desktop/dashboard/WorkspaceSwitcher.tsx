import { Link } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Building2, CalendarDays, Film, Mountain } from "lucide-react";
import { useWorkspace, WorkspaceType } from "@/contexts/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const typeIcons: Record<WorkspaceType, any> = {
  VENUE: Building2,
  EVENT: CalendarDays,
  CINEMA: Film,
  EXPERIENCE: Mountain,
};

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoaded } = useWorkspace();

  if (!isLoaded || !activeWorkspace) return null;

  const ActiveIcon = typeIcons[activeWorkspace.type];

  return (
    <div className="mb-6 px-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 text-left shadow-sm transition hover:bg-secondary/50 focus:outline-none">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">{activeWorkspace.name}</span>
              <span className="text-xs text-muted-foreground capitalize leading-tight">
                {activeWorkspace.type.toLowerCase()}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl border-border/60 shadow-[var(--shadow-card)]" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Workspace</DropdownMenuLabel>
          {workspaces.map((workspace) => {
            const Icon = typeIcons[workspace.type];
            const isActive = workspace.id === activeWorkspace.id;
            return (
              <DropdownMenuItem
                key={workspace.id}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2"
                onClick={() => setActiveWorkspace(workspace)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className={isActive ? "font-medium" : ""}>{workspace.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="bg-border/60" />
          <Link to="/dashboard/workspaces">
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-primary focus:bg-primary/10 focus:text-primary">
              <Plus className="h-4 w-4" />
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
