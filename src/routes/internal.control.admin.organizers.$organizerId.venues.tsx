import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerVenues } from "@/api/admin_organizer_control";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/venues")({
  loader: async ({ params }) => {
    const venues = await getAdminOrganizerVenues({ data: { organizerId: params.organizerId } } as any);
    return { venues };
  },
  component: OrganizerVenues,
});

function OrganizerVenues() {
  const { venues } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#569cd6]" />
          Venues ({venues.length})
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-[#797775]">
                    No venues found.
                  </td>
                </tr>
              ) : (
                venues.map((v: any) => (
                  <tr key={v.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{v.name || "Untitled"}</td>
                    <td className="py-2 px-4">{v.workspaces?.name || "—"}</td>
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
