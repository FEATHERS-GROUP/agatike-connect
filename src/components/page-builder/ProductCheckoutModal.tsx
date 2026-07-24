import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, ShoppingBag } from "lucide-react";

interface ProductCheckoutModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: (totalAmount: number, details: any) => void;
  themeColor?: string;
}

export function ProductCheckoutModal({ product, isOpen, onClose, onProceedToPayment, themeColor }: ProductCheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
        {/* Header Image */}
        {product.image_url && (
          <div className="w-full h-48 bg-secondary relative">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        
        <div className={`p-6 ${product.image_url ? '-mt-12 relative z-10' : ''}`}>
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-bold line-clamp-2 leading-tight">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-primary font-semibold text-lg mt-1">
              RWF {product.price?.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {hasSizes && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Size</Label>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size: string) => (
                    <Button
                      key={size}
                      type="button"
                      variant={selectedSize === size ? "default" : "outline"}
                      className="h-9 px-4 rounded-full font-medium"
                      style={selectedSize === size && themeColor ? { backgroundColor: themeColor } : {}}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {product.available_colors.map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor === color ? "border-primary scale-110 shadow-sm" : "border-transparent shadow-sm hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <div className="w-2 h-2 bg-white rounded-full mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quantity</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border/60 rounded-full bg-background/50">
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_limit && quantity >= product.stock_limit}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock_limit && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {product.stock_limit} left in stock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm text-muted-foreground font-medium">Total</span>
              <span className="text-xl font-bold">RWF {total.toLocaleString()}</span>
            </div>
            <Button
              className="w-full h-12 rounded-xl text-md font-bold shadow-sm flex items-center justify-center gap-2"
              disabled={!canProceed}
              style={themeColor ? { backgroundColor: themeColor } : {}}
              onClick={() => {
                onProceedToPayment(total, {
                  quantity,
                  size: selectedSize,
                  color: selectedColor
                });
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              Proceed to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
