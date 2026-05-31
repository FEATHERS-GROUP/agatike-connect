import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";

export function DesktopSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const { activeWorkspace } = useWorkspace();

  const { data: platformModules = [] } = usePlatformModules();

  // If no workspace or modules are loaded, we can't show much
  const userModuleIds = activeWorkspace?.modules || [];
  
  // Filter platform modules based on user's active workspace modules.
  // We maintain the order defined in the database.
  const nav = platformModules.filter(m => {
    if (m.mandatory) return true;
    if (userModuleIds.includes(m.id)) return true;
    
    // Fallback for legacy workspaces created before DB migration
    const legacyIdMap: Record<string, string> = {
      "Dashboard": "dashboard",
      "Events": "events",
      "Tickets": "tickets",
      "RSVPs": "rsvps",
      "Attendees": "rsvps",
      "Scanning": "scanner",
      "Merchandise": "merchandise",
      "VIP Access": "vip",
      "Campaigns": "campaigns",
      "Venue Listings": "venue_listings",
      "Venue Designer": "venue_designer",
      "Experiences": "experiences",
      "Analytics": "analytics",
      "Withdrawals": "withdrawals",
      "Settings": "settings"
    };
    
    const legacyId = legacyIdMap[m.label];
    return legacyId && userModuleIds.includes(legacyId);
  });

  const workspacePrefix = activeWorkspace ? `/dashboard/${activeWorkspace.slug}` : "/dashboard";

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex md:flex-col overflow-y-auto">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2 shrink-0">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold"
          style={{ background: "var(--gradient-primary)" }}
        >
          A
        </div>
        <span className="text-lg font-semibold">Agatike</span>
      </Link>
      
      <WorkspaceSwitcher />

      <nav className="space-y-1 text-sm flex-1">
        {nav.map((n) => {
          // Construct the full href: e.g. /dashboard/kigali-arenas/events
          const fullHref = n.href !== undefined ? (n.href === "" ? workspacePrefix : `${workspacePrefix}/${n.href}`) : null;
          
          let isActive = false;
          if (fullHref) {
            // Dashboard root is active exactly at the prefix
            if (n.href === "") {
              isActive = location.pathname === fullHref;
            } else {
              isActive = location.pathname.startsWith(fullHref);
            }
          }
          
          const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`;
          
          return fullHref ? (
            <Link key={n.id} to={fullHref} className={cls}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ) : (
            <button key={n.id} className={cls}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 rounded-2xl border border-border/60 p-4 shrink-0">
        <p className="text-sm font-semibold">Upgrade to Pro</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Branded pages, marketing & advanced analytics.
        </p>
        <Button
          className="mt-3 w-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        >
          Upgrade
        </Button>
      </div>
    </aside>
  );
}
