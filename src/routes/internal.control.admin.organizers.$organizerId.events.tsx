import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerEvents } from "@/api/admin_organizer_control";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/events")({
  loader: async ({ params }) => {
    const events = await getAdminOrganizerEvents({ data: { organizerId: params.organizerId } } as any);
    return { events };
  },
  component: OrganizerEvents,
});

function OrganizerEvents() {
  const { events } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#f97316]" />
          Events ({events.length})
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Title</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Category</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#797775]">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{evt.title || "Untitled Event"}</td>
                    <td className="py-2 px-4">{evt.category || "—"}</td>
                    <td className="py-2 px-4">{evt.workspaces?.name || "—"}</td>
                    <td className="py-2 px-4">
                      {evt.suspended ? (
                        <span className="text-[#f43f5e]">Suspended</span>
                      ) : evt.allowed_public ? (
                        <span className="text-[#84c87e]">Public</span>
                      ) : (
                        <span className="text-[#797775]">Draft / Private</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {evt.created_at ? new Date(evt.created_at).toLocaleDateString() : "—"}
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
