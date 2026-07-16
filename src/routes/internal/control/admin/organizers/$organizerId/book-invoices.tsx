import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerBookInvoices } from "@/api/admin_organizer_control";
import { FileText, Search, CreditCard, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/internal/control/admin/organizers/$organizerId/book-invoices",
)({
  loader: async ({ params }) => {
    const invoices = await getAdminOrganizerBookInvoices({
      data: { organizerId: params.organizerId },
    } as any);
    return { invoices };
  },
  component: OrganizerBookInvoices,
});

function OrganizerBookInvoices() {
  const { invoices } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter(
    (inv: any) =>
      (inv.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer_email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#84c87e]" />
          Book Invoices ({invoices.length})
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search invoices..."
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
                  Invoice Number
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Customer
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Type
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Amount
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Status
                </th>
                <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-600 dark:text-[#797775] italic"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                  >
                    <td className="py-2 px-4 font-mono text-[#569cd6] font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {inv.customer_name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-[#797775]">
                        {inv.customer_email || "No Email"}
                      </div>
                    </td>
                    <td className="py-2 px-4 capitalize">{inv.type?.replace(/_/g, " ") || "—"}</td>
                    <td className="py-2 px-4">
                      <span className="text-[#dcdcaa] font-medium">
                        {inv.currency || "USD"} {inv.amount}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {inv.status === "paid" ? (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e] flex items-center gap-1 w-max">
                          <CreditCard className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775] flex items-center gap-1 w-max capitalize">
                          <Clock className="h-3 w-3" /> {inv.status || "Pending"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
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
