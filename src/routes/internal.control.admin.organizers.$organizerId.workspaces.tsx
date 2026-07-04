import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getAdminOrganizerWorkspaces,
  setAdminWorkspaceStatus,
} from "@/api/admin_organizer_control";
import {
  Building2,
  Power,
  PowerOff,
  Search,
  Eye,
  MapPin,
  Tag,
  Calendar as CalendarIcon,
  Hash,
  Map,
  Banknote,
  Layers,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/workspaces")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerWorkspaces({
      data: { organizerId: params.organizerId },
    } as any);
    return data;
  },
  component: OrganizerWorkspaces,
});

function OrganizerWorkspaces() {
  const { workspaces, platformModules } = Route.useLoaderData();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Build a lookup map: id -> label
  const moduleMap = Object.fromEntries((platformModules || []).map((m: any) => [m.id, m.label]));

  const filteredWorkspaces = workspaces.filter(
    (w: any) =>
      (w.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.id || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleStatus = async (id: string, newDeletedStatus: boolean) => {
    try {
      setLoading(id);
      await setAdminWorkspaceStatus({
        data: { workspaceId: id, deleted: newDeletedStatus },
      } as any);
      toast.success(
        newDeletedStatus ? "Workspace disabled successfully" : "Workspace activated successfully",
      );
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace status");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#569cd6]" />
          Workspaces ({workspaces.length})
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-sm py-1.5 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder-[#797775] focus:outline-none focus:border-[#569cd6] transition-colors"
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">ID</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Logo</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Location</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Type</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Created</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-600 dark:text-[#797775]">
                    No workspaces found.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-gray-600 dark:text-[#797775]">
                      {String(w.id).substring(0, 8)}...
                    </td>
                    <td className="py-2 px-4">
                      {w.logo ? (
                        <img
                          src={w.logo}
                          alt={w.name}
                          className="h-8 w-8 rounded-sm object-cover bg-gray-50 dark:bg-[#1e1e1e]"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-sm bg-gray-200 dark:bg-[#333333] flex items-center justify-center text-gray-600 dark:text-[#797775] text-xs">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">{w.name || "—"}</td>
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
                      {w.created_at ? new Date(w.created_at).toLocaleDateString("en-US") : "—"}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-[#2d2d30] hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-900 dark:text-white border border-gray-300 dark:border-[#444] transition-colors rounded-sm text-[11px]">
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white sm:max-w-md w-full p-0 flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-[#333333] shrink-0">
                              <SheetHeader className="flex flex-row items-center gap-4 space-y-0">
                                {w.logo ? (
                                  <img
                                    src={w.logo}
                                    alt={w.name}
                                    className="h-16 w-16 rounded-md object-cover bg-gray-50 dark:bg-[#252526]"
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-md bg-gray-50 dark:bg-[#252526] flex items-center justify-center text-gray-600 dark:text-[#797775]">
                                    <Building2 className="h-8 w-8" />
                                  </div>
                                )}
                                <div>
                                  <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {w.name || "Unnamed Workspace"}
                                  </SheetTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-sm ${w.deleted ? "bg-[#f43f5e]/10 text-[#f43f5e]" : "bg-[#84c87e]/10 text-[#84c87e]"}`}
                                    >
                                      {w.deleted ? "Disabled" : "Active"}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-[#797775] capitalize">
                                      {w.type}
                                    </span>
                                  </div>
                                </div>
                              </SheetHeader>
                            </div>

                            <ScrollArea className="flex-1">
                              <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                  <h3 className="text-sm font-medium text-gray-700 dark:text-[#cccccc] uppercase tracking-wider">
                                    Workspace Details
                                  </h3>

                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <Hash className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Workspace ID</div>
                                        <div className="text-sm text-gray-900 dark:text-white font-mono truncate">
                                          {w.id}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <MapPin className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">City / Country</div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                          {w.city && w.country
                                            ? `${w.city}, ${w.country}`
                                            : w.city || w.country || "Not specified"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <Map className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Address</div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                          {w.address || "Not specified"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <Tag className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Type</div>
                                        <div className="text-sm text-gray-900 dark:text-white capitalize">
                                          {w.type || "Not specified"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <Banknote className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Currency</div>
                                        <div className="text-sm text-gray-900 dark:text-white uppercase">
                                          {w.currency || "Not specified"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <CalendarIcon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Created At</div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                          {w.created_at
                                            ? new Date(w.created_at).toLocaleDateString("en-US", {
                                                dateStyle: "long",
                                              })
                                            : "Unknown"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-100 dark:bg-[#2d2d30] rounded-sm text-gray-600 dark:text-[#797775]">
                                        <Clock className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">Last Updated</div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                          {w.updated_at
                                            ? new Date(w.updated_at).toLocaleString("en-US", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                              })
                                            : "Unknown"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Layers className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
                                        <div className="text-xs text-gray-600 dark:text-[#797775]">
                                          Enabled Modules
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {w.moduls && w.moduls.length > 0 ? (
                                          w.moduls.map((modId: string) => (
                                            <span
                                              key={modId}
                                              className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc] text-xs px-2.5 py-1 rounded-full capitalize"
                                            >
                                              {moduleMap[modId] || modId.substring(0, 8) + "…"}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-sm text-gray-600 dark:text-[#797775] italic">
                                            No modules enabled
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>

                            {/* Action footer */}
                            <div className="p-6 border-t border-gray-200 dark:border-[#333333] shrink-0">
                              {w.deleted ? (
                                <button
                                  onClick={() => handleToggleStatus(w.id, false)}
                                  disabled={loading === w.id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#84c87e]/10 text-[#84c87e] border border-[#84c87e]/30 hover:bg-[#84c87e]/20 transition-colors rounded-sm disabled:opacity-50 font-medium"
                                >
                                  <Power className="h-4 w-4" />
                                  {loading === w.id ? "Activating..." : "Activate Workspace"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(w.id, true)}
                                  disabled={loading === w.id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20 transition-colors rounded-sm disabled:opacity-50 font-medium"
                                >
                                  <PowerOff className="h-4 w-4" />
                                  {loading === w.id ? "Disabling..." : "Disable Workspace"}
                                </button>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
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
