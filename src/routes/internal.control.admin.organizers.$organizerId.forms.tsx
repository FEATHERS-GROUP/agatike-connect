import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerForms } from "@/api/admin_organizer_control";
import { ClipboardList, Building2, Search, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/forms")({
  loader: async ({ params }) => {
    const forms = await getAdminOrganizerForms({
      data: { organizerId: params.organizerId },
    } as any);
    return { forms };
  },
  component: OrganizerForms,
});

function OrganizerForms() {
  const { forms } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = forms.filter(
    (f: any) =>
      (f.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#c586c0]" />
          Forms ({forms.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search forms..."
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
                  Title
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Workspace
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  RSVPs
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Status
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredForms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-600 dark:text-[#797775] italic"
                  >
                    No forms found.
                  </td>
                </tr>
              ) : (
                filteredForms.map((f: any) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                  >
                    <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                      {String(f.id).substring(0, 8)}...
                    </td>
                    <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">
                      {f.title || "Untitled"}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775] shrink-0" />
                        <span
                          className={
                            f.workspaceName !== "—"
                              ? "text-gray-700 dark:text-[#cccccc]"
                              : "text-gray-600 dark:text-[#797775] italic"
                          }
                        >
                          {f.workspaceName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-[#cccccc]">
                        <Users className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775]" />
                        {f.rsvpCount}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {f.is_active ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e]">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString("en-US") : "—"}
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
