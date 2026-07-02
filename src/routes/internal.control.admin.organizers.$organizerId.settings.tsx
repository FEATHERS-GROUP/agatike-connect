import { createFileRoute, useRouter, getRouteApi } from "@tanstack/react-router";
import { setAdminOrganizerStatus } from "@/api/admin_organizer_control";
import { Settings, ShieldAlert, CheckCircle, Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/settings")({
  component: OrganizerSettings,
});

function OrganizerSettings() {
  const routeApi = getRouteApi('/internal/control/admin/organizers/$organizerId');
  const { overview } = routeApi.useLoaderData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!overview) return null;

  const handleToggleStatus = async (newStatus: boolean) => {
    try {
      setLoading(true);
      await setAdminOrganizerStatus({
        data: { organizerId: overview.id, active: newStatus },
      } as any);
      toast.success(newStatus ? "Organizer activated successfully" : "Organizer banned successfully");
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organizer status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm pb-10 max-w-3xl">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#cccccc]" />
          Organizer Settings
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333] rounded-sm p-6">
        <h3 className="text-md font-medium text-white mb-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#cccccc]" />
          Account Access & Status
        </h3>
        <p className="text-[#797775] mb-6">
          Manage the organizer's ability to log in and use the platform. If you ban an organizer, their public events will still exist but they will not be able to log in to the dashboard until reactivated.
        </p>

        <div className="flex items-center gap-4 bg-[#111111] border border-[#333333] p-4 rounded-sm">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">Current Status</h4>
            <p className="text-[#797775]">
              The account is currently <strong className={overview.active ? "text-[#84c87e]" : "text-[#f43f5e]"}>
                {overview.active ? "Active" : "Inactive (Banned)"}
              </strong>
            </p>
          </div>
          <div>
            {overview.active ? (
              <button
                onClick={() => handleToggleStatus(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20 transition-colors rounded-sm disabled:opacity-50 font-medium"
              >
                <Ban className="h-4 w-4" />
                {loading ? "Processing..." : "Ban Account"}
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#84c87e]/10 text-[#84c87e] border border-[#84c87e]/30 hover:bg-[#84c87e]/20 transition-colors rounded-sm disabled:opacity-50 font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                {loading ? "Processing..." : "Activate Account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
