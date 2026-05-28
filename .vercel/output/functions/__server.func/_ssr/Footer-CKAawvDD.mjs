import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-24 border-t border-border/60 bg-secondary/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
              style: { background: "var(--gradient-primary)" },
              children: "A"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold", children: "Agatike" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-sm text-sm text-muted-foreground", children: "Africa's premium social event platform. Discover, share and live the moments that matter." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "rounded-full border border-border bg-background px-4 py-2 hover:bg-secondary transition",
              href: "#",
              children: "App Store"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "rounded-full border border-border bg-background px-4 py-2 hover:bg-secondary transition",
              href: "#",
              children: "Google Play"
            }
          )
        ] })
      ] }),
      [
        { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
        { title: "Organizers", links: ["Create event", "Pricing", "Scanning", "Analytics"] },
        { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Refunds"] }
      ].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: col.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2 text-sm text-muted-foreground", children: col.links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-foreground transition", children: l }) }, l)) })
      ] }, col.title))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/60 py-5 text-center text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Agatike. Made with rhythm across Africa."
    ] })
  ] });
}
export {
  Footer as F
};
