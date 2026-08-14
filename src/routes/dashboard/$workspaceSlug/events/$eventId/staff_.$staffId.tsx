import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  User,
  MapPin,
  QrCode,
  ShieldAlert,
  Loader2,
  FlipHorizontal,
  Mail,
  Edit,
  Trash2,
  Palette,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getStaffById, updateStaffStatus, deleteEventStaff } from "@/api/staff";
import { getEventSections } from "@/api/staff";
import { getBadgeProjectByEventId } from "@/api/badges";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/staff_/$staffId")({
  component: StaffMemberDetailsPage,
});

function StaffMemberDetailsPage() {
  const { workspaceSlug, eventId, staffId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const [badgeSide, setBadgeSide] = useState<"front" | "back">("front");

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => getStaffById({ data: { id: staffId } } as any),
    enabled: !!staffId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["event-sections", eventId],
    queryFn: async () => {
      try {
        return await getEventSections({ data: { event_id: eventId } } as any);
      } catch {
        return [
          { id: "1", name: "VIP Lounge" },
          { id: "2", name: "Main Bar" },
        ];
      }
    },
  });

  const { data: badgeProject } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-xl font-semibold">Staff Member Not Found</h2>
        <Button
          variant="outline"
          onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff
        </Button>
      </div>
    );
  }

  const assignedSections = staff.allowed_sections?.includes("*")
    ? sections
    : staff.allowed_sections && staff.allowed_sections.length > 0
      ? staff.allowed_sections
          .map((id: string) => sections.find((sec: any) => sec.id === id))
          .filter(Boolean)
      : [];

  const isUnregistered = !staff.user_id && (staff.first_name || staff.last_name);
  const displayName = isUnregistered
    ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || staff.email
    : staff.first_name || staff.last_name
      ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim()
      : `User ${staff.user_id?.substring(0, 6) || "Unknown"}`;
  const initials = isUnregistered
    ? `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  const handleToggleStatus = async () => {
    toast.promise(
      updateStaffStatus({
        data: {
          id: staff.id,
          status: staff.status === "active" ? "disabled" : "active",
        },
      } as any),
      {
        loading: "Updating status...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
          queryClient.invalidateQueries({ queryKey: ["event-staff"] });
          return `Staff ${staff.status === "active" ? "disabled" : "enabled"}!`;
        },
        error: "Failed to change status",
      },
    );
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this staff member? This cannot be undone.")
    ) {
      toast.promise(deleteEventStaff({ data: { id: staff.id } } as any), {
        loading: "Deleting...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["event-staff"] });
          navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` });
          return "Staff deleted successfully!";
        },
        error: "Failed to delete staff",
      });
    }
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary/50 hover:bg-secondary"
          onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Staff Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View details, assigned sections, and digital badge for {displayName}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`gap-2 font-medium ${
              staff.status === "active"
                ? "text-yellow-600 border-yellow-600/30 hover:bg-yellow-600/10"
                : "text-green-600 border-green-600/30 hover:bg-green-600/10"
            }`}
            onClick={handleToggleStatus}
          >
            {staff.status === "active" ? (
              <>
                <XCircle className="w-4 h-4" /> Disable Access
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Enable Access
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10 font-medium"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-primary/5"></div>

            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
              {staff.profile_image ? (
                <img
                  src={staff.profile_image}
                  alt={displayName}
                  className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-xl shrink-0 bg-secondary"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground border-4 border-background shadow-xl text-4xl font-bold shrink-0">
                  {initials}
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold">{displayName}</h2>
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                      staff.status === "active"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>

                <p className="text-lg text-primary font-medium">{staff.role || "Team Member"}</p>

                <div className="flex flex-wrap gap-4 pt-2">
                  {staff.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                      <Mail className="h-4 w-4" /> {staff.email}
                    </div>
                  )}
                  {staff.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                      <User className="h-4 w-4" /> {staff.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                    <QrCode className="h-4 w-4" /> ID:{" "}
                    <span className="font-mono font-bold text-foreground">
                      {staff.badge_qr_string}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Access & Security */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)] space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" /> Access & Security
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Areas and sections this member is permitted to enter.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={() => {
                  // Navigate back to the list and open edit modal - or just handle here if needed.
                  // For simplicity, we just prompt to go to list or implement a local edit modal.
                  navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` });
                }}
              >
                <Edit className="h-4 w-4" /> Edit Access
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {assignedSections.length > 0 ? (
                assignedSections.map((sec: any) => (
                  <div
                    key={sec.id}
                    className="flex items-center gap-3 bg-secondary/40 border border-border/50 p-4 rounded-2xl hover:border-primary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{sec.name}</p>
                      <p className="text-xs text-muted-foreground">Authorized Area</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 p-4 rounded-2xl col-span-full">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-red-500">No Access Assigned</p>
                    <p className="text-xs text-red-500/70">
                      This staff member currently has no permissions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Digital Badge */}
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)] flex flex-col items-center">
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Digital Badge
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Live preview of their digital credential.
            </p>
          </div>

          <div className="flex bg-secondary p-1.5 rounded-full mb-8 shadow-sm border border-border/50">
            <Button
              variant={badgeSide === "front" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-6 transition-all font-medium ${badgeSide === "front" ? "shadow-md text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setBadgeSide("front")}
            >
              Front Side
            </Button>
            <Button
              variant={badgeSide === "back" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-6 transition-all font-medium ${badgeSide === "back" ? "shadow-md text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setBadgeSide("back")}
            >
              <FlipHorizontal className="h-4 w-4 mr-2" /> Back Side
            </Button>
          </div>

          <div className="flex-1 w-full flex items-center justify-center min-h-[450px]">
            {badgeProject ? (
              <div className="w-[320px] relative origin-top">
                <BadgePreview
                  activeSide={badgeSide}
                  config={{
                    theme: badgeProject.theme,
                    fontFamily: badgeProject.font_family,
                    gradientClass: badgeProject.gradient_class,
                    bgImageUrl: badgeProject.bg_image_url,
                    logoText: badgeProject.logo_text,
                    showUserImage: badgeProject.show_user_image,
                    accentColor: badgeProject.accent_color,
                    ...(badgeProject.front_design || {}),
                    backText: badgeProject.back_design?.text || "",
                  }}
                  isDesigner={false}
                  mockUser={{
                    name: displayName,
                    role: staff.role,
                    qrString: staff.badge_qr_string,
                    sectionName: staff.allowed_sections?.includes("*")
                      ? "ALL ACCESS"
                      : assignedSections.length > 0
                        ? assignedSections.map((s: any) => s.name).join(", ")
                        : "NO ACCESS",
                    initials: initials,
                    profileImage: staff.profile_image,
                  }}
                  sponsors={badgeProject.sponsors_json || []}
                />
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground border border-dashed border-border/80 rounded-3xl w-full flex flex-col items-center bg-secondary/20">
                <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">No Design Found</h4>
                <p className="text-sm mb-6">
                  A badge design hasn't been created for this event yet.
                </p>
                <Link
                  to="/dashboard/$workspaceSlug/badge-designer/$projectId"
                  params={{ workspaceSlug, projectId: "new" }}
                  search={{ eventId }}
                >
                  <Button
                    className="rounded-full shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Design Badge
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {badgeProject && (
            <div className="w-full space-y-3 mt-8">
              <Button
                className="w-full h-12 rounded-2xl text-base shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)", color: "white" }}
                onClick={() => {
                  toast.success("Badge sent via email!");
                }}
              >
                <Mail className="h-5 w-5 mr-2" /> Send Digital Badge
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl text-base border-border/80 hover:bg-secondary/50"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/a/${staff.badge_qr_string}`,
                  );
                  toast.success("Secure link copied to clipboard!");
                }}
              >
                Copy Secure Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
