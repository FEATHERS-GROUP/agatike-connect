import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ProductCheckoutSheetProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export function ProductCheckoutSheet({ product, isOpen, onClose, themeColor }: ProductCheckoutSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const navigate = useNavigate();

  // Reset state when a new product is selected
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedSize("");
      setSelectedColor("");
    }
  }, [isOpen, product]);

  if (!product) return null;

  const hasSizes = product.available_sizes && product.available_sizes.length > 0;
  const hasColors = product.available_colors && product.available_colors.length > 0;

  const canProceed = (!hasSizes || selectedSize) && (!hasColors || selectedColor);
  const total = (product.price || 0) * quantity;

  const handleProceed = () => {
    // Navigate to dedicated checkout route on the current subdomain
    navigate({
      to: `/checkout/product/${product.id}`,
      search: {
        qty: quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md bg-background overflow-y-auto p-0 border-l">
        {/* Header Image */}
        {product.image_url && (
          <div className="w-full h-56 bg-secondary relative">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        
        <div className={`p-6 ${product.image_url ? '-mt-16 relative z-10' : ''}`}>
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="text-2xl font-bold leading-tight">
              {product.name}
            </SheetTitle>
            <SheetDescription className="text-primary font-semibold text-lg mt-1">
              RWF {product.price?.toLocaleString()}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {hasSizes && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Size</Label>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((sizeObj: any, idx: number) => {
                    const sizeName = typeof sizeObj === 'string' ? sizeObj : sizeObj.name;
                    return (
                      <Button
                        key={sizeName || idx}
                        type="button"
                        variant={selectedSize === sizeName ? "default" : "outline"}
                        className="h-10 px-5 rounded-full font-medium"
                        style={selectedSize === sizeName && themeColor ? { backgroundColor: themeColor } : {}}
                        onClick={() => setSelectedSize(sizeName)}
                      >
                        {sizeName}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Color</Label>
                <div className="flex flex-wrap gap-3">
                  {product.available_colors.map((colorObj: any, idx: number) => {
                    const colorValue = typeof colorObj === 'string' ? colorObj : colorObj.hex || colorObj.color || colorObj.name;
                    const colorKey = typeof colorObj === 'string' ? colorObj : colorObj.name || colorValue || idx.toString();
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setSelectedColor(colorValue)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === colorValue ? "border-primary scale-110 shadow-md" : "border-transparent shadow hover:scale-105"
                        }`}
                        style={{ backgroundColor: colorValue }}
                      >
                        {selectedColor === colorValue && (
                          <div className="w-3 h-3 bg-white rounded-full mix-blend-difference" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Quantity</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border/60 rounded-full bg-background/50 h-12 px-1">
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-10 text-center font-bold text-base">{quantity}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_limit && quantity >= product.stock_limit}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {product.stock_limit && (
                  <span className="text-sm text-muted-foreground font-medium">
                    {product.stock_limit} left in stock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/40 space-y-5">
            <div className="flex justify-between items-center px-1">
              <span className="text-base text-muted-foreground font-medium">Total</span>
              <span className="text-2xl font-bold">RWF {total.toLocaleString()}</span>
            </div>
            <Button
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              disabled={!canProceed}
              style={themeColor ? { backgroundColor: themeColor } : {}}
              onClick={handleProceed}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
