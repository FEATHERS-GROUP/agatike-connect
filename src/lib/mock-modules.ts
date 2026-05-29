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
  Map,
  Store,
  Mountain,
} from "lucide-react";

export type WorkspaceModule = {
  id: string;
  label: string;
  desc: string;
  href?: string;
  icon: any;
  category: "CORE" | "EVENT" | "VENUE" | "SALES" | "EXPERIENCE";
  mandatory?: boolean;
};

// Simulating a database pull of all available platform modules
export const platformModules: WorkspaceModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    desc: "Overview of your workspace.",
    href: "",
    icon: LayoutDashboard,
    category: "CORE",
    mandatory: true,
  },
  {
    id: "events",
    label: "Events",
    desc: "Create and manage your events.",
    href: "events",
    icon: CalendarDays,
    category: "EVENT",
  },
  {
    id: "tickets",
    label: "Tickets",
    desc: "Design and manage ticket tiers.",
    href: "ticket-designer", // Note: This might be outside dashboard in current architecture, but we'll adapt.
    icon: Ticket,
    category: "EVENT",
  },
  {
    id: "attendees",
    label: "Attendees",
    desc: "Manage guest lists and CRM.",
    icon: Users,
    category: "EVENT",
  },
  {
    id: "scanner",
    label: "Scanning",
    desc: "Access control and ticket scanning.",
    href: "scanner",
    icon: ScanLine,
    category: "EVENT",
  },
  {
    id: "merchandise",
    label: "Merchandise",
    desc: "Sell physical products.",
    icon: ShoppingBag,
    category: "SALES",
  },
  {
    id: "vip",
    label: "VIP Access",
    desc: "Manage table bookings and VIPs.",
    icon: Crown,
    category: "SALES",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    desc: "Marketing and promo codes.",
    icon: Megaphone,
    category: "SALES",
  },
  {
    id: "venue_listings",
    label: "Venue Listings",
    desc: "List your property for rent.",
    href: "venue-rent",
    icon: Store,
    category: "VENUE",
  },
  {
    id: "venue_designer",
    label: "Venue Designer",
    desc: "Map out seats and tables.",
    href: "venue-designer",
    icon: Map,
    category: "VENUE",
  },
  {
    id: "experiences",
    label: "Experiences",
    desc: "Manage tours and retreats.",
    href: "experiences",
    icon: Mountain,
    category: "EXPERIENCE",
  },
  {
    id: "analytics",
    label: "Analytics",
    desc: "Detailed reports and charts.",
    icon: BarChart3,
    category: "CORE",
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    desc: "Manage payouts and wallets.",
    icon: Wallet,
    category: "CORE",
  },
  {
    id: "settings",
    label: "Settings",
    desc: "Workspace configuration.",
    icon: Settings,
    category: "CORE",
    mandatory: true,
  },
];
