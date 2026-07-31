import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { MerchVariantModal } from "./MerchVariantModal";
import { VoucherCard } from "../VoucherCard";
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

const normalizeMerch = (m: any) => {
  let sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
  sizesArr = sizesArr.map((s: any) => {
    if (typeof s === "string") return { name: s, stock: Number.POSITIVE_INFINITY, colors: [] };
    return s;
  });

  let colorsArr = Array.isArray(m.available_colors) ? m.available_colors : [];
  colorsArr = colorsArr.map((c: any) => {
    if (typeof c === "string") return { name: c, stock: Number.POSITIVE_INFINITY };
    return c;
  });

  return { sizesArr, colorsArr };
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
    const { sizesArr } = normalizeMerch(m);
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
    const { sizesArr, colorsArr } = normalizeMerch(m);

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
        sizeLimit = sizeObj.stock != null ? Number(sizeObj.stock) : Number.POSITIVE_INFINITY;
        if (isNaN(sizeLimit)) sizeLimit = Number.POSITIVE_INFINITY;

        const nestedColors = Array.isArray(sizeObj.colors) ? sizeObj.colors : [];
        if (nestedColors.length > 0) {
          hasColors = true;
          if (sel.color) {
            const colorObj = nestedColors.find((c: any) => c.name === sel.color);
            if (colorObj) {
              colorLimit =
                colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
              if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
            }
          }
        } else if (colorsArr.length > 0) {
          hasColors = true;
          if (sel.color) {
            const colorObj = colorsArr.find((c: any) => c.name === sel.color);
            if (colorObj) {
              colorLimit =
                colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
              if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
            }
          }
        }
      }
    } else if (colorsArr.length > 0) {
      hasColors = true;
      if (sel.color) {
        const colorObj = colorsArr.find((c: any) => c.name === sel.color);
        if (colorObj) {
          colorLimit = colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
          if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
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
    console.log("EventMerch handleAdd:", {
      m,
      effectiveSize,
      color: sel.color,
      key,
      newQty: (prev: any) => (prev[key] || 0) + 1,
    });
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleRemove = (m: any) => {
    if (!setCart) return;
    const sel = selections[m.id] || {};
    const { sizesArr } = normalizeMerch(m);
    let effectiveSize = sel.size;
    if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
      effectiveSize = "One Size";
    }
    const key = getMerchCartKey(m.id, effectiveSize, sel.color);
    setCart((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
  };

  const setSelection = (id: string, field: "size" | "color", value: string) => {
    console.log(`EventMerch setSelection:`, { id, field, value });
    setSelections((prev) => {
      const newSel = { ...prev[id], [field]: value };
      // If changing size, clear the color because colors are size-dependent
      if (field === "size") {
        newSel.color = "";
      }
      console.log(`EventMerch selections updated:`, { ...prev, [id]: newSel });
      return { ...prev, [id]: newSel };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Merchandise &amp; add-ons</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {activeMerch.map((m: any) => {
          const { sizesArr, colorsArr } = normalizeMerch(m);
          const sel = selections[m.id] || {};
          const qty = getItemQty(m);

          let effectiveSize = sel.size;
          if (!effectiveSize && sizesArr.length === 1 && sizesArr[0].name === "One Size") {
            effectiveSize = "One Size";
          }

          let availableColors: any[] = [];
          if (effectiveSize) {
            const sizeObj = sizesArr.find((s: any) => s.name === effectiveSize);
            const nestedColors = sizeObj && Array.isArray(sizeObj.colors) ? sizeObj.colors : [];
            if (nestedColors.length > 0) {
              availableColors = nestedColors;
            } else if (colorsArr.length > 0) {
              availableColors = colorsArr;
            }
          } else if (colorsArr.length > 0 && sizesArr.length === 0) {
            availableColors = colorsArr;
          }

          const hideSizeSelection = sizesArr.length === 1 && sizesArr[0].name === "One Size";

          const needsSize = sizesArr.length > 0 && !effectiveSize;
          const needsColor = availableColors.length > 0 && !sel.color;

          let colorLimit = Number.POSITIVE_INFINITY;
          let sizeLimit = Number.POSITIVE_INFINITY;

          if (effectiveSize) {
            const sizeObj = sizesArr.find((s: any) => s.name === effectiveSize);
            if (sizeObj) {
              sizeLimit = sizeObj.stock != null ? Number(sizeObj.stock) : Number.POSITIVE_INFINITY;
              if (isNaN(sizeLimit)) sizeLimit = Number.POSITIVE_INFINITY;
              const nestedColors = Array.isArray(sizeObj.colors) ? sizeObj.colors : [];
              if (nestedColors.length > 0) {
                if (sel.color) {
                  const colorObj = nestedColors.find((c: any) => c.name === sel.color);
                  if (colorObj) {
                    colorLimit =
                      colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
                    if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
                  }
                }
              } else if (colorsArr.length > 0) {
                if (sel.color) {
                  const colorObj = colorsArr.find((c: any) => c.name === sel.color);
                  if (colorObj) {
                    colorLimit =
                      colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
                    if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
                  }
                }
              }
            }
          } else if (colorsArr.length > 0) {
            if (sel.color) {
              const colorObj = colorsArr.find((c: any) => c.name === sel.color);
              if (colorObj) {
                colorLimit =
                  colorObj.stock != null ? Number(colorObj.stock) : Number.POSITIVE_INFINITY;
                if (isNaN(colorLimit)) colorLimit = Number.POSITIVE_INFINITY;
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

          if (m.type === "voucher") {
            return (
              <VoucherCard
                key={m.id}
                voucher={m}
                currencyCode={currencyCode}
                qty={qty}
                onAdd={() => handleAdd(m)}
                onRemove={() => handleRemove(m)}
                disabled={isStockExceeded}
                canAdd={canAdd}
                showCartControls={!!setCart}
                availableStock={globalLimit !== Number.POSITIVE_INFINITY ? globalLimit : undefined}
              />
            );
          }

          return (
            <div
              key={m.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card flex flex-col"
            >
              <div className="relative">
                {m.image ? (
                  <img
                    src={m.image}
                    alt={m.name}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-secondary/40 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  {Number(m.price) === 0 ? "FREE" : formatCurrency(m.price, currencyCode)}
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                {m.category && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 self-start">
                    {CATEGORY_LABELS[m.category] || m.category}
                  </span>
                )}
                <p className="text-sm font-semibold leading-tight line-clamp-2 mb-2">{m.name}</p>

                {globalQty > 0 && cart && (
                  <div className="flex flex-col gap-1 mb-3 mt-1">
                    {Object.entries(cart)
                      .filter(
                        ([k, q]) =>
                          (k === `merch_${m.id}` || k.startsWith(`merch_${m.id}_`)) && q > 0,
                      )
                      .map(([k, q]) => {
                        const parts = k.split("_");
                        const s = parts[2];
                        const c = parts[3];
                        const label = [s, c].filter(Boolean).join(" - ");
                        return (
                          <div
                            key={k}
                            className="text-[10px] flex items-center justify-between bg-primary/5 text-primary px-2 py-1 rounded-md border border-primary/10"
                          >
                            <span className="font-medium truncate pr-2">{label || "Selected"}</span>
                            <span className="font-bold shrink-0">x{q}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {sizesArr.length > 0 || colorsArr.length > 0 ? (
                  <div className="mt-auto flex items-center justify-end pt-3 border-t border-border/50">
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
                  </div>
                ) : (
                  <div className="mt-auto flex items-center justify-end pt-3 border-t border-border/50">
                    {setCart ? (
                      qty > 0 ? (
                        <div className="flex items-center justify-between w-full bg-background rounded-full border px-1 py-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-muted"
                            onClick={() => handleRemove(m)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-muted"
                            onClick={() => handleAdd(m)}
                            disabled={isStockExceeded}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full rounded-full h-8 text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm transition-transform active:scale-95"
                          onClick={() => handleAdd(m)}
                          disabled={!canAdd}
                          title={isStockExceeded ? "Out of stock" : undefined}
                        >
                          Add
                        </Button>
                      )
                    ) : (
                      <Button className="w-full rounded-full h-8 text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm">
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
