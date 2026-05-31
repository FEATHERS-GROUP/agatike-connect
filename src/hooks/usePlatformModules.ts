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

export function usePlatformModules() {
  return useQuery({
    queryKey: ["platformModules"],
    queryFn: async () => {
      const data = await getPlatformModules();
      return data.map((mod) => ({
        ...mod,
        icon: (LucideIcons as any)[mod.icon] || LucideIcons.LayoutDashboard,
      })) as WorkspaceModule[];
    },
  });
}
