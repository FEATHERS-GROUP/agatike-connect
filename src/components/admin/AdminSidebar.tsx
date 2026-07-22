import { Link, useRouterState, useRouteContext } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";

export function AdminSidebar() {
  const location = useRouterState({ select: (s) => s.location });

  const mainNav = [
    { label: "Home", href: "/internal/control/admin", icon: LucideIcons.Home },
    {
      label: "Dashboard",
      href: "/internal/control/admin/dashboard",
      icon: LucideIcons.LayoutDashboard,
    },
    {
      label: "Master Schedule",
      href: "/internal/control/admin/master-schedule",
      icon: LucideIcons.List,
    },
    { label: "Moderation", href: "/internal/control/admin/moderation", icon: LucideIcons.Activity },
    { type: "divider" },
    {
      label: "Agatike Users",
      href: "/internal/control/admin/agatike-users",
      icon: LucideIcons.UserCheck,
    },
    { label: "Users & Roles", href: "/internal/control/admin/users", icon: LucideIcons.Users },
    {
      label: "Organizers",
      href: "/internal/control/admin/organizers",
      icon: LucideIcons.Building2,
    },
    {
      label: "Leads",
      href: "/internal/control/admin/leads",
      icon: LucideIcons.Megaphone,
    },
    {
      label: "Transactions",
      href: "/internal/control/admin/transactions",
      icon: LucideIcons.CreditCard,
    },
    { label: "System Health", href: "/internal/control/admin/health", icon: LucideIcons.Activity },
    {
      label: "Moderation",
      href: "/internal/control/admin/moderation",
      icon: LucideIcons.ShieldAlert,
    },
    { type: "divider" },
    {
      label: "Provider Fees",
      href: "/internal/control/admin/providers",
      icon: LucideIcons.Percent,
    },
    {
      label: "Pricing Plans",
      href: "/internal/control/admin/pricing",
      icon: LucideIcons.Tags,
    },
    {
      label: "Earnings Analytics",
      href: "/internal/control/admin/earnings",
      icon: LucideIcons.LineChart,
    },
    { type: "divider" },
    { label: "Modules", href: "/internal/control/admin/modules", icon: LucideIcons.Package },
    { type: "divider" },
    {
      label: "Help + support",
      href: "/internal/control/admin/support",
      icon: LucideIcons.HelpCircle,
    },
  ];

  const { session } = useRouteContext({ from: "/internal/control/admin" }) as any;
  const permissions = session?.permissions || [];
  const isSuperAdmin = session?.is_super_admin;

  const filteredNav = mainNav.filter((n) => {
    if (n.type === "divider") return true;
    if (isSuperAdmin) return true;
    if (n.href === "/internal/control/admin") return true; // Everyone sees home
    return permissions.some((p: string) => n.href?.startsWith(p));
  });

  const renderNavItem = (n: any, idx: number) => {
    if (n.type === "divider") {
      return <div key={`div-${idx}`} className="h-px bg-gray-200 dark:bg-[#333333] my-2 mx-3" />;
    }

    const isActive =
      n.href === "/internal/control/admin"
        ? location.pathname === n.href
        : location.pathname.startsWith(n.href);

    const cls = `flex w-full items-center gap-3 px-4 py-2 text-xs transition-colors border-l-2 ${
      isActive
        ? "border-[#f97316] bg-gray-200 dark:bg-[#252526] text-gray-900 dark:text-white"
        : "border-transparent text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-[#2d2d30] hover:text-gray-900 dark:hover:text-white"
    }`;

    return (
      <Link key={n.label} to={n.href as any} className={cls}>
        <n.icon
          className={`h-4 w-4 shrink-0 ${isActive ? "text-[#f97316]" : "text-gray-700 dark:text-[#cccccc]"}`}
        />
        <span className="truncate flex-1">{n.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-52 shrink-0 border-r border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1b1b1c] py-2 flex-col md:flex overflow-y-auto font-sans">
      <nav className="space-y-0 text-sm flex-1">
        {filteredNav.map((n, idx) => renderNavItem(n, idx))}
      </nav>
    </aside>
  );
}
