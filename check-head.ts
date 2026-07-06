import { createRootRoute } from "@tanstack/react-router";
export const Route = createRootRoute({
  head: (ctx) => {
    console.log(Object.keys(ctx));
    return {};
  }
});
