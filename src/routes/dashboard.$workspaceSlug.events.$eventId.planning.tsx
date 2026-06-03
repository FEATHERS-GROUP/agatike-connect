import { createFileRoute, useParams } from "@tanstack/react-router";
import { DollarSign, Wallet, TrendingUp, PieChart, Store, CreditCard, Plus, Loader2, Trash2, BookOpen, FileText, FileSpreadsheet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventVendors, createEventVendor, deleteEventVendor, getVendorTransactions } from "@/api/vendors";
import { getAgatikeBookRecords, createAgatikeBookRecord, deleteAgatikeBookRecord } from "@/api/book";
import { batchGenerateSponsoredVouchers, getSponsoredVouchers } from "@/api/vouchers";
import { getEventById } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Ticket, Wand2, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
          <p className="text-sm text-muted-foreground">Manage your event budget, vendors, and sponsored vouchers.</p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl h-14 mb-6 inline-flex shadow-sm">
          <TabsTrigger value="overview" className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Wallet className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="vendors" className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Store className="h-4 w-4 mr-2" /> Vendors
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4 mr-2" /> Sponsored Vouchers
          </TabsTrigger>
          <TabsTrigger value="book" className="rounded-xl h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4 mr-2" /> Agatike Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Budget</p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold">$15,000</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Expenses Logged
            </p>
            <PieChart className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold">$8,450</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Projected Profit
            </p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-semibold text-green-500">+$6,550</p>
        </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold mb-4">Expense Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Venue Rental</span>
                <span className="text-muted-foreground">$5,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Marketing & Ads</span>
                <span className="text-muted-foreground">$2,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Staff & Security</span>
                <span className="text-muted-foreground">$1,450</span>
              </div>
            </div>
          </div>
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
    if (!vendorTransactions || vendorTransactions.length === 0) return toast.error("No transactions to export");
    const headers = ["Date", "Description", "Voucher ID", "Amount (RWF)"];
    const rows = vendorTransactions.map((tx: any) => [
      new Date(tx.created_at).toLocaleString(),
      `"${(tx.description || tx.voucher?.batch?.name || 'Voucher Scan').replace(/"/g, '""')}"`,
      tx.voucher?.qr_code_string || "Unknown",
      tx.amount
    ]);
    const csvContent = [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedVendor.name.replace(/\s+/g, '_')}_Transactions.csv`);
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
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteEventVendor({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Vendor removed");
      queryClient.invalidateQueries({ queryKey: ["event-vendors", eventId] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Event Vendors</h2>
          <p className="text-sm text-muted-foreground">Manage vendors who can process sponsored vouchers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-1 h-4 w-4" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event Vendor</DialogTitle>
              <DialogDescription>Create a profile for a vendor at your event.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Burger Stand A" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional description" />
              </div>
              <div className="space-y-2">
                <Label>Contact Info</Label>
                <Input value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} placeholder="Email or Phone number" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Vendor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
        {!isLoading && vendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border/60">
            No vendors added yet.
          </div>
        )}
        {vendors.map((vendor: any) => (
          <div key={vendor.id} onClick={() => setSelectedVendor(vendor)} className="cursor-pointer hover:border-primary transition-colors rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                  <Store className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(vendor.id); }} className="text-destructive opacity-50 hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-xs font-mono bg-secondary/50 text-secondary-foreground inline-block px-2 py-1 rounded-md mt-1 mb-2">
                ID: {vendor.vendor_unique_id}
              </p>
              {vendor.contact_info && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">Contact:</span> {vendor.contact_info}
                </p>
              )}
              {vendor.description && <p className="text-sm text-muted-foreground">{vendor.description}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Voucher Revenue</p>
              <p className="text-xl font-bold text-green-500 mt-1">{vendor.total_revenue || 0} RWF</p>
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
            <DialogDescription>Full history of voucher transactions processed by this vendor.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {loadingTx ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : vendorTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl">No transactions found.</div>
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
                        <td className="p-3 text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                        <td className="p-3">{tx.description || tx.voucher?.batch?.name || "Voucher Scan"}</td>
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
            <span className="font-bold text-green-500">{selectedVendor?.total_revenue || 0} RWF</span>
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
    value_type: "fixed"
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
          linked_ticket_ids: formData.generation_type === "ticket_linked" ? formData.linked_ticket_ids : [],
          value_type: formData.generation_type === "ticket_linked" ? formData.value_type : "fixed"
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setOpen(false);
      setFormData({ batch_name: "", value_per_person: "", quantity: "", generation_type: "manual", linked_ticket_ids: [], value_type: "fixed" });
      queryClient.invalidateQueries({ queryKey: ["sponsored-vouchers", eventId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate vouchers");
    }
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
      total: batchSpent + batchRemaining
    });
  });
  const totalProvisioned = totalSpent + totalRemaining;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Sponsored Vouchers Analytics</h2>
          <p className="text-sm text-muted-foreground">Monitor the total liability and spending of all generated vouchers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-1 h-4 w-4" /> Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Voucher Campaign</DialogTitle>
              <DialogDescription>Create a standalone batch or attach vouchers to ticket sales.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-2">
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button type="button" variant={formData.generation_type === "manual" ? "default" : "outline"} onClick={() => setFormData({...formData, generation_type: "manual"})} className="h-12">
                  <Wand2 className="mr-2 h-4 w-4" /> Standalone Batch
                </Button>
                <Button type="button" variant={formData.generation_type === "ticket_linked" ? "default" : "outline"} onClick={() => setFormData({...formData, generation_type: "ticket_linked"})} className="h-12">
                  <Ticket className="mr-2 h-4 w-4" /> Ticket Attached
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input required value={formData.batch_name} onChange={e => setFormData({...formData, batch_name: e.target.value})} placeholder="e.g. VIP Drinks" />
              </div>

              {formData.generation_type === "ticket_linked" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Trigger Tickets (by Tour Stop)</Label>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 border rounded-xl bg-secondary/5">
                      {eventData?.tour_stops?.map((stop: any, idx: number) => {
                        const stopTickets = eventTickets.filter((t: any) => t.tour_stop_idx === idx);
                        if (stopTickets.length === 0) return null;
                        return (
                          <div key={idx} className="space-y-2">
                            <h4 className="font-semibold text-sm border-b pb-1 border-border/50">{stop.name || `Stop ${idx + 1}`}</h4>
                            <div className="space-y-2 pt-1">
                              {stopTickets.map((t: any) => (
                                <div key={t.id} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`ticket-${t.id}`}
                                    checked={formData.linked_ticket_ids.includes(t.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) setFormData({...formData, linked_ticket_ids: [...formData.linked_ticket_ids, t.id]});
                                      else setFormData({...formData, linked_ticket_ids: formData.linked_ticket_ids.filter(id => id !== t.id)});
                                    }}
                                  />
                                  <label htmlFor={`ticket-${t.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {t.type} (${t.cost})
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {eventTickets.length === 0 && <div className="text-sm text-muted-foreground text-center">No tickets available</div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Voucher Value</Label>
                    <Select required value={formData.value_type} onValueChange={(val) => setFormData({...formData, value_type: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Input required type="number" value={formData.value_per_person} onChange={e => setFormData({...formData, value_per_person: e.target.value})} placeholder="e.g. 10000" />
                </div>
              )}

              {formData.generation_type === "manual" && (
                <div className="space-y-2">
                  <Label>Quantity to Generate Now</Label>
                  <Input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="e.g. 100" />
                </div>
              )}

              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl mt-4" style={{ background: "var(--gradient-primary)" }}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formData.generation_type === "manual" ? `Generate ${formData.quantity || "0"} Vouchers` : "Save Attached Campaign"}
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
          {isLoading && <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>}
          {!isLoading && vouchers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">No sponsored vouchers generated yet.</div>
          )}
          {paginatedVouchers.map((voucher: any) => (
            <div key={voucher.id} className="p-4 text-sm grid grid-cols-4 gap-4 items-center hover:bg-secondary/20 transition-colors">
              <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded w-fit flex items-center gap-1">
                {voucher.qr_code_string}
              </div>
              <div>
                <div className="font-medium truncate">{voucher.batch?.name}</div>
                {voucher.batch?.generation_type === "ticket_linked" && (
                  <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Ticket className="w-3 h-3" /> {voucher.batch?.linked_ticket_ids?.length || 0} Linked Tickets
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
                <span className={Number(voucher.current_balance) === 0 ? "text-destructive font-semibold" : "text-green-500 font-semibold"}>
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
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
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
              <span>Page {currentPage} of {totalPages || 1}</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
  const [open, setOpen] = useState(false);
  const [recordType, setRecordType] = useState("expense"); // expense, note, invoice, staff
  const [formData, setFormData] = useState({ title: "", description: "", amount: "", status: "pending", file_url: "" });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["agatike-book", eventId],
    queryFn: () => getAgatikeBookRecords({ data: { event_id: eventId } } as any),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await createAgatikeBookRecord({
        data: { 
          event_id: eventId, 
          record_type: recordType,
          title: formData.title,
          description: formData.description,
          amount: formData.amount ? Number(formData.amount) : null,
          status: formData.status,
          file_url: formData.file_url,
          metadata: {} // Future custom fields
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Record added to Agatike Book!");
      setOpen(false);
      setFormData({ title: "", description: "", amount: "", status: "pending", file_url: "" });
      queryClient.invalidateQueries({ queryKey: ["agatike-book", eventId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add record");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAgatikeBookRecord({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Record deleted");
      queryClient.invalidateQueries({ queryKey: ["agatike-book", eventId] });
    }
  });

  const expenses = records.filter((r: any) => r.record_type === "expense");
  const notes = records.filter((r: any) => r.record_type === "note");
  const staff = records.filter((r: any) => r.record_type === "staff");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">The Agatike Book</h2>
          <p className="text-sm text-muted-foreground">Your flexible ledger for expenses, notes, staff, and invoices.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-1 h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Agatike Book Record</DialogTitle>
              <DialogDescription>What would you like to log?</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-2">
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button type="button" variant={recordType === "expense" ? "default" : "outline"} onClick={() => setRecordType("expense")} className="h-10 text-xs">
                  <DollarSign className="mr-2 h-3 w-3" /> Expense
                </Button>
                <Button type="button" variant={recordType === "note" ? "default" : "outline"} onClick={() => setRecordType("note")} className="h-10 text-xs">
                  <FileText className="mr-2 h-3 w-3" /> Note
                </Button>
                <Button type="button" variant={recordType === "staff" ? "default" : "outline"} onClick={() => setRecordType("staff")} className="h-10 text-xs">
                  <Users className="mr-2 h-3 w-3" /> Staff Hire
                </Button>
                <Button type="button" variant={recordType === "invoice" ? "default" : "outline"} onClick={() => setRecordType("invoice")} className="h-10 text-xs">
                  <FileSpreadsheet className="mr-2 h-3 w-3" /> Invoice
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={recordType === "staff" ? "e.g. DJ Smith" : "e.g. Venue Rental"} />
              </div>
              
              <div className="space-y-2">
                <Label>Description / Details</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." />
              </div>

              {(recordType === "expense" || recordType === "staff" || recordType === "invoice") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (RWF)</Label>
                    <Input required={recordType !== "invoice"} type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {recordType === "invoice" && (
                <div className="space-y-2">
                  <Label>File URL (Link)</Label>
                  <Input value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} placeholder="https://..." />
                </div>
              )}

              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save to Book
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses & Invoices Panel */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold text-lg flex items-center mb-4"><DollarSign className="mr-2 h-5 w-5 text-primary" /> Expenses & Payouts</h3>
          {isLoading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : expenses.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No expenses logged yet.</p> : (
            <div className="space-y-3">
              {expenses.map((r: any) => (
                <div key={r.id} className="flex justify-between items-center p-3 rounded-xl border bg-secondary/20">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{Number(r.amount).toLocaleString()} RWF</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${r.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{r.status}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)} className="text-destructive h-8 w-8 opacity-50 hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Roster Panel */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold text-lg flex items-center mb-4"><Users className="mr-2 h-5 w-5 text-primary" /> Staff Roster</h3>
          {isLoading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : staff.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No staff logged yet.</p> : (
            <div className="space-y-3">
              {staff.map((r: any) => (
                <div key={r.id} className="flex justify-between items-center p-3 rounded-xl border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{r.title}</p>
                      {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{Number(r.amount).toLocaleString()} RWF</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${r.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{r.status}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)} className="text-destructive h-8 w-8 opacity-50 hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold text-lg flex items-center mb-4"><FileText className="mr-2 h-5 w-5 text-primary" /> Event Notes & Checklist</h3>
          {isLoading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : notes.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No notes logged yet.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {notes.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl border bg-[#ffeb3b]/10 border-[#ffeb3b]/30 relative group">
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)} className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></Button>
                  <p className="font-semibold mb-2 pr-6">{r.title}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
