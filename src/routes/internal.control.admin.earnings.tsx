import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getEarningsAnalyticsAdmin, getEarningsLedgerAdmin } from "@/api/admin_finance";
import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { Loader2, TrendingUp, DollarSign, Wallet, ArrowRightLeft } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/internal/control/admin/earnings")({
  component: AdminEarningsPage,
});

function AdminEarningsPage() {
  const [dateFilter, setDateFilter] = useState<"7d" | "1m" | "3m" | "1y" | "all">("1m");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const filterDates = useMemo(() => {
    const now = new Date();
    if (dateFilter === "all") return { startDate: undefined, endDate: undefined };
    
    let start = new Date();
    if (dateFilter === "7d") start.setDate(now.getDate() - 7);
    if (dateFilter === "1m") start.setMonth(now.getMonth() - 1);
    if (dateFilter === "3m") start.setMonth(now.getMonth() - 3);
    if (dateFilter === "1y") {
      start = new Date(now.getFullYear(), 0, 1); // Start of this year
    }
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }, [dateFilter]);

  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-earnings", filterDates],
    queryFn: () => getEarningsAnalyticsAdmin({ data: filterDates }),
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["admin-earnings-ledger", filterDates, page, limit],
    queryFn: () => getEarningsLedgerAdmin({ data: { ...filterDates, limit, offset: (page - 1) * limit } }),
  });

  const chartData = useMemo(() => {
    if (!data?.records) return [];
    
    // Group by date (YYYY-MM-DD)
    const grouped = data.records.reduce((acc: any, r: any) => {
      const d = r.created_at.split("T")[0];
      if (!acc[d]) acc[d] = { date: d, revenue: 0, profit: 0, cost: 0 };
      acc[d].revenue += Number(r.platform_revenue || 0);
      acc[d].profit += Number(r.net_profit || 0);
      acc[d].cost += Number(r.provider_cost || 0);
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Earnings Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track platform revenue, provider costs, and net profitability.
          </p>
        </div>
        
        <div className="flex bg-[#1b1b1c] rounded-lg border border-[#333333] p-1">
          {[
            { id: "7d", label: "7 Days" },
            { id: "1m", label: "1 Month" },
            { id: "3m", label: "3 Months" },
            { id: "1y", label: "This Year" },
            { id: "all", label: "All Time" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setDateFilter(f.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === f.id ? "bg-[#333333] text-white" : "text-muted-foreground hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Gross Volume" 
              value={data?.stats?.total_gross} 
              icon={<ArrowRightLeft className="h-4 w-4 text-muted-foreground" />} 
            />
            <StatCard 
              title="Platform Revenue (Fees)" 
              value={data?.stats?.total_revenue} 
              icon={<DollarSign className="h-4 w-4 text-blue-400" />} 
            />
            <StatCard 
              title="Provider Cost (PawaPay)" 
              value={data?.stats?.total_provider_cost} 
              icon={<Wallet className="h-4 w-4 text-red-400" />} 
            />
            <StatCard 
              title="Net Profit" 
              value={data?.stats?.total_net_profit} 
              icon={<TrendingUp className="h-4 w-4 text-[#f97316]" />} 
            />
          </div>

          <div className="bg-[#1b1b1c] p-6 rounded-xl border border-[#333333] h-[400px]">
            <h2 className="text-lg font-medium text-white mb-4">Revenue & Profit Over Time</h2>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `RWF ${v}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#ccc' }}
                />
                <Area type="monotone" dataKey="revenue" name="Platform Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#f97316" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333333]">
              <h2 className="text-lg font-medium text-white">Transaction Ledger</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-[#111111]/50 border-b border-[#333333]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Reference</th>
                    <th className="px-6 py-4 font-medium">Gross</th>
                    <th className="px-6 py-4 font-medium">Revenue</th>
                    <th className="px-6 py-4 font-medium">Cost</th>
                    <th className="px-6 py-4 font-medium text-[#f97316]">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#f97316]" />
                      </td>
                    </tr>
                  ) : ledgerData?.records?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#252526]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize text-white">
                        {r.transaction_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-muted-foreground text-xs">
                        {r.wallet_transaction?.id ? `Tx-${r.wallet_transaction.id.substring(0, 8)}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCurrency(r.gross_amount, r.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400">
                        {formatCurrency(r.platform_revenue, r.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-400">
                        -{formatCurrency(r.provider_cost, r.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#f97316] font-bold">
                        {formatCurrency(r.net_profit, r.currency)}
                      </td>
                    </tr>
                  ))}
                  
                  {!ledgerLoading && (!ledgerData?.records || ledgerData.records.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No transactions found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {!ledgerLoading && ledgerData && ledgerData.totalCount > 0 && (
              <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-between bg-[#111111]/50">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, ledgerData.totalCount)} of {ledgerData.totalCount}
                  </span>
                  <select 
                    value={limit} 
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                    <option value={250}>250 per page</option>
                    <option value={500}>500 per page</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-[#1b1b1c] border border-[#333333] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= ledgerData.totalCount}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-[#1b1b1c] border border-[#333333] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1b1b1c] p-5 rounded-xl border border-[#333333] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">
        {formatCurrency(value || 0, "RWF")}
      </div>
    </div>
  );
}
