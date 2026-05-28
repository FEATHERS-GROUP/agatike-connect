import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { h as experiences } from "./router-EgqkzaPB.mjs";
import { b as ArrowLeft, Q as Mountain, a4 as Star, J as MapPin, o as Clock, ac as Users } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./input-B51fUUFa.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
const cats = ["All", "Hiking", "Running", "Surf", "Wellness", "Food", "Carft"];
function Experiences() {
  const [cat, setCat] = reactExports.useState("All");
  const list = reactExports.useMemo(() => cat === "All" ? experiences : experiences.filter((e) => e.category === cat), [cat]);
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => router.history.back(), className: "p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "Experiences" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden hidden md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
        background: "var(--gradient-warm)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-7xl px-6 py-16 text-primary-foreground md:py-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mountain, { className: "h-3.5 w-3.5" }),
          " Outdoor & active"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 max-w-3xl text-4xl font-semibold md:text-5xl", children: "Hike, run, surf — book it like a ticket." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-xl opacity-90", children: "Local hosts running curated outdoor experiences and recurring clubs across the continent." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex overflow-x-auto hide-scrollbar gap-2 pb-2", children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(c), className: `rounded-full border px-4 py-1.5 text-sm shrink-0 transition ${cat === c ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`, children: c }, c)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: list.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: x.cover, alt: x.title, className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110", loading: "lazy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs backdrop-blur", children: x.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-primary text-primary" }),
            " ",
            x.rating
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold leading-tight", children: x.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Hosted by ",
            x.host
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
              " ",
              x.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              " ",
              x.duration
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
              " ",
              x.spots,
              " spots"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 line-clamp-2 text-sm text-muted-foreground", children: x.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: x.price === 0 ? "Free · Join club" : `From ${x.currency || "$"}${x.price}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "rounded-full", style: {
              background: "var(--gradient-primary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/events/$eventId", params: {
              eventId: x.id
            }, children: x.price === 0 ? "Join" : "Book" }) })
          ] })
        ] })
      ] }, x.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}) })
  ] });
}
export {
  Experiences as component
};
