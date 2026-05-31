import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStaffByBadgeId } from "@/api/staff";
import { getBadgeProjectByEventId } from "@/api/badges";
import { Loader2, AlertCircle } from "lucide-react";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";

export const Route = createFileRoute("/public/badge/$badgeId")({
  component: PublicBadgeView,
});

function PublicBadgeView() {
  const { badgeId } = Route.useParams();

  const {
    data: staff,
    isLoading: staffLoading,
    error: staffError,
  } = useQuery({
    queryKey: ["staff-by-badge", badgeId],
    queryFn: async () => {
      const res = await getStaffByBadgeId({ data: { badge_qr_string: badgeId } } as any);
      if (!res) throw new Error("Badge not found");
      return res;
    },
    enabled: !!badgeId,
  });

  const eventId = staff?.event_id;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: async () => {
      const res = await getBadgeProjectByEventId({ data: { event_id: eventId } } as any);
      // We don't strictly throw if null, we might just show a fallback badge.
      return res;
    },
    enabled: !!eventId,
  });

  if (staffLoading || projectLoading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading your secure digital badge...</p>
      </div>
    );
  }

  if (staffError || !staff) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-400 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Badge Not Found</h1>
        <p>This digital badge link appears to be invalid or has been revoked.</p>
      </div>
    );
  }

  // Build the mock config for BadgePreview from the DB row.
  const isUnregistered = !staff.user_id && (staff.first_name || staff.last_name);
  const displayName = isUnregistered
    ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim()
    : `User ${staff.user_id?.substring(0, 6) || "Unknown"}`;

  const displayInitials = isUnregistered
    ? `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase()
    : "US";

  // Use the actual project config if available, otherwise use defaults
  const badgeConfig = {
    theme: project?.theme || "dark",
    accentColor: project?.accent_color || "#3b82f6",
    gradientClass: project?.gradient_class || "from-blue-600 to-cyan-500",
    bgImageUrl: project?.bg_image_url || "",
    logoText: project?.logo_text || "EVENT LOGO",
    fontFamily: project?.font_family || "font-sans",
    showUserImage: project?.show_user_image ?? true,
    sponsors: Array.isArray(project?.sponsors_json) ? project.sponsors_json : [],
    frontDesign: project?.front_design || { elements: [] },
    backDesign: project?.back_design || {
      rulesText: "NON-TRANSFERABLE\nValid only for the specified event date.",
    },
  };

  const [activeSide, setActiveSide] = React.useState<"front" | "back">("front");

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[400px] mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-zinc-100 text-xl font-bold tracking-tight">Official Event Badge</h1>
          <p className="text-zinc-500 text-sm mt-1">Please present this badge for scanning</p>
        </div>

        {/* The Badge Container */}
        <div className="flex justify-center w-full">
          <BadgePreview
            config={badgeConfig}
            isDesigner={false}
            activeSide={activeSide}
            mockUser={{
              name: displayName,
              role: staff.role,
              qrString: staff.badge_qr_string,
              sectionName: "ALL ACCESS", // We could fetch the section name if needed
              initials: displayInitials,
            }}
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setActiveSide((prev) => (prev === "front" ? "back" : "front"))}
            className="px-6 py-2 rounded-full bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-2"
          >
            Flip to {activeSide === "front" ? "Back" : "Front"}
          </button>
        </div>

        <div className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</p>
            <p
              className={`font-bold mt-1 ${staff.status === "active" ? "text-emerald-400" : "text-amber-400"}`}
            >
              {staff.status === "active" ? "VALID" : staff.status.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Badge ID</p>
            <p className="font-mono text-zinc-300 mt-1">{staff.badge_qr_string}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
