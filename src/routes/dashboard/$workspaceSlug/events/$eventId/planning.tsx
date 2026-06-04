import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  PieChart,
  Store,
  CreditCard,
  Plus,
  Loader2,
  Trash2,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Users,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Wand2,
  Download,
  Settings,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventVendors,
  createEventVendor,
  deleteEventVendor,
  getVendorTransactions,
} from "@/api/vendors";
import {
  getAgatikeBooks,
  createAgatikeBook,
  createAgatikeBookRecord,
  deleteAgatikeBook,
  deleteAgatikeBookRecord,
} from "@/api/book";
import {
  batchGenerateSponsoredVouchers,
  getSponsoredVouchers,
  getSponsoredVoucherBatches,
} from "@/api/vouchers";
import { getEventById } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/planning")({
  component: PlanningView,
});

function PlanningView() {
  const { eventId } = useParams({ from: "/dashboard/$workspaceSlug/events/$eventId/planning" });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget & Settlement</h1>
          <p className="text-sm text-muted-foreground">
            Manage your event budget, vendors, and sponsored vouchers.
          </p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl h-14 mb-6 inline-flex shadow-sm">
          <TabsTrigger
            value="overview"
            className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Wallet className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="vendors"
            className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Store className="h-4 w-4 mr-2" /> Vendors
          </TabsTrigger>
          <TabsTrigger
            value="vouchers"
            className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CreditCard className="h-4 w-4 mr-2" /> Sponsored Vouchers
          </TabsTrigger>
          <TabsTrigger
            value="book"
            className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BookOpen className="h-4 w-4 mr-2" /> Agatike Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="vendors" className="mt-0">
          <VendorsTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="vouchers" className="mt-0">
          <VouchersTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="book" className="mt-0">
          <AgatikeBookTab eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VendorsTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", contact_info: "" });
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["event-vendors", eventId],
    queryFn: () => getEventVendors({ data: { event_id: eventId } } as any),
  });

  const { data: vendorTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["vendor-transactions", selectedVendor?.id],
    queryFn: () => getVendorTransactions({ data: { vendor_id: selectedVendor.id } } as any),
    enabled: !!selectedVendor,
  });

  const exportToCSV = () => {
    if (!vendorTransactions || vendorTransactions.length === 0)
      return toast.error("No transactions to export");
    const headers = ["Date", "Description", "Voucher ID", "Amount (RWF)"];
    const rows = vendorTransactions.map((tx: any) => [
      new Date(tx.created_at).toLocaleString(),
      `"${(tx.description || tx.voucher?.batch?.name || "Voucher Scan").replace(/"/g, '""')}"`,
      tx.voucher?.qr_code_string || "Unknown",
      tx.amount,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedVendor.name.replace(/\s+/g, "_")}_Transactions.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      // Auto-generate a unique 6-character ID for the vendor
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const vendorUniqueId = `VND-${randomStr}`;

      return await createEventVendor({
        data: { event_id: eventId, vendor_unique_id: vendorUniqueId, ...formData },
      } as any);
    },
    onSuccess: () => {
      toast.success("Vendor added successfully");
      setOpen(false);
      setFormData({ name: "", description: "", contact_info: "" });
      queryClient.invalidateQueries({ queryKey: ["event-vendors", eventId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add vendor");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteEventVendor({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Vendor removed");
      queryClient.invalidateQueries({ queryKey: ["event-vendors", eventId] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Event Vendors</h2>
          <p className="text-sm text-muted-foreground">
            Manage vendors who can process sponsored vouchers.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event Vendor</DialogTitle>
              <DialogDescription>Create a profile for a vendor at your event.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Burger Stand A"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Info</Label>
                <Input
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Email or Phone number"
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full h-11 rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Vendor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && (
          <div className="col-span-full py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && vendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border/60">
            No vendors added yet.
          </div>
        )}
        {vendors.map((vendor: any) => (
          <div
            key={vendor.id}
            onClick={() => setSelectedVendor(vendor)}
            className="cursor-pointer hover:border-primary transition-colors rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                  <Store className="h-5 w-5" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(vendor.id);
                  }}
                  className="text-destructive opacity-50 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-xs font-mono bg-secondary/50 text-secondary-foreground inline-block px-2 py-1 rounded-md mt-1 mb-2">
                ID: {vendor.vendor_unique_id}
              </p>
              {vendor.contact_info && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">Contact:</span>{" "}
                  {vendor.contact_info}
                </p>
              )}
              {vendor.description && (
                <p className="text-sm text-muted-foreground">{vendor.description}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Voucher Revenue
              </p>
              <p className="text-xl font-bold text-green-500 mt-1">
                {vendor.total_revenue || 0} RWF
              </p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>{selectedVendor?.name} Ledger</span>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-3 w-3" /> Export CSV
              </Button>
            </DialogTitle>
            <DialogDescription>
              Full history of voucher transactions processed by this vendor.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {loadingTx ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : vendorTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl">
                No transactions found.
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Description</th>
                      <th className="p-3 font-medium">Voucher ID</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {vendorTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-3 text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {tx.description || tx.voucher?.batch?.name || "Voucher Scan"}
                        </td>
                        <td className="p-3 font-mono text-xs">{tx.voucher?.qr_code_string}</td>
                        <td className="p-3 text-right font-medium">{tx.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg">
            <span className="font-semibold text-muted-foreground">Total Revenue</span>
            <span className="font-bold text-green-500">
              {selectedVendor?.total_revenue || 0} RWF
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VouchersTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    batch_name: "",
    value_per_person: "",
    quantity: "",
    generation_type: "manual",
    linked_ticket_ids: [] as string[],
    value_type: "fixed",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
  });
  const eventTickets = eventData?.event_tickets || [];

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["sponsored-vouchers", eventId],
    queryFn: () => getSponsoredVouchers({ data: { event_id: eventId } } as any),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await batchGenerateSponsoredVouchers({
        data: {
          event_id: eventId,
          workspace_id: activeWorkspace?.id,
          batch_name: formData.batch_name,
          value_per_person: Number(formData.value_per_person),
          quantity: formData.generation_type === "manual" ? Number(formData.quantity) : 0,
          generation_type: formData.generation_type,
          linked_ticket_ids:
            formData.generation_type === "ticket_linked" ? formData.linked_ticket_ids : [],
          value_type: formData.generation_type === "ticket_linked" ? formData.value_type : "fixed",
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setOpen(false);
      setFormData({
        batch_name: "",
        value_per_person: "",
        quantity: "",
        generation_type: "manual",
        linked_ticket_ids: [],
        value_type: "fixed",
      });
      queryClient.invalidateQueries({ queryKey: ["sponsored-vouchers", eventId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate vouchers");
    },
  });

  const totalPages = Math.ceil(vouchers.length / pageSize);
  const paginatedVouchers = vouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  let totalSpent = 0;
  let totalRemaining = 0;
  const campaignStats: any[] = [];

  vouchers.forEach((batch: any) => {
    let batchSpent = 0;
    let batchRemaining = 0;
    batch.vouchers?.forEach((v: any) => {
      batchRemaining += Number(v.current_balance || 0);
      batchSpent += Number(v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0);
    });
    totalSpent += batchSpent;
    totalRemaining += batchRemaining;
    campaignStats.push({
      name: batch.name,
      spent: batchSpent,
      remaining: batchRemaining,
      total: batchSpent + batchRemaining,
    });
  });
  const totalProvisioned = totalSpent + totalRemaining;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Sponsored Vouchers Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Monitor the total liability and spending of all generated vouchers.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Voucher Campaign</DialogTitle>
              <DialogDescription>
                Create a standalone batch or attach vouchers to ticket sales.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4 mt-2"
            >
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  type="button"
                  variant={formData.generation_type === "manual" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, generation_type: "manual" })}
                  className="h-12"
                >
                  <Wand2 className="mr-2 h-4 w-4" /> Standalone Batch
                </Button>
                <Button
                  type="button"
                  variant={formData.generation_type === "ticket_linked" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, generation_type: "ticket_linked" })}
                  className="h-12"
                >
                  <Ticket className="mr-2 h-4 w-4" /> Ticket Attached
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  required
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                  placeholder="e.g. VIP Drinks"
                />
              </div>

              {formData.generation_type === "ticket_linked" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Trigger Tickets (by Tour Stop)</Label>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 border rounded-xl bg-secondary/5">
                      {eventData?.tour_stops?.map((stop: any, idx: number) => {
                        const stopTickets = eventTickets.filter(
                          (t: any) => t.tour_stop_idx === idx,
                        );
                        if (stopTickets.length === 0) return null;
                        return (
                          <div key={idx} className="space-y-2">
                            <h4 className="font-semibold text-sm border-b pb-1 border-border/50">
                              {stop.name || `Stop ${idx + 1}`}
                            </h4>
                            <div className="space-y-2 pt-1">
                              {stopTickets.map((t: any) => (
                                <div key={t.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`ticket-${t.id}`}
                                    checked={formData.linked_ticket_ids.includes(t.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked)
                                        setFormData({
                                          ...formData,
                                          linked_ticket_ids: [...formData.linked_ticket_ids, t.id],
                                        });
                                      else
                                        setFormData({
                                          ...formData,
                                          linked_ticket_ids: formData.linked_ticket_ids.filter(
                                            (id) => id !== t.id,
                                          ),
                                        });
                                    }}
                                  />
                                  <label
                                    htmlFor={`ticket-${t.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {t.type} (${t.cost})
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {eventTickets.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center">
                          No tickets available
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Voucher Value</Label>
                    <Select
                      required
                      value={formData.value_type}
                      onValueChange={(val) => setFormData({ ...formData, value_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match_ticket_price">Match Ticket Price</SelectItem>
                        <SelectItem value="fixed">Fixed Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(formData.generation_type === "manual" || formData.value_type === "fixed") && (
                <div className="space-y-2">
                  <Label>Value per Voucher (RWF)</Label>
                  <Input
                    required
                    type="number"
                    value={formData.value_per_person}
                    onChange={(e) => setFormData({ ...formData, value_per_person: e.target.value })}
                    placeholder="e.g. 10000"
                  />
                </div>
              )}

              {formData.generation_type === "manual" && (
                <div className="space-y-2">
                  <Label>Quantity to Generate Now</Label>
                  <Input
                    required
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 100"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full h-11 rounded-xl mt-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formData.generation_type === "manual"
                  ? `Generate ${formData.quantity || "0"} Vouchers`
                  : "Save Attached Campaign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="p-4 bg-secondary/30 font-semibold text-sm grid grid-cols-4 gap-4 border-b">
          <div>Voucher Code</div>
          <div>Batch</div>
          <div>Total Value</div>
          <div>Remaining Balance</div>
        </div>
        <div className="divide-y divide-border/60">
          {isLoading && (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          {!isLoading && vouchers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No sponsored vouchers generated yet.
            </div>
          )}
          {paginatedVouchers.map((voucher: any) => (
            <div
              key={voucher.id}
              className="p-4 text-sm grid grid-cols-4 gap-4 items-center hover:bg-secondary/20 transition-colors"
            >
              <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded w-fit flex items-center gap-1">
                {voucher.qr_code_string}
              </div>
              <div>
                <div className="font-medium truncate">{voucher.batch?.name}</div>
                {voucher.batch?.generation_type === "ticket_linked" && (
                  <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Ticket className="w-3 h-3" /> {voucher.batch?.linked_ticket_ids?.length || 0}{" "}
                    Linked Tickets
                  </div>
                )}
              </div>
              <div>
                {voucher.batch?.value_type === "match_ticket_price" ? (
                  <span className="italic text-muted-foreground text-xs">Matches Ticket</span>
                ) : (
                  <span>${voucher.batch?.value_per_voucher}</span>
                )}
              </div>
              <div>
                <span
                  className={
                    Number(voucher.current_balance) === 0
                      ? "text-destructive font-semibold"
                      : "text-green-500 font-semibold"
                  }
                >
                  ${voucher.current_balance}
                </span>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && vouchers.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-secondary/10">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-4">
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgatikeBookTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [activeBook, setActiveBook] = useState<any>(null);

  // Create Book Builder State
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [bookName, setBookName] = useState("");
  const [schemaFields, setSchemaFields] = useState<any[]>([{ name: "Name", type: "text" }]);

  const applyTemplate = (template: "expense" | "staff" | "checklist" | "sponsor" | "custom") => {
    switch (template) {
      case "expense":
        setBookName("Expenses & Payouts");
        setSchemaFields([
          { name: "Description", type: "text" },
          { name: "Amount", type: "number" },
          { name: "Paid", type: "boolean" },
        ]);
        break;
      case "staff":
        setBookName("Staff Roster");
        setSchemaFields([
          { name: "Name", type: "text" },
          { name: "Role", type: "text" },
          { name: "Daily Rate", type: "number" },
          { name: "Paid", type: "boolean" },
        ]);
        break;
      case "checklist":
        setBookName("Event Checklist");
        setSchemaFields([
          { name: "Task", type: "text" },
          { name: "Assigned To", type: "text" },
          { name: "Completed", type: "boolean" },
        ]);
        break;
      case "sponsor":
        setBookName("Sponsor Deliverables");
        setSchemaFields([
          { name: "Sponsor", type: "text" },
          { name: "Deliverable", type: "text" },
          { name: "Value", type: "number" },
          { name: "Delivered", type: "boolean" },
        ]);
        break;
      case "custom":
        setBookName("");
        setSchemaFields([{ name: "Name", type: "text" }]);
        break;
    }
    setBuilderStep(2);
  };

  // Add Record State
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordData, setRecordData] = useState<any>({});

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["agatike-books", eventId],
    queryFn: () => getAgatikeBooks({ data: { event_id: eventId } } as any),
  });

  const createBookMutation = useMutation({
    mutationFn: async () => {
      return await createAgatikeBook({
        data: { event_id: eventId, name: bookName, schema_fields: schemaFields },
      } as any);
    },
    onSuccess: () => {
      toast.success("Custom Book Created!");
      setShowBuilder(false);
      setBookName("");
      setSchemaFields([{ name: "Name", type: "text" }]);
      queryClient.invalidateQueries({ queryKey: ["agatike-books", eventId] });
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async () => {
      return await createAgatikeBookRecord({
        data: { book_id: activeBook.id, record_data: recordData },
      } as any);
    },
    onSuccess: () => {
      toast.success("Record Added!");
      setShowAddRecord(false);
      setRecordData({});
      queryClient.invalidateQueries({ queryKey: ["agatike-books", eventId] });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAgatikeBook({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Book deleted");
      setActiveBook(null);
      queryClient.invalidateQueries({ queryKey: ["agatike-books", eventId] });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAgatikeBookRecord({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Record deleted");
      queryClient.invalidateQueries({ queryKey: ["agatike-books", eventId] });
    },
  });

  // Re-sync activeBook when data changes
  React.useEffect(() => {
    if (activeBook && books.length > 0) {
      const updated = books.find((b: any) => b.id === activeBook.id);
      if (updated) setActiveBook(updated);
    }
  }, [books, activeBook]);

  if (activeBook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveBook(null)}
              className="h-8 w-8 rounded-full bg-secondary/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{activeBook.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeBook.records?.length || 0} Records
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddRecord(true)}
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Record
            </Button>
          </div>
        </div>

        <div className="border border-border/60 rounded-2xl overflow-hidden bg-card text-sm">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
              <tr>
                {activeBook.schema_fields.map((field: any, idx: number) => (
                  <th key={idx} className="p-4 font-medium">
                    {field.name}
                  </th>
                ))}
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(!activeBook.records || activeBook.records.length === 0) && (
                <tr>
                  <td
                    colSpan={activeBook.schema_fields.length + 1}
                    className="p-12 text-center text-muted-foreground"
                  >
                    No records added yet.
                  </td>
                </tr>
              )}
              {activeBook.records?.map((record: any) => (
                <tr key={record.id} className="hover:bg-secondary/10 transition-colors">
                  {activeBook.schema_fields.map((field: any, idx: number) => (
                    <td key={idx} className="p-4">
                      {field.type === "boolean"
                        ? record.record_data[field.name]
                          ? "Yes"
                          : "No"
                        : record.record_data[field.name]}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecordMutation.mutate(record.id)}
                      className="h-8 w-8 text-destructive opacity-50 hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to {activeBook.name}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRecordMutation.mutate();
              }}
              className="space-y-4 mt-4"
            >
              {activeBook.schema_fields.map((field: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <Label>{field.name}</Label>
                  {field.type === "boolean" ? (
                    <div className="flex items-center space-x-2 h-11 border rounded-xl px-3 bg-secondary/10">
                      <Checkbox
                        id={`field-${idx}`}
                        checked={!!recordData[field.name]}
                        onCheckedChange={(c) => setRecordData({ ...recordData, [field.name]: c })}
                      />
                      <label htmlFor={`field-${idx}`} className="text-sm cursor-pointer w-full">
                        {field.name}
                      </label>
                    </div>
                  ) : (
                    <Input
                      required
                      type={field.type === "number" ? "number" : "text"}
                      value={recordData[field.name] || ""}
                      onChange={(e) =>
                        setRecordData({ ...recordData, [field.name]: e.target.value })
                      }
                      placeholder={`Enter ${field.name}...`}
                    />
                  )}
                </div>
              ))}
              <Button
                type="submit"
                disabled={createRecordMutation.isPending}
                className="w-full h-11 mt-4 rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {createRecordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Record"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">The Agatike Book</h2>
          <p className="text-sm text-muted-foreground">
            Build custom databases (like Notion or Airtable) to track anything for your event.
          </p>
        </div>
        <Dialog
          open={showBuilder}
          onOpenChange={(open) => {
            setShowBuilder(open);
            if (!open) setBuilderStep(1);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Create Custom Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Custom Book</DialogTitle>
              <DialogDescription>
                {builderStep === 1
                  ? "Choose a template to get started, or build your own from scratch."
                  : "Customize the fields you want to track."}
              </DialogDescription>
            </DialogHeader>

            {builderStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div
                  onClick={() => applyTemplate("expense")}
                  className="cursor-pointer border border-border/60 bg-card rounded-2xl p-6 hover:border-primary transition-all group"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Expenses & Payouts</h3>
                  <p className="text-sm text-muted-foreground">
                    Track amounts, descriptions, and paid status.
                  </p>
                </div>
                <div
                  onClick={() => applyTemplate("staff")}
                  className="cursor-pointer border border-border/60 bg-card rounded-2xl p-6 hover:border-primary transition-all group"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Staff Roster</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage event staff, roles, and daily rates.
                  </p>
                </div>
                <div
                  onClick={() => applyTemplate("checklist")}
                  className="cursor-pointer border border-border/60 bg-card rounded-2xl p-6 hover:border-primary transition-all group"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Event Checklist</h3>
                  <p className="text-sm text-muted-foreground">
                    Track tasks, assignees, and completion.
                  </p>
                </div>
                <div
                  onClick={() => applyTemplate("sponsor")}
                  className="cursor-pointer border border-border/60 bg-card rounded-2xl p-6 hover:border-primary transition-all group"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Sponsor Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor sponsor deliverables and values.
                  </p>
                </div>
                <div
                  onClick={() => applyTemplate("custom")}
                  className="cursor-pointer border border-dashed border-border bg-transparent rounded-2xl p-6 hover:border-primary hover:bg-secondary/10 transition-all group flex flex-col items-center justify-center text-center"
                >
                  <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Start from Scratch</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a completely custom database.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createBookMutation.mutate();
                }}
                className="space-y-4 pt-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setBuilderStep(1)}
                  className="mb-2 -ml-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back to Templates
                </Button>
                <div className="space-y-2">
                  <Label>Book Name</Label>
                  <Input
                    required
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="e.g. Lost & Found, Sponsor Checklist..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Custom Fields (Columns)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSchemaFields([...schemaFields, { name: "", type: "text" }])}
                      className="rounded-full h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {schemaFields.map((field, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          required
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...schemaFields];
                            newFields[idx].name = e.target.value;
                            setSchemaFields(newFields);
                          }}
                          placeholder="Field Name (e.g. Item)"
                          className="flex-1"
                        />

                        <Select
                          value={field.type}
                          onValueChange={(val) => {
                            const newFields = [...schemaFields];
                            newFields[idx].type = val;
                            setSchemaFields(newFields);
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Yes/No Checkbox</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive opacity-50 hover:opacity-100 shrink-0"
                          onClick={() => {
                            if (schemaFields.length === 1)
                              return toast.error("Must have at least one field");
                            setSchemaFields(schemaFields.filter((_, i) => i !== idx));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createBookMutation.isPending}
                  className="w-full h-11 mt-4 rounded-xl"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {createBookMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Build Custom Book"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && books.length === 0 && (
          <div className="col-span-full py-16 text-center border rounded-2xl border-dashed">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Custom Books Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create a custom book to track literally anything.
            </p>
            <Button onClick={() => setShowBuilder(true)} variant="outline">
              Create your first Book
            </Button>
          </div>
        )}
        {books.map((book: any) => (
          <div
            key={book.id}
            onClick={() => setActiveBook(book)}
            className="cursor-pointer group relative p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all flex flex-col justify-between aspect-square"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteBookMutation.mutate(book.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{book.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <List className="h-3 w-3 mr-1" /> {book.schema_fields?.length || 0} Custom Fields
              </p>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Total Records
                </span>
                <span className="font-bold text-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {book.records?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ eventId }: { eventId: string }) {
  const [showAllVouchers, setShowAllVouchers] = useState(false);

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
  });

  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ["vendors", eventId],
    queryFn: () => getEventVendors({ data: { event_id: eventId } } as any),
  });

  const { data: voucherBatches = [], isLoading: loadingVouchers } = useQuery({
    queryKey: ["sponsored-voucher-batches", eventId],
    queryFn: () => getSponsoredVoucherBatches({ data: { event_id: eventId } } as any),
  });

  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["agatike-books", eventId],
    queryFn: () => getAgatikeBooks({ data: { event_id: eventId } } as any),
  });

  const isLoading = loadingVendors || loadingVouchers || loadingBooks || loadingEvent;

  // Tickets
  let totalTicketRevenue = 0;
  let totalTicketsSold = 0;
  event?.event_tickets?.forEach((t: any) => {
    totalTicketRevenue += (t.sold || 0) * (t.cost || 0);
    totalTicketsSold += t.sold || 0;
  });

  // Vendors
  const totalVendorRevenue = vendors.reduce(
    (sum: number, v: any) => sum + Number(v.total_revenue || 0),
    0,
  );

  // Vouchers
  let totalVoucherProvisioned = 0;
  let totalVoucherSpent = 0;
  const voucherBreakdown: {
    name: string;
    type: string;
    totalCount: number;
    provisioned: number;
    spent: number;
  }[] = [];

  voucherBatches.forEach((batch: any) => {
    let batchProvisioned = 0;
    let batchSpent = 0;
    const batchVouchers: any[] = batch.vouchers || [];

    batchVouchers.forEach((v: any) => {
      const spent = Number(v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0);
      const prov = Number(v.current_balance || 0) + spent;
      batchSpent += spent;
      batchProvisioned += prov;
    });

    totalVoucherSpent += batchSpent;
    totalVoucherProvisioned += batchProvisioned;

    voucherBreakdown.push({
      name: batch.name || "Unnamed Batch",
      type: batch.value_type || batch.generation_type || "Standard",
      totalCount: batchVouchers.length,
      provisioned: batchProvisioned,
      spent: batchSpent,
    });
  });

  // Agatike Book (Expenses)
  let totalBookExpenses = 0;
  const bookBreakdown: { name: string; total: number }[] = [];

  books.forEach((book: any) => {
    let bookTotal = 0;
    // Look for a number field to sum
    const numberFields = book.schema_fields?.filter((f: any) => f.type === "number") || [];
    if (numberFields.length > 0) {
      const targetField = numberFields[0].name;
      book.records?.forEach((r: any) => {
        bookTotal += Number(r.record_data?.[targetField] || 0);
      });
      totalBookExpenses += bookTotal;
      if (bookTotal > 0) {
        bookBreakdown.push({ name: book.name, total: bookTotal });
      }
    }
  });

  const totalEventLiability = totalVendorRevenue + totalBookExpenses;
  const projectedProfit = totalTicketRevenue - totalEventLiability;

  if (isLoading)
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6 mt-0">
      {/* Top Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Ticket Sales
            </p>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{totalTicketRevenue.toLocaleString()} RWF</p>
          <p className="text-xs text-muted-foreground mt-2">{totalTicketsSold} tickets sold</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Vouchers Prov.
            </p>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-500">
            {totalVoucherProvisioned.toLocaleString()} RWF
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalVoucherSpent.toLocaleString()} RWF spent
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Vendor Payouts
            </p>
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{totalVendorRevenue.toLocaleString()} RWF</p>
          <p className="text-xs text-muted-foreground mt-2">Owed to vendors</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Book Expenses
            </p>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{totalBookExpenses.toLocaleString()} RWF</p>
          <p className="text-xs text-muted-foreground mt-2">Logged in custom books</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-primary font-bold">
              Est. Net Profit
            </p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {projectedProfit.toLocaleString()} RWF
          </p>
          <p className="text-xs text-muted-foreground mt-2">Sales - (Vendors + Books)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voucher Portfolio */}
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50">
            <h3 className="font-semibold text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary" /> Voucher Portfolio Breakdown
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed view of all voucher types and their financial costs.
            </p>
          </div>
          <div className="p-0 overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Campaign / Type</th>
                  <th className="px-6 py-3 font-medium text-center">Quantity</th>
                  <th className="px-6 py-3 font-medium text-right">Value (RWF)</th>
                  <th className="px-6 py-3 font-medium text-right">Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {voucherBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No voucher campaigns created yet.
                    </td>
                  </tr>
                )}
                {voucherBreakdown.slice(0, 6).map((batch, idx) => (
                  <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{batch.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground mt-1 inline-block uppercase tracking-wider">
                        {batch.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{batch.totalCount}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {batch.provisioned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-orange-500">
                        {batch.spent.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {batch.provisioned > 0
                          ? Math.round((batch.spent / batch.provisioned) * 100)
                          : 0}
                        % used
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {voucherBreakdown.length > 6 && (
            <div className="p-4 border-t border-border/50 bg-secondary/10 text-center">
              <Button variant="outline" size="sm" onClick={() => setShowAllVouchers(true)}>
                View All {voucherBreakdown.length} Campaigns
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold mb-4 text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" /> Agatike Book Breakdown
            </h3>
            {bookBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No values logged in custom books yet.
              </p>
            ) : (
              <div className="space-y-4">
                {bookBreakdown.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors"
                  >
                    <span className="font-medium text-foreground">{b.name}</span>
                    <span className="font-bold">{b.total.toLocaleString()} RWF</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold mb-4 text-lg">Financial Overview</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between p-3 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
                <span className="font-medium">Total Inflows (Ticket Sales)</span>
                <span className="font-bold">+{totalTicketRevenue.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <span className="font-medium">Total Outflows (Vendors + Books)</span>
                <span className="font-bold">-{totalEventLiability.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between p-4 rounded-xl bg-primary/10 text-primary border border-primary/20 text-lg">
                <span className="font-bold">Net Position</span>
                <span className="font-black">{projectedProfit.toLocaleString()} RWF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAllVouchers} onOpenChange={setShowAllVouchers}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Voucher Campaigns</DialogTitle>
            <DialogDescription>
              Full financial breakdown of every voucher campaign in this event.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto mt-4 rounded-xl border border-border/60">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Campaign / Type</th>
                  <th className="px-6 py-3 font-medium text-center">Quantity</th>
                  <th className="px-6 py-3 font-medium text-right">Value (RWF)</th>
                  <th className="px-6 py-3 font-medium text-right">Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {voucherBreakdown.map((batch, idx) => (
                  <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{batch.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground mt-1 inline-block uppercase tracking-wider">
                        {batch.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{batch.totalCount}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {batch.provisioned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-orange-500">
                        {batch.spent.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {batch.provisioned > 0
                          ? Math.round((batch.spent / batch.provisioned) * 100)
                          : 0}
                        % used
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
