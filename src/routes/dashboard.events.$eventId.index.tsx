import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Share2, Ticket, Users, DollarSign, MapPin, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { events, ticketTiers } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/events/$eventId/")({
  component: DashboardEventDetails,
});

function DashboardEventDetails() {
  const { eventId } = Route.useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Find the event or use a fallback for mock display
  const event = events.find(e => e.id === eventId) || events[0];

  // Mock data for attendance vs target
  const attendanceData = [
    { name: "Week 1", target: 100, attended: 120 },
    { name: "Week 2", target: 200, attended: 180 },
    { name: "Week 3", target: 300, attended: 350 },
    { name: "Week 4", target: 400, attended: 480 },
    { name: "Week 5", target: 500, attended: 490 },
  ];

  // Mock data for ticket classification breakdown
  const ticketData = [
    { name: "General Admission", value: 320, color: "var(--color-primary)" }, // Primary
    { name: "VIP Lounge", value: 120, color: "color-mix(in oklch, var(--color-primary) 60%, var(--color-background))" }, // Primary light
    { name: "Early Bird", value: 50, color: "color-mix(in oklch, var(--color-primary) 30%, var(--color-background))" }, // Primary lighter
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Live
            </span>
            <span className="text-xs text-muted-foreground">{event.category}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight truncate">{event.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full shadow-sm hidden md:flex">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button className="rounded-full shadow-sm">
            <Edit2 className="mr-2 h-4 w-4" /> Edit Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Revenue</span>
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-green-500">${event.price * 490}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Tickets Sold</span>
                <Ticket className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">490 <span className="text-sm font-normal text-muted-foreground">/ 500</span></p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2 text-muted-foreground">
                <span className="text-sm font-medium">Checked In</span>
                <Users className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-primary">312</p>
            </div>
          </div>

          {/* Anticipated vs Actual Chart */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold mb-6">Attendance vs Anticipated Target</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="target" name="Anticipated Target" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attended" name="Actual Attendance" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ticket Classification List */}
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <div className="p-6 border-b border-border/60">
              <h3 className="font-semibold">All Ticket Classifications</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ticketTiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{tier.name}</td>
                    <td className="px-6 py-4 text-green-500 font-medium">${tier.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tier.remaining < 10 ? 'bg-orange-500/10 text-orange-500' : 'bg-secondary text-muted-foreground'}`}>
                        {tier.remaining} Left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Calendar Widget */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col items-center">
            <h3 className="font-semibold self-start mb-2">Event Schedule</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl border border-border/60"
            />
            <div className="w-full mt-4 p-3 bg-secondary/50 rounded-xl border border-border text-sm flex items-center justify-between">
              <span className="font-medium">{event.date}</span>
              <span className="text-muted-foreground text-xs">{event.time}</span>
            </div>
          </div>

          {/* Ticket Breakdown Pie Chart */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold mb-2">Sales Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="mt-4 space-y-2">
              {ticketData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.value} Sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 mt-10">
            <h3 className="font-semibold text-red-500 flex items-center gap-2 mb-2">
              <Ban className="h-5 w-5" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Suspending this event will immediately halt all ticket sales and hide it from the public.
            </p>
            <Button variant="destructive" className="w-full rounded-full">
              Suspend Event
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
