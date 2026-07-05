import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerRSVPs } from "@/api/admin_organizer_control";
import { UserCheck, Building2, Search, FileText } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/rsvps")({
  loader: async ({ params }) => {
    const rsvps = await getAdminOrganizerRSVPs({
      data: { organizerId: params.organizerId },
    } as any);
    return { rsvps };
  },
  component: OrganizerRSVPs,
});

function OrganizerRSVPs() {
  const { rsvps } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRsvps = rsvps.filter(
    (r: any) =>
      (r.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.first_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.last_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[#569cd6]" />
          RSVPs ({rsvps.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search RSVPs..."
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
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  ID
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Attendee
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Form
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Workspace
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Status
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredRsvps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-600 dark:text-[#797775] italic"
                  >
                    No RSVPs found.
                  </td>
                </tr>
              ) : (
                filteredRsvps.map((r: any) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                  >
                    <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                      {String(r.id).substring(0, 8)}...
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {r.first_name} {r.last_name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-[#797775]">{r.email}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-[#cccccc]">
                        <FileText className="h-3.5 w-3.5 text-[#dcdcaa] shrink-0" />
                        {r.formTitle}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775] shrink-0" />
                        <span
                          className={
                            r.workspaceName !== "—"
                              ? "text-gray-700 dark:text-[#cccccc]"
                              : "text-gray-600 dark:text-[#797775] italic"
                          }
                        >
                          {r.workspaceName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {r.status === "approved" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e] capitalize">
                          {r.status}
                        </span>
                      ) : r.status === "rejected" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#f43f5e]/10 text-[#f43f5e] capitalize">
                          {r.status}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#c586c0]/10 text-[#c586c0] capitalize">
                          {r.status || "pending"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US") : "—"}
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
