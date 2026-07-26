import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string; // unique string (product.id + size + color)
  product: any;
  qty: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any, qty: number, size?: string, color?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("agatike_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart from local storage", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("agatike_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: any, qty: number, size?: string, color?: string) => {
    setItems((prev) => {
      const id = `${product.id}-${size || ""}-${color || ""}`;
      const existingItemIndex = prev.findIndex((item) => item.id === id);

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const newItems = [...prev];
        const newQty = newItems[existingItemIndex].qty + qty;

        // Respect stock limit if available
        if (product.stock_limit && newQty > product.stock_limit) {
          newItems[existingItemIndex].qty = product.stock_limit;
          toast.error(`Cannot add more. Only ${product.stock_limit} available.`);
        } else {
          newItems[existingItemIndex].qty = newQty;
          toast.success("Cart updated");
        }
        return newItems;
      } else {
        // New item
        if (product.stock_limit && qty > product.stock_limit) {
          toast.error(`Cannot add more. Only ${product.stock_limit} available.`);
          return prev;
        }
        toast.success("Added to cart");
        return [...prev, { id, product, qty, size, color }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.product.stock_limit && qty > item.product.stock_limit) {
            toast.error(`Cannot add more. Only ${item.product.stock_limit} available.`);
            return { ...item, qty: item.product.stock_limit };
          }
          return { ...item, qty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("agatike_cart");
  };

  const cartTotal = items.reduce((total, item) => total + (item.product.price || 0) * item.qty, 0);
  const cartCount = items.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
