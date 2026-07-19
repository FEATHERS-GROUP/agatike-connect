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
    const sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
    
    const hasSizes = sizesArr.length > 0;
    if (hasSizes && !sel.size) return;

    let hasColors = false;
    if (sel.size) {
      const sizeObj = sizesArr.find((s: any) => s.name === sel.size);
      if (sizeObj && Array.isArray(sizeObj.colors) && sizeObj.colors.length > 0) {
        hasColors = true;
      }
    }
    
    if (hasColors && !sel.color) return;

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
    setSelections((prev) => {
      const newSel = { ...prev[id], [field]: value };
      // If changing size, clear the color because colors are size-dependent
      if (field === "size") {
        newSel.color = "";
      }
      return { ...prev, [id]: newSel };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Merchandise &amp; add-ons</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {activeMerch.map((m: any) => {
          const sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
          const sel = selections[m.id] || {};
          const qty = getItemQty(m);
          
          let availableColors: any[] = [];
          if (sel.size) {
            const sizeObj = sizesArr.find((s: any) => s.name === sel.size);
            if (sizeObj && Array.isArray(sizeObj.colors)) {
              availableColors = sizeObj.colors;
            }
          } else if (sizesArr.length === 1 && sizesArr[0].name === "One Size") {
            // Auto-select One Size if it's the only option and we haven't selected it yet
            // Wait, we shouldn't auto-select in render, just show colors for it if selected.
            // We'll require user to tap it, or we could handle default state.
          }

          const needsSize = sizesArr.length > 0 && !sel.size;
          const needsColor = availableColors.length > 0 && !sel.color;
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

                {sizesArr.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Variant</p>
                    <div className="flex flex-wrap gap-1">
                      {sizesArr.map((s: any) => (
                        <button
                          key={s.name}
                          onClick={() => setSelection(m.id, "size", sel.size === s.name ? "" : s.name)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                            sel.size === s.name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"
                          } ${s.stock <= 0 ? "opacity-50 line-through" : ""}`}
                          disabled={s.stock <= 0}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableColors.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Sub-variant</p>
                    <div className="flex flex-wrap gap-1">
                      {availableColors.map((c: any) => (
                        <button
                          key={c.name}
                          onClick={() => setSelection(m.id, "color", sel.color === c.name ? "" : c.name)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                            sel.color === c.name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"
                          } ${c.stock <= 0 ? "opacity-50 line-through" : ""}`}
                          disabled={c.stock <= 0}
                        >
                          {c.name}
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
                        title={needsSize ? "Select a variant first" : needsColor ? "Select a sub-variant first" : undefined}
                      >
                        {needsSize ? "Pick variant" : needsColor ? "Pick sub-variant" : "Add"}
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
