import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { MerchVariantModal } from "./MerchVariantModal";
import { formatCurrency } from "@/lib/currency";

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
  const [selections, setSelections] = useState<Record<string, { size?: string; color?: string }>>(
    {},
  );

  if (activeMerch.length === 0) return null;

  const getMerchCartKey = (id: string, size?: string, color?: string) => {
    const parts = ["merch", id];
    if (size) parts.push(size);
    if (color) parts.push(color);
    return parts.join("_");
  };

  const getCartTotals = (m: any, effectiveSize?: string, selectedColor?: string) => {
    let globalQty = 0;
    let sizeQty = 0;
    let colorQty = 0;

    if (!cart) return { globalQty, sizeQty, colorQty };

    Object.entries(cart).forEach(([key, val]) => {
      // Keys are formatted as merch_ID_SIZE_COLOR
      if (key.startsWith(`merch_${m.id}`)) {
        globalQty += val;

        if (effectiveSize) {
          // We need to match the size exactly, so we include the underscore
          const sizePrefix = `merch_${m.id}_${effectiveSize}`;
          if (key === sizePrefix || key.startsWith(`${sizePrefix}_`)) {
            sizeQty += val;
            if (selectedColor && key === `${sizePrefix}_${selectedColor}`) {
              colorQty += val;
            }
          }
        }
      }
    });

    return { globalQty, sizeQty, colorQty };
  };

  const getItemQty = (m: any) => {
    if (!cart) return 0;
    const sel = selections[m.id] || {};
    const sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
    let effectiveSize = sel.size;
    if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
      effectiveSize = "One Size";
    }
    const key = getMerchCartKey(m.id, effectiveSize, sel.color);
    return cart[key] || 0;
  };

  const handleAdd = (m: any) => {
    if (!setCart) return;
    const sel = selections[m.id] || {};
    const sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];

    let effectiveSize = sel.size;
    if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
      effectiveSize = "One Size";
    }

    const hasSizes = sizesArr.length > 0;
    if (hasSizes && !effectiveSize) return;

    let hasColors = false;
    let colorLimit = Number.POSITIVE_INFINITY;
    let sizeLimit = Number.POSITIVE_INFINITY;

    if (effectiveSize) {
      const sizeObj = sizesArr.find((s: any) => s.name === effectiveSize);
      if (sizeObj) {
        sizeLimit = sizeObj.stock;
        if (Array.isArray(sizeObj.colors) && sizeObj.colors.length > 0) {
          hasColors = true;
          if (sel.color) {
            const colorObj = sizeObj.colors.find((c: any) => c.name === sel.color);
            if (colorObj) colorLimit = colorObj.stock;
          }
        }
      }
    }

    if (hasColors && !sel.color) return;

    const { globalQty, sizeQty, colorQty } = getCartTotals(m, effectiveSize, sel.color);

    const parsedStockLimit = parseInt(m.stock_limit, 10);
    const parsedSoldCount = parseInt(m.sold_count, 10) || 0;
    const globalLimit = !isNaN(parsedStockLimit)
      ? parsedStockLimit - parsedSoldCount
      : Number.POSITIVE_INFINITY;

    if (globalQty >= globalLimit) return;
    if (sizeQty >= sizeLimit) return;
    if (colorQty >= colorLimit) return;

    const key = getMerchCartKey(m.id, effectiveSize, sel.color);
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleRemove = (m: any) => {
    if (!setCart) return;
    const sel = selections[m.id] || {};
    const sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
    let effectiveSize = sel.size;
    if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
      effectiveSize = "One Size";
    }
    const key = getMerchCartKey(m.id, effectiveSize, sel.color);
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

          let effectiveSize = sel.size;
          if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
            effectiveSize = "One Size";
          }

          let availableColors: any[] = [];
          if (effectiveSize) {
            const sizeObj = sizesArr.find((s: any) => s.name === effectiveSize);
            if (sizeObj && Array.isArray(sizeObj.colors)) {
              availableColors = sizeObj.colors;
            }
          }

          const hideSizeSelection = sizesArr.length === 1 && sizesArr[0].name === "One Size";

          const needsSize = sizesArr.length > 0 && !effectiveSize;
          const needsColor = availableColors.length > 0 && !sel.color;

          let colorLimit = Number.POSITIVE_INFINITY;
          let sizeLimit = Number.POSITIVE_INFINITY;

          if (effectiveSize) {
            const sizeObj = sizesArr.find((s: any) => s.name === effectiveSize);
            if (sizeObj) {
              sizeLimit = sizeObj.stock;
              if (Array.isArray(sizeObj.colors) && sizeObj.colors.length > 0) {
                if (sel.color) {
                  const colorObj = sizeObj.colors.find((c: any) => c.name === sel.color);
                  if (colorObj) colorLimit = colorObj.stock;
                }
              }
            }
          }

          const { globalQty, sizeQty, colorQty } = getCartTotals(m, effectiveSize, sel.color);

          const parsedStockLimit = parseInt(m.stock_limit, 10);
          const parsedSoldCount = parseInt(m.sold_count, 10) || 0;
          const globalLimit = !isNaN(parsedStockLimit)
            ? parsedStockLimit - parsedSoldCount
            : Number.POSITIVE_INFINITY;

          const isStockExceeded =
            globalQty >= globalLimit || sizeQty >= sizeLimit || colorQty >= colorLimit;
          const canAdd = !needsSize && !needsColor && !isStockExceeded;

          return (
            <div
              key={m.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card flex flex-col"
            >
              {m.image ? (
                <img
                  src={m.image}
                  alt={m.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
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

                {sizesArr.length > 0 ? (
                  <MerchVariantModal
                    m={m}
                    sizesArr={sizesArr}
                    hideSizeSelection={hideSizeSelection}
                    effectiveSize={effectiveSize}
                    selColor={sel.color}
                    availableColors={availableColors}
                    currencyCode={currencyCode || "USD"}
                    qty={qty}
                    globalQty={globalQty}
                    isStockExceeded={isStockExceeded}
                    canAdd={canAdd}
                    needsSize={needsSize}
                    needsColor={needsColor}
                    handleAdd={handleAdd}
                    handleRemove={handleRemove}
                    setSelection={setSelection}
                    setCart={setCart}
                  />
                ) : (
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold">
                      {formatCurrency(m.price, currencyCode)}
                    </span>

                    {setCart ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-background rounded-full border px-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleRemove(m)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-semibold w-4 text-center">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleAdd(m)}
                            disabled={isStockExceeded}
                          >
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
                          title={isStockExceeded ? "Out of stock" : undefined}
                        >
                          Add
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs">
                        Add
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
