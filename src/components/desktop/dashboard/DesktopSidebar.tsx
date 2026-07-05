import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePlatformModules } from "@/hooks/usePlatformModules";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { CommunityBadge } from "./CommunityBadge";
import { ExperienceBadge } from "./ExperienceBadge";
import { NotificationBell } from "./NotificationBell";
import { BillingBanner } from "./BillingBanner";

export function DesktopSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  const { activeWorkspace, currentUser } = useWorkspace();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isBillingGroupOpen, setIsBillingGroupOpen] = useState(false);

  const { data: platformModules = [] } = usePlatformModules();

  // If no workspace or modules are loaded, we can't show much
  const userModuleIds = activeWorkspace?.modules || [];

  // Filter platform modules based on user's active workspace modules.
  // We maintain the order defined in the database.
  const nav = platformModules.filter((m) => {
    if (m.mandatory && currentUser?.role === "organizer") return true;
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
      Users: "users",
      Withdrawals: "withdrawals",
      Settings: "settings",
      "Page Builder": "page_builder",
      "Badge Designer": "badge_designer",
      "Ticket Designer": "ticket_designer",
    };

    const legacyId = legacyIdMap[m.label];
    return legacyId && userModuleIds.includes(legacyId);
  });

  const studioLabels = ["Badge Designer", "Venue Designer", "Tickets", "Page Builder"];
  const mainNav = nav.filter((m) => !studioLabels.includes(m.label) && m.label !== "Agatike Book");
  const studioNav = nav.filter((m) => studioLabels.includes(m.label));
  const hasBook = nav.some((m) => m.label === "Agatike Book");

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
        <span className="truncate flex-1">{n.label}</span>
        {n.label === "Community" && <CommunityBadge />}
        {n.label === "Events" && <ExperienceBadge />}
      </Link>
    ) : (
      <button key={n.id} className={cls}>
        <n.icon className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1">{n.label}</span>
        {n.label === "Community" && <CommunityBadge />}
        {n.label === "Events" && <ExperienceBadge />}
      </button>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:flex md:flex-col overflow-y-auto">
      <div className="mb-5 flex items-center justify-between px-1 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/agatike-logo.svg" alt="Agatike" className="h-7 w-auto object-contain" />
        </Link>
        <NotificationBell />
      </div>

      <WorkspaceSwitcher />

      <nav className="space-y-0.5 text-sm flex-1">
        {mainNav.map((n) => renderNavItem(n))}

        {hasBook && (
          <div className="mt-2 space-y-0.5">
            <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-left text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Link
                to={
                  activeWorkspace
                    ? (`/dashboard/${activeWorkspace.slug}/book` as any)
                    : ("/dashboard/book" as any)
                }
                className="flex items-center gap-2.5 flex-1 py-1"
              >
                <LucideIcons.BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">Agatike Book</span>
              </Link>
              <button
                onClick={() => setIsBookOpen(!isBookOpen)}
                className="p-1 hover:bg-secondary/80 rounded transition-colors"
              >
                {isBookOpen ? (
                  <LucideIcons.ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <LucideIcons.ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </button>
            </div>
            {isBookOpen && activeWorkspace && (
              <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-border/40 pl-2">
                <Link
                  to={`/dashboard/${activeWorkspace.slug}/book/tasks` as any}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    location.pathname.includes("/book/tasks")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <LucideIcons.CheckSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">Tasks</span>
                </Link>
                <Link
                  to={`/dashboard/${activeWorkspace.slug}/book/notes` as any}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    location.pathname.includes("/book/notes")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <LucideIcons.StickyNote className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">Notes</span>
                </Link>
                <Link
                  to={`/dashboard/${activeWorkspace.slug}/book/finance` as any}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    location.pathname.includes("/book/finance")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <LucideIcons.TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">Finance</span>
                </Link>
                <Link
                  to={`/dashboard/${activeWorkspace.slug}/book/books` as any}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    location.pathname.includes("/book/books")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <LucideIcons.FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">Custom Books</span>
                </Link>
                <Link
                  to={`/dashboard/${activeWorkspace.slug}/book/procurement` as any}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    location.pathname.includes("/book/procurement")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <LucideIcons.ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">Procurement</span>
                </Link>
              </div>
            )}
          </div>
        )}

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

        <div className="mt-2 space-y-0.5">
          <button
            onClick={() => setIsBillingGroupOpen(!isBillingGroupOpen)}
            className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <div className="flex items-center gap-2.5">
              <LucideIcons.CreditCard className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium">Billing & Plans</span>
            </div>
            {isBillingGroupOpen ? (
              <LucideIcons.ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <LucideIcons.ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
          {isBillingGroupOpen && (
            <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-border/40 pl-2">
              <Link
                to="/dashboard/billing"
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  location.pathname === "/dashboard/billing"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <LucideIcons.LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">Overview</span>
              </Link>
              <Link
                to="/dashboard/billing/subscriptions"
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  location.pathname.startsWith("/dashboard/billing/subscriptions")
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <LucideIcons.Zap className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">Subscriptions</span>
              </Link>
              <Link
                to="/dashboard/billing/invoices"
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  location.pathname.startsWith("/dashboard/billing/invoices")
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <LucideIcons.Receipt className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">Invoices</span>
              </Link>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <div className="mt-2 pt-2 border-t border-border/40">
          <Link
            to="/dashboard/support"
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
              location.pathname === "/dashboard/support"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <LucideIcons.LifeBuoy className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1">Help &amp; Support</span>
          </Link>
        </div>
      </nav>

      {currentUser &&
        (currentUser.isBasic || currentUser.isExpiringSoon || currentUser.isExpired) && (
          <div className="mt-4 relative rounded-xl border border-border/60 bg-accent/20 p-3.5 shrink-0">
            {currentUser.isBasic ? (
              <>
                {currentUser.isTrialActive && (
                  <div className="absolute -top-3 -right-2 animate-bounce bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    {currentUser.trialDaysLeft} days left!
                  </div>
                )}
                {currentUser.isTrialExpired && (
                  <div className="absolute -top-3 -right-2 animate-bounce bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    Trial Expired
                  </div>
                )}
                <p className="text-sm font-semibold">Upgrade to Pro</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Branded pages, marketing & advanced analytics.
                </p>
                <Button
                  asChild
                  className="mt-3 w-full rounded-full text-xs h-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/dashboard/billing/subscriptions/pricingplans">Upgrade</Link>
                </Button>
              </>
            ) : (
              <>
                {currentUser.isExpiringSoon && !currentUser.isExpired && (
                  <div className="absolute -top-3 -right-2 animate-bounce bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    {currentUser.daysUntilExpiration === 0
                      ? "Expires Today!"
                      : `${currentUser.daysUntilExpiration} days left`}
                  </div>
                )}
                {currentUser.isExpired && (
                  <div className="absolute -top-3 -right-2 animate-bounce bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    Expired
                  </div>
                )}
                <p className="text-sm font-semibold">Renew Subscription</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your {currentUser.planName || "Pro"} plan is expiring. Renew to keep your
                  features.
                </p>
                <Button
                  asChild
                  className="mt-3 w-full rounded-full text-xs h-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/dashboard/billing/subscriptions/pricingplans">Renew Now</Link>
                </Button>
              </>
            )}
          </div>
        )}

      {/* Add Billing Banner to the bottom of the sidebar */}
      <div className="mt-4 px-2 shrink-0">
        <BillingBanner />
      </div>
    </aside>
  );
}

