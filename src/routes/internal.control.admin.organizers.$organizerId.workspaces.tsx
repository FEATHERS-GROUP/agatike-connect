import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { getAdminOrganizerWorkspaces, setAdminWorkspaceStatus } from "@/api/admin_organizer_control";
import { Building2, Power, PowerOff, Search, Eye } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = workspaces.filter((w: any) => 
    (w.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#569cd6]" />
          Workspaces ({workspaces.length})
        </h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#1e1e1e] border border-[#333333] rounded-sm py-1.5 pl-9 pr-3 text-sm text-white placeholder-[#797775] focus:outline-none focus:border-[#569cd6] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Logo</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Location</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Type</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#797775]">
                    No workspaces found.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((w: any) => (
                  <tr key={w.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-[#797775]">{String(w.id).substring(0,8)}...</td>
                    <td className="py-2 px-4">
                      {w.logo ? (
                        <img src={w.logo} alt={w.name} className="h-8 w-8 rounded-sm object-cover bg-[#1e1e1e]" />
                      ) : (
                        <div className="h-8 w-8 rounded-sm bg-[#333333] flex items-center justify-center text-[#797775] text-xs">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                    </td>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-1.5 px-2 py-1 bg-[#2d2d30] hover:bg-[#333333] text-white border border-[#444] transition-colors rounded-sm text-[11px]"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
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
                      </div>
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
