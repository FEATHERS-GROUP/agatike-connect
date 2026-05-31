import {
  createFileRoute,
  Outlet,
  useRouterState,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { DesktopSidebar } from "@/components/desktop/dashboard/DesktopSidebar";
import { EventSidebar } from "@/components/desktop/dashboard/EventSidebar";
import { VenueSidebar } from "@/components/desktop/dashboard/VenueSidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEffect } from "react";
import { getSession } from "@/api/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    if (
      location.pathname === "/dashboard/login" ||
      location.pathname === "/dashboard/create-organizer"
    ) {
      return;
    }

    try {
      const session = await getSession();
      if (!session) {
        throw new Error("unauthenticated");
      }
    } catch {
      throw redirect({
        to: "/dashboard/login",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — Agatike" },
      {
        name: "description",
        content: "Sell tickets, run analytics, scan attendees and grow your events.",
      },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, isLoaded } = useWorkspace();

  const isEventWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/events\/[^/]+/);
  const isVenueWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/venues\/[^/]+/);
  const hideSidebar =
    location.pathname === "/dashboard/login" ||
    location.pathname === "/dashboard/workspaces" ||
    location.pathname === "/dashboard/create-organizer" ||
    location.pathname === "/dashboard/settings" ||
    location.pathname.match(/^\/dashboard\/[^/]+\/venue-designer/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/ticket-designer\/[^/]+/);
  const isDesigner = location.pathname.match(
    /^\/dashboard\/[^/]+\/(venue-designer|ticket-designer\/[^/]+)/,
  );

  useEffect(() => {
    if (!isLoaded) return;

    // Exempt routes that don't require workspace selection
    if (
      location.pathname === "/dashboard/login" ||
      location.pathname === "/dashboard/create-organizer" ||
      location.pathname === "/dashboard/settings" ||
      location.pathname === "/dashboard/workspaces"
    )
      return;

    if (workspaces.length === 0) {
      navigate({ to: "/dashboard/workspaces" });
    } else if (activeWorkspace && location.pathname === "/dashboard") {
      navigate({ to: `/dashboard/${activeWorkspace.slug}` });
    } else if (activeWorkspace) {
      // Check if current URL slug matches active workspace slug.
      // E.g. /dashboard/kigali-arenas/events
      const pathParts = location.pathname.split("/");
      const urlSlug = pathParts[2];

      if (urlSlug && urlSlug !== "workspaces" && urlSlug !== activeWorkspace.slug) {
        // If URL slug doesn't match active workspace, update active workspace to match URL
        const workspaceFromUrl = workspaces.find((w) => w.slug === urlSlug);
        if (workspaceFromUrl) {
          // Temporarily disable this switch to avoid infinite loops with useWorkspace setActiveWorkspace
          // setActiveWorkspace(workspaceFromUrl);
        } else {
          // If URL slug is invalid, redirect to active workspace
          navigate({ to: `/dashboard/${activeWorkspace.slug}` });
        }
      }
    }
  }, [isLoaded, workspaces, activeWorkspace, location.pathname, navigate]);

  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Desktop Only</h2>
        <p className="text-muted-foreground text-sm">
          The dashboard is optimized for desktop viewing. Please access it from a computer for the
          best experience.
        </p>
      </div>
      <div className="hidden md:block min-h-screen bg-secondary/30">
        <div className="flex">
          {/* Sidebar */}
          {!hideSidebar &&
            (isEventWorkspace ? (
              <EventSidebar />
            ) : isVenueWorkspace ? (
              <VenueSidebar />
            ) : (
              <DesktopSidebar />
            ))}

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 ${isDesigner ? "" : "p-6 lg:p-10"}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
