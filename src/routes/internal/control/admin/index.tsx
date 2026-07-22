import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { StatCard } from "@/components/admin/StatCard";
import { Activity, Cpu, HardDrive, Network, Zap, ShieldAlert, Plus, RefreshCw, BarChart3, Globe, Briefcase, Users, Ticket, Wallet, HelpCircle, XCircle, PieChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, RadialBarChart, RadialBar, ComposedChart } from "recharts";
import { getAdminDashboardStats } from "@/api/admin_dashboard";
import { format, parseISO, startOfWeek } from "date-fns";

export const Route = createFileRoute("/internal/control/admin/")({
  loader: async () => {
    return await getAdminDashboardStats();
  },
  component: SystemDashboard,
});

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b', '#eab308'];

function SystemDashboard() {
  const stats = useLoaderData({ from: "/internal/control/admin/" });

  // 1. Process Support Tickets Data
  let openTickets = 0;
  let unassignedTickets = 0;
  let closedTickets = 0;
  
  const ticketsByCategory: Record<string, number> = {};
  const ticketsByStatus: Record<string, number> = {};

  (stats.supportTickets || []).forEach((t: any) => {
    // Basic counts
    if (t.status === "open" || t.status === "in_progress") openTickets++;
    if (t.status === "closed" || t.status === "resolved") closedTickets++;
    if (!t.assigned_to) unassignedTickets++;

    // Group by category
    const cat = t.category || "other";
    ticketsByCategory[cat] = (ticketsByCategory[cat] || 0) + 1;

    // Group by status
    const status = t.status || "unknown";
    ticketsByStatus[status] = (ticketsByStatus[status] || 0) + 1;
  });

  const categoryChartData = Object.keys(ticketsByCategory).map(k => ({ name: k, value: ticketsByCategory[k] }));
  const statusChartData = Object.keys(ticketsByStatus).map(k => ({ name: k, count: ticketsByStatus[k] }));

  // 2. Process Withdrawals Data
  let pendingWithdrawals = 0;
  let approvedWithdrawals = 0;
  let rejectedWithdrawals = 0;

  (stats.withdrawals || []).forEach((w: any) => {
    if (w.status === "pending") pendingWithdrawals++;
    else if (w.status === "approved" || w.status === "completed") approvedWithdrawals++;
    else if (w.status === "rejected" || w.status === "failed") rejectedWithdrawals++;
  });

  const withdrawalPieData = [
    { name: "Pending", value: pendingWithdrawals },
    { name: "Approved", value: approvedWithdrawals },
    { name: "Rejected", value: rejectedWithdrawals }
  ].filter(d => d.value > 0);

  // 3. Process Trends Data
  const ticketsByMonth: Record<string, any> = {};
  const categoriesSet = new Set<string>();

  (stats.supportTickets || []).forEach((t: any) => {
    if (!t.created_at) return;
    const month = format(parseISO(t.created_at), "MMM yyyy");
    if (!ticketsByMonth[month]) {
      ticketsByMonth[month] = { name: month };
    }
    const cat = t.category || "other";
    categoriesSet.add(cat);
    ticketsByMonth[month][cat] = (ticketsByMonth[month][cat] || 0) + 1;
  });

  const ticketsTrendData = Object.values(ticketsByMonth).reverse();
  const categoriesList = Array.from(categoriesSet);

  const withdrawalsByWeek: Record<string, any> = {};
  (stats.withdrawals || []).forEach((w: any) => {
    if (!w.created_at) return;
    const weekStart = format(startOfWeek(parseISO(w.created_at)), "MMM dd, yyyy");
    if (!withdrawalsByWeek[weekStart]) withdrawalsByWeek[weekStart] = { name: weekStart, approved: 0, pending: 0, rejected: 0 };
    
    if (w.status === "approved" || w.status === "completed") {
      withdrawalsByWeek[weekStart].approved += (w.amount || 0);
    } else if (w.status === "pending") {
      withdrawalsByWeek[weekStart].pending += (w.amount || 0);
    } else {
      withdrawalsByWeek[weekStart].rejected += (w.amount || 0);
    }
  });
  
  const withdrawalsTrendData = Object.values(withdrawalsByWeek).reverse();

  // 4. Admin Ticket Trends
  const adminTicketsByMonth: Record<string, any> = {};
  const adminsSet = new Set<string>();

  (stats.supportTickets || []).forEach((t: any) => {
    if (!t.created_at) return;
    const month = format(parseISO(t.created_at), "MMM yyyy");
    if (!adminTicketsByMonth[month]) {
      adminTicketsByMonth[month] = { name: month };
    }
    const adminId = t.assigned_to ? `Admin: ${t.assigned_to.substring(0, 5)}` : "Unassigned";
    adminsSet.add(adminId);
    adminTicketsByMonth[month][adminId] = (adminTicketsByMonth[month][adminId] || 0) + 1;
  });
  
  const adminTicketsTrendData = Object.values(adminTicketsByMonth).reverse();
  const adminList = Array.from(adminsSet);

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Operations & Health Dashboard</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 font-medium text-[13px] transition-colors rounded-sm border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </div>
          <button 
            className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-medium text-[13px] transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 text-[#f97316]" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Inactive Workspaces" value={stats.inactiveWorkspaces.toString()} icon={Briefcase} trend="Deleted or deactivated" isPositive={false} />
        <StatCard title="Inactive Organizers" value={stats.inactiveOrganizers.toString()} icon={Users} trend="Disabled or pending" isPositive={false} />
        <StatCard title="Open Tickets" value={openTickets.toString()} icon={HelpCircle} trend={`${unassignedTickets} unassigned`} isPositive={false} />
        <StatCard title="Pending Withdrawals" value={pendingWithdrawals.toString()} icon={Wallet} trend="Awaiting admin approval" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Tickets by Status */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tickets by Status
          </h3>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Tickets" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No tickets available</div>
            )}
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Tickets by Category
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-md">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={4} dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-xs">No tickets data available</div>
            )}
          </div>
        </div>

        {/* Withdrawals Overview */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Withdrawal Requests
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-md">
            {withdrawalPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" cy="50%" 
                  innerRadius="40%" outerRadius="90%" 
                  barSize={15} 
                  data={withdrawalPieData.map((d, i) => ({
                    ...d,
                    fill: d.name === "Pending" ? "#f97316" : d.name === "Approved" ? "#10b981" : "#f43f5e"
                  }))}
                >
                  <RadialBar background={{ fill: '#333' }} dataKey="value" cornerRadius={10} />
                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-xs">No withdrawals data available</div>
            )}
          </div>
        </div>
        {/* Ticket Trends */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monthly Ticket Trends (By Category)
          </h3>
          <div className="h-[300px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {ticketsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  {categoriesList.map((cat, index) => (
                    <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No trend data available</div>
            )}
          </div>
        </div>

        {/* Withdrawal Trends */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Weekly Withdrawal Volume
          </h3>
          <div className="h-[300px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {withdrawalsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={withdrawalsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" stackId="1" dataKey="approved" stroke="#10b981" fill="#10b981" fillOpacity={0.5} name="Approved" />
                  <Area type="monotone" stackId="1" dataKey="pending" stroke="#f97316" fill="#f97316" fillOpacity={0.5} name="Pending" />
                  <Area type="monotone" stackId="1" dataKey="rejected" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} name="Rejected" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No withdrawal volume available</div>
            )}
          </div>
        </div>

        {/* Admin Assignment Trends */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Ticket Assignments
          </h3>
          <div className="h-[300px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {adminTicketsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adminTicketsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  {adminList.map((admin, index) => (
                    <Line key={admin} type="monotone" dataKey={admin} stroke={COLORS[(index + 3) % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No admin data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
