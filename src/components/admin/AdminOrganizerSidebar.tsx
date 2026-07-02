import { Link, useRouterState, useParams } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";

export function AdminOrganizerSidebar() {
  const location = useRouterState({ select: (s) => s.location });
  // The route parameter is called organizerId
  const params = useParams({ strict: false });
  const orgId = (params as any).organizerId;

  if (!orgId) return null;

  const basePath = `/internal/control/admin/organizers/${orgId}`;

  const mainNav = [
    { label: "Back to Organizers", href: "/internal/control/admin/organizers", icon: LucideIcons.ArrowLeft },
    { type: "divider" },
    { label: "Overview", href: basePath, icon: LucideIcons.LayoutDashboard, exact: true },
    { label: "Subscriptions", href: `${basePath}/subscriptions`, icon: LucideIcons.CreditCard },
    { label: "Invoices", href: `${basePath}/invoices`, icon: LucideIcons.Receipt },
    { type: "divider" },
    { label: "Workspaces", href: `${basePath}/workspaces`, icon: LucideIcons.Building2 },
    { label: "Memberships", href: `${basePath}/memberships`, icon: LucideIcons.Users },
    { label: "Workspace Users", href: `${basePath}/users`, icon: LucideIcons.UserCog },
    { type: "divider" },
    { label: "Venues", href: `${basePath}/venues`, icon: LucideIcons.MapPin },
    { label: "Events", href: `${basePath}/events`, icon: LucideIcons.Calendar },
    { label: "Projects", href: `${basePath}/projects`, icon: LucideIcons.Ticket },
    { label: "Contributors", href: `${basePath}/contributors`, icon: LucideIcons.Users2 },
    { label: "Forms", href: `${basePath}/forms`, icon: LucideIcons.ClipboardList },
    { label: "RSVPs", href: `${basePath}/rsvps`, icon: LucideIcons.UserCheck },
    { label: "Attendees", href: `${basePath}/attendees`, icon: LucideIcons.UserRound },
    { type: "divider" },
    { label: "Agatike Book", href: `${basePath}/book`, icon: LucideIcons.BookOpen },
    { label: "Book Invoices", href: `${basePath}/book-invoices`, icon: LucideIcons.FileText },
    { type: "divider" },
    { label: "Settings", href: `${basePath}/settings`, icon: LucideIcons.Settings },
  ];

  const renderNavItem = (n: any, idx: number) => {
    if (n.type === "divider") {
      return <div key={`div-${idx}`} className="h-px bg-[#333333] my-2 mx-3" />;
    }

    const isActive = n.exact
      ? location.pathname === n.href
      : location.pathname.startsWith(n.href) && n.href !== "/internal/control/admin/organizers";

    const cls = `flex w-full items-center gap-3 px-4 py-2 text-xs transition-colors border-l-2 ${
      isActive
        ? "border-[#f97316] bg-[#252526] text-white"
        : "border-transparent text-[#cccccc] hover:bg-[#2d2d30] hover:text-white"
    }`;

    return (
      <Link key={n.label} to={n.href} className={cls}>
        <n.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#f97316]" : "text-[#cccccc]"}`} />
        <span className="truncate flex-1">{n.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-52 shrink-0 border-r border-[#333333] bg-[#1b1b1c] py-2 flex-col md:flex overflow-y-auto font-sans">
      <nav className="space-y-0 text-sm flex-1">
        {mainNav.map((n, idx) => renderNavItem(n, idx))}
      </nav>
    </aside>
  );
}
