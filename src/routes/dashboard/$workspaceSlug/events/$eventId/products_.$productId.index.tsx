import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Edit, ShoppingBag, Ticket, QrCode, Check, Loader2, Image as ImageIcon, Box, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProduct, getWorkspaceRecentOrders } from "@/api/products";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/products_/$productId/")({
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const params = useParams({ strict: false });
  const eventId = params.eventId as string;
  const productId = params.productId as string;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } } as any),
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["product-orders", productId],
    queryFn: () => getWorkspaceRecentOrders({ data: { workspace_id: activeWorkspace?.id } } as any),
  });

  const productOrders = recentOrders?.filter((o: any) => o.product?.name === product?.name) || [];

  const filteredOrders = productOrders.filter((order: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const orderId = order.id.split("-")[0].toLowerCase();
    const buyerName = (order.user?.username || order.guest_name || order.buyer_id || "Guest").toLowerCase();
    const phone = (order.phone || "").toLowerCase();
    const qrCode = (order.qr_code_string || "").toLowerCase();
    return (
      orderId.includes(query) ||
      buyerName.includes(query) ||
      phone.includes(query) ||
      qrCode.includes(query)
    );
  });

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Product not found.</div>;
  }

  const isPhysical = product.type === "physical";
  const TypeIcon = isPhysical ? ShoppingBag : product.type === "voucher" ? Ticket : product.type === "punch_card" ? QrCode : Check;

  const sizes: { name: string; stock: number; colors?: { name: string; stock: number }[] }[] = Array.isArray(product.available_sizes) ? product.available_sizes.map((s: any) => typeof s === 'string' ? { name: s, stock: 0 } : s) : [];
  const specs = Array.isArray(product.specs) ? product.specs : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between gap-4 py-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-secondary transition-colors"
            onClick={() => navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products&add-ons`, params: { ...params, eventId, workspaceSlug: params.workspaceSlug as string } })}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-foreground/90">Back to Products</h1>
          </div>
        </div>
        <Button
          onClick={() => navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products/$productId/edit`, params: { ...params, productId } })}
          className="rounded-full shadow-[var(--shadow-glow)] px-6"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Edit className="h-4 w-4 mr-2" /> Edit Item
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Left Column: Image */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="w-full aspect-[4/5] rounded-[2rem] bg-secondary/30 flex items-center justify-center overflow-hidden relative shadow-2xl border border-border/20 group">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <ImageIcon className="h-24 w-24 text-muted-foreground/20" />
            )}
            
            {/* Status Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="bg-background/80 backdrop-blur-md text-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-2">
                <TypeIcon className="h-3 w-3" /> {product.type.replace("_", " ")}
              </span>
              {product.stock_limit !== null && Number(product.stock_limit) < 10 && (
                <span className="bg-orange-500/90 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Low Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-7 flex flex-col pt-4 lg:pl-8">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground">{product.name}</h2>
            {product.type !== "loyalty_card" ? (
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(product.price, activeWorkspace?.currency)}
              </p>
            ) : (
              <p className="text-3xl font-bold text-primary">Free</p>
            )}
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-10">
            <div className="bg-secondary/20 p-5 rounded-2xl border border-border/30 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Total Sold</p>
              <p className="text-2xl font-bold text-green-500">{product.sold_count || 0}</p>
            </div>
            <div className="bg-secondary/20 p-5 rounded-2xl border border-border/30 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Stock Limit</p>
              <p className="text-2xl font-bold text-foreground">{product.stock_limit ? product.stock_limit : "Unlimited"}</p>
            </div>
          </div>

          <div className="space-y-8">
            {product.description && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border/20 pb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>
              </div>
            )}

            {isPhysical && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest border-b border-border/20 pb-2">Variants & Sub-variants</h4>
                    <div className="flex flex-col gap-4">
                      {sizes.length > 0 ? sizes.map(s => (
                        <div key={s.name} className="flex flex-col bg-secondary/20 rounded-2xl border border-border/30 overflow-hidden">
                          <div className="flex justify-between items-center bg-secondary/40 px-4 py-3 border-b border-border/20">
                            <span className="text-sm font-bold">{s.name}</span>
                            <span className={`text-[10px] font-bold ${s.stock > 0 ? 'text-primary' : 'text-destructive'}`}>
                              {s.stock} left
                            </span>
                          </div>
                          {s.colors && s.colors.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-background">
                              {s.colors.map(c => (
                                <div key={c.name} className="flex flex-col items-center justify-center min-w-[3.5rem] bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/40">
                                  <span className="text-xs font-bold">{c.name}</span>
                                  <span className={`text-[9px] font-bold mt-0.5 ${c.stock > 0 ? 'text-primary' : 'text-destructive'}`}>
                                    {c.stock} left
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )) : <span className="text-sm text-muted-foreground italic">No variants specified</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest border-b border-border/20 pb-2">Specifications</h4>
                  <div className="space-y-3">
                    {specs.length > 0 ? specs.map((s, i) => (
                      <div key={i} className="flex justify-between items-baseline py-1 border-b border-border/10 last:border-0">
                        <span className="text-sm text-muted-foreground font-medium">{s.key}</span>
                        <span className="text-sm font-bold text-foreground">{s.value}</span>
                      </div>
                    )) : <span className="text-sm text-muted-foreground italic">No specifications provided</span>}
                  </div>
                </div>
              </div>
            )}

            {!isPhysical && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {product.type === "voucher" && (
                  <div className="bg-secondary/20 p-5 rounded-2xl border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Voucher Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.value_amount, activeWorkspace?.currency)}</p>
                  </div>
                )}
                {(product.type === "punch_card" || product.type === "loyalty_card") && (
                  <div className="bg-secondary/20 p-5 rounded-2xl border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Total Punches</p>
                    <p className="text-2xl font-bold text-foreground">{product.punch_count}</p>
                  </div>
                )}
                {product.type === "loyalty_card" && (
                  <div className="bg-secondary/20 p-5 rounded-2xl border border-border/30 sm:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Reward Description</p>
                    <p className="text-lg font-medium text-foreground">{product.reward_description || "No reward set"}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-16 pt-12 border-t border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold tracking-tight">Recent Sales</h3>
            <span className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
              {productOrders.length} Orders
            </span>
          </div>
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

        {isLoadingOrders ? (
          <div className="p-12 flex justify-center border border-border/40 rounded-3xl bg-card"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-card border border-border/40 rounded-3xl shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-wider">Order ID</th>
                    <th className="px-6 py-5 font-bold tracking-wider">Buyer</th>
                    <th className="px-6 py-5 font-bold tracking-wider">Phone</th>
                    <th className="px-6 py-5 font-bold tracking-wider">QR Code</th>
                    <th className="px-6 py-5 font-bold tracking-wider">Qty</th>
                    <th className="px-6 py-5 font-bold tracking-wider">Variant</th>
                    <th className="px-6 py-5 font-bold tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {order.id.split("-")[0]}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{order.user?.username || order.guest_name || order.buyer_id || "Guest"}</span>
                          {order.user?.email && <span className="text-xs text-muted-foreground">{order.user.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{order.phone || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded">{order.qr_code_string || "-"}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {order.qty || 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.size && <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium border border-border/30">Variant: {order.size}</span>}
                          {order.color && <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium border border-border/30">Sub-variant: {order.color}</span>}
                          {!order.size && !order.color && <span className="text-muted-foreground italic text-xs">Standard</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground bg-secondary/10 rounded-3xl border border-dashed border-border/60">
            <div className="flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium">{productOrders.length > 0 ? "No matching orders found." : "No sales yet."}</p>
              <p className="text-sm">{productOrders.length > 0 ? "Try adjusting your search query." : "When users purchase this item, their orders will appear here."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
