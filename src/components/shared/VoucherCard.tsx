import { Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

export interface VoucherCardProps {
  voucher: any;
  currencyCode?: string;
  qty?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  canAdd?: boolean;
  showCartControls?: boolean;
  colorClass?: string;
  buttonTextColorClass?: string;
  logoElement?: React.ReactNode;
  availableStock?: number;
}

export function VoucherCard({
  voucher,
  currencyCode = "RWF",
  qty = 0,
  onAdd,
  onRemove,
  disabled = false,
  canAdd = true,
  showCartControls = false,
  colorClass = "bg-[#F97316]", // Matches the orange from the image
  buttonTextColorClass = "text-[#F97316]",
  logoElement,
  availableStock,
}: VoucherCardProps) {
  return (
    <div
      className={`relative flex flex-col w-full rounded-3xl overflow-hidden text-white ${colorClass} shadow-md`}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-3 text-center">
        <span className="uppercase tracking-widest text-[9px] font-semibold opacity-90 mb-1.5">
          {voucher.category || "Voucher"}
        </span>
        <h3 className="text-2xl font-bold tracking-tight mb-1">
          {voucher.value_amount ? (
            voucher.value_amount.includes("%") ? (
              voucher.value_amount
            ) : (
              formatCurrency(voucher.value_amount, currencyCode)
            )
          ) : (
            voucher.name
          )}
        </h3>
        {voucher.value_amount && (
          <p className="text-xs font-medium tracking-tight opacity-90">{voucher.name}</p>
        )}
      </div>

      {/* Divider with Cutouts */}
      <div className="relative flex items-center justify-center h-4 w-full">
        {/* Left Cutout */}
        <div className="absolute -left-2.5 h-5 w-5 rounded-full bg-background" />

        {/* Dashed Line */}
        <div className="w-full border-t-2 border-dashed border-white/50 mx-3" />

        {/* Right Cutout */}
        <div className="absolute -right-2.5 h-5 w-5 rounded-full bg-background" />

        {/* Logo/Icon overlapping divider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#DC2626] flex items-center justify-center z-10 shadow-sm border-[2px] border-[#F97316]">
          {logoElement ? (
            logoElement
          ) : (
            <span className="font-serif italic text-sm font-bold text-[#FCD34D]">M</span>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center justify-center pt-5 pb-5 px-3 text-center">
        {showCartControls ? (
          <div className="flex flex-col items-center gap-1.5 w-full">
            {availableStock !== undefined && (
              <span className="text-[9px] font-medium text-white/80 tracking-wide uppercase">
                {availableStock > 0 ? `${availableStock} available` : "Sold out"}
              </span>
            )}
            {qty > 0 ? (
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-1.5 py-1 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-white/30 text-white"
                  onClick={onRemove}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-bold w-4 text-center">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-white/30 text-white"
                  onClick={onAdd}
                  disabled={disabled}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                className={`rounded-full px-4 py-2 h-7 text-[10px] font-bold bg-white ${buttonTextColorClass} hover:bg-white/95 shadow-sm w-full max-w-[120px]`}
                onClick={onAdd}
                disabled={!canAdd}
              >
                Add
              </Button>
            )}
          </div>
        ) : (
          <Button
            className={`rounded-full px-4 py-2 h-7 text-[10px] font-bold bg-white ${buttonTextColorClass} hover:bg-white/95 shadow-sm w-full max-w-[120px]`}
          >
            Redeem
          </Button>
        )}
      </div>
    </div>
  );
}
