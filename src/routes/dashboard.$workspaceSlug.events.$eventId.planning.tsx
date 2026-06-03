import { createFileRoute, useParams } from "@tanstack/react-router";
import { DollarSign, Wallet, TrendingUp, PieChart, Store, CreditCard, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventVendors, createEventVendor, deleteEventVendor } from "@/api/vendors";
import { batchGenerateSponsoredVouchers, getSponsoredVouchers } from "@/api/vouchers";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      </Tabs>
    </div>
  );
}

function VendorsTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", contact_info: "" });

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["event-vendors", eventId],
    queryFn: () => getEventVendors({ data: { event_id: eventId } } as any),
  });

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
          <div key={vendor.id} className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                  <Store className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(vendor.id)} className="text-destructive opacity-50 hover:opacity-100">
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
              <p className="text-xs text-muted-foreground">Revenue Processed</p>
              <p className="font-semibold text-foreground mt-1">$0.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VouchersTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ batch_name: "", value_per_person: "", quantity: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
          quantity: Number(formData.quantity)
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Vouchers generated successfully!");
      setOpen(false);
      setFormData({ batch_name: "", value_per_person: "", quantity: "" });
      queryClient.invalidateQueries({ queryKey: ["sponsored-vouchers", eventId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate vouchers");
    }
  });

  const totalPages = Math.ceil(vouchers.length / pageSize);
  const paginatedVouchers = vouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Sponsored Vouchers</h2>
          <p className="text-sm text-muted-foreground">Generate and track pre-paid vouchers for attendees.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-1 h-4 w-4" /> Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batch Generate Vouchers</DialogTitle>
              <DialogDescription>Instantly create multiple vouchers with a set spending limit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Batch Name</Label>
                <Input required value={formData.batch_name} onChange={e => setFormData({...formData, batch_name: e.target.value})} placeholder="e.g. VIP Speakers" />
              </div>
              <div className="space-y-2">
                <Label>Value per Voucher (RWF)</Label>
                <Input required type="number" value={formData.value_per_person} onChange={e => setFormData({...formData, value_per_person: e.target.value})} placeholder="e.g. 10000" />
              </div>
              <div className="space-y-2">
                <Label>Quantity to Generate</Label>
                <Input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="e.g. 100" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate {formData.quantity || "0"} Vouchers
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
            <div key={voucher.id} className="p-4 text-sm grid grid-cols-4 gap-4 items-center">
              <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded w-fit">{voucher.qr_code_string}</div>
              <div className="truncate">{voucher.batch?.name}</div>
              <div>${voucher.batch?.value_per_voucher}</div>
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
