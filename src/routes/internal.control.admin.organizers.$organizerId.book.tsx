import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerBook } from "@/api/admin_organizer_control";
import { BookOpen, Building2, Search, List } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/book")({
  loader: async ({ params }) => {
    const books = await getAdminOrganizerBook({ data: { organizerId: params.organizerId } } as any);
    return { books };
  },
  component: OrganizerBooks,
});

function OrganizerBooks() {
  const { books } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter(
    (b: any) =>
      (b.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#dcdcaa]" />
          Agatike Book ({books.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search books..."
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
                  Name
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Workspace
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Records
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Fields
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-600 dark:text-[#797775] italic"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b: any) => {
                  const fields = Array.isArray(b.schema_fields) ? b.schema_fields : [];
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                    >
                      <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                        {String(b.id).substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                          <BookOpen className="h-3.5 w-3.5 text-[#dcdcaa] shrink-0" />
                          {b.name || "Untitled Book"}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775] shrink-0" />
                          <span
                            className={
                              b.workspaceName !== "—"
                                ? "text-gray-700 dark:text-[#cccccc]"
                                : "text-gray-600 dark:text-[#797775] italic"
                            }
                          >
                            {b.workspaceName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-[#cccccc]">
                          <List className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775]" />
                          {b.recordCount}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                        {fields.length > 0 ? (
                          fields
                            .map((f: any) => f.label || f.name || f.key || "?")
                            .join(", ")
                            .substring(0, 40) + (fields.length > 3 ? "…" : "")
                        ) : (
                          <span className="italic">No fields</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString("en-US") : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
