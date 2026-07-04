import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerInvoices } from "@/api/admin_organizer_control";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/invoices")({
  loader: async ({ params }) => {
    const invoices = await getAdminOrganizerInvoices({
      data: { organizerId: params.organizerId },
    } as any);
    return { invoices };
  },
  component: OrganizerInvoices,
});

function OrganizerInvoices() {
  const { invoices } = Route.useLoaderData();

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333]">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#84c87e]" />
          Invoices
        </h2>
      </div>

      <div className="bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">ID</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Amount</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Status</th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-600 dark:text-[#797775]">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-gray-700 dark:text-[#cccccc]">
                      {String(inv.id).substring(0, 8)}...
                    </td>
                    <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">
                      {inv.amount ? `$${parseFloat(inv.amount).toFixed(2)}` : "Free"}
                    </td>
                    <td className="py-2 px-4">
                      {inv.status === "paid" ? (
                        <span className="text-[#84c87e] capitalize">{inv.status}</span>
                      ) : (
                        <span className="text-[#f97316] capitalize">{inv.status || "—"}</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-US") : "—"}
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
