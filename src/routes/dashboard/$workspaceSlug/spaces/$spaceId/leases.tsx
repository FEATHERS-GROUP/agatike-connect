import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceSubscriptionsBySpaceId } from "@/api/space_subscriptions";
import { Building2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/leases")({
  component: TenantsPage,
});

function TenantsPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["workspace_subscriptions", spaceId],
    queryFn: () => getSpaceSubscriptionsBySpaceId({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  // Filter subscriptions that are attached to a physical resource (Leases)
  const leases = subscriptions.filter((s: any) => s.resource_id != null);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-7 w-7 text-orange-500" />
          Tenants & Leases
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Track which companies or individuals are currently occupying your physical spaces.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Resource (Space)</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading tenants...
                </TableCell>
              </TableRow>
            ) : leases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No resources are currently leased out. 
                  Assign a resource when creating or editing a subscription to see it here.
                </TableCell>
              </TableRow>
            ) : (
              leases.map((lease: any) => (
                <TableRow key={lease.id}>
                  <TableCell>
                    <div className="font-semibold">{lease.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{lease.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/50 font-medium">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      {lease.resource?.name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>{lease.plan_name}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      lease.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {lease.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {lease.team_members?.length || 0}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
