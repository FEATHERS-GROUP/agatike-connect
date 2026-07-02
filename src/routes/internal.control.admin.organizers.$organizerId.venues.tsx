import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerVenues } from "@/api/admin_organizer_control";
import { MapPin, Search, Building2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/venues")({
  loader: async ({ params }) => {
    const venues = await getAdminOrganizerVenues({ data: { organizerId: params.organizerId } } as any);
    return { venues };
  },
  component: OrganizerVenues,
});

function OrganizerVenues() {
  const { venues } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = venues.filter((v: any) =>
    (v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.workspaceName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#569cd6]" />
          Venues ({venues.length})
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search venues..."
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
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Venue Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Dimensions (W × H)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#797775]">
                    No venues found.
                  </td>
                </tr>
              ) : (
                filtered.map((v: any) => (
                  <tr key={v.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#797775]">{String(v.id).substring(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#569cd6] shrink-0" />
                        {v.name || "Untitled Venue"}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#797775] shrink-0" />
                        <span className={v.workspaceName && v.workspaceName !== "—" ? "text-[#cccccc]" : "text-[#797775] italic"}>
                          {v.workspaceName || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {v.boundary_width && v.boundary_height
                        ? <span className="text-[#dcdcaa]">{v.boundary_width} × {v.boundary_height}</span>
                        : <span className="text-[#797775] italic">Not configured</span>
                      }
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
