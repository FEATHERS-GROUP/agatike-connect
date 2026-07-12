import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Workspace } from "@/contexts/WorkspaceContext";

interface SettingsOverviewTabProps {
  workspaces: Workspace[];
  navigate: (options: any) => void;
  disableWorkspaceMutation: any;
  setIsWizardOpen: (open: boolean) => void;
  notifications: any[];
  showAllActivities: boolean;
  setShowAllActivities: (show: boolean) => void;
  transactions: any[];
  showAllEarnings: boolean;
  setShowAllEarnings: (show: boolean) => void;
}

export function SettingsOverviewTab({
  workspaces,
  navigate,
  disableWorkspaceMutation,
  setIsWizardOpen,
  notifications,
  showAllActivities,
  setShowAllActivities,
  transactions,
  showAllEarnings,
  setShowAllEarnings,
}: SettingsOverviewTabProps) {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Workspaces Table */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold">Workspaces</h2>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors"
          >
            + Create Workspace
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-b border-border">
                <th className="pb-3 font-medium">NAME</th>
                <th className="pb-3 font-medium">TYPE</th>
                <th className="pb-3 font-medium">LOCATION</th>
                <th className="pb-3 font-medium">CREATED</th>
                <th className="pb-3 font-medium">COUNTRY</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {workspaces.map((w: any, i) => (
                <tr key={i} className="group hover:bg-muted/50 transition-colors">
                  <td className="py-4 font-medium text-foreground pr-4 flex items-center gap-2">
                    {w.logo ? (
                      <img src={w.logo} alt="" className="h-6 w-6 rounded-md object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-xs">
                        {w.icon}
                      </div>
                    )}
                    {w.name}
                  </td>
                  <td className="py-4 text-muted-foreground font-medium pr-4">{w.type}</td>
                  <td className="py-4 text-muted-foreground font-medium pr-4">
                    {w.city || "Not specified"}
                  </td>
                  <td className="py-4 text-muted-foreground font-medium pr-4">
                    {w.created_at ? new Date(w.created_at).toLocaleDateString() : "Unknown"}
                  </td>
                  <td className="py-4 text-muted-foreground font-medium pr-4">
                    {w.country || "Not specified"}
                  </td>
                  <td className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/${w.slug}` })}>
                          Open Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => disableWorkspaceMutation.mutate(w.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Disable Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split Section */}
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        {/* Activity */}
        <div>
          <h2 className="text-[17px] font-bold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              (showAllActivities ? notifications : notifications.slice(0, 5)).map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 text-primary">
                    {item.title?.charAt(0) || "N"}
                  </div>
                  <div>
                    <p className="text-[13px] text-foreground font-semibold line-clamp-1">
                      {item.title || "Notification"}{" "}
                      <span className="text-muted-foreground font-normal">{item.content}</span>
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 5 && (
            <button
              onClick={() => setShowAllActivities(!showAllActivities)}
              className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors mt-6"
            >
              {showAllActivities ? "Show less" : "View all"}
            </button>
          )}
        </div>

        {/* Compensation / Platform Stats */}
        <div>
          <h2 className="text-[17px] font-bold mb-6">Platform Earnings</h2>
          <div className="space-y-6">
            {!transactions || transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions.</p>
            ) : (
              (showAllEarnings ? transactions : transactions.slice(0, 5)).map(
                (item: any, i: number) => (
                  <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="text-[14px] text-foreground font-bold">
                      {item.amount || 0} {item.currency || "RWF"}{" "}
                      <span className="font-medium text-muted-foreground">
                        {item.transaction_type === "withdrawal" ? "Withdrawn" : "Earned"}
                      </span>
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {item.description || "Platform transaction"} on{" "}
                      <span className="font-medium text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                ),
              )
            )}
          </div>
          {transactions && transactions.length > 5 && (
            <button
              onClick={() => setShowAllEarnings(!showAllEarnings)}
              className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors mt-6"
            >
              {showAllEarnings ? "Show less" : "View all"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
