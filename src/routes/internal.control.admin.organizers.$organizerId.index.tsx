import { createFileRoute, getRouteApi, useRouter } from "@tanstack/react-router";
import { Users, Calendar, MapPin, Ticket, CreditCard, Ban, CheckCircle, MessageSquare, Image, Building, Banknote } from "lucide-react";
import { setAdminOrganizerStatus } from "@/api/admin_organizer_control";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/")({
  component: OrganizerOverview,
});

function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: number | string, icon: any, colorClass: string }) {
  return (
    <div className="bg-[#252526] border border-[#333333] rounded-sm p-4 flex items-center gap-4">
      <div className={`p-3 rounded-sm ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-[#797775] text-xs uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
      </div>
    </div>
  );
}

function OrganizerOverview() {
  const routeApi = getRouteApi('/internal/control/admin/organizers/$organizerId');
  const { overview } = routeApi.useLoaderData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!overview) return null;

  const handleToggleStatus = async (newStatus: boolean) => {
    try {
      setLoading(true);
      await setAdminOrganizerStatus({
        data: { organizerId: overview.id, active: newStatus },
      } as any);
      toast.success(newStatus ? "Organizer activated successfully" : "Organizer banned successfully");
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organizer status");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Data Processing for Charts
  // -------------------------------------------------------------
  const { upcomingEvents, eventsChartData, revenueChartData } = useMemo(() => {
    const now = new Date();
    
    // 1. Upcoming Events
    const upcoming = (overview.allEvents || [])
      .map((e: any) => ({ ...e, start_date: e.schedules?.[0]?.start_date }))
      .filter((e: any) => e.start_date && new Date(e.start_date) > now)
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);

    // 2. Events per Month Chart
    const eventsByMonth: Record<string, number> = {};
    (overview.allEvents || []).forEach((e: any) => {
      if (!e.created_at) return;
      const date = new Date(e.created_at);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
    });

    // 3. Revenue by Source Chart
    const revenueByMonth: Record<string, any> = {};
    (overview.walletTx || []).forEach((tx: any) => {
      if (!tx.created_at || !tx.net_amount) return;
      const date = new Date(tx.created_at);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = { name: month, tickets: 0, spaces: 0, venues: 0, experiences: 0 };
      }

      const amount = parseFloat(tx.net_amount) || 0;
      if (tx.type === "event_ticket") revenueByMonth[month].tickets += amount;
      else if (tx.type === "space_subscription") revenueByMonth[month].spaces += amount;
      else if (tx.type === "venue_booking") revenueByMonth[month].venues += amount;
      else revenueByMonth[month].experiences += amount; // Fallback for other incoming revenue
    });

    const evChart = Object.keys(eventsByMonth).map(k => ({ name: k, count: eventsByMonth[k] }));
    const revChart = Object.keys(revenueByMonth).map(k => revenueByMonth[k]);

    return { upcomingEvents: upcoming, eventsChartData: evChart, revenueChartData: revChart };
  }, [overview]);

  const totalInvoices = (overview.invoices || []).reduce((sum: number, inv: any) => sum + (parseFloat(inv.amount) || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h2 className="text-xl font-medium text-white">Organizer Dashboard</h2>
        
        <div className="flex items-center gap-3">
          <span className="text-[#797775] text-sm">Status:</span>
          <span className={overview.active ? "text-[#84c87e] font-medium" : "text-[#f43f5e] font-medium"}>
            {overview.active ? "Active" : "Inactive (Banned)"}
          </span>
          {overview.active ? (
            <button
              onClick={() => handleToggleStatus(false)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20 transition-colors rounded-sm disabled:opacity-50 text-xs font-medium ml-2"
            >
              <Ban className="h-3.5 w-3.5" />
              {loading ? "..." : "Ban Account"}
            </button>
          ) : (
            <button
              onClick={() => handleToggleStatus(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#84c87e]/10 text-[#84c87e] border border-[#84c87e]/30 hover:bg-[#84c87e]/20 transition-colors rounded-sm disabled:opacity-50 text-xs font-medium ml-2"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {loading ? "..." : "Activate Account"}
            </button>
          )}
        </div>
      </div>
      
      {/* EXHAUSTIVE STATS GRID */}
      <h3 className="text-md font-medium text-[#cccccc]">Platform Usage</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={overview.eventsCount} icon={Calendar} colorClass="bg-[#84c87e]/10 text-[#84c87e]" />
        <StatCard title="Ticket Attendees" value={overview.attendeesCount} icon={Ticket} colorClass="bg-[#c586c0]/10 text-[#c586c0]" />
        <StatCard title="Venues Created" value={overview.venuesCount} icon={MapPin} colorClass="bg-[#569cd6]/10 text-[#569cd6]" />
        <StatCard title="Spaces Claimed" value={overview.spacesCount} icon={Building} colorClass="bg-[#dcdcaa]/10 text-[#dcdcaa]" />
        <StatCard title="Community Posts" value={overview.postsCount} icon={MessageSquare} colorClass="bg-[#4ec9b0]/10 text-[#4ec9b0]" />
        <StatCard title="Stories/Highlights" value={overview.storiesCount} icon={Image} colorClass="bg-[#ce9178]/10 text-[#ce9178]" />
        <StatCard title="Workspace Users" value={overview.usersCount} icon={Users} colorClass="bg-[#f97316]/10 text-[#f97316]" />
        <StatCard title="Total Paid to Gatike" value={`$${totalInvoices.toFixed(2)}`} icon={CreditCard} colorClass="bg-[#569cd6]/10 text-[#569cd6]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* REVENUE TIMELINE */}
        <div className="bg-[#252526] border border-[#333333] rounded-sm p-5">
          <h3 className="text-md font-medium text-white mb-6 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-[#84c87e]" />
            Revenue by Source (Over Time)
          </h3>
          <div className="h-[250px] w-full">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#797775]">No revenue data found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c586c0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#c586c0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpaces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dcdcaa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#dcdcaa" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVenues" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#569cd6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#569cd6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#797775" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#797775" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333333', color: '#fff' }}
                    itemStyle={{ color: '#cccccc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#cccccc' }} />
                  <Area type="monotone" dataKey="tickets" name="Tickets" stackId="1" stroke="#c586c0" fill="url(#colorTickets)" />
                  <Area type="monotone" dataKey="venues" name="Venues" stackId="1" stroke="#569cd6" fill="url(#colorVenues)" />
                  <Area type="monotone" dataKey="spaces" name="Spaces" stackId="1" stroke="#dcdcaa" fill="url(#colorSpaces)" />
                  <Area type="monotone" dataKey="experiences" name="Experiences" stackId="1" stroke="#4ec9b0" fill="#4ec9b0" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* EVENTS TIMELINE */}
        <div className="bg-[#252526] border border-[#333333] rounded-sm p-5">
          <h3 className="text-md font-medium text-white mb-6 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#f97316]" />
            Events Created (Over Time)
          </h3>
          <div className="h-[250px] w-full">
            {eventsChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#797775]">No event data found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                  <XAxis dataKey="name" stroke="#797775" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#797775" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333333', color: '#fff' }}
                    itemStyle={{ color: '#84c87e' }}
                    cursor={{fill: '#333333', opacity: 0.4}}
                  />
                  <Bar dataKey="count" name="Events" fill="#84c87e" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* UPCOMING EVENTS LIST */}
      <div className="bg-[#252526] border border-[#333333] rounded-sm mt-6">
        <div className="p-4 border-b border-[#333333] flex items-center gap-2">
          <h3 className="text-md font-medium text-white">Upcoming Events</h3>
          <span className="bg-[#333333] text-[#cccccc] text-xs px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#2d2d30] text-[#cccccc]">
              <tr>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Title</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Start Date</th>
                <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#cccccc]">
              {upcomingEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#797775]">
                    No upcoming events found.
                  </td>
                </tr>
              ) : (
                upcomingEvents.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-medium text-white">{evt.title || "Untitled Event"}</td>
                    <td className="py-2 px-4">
                      {evt.start_date ? new Date(evt.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                    </td>
                    <td className="py-2 px-4">
                      <span className="text-[#84c87e]">Scheduled</span>
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
