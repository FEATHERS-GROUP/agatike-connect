import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { d as categories, g as events, o as organizers, h as experiences, k as movies } from "./router-EgqkzaPB.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { W as Search, a1 as SlidersHorizontal, G as Map, J as MapPin } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
function ExplorePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-20 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] md:pb-8 shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search events, artists, venues...", className: "h-12 bg-secondary/50 border-transparent pl-10 rounded-2xl text-base shadow-sm focus-visible:ring-primary/50" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "h-12 w-12 rounded-2xl shrink-0 border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto mt-4 pb-2 hide-scrollbar", children: categories.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-secondary-foreground border border-border/40 hover:bg-secondary"}`, children: c }, c)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-6 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/map", className: "relative h-40 w-full rounded-3xl overflow-hidden group cursor-pointer shadow-[var(--shadow-card)] block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop", alt: "Map View", className: "w-full h-full object-cover opacity-60 dark:opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center z-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-2 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "h-6 w-6 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground bg-background/80 px-3 py-1 rounded-full backdrop-blur text-sm", children: "Explore Map View" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Trending Nearby" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-primary font-medium", children: "See all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: events.slice(0, 4).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/events/$eventId", params: {
          eventId: e.id
        }, className: `group relative rounded-3xl overflow-hidden bg-card shadow-[var(--shadow-card)] ${i === 0 || i === 3 ? "aspect-[3/4]" : "aspect-square"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: e.cover, alt: e.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-primary mb-1 uppercase tracking-wider", children: e.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-semibold text-sm leading-tight line-clamp-2", children: e.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white/80 text-[10px] mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
              " ",
              e.city
            ] })
          ] })
        ] }, e.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Popular Organizers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/organizers", className: "text-sm font-bold text-primary", children: "See all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2", children: organizers.map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/organizers", className: "w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: org.avatar, alt: org.name, className: "w-16 h-16 rounded-full object-cover mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm leading-tight line-clamp-1", children: org.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1 line-clamp-1", children: [
            "@",
            org.handle
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider", onClick: (e) => e.preventDefault(), children: "Follow" })
        ] }, org.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Upcoming Events" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2", children: events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/events/$eventId", params: {
          eventId: event.id
        }, className: "w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[4/3] relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: event.cover, alt: event.title, className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm", children: [
              event.currency || "$",
              event.price
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm leading-tight line-clamp-2", children: event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: event.date }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: event.city })
            ] })
          ] })
        ] }, event.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Unique Experiences" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4", children: experiences.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/events/$eventId", params: {
          eventId: x.id
        }, className: "w-64 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-video relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: x.cover, alt: x.title, className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium", children: [
              x.currency || "$",
              x.price
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm line-clamp-1", children: x.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mt-1", children: x.host })
          ] })
        ] }, x.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Now Showing" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4", children: movies.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/movies", className: "w-32 shrink-0 block transition-transform active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[2/3] relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.cover, alt: m.title, className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm", children: m.rating })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm leading-tight line-clamp-1", children: m.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-[10px] mt-0.5", children: m.genre })
        ] }, m.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` })
  ] });
}
export {
  ExplorePage as component
};
