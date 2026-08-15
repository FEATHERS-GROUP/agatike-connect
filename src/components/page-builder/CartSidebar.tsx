import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";

export function CartSidebar() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
  }, []);

  const { data: pageData } = useQuery({
    queryKey: ["workspace-page-by-slug", subdomainSlug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug: subdomainSlug! } } as any),
    enabled: !!subdomainSlug,
  });

  const settingsBlock = pageData?.components?.find((c: any) => c.type === "page_settings");
  const themeColor = settingsBlock?.themeColor || pageData?.theme_color || undefined;
  const fontFamily = settingsBlock?.fontFamily || "Inter";

  const fallbackCurrency = items[0]?.product?.workspace?.wallet?.currency || items[0]?.product?.workspace?.currency || "RWF";
  const workspaceCurrency = pageData?.workspaces?.wallet?.currency || pageData?.workspaces?.currency || fallbackCurrency;

  const handleCheckout = () => {
    closeCart();
    const pathname = window.location.pathname;
    if (pathname.startsWith("/p/")) {
      const parts = pathname.split("/");
      if (parts[2]) {
        navigate({ to: `/p/${parts[2]}/checkout/cart` as any });
        return;
      }
    }
    navigate({ to: "/checkout/cart" });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        className="w-full sm:max-w-md bg-background overflow-hidden flex flex-col p-0 border-l"
        style={{ fontFamily: `${fontFamily}, sans-serif` }}
      >
        <SheetDescription className="sr-only">Your shopping cart contents</SheetDescription>
        <div className="p-6 border-b border-border/40">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-2"
                aria-label="Back to store"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <SheetTitle className="text-2xl font-bold flex items-center gap-3 m-0">
                <ShoppingCart className="w-6 h-6" />
                Your Cart
              </SheetTitle>
            </div>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-70">
              <ShoppingCart className="w-16 h-16" />
              <p className="text-lg font-medium">Your cart is empty.</p>
              <Button onClick={closeCart} variant="outline" className="mt-4 rounded-full px-8">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-secondary rounded-xl overflow-hidden shrink-0 border border-border/60">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-base line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            Color:
                            <span
                              className="w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: item.color }}
                            />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold">
                        {workspaceCurrency} {(item.product.price || 0).toLocaleString()}
                      </div>

                      <div className="flex items-center border border-border/60 rounded-lg bg-background/50 h-8">
                        <button
                          className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          disabled={
                            !!(item.product.stock_limit && item.qty >= item.product.stock_limit)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-secondary/10 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-muted-foreground">Subtotal</span>
              <span className="font-bold text-xl">{workspaceCurrency} {cartTotal.toLocaleString()}</span>
            </div>

            <Button
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-transform active:scale-[0.98]"
              style={
                themeColor ? { backgroundColor: themeColor, color: "#fff" } : { color: "#fff" }
              }
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Taxes and fees calculated at checkout.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
