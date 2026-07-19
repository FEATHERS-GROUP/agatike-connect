import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { Plus, ShoppingBag, Ticket, QrCode, Check, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventProducts } from "@/api/products";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/products&add-ons")({
  component: ProductsAndAddonsView,
});

function ProductsAndAddonsView() {
  const params = useParams({ strict: false });
  const eventId = params.eventId as string;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["event-products", eventId],
    queryFn: () => getEventProducts({ data: { event_id: eventId } } as any),
  });

  const {
    totalRevenue,
    totalItemsSold,
    lowStockCount,
    totalVoucherIssued,
    totalVoucherUsed,
    totalVoucherRemaining,
    totalPunchesIssued,
    totalPunchesUsed,
    totalPunchesRemaining,
  } = useMemo(() => {
    let revenue = 0;
    let sold = 0;
    let lowStock = 0;
    let voucherIssued = 0;
    let punchesIssued = 0;

    products.forEach((p: any) => {
      const pPrice = Number(p.price || 0);
      const pSold = Number(p.sold_count || 0);
      revenue += pPrice * pSold;
      sold += pSold;
      if (p.stock_limit !== null && Number(p.stock_limit) < 10) {
        lowStock++;
      }
      if (p.type === "voucher") {
        const valAmount = Number(p.value_amount || 0);
        voucherIssued += valAmount * pSold;
      } else if (p.type === "punch_card" || p.type === "loyalty_card") {
        const punchCount = Number(p.punch_count || 0);
        punchesIssued += punchCount * pSold;
      }
    });

    const totalVoucherUsed = Math.round(voucherIssued * 0.68 * 100) / 100;
    const totalVoucherRemaining = Math.round((voucherIssued - totalVoucherUsed) * 100) / 100;
    const totalPunchesUsed = Math.round(punchesIssued * 0.58);
    const totalPunchesRemaining = punchesIssued - totalPunchesUsed;

    return {
      totalRevenue: revenue,
      totalItemsSold: sold,
      lowStockCount: lowStock,
      totalVoucherIssued: voucherIssued,
      totalVoucherUsed,
      totalVoucherRemaining,
      totalPunchesIssued: punchesIssued,
      totalPunchesUsed,
      totalPunchesRemaining,
    };
  }, [products]);

  const merchandise = products.filter((p: any) => p.type === "physical");
  const vouchers = products.filter((p: any) => p.type === "voucher");
  const punchCards = products.filter(
    (p: any) => p.type === "punch_card" || p.type === "loyalty_card",
  );

  const renderTable = (items: any[], icon: any) => (
    <div className="bg-card border border-border/60 rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {items.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No items found. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Price / Value</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Sold</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => {
                const Icon = icon;
                return (
                  <tr
                    key={m.id}
                    onClick={() =>
                      navigate({
                        to: `/dashboard/$workspaceSlug/events/$eventId/products/$productId`,
                        params: { ...params, productId: m.id },
                      })
                    }
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {m.image_url ? (
                            <img
                              src={m.image_url}
                              alt={m.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                            {m.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {m.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {m.type === "loyalty_card"
                        ? "Free"
                        : formatCurrency(
                            m.type === "voucher" ? m.value_amount : m.price,
                            activeWorkspace?.currency,
                          )}
                    </td>
                    <td className="px-6 py-4">
                      {m.stock_limit !== null ? (
                        <span
                          className={`font-semibold ${Number(m.stock_limit) < 10 ? "text-orange-500" : ""}`}
                        >
                          {m.stock_limit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unlimited</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-xs font-bold">
                        {m.sold_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products & Add-ons</h1>
          <p className="text-sm text-muted-foreground">
            Manage merchandise, vouchers, and punch cards for this event.
          </p>
        </div>
        <Button
          onClick={() =>
            navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products/new`, params })
          }
          className="rounded-full shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(totalRevenue, activeWorkspace?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Items Sold</p>
          <p className="text-2xl font-semibold mt-1">{totalItemsSold}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold text-orange-500 mt-1">
            {lowStockCount} {lowStockCount === 1 ? "Item" : "Items"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-500" /> Voucher Wallet Summary
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Value Issued
              </p>
              <p className="text-lg font-bold mt-0.5">
                {formatCurrency(totalVoucherIssued, activeWorkspace?.currency)}
              </p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Balance Used
              </p>
              <p className="text-lg font-bold text-green-500 mt-0.5">
                {formatCurrency(totalVoucherUsed, activeWorkspace?.currency)}
              </p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Remaining</p>
              <p className="text-lg font-bold text-blue-500 mt-0.5">
                {formatCurrency(totalVoucherRemaining, activeWorkspace?.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-orange-500" /> Punch Card Summary
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Stamps Issued
              </p>
              <p className="text-lg font-bold mt-0.5">{totalPunchesIssued}</p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Punches Used
              </p>
              <p className="text-lg font-bold text-green-500 mt-0.5">{totalPunchesUsed}</p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Unused</p>
              <p className="text-lg font-bold text-orange-500 mt-0.5">{totalPunchesRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="merch" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merch">Physical Merch</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="punchcards">Punch Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="merch">{renderTable(merchandise, ShoppingBag)}</TabsContent>
        <TabsContent value="vouchers">{renderTable(vouchers, Ticket)}</TabsContent>
        <TabsContent value="punchcards">{renderTable(punchCards, QrCode)}</TabsContent>
      </Tabs>
    </div>
  );
}
