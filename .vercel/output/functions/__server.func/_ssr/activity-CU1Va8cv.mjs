import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as events, h as experiences, k as movies } from "./router-EgqkzaPB.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { m as CircleCheck, g as CalendarDays, a4 as Star, F as Film } from "../_libs/lucide-react.mjs";
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
function ActivityPage() {
  const notifications = [{
    id: "1",
    type: "booking",
    title: "Booking Confirmed",
    description: `You're all set for ${events[0].title}.`,
    time: "2m ago",
    image: events[0].cover,
    icon: CircleCheck,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
    actionText: "View Ticket",
    link: `/events/${events[0].id}`
  }, {
    id: "2",
    type: "new_event",
    title: "New Event Announced",
    description: `${events[1].organizer} just dropped tickets for ${events[1].title}.`,
    time: "2h ago",
    image: events[1].cover,
    icon: CalendarDays,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    actionText: "Book Now",
    link: `/events/${events[1].id}`
  }, {
    id: "3",
    type: "rating",
    title: "Rate Your Experience",
    description: `How was ${experiences[0].title}?`,
    time: "1d ago",
    image: experiences[0].cover,
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    actionText: "Rate",
    link: `/explore`
  }, {
    id: "4",
    type: "movie",
    title: "Now Showing",
    description: `${movies[0].title} is now playing near you.`,
    time: "2d ago",
    image: movies[0].cover,
    icon: Film,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    actionText: "Get Seats",
    link: `/movies`
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 sticky top-0 bg-background/90 backdrop-blur-md z-30 border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-2xl tracking-tight", children: "Activity" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider", children: "Recent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: notifications.slice(0, 2).map((n) => {
        const Icon = n.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 p-3 rounded-2xl bg-card border border-border/40 shadow-sm transition-all active:scale-[0.98]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-xl overflow-hidden bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: n.image, alt: n.title, className: "h-full w-full object-cover" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${n.bg} border-2 border-background flex items-center justify-center shadow-sm`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3.5 w-3.5 ${n.color}`, strokeWidth: 2.5 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold truncate", children: n.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground whitespace-nowrap font-medium", children: n.time })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/80 leading-snug line-clamp-2 mb-2", children: n.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.link, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: n.type === "booking" ? "secondary" : "default", size: "sm", className: `h-8 w-full rounded-lg text-xs font-bold ${n.type !== "booking" && "shadow-md shadow-primary/20"}`, children: n.actionText }) })
          ] })
        ] }, n.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider", children: "Earlier" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5 opacity-80 hover:opacity-100 transition-opacity", children: notifications.slice(2).map((n) => {
        const Icon = n.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 p-3 rounded-2xl bg-card/50 border border-border/40 transition-all active:scale-[0.98]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-xl overflow-hidden bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: n.image, alt: n.title, className: "h-full w-full object-cover grayscale-[30%]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${n.bg} border-2 border-background flex items-center justify-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3.5 w-3.5 ${n.color}`, strokeWidth: 2.5 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold truncate", children: n.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground whitespace-nowrap font-medium", children: n.time })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/80 leading-snug line-clamp-2 mb-2", children: n.description }),
            n.type === "rating" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mb-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 text-muted-foreground/30 hover:text-amber-500 hover:fill-amber-500 cursor-pointer transition-colors" }, star)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.link, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "h-8 w-full rounded-lg text-xs font-bold", children: n.actionText }) })
          ] })
        ] }, n.id);
      }) })
    ] })
  ] });
}
export {
  ActivityPage as component
};
