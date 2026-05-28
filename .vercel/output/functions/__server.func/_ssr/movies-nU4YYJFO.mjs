import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { k as movies, e as cinemas } from "./router-EgqkzaPB.mjs";
import { b as ArrowLeft, F as Film, J as MapPin, o as Clock, a5 as Ticket } from "../_libs/lucide-react.mjs";
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
function Movies() {
  const [active, setActive] = reactExports.useState(movies[0].id);
  const activeMovie = movies.find((m) => m.id === active);
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => router.history.back(), className: "p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "Movies & Cinemas" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden border-b border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeMovie.cover, alt: "", className: "absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto grid max-w-7xl gap-6 px-4 md:px-6 py-6 md:gap-8 md:py-16 md:grid-cols-[260px_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeMovie.cover, alt: activeMovie.title, className: "aspect-[2/3] w-[180px] md:w-full rounded-2xl object-cover shadow-[var(--shadow-card)] mx-auto md:mx-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center md:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-3.5 w-3.5 text-primary" }),
            " Now playing"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-3xl font-semibold md:text-5xl", children: activeMovie.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            activeMovie.genre,
            " · ",
            activeMovie.duration,
            " · ",
            activeMovie.rating
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground mx-auto md:mx-0", children: activeMovie.synopsis }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
              " ",
              activeMovie.cinema,
              ", ",
              activeMovie.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
              " Today"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex overflow-x-auto hide-scrollbar gap-2 pb-2 justify-center md:justify-start", children: activeMovie.showtimes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium hover:border-primary hover:bg-accent transition shrink-0", children: t }, t)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center md:justify-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "rounded-full shadow-[var(--shadow-glow)] w-full md:w-auto", style: {
              background: "var(--gradient-primary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/book/$eventId", params: {
              eventId: activeMovie.id
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "mr-2 h-4 w-4" }),
              " Reserve seat — ",
              activeMovie.currency || "$",
              activeMovie.price
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "rounded-full w-full md:w-auto mt-2 md:mt-0", children: "Watch trailer" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "All movies showing this week" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 md:mt-6 grid grid-cols-2 gap-4 md:gap-5 md:grid-cols-4", children: movies.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActive(m.id), className: `text-left ${active === m.id ? "opacity-100" : "opacity-90 hover:opacity-100"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative aspect-[2/3] overflow-hidden rounded-2xl border ${active === m.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.cover, alt: m.title, className: "h-full w-full object-cover", loading: "lazy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur", children: m.rating })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 truncate font-semibold", children: m.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: m.cinema })
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-4 md:px-6 pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Cinemas on Agatike" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Theater partners selling seats through our platform." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "rounded-full w-full md:w-auto", children: "List your cinema" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4", children: cinemas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.image, alt: c.name, className: "aspect-video w-full object-cover", loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            c.city,
            " · ",
            c.screens,
            " screens"
          ] })
        ] })
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}) })
  ] });
}
export {
  Movies as component
};
