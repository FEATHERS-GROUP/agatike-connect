import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { RefreshCw, UserCheck, Search, Filter, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/subscriptions")({
  component: SpaceSubscriptionsPage,
});

// Mock data (replace with real API call later)
const MOCK_SUBSCRIPTIONS = [
  { id: "sub-1", user: "Alice Johnson",       plan: "Monthly Hot Desk",  status: "Active",  date: "Oct 12, 2026", type: "returning" },
  { id: "sub-2", user: "Mark Smith",          plan: "Day Pass",          status: "Expired", date: "Oct 11, 2026", type: "new"       },
  { id: "sub-3", user: "Jane Doe",            plan: "Dedicated Desk",    status: "Active",  date: "Oct 10, 2026", type: "returning" },
  { id: "sub-4", user: "Kigali Tech Hub",     plan: "Private Office",    status: "Active",  date: "Oct 08, 2026", type: "returning" },
  { id: "sub-5", user: "AfriTech Solutions",  plan: "Private Office",    status: "Active",  date: "Oct 05, 2026", type: "new"       },
  { id: "sub-6", user: "Hinga Collective",    plan: "Dedicated Desk",    status: "Active",  date: "Oct 02, 2026", type: "new"       },
  { id: "sub-7", user: "David Iradukunda",    plan: "Day Pass",          status: "Pending", date: "Sep 28, 2026", type: "returning" },
  { id: "sub-8", user: "Gasabo Digital Hub",  plan: "Private Office",    status: "Active",  date: "Sep 20, 2026", type: "returning" },
];

function SpaceSubscriptionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const filteredSubscriptions = useMemo(() => {
    return MOCK_SUBSCRIPTIONS.filter((sub) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || sub.user.toLowerCase().includes(q) || sub.plan.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "all" || sub.status.toLowerCase() === filterStatus;
      const matchesType = filterType === "all" || sub.type === filterType;
      
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [query, filterStatus, filterType]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading subscriptions...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage all subscriptions for <span className="text-foreground font-semibold">{space.name}</span>.
          </p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl h-11 px-5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or plan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 rounded-xl h-10"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Types</option>
            <option value="new">New</option>
            <option value="returning">Re-using</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredSubscriptions.length} result{filteredSubscriptions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No subscriptions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{sub.user}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sub.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          sub.type === "returning"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-orange-500/10 text-orange-500"
                        }`}>
                          {sub.type === "returning" ? <RefreshCw className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {sub.type === "returning" ? "Re-using" : "New"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{sub.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          sub.status === "Active" ? "bg-green-500/10 text-green-500" : 
                          sub.status === "Pending" ? "bg-amber-500/10 text-amber-500" : 
                          "bg-muted text-muted-foreground"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
