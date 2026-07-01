import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Plus,
  FileText,
  Loader2,
  Search,
  Download,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FilePlus,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProcurementInvoices, deleteProcurementInvoice, updateProcurementInvoice } from "@/api/procurement";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/procurement")({
  component: ProcurementPage,
});

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type InvoiceType = "proforma" | "invoice";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-slate-500/15 text-slate-500 border-slate-500/30", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Send },
  paid: { label: "Paid", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "bg-red-500/15 text-red-500 border-red-500/30", icon: AlertCircle },
};

function calcInvoiceTotal(invoice: any) {
  const subtotal = (invoice.items || []).reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  );
  const tax = subtotal * (Number(invoice.tax_rate || 0) / 100);
  return subtotal + tax;
}

function ProcurementPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "RWF";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [filterType, setFilterType] = useState<InvoiceType | "all">("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["procurement-invoices", wsId],
    queryFn: () => getProcurementInvoices({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProcurementInvoice({ data: { id } } as any),
    onSuccess: () => { toast.success("Invoice deleted"); queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] }); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: InvoiceStatus }) =>
      updateProcurementInvoice({ data: { id: vars.id, status: vars.status } } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] }),
  });

  const filtered = (invoices as any[]).filter((inv) => {
    const matchSearch =
      !search ||
      inv.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    const matchType = filterType === "all" || inv.invoice_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalPaid = (invoices as any[]).filter((i) => i.status === "paid").reduce((s, i) => s + calcInvoiceTotal(i), 0);
  const totalPending = (invoices as any[]).filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + calcInvoiceTotal(i), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
          <p className="text-muted-foreground mt-1">
            Proforma invoices, bills, and client documents.
          </p>
        </div>
        <Link to={`/dashboard/${workspaceSlug}/book/procurement/create` as any}>
          <Button className="rounded-full gap-2 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
            <FilePlus className="h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: (invoices as any[]).length, color: "text-foreground", bg: "bg-secondary" },
          { label: "Draft", value: (invoices as any[]).filter((i) => i.status === "draft").length, color: "text-slate-500", bg: "bg-slate-500/10" },
          { label: "Paid", value: `${totalPaid.toLocaleString()} ${currency}`, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Outstanding", value: `${totalPending.toLocaleString()} ${currency}`, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <FileText className={`h-4 w-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
              <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or number..."
            className="pl-9 h-10 rounded-xl w-64"
          />
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
          {(["all", "proforma", "invoice"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors", filterType === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              {t === "all" ? "All Types" : t === "proforma" ? "Proforma" : "Invoice"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
          {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors", filterStatus === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 py-20 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No invoices found</p>
          <p className="text-sm mt-1">Create your first invoice to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv: any) => {
            const sc = STATUS_CONFIG[inv.status as InvoiceStatus] || STATUS_CONFIG.draft;
            const total = calcInvoiceTotal(inv);
            return (
              <div key={inv.id} className="bg-card border border-border/60 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-primary/30 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{inv.invoice_number}</span>
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", sc.color)}>
                      {sc.label}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {inv.invoice_type === "proforma" ? "Proforma" : "Invoice"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {inv.client_name}{inv.client_company ? ` · ${inv.client_company}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-base">{total.toLocaleString()} {currency}</p>
                  {inv.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {inv.status !== "paid" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" title="Mark as Paid" onClick={() => updateStatusMutation.mutate({ id: inv.id, status: "paid" })}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  {inv.status === "draft" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Mark as Sent" onClick={() => updateStatusMutation.mutate({ id: inv.id, status: "sent" })}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(inv.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
