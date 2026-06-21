import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Building2, CalendarDays, Film, Mountain, Sun, Moon } from "lucide-react";
import { useWorkspace, WorkspaceType } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  if (!isLoaded || !activeWorkspace) return null;

  const ActiveIcon = typeIcons[activeWorkspace.type];

  return (
    <div className="mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 text-left shadow-sm transition hover:bg-secondary/50 focus:outline-none">
          <div className="flex items-center gap-3">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground overflow-hidden"
              style={{ background: "var(--gradient-primary)" }}
            >
              {activeWorkspace.icon?.startsWith("data:image") ||
              activeWorkspace.icon?.startsWith("http") ? (
                <img src={activeWorkspace.icon} alt="Logo" className="w-full h-full object-cover" />
              ) : activeWorkspace.icon ? (
                <span className="text-lg">{activeWorkspace.icon}</span>
              ) : (
                <ActiveIcon className="h-4 w-4" />
              )}
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
        <DropdownMenuContent
          className="rounded-xl border-border/60 shadow-[var(--shadow-card)]"
          style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Switch Workspace
          </DropdownMenuLabel>
          {workspaces.map((workspace) => {
            const Icon = typeIcons[workspace.type];
            const isActive = workspace.id === activeWorkspace.id;
            return (
              <DropdownMenuItem
                key={workspace.id}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2"
                onClick={() => {
                  setActiveWorkspace(workspace);
                  navigate({ to: `/dashboard/${workspace.slug}` });
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5">
                    {workspace.icon?.startsWith("data:image") ||
                    workspace.icon?.startsWith("http") ? (
                      <img
                        src={workspace.icon}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-sm"
                      />
                    ) : workspace.icon ? (
                      <span className="text-sm leading-none">{workspace.icon}</span>
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={isActive ? "font-medium" : ""}>{workspace.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="bg-border/60" />
          <Link to="/dashboard/workspaces">
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-foreground focus:bg-secondary">
              <Building2 className="h-4 w-4" />
              <span>My Workspaces</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/dashboard/create-organizer">
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-primary focus:bg-primary/10 focus:text-primary">
              <Plus className="h-4 w-4" />
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuItem 
            className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-foreground focus:bg-secondary"
            onClick={(e) => {
              e.preventDefault(); // keep the dropdown open or let it close depending on preference
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
