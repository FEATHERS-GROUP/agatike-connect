import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerUsers } from "@/api/admin_organizer_control";
import { Users } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/users")({
  loader: async ({ params }) => {
    const users = await getAdminOrganizerUsers({
      data: { organizerId: params.organizerId },
    } as any);
    return { users };
  },
  component: OrganizerUsers,
});

function OrganizerUsers() {
  const { users } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#f97316]" />
          Workspace Users ({users.length})
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Email</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Role</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#797775]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{u.name || "—"}</td>
                    <td className="py-2 px-4">{u.email || "—"}</td>
                    <td className="py-2 px-4 capitalize">{u.role || "—"}</td>
                    <td className="py-2 px-4">
                      {u.status === "active" ? (
                        <span className="text-[#84c87e]">Active</span>
                      ) : u.status === "pending" ? (
                        <span className="text-[#f97316]">Pending</span>
                      ) : (
                        <span className="text-[#797775] capitalize">{u.status || "—"}</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
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
