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
import { usePlatformModules } from "@/hooks/usePlatformModules";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getSpaces } from "@/api/spaces";
import { logout } from "@/api/auth";

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const { activeWorkspace, currentUser } = useWorkspace() as any;
  const { data: platformModules = [] } = usePlatformModules();
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

  const userModuleIds = activeWorkspace?.modules || [];
  const nav = platformModules.filter((m: any) => {
    if (m.mandatory && currentUser?.role === "organizer") return true;
    if (userModuleIds.includes(m.id)) return true;

    const legacyIdMap: Record<string, string> = {
      Dashboard: "dashboard",
      Events: "events",
      Tickets: "tickets",
      RSVPs: "rsvps",
      Attendees: "rsvps",
      Scanning: "scanner",
      "Products & Add-ons": "products&add-ons",
      Merchandise: "merchandise",
      "VIP Access": "vip",
      Campaigns: "campaigns",
      "Venue Listings": "venue_listings",
      "Venue Designer": "venue_designer",
      Experiences: "experiences",
      Analytics: "analytics",
      Users: "users",
      Withdrawals: "withdrawals",
      Settings: "settings",
      "Page Builder": "page_builder",
      "Badge Designer": "badge_designer",
      "Ticket Designer": "ticket_designer",
      Spaces: "spaces",
    };
    const legacyId = legacyIdMap[m.label];
    return legacyId && userModuleIds.includes(legacyId);
  });

  const studioLabels = ["Badge Designer", "Venue Designer", "Tickets", "Page Builder", "Ticket Designer"];
  const mainNav = nav.filter((m: any) => !studioLabels.includes(m.label) && m.label !== "Agatike Book");
  const studioNav = nav.filter((m: any) => studioLabels.includes(m.label));

  const hasEvents = nav.some((m: any) => m.label === "Events" || m.label === "Event Management");
  const hasVenues = nav.some((m: any) => m.label === "Venue Listings" || m.label === "Venues");
  const hasSpaces = nav.some((m: any) => m.label === "Spaces");
  const hasBilling = currentUser?.role === "organizer";

  const workspaceId = activeWorkspace?.id;

  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasEvents,
    meta: { isBackground: true },
  });

  const { data: venues = [], isLoading: isVenuesLoading } = useQuery({
    queryKey: ["workspace-venues", workspaceId],
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasVenues,
    meta: { isBackground: true },
  });

  const { data: spaces = [], isLoading: isSpacesLoading } = useQuery({
    queryKey: ["workspace-spaces", workspaceId],
    queryFn: () => getSpaces({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasSpaces,
    meta: { isBackground: true },
  });

  const isLoadingData = isEventsLoading || isVenuesLoading || isSpacesLoading;

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
  const workspacePrefix = activeWorkspace ? `/dashboard/${activeWorkspace.slug}` : "/dashboard";

  const renderCommandItem = (n: any) => {
    const fullHref =
      n.href !== undefined
        ? n.href === ""
          ? workspacePrefix
          : `${workspacePrefix}/${n.href}`
        : null;

    if (!fullHref) return null;

    return (
      <CommandItem key={n.id} onSelect={() => runCommand(() => navigate({ to: fullHref }))}>
        {n.icon && <n.icon className="mr-2 h-4 w-4 shrink-0" />}
        <span>{n.label}</span>
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {isLoadingData && (
          <CommandGroup heading="Searching...">
            {[1, 2, 3].map((i) => (
              <CommandItem key={i} disabled>
                <div className="h-4 w-4 mr-2 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!isLoadingData && <CommandEmpty>No results found.</CommandEmpty>}
        
        {slug && mainNav.length > 0 && (
          <CommandGroup heading="Navigation">
            {mainNav.map((n: any) => renderCommandItem(n))}
            {hasBilling && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/billing/subscriptions` }))}>
                <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                <span>Billing & Subscriptions</span>
              </CommandItem>
            )}
            <CommandItem onSelect={() => runCommand(() => navigate({ to: `/dashboard/support` }))}>
              <LifeBuoy className="mr-2 h-4 w-4 shrink-0" />
              <span>Support & Tickets</span>
            </CommandItem>
          </CommandGroup>
        )}

        {slug && studioNav.length > 0 && (
          <CommandGroup heading="Agatike Studio">
            {studioNav.map((n: any) => renderCommandItem(n))}
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
                <span>{event.title}</span>
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
