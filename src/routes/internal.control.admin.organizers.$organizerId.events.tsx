import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerEvents } from "@/api/admin_organizer_control";
import { Calendar, Search, Building2, Globe, Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/events")({
  loader: async ({ params }) => {
    const events = await getAdminOrganizerEvents({ data: { organizerId: params.organizerId } } as any);
    return { events };
  },
  component: OrganizerEvents,
});

function StatusBadge({ suspended, allowed_public }: { suspended: boolean; allowed_public: boolean }) {
  if (suspended) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#f43f5e]/10 text-[#f43f5e] text-xs font-medium">
        <AlertTriangle className="h-3 w-3" />
        Suspended
      </span>
    );
  }
  if (allowed_public) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e] text-xs font-medium">
        <Globe className="h-3 w-3" />
        Public
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#797775]/10 text-[#797775] text-xs font-medium">
      <Lock className="h-3 w-3" />
      Private
    </span>
  );
}

function OrganizerEvents() {
  const { events } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = events.filter((e: any) =>
    (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#f97316]" />
          Events ({events.length})
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#1e1e1e] border border-[#333333] rounded-sm py-1.5 pl-9 pr-3 text-sm text-white placeholder-[#797775] focus:outline-none focus:border-[#f97316] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Title</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Category</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Type</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Start Date</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#797775]">
                    No events found.
                  </td>
                </tr>
              ) : (
                filtered.map((evt: any) => {
                  const startDate = evt.startDate ? new Date(evt.startDate) : null;
                  const isUpcoming = startDate && startDate > now;
                  const isPast = startDate && startDate <= now;

                  return (
                    <tr key={evt.id} className="hover:bg-[#2d2d30] transition-colors">
                      <td className="py-2 px-4 font-mono text-[#797775] text-xs">{String(evt.id).substring(0, 8)}...</td>
                      <td className="py-2 px-4 font-medium text-white max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-[#f97316] shrink-0" />
                          <span className="truncate">{evt.title || "Untitled Event"}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#797775] shrink-0" />
                          <span className={evt.workspaceName && evt.workspaceName !== "—" ? "text-[#cccccc]" : "text-[#797775] italic"}>
                            {evt.workspaceName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 capitalize">
                        {evt.category ? (
                          <span className="bg-[#2d2d30] px-2 py-0.5 rounded-full text-xs text-[#cccccc]">{evt.category}</span>
                        ) : (
                          <span className="text-[#797775]">—</span>
                        )}
                      </td>
                      <td className="py-2 px-4 capitalize">
                        {evt.event_type ? (
                          <span className="text-[#dcdcaa] text-xs">{evt.event_type}</span>
                        ) : (
                          <span className="text-[#797775]">—</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {startDate ? (
                          <span className={isUpcoming ? "text-[#84c87e]" : isPast ? "text-[#797775]" : ""}>
                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="ml-1.5 text-[10px] opacity-60">{isUpcoming ? "↑ upcoming" : "past"}</span>
                          </span>
                        ) : (
                          <span className="text-[#797775] italic">No schedule</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <StatusBadge suspended={evt.suspended} allowed_public={evt.allowed_public} />
                      </td>
                      <td className="py-2 px-4 text-[#797775]">
                        {evt.created_at ? new Date(evt.created_at).toLocaleDateString('en-US') : "—"}
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
