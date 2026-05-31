import { l as t, q as e, L as s } from "./index-BbCjida8.js";
import { B as r } from "./button-BtHMdeJ3.js";
import { S as a, I as o } from "./input-Bn2qJlr0.js";
import { P as n } from "./plus-DEJHAl15.js";
const i = [
    ["path", { d: "M4 5h16", key: "1tepv9" }],
    ["path", { d: "M4 12h16", key: "1lakjw" }],
    ["path", { d: "M4 19h16", key: "1djgab" }],
  ],
  l = t("menu", i);
function h() {
  return e.jsx("header", {
    className:
      "sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl",
    children: e.jsxs("div", {
      className: "mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6",
      children: [
        e.jsxs(s, {
          to: "/",
          className: "flex items-center gap-2",
          children: [
            e.jsx("div", {
              className:
                "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
              style: { background: "var(--gradient-primary)" },
              children: "A",
            }),
            e.jsx("span", {
              className: "text-lg font-semibold tracking-tight",
              children: "Agatike",
            }),
          ],
        }),
        e.jsxs("nav", {
          className: "ml-6 hidden items-center gap-6 md:flex text-sm text-muted-foreground",
          children: [
            e.jsx(s, {
              to: "/",
              activeOptions: { exact: !0 },
              className: "hover:text-foreground transition-colors",
              activeProps: { className: "text-foreground font-medium" },
              children: "Explore",
            }),
            e.jsx(s, {
              to: "/events",
              className: "hover:text-foreground transition-colors",
              activeProps: { className: "text-foreground font-medium" },
              children: "Events",
            }),
            e.jsx(s, {
              to: "/experiences",
              className: "hover:text-foreground transition-colors",
              activeProps: { className: "text-foreground font-medium" },
              children: "Experiences",
            }),
            e.jsx(s, {
              to: "/movies",
              className: "hover:text-foreground transition-colors",
              activeProps: { className: "text-foreground font-medium" },
              children: "Movies",
            }),
            e.jsx(s, {
              to: "/feed",
              className: "hover:text-foreground transition-colors",
              activeProps: { className: "text-foreground font-medium" },
              children: "Stories",
            }),
          ],
        }),
        e.jsx("div", {
          className: "ml-auto hidden flex-1 max-w-sm md:block",
          children: e.jsxs("div", {
            className: "relative",
            children: [
              e.jsx(a, {
                className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
              }),
              e.jsx(o, {
                placeholder: "Search events, cities, organizers",
                className:
                  "pl-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background",
              }),
            ],
          }),
        }),
        e.jsxs("div", {
          className: "ml-auto flex items-center gap-2 md:ml-2",
          children: [
            e.jsx(s, {
              to: "/signin",
              children: e.jsx(r, {
                variant: "ghost",
                className: "hidden sm:inline-flex",
                children: "Sign in",
              }),
            }),
            e.jsx(s, {
              to: "/create-event",
              children: e.jsxs(r, {
                className: "rounded-full shadow-[var(--shadow-glow)]",
                style: { background: "var(--gradient-primary)" },
                children: [e.jsx(n, { className: "mr-1 h-4 w-4" }), " Create event"],
              }),
            }),
            e.jsx(r, {
              variant: "ghost",
              size: "icon",
              className: "md:hidden",
              children: e.jsx(l, {}),
            }),
          ],
        }),
      ],
    }),
  });
}
export { h as N };
