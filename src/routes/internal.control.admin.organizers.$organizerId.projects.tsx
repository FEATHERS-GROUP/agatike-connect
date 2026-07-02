import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerProjects } from "@/api/admin_organizer_control";
import { Ticket } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/projects")({
  loader: async ({ params }) => {
    const projects = await getAdminOrganizerProjects({ data: { organizerId: params.organizerId } } as any);
    return { projects };
  },
  component: OrganizerProjects,
});

function OrganizerProjects() {
  const { projects } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#c586c0]" />
          Ticket Projects ({projects.length})
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#797775]">
                    No ticket projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{p.name || "Untitled"}</td>
                    <td className="py-2 px-4">{p.workspace?.name || "—"}</td>
                    <td className="py-2 px-4">
                      {p.deleted ? (
                        <span className="text-[#f43f5e]">Deleted</span>
                      ) : (
                        <span className="text-[#84c87e]">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
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
