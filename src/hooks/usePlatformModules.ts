import { useQuery } from "@tanstack/react-query";
import { getPlatformModules } from "@/api/platform-modules";
import * as LucideIcons from "lucide-react";

export type WorkspaceModule = {
  id: string;
  label: string;
  desc: string;
  href?: string;
  icon: any;
  category: string;
  mandatory?: boolean;
};

// Defines the canonical order for the sidebar nav.
// Dashboard must always be first. Modules not listed here appear at the end.
const CANONICAL_ORDER: string[] = [
  "Dashboard",
  "Events",
  "Tickets",
  "RSVPs",
  "Attendees",
  "Scanning",
  "Products & Add-ons",
  "Merchandise",
  "VIP Access",
  "Campaigns",
  "Venue Listings",
  "Venue Designer",
  "Badge Designer",
  "Page Builder",
  "Experiences",
  "Analytics",
  "Withdrawals",
  "Settings",
];

export function usePlatformModules() {
  return useQuery({
    queryKey: ["platformModules"],
    queryFn: async () => {
      const data = await getPlatformModules();
      const mapped = data.map((mod) => ({
        ...mod,
        icon: (LucideIcons as any)[mod.icon] || LucideIcons.LayoutDashboard,
      })) as WorkspaceModule[];

      // Sort by the canonical order; unknown modules go to the end
      mapped.sort((a, b) => {
        const ai = CANONICAL_ORDER.indexOf(a.label);
        const bi = CANONICAL_ORDER.indexOf(b.label);
        const aIdx = ai === -1 ? 999 : ai;
        const bIdx = bi === -1 ? 999 : bi;
        return aIdx - bIdx;
      });

      // Inject Community module if it doesn't exist
      if (!mapped.find(m => m.label === "Community")) {
        mapped.push({
          id: "community",
          label: "Community",
          desc: "Engage with your followers",
          href: "community",
          icon: LucideIcons.Users,
          category: "Engagement",
          mandatory: true,
        });
      }

      return mapped;
    },
  });
}
