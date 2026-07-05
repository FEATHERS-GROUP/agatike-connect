import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Bus, MapPin, Ticket, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function TransportDashboard() {
  const { activeWorkspace } = useWorkspace() as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transport Overview</h1>
        <p className="text-muted-foreground">Manage your routes, schedules, and ticketing.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats Cards */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Ticket className="h-4 w-4" />
            <h3 className="text-sm font-medium">Tickets Sold</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <h3 className="text-sm font-medium">Active Routes</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-1">Total routes defined</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Bus className="h-4 w-4" />
            <h3 className="text-sm font-medium">Upcoming Trips</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled next 7 days</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <h3 className="text-sm font-medium">Passengers</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-1">Total transported</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to={`/dashboard/${activeWorkspace?.slug}/routes/create-route` as any}>
              <MapPin className="mr-2 h-4 w-4" />
              Add New Route
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/dashboard/${activeWorkspace?.slug}/trips/create-trip` as any}>
              <Bus className="mr-2 h-4 w-4" />
              Schedule Trip
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/dashboard/${activeWorkspace?.slug}/vehicles` as any}>Add Vehicle</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
