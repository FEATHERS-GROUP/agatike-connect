import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { StatCard } from "@/components/admin/StatCard";
import { Users, CreditCard, Activity, Package, Plus, RefreshCw, BarChart3, PieChart, Briefcase, Boxes, Wallet, Banknote, MapPin, Globe } from "lucide-react";
import { getAdminDashboardStats } from "@/api/admin_dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart } from "recharts";
import { format, parseISO, differenceInYears } from "date-fns";

export const Route = createFileRoute("/internal/control/admin/dashboard")({
  loader: async () => {
    return await getAdminDashboardStats();
  },
  component: AdminDashboard,
});

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

function AdminDashboard() {
  const stats = useLoaderData({ from: "/internal/control/admin/dashboard" });

  // Process Events for Bar Chart
  const eventsByMonth = stats.events.reduce((acc: any, event: any) => {
    const startDate = event.schedules?.[0]?.start_date || event.created_at;
    if (!startDate) return acc;
    const month = format(parseISO(startDate), "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(eventsByMonth)
    .slice(0, 12)
    .map(key => ({ name: key, Events: eventsByMonth[key] }))
    .reverse();

  // Process Subscriptions for Pie Chart
  const subsByPlan = stats.subscriptions.reduce((acc: any, sub: any) => {
    const planName = sub.pricing_plan?.name || "Unknown";
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(subsByPlan).map(key => ({
    name: key,
    value: subsByPlan[key]
  }));

  // Process Earnings for Line Chart
  const earningsByMonth = (stats.earnings || []).reduce((acc: any, earning: any) => {
    if (!earning.created_at) return acc;
    const month = format(parseISO(earning.created_at), "MMM yyyy");
    if (!acc[month]) acc[month] = { name: month, Subscriptions: 0, Platform: 0 };
    
    // Check if it's a subscription earning
    const typeStr = (earning.transaction_type || "").toLowerCase();
    const isSub = typeStr.includes("subscription") || typeStr.includes("plan");
    
    if (isSub) {
      acc[month].Subscriptions += (earning.platform_revenue || 0);
    } else {
      acc[month].Platform += (earning.platform_revenue || 0);
    }
    return acc;
  }, {});

  const earningsChartData = Object.values(earningsByMonth)
    .slice(0, 12)
    .reverse();

  // Process Review Trends
  const reviewsByMonth = (stats.reviews || []).reduce((acc: any, rev: any) => {
    if (!rev.created_at) return acc;
    const month = format(parseISO(rev.created_at), "MMM yyyy");
    if (!acc[month]) acc[month] = { name: month, ratingSum: 0, count: 0 };
    acc[month].ratingSum += (rev.rating || 0);
    acc[month].count += 1;
    return acc;
  }, {});

  const reviewChartData = Object.values(reviewsByMonth)
    .map((r: any) => ({
      name: r.name,
      AvgRating: Number((r.ratingSum / r.count).toFixed(1)),
      Reviews: r.count
    }))
    .reverse();

  // Process Country/City Data
  const orgByCountry: Record<string, number> = {};
  const orgByCity: Record<string, number> = {};
  
  (stats.workspacesDemographics || []).forEach((ws: any) => {
    if (ws.country) {
      orgByCountry[ws.country] = (orgByCountry[ws.country] || 0) + 1;
    }
    if (ws.city) {
      orgByCity[ws.city] = (orgByCity[ws.city] || 0) + 1;
    }
  });

  const countryChartData = Object.keys(orgByCountry).map(k => ({ name: k, value: orgByCountry[k] }));
  const cityChartData = Object.keys(orgByCity).map(k => ({ name: k, value: orgByCity[k] }));

  // Process Gender Data
  const genderData = [
    { name: 'Male', Users: 0, Organizers: 0 },
    { name: 'Female', Users: 0, Organizers: 0 },
    { name: 'Other', Users: 0, Organizers: 0 },
  ];

  (stats.usersDemographics || []).forEach((u: any) => {
    const g = (u.gender || "").toLowerCase();
    if (g === 'male' || g === 'm') genderData[0].Users++;
    else if (g === 'female' || g === 'f') genderData[1].Users++;
    else genderData[2].Users++;
  });

  (stats.organizersDemographics || []).forEach((o: any) => {
    const g = (o.gender || "").toLowerCase();
    if (g === 'male' || g === 'm') genderData[0].Organizers++;
    else if (g === 'female' || g === 'f') genderData[1].Organizers++;
    else genderData[2].Organizers++;
  });

  // Process Age Data
  const ageBuckets = [
    { name: '<18', count: 0 },
    { name: '18-24', count: 0 },
    { name: '25-34', count: 0 },
    { name: '35-44', count: 0 },
    { name: '45-54', count: 0 },
    { name: '55+', count: 0 },
  ];

  (stats.usersDemographics || []).forEach((u: any) => {
    if (u.dateOfBirth) {
      const age = differenceInYears(new Date(), parseISO(u.dateOfBirth));
      if (age < 18) ageBuckets[0].count++;
      else if (age <= 24) ageBuckets[1].count++;
      else if (age <= 34) ageBuckets[2].count++;
      else if (age <= 44) ageBuckets[3].count++;
      else if (age <= 54) ageBuckets[4].count++;
      else ageBuckets[5].count++;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
  };

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-medium text-[13px] transition-colors">
            <Plus className="h-4 w-4 text-[#f97316]" />
            New dashboard
          </button>
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
        <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={Users} />
        <StatCard title="Total Organizers" value={stats.organizers.toLocaleString()} icon={Activity} />
        <StatCard title="Total Workspaces" value={stats.workspaces.toLocaleString()} icon={Briefcase} />
        <StatCard title="Total Staff" value={stats.staff.toLocaleString()} icon={Users} />
        <StatCard title="Platform Revenue" value={formatCurrency(stats.revenue)} icon={CreditCard} />
        <StatCard title="Provider Costs" value={formatCurrency(stats.providerCost)} icon={Banknote} isPositive={false} trend="Provider cut" />
        <StatCard title="Active Wallets" value={stats.totalWallets.toLocaleString()} icon={Wallet} />
        <StatCard title="Payout Balance" value={formatCurrency(stats.totalWalletBalance)} icon={Wallet} trend="Pending Payouts" />
        <StatCard title="Platform Modules" value={stats.modules.toLocaleString()} icon={Boxes} />
        <StatCard title="Design Projects" value={stats.designProjects.toLocaleString()} icon={Package} />
        <StatCard title="System Load" value="24%" isPositive={false} icon={Activity} trend="-5% vs last week" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Main Chart Area */}
        <div className="col-span-1 xl:col-span-2 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-[#333333]">
            <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Events Monthly Trend
            </h3>
          </div>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="Events" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No events data available</div>
            )}
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Active Subscriptions
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-md">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-xs">No subscriptions data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Earnings Chart Area */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-[#333333]">
            <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Earnings Breakdown
            </h3>
          </div>
          <div className="h-[300px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {earningsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `RWF ${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Subscriptions" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Platform" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No earnings data available</div>
            )}
          </div>
        </div>

        {/* Review Trends Area */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-[#333333]">
            <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Platform Review Trends
            </h3>
          </div>
          <div className="h-[300px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {reviewChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={reviewChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Reviews" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="AvgRating" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Avg Rating (Out of 5)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No review data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Organizers by Country */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Organizers by Country
          </h3>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {countryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No country data available</div>
            )}
          </div>
        </div>

        {/* Organizers by City */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Organizers by City
          </h3>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            {cityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs">No city data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Gender Distribution */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gender Distribution
          </h3>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Users" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Organizers" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Age Range */}
        <div className="col-span-1 bg-gray-50 dark:bg-[#252526] p-4 border border-gray-200 dark:border-transparent rounded-lg">
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 pb-2 border-b border-gray-200 dark:border-[#333333] flex items-center gap-2">
            <Activity className="h-4 w-4" />
            User Age Demographics
          </h3>
          <div className="h-[250px] w-full bg-white dark:bg-[#111111] p-4 border border-gray-200 dark:border-[#333333] rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBuckets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
