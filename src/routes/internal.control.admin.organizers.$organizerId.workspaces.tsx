import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getAdminOrganizerWorkspaces, setAdminWorkspaceStatus } from "@/api/admin_organizer_control";
import { Building2, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/workspaces")({
  loader: async ({ params }) => {
    const workspaces = await getAdminOrganizerWorkspaces({ data: { organizerId: params.organizerId } } as any);
    return { workspaces };
  },
  component: OrganizerWorkspaces,
});

function OrganizerWorkspaces() {
  const { workspaces } = Route.useLoaderData();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, newDeletedStatus: boolean) => {
    try {
      setLoading(id);
      await setAdminWorkspaceStatus({
        data: { workspaceId: id, deleted: newDeletedStatus },
      } as any);
      toast.success(newDeletedStatus ? "Workspace disabled successfully" : "Workspace activated successfully");
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace status");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#569cd6]" />
          Workspaces ({workspaces.length})
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Location</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Type</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#797775]">
                    No workspaces found.
                  </td>
                </tr>
              ) : (
                workspaces.map((w: any) => (
                  <tr key={w.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{w.name || "—"}</td>
                    <td className="py-2 px-4">
                      {w.city && w.country ? `${w.city}, ${w.country}` : w.city || w.country || "—"}
                    </td>
                    <td className="py-2 px-4 capitalize">{w.type || "—"}</td>
                    <td className="py-2 px-4">
                      {w.deleted ? (
                        <span className="text-[#f43f5e]">Disabled</span>
                      ) : (
                        <span className="text-[#84c87e]">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString('en-US') : "—"}
                    </td>
                    <td className="py-2 px-4">
                      {w.deleted ? (
                        <button
                          onClick={() => handleToggleStatus(w.id, false)}
                          disabled={loading === w.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-[#84c87e]/10 text-[#84c87e] border border-[#84c87e]/30 hover:bg-[#84c87e]/20 transition-colors rounded-sm disabled:opacity-50 text-[11px]"
                        >
                          <Power className="h-3 w-3" />
                          {loading === w.id ? "..." : "Activate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(w.id, true)}
                          disabled={loading === w.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20 transition-colors rounded-sm disabled:opacity-50 text-[11px]"
                        >
                          <PowerOff className="h-3 w-3" />
                          {loading === w.id ? "..." : "Disable"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
