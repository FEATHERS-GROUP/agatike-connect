import { Link } from "@tanstack/react-router";
import {
  DollarSign,
  Ticket,
  ScanLine,
  Users,
  Settings,
  Plus,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardMobile() {
  return (
    <div className="min-h-screen bg-background pb-24 pt-safe-top text-foreground">
      {/* Header */}
      <div className="px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-30 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl tracking-tight">Organizer Mode</h1>
          <p className="text-xs text-muted-foreground">gatike_user_admin</p>
        </div>
        <button className="p-2 -mr-2">
          <Settings className="h-6 w-6 text-foreground" />
        </button>
      </div>

      <div className="px-4 py-2 space-y-6">
        {/* Main KPI Card */}
        <div className="rounded-3xl p-6 relative overflow-hidden bg-card border border-border/40 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
            <DollarSign className="h-4 w-4" /> Total Revenue (30d)
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">$48,920</h2>
          <div className="flex items-center gap-1 text-primary text-sm font-bold">
            <TrendingUp className="h-4 w-4" /> +18.4% vs last month
          </div>
          <div className="mt-6 h-16 w-full flex items-end justify-between">
            {/* Mock mini chart */}
            {[4, 7, 5, 8, 6, 9, 12, 10, 14, 11, 15, 13].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary/80 rounded-t-sm"
                style={{ height: `${h * 10}%` }}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/create-event"
            className="bg-primary text-primary-foreground rounded-3xl p-4 flex flex-col items-start gap-4 shadow-[var(--shadow-glow)] transition-transform active:scale-95"
          >
            <div className="bg-white/20 p-3 rounded-2xl">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-bold">Create Event</span>
          </Link>

          <Link
            to="/scanner"
            className="bg-secondary text-foreground rounded-3xl p-4 flex flex-col items-start gap-4 border border-border/40 shadow-sm transition-transform active:scale-95"
          >
            <div className="bg-background p-3 rounded-2xl border border-border/40">
              <ScanLine className="h-6 w-6 text-foreground" />
            </div>
            <span className="font-bold">Scan Tickets</span>
          </Link>
        </div>

        {/* Live Event Status */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg tracking-tight">Live Now</h3>
            <span className="animate-pulse h-2 w-2 bg-primary rounded-full" />
          </div>
          <div className="rounded-3xl border border-border/40 bg-card p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-base">Afrobeats Night Live</h4>
                <p className="text-xs text-muted-foreground">Eko Convention Center</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span>Checked In</span>
                  <span className="text-primary">842 / 1,200</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-secondary rounded-2xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Bar Sales</p>
                  <p className="font-bold">$3,420</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">VIP Scanned</p>
                  <p className="font-bold">45 / 50</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border/40 bg-card p-4">
            <Ticket className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold mb-1">1,284</p>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </div>
          <div className="rounded-3xl border border-border/40 bg-card p-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold mb-1">92.3k</p>
            <p className="text-xs text-muted-foreground">Page Views</p>
          </div>
        </div>
      </div>
    </div>
  );
}
