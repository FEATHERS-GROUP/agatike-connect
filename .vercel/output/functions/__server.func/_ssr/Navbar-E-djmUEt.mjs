import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { W as Search, T as Plus, N as Menu } from "../_libs/lucide-react.mjs";
function Navbar() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
          style: { background: "var(--gradient-primary)" },
          children: "A"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold tracking-tight", children: "Agatike" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "ml-6 hidden items-center gap-6 md:flex text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          activeOptions: { exact: true },
          className: "hover:text-foreground transition-colors",
          activeProps: { className: "text-foreground font-medium" },
          children: "Explore"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/events",
          className: "hover:text-foreground transition-colors",
          activeProps: { className: "text-foreground font-medium" },
          children: "Events"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/experiences",
          className: "hover:text-foreground transition-colors",
          activeProps: { className: "text-foreground font-medium" },
          children: "Experiences"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/movies",
          className: "hover:text-foreground transition-colors",
          activeProps: { className: "text-foreground font-medium" },
          children: "Movies"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/feed",
          className: "hover:text-foreground transition-colors",
          activeProps: { className: "text-foreground font-medium" },
          children: "Stories"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto hidden flex-1 max-w-sm md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search events, cities, organizers",
          className: "pl-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2 md:ml-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "hidden sm:inline-flex", children: "Sign in" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/create-event", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "rounded-full shadow-[var(--shadow-glow)]",
          style: { background: "var(--gradient-primary)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            " Create event"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, {}) })
    ] })
  ] }) });
}
export {
  Navbar as N
};
