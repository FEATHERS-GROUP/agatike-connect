import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerSubscriptions } from "@/api/admin_organizer_control";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/subscriptions")({
  loader: async ({ params }) => {
    const subscriptions = await getAdminOrganizerSubscriptions({ data: { organizerId: params.organizerId } } as any);
    return { subscriptions };
  },
  component: OrganizerSubscriptions,
});

function OrganizerSubscriptions() {
  const { subscriptions } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#84c87e]" />
          Subscriptions
        </h2>
      </div>

      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Plan</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Amount</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#797775]">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{s.pricing_plan?.name || "Unknown Plan"}</td>
                    <td className="py-2 px-4">
                      {s.status === "active" ? (
                        <span className="text-[#84c87e]">Active</span>
                      ) : s.status === "canceled" ? (
                        <span className="text-[#f43f5e]">Canceled</span>
                      ) : (
                        <span className="text-[#797775] capitalize">{s.status || "—"}</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {s.amount ? `${s.amount} RWF` : "Free"}
                    </td>
                    <td className="py-2 px-4">
                      {s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}
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
