import React, { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Calendar,
  MapPin,
  Building2,
  Settings,
  CreditCard,
  Ticket,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  LifeBuoy
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getSpaces } from "@/api/spaces";
import { logout } from "@/api/auth";

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch search data only when menu is open and we have a workspace
  const workspaceId = activeWorkspace?.id;

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["workspace-venues", workspaceId],
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["workspace-spaces", workspaceId],
    queryFn: () => getSpaces({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open,
  });

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/dashboard/login", replace: true });
  };

  const slug = activeWorkspace?.slug || "";

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {slug && (
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}` }))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/events` }))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Events</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/venues` }))}>
              <MapPin className="mr-2 h-4 w-4" />
              <span>Venues</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/spaces` }))}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Spaces</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/billing/subscriptions` }))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Subscriptions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/settings` }))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/support` }))}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support & Tickets</span>
            </CommandItem>
          </CommandGroup>
        )}

        {events.length > 0 && (
          <CommandGroup heading="Events">
            {events.map((event: any) => (
              <CommandItem
                key={event.id}
                onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/events/${event.id}` }))}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{event.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {venues.length > 0 && (
          <CommandGroup heading="Venues">
            {venues.map((venue: any) => (
              <CommandItem
                key={venue.id}
                onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/venues/${venue.id}` }))}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>{venue.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {spaces.length > 0 && (
          <CommandGroup heading="Spaces">
            {spaces.map((space: any) => (
              <CommandItem
                key={space.id}
                onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/spaces/${space.id}` }))}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{space.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="System Actions">
          <CommandItem onSelect={() => runCommand(handleRefresh)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Refresh Data</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(handleLogout)}>
            <LogOut className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-500">Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
