import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerSubscriptions } from "@/api/admin_organizer_control";
import { CreditCard } from "lucide-react";
import { TransactionLedger } from "@/components/dashboard/TransactionLedger";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/subscriptions")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerSubscriptions({ data: { organizerId: params.organizerId } } as any);
    return data; // { subscriptions, transactions }
  },
  component: OrganizerSubscriptions,
});

function OrganizerSubscriptions() {
  const { subscriptions, transactions } = Route.useLoaderData();

  const formatCurrency = (amount: number, currency: string = "RWF") => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-8 font-sans text-sm pb-10">
      
      {/* Subscriptions Section */}
      <div className="space-y-4">
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

      {/* Transaction Ledger Section */}
      <div className="pt-4 border-t border-[#333333]">
        <div className="dark">
          {/* We wrap TransactionLedger in .dark so it looks good if it relies on tailwind dark mode colors, although admin panel is already dark */}
          <TransactionLedger 
            transactions={transactions || []} 
            isLoading={false} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </div>

    </div>
  );
}
