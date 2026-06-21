import {
  createFileRoute,
  Outlet,
  useRouterState,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { DesktopSidebar } from "@/components/desktop/dashboard/DesktopSidebar";
import { EventSidebar } from "@/components/desktop/dashboard/EventSidebar";
import { ExperienceSidebar } from "@/components/desktop/dashboard/ExperienceSidebar";
import { VenueSidebar } from "@/components/desktop/dashboard/VenueSidebar";
import { SpaceSidebar } from "@/components/desktop/dashboard/SpaceSidebar";
import { CinemaSidebar } from "@/components/desktop/dashboard/CinemaSidebar";
import { TheatresSidebar } from "@/components/desktop/dashboard/TheatresSidebar";
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
  const { workspaces, activeWorkspace, isLoaded, currentUser } = useWorkspace() as any;

  const isEventWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/events\/[^/]+/);
  const isExperienceWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/experiences\/[^/]+/);
  const isVenueWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/venues\/[^/]+/);
  const isSpaceWorkspace =
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/[^/]+/) &&
    !location.pathname.includes("create-space");
  // Cinema inside a specific cinema (has $cinemaId)
  const isCinemaWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/[^/]+\//);
  // Top-level Cinema section (list page + ticket-tiers) — no $cinemaId sub-route
  const isCinemaSection =
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema/) && !isCinemaWorkspace;
  const search = location.search as any;
  const isDesigningVenue = !!location.pathname.match(/^\/dashboard\/[^/]+\/venue-designer\/[^/]+/);

  const hideSidebar =
    location.pathname === "/dashboard/login" ||
    location.pathname === "/dashboard/workspaces" ||
    location.pathname === "/dashboard/create-organizer" ||
    location.pathname === "/dashboard/settings" ||
    isDesigningVenue ||
    location.pathname.match(/^\/dashboard\/[^/]+\/ticket-designer\/[^/]+/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/create-space/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-movie/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-ticket-tier/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/[^/]+\/create-schedule/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create$/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/users\/add-user/);

  const isDesigner =
    isDesigningVenue ||
    location.pathname.match(/^\/dashboard\/[^/]+\/ticket-designer\/[^/]+/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/community/i) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/create-space/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-movie/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-ticket-tier/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/[^/]+\/create-schedule/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create$/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/users\/add-user/);

  useEffect(() => {
    if (!isLoaded) return;

    // Exempt routes that don't require workspace selection
    if (
      location.pathname === "/dashboard/login" ||
      location.pathname === "/dashboard/create-organizer" ||
      location.pathname === "/dashboard/settings" ||
      location.pathname === "/dashboard/workspaces" ||
      location.pathname === "/dashboard/workspace-user/activate"
    )
      return;

    if (workspaces.length === 0) {
      navigate({ to: "/dashboard/workspaces" });
    } else if (activeWorkspace && location.pathname === "/dashboard") {
      navigate({ to: `/dashboard/${activeWorkspace.slug}` });
    } else if (activeWorkspace) {
      const pathParts = location.pathname.split("/");
      const urlSlug = pathParts[2];

      if (urlSlug && urlSlug !== "workspaces" && urlSlug !== "workspace-user" && urlSlug !== activeWorkspace.slug) {
        const workspaceFromUrl = workspaces.find((w) => w.slug === urlSlug);
        if (workspaceFromUrl) {
          // setActiveWorkspace(workspaceFromUrl);
        } else {
          navigate({ to: `/dashboard/${activeWorkspace.slug}` });
        }
      }

      // Enforce module-level route protection
      const urlModule = pathParts[3];
      if (urlModule) {
        const protectedModules: Record<string, string> = {
          "events": "events",
          "tickets": "tickets",
          "rsvps": "rsvps",
          "scanner": "scanner",
          "products": "products&add-ons",
          "merchandise": "merchandise",
          "vip": "vip",
          "campaigns": "campaigns",
          "venues": "venue_listings",
          "venue-designer": "venue_designer",
          "experiences": "experiences",
          "analytics": "analytics",
          "users": "users",
          "withdrawals": "withdrawals",
          "page-builder": "page_builder",
        };

        const requiredModule = protectedModules[urlModule];
        if (requiredModule) {
          const allowed = 
            activeWorkspace.modules?.includes(requiredModule) || 
            activeWorkspace.modules?.includes(requiredModule.replace("_", "-"));
          
          if (!allowed && !activeWorkspace.modules?.includes("ALL")) {
            navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
            return;
          }
        }
      }
      
      // Page-level access check for workspace users
      if (currentUser && currentUser.pages && !currentUser.pages.includes("ALL")) {
        let subPath = location.pathname.substring(`/dashboard/${activeWorkspace.slug}`.length);
        if (subPath === "") subPath = "/";
        
        let isAllowed = false;
        if (subPath === "/" || subPath === "/settings") {
          isAllowed = true;
        } else {
          for (const p of currentUser.pages) {
            if (p === subPath) {
              isAllowed = true;
              break;
            }
            if (p.includes("/:")) {
              const base = p.split("/:")[0];
              if (subPath.startsWith(base + "/") && subPath.split("/").length === base.split("/").length + 1) {
                isAllowed = true;
                break;
              }
            }
          }
        }
        
        if (!isAllowed) {
          navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
          return;
        }
      }
    }
  }, [isLoaded, workspaces, activeWorkspace, location.pathname, navigate, currentUser]);

  return (
    <>
      <div className="md:hidden print:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
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
      <div className="hidden md:block print:block min-h-screen print:min-h-0 bg-secondary/30">
        <div className="flex">
          {/* Sidebar */}
          {!hideSidebar &&
            (isEventWorkspace ? (
              <EventSidebar />
            ) : isExperienceWorkspace ? (
              <ExperienceSidebar />
            ) : isVenueWorkspace ? (
              <VenueSidebar />
            ) : isSpaceWorkspace ? (
              <SpaceSidebar />
            ) : isCinemaWorkspace ? (
              <CinemaSidebar />
            ) : isCinemaSection ? (
              <TheatresSidebar />
            ) : (
              <DesktopSidebar />
            ))}

          {/* Main Content Area */}
          <main
            className={`flex-1 min-w-0 ${isDesigner || location.pathname === "/dashboard/login" || location.pathname === "/dashboard/create-organizer" ? "" : "p-6 lg:p-10 print:p-0"}`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
