import { Link, useRouterState } from "@tanstack/react-router";
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
    { label: "All services", href: "/internal/control/admin/services", icon: LucideIcons.List },
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
    { label: "Modules", href: "/internal/control/admin/modules", icon: LucideIcons.Package },
    { type: "divider" },
    {
      label: "Help + support",
      href: "/internal/control/admin/support",
      icon: LucideIcons.HelpCircle,
    },
  ];

  const renderNavItem = (n: any, idx: number) => {
    if (n.type === "divider") {
      return <div key={`div-${idx}`} className="h-px bg-[#333333] my-2 mx-3" />;
    }

    const isActive =
      n.href === "/internal/control/admin"
        ? location.pathname === n.href
        : location.pathname.startsWith(n.href);

    const cls = `flex w-full items-center gap-3 px-4 py-2 text-xs transition-colors border-l-2 ${
      isActive
        ? "border-[#f97316] bg-[#252526] text-white"
        : "border-transparent text-[#cccccc] hover:bg-[#2d2d30] hover:text-white"
    }`;

    return (
      <Link key={n.label} to={n.href as any} className={cls}>
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
