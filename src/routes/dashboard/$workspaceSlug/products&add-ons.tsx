import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingBag, Ticket, QrCode, Loader2, Check } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { getWorkspaceProducts, getWorkspaceRecentOrders } from "@/api/products";
import { format } from "date-fns";
import {
  getWorkspaceSponsoredVoucherBatches,
  batchGenerateSponsoredVouchers,
} from "@/api/vouchers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/products&add-ons")({
  component: WorkspaceProductsView,
});

import { Link } from "@tanstack/react-router";

function BatchGenerateModal() {
  const [open, setOpen] = useState(false);
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    batch_name: "",
    value_per_person: "",
    quantity: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: activeWorkspace?.id,
        event_id: null,
        batch_name: formData.batch_name,
        value_per_person: Number(formData.value_per_person),
        quantity: Number(formData.quantity),
        generation_type: "manual",
        value_type: "fixed",
      };
      return await batchGenerateSponsoredVouchers({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Voucher batch generated successfully!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workspace-vouchers", activeWorkspace?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate vouchers");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batch_name || !formData.value_per_person || !formData.quantity) {
      toast.error("Please fill in all fields");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full shadow-[var(--shadow-glow)] mr-2 border-primary/20 hover:bg-primary/5 text-primary"
        >
          <Ticket className="mr-1 h-4 w-4" /> Batch Generate Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Batch Generate Vouchers</DialogTitle>
          <DialogDescription>
            Generate a batch of pre-loaded vouchers for your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>
              Batch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Summer Promo Vouchers"
              value={formData.batch_name}
              onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Value per Voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="50"
                value={formData.value_per_person}
                onChange={(e) => setFormData({ ...formData, value_per_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Quantity to Generate <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              style={{ background: "var(--gradient-primary)" }}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceOrdersTable() {
  const { activeWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["workspace-recent-orders", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceRecentOrders({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const filteredOrders = orders.filter((order: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const orderId = order.id.split("-")[0].toLowerCase();
    const buyerName = (
      order.user?.username ||
      order.guest_name ||
      order.buyer_id ||
      "Guest"
    ).toLowerCase();
    const phone = (order.phone || "").toLowerCase();
    const qrCode = (order.qr_code_string || "").toLowerCase();
    const productName = (order.product?.name || "").toLowerCase();
    return (
      orderId.includes(query) ||
      buyerName.includes(query) ||
      phone.includes(query) ||
      qrCode.includes(query) ||
      productName.includes(query)
    );
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-4 gap-4">
        <h3 className="font-semibold text-lg">All Orders</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="border-t border-border/60">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ShoppingBag className="h-8 w-8 opacity-20" />
            <p className="text-sm">No matching orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Order ID</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Buyer</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Phone</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Product</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Qty</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Price</th>
                  <th className="px-6 py-4 font-medium tracking-wider">QR Code</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {order.id.split("-")[0]}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {order.user?.username ||
                            order.guest_name ||
                            order.user?.handle ||
                            order.user?.email ||
                            order.buyer_id ||
                            "Guest"}
                        </span>
                        {order.user?.email && (
                          <span className="text-xs text-muted-foreground">{order.user.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{order.phone || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.product?.name}</span>
                        <div className="flex gap-2 mt-1">
                          {order.size && (
                            <span className="text-xs text-muted-foreground">
                              Variant: {order.size}
                            </span>
                          )}
                          {order.color && (
                            <span className="text-xs text-muted-foreground">
                              Sub: {order.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{order.qty || 1}</td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(order.amount_paid || 0, activeWorkspace?.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                        {order.qr_code_string || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceProductsView() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchProduct, setSearchProduct] = useState("");
  const { activeWorkspace } = useWorkspace();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["workspace-products", activeWorkspace?.id],
    queryFn: () => getWorkspaceProducts({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["workspace-recent-orders", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceRecentOrders({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: voucherBatches = [], isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["workspace-vouchers", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceSponsoredVoucherBatches({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const merchandise = products
    .filter((p: any) => p.type === "physical")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  const productVouchers = products
    .filter((p: any) => p.type === "voucher")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  const generatedBatches = voucherBatches.map((b: any) => ({
    id: b.id,
    name: b.name,
    price: b.value_per_voucher,
    stock: b.vouchers?.length || 0,
    sold: b.vouchers?.filter((v: any) => !v.is_active).length || 0,
    type: "voucher_batch",
    value_amount: b.value_per_voucher,
    description: `Batch generated with ${b.vouchers?.length || 0} vouchers.`,
  }));

  const allVouchers = [...productVouchers, ...generatedBatches];

  const punchCards = products
    .filter((p: any) => p.type === "punch_card" || p.type === "loyalty_card")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  // Real stats from actual order data
  const totalRevenue = (orders as any[]).reduce(
    (sum: number, o: any) => sum + Number(o.amount_paid || 0),
    0,
  );
  const totalOrderCount = (orders as any[]).length;
  const allProductItems = [...merchandise, ...allVouchers, ...punchCards];
  const activeCampaigns = allProductItems.filter((item) => item.is_active !== false).length;
  const lowStockAlerts = allProductItems.filter((item) => {
    const stock = item.stock_limit;
    return stock !== null && stock !== undefined && Number(stock) < 20 && Number(stock) > 0;
  }).length;

  const stats = { totalRevenue, activeCampaigns, lowStockAlerts, totalOrderCount };

  // Filtered products for the merch tab search
  const filteredMerch = merchandise.filter((p: any) => {
    if (!searchProduct) return true;
    const q = searchProduct.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.event?.title || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });
  const filteredVouchers = allVouchers.filter(
    (p: any) =>
      !searchProduct || (p.name || "").toLowerCase().includes(searchProduct.toLowerCase()),
  );
  const filteredPunchCards = punchCards.filter(
    (p: any) =>
      !searchProduct || (p.name || "").toLowerCase().includes(searchProduct.toLowerCase()),
  );

  const renderTable = (items: any[], icon: any) => {
    const Icon = icon;
    return (
      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 pb-4 gap-4 border-b border-border/40">
          <span className="text-sm font-medium text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Variants</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Sold</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((m) => {
                const sizes: any[] = Array.isArray(m.available_sizes) ? m.available_sizes : [];
                const totalVariantStock = sizes.reduce((sum: number, s: any) => {
                  if (typeof s === "object" && Array.isArray(s.colors)) {
                    return (
                      sum + s.colors.reduce((cs: number, c: any) => cs + Number(c.stock || 0), 0)
                    );
                  }
                  return sum + Number(s.stock || 0);
                }, 0);
                const stockDisplay =
                  m.stock_limit !== null && m.stock_limit !== undefined
                    ? sizes.length > 0
                      ? totalVariantStock
                      : Number(m.stock_limit)
                    : "∞";
                const isLow =
                  typeof stockDisplay === "number" && stockDisplay < 20 && stockDisplay > 0;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem(m)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors overflow-hidden">
                          {m.image_url ? (
                            <img
                              src={m.image_url}
                              alt={m.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold text-foreground">{m.name}</p>
                          {m.category && (
                            <span className="text-xs text-muted-foreground">{m.category}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.event?.title ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          {m.event.title}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Campaign</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(m.price, activeWorkspace?.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {sizes.slice(0, 3).map((s: any, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded border border-border/30"
                            >
                              {typeof s === "string" ? s : s.name}
                            </span>
                          ))}
                          {sizes.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{sizes.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${isLow ? "text-orange-500" : ""}`}>
                        {stockDisplay}
                        {isLow && (
                          <span className="ml-1 text-[10px] bg-orange-500/10 text-orange-500 px-1 py-0.5 rounded">
                            Low
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-green-500 font-medium">{m.sold_count || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${m.is_active !== false ? "bg-green-500/10 text-green-600" : "bg-secondary/60 text-muted-foreground"}`}
                      >
                        {m.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground whitespace-normal"
                  >
                    {searchProduct
                      ? "No products match your search."
                      : "No items found. Create one to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-2 sm:px-4 md:px-0 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products & Add-ons</h1>
          <p className="text-sm text-muted-foreground">
            Manage standalone campaigns, general merch, and vouchers for your brand.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BatchGenerateModal />
          <Link
            to="/dashboard/$workspaceSlug/products/create"
            params={{ workspaceSlug: activeWorkspace?.slug as string }}
          >
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Create Campaign
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(stats.totalRevenue, activeWorkspace?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-semibold mt-1">{stats.totalOrderCount}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Products</p>
          <p className="text-2xl font-semibold mt-1">{stats.activeCampaigns}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold text-orange-500 mt-1">
            {stats.lowStockAlerts} Items
          </p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <div className="w-full overflow-x-auto pb-2 mb-2 no-scrollbar">
          <TabsList className="flex w-max min-w-full justify-start h-auto p-1 bg-secondary/50">
            <TabsTrigger value="orders" className="rounded-full px-4 py-2">
              Orders
            </TabsTrigger>
            <TabsTrigger value="merch" className="rounded-full px-4 py-2">
              Physical Merch
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="rounded-full px-4 py-2">
              Gift Cards & Vouchers
            </TabsTrigger>
            <TabsTrigger value="punchcards" className="rounded-full px-4 py-2">
              Punch Cards
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="orders">
          <WorkspaceOrdersTable />
        </TabsContent>
        <TabsContent value="merch">{renderTable(filteredMerch, ShoppingBag)}</TabsContent>
        <TabsContent value="vouchers">{renderTable(filteredVouchers, Ticket)}</TabsContent>
        <TabsContent value="punchcards">{renderTable(filteredPunchCards, QrCode)}</TabsContent>
      </Tabs>

      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedItem?.name}</SheetTitle>
            <SheetDescription>
              {selectedItem?.type === "physical" && "Physical Merchandise"}
              {selectedItem?.type === "voucher" && "Gift Card / Voucher"}
              {selectedItem?.type === "voucher_batch" && "Generated Voucher Batch"}
              {selectedItem?.type === "punch_card" && "Digital Punch Card"}
            </SheetDescription>
          </SheetHeader>

          {selectedItem && (
            <div className="space-y-8">
              {/* Premium Visual Representation */}
              {selectedItem.type === "punch_card" && (
                <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium uppercase tracking-widest">
                          Punch Card
                        </p>
                        <p className="text-white font-bold text-xl mt-1">
                          {selectedItem.punch_count} Uses
                        </p>
                      </div>
                    </div>

                    <h3 className="text-white text-3xl font-bold tracking-tight mb-2 drop-shadow-md">
                      {selectedItem.name}
                    </h3>

                    {/* Punch grid visual */}
                    <div className="mt-8 grid grid-cols-5 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                      {Array.from({ length: selectedItem.punch_count || 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-full border-2 border-white/40 flex items-center justify-center shadow-inner relative overflow-hidden group"
                        >
                          {/* Decorative punched holes simulation */}
                          {i < 2 ? (
                            <div className="absolute inset-0 bg-white/30 backdrop-blur flex items-center justify-center">
                              <Check className="text-white h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-white/20"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(selectedItem.type === "voucher" || selectedItem.type === "voucher_batch") && (
                <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-tr from-blue-600 to-cyan-400">
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-xl mix-blend-overlay"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-inner">
                      <Ticket className="h-8 w-8" />
                    </div>
                    <p className="text-white/90 text-sm font-medium uppercase tracking-widest mb-1">
                      Digital Voucher
                    </p>
                    <h3 className="text-white text-3xl font-bold tracking-tight">
                      {selectedItem.name}
                    </h3>

                    <div className="mt-8 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 inline-flex items-center gap-2">
                      <span className="text-white/80 text-sm">Value:</span>
                      <span className="text-white font-bold text-xl">
                        {formatCurrency(selectedItem.value_amount || 0, activeWorkspace?.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === "physical" && (
                <div className="aspect-square w-full rounded-[2rem] bg-secondary/50 border border-border/60 flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 z-10 pointer-events-none"></div>
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  ) : (
                    <ShoppingBag className="h-32 w-32 text-muted-foreground/30 drop-shadow-sm z-0" />
                  )}
                  <div className="absolute bottom-6 left-6 right-6 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 text-center shadow-lg z-20">
                    <p className="font-semibold text-lg">{selectedItem.name}</p>
                  </div>
                </div>
              )}

              {/* Data & Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Details & Stats</h4>

                {selectedItem.description && (
                  <div
                    className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border/50 break-words overflow-hidden [&>*:last-child]:mb-0 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_*]:!bg-transparent [&_*]:!text-inherit"
                    dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(selectedItem.price, activeWorkspace?.currency)}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Sales
                    </p>
                    <p className="text-xl font-semibold text-green-500">{selectedItem.sold}</p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Inventory
                    </p>
                    <p
                      className={`text-xl font-semibold ${selectedItem.stock < 100 ? "text-orange-500" : ""}`}
                    >
                      {selectedItem.stock}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <Link
                      to="/dashboard/$workspaceSlug/products/edit/$productId"
                      params={{
                        workspaceSlug: activeWorkspace?.slug as string,
                        productId: selectedItem.id,
                      }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-10 shadow-sm border-primary/20 hover:bg-primary/5 text-primary"
                      >
                        Edit Item
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
