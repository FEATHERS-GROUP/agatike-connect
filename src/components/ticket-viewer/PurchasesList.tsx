import { Loader2, Briefcase, CheckCircle2 } from "lucide-react";

export function PurchasesList({
  isProductsLoading,
  physicalOrders,
  primaryTicket,
  setSelectedCard,
}: {
  isProductsLoading: boolean;
  physicalOrders: any[];
  primaryTicket: any;
  setSelectedCard: (card: any) => void;
}) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
      {/* Popular Now & Order Meta */}
      <div className="group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl rounded-[1.5rem] p-5 border border-white/[0.08] shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-white/90 font-semibold text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Briefcase className="w-4 h-4" />
            </div>
            Purchases
          </h2>
        </div>

        <div className="flex flex-col gap-1.5 px-1">
          {isProductsLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
            </div>
          ) : physicalOrders.length > 0 ? (
            physicalOrders.map((order: any, idx: number) => (
              <div
                key={order.id || idx}
                onClick={() => setSelectedCard({ type: "physical", data: order })}
                className="flex items-center gap-4 py-3 px-2 border-b border-white/5 last:border-0 group/item cursor-pointer hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/10 group-hover/item:scale-105 transition-transform">
                  {order.product?.image_url ? (
                    <img
                      src={order.product.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Briefcase className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white/90 text-sm truncate">
                    {order.product?.name || "Product"}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5 truncate uppercase tracking-wider font-semibold">
                    Qty: {order.qty || 1} • {order.size || "Standard"}
                  </p>
                </div>
                <div className="h-8 w-px border-l-2 border-dashed border-white/10 mx-2" />
                <div className="text-right shrink-0">
                  <p className="font-mono text-white/90 text-[13px]">{order.amount_paid} RWF</p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${order.status === "Confirmed" ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-3 text-white/40 text-[13px] italic">
              No additional items purchased.
            </div>
          )}

          <div className="h-px w-full bg-white/5 my-3" />

          <div className="flex justify-between items-center py-1.5">
            <span className="text-white/50 text-[13px] font-medium">Order Reference</span>
            <span className="text-white/90 font-mono text-sm tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
              {primaryTicket.orderId}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-white/50 text-[13px] font-medium">Status</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold text-[13px]">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
