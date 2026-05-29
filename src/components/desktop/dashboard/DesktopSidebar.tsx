import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  BarChart3,
  Users,
  ScanLine,
  ShoppingBag,
  Crown,
  Megaphone,
  Wallet,
  Settings,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Workspaces", icon: Building2 },
  { label: "Events", icon: CalendarDays },
  { label: "Tickets", icon: Ticket },
  { label: "Analytics", icon: BarChart3 },
  { label: "Attendees", icon: Users },
  { label: "Scanning", icon: ScanLine },
  { label: "Merchandise", icon: ShoppingBag },
  { label: "VIP Access", icon: Crown },
  { label: "Campaigns", icon: Megaphone },
  { label: "Withdrawals", icon: Wallet },
  { label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:block">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold"
          style={{ background: "var(--gradient-primary)" }}
        >
          A
        </div>
        <span className="text-lg font-semibold">Agatike</span>
      </Link>
      <nav className="space-y-1 text-sm">
        {nav.map((n) => {
          const href =
            n.label === "Workspaces"
              ? "/workspaces"
              : n.label === "Scanning"
                ? "/scanner"
                : null;
          const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${n.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`;
          return href ? (
            <Link key={n.label} to={href} className={cls}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ) : (
            <button key={n.label} className={cls}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-8 rounded-2xl border border-border/60 p-4">
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
