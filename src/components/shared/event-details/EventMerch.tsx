import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Plus, Minus, ShoppingBag } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  tshirts: "T-Shirts",
  caps: "Caps / Hats",
  jumpers: "Jumpers / Hoodies",
  clothes: "Clothes / Apparel",
  devices: "Devices / Electronics",
  accessories: "Accessories",
  other: "Other",
};

export function EventMerch({
  activeMerch,
  currencyCode,
  cart,
  setCart,
}: {
  activeMerch: any[];
  currencyCode?: string;
  cart?: Record<string, number>;
  setCart?: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
}) {
  const [selections, setSelections] = useState<Record<string, { size?: string; color?: string }>>({});

  if (activeMerch.length === 0) return null;

  const getMerchCartKey = (id: string, size?: string, color?: string) => {
    const parts = ["merch", id];
    if (size) parts.push(size);
    if (color) parts.push(color);
    return parts.join("_");
  };

  const getItemQty = (m: any) => {
    if (!cart) return 0;
    const sel = selections[m.id] || {};
    const key = getMerchCartKey(m.id, sel.size, sel.color);
    return cart[key] || 0;
  };

  const handleAdd = (m: any) => {
    if (!setCart) return;
    const sel = selections[m.id] || {};
    const sizes = m.available_sizes || [];
    const colors = m.available_colors || [];
    if (sizes.length > 0 && !sel.size) return;
    if (colors.length > 0 && !sel.color) return;
    const key = getMerchCartKey(m.id, sel.size, sel.color);
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleRemove = (m: any) => {
    if (!setCart) return;
    const sel = selections[m.id] || {};
    const key = getMerchCartKey(m.id, sel.size, sel.color);
    setCart((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
  };

  const setSelection = (id: string, field: "size" | "color", value: string) => {
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Merchandise &amp; add-ons</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {activeMerch.map((m: any) => {
          const sizes: string[] = Array.isArray(m.available_sizes) ? m.available_sizes : [];
          const colors: string[] = Array.isArray(m.available_colors) ? m.available_colors : [];
          const sel = selections[m.id] || {};
          const qty = getItemQty(m);
          const needsSize = sizes.length > 0 && !sel.size;
          const needsColor = colors.length > 0 && !sel.color;
          const canAdd = !needsSize && !needsColor;

          return (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card flex flex-col">
              {m.image ? (
                <img src={m.image} alt={m.name} className="aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <div className="aspect-square w-full bg-secondary/40 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}

              <div className="p-3 flex flex-col flex-1 gap-2">
                <p className="text-sm font-medium leading-snug">{m.name}</p>

                {m.category && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full self-start">
                    {CATEGORY_LABELS[m.category] || m.category}
                  </span>
                )}

                {sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Size</p>
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelection(m.id, "size", sel.size === s ? "" : s)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                            sel.size === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Color</p>
                    <div className="flex flex-wrap gap-1">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelection(m.id, "color", sel.color === c ? "" : c)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                            sel.color === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold">{formatCurrency(m.price, currencyCode)}</span>

                  {setCart ? (
                    qty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-background rounded-full border px-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleRemove(m)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-semibold w-4 text-center">{qty}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleAdd(m)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-7 text-xs"
                        onClick={() => handleAdd(m)}
                        disabled={!canAdd}
                        title={needsSize ? "Select a size first" : needsColor ? "Select a color first" : undefined}
                      >
                        {needsSize ? "Pick size" : needsColor ? "Pick color" : "Add"}
                      </Button>
                    )
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-full h-7 text-xs">Add</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
