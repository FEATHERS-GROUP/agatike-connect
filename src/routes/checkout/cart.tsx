import { createFileRoute } from "@tanstack/react-router";
import { CartCheckoutPage } from "@/components/shared/CartCheckoutPage";

export const Route = createFileRoute("/checkout/cart")({
  component: CartCheckoutPage,
});
