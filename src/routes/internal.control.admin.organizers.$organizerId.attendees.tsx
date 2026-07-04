import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerAttendees } from "@/api/admin_organizer_control";
import { UserRound, Building2, Search, Calendar, Hash } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/attendees")({
  loader: async ({ params }) => {
    const attendees = await getAdminOrganizerAttendees({
      data: { organizerId: params.organizerId },
    } as any);
    return { attendees };
  },
  component: OrganizerAttendees,
});

function OrganizerAttendees() {
  const { attendees } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendees = attendees.filter(
    (a: any) =>
      (a.names || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.qrcode_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.eventTitle || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <UserRound className="h-5 w-5 text-[#f97316]" />
          Event Attendees ({attendees.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search attendees..."
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
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Ticket #</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Attendee</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Event</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Type / Qty</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600 dark:text-[#797775] italic">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[#569cd6]">
                        <Hash className="h-3 w-3 shrink-0" />
                        {a.qrcode_number || "—"}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{a.names || "Unknown"}</div>
                      <div className="text-xs text-gray-600 dark:text-[#797775]">
                        {a.email || a.phone || "No Contact"}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                          <Calendar className="h-3 w-3 shrink-0 text-[#dcdcaa]" />
                          <span className="truncate max-w-[200px]">{a.eventTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#797775] text-xs">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {a.workspaceName}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="capitalize text-gray-700 dark:text-[#cccccc]">
                        {a.ticket_type === "ga" ? "General Admission" : a.ticket_type || "Standard"}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-[#797775]">Qty: {a.quanity || 1}</div>
                    </td>
                    <td className="py-2 px-4">
                      {a.status === "completed" ||
                      a.status === "approved" ||
                      a.status === "valid" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e] capitalize">
                          {a.status}
                        </span>
                      ) : a.status === "pending" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#c586c0]/10 text-[#c586c0] capitalize">
                          {a.status}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#f43f5e]/10 text-[#f43f5e] capitalize">
                          {a.status || "—"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString("en-US") : "—"}
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
