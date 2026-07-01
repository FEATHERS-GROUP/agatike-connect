import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Send,
  Save,
  Copy,
  Check,
  Loader2,
  FileText,
} from "lucide-react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProcurementInvoice } from "@/api/procurement";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/procurement_/create")({
  component: CreateInvoicePage,
});

type InvoiceType = "proforma" | "invoice";
type LineItem = { description: string; quantity: number; unit_price: number };

function generateInvoiceNumber(type: InvoiceType) {
  const prefix = type === "proforma" ? "PRO" : "INV";
  const date = new Date();
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${yy}${mm}-${rand}`;
}

function CreateInvoicePage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "RWF";
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("invoice");
  const [invoiceNumber] = useState(() => generateInvoiceNumber("invoice"));
  const [client, setClient] = useState({ name: "", email: "", company: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Payment due within 30 days.");

  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const next = [...items];
    (next[idx] as any)[field] = value;
    setItems(next);
  };

  const createMutation = useMutation({
    mutationFn: (status: "draft" | "sent") =>
      createProcurementInvoice({
        data: {
          workspace_id: wsId,
          invoice_number:
            invoiceType === "proforma" ? generateInvoiceNumber("proforma") : invoiceNumber,
          invoice_type: invoiceType,
          client_name: client.name,
          client_email: client.email,
          client_company: client.company,
          client_address: client.address,
          issue_date: issueDate,
          due_date: dueDate || null,
          tax_rate: taxRate,
          notes: notes,
          payment_terms: paymentTerms,
          status,
          currency,
          items: {
            data: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
            })),
          },
        },
      } as any),
    onSuccess: (_, status) => {
      toast.success(status === "sent" ? "Invoice marked as sent!" : "Invoice saved as draft!");
      queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] });
      navigate({ to: `/dashboard/${workspaceSlug}/book/procurement` as any });
    },
    onError: () => toast.error("Failed to save invoice"),
  });

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invoices/preview/${invoiceNumber}`);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const printInvoice = () => window.print();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-secondary/50"
            onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/book/procurement` as any })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Invoice</h1>
            <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2 h-10" onClick={copyShareLink}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Share Link"}
          </Button>
          <Button variant="outline" className="rounded-xl gap-2 h-10" onClick={printInvoice}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-xl gap-2 h-10"
            disabled={createMutation.isPending || !client.name}
            onClick={() => createMutation.mutate("draft")}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            className="rounded-xl gap-2 h-10 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            disabled={createMutation.isPending || !client.name}
            onClick={() => createMutation.mutate("sent")}
          >
            <Send className="h-4 w-4" /> Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main invoice form ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type toggle */}
          <div className="bg-card border border-border/60 rounded-3xl p-5">
            <Label className="text-base font-bold mb-3 block">Invoice Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["invoice", "proforma"] as InvoiceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setInvoiceType(t)}
                  className={cn(
                    "h-12 rounded-xl font-semibold text-sm capitalize transition-all border-2",
                    invoiceType === t
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {t === "proforma" ? "📋 Proforma Invoice" : "📄 Invoice / Bill"}
                </button>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base">Client Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  placeholder="Acme Corp"
                  value={client.company}
                  onChange={(e) => setClient({ ...client, company: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  placeholder="123 Street, City"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base">Line Items</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 text-xs font-semibold uppercase text-muted-foreground px-1">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center"
                >
                  <Input
                    placeholder="Service or item description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                    className="h-10 rounded-xl text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                    className="h-10 rounded-xl text-right"
                  />
                  <div className="text-right text-sm font-semibold px-1">
                    {(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive opacity-50 hover:opacity-100"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base">Notes & Terms</h3>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea
                rows={3}
                placeholder="Any notes for the client..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* ── Right sidebar: summary ─────────────────────── */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base">Dates</h3>
            <div className="space-y-1.5">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base">Summary</h3>
            <div className="space-y-1.5">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {subtotal.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="font-semibold">
                  {taxAmount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t border-border/60">
                <span>Total</span>
                <span className="text-primary">
                  {total.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">Invoice Preview</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground font-semibold">#{invoiceNumber}</span>
              </p>
              <p>
                Type: <span className="capitalize">{invoiceType}</span>
              </p>
              <p>
                Client: <span className="text-foreground">{client.name || "—"}</span>
              </p>
              <p>Items: {items.filter((i) => i.description).length}</p>
              <p>Currency: {currency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
