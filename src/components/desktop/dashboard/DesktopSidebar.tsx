import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import * as LucideIcons from "lucide-react";
import { useState } from "react";

export function DesktopSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const { activeWorkspace } = useWorkspace();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const { data: platformModules = [] } = usePlatformModules();

  // If no workspace or modules are loaded, we can't show much
  const userModuleIds = activeWorkspace?.modules || [];

  // Filter platform modules based on user's active workspace modules.
  // We maintain the order defined in the database.
  const nav = platformModules.filter((m) => {
    if (m.mandatory) return true;
    if (userModuleIds.includes(m.id)) return true;

    // Fallback for legacy workspaces created before DB migration
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
      Withdrawals: "withdrawals",
      Settings: "settings",
    };

    const legacyId = legacyIdMap[m.label];
    return legacyId && userModuleIds.includes(legacyId);
  });

  const studioLabels = ["Badge Designer", "Venue Designer", "Venue Listings", "Page Builder"];
  const mainNav = nav.filter((m) => !studioLabels.includes(m.label));
  const studioNav = nav.filter((m) => studioLabels.includes(m.label));

  const workspacePrefix = activeWorkspace ? `/dashboard/${activeWorkspace.slug}` : "/dashboard";

  const renderNavItem = (n: any) => {
    // Construct the full href: e.g. /dashboard/kigali-arenas/events
    const fullHref =
      n.href !== undefined
        ? n.href === ""
          ? workspacePrefix
          : `${workspacePrefix}/${n.href}`
        : null;

    let isActive = false;
    if (fullHref) {
      // Dashboard root is active exactly at the prefix
      if (n.href === "") {
        isActive = location.pathname === fullHref;
      } else {
        isActive = location.pathname.startsWith(fullHref);
      }
    }

    const cls = `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
      isActive
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

    return fullHref ? (
      <Link key={n.id} to={fullHref} className={cls}>
        <n.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{n.label}</span>
      </Link>
    ) : (
      <button key={n.id} className={cls}>
        <n.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{n.label}</span>
      </button>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex md:flex-col overflow-y-auto">
      <Link to="/" className="mb-5 flex items-center gap-2.5 px-1 shrink-0">
        <img src="/agatike-logo.svg" alt="Agatike" className="h-7 w-auto object-contain" />
      </Link>

      <WorkspaceSwitcher />

      <nav className="space-y-0.5 text-sm flex-1">
        {mainNav.map((n) => renderNavItem(n))}

        {studioNav.length > 0 && (
          <div className="mt-2 space-y-0.5">
            <button
              onClick={() => setIsStudioOpen(!isStudioOpen)}
              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <div className="flex items-center gap-2.5">
                <LucideIcons.Wand2 className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">Agatike Studio</span>
              </div>
              {isStudioOpen ? (
                <LucideIcons.ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <LucideIcons.ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {isStudioOpen && (
              <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-border/40 pl-2">
                {studioNav.map((n) => renderNavItem(n))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="mt-4 rounded-xl border border-border/60 bg-accent/20 p-3.5 shrink-0">
        <p className="text-sm font-semibold">Upgrade to Pro</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Branded pages, marketing & advanced analytics.
        </p>
        <Button
          asChild
          className="mt-3 w-full rounded-full text-xs h-8"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Link to="/dashboard/pricing">Upgrade</Link>
        </Button>
      </div>
    </aside>
  );
}
