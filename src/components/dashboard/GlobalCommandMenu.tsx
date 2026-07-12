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
  LifeBuoy,
  CheckSquare,
  StickyNote,
  FileText,
  ShoppingCart,
  Film,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getSpaces } from "@/api/spaces";
import { getWorkspaceTasks } from "@/api/tasks";
import { getWorkspaceNotes } from "@/api/notes";
import { getAgatikeBooksByWorkspace } from "@/api/book";
import { getProcurementInvoices } from "@/api/procurement";
import { getWorkspaceForms } from "@/api/rsvps";
import { getCinemas } from "@/api/cinemas";
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

  const studioLabels = [
    "Badge Designer",
    "Venue Designer",
    "Tickets",
    "Page Builder",
    "Ticket Designer",
  ];
  const mainNav = nav.filter(
    (m: any) => !studioLabels.includes(m.label) && m.label !== "Agatike Book",
  );
  const studioNav = nav.filter((m: any) => studioLabels.includes(m.label));

  const hasEvents = nav.some((m: any) => m.label === "Events" || m.label === "Event Management");
  const hasVenues = nav.some((m: any) => m.label === "Venue Listings" || m.label === "Venues");
  const hasSpaces = nav.some((m: any) => m.label === "Spaces");
  const hasCinema = nav.some(
    (m: any) => m.label === "Cinema / Theater" || m.label === "Cinema" || m.label === "Cinemas",
  );
  const hasBook = nav.some((m: any) => m.label === "Agatike Book");
  const hasForms = nav.some(
    (m: any) => m.label === "RSVPs" || m.label === "Forms" || m.label === "Attendees",
  );
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

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["workspace-tasks", workspaceId],
    queryFn: () => getWorkspaceTasks({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasBook,
    meta: { isBackground: true },
  });

  const { data: notes = [], isLoading: isNotesLoading } = useQuery({
    queryKey: ["workspace-notes", workspaceId],
    queryFn: () => getWorkspaceNotes({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasBook,
    meta: { isBackground: true },
  });

  const { data: books = [], isLoading: isBooksLoading } = useQuery({
    queryKey: ["workspace-books", workspaceId],
    queryFn: () => getAgatikeBooksByWorkspace({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasBook,
    meta: { isBackground: true },
  });

  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["workspace-procurement-invoices", workspaceId],
    queryFn: () => getProcurementInvoices({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasBook,
    meta: { isBackground: true },
  });

  const { data: forms = [], isLoading: isFormsLoading } = useQuery({
    queryKey: ["workspace-forms", workspaceId],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasForms,
    meta: { isBackground: true },
  });

  const { data: cinemas = [], isLoading: isCinemasLoading } = useQuery({
    queryKey: ["workspace-cinemas", workspaceId],
    queryFn: () => getCinemas({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId && open && hasCinema,
    meta: { isBackground: true },
  });

  const isLoadingData =
    isEventsLoading ||
    isVenuesLoading ||
    isSpacesLoading ||
    isTasksLoading ||
    isNotesLoading ||
    isBooksLoading ||
    isInvoicesLoading ||
    isFormsLoading ||
    isCinemasLoading;

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
              <CommandItem
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/billing/subscriptions` }))
                }
              >
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
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/events/${event.id}` }))
                }
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
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/venues/${venue.id}` }))
                }
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
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/spaces/${space.id}` }))
                }
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{space.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {tasks.map((task: any) => (
              <CommandItem
                key={task.id}
                onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/book/tasks` }))}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>{task.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {notes.length > 0 && (
          <CommandGroup heading="Notes">
            {notes.map((note: any) => (
              <CommandItem
                key={note.id}
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/book/notes/${note.id}` }))
                }
              >
                <StickyNote className="mr-2 h-4 w-4" />
                <span>{note.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {books.length > 0 && (
          <CommandGroup heading="Custom Books">
            {books.map((book: any) => (
              <CommandItem
                key={book.id}
                onSelect={() => runCommand(() => navigate({ to: `/dashboard/${slug}/book/books` }))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{book.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {invoices.length > 0 && (
          <CommandGroup heading="Invoices & Procurement">
            {invoices.map((invoice: any) => (
              <CommandItem
                key={invoice.id}
                onSelect={() =>
                  runCommand(() =>
                    navigate({ to: `/dashboard/${slug}/book/procurement/${invoice.id}` }),
                  )
                }
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>{invoice.invoice_number || "Draft Invoice"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {forms.length > 0 && (
          <CommandGroup heading="Custom Forms (RSVPs)">
            {forms.map((form: any) => (
              <CommandItem
                key={form.id}
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/rsvps/${form.id}` }))
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{form.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {cinemas.length > 0 && (
          <CommandGroup heading="Cinemas & Theaters">
            {cinemas.map((cinema: any) => (
              <CommandItem
                key={cinema.id}
                onSelect={() =>
                  runCommand(() => navigate({ to: `/dashboard/${slug}/Cinema/${cinema.id}` }))
                }
              >
                <Film className="mr-2 h-4 w-4" />
                <span>{cinema.name}</span>
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
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
