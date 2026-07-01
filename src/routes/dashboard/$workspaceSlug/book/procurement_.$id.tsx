import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProcurementInvoiceById } from "@/api/procurement";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/procurement_/$id")({
  component: InvoicePreviewPage,
});

function InvoicePreviewPage() {
  const { workspaceSlug, id } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const currency = activeWorkspace?.currency || "RWF";

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["procurement-invoice", id],
    queryFn: () => getProcurementInvoiceById({ data: { id } } as any),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8">Loading document...</div>;
  }
  if (!invoice) {
    return <div className="p-8">Document not found.</div>;
  }

  const items = invoice.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const taxAmount = subtotal * (Number(invoice.tax_rate) / 100);
  const total = subtotal + taxAmount;

  const isQuote = invoice.invoice_type === "quote";
  const isPO = invoice.invoice_type === "purchase_order";
  const isCredit = invoice.invoice_type === "credit_note";
  const isReceipt = invoice.invoice_type === "receipt";

  const titleLabel = isQuote ? "Quote" : isPO ? "Purchase Order" : isCredit ? "Credit Note" : isReceipt ? "Receipt" : invoice.invoice_type === "proforma" ? "Proforma" : "Invoice";
  const billToLabel = isPO ? "Vendor / Supplier" : isCredit ? "Credit To" : isQuote ? "Prepared For" : isReceipt ? "Received From" : "Bill To";
  const dateLabel = isQuote ? "Valid Until" : isPO ? "Expected Delivery" : isReceipt ? "Payment Date" : "Due Date";
  const termsLabel = isPO ? "Delivery Instructions" : isQuote ? "Terms & Conditions" : "Payment Terms";

  const theme = {
     bgLight: isReceipt ? "bg-emerald-50" : isQuote ? "bg-amber-50" : isCredit ? "bg-red-50" : isPO ? "bg-slate-100" : "bg-slate-50",
     textAccent: isReceipt ? "text-emerald-700" : isQuote ? "text-amber-700" : isCredit ? "text-red-700" : isPO ? "text-slate-800" : "text-primary",
     borderAccent: isReceipt ? "border-emerald-200" : isQuote ? "border-amber-200" : isCredit ? "border-red-200" : isPO ? "border-slate-800" : "border-slate-200",
     tableHeaderBg: isPO ? "bg-slate-800 text-white" : "border-b-2 border-slate-800 text-slate-500",
     pageBorder: isPO ? "border-4 border-slate-900" : isQuote ? "border border-amber-100" : "border-none",
     watermark: isReceipt ? "PAID" : isCredit ? "CREDITED" : isQuote ? "ESTIMATE" : null,
  };

  const metadata = invoice.metadata || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Header - Hidden when printing */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/${workspaceSlug}/book/procurement`}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-secondary/50 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Document Preview</h1>
            <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2 h-10" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="rounded-xl gap-2 h-10 text-white" style={{ background: "var(--gradient-primary)" }} onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-center">
        {/* A4 Canvas View */}
        <div className="flex-1 overflow-x-auto bg-slate-100 p-8 rounded-3xl shadow-inner min-h-[800px] flex items-start justify-center print:bg-white print:p-0 print:shadow-none print:rounded-none">
          
          <div className={cn("bg-white text-slate-900 w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] flex flex-col relative print:shadow-none print:w-full print:h-full print:p-0", theme.pageBorder)}>
            
            {theme.watermark && (
               <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
                  <span className="text-[150px] font-black -rotate-45 whitespace-nowrap">{theme.watermark}</span>
               </div>
            )}

            {/* Canvas Header */}
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-2">
                <h1 className={cn("text-4xl font-black uppercase tracking-widest", theme.textAccent)}>
                  {titleLabel}
                </h1>
                <p className="text-slate-500 font-medium">#{invoice.invoice_number}</p>
              </div>

              <div className="w-48 h-24 flex flex-col items-center justify-center">
                 {invoice.logo_url && (
                    <img src={invoice.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                 )}
              </div>
            </div>

            {/* Bill To & Details */}
            <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
               <div className={cn("p-4 rounded-xl", isPO ? "bg-slate-100 border border-slate-200" : "")}>
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3", isPO ? "text-slate-700" : "text-slate-400")}>{billToLabel}</h3>
                  <div className="space-y-1">
                     {invoice.client_name && <p className="font-bold text-lg">{invoice.client_name}</p>}
                     {invoice.client_company && <p className="text-slate-600">{invoice.client_company}</p>}
                     {invoice.client_address && <p className="text-slate-600 whitespace-pre-wrap">{invoice.client_address}</p>}
                     {invoice.client_email && <p className="text-slate-600">{invoice.client_email}</p>}
                  </div>
               </div>
               
               <div className="flex flex-col items-end text-right">
                  <div className="space-y-3 w-full max-w-[200px]">
                     <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">Issue Date</span>
                        <span className="text-sm font-medium">{invoice.issue_date}</span>
                     </div>
                     {!isCredit && invoice.due_date && (
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <span className="text-xs font-bold uppercase text-slate-400">{dateLabel}</span>
                           <span className="text-sm font-medium">{invoice.due_date}</span>
                        </div>
                     )}
                     {isCredit && metadata.reference_invoice && (
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <span className="text-xs font-bold uppercase text-slate-400">Ref Invoice</span>
                           <span className="text-sm font-medium text-right">{metadata.reference_invoice}</span>
                        </div>
                     )}
                     {isReceipt && metadata.payment_method && (
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <span className="text-xs font-bold uppercase text-slate-400">Paid Via</span>
                           <span className="text-sm font-medium text-right">{metadata.payment_method}</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Canvas Items Table */}
            <div className="mb-8 flex-1 relative z-10">
               <div className={cn("grid grid-cols-[1fr_80px_120px_120px] gap-4 pb-2 mb-4", theme.tableHeaderBg, isPO ? "p-3 rounded-t-lg" : "")}>
                  <div className={cn("text-xs font-bold uppercase tracking-wider", isPO ? "text-slate-200" : "")}>Description</div>
                  <div className={cn("text-xs font-bold uppercase tracking-wider text-center", isPO ? "text-slate-200" : "")}>Qty</div>
                  <div className={cn("text-xs font-bold uppercase tracking-wider text-right", isPO ? "text-slate-200" : "")}>Unit Price</div>
                  <div className={cn("text-xs font-bold uppercase tracking-wider text-right", isPO ? "text-slate-200" : "")}>Amount</div>
               </div>
               
               <div className="space-y-2">
                  {items.map((item: any, idx: number) => (
                     <div key={idx} className={cn("grid grid-cols-[1fr_80px_120px_120px] gap-4 items-center group py-2", isPO ? "border-b border-slate-100" : "")}>
                        <div className="text-sm font-medium">{item.description}</div>
                        <div className="text-sm text-center">{item.quantity}</div>
                        <div className="text-sm text-right">{Number(item.unit_price).toLocaleString()}</div>
                        <div className="text-right text-sm font-semibold">
                           {(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-2 gap-12 mt-auto relative z-10">
               <div className="space-y-6">
                  {invoice.notes && (
                     <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                     </div>
                  )}
                  {invoice.payment_terms && (
                     <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{termsLabel}</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.payment_terms}</p>
                     </div>
                  )}
               </div>

               <div className={cn("p-6 rounded-2xl flex flex-col justify-center space-y-3", theme.bgLight)}>
                  <div className="flex justify-between text-sm text-slate-600">
                     <span>Subtotal</span>
                     <span className="font-semibold">{subtotal.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                     <span className="flex items-center gap-2">
                        Tax ({invoice.tax_rate}%)
                     </span>
                     <span className="font-semibold">{taxAmount.toLocaleString()} {currency}</span>
                  </div>
                  <div className={cn("flex justify-between text-xl font-black pt-3 border-t-2", theme.borderAccent, theme.textAccent)}>
                     <span>{isCredit ? "Total Credit" : "Total"}</span>
                     <span>{isCredit ? "-" : ""}{total.toLocaleString()} {currency}</span>
                  </div>
                  
                  {isReceipt && (
                     <>
                        <div className="flex justify-between text-sm text-emerald-800 pt-2 font-medium">
                           <span>Amount Paid</span>
                           <span>-{total.toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-900 font-bold">
                           <span>Balance Due</span>
                           <span>0.00 {currency}</span>
                        </div>
                     </>
                  )}
               </div>
            </div>

            {/* Signature & Stamp Areas */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-100 relative z-10">
               {/* Signature */}
               <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">Authorized Signature</h3>
                  <div className="w-full max-w-[200px] h-24 mx-auto flex flex-col items-center justify-center border-b border-slate-300">
                     {invoice.signature_url && (
                        <img src={invoice.signature_url} alt="Signature" className="w-full h-full object-contain p-2" />
                     )}
                  </div>
               </div>

               {/* Stamp */}
               <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">Company Stamp</h3>
                  <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center rounded-full">
                     {invoice.stamp_url && (
                        <img src={invoice.stamp_url} alt="Stamp" className="w-full h-full object-contain p-2 rounded-full" />
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
