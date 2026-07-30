import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { getSponsoredVoucherBatch, updateVoucherBalance } from "@/api/vouchers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Ticket, Loader2, Save, Ban, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/$workspaceSlug/vouchers/$batchId")({
  component: VoucherBatchDetailsView,
});

function VoucherRow({ voucher, currency }: { voucher: any; currency: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(voucher.current_balance);
  const [isActive, setIsActive] = useState(voucher.is_active !== false);
  const queryClient = useQueryClient();

  const totalUsed =
    voucher.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0;
  const initialValue = Number(voucher.current_balance) + Number(totalUsed);

  const mutation = useMutation({
    mutationFn: async () => {
      return await updateVoucherBalance({
        data: { id: voucher.id, balance: Number(balance), is_active: isActive },
      } as any);
    },
    onSuccess: () => {
      toast.success("Voucher updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["voucher-batch"] });
    },
    onError: () => {
      toast.error("Failed to update voucher");
    },
  });

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
      <td className="px-6 py-4">
        <span className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground border border-border/30 shadow-inner">
          {voucher.qr_code_string}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{formatCurrency(initialValue, currency)}</td>
      <td className="px-6 py-4 font-bold text-green-500">{formatCurrency(totalUsed, currency)}</td>
      <td className="px-6 py-4">
        {isEditing ? (
          <Input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-24 h-8 text-sm"
          />
        ) : (
          <span className="font-bold text-blue-500">{formatCurrency(voucher.current_balance, currency)}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-xs">{isActive ? "Active" : "Disabled"}</span>
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
          >
            {isActive ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
            {isActive ? "Active" : "Disabled"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right space-x-2">
        {isEditing ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              style={{ background: "var(--gradient-primary)", color: "white" }}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

function VoucherBatchDetailsView() {
  const { batchId, workspaceSlug } = useParams({ strict: false });
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;

  const { data: batch, isLoading } = useQuery({
    queryKey: ["voucher-batch", batchId],
    queryFn: () => getSponsoredVoucherBatch({ data: { id: batchId as string } } as any),
    enabled: !!batchId,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
        <p>Voucher batch not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/products&add-ons` })}>
          Go Back
        </Button>
      </div>
    );
  }

  const vouchers = batch.vouchers || [];
  
  const filteredVouchers = vouchers.filter((v: any) => 
    v.qr_code_string?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const paginatedVouchers = filteredVouchers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const activeVouchers = vouchers.filter((v: any) => v.is_active);

  const totalValue = activeVouchers.reduce((sum: number, v: any) => {
    const used = v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0;
    return sum + Number(v.current_balance) + Number(used);
  }, 0);

  const totalUsed = activeVouchers.reduce((sum: number, v: any) => {
    return sum + Number(v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0);
  }, 0);

  const totalRemaining = activeVouchers.reduce((sum: number, v: any) => sum + Number(v.current_balance), 0);

  const exportCsv = () => {
    const headers = ["QR Code", "Initial Value", "Used Amount", "Current Balance", "Status", "Generated On"];
    const rows = vouchers.map((v: any) => {
      const used = v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0;
      const initial = Number(v.current_balance) + Number(used);
      return [
        v.qr_code_string,
        initial,
        used,
        v.current_balance,
        v.is_active ? "Active" : "Disabled",
        format(new Date(v.created_at), "yyyy-MM-dd HH:mm:ss"),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${batch.name.replace(/\s+/g, '_')}_vouchers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/${workspaceSlug}/products&add-ons`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{batch.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Batch created on {format(new Date(batch.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-full shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Total Value</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(totalValue, activeWorkspace?.currency || "RWF")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{activeVouchers.length} Active Vouchers</p>
        </div>
        
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Total Used</p>
          <p className="text-3xl font-bold tracking-tight text-green-500">
            {formatCurrency(totalUsed, activeWorkspace?.currency || "RWF")}
          </p>
          <p className="text-sm text-green-500/70 mt-2">Spent across vendors</p>
        </div>
        
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Remaining Balance</p>
          <p className="text-3xl font-bold tracking-tight text-blue-500">
            {formatCurrency(totalRemaining, activeWorkspace?.currency || "RWF")}
          </p>
          <p className="text-sm text-blue-500/70 mt-2">Available to spend</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Generated Vouchers</h2>
            <p className="text-sm text-muted-foreground">Manage individual voucher balances and statuses.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by QR code..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium">Initial Value</th>
                <th className="px-6 py-4 font-medium">Used</th>
                <th className="px-6 py-4 font-medium">Current Balance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedVouchers.map((voucher: any) => (
                <VoucherRow 
                  key={voucher.id} 
                  voucher={voucher} 
                  currency={activeWorkspace?.currency || "RWF"} 
                />
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No vouchers generated for this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * itemsPerPage + (filteredVouchers.length > 0 ? 1 : 0)} to {Math.min(page * itemsPerPage, filteredVouchers.length)} of {filteredVouchers.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
