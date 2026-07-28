import { createFileRoute } from "@tanstack/react-router";
import { CartCheckoutPage } from "./checkout/cart";

export const Route = createFileRoute("/p_/$slug/checkout/cart")({
  component: CartCheckoutPage,
});
