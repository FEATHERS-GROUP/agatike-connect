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
  "Experiences",
  "Cinema / Theater",
  "Spaces",
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
  "Memberships",
  "Badge Designer",
  "Page Builder",
  "Analytics",
  "Community",
  "Agatike Book",
  "Users",
  "Withdrawals",
  "Settings",
];

export function usePlatformModules() {
  return useQuery({
    queryKey: ["platformModules", "v2"],
    queryFn: async () => {
      const data = await getPlatformModules();
      const mapped = data.map((mod) => {
        let href = mod.href;
        if (mod.label === "Page Builder" && !href) href = "page-builder";
        if (mod.label === "Badge Designer" && !href) href = "badge-designer";
        if (mod.label === "Venue Designer" && !href) href = "venue-designer";
        if (!href && href !== "") href = mod.id; // fallback

        return {
          ...mod,
          href,
          icon: (LucideIcons as any)[mod.icon] || LucideIcons.LayoutDashboard,
          category: mod.label === "Venue Designer" ? "SHARED" : mod.category,
        };
      }) as WorkspaceModule[];

      // Sort by the canonical order; unknown modules go to the end
      mapped.sort((a, b) => {
        const ai = CANONICAL_ORDER.indexOf(a.label);
        const bi = CANONICAL_ORDER.indexOf(b.label);
        const aIdx = ai === -1 ? 999 : ai;
        const bIdx = bi === -1 ? 999 : bi;
        return aIdx - bIdx;
      });

      // Inject Community module if it doesn't exist
      if (!mapped.find((m) => m.label === "Community")) {
        mapped.push({
          id: "community",
          label: "Community",
          desc: "Engage with your followers",
          href: "community",
          icon: LucideIcons.Users,
          category: "SHARED",
          mandatory: true,
        });
      }

      return mapped;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours for platform modules
    refetchOnWindowFocus: false,
  });
}

export function getModulesForWorkspaceType(
  modules: WorkspaceModule[],
  type: string,
  isBusiness: boolean = true,
): WorkspaceModule[] {
  const allowedCategories = ["SHARED"];

  if (type === "EVENT") {
    allowedCategories.push("EVENT", "SALES");
  } else if (type === "EXPERIENCE") {
    allowedCategories.push("EXPERIENCE", "SALES");
  } else if (type === "VENUE" || type === "SPACE" || type === "GYM") {
    allowedCategories.push("VENUE");
  } else if (type === "CINEMA" || type === "THEATER") {
    allowedCategories.push("MOVIES");
  } else if (type === "TRANSPORT") {
    allowedCategories.push("TRANSPORT", "SALES");
  }

  return modules.filter((m) => {
    if (!isBusiness) {
      const businessOnlyModules = [
        "Agatike Book",
        "Cinema / Theater",
        "Spaces",
        "Venue Listings",
        "Badge Designer",
      ];
      if (businessOnlyModules.includes(m.label)) {
        return false;
      }
    }

    if (!m.category) return true; // Show uncategorized as fallback just in case
    const cat = m.category.toUpperCase();
    return allowedCategories.includes(cat);
  });
}
