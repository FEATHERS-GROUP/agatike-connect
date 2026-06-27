import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/billing/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const invoices = [
    {
      id: "INV-2026-004",
      date: "Jun 27, 2026",
      amount: "$49.99",
      status: "paid",
      pdfUrl: "#",
    },
    {
      id: "INV-2026-003",
      date: "May 27, 2026",
      amount: "$49.99",
      status: "paid",
      pdfUrl: "#",
    },
    {
      id: "INV-2026-002",
      date: "Apr 27, 2026",
      amount: "$49.99",
      status: "paid",
      pdfUrl: "#",
    },
    {
      id: "INV-2026-001",
      date: "Mar 27, 2026",
      amount: "$49.99",
      status: "paid",
      pdfUrl: "#",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            View and download your past billing invoices.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="w-full pl-9 bg-card border-border/60"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <div className="grid grid-cols-12 items-center gap-4 border-b border-border/40 bg-secondary/30 px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4 md:col-span-5">Invoice</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-3 md:col-span-2">Amount</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        <div className="divide-y divide-border/40">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-secondary/10 group"
            >
              <div className="col-span-4 md:col-span-5 flex items-center gap-3">
                {inv.status === "paid" ? (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{inv.id}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Agatike Pro Organizer Plan</p>
                </div>
              </div>
              
              <div className="col-span-3 text-muted-foreground">
                {inv.date}
              </div>
              
              <div className="col-span-3 md:col-span-2 font-medium">
                {inv.amount}
              </div>
              
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary hover:bg-primary/10"
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
