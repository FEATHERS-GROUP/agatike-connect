import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingWithdrawals } from "@/api/wallet";
import { triggerPawaPayPayout } from "@/api/pawapay";
import { getAdminSession } from "@/api/admin_auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/withdrawals/")({
  beforeLoad: async () => {
    try {
      const session = await getAdminSession();
      if (!session) {
        throw new Error("unauthenticated");
      }
    } catch {
      throw redirect({
        to: "/internal/control/admin/login",
      });
    }
  },
  component: AdminWithdrawalsPage,
});

function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () => getPendingWithdrawals(),
  });

  const payoutMutation = useMutation({
    mutationFn: (transactionId: string) => triggerPawaPayPayout({ data: { transactionId } } as any),
    onSuccess: () => {
      toast.success("Payout triggered successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to trigger payout");
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading withdrawals...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
        <p className="text-muted-foreground mt-1">Review and approve payout transactions.</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Requested Amount</TableHead>
              <TableHead>Net Payout</TableHead>
              <TableHead>Method & Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals?.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>{tx.workspace?.name || "Unknown"}</TableCell>
                <TableCell>
                  {tx.amount} {tx.currency}
                </TableCell>
                <TableCell className="font-bold text-green-600">
                  {tx.net_amount} {tx.currency}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="capitalize">{tx.payout_method}</span>
                    <span className="text-muted-foreground text-xs">{tx.payout_account}</span>
                    {tx.raw_callback_data?.network_id && (
                      <span className="text-xs font-mono text-primary/80">
                        {tx.raw_callback_data.network_id}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                      tx.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : tx.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {tx.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => payoutMutation.mutate(tx.id)}
                      disabled={payoutMutation.isPending}
                    >
                      {payoutMutation.isPending && payoutMutation.variables === tx.id
                        ? "Processing..."
                        : "Approve & Payout"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!withdrawals || withdrawals.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No withdrawals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
