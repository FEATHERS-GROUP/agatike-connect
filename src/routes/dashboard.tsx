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
import { TransportSidebar } from "@/components/desktop/dashboard/TransportSidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import { useEffect } from "react";
import { getSession, logout } from "@/api/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const { data: platformModules = [] } = usePlatformModules();

  const isEventWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/events\/[^/]+/);
  const isExperienceWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/experiences\/[^/]+/);
  const isVenueWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/venues\/[^/]+/);
  const isSpaceWorkspace =
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/[^/]+/) &&
    !location.pathname.includes("create-space");
  const isTransportWorkspace = location.pathname.match(/^\/dashboard\/[^/]+\/trips\/[^/]+/);
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
    location.pathname === "/dashboard/billing/subscriptions/pricingplans" ||
    location.pathname.startsWith("/dashboard/billing/subscriptions/checkout") ||
    isDesigningVenue ||
    location.pathname.match(/^\/dashboard\/[^/]+\/ticket-designer\/[^/]+/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/create-space/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-movie/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-ticket-tier/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/[^/]+\/create-schedule/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create$/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/users\/add-user/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/trips\/create-trip/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/page-builder\/editor/);

  const isDesigner =
    isDesigningVenue ||
    location.pathname.match(/^\/dashboard\/[^/]+\/ticket-designer\/[^/]+/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/community/i) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/spaces\/create-space/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-movie/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create-ticket-tier/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/[^/]+\/create-schedule/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/Cinema\/create$/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/users\/add-user/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/trips\/create-trip/) ||
    location.pathname.match(/^\/dashboard\/[^/]+\/page-builder/);

  useEffect(() => {
    if (!isLoaded) return;

    // Exempt routes that don't require workspace selection
    if (
      location.pathname === "/dashboard/login" ||
      location.pathname === "/dashboard/create-organizer" ||
      location.pathname === "/dashboard/settings" ||
      location.pathname === "/dashboard/workspaces" ||
      location.pathname === "/dashboard/support" ||
      location.pathname === "/dashboard/workspace-user/activate" ||
      location.pathname.startsWith("/dashboard/billing")
    )
      return;

    if (workspaces.length === 0) {
      navigate({ to: "/dashboard/workspaces" });
    } else if (activeWorkspace && location.pathname === "/dashboard") {
      navigate({ to: `/dashboard/${activeWorkspace.slug}` });
    } else if (activeWorkspace) {
      const pathParts = location.pathname.split("/");
      const urlSlug = pathParts[2];

      if (
        urlSlug &&
        urlSlug !== "workspaces" &&
        urlSlug !== "workspace-user" &&
        urlSlug !== "billing" &&
        urlSlug !== "support" &&
        urlSlug !== "settings" &&
        urlSlug !== activeWorkspace.slug
      ) {
        const workspaceFromUrl = workspaces.find((w: any) => w.slug === urlSlug);
        if (workspaceFromUrl) {
          // setActiveWorkspace(workspaceFromUrl);
        } else {
          navigate({ to: `/dashboard/${activeWorkspace.slug}` });
        }
      }

      const protectedModules: Record<string, string> = {
        events: "events",
        tickets: "tickets",
        rsvps: "rsvps",
        scanner: "scanner",
        products: "products&add-ons",
        merchandise: "merchandise",
        vip: "vip",
        campaigns: "campaigns",
        venues: "venue_listings",
        "venue-designer": "venue_designer",
        experiences: "experiences",
        analytics: "analytics",
        users: "users",
        withdrawals: "withdrawals",
        "page-builder": "page_builder",
        trips: "trips",
        routes: "routes",
        passengers: "passengers",
        vehicles: "vehicles",
      };

      const isModuleAllowedForPath = (path: string) => {
        const pathParts = path.split("/");
        let modName = "";
        if (path.startsWith("/dashboard/")) {
          modName = pathParts[3];
        } else {
          modName = pathParts[1];
        }

        if (!modName) return true;

        const reqMod = protectedModules[modName];
        if (!reqMod) return true; // not protected

        const pMod = platformModules?.find((p: any) => {
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
            Trips: "trips",
            Routes: "routes",
            Passengers: "passengers",
            Vehicles: "vehicles",
          };
          return (
            legacyIdMap[p.label] === reqMod || legacyIdMap[p.label] === reqMod.replace("_", "-")
          );
        });

        return !!(
          (pMod && activeWorkspace.modules?.includes(pMod.id)) ||
          activeWorkspace.modules?.includes(reqMod) ||
          activeWorkspace.modules?.includes(reqMod.replace("_", "-")) ||
          activeWorkspace.modules?.includes("ALL")
        );
      };

      // Enforce module-level route protection for current path
      if (!isModuleAllowedForPath(location.pathname)) {
        if (window.history.length > 2) {
          window.history.back();
        } else {
          navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
        }
        return;
      }

      // Page-level access check for workspace users
      if (currentUser && currentUser.pages && !currentUser.pages.includes("ALL")) {
        let subPath = location.pathname.substring(`/dashboard/${activeWorkspace.slug}`.length);
        if (subPath.length > 1 && subPath.endsWith("/")) {
          subPath = subPath.slice(0, -1);
        }
        if (subPath === "") subPath = "/";

        let isAllowed = false;
        for (const p of currentUser.pages) {
          if (p === subPath) {
            isAllowed = true;
            break;
          }
          if (p.includes("/:")) {
            const base = p.split("/:")[0];
            if (
              subPath.startsWith(base + "/") &&
              subPath.split("/").length === base.split("/").length + 1
            ) {
              isAllowed = true;
              break;
            }
          }
        }

        if (!isAllowed) {
          if (subPath === "/") {
            // User is at root but not allowed, redirect to their first allowed page that also passes module checks
            const validFirstPage = currentUser.pages.find(
              (p: string) => p !== "/" && isModuleAllowedForPath(p),
            );
            if (validFirstPage) {
              navigate({
                to: `/dashboard/${activeWorkspace.slug}${validFirstPage}`,
                replace: true,
              });
            } else {
              // No valid pages. Stop loop by forcing a logout or just stop navigating.
              // For now, redirect to /dashboard/login to kick them out cleanly since they have no valid access.
              navigate({ to: "/dashboard/login", replace: true });
            }
          } else {
            // User tried to access a protected route, redirect back if possible
            if (window.history.length > 2) {
              window.history.back();
            } else {
              navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
            }
          }
          return;
        }
      }
    }
  }, [isLoaded, workspaces, activeWorkspace, location.pathname, navigate, currentUser]);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;

    const docRef = doc(db, "organizer_sessions", activeWorkspace.orgnizer_id);
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === "force_logout") {
          try {
            await logout();
            navigate({ to: "/dashboard/login", replace: true });
          } catch (err) {
            console.error("Logout failed", err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [activeWorkspace?.orgnizer_id, navigate]);

  if (currentUser?.role === "organizer" && currentUser?.isActive === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Account Pending Activation</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Your account is currently under review by the Agatike team. This process usually takes
          between 2 to 24 hours depending on traffic. Once approved, you will be able to create workspaces and manage your Operations.
        </p>
      </div>
    );
  }

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
            ) : isTransportWorkspace ? (
              <TransportSidebar />
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
