import { createFileRoute, Link } from "@tanstack/react-router";
import { getOrganizers } from "@/api/organizers";
import { Plus, RefreshCw, MoreHorizontal, Filter, Search } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/")({
  loader: async () => {
    const organizers = await getOrganizers();
    return { organizers };
  },
  component: AdminOrganizers,
});

function AdminOrganizers() {
  const { organizers } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Organizers</h1>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-medium text-[13px] transition-colors">
            <Plus className="h-4 w-4 text-[#f97316]" />
            New organizer
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-medium text-[13px] transition-colors">
            <RefreshCw className="h-4 w-4 text-[#f97316]" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-[#333333]">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-[#333333] bg-gray-100 dark:bg-[#2d2d30]">
          <div className="flex items-center gap-2 w-full max-w-sm relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-[#797775]" />
            <input
              type="text"
              placeholder="Filter by name..."
              className="h-7 w-full rounded-sm border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] pl-8 pr-3 text-[13px] text-gray-900 dark:text-white outline-none focus:border-[#f97316] transition-colors placeholder:text-gray-600 dark:text-[#797775]"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] text-[13px] transition-colors border border-transparent hover:border-gray-200 dark:border-[#333333] rounded-sm">
            <Filter className="h-3.5 w-3.5" />
            Add filter
          </button>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333] w-8">
                  <input
                    type="checkbox"
                    className="rounded-sm border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] accent-[#f97316]"
                  />
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Name
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Handle
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Email
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Status
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Followers
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {organizers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600 dark:text-[#797775]">
                    No organizers found.
                  </td>
                </tr>
              ) : (
                organizers.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                  >
                    <td className="py-2 px-4">
                      <input
                        type="checkbox"
                        className="rounded-sm border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] accent-[#f97316]"
                      />
                    </td>
                    <td className="py-2 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {org.image ? (
                        <img src={org.image} alt="" className="h-5 w-5 rounded-sm object-cover" />
                      ) : (
                        <div className="h-5 w-5 rounded-sm bg-gray-200 dark:bg-[#333333]" />
                      )}
                      {org.name}
                    </td>
                    <td className="py-2 px-4 text-[#f97316] hover:underline cursor-pointer">
                      @{org.handle}
                    </td>
                    <td className="py-2 px-4">{org.email || "—"}</td>
                    <td className="py-2 px-4">
                      {org.active ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#84c87e]"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-[#797775]">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-[#333333]"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4">{org.followers?.toLocaleString() || "0"}</td>
                    <td className="py-2 px-4 text-right">
                      <Link
                        to={`/internal/control/admin/organizers/${org.id}`}
                        className="inline-flex p-1 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm text-gray-700 dark:text-[#cccccc] transition-colors"
                        title="View Details"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526] text-gray-600 dark:text-[#797775] text-[11px]">
          <div>Showing {organizers.length} items</div>
          <div className="flex items-center gap-4">
            <button
              className="hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
