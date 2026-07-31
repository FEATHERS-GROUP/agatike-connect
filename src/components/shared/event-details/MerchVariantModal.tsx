import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";

interface MerchVariantModalProps {
  m: any;
  sizesArr: any[];
  hideSizeSelection: boolean;
  effectiveSize?: string;
  selColor?: string;
  availableColors: any[];
  currencyCode: string;
  qty: number;
  globalQty: number;
  isStockExceeded: boolean;
  canAdd: boolean;
  needsSize: boolean;
  needsColor: boolean;
  handleAdd: (m: any) => void;
  handleRemove: (m: any) => void;
  handleAddQuantity?: (m: any, qty: number) => void;
  setSelection: (id: string, field: "size" | "color", value: string) => void;
  setCart?: any;
}

export function MerchVariantModal({
  m,
  sizesArr,
  hideSizeSelection,
  effectiveSize,
  selColor,
  availableColors,
  currencyCode,
  qty,
  globalQty,
  isStockExceeded,
  canAdd,
  needsSize,
  needsColor,
  handleAdd,
  handleRemove,
  handleAddQuantity,
  setSelection,
  setCart,
}: MerchVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localQty, setLocalQty] = useState(1);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalQty(1);
    }
  };

  const handleConfirm = () => {
    if (handleAddQuantity) {
      handleAddQuantity(m, localQty);
    } else {
      for (let i = 0; i < localQty; i++) handleAdd(m);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="w-full rounded-full h-8 text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm transition-transform active:scale-95"
        >
          {globalQty > 0 ? `Selected (${globalQty})` : "Options"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl p-0 gap-0">
        <div className="flex flex-col">
          {m.image && (
            <div className="w-full h-48 md:h-64 relative bg-secondary/20">
              <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-5 flex flex-col gap-4">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl md:text-2xl">{m.name}</DialogTitle>
              {m.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {m.description}
                </p>
              )}

              {m.specs && Array.isArray(m.specs) && m.specs.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <p className="text-sm font-semibold">Specifications</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {m.specs.map((spec: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span className="font-medium">{spec.key}:</span>
                        <span>{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogHeader>

            <div className="flex flex-col gap-5 py-2">
              {!hideSizeSelection && sizesArr.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Variant</p>
                  <div className="flex flex-wrap gap-2">
                    {sizesArr.map((s: any) => (
                      <button
                        key={s.name}
                        onClick={() =>
                          setSelection(m.id, "size", effectiveSize === s.name ? "" : s.name)
                        }
                        className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                          effectiveSize === s.name
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "border-border bg-background hover:bg-secondary/50"
                        } ${s.stock <= 0 ? "opacity-40 line-through" : ""}`}
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
                  <p className="text-sm font-medium mb-2">Sub-variant</p>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c: any) => (
                      <button
                        key={c.name}
                        onClick={() =>
                          setSelection(m.id, "color", selColor === c.name ? "" : c.name)
                        }
                        className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                          selColor === c.name
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "border-border bg-background hover:bg-secondary/50"
                        } ${c.stock <= 0 ? "opacity-40 line-through" : ""}`}
                        disabled={c.stock <= 0}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mt-2">
                <p className="text-sm font-medium">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border/60 rounded-full bg-background/50 h-12 px-1">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                      disabled={localQty <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-10 text-center font-bold text-base">{localQty}</span>
                    <button
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      onClick={() => setLocalQty(localQty + 1)}
                      disabled={isStockExceeded}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t mt-2">
                <div className="flex flex-col">
                  <span className="font-bold text-xl">{formatCurrency(m.price * localQty, currencyCode)}</span>
                  {(qty > 0 || globalQty > 0) && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {qty > 0 ? `${qty} selected` : `${globalQty} total in cart`}
                    </span>
                  )}
                </div>

                {setCart ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={!canAdd}
                    className="rounded-full px-8 py-6 text-base font-semibold shadow-md flex items-center gap-2"
                    title={
                      needsSize
                        ? "Select a variant first"
                        : needsColor
                          ? "Select a sub-variant first"
                          : isStockExceeded
                            ? "Out of stock"
                            : undefined
                    }
                  >
                    {needsSize ? "Pick variant" : needsColor ? "Pick sub-variant" : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Confirm & Add
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
