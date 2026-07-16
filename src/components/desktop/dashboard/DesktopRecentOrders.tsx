import { useQuery } from "@tanstack/react-query";
import { getWorkspaceRecentOrders } from "@/api/products";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { formatCurrency } from "@/lib/currency";
import { Package, Calendar, Loader2 } from "lucide-react";

export function DesktopRecentOrders() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["workspace-recent-orders", workspaceId],
    queryFn: () => getWorkspaceRecentOrders({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="font-semibold text-lg">Recent Orders</h3>
        <button className="text-sm font-medium text-primary hover:underline">View all</button>
      </div>
      <div className="border-t border-border/60">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">Loading recent orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Package className="h-8 w-8 opacity-20" />
            <p className="text-sm">No recent orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {order.user?.first_name} {order.user?.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="font-medium text-foreground/80">{order.product?.name}</span>
                      {order.product?.event?.title && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded-md">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {order.product.event.title}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-semibold text-[15px]">
                    {formatCurrency(order.amount_paid || 0, activeWorkspace?.currency)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
