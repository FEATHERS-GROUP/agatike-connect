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
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProcurementInvoice } from "@/api/procurement";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadFormData } from "@/api/storage";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/procurement_/create")({
  component: CreateInvoicePage,
});

type InvoiceType = "proforma" | "invoice" | "quote" | "purchase_order" | "credit_note" | "receipt";
type LineItem = { description: string; quantity: number; unit_price: number };

function generateInvoiceNumber(type: InvoiceType) {
  const prefix =
    type === "proforma"
      ? "PRO"
      : type === "quote"
        ? "QTE"
        : type === "purchase_order"
          ? "PO"
          : type === "credit_note"
            ? "CN"
            : type === "receipt"
              ? "RCT"
              : "INV";
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

  const [hasSelectedType, setHasSelectedType] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("invoice");
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateInvoiceNumber("invoice"));
  const [client, setClient] = useState({ name: "", email: "", company: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Payment due within 30 days.");

  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [stampUrl, setStampUrl] = useState("");
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const isQuote = invoiceType === "quote";
  const isPO = invoiceType === "purchase_order";
  const isCredit = invoiceType === "credit_note";
  const isReceipt = invoiceType === "receipt";

  const titleLabel = isQuote
    ? "Quote"
    : isPO
      ? "Purchase Order"
      : isCredit
        ? "Credit Note"
        : isReceipt
          ? "Receipt"
          : invoiceType === "proforma"
            ? "Proforma"
            : "Invoice";
  const billToLabel = isPO
    ? "Vendor / Supplier"
    : isCredit
      ? "Credit To"
      : isQuote
        ? "Prepared For"
        : isReceipt
          ? "Received From"
          : "Bill To";
  const dateLabel = isQuote
    ? "Valid Until"
    : isPO
      ? "Expected Delivery"
      : isReceipt
        ? "Payment Date"
        : "Due Date";
  const termsLabel = isPO
    ? "Delivery Instructions"
    : isQuote
      ? "Terms & Conditions"
      : "Payment Terms";

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
          invoice_number: invoiceNumber,
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
          logo_url: logoUrl || null,
          signature_url: signatureUrl || null,
          stamp_url: stampUrl || null,
          metadata: metadata,
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

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    setter: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }

    setIsUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "invoices");
      const res = await uploadFormData({ data: formData } as any);
      if (res?.url) {
        setter(res.url);
        toast.success(`${key} uploaded successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${key}`);
    } finally {
      setIsUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invoices/preview/${invoiceNumber}`);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const printInvoice = () => window.print();

  if (!hasSelectedType) {
    const docTypes = [
      {
        id: "quote" as InvoiceType,
        title: "Quote / Estimate",
        desc: "A proposal of estimated costs for services or goods.",
      },
      {
        id: "proforma" as InvoiceType,
        title: "Proforma Invoice",
        desc: "A preliminary bill sent in advance of a service or delivery.",
      },
      {
        id: "invoice" as InvoiceType,
        title: "Standard Invoice",
        desc: "A commercial document issued to a buyer relating to a sale.",
      },
      {
        id: "receipt" as InvoiceType,
        title: "Sales Receipt",
        desc: "A document acknowledging that payment has been received.",
      },
      {
        id: "purchase_order" as InvoiceType,
        title: "Purchase Order",
        desc: "A commercial document from buyer to seller indicating agreed prices.",
      },
      {
        id: "credit_note" as InvoiceType,
        title: "Credit Note",
        desc: "A memo issued to a buyer, reducing the amount owed.",
      },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in zoom-in duration-300 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What are you creating?</h1>
          <p className="text-muted-foreground">Select the type of document to get started.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {docTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setInvoiceType(type.id);
                setInvoiceNumber(generateInvoiceNumber(type.id));
                setHasSelectedType(true);
              }}
              className="flex flex-col items-center justify-center p-8 bg-card border-2 border-border/60 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-center">{type.title}</h2>
              <p className="text-sm text-muted-foreground text-center">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">New {titleLabel}</h1>
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
            className="rounded-xl gap-2 h-10 shadow-[var(--shadow-glow)] text-white"
            style={{ background: "var(--gradient-primary)" }}
            disabled={createMutation.isPending || !client.name}
            onClick={() => createMutation.mutate("sent")}
          >
            <Send className="h-4 w-4" /> Send {titleLabel}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* ── Left Sidebar: Data Entry ──────────────────────────── */}
        <div className="space-y-6 print:hidden sticky top-6">
          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base border-b border-border/60 pb-2">Settings</h3>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Issue Date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="h-9 rounded-lg text-xs"
                />
              </div>
              {!isCredit && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{dateLabel}</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Metadata Fields */}
            {(isCredit || isReceipt) && (
              <div className="space-y-3 pt-2 border-t border-border/60">
                {isCredit && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Reference Invoice #</Label>
                    <Input
                      value={metadata.reference_invoice || ""}
                      onChange={(e) =>
                        setMetadata({ ...metadata, reference_invoice: e.target.value })
                      }
                      className="h-9 rounded-lg text-xs"
                      placeholder="e.g. INV-2607-1234"
                    />
                  </div>
                )}
                {isReceipt && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Payment Method</Label>
                    <Input
                      value={metadata.payment_method || ""}
                      onChange={(e) => setMetadata({ ...metadata, payment_method: e.target.value })}
                      className="h-9 rounded-lg text-xs"
                      placeholder="e.g. Bank Transfer, Credit Card"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base border-b border-border/60 pb-2">{billToLabel}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="h-9 rounded-lg text-xs"
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className="h-9 rounded-lg text-xs"
                  placeholder="Email Address"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Company</Label>
                <Input
                  value={client.company}
                  onChange={(e) => setClient({ ...client, company: e.target.value })}
                  className="h-9 rounded-lg text-xs"
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Address</Label>
                <Input
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  className="h-9 rounded-lg text-xs"
                  placeholder="Billing Address"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-base border-b border-border/60 pb-2">Financials</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="h-9 rounded-lg text-xs"
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: A4 Canvas View ─────────────────────── */}
        <div className="flex-1 overflow-x-auto bg-slate-100 p-8 rounded-3xl shadow-inner min-h-[800px] flex items-start justify-center print:bg-white print:p-0 print:shadow-none print:rounded-none">
          {/* A4 Page container */}
          <div className="bg-white text-slate-900 w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] flex flex-col relative print:shadow-none print:w-full print:h-full print:p-0">
            {/* Canvas Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-widest text-slate-800">
                  {titleLabel}
                </h1>
                <p className="text-slate-500 font-medium">#{invoiceNumber}</p>
              </div>

              {/* Logo Upload Area */}
              <div className="w-48 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg relative hover:bg-slate-50 transition-colors group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => setLogoUrl("")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                    {isUploading["logo"] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mb-1 text-slate-300" />
                    )}
                    <span className="text-xs font-medium">Upload Logo (5MB)</span>
                  </div>
                )}
                {!logoUrl && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleUpload(e, "logo", setLogoUrl)}
                  />
                )}
              </div>
            </div>

            {/* Bill To & Details */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {billToLabel}
                </h3>
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    className="w-full font-bold text-lg bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={client.company}
                    onChange={(e) => setClient({ ...client, company: e.target.value })}
                    className="w-full text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Billing Address"
                    value={client.address}
                    onChange={(e) => setClient({ ...client, address: e.target.value })}
                    className="w-full text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Email Address"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    className="w-full text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-0.5"
                  />
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <div className="space-y-3 w-full max-w-[200px]">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-400">Issue Date</span>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="bg-transparent border-0 text-sm font-medium text-right focus:ring-0 p-0"
                    />
                  </div>
                  {!isCredit && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {dateLabel}
                      </span>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-transparent border-0 text-sm font-medium text-right focus:ring-0 p-0"
                      />
                    </div>
                  )}
                  {isCredit && metadata.reference_invoice && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">
                        Ref Invoice
                      </span>
                      <span className="text-sm font-medium text-right">
                        {metadata.reference_invoice}
                      </span>
                    </div>
                  )}
                  {isReceipt && metadata.payment_method && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Paid Via</span>
                      <span className="text-sm font-medium text-right">
                        {metadata.payment_method}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas Items Table */}
            <div className="mb-8 flex-1">
              <div className="grid grid-cols-[1fr_80px_120px_120px_40px] gap-4 border-b-2 border-slate-800 pb-2 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                  Qty
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Unit Price
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Amount
                </div>
                <div></div>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_80px_120px_120px_40px] gap-4 items-center group"
                  >
                    <input
                      placeholder="Item description..."
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-1 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-1 py-2 text-sm text-center"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-1 py-2 text-sm text-right"
                    />
                    <div className="text-right text-sm font-semibold px-1 py-2">
                      {(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}
                    </div>
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-destructive"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 border-dashed border-2 text-slate-500 hover:text-slate-800"
                  onClick={addItem}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
              </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-2 gap-12 mt-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Notes
                  </h3>
                  <textarea
                    rows={3}
                    placeholder="Additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full resize-none bg-transparent border border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 p-2 text-sm text-slate-600 rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {termsLabel}
                  </h3>
                  <textarea
                    rows={2}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full resize-none bg-transparent border border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 p-2 text-sm text-slate-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-center space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {subtotal.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    Tax
                    <input
                      type="number"
                      className="w-16 h-6 text-xs px-1 border rounded text-center bg-white"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                    />
                    %
                  </span>
                  <span className="font-semibold">
                    {taxAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t-2 border-slate-200">
                  <span>{isCredit ? "Total Credit" : "Total"}</span>
                  <span className={isCredit ? "text-destructive" : ""}>
                    {isCredit ? "-" : ""}
                    {total.toLocaleString()} {currency}
                  </span>
                </div>

                {isReceipt && (
                  <>
                    <div className="flex justify-between text-sm text-slate-600 pt-2">
                      <span>Amount Paid</span>
                      <span className="font-bold text-green-600">
                        -{total.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Balance Due</span>
                      <span className="font-bold">0.00 {currency}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Signature & Stamp Areas */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-100">
              {/* Signature */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
                  Authorized Signature
                </h3>
                <div className="w-full max-w-[200px] h-24 mx-auto flex flex-col items-center justify-center border-b-2 border-dashed border-slate-300 relative group hover:bg-slate-50 transition-colors cursor-pointer rounded-t-lg">
                  {signatureUrl ? (
                    <>
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => setSignatureUrl("")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                      {isUploading["signature"] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                      )}
                      <span className="text-xs font-medium text-center">
                        Upload Signature
                        <br />
                        (Optional)
                      </span>
                    </div>
                  )}
                  {!signatureUrl && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleUpload(e, "signature", setSignatureUrl)}
                    />
                  )}
                </div>
              </div>

              {/* Stamp */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
                  Company Stamp
                </h3>
                <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-full relative group hover:bg-slate-50 transition-colors cursor-pointer">
                  {stampUrl ? (
                    <>
                      <img
                        src={stampUrl}
                        alt="Stamp"
                        className="w-full h-full object-contain p-2 rounded-full"
                      />
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full shadow-lg"
                          onClick={() => setStampUrl("")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-slate-400">
                      {isUploading["stamp"] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                      )}
                      <span className="text-[10px] font-medium text-center leading-tight">
                        Add Stamp
                      </span>
                    </div>
                  )}
                  {!stampUrl && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                      onChange={(e) => handleUpload(e, "stamp", setStampUrl)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
