import { createFileRoute } from "@tanstack/react-router";
import { CartCheckoutPage } from "@/components/shared/CartCheckoutPage";

export const Route = createFileRoute("/p_/$slug/checkout/cart")({
  component: CartCheckoutPage,
});
