import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouter } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { E as EventCard } from "./EventCard-vDo0sI8k.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { g as events, d as categories } from "./router-EgqkzaPB.mjs";
import { b as ArrowLeft, W as Search, a1 as SlidersHorizontal } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function EventsBrowse() {
  const [q, setQ] = reactExports.useState("");
  const [cat, setCat] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => {
    return events.filter((e) => {
      const matchesQ = !q || `${e.title} ${e.organizer} ${e.city}`.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !cat || e.category === cat;
      return matchesQ && matchesCat;
    });
  }, [q, cat]);
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => router.history.back(), className: "p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "All Events" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "hidden md:flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "All events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            filtered.length,
            " events across Africa"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full max-w-md gap-2 md:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search title, city, organizer", className: "pl-9 rounded-full bg-secondary/60 border-transparent" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "mr-2 h-4 w-4" }),
            " Filters"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex w-full gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search title, city...", className: "pl-9 rounded-full bg-secondary/60 border-transparent text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "rounded-full shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 md:mt-6 flex overflow-x-auto hide-scrollbar gap-2 pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(null), className: `rounded-full border px-3 py-1 text-sm transition ${cat === null ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`, children: "All" }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(c), className: `rounded-full border px-3 py-1 text-sm transition ${cat === c ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`, children: c }, c))
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 rounded-3xl border border-dashed border-border p-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "No events match your search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Try a different city or category." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", children: filtered.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventCard, { event: e }, e.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}) })
  ] });
}
export {
  EventsBrowse as component
};
