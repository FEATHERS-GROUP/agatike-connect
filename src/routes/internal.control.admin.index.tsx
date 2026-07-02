import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/admin/StatCard";
import { Users, CreditCard, Activity, Package, Plus, RefreshCw, Download } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h1 className="text-xl font-semibold text-white">Dashboard Overview</h1>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#333333] text-[#cccccc] font-medium text-[13px] transition-colors">
            <Plus className="h-4 w-4 text-[#f97316]" />
            New dashboard
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#333333] text-[#cccccc] font-medium text-[13px] transition-colors">
            <RefreshCw className="h-4 w-4 text-[#f97316]" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Total Users" value="124,592" trend="+12.5% vs last month" icon={Users} />
        <StatCard
          title="Revenue (30d)"
          value="$842,500"
          trend="+8.2% vs last month"
          icon={CreditCard}
        />
        <StatCard
          title="Active Organizers"
          value="1,245"
          trend="+2.1% vs last month"
          icon={Activity}
        />
        <StatCard
          title="System Load"
          value="24%"
          trend="-5% vs last week"
          isPositive={false}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Main Chart Area */}
        <div className="col-span-1 xl:col-span-2 bg-[#252526] p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333333]">
            <h3 className="text-[13px] font-semibold text-[#cccccc]">Revenue Analytics</h3>
            <select className="bg-[#111111] border border-[#333333] text-[11px] text-[#cccccc] px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-[250px] w-full bg-[#111111] flex items-center justify-center border border-[#333333]">
            <p className="text-[#797775] text-[13px] flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Chart visualization rendering...
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 bg-[#252526] p-4">
          <h3 className="text-[13px] font-semibold text-[#cccccc] mb-4 pb-2 border-b border-[#333333]">
            Activity log
          </h3>
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex gap-3 py-2 border-b border-[#333333] last:border-0 hover:bg-[#2d2d30] px-2 -mx-2 cursor-pointer transition-colors"
              >
                <div className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#f97316]" />
                </div>
                <div>
                  <p className="text-[13px] text-[#cccccc]">Update Organizer Config</p>
                  <p className="text-[11px] text-[#797775] mt-0.5">Succeeded • Global Admin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
