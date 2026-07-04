import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerMemberships } from "@/api/admin_organizer_control";
import { Users, Search, Building2, LayoutGrid, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/memberships")(
  {
    loader: async ({ params }) => {
      const memberships = await getAdminOrganizerMemberships({
        data: { organizerId: params.organizerId },
      } as any);
      return { memberships };
    },
    component: OrganizerMemberships,
  },
);

function OrganizerMemberships() {
  const { memberships } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMemberships = memberships.filter(
    (m: any) =>
      (m.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.customer_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.plan_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.spaceName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#f97316]" />
          Memberships ({memberships.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search memberships..."
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
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Member</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Plan / Type</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Location (Space)
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600 dark:text-[#797775] italic">
                    No memberships found.
                  </td>
                </tr>
              ) : (
                filteredMemberships.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                      {String(m.id).substring(0, 8)}...
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{m.customer_name || "Unknown"}</div>
                      <div className="text-xs text-gray-600 dark:text-[#797775]">{m.customer_email || "No Email"}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="text-[#dcdcaa] font-medium">
                        {m.plan_name || "Custom Plan"}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-[#797775] capitalize">
                        {m.booking_type || "individual"}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                          <LayoutGrid className="h-3 w-3 shrink-0 text-[#c586c0]" />
                          {m.spaceName}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#797775] text-xs">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {m.workspaceName}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {m.status === "active" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e] flex items-center gap-1 w-max capitalize">
                          <CheckCircle2 className="h-3 w-3" /> {m.status}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775] flex items-center gap-1 w-max capitalize">
                          <XCircle className="h-3 w-3" /> {m.status || "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString("en-US") : "—"}
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
