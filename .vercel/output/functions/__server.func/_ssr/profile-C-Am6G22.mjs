import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { o as organizers, u as upcomingTickets, g as events } from "./router-EgqkzaPB.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { J as MapPin, Y as Settings, R as Music, a8 as Trophy, F as Film, O as Mic, H as Heart, a5 as Ticket, l as ChevronRight, C as Calendar, U as QrCode, B as Bell, o as Clock, a4 as Star } from "../_libs/lucide-react.mjs";
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
import "./input-B51fUUFa.mjs";
const pastEvents = events.slice(2, 6).map((e, i) => ({
  ...e,
  histRating: 3 + i % 3,
  rated: i % 2 === 0
}));
const favoriteCategories = [{
  label: "Music",
  icon: Music,
  color: "text-purple-500",
  bg: "bg-purple-500/10",
  border: "border-purple-500/20"
}, {
  label: "Sports",
  icon: Trophy,
  color: "text-blue-500",
  bg: "bg-blue-500/10",
  border: "border-blue-500/20"
}, {
  label: "Cinema",
  icon: Film,
  color: "text-rose-500",
  bg: "bg-rose-500/10",
  border: "border-rose-500/20"
}, {
  label: "Conferences",
  icon: Mic,
  color: "text-amber-500",
  bg: "bg-amber-500/10",
  border: "border-amber-500/20"
}];
function TicketCard({
  ticket
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/ticket/$ticketId", params: {
    ticketId: ticket.id
  }, className: "block rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ticket.cover, alt: ticket.title, className: "w-full h-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-3 left-4 text-white font-bold text-sm leading-tight", children: ticket.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${ticket.ticketType === "VIP" ? "bg-primary text-primary-foreground" : "bg-white/20 text-white backdrop-blur-sm"}`, children: ticket.ticketType })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
          ticket.date
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          ticket.time
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: ticket.seat }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-primary mt-0.5", children: ticket.orderId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8 px-3 rounded-full text-xs font-bold", style: {
          background: "var(--gradient-primary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5 mr-1" }),
          "Show"
        ] })
      ] })
    ] })
  ] });
}
function HistoryCard({
  event
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex gap-3 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: event.cover, alt: event.title, className: "w-20 h-20 object-cover rounded-xl shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col justify-between py-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm leading-tight line-clamp-2", children: event.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
          event.city
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-3.5 w-3.5 ${s <= event.histRating ? "text-yellow-400 fill-yellow-400" : "text-border"}` }, s)) }),
        !event.rated && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full", children: "Rate" })
      ] })
    ] })
  ] });
}
function ProfilePage() {
  const [tab, setTab] = reactExports.useState("upcoming");
  const desktop = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-col min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 mx-auto max-w-7xl w-full px-6 py-10 grid grid-cols-[300px_1fr] gap-8 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "sticky top-24 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-6 flex flex-col items-center text-center shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-2xl p-[3px] shadow-lg mb-4", style: {
            background: "var(--gradient-primary)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://i.pravatar.cc/150?u=me", alt: "Alex Doe", className: "h-full w-full rounded-[14px] object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-xl", children: "Alex Doe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
            " Kigali, Rwanda"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Member since Jan 2024" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 w-full mt-5", children: [{
            v: "24",
            l: "Attended"
          }, {
            v: "8",
            l: "Following"
          }, {
            v: "5",
            l: "Upcoming"
          }].map(({
            v,
            l
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base", children: v }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5", children: l })
          ] }, l)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "flex-1 h-9 text-sm font-semibold rounded-xl", children: "Edit Profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "icon", className: "h-9 w-9 rounded-xl shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm mb-4", children: "Interests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: favoriteCategories.map(({
            label,
            icon: Icon,
            color,
            bg,
            border
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${bg} ${border} ${color}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
            label
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm", children: "Following" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/organizers", className: "text-xs text-primary font-bold", children: "See all" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: organizers.slice(0, 4).map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: org.avatar, alt: org.name, className: "h-9 w-9 rounded-full object-cover border border-border/40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold truncate", children: org.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "@",
                org.handle
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 fill-primary text-primary shrink-0" })
          ] }, org.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-5 w-5 text-primary" }),
              " Upcoming Tickets"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/events", className: "text-sm text-primary font-bold flex items-center gap-1", children: [
              "Browse events ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-4 items-start", children: upcomingTickets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TicketCard, { ticket: t }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-primary" }),
            " Event History"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: pastEvents.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryCard, { event: e }, e.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
  const mobile = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden min-h-screen bg-background pb-24 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 pt-safe-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "My Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scanner", className: "p-2 rounded-full hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 rounded-full hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 rounded-full hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-4 pt-6 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded-2xl p-[2px] shadow-lg shrink-0", style: {
          background: "var(--gradient-primary)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://i.pravatar.cc/150?u=me", alt: "Alex Doe", className: "h-full w-full rounded-[14px] object-cover bg-card" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-xl tracking-tight", children: "Alex Doe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0" }),
            " Kigali, Rwanda"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Member since Jan 2024" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-3 gap-3", children: [{
        value: "24",
        label: "Events Attended"
      }, {
        value: "8",
        label: "Following"
      }, {
        value: "5",
        label: "Upcoming"
      }].map(({
        value,
        label
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border/40 p-3 text-center shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-xl", children: value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 leading-tight", children: label })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "flex-1 h-9 text-sm font-semibold rounded-xl", children: "Edit Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "flex-1 h-9 text-sm font-semibold rounded-xl", children: "Share" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider", children: "Interests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto hide-scrollbar pb-1", children: favoriteCategories.map(({
        label,
        icon: Icon,
        color,
        bg,
        border
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${bg} ${border} ${color}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
        label
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-border/40 mt-4 px-4 gap-1", children: ["upcoming", "history", "following"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `flex-1 py-2.5 text-xs font-bold capitalize transition-all rounded-t-lg ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
      t === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-4 w-4" }),
        " Upcoming"
      ] }),
      t === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
        " History"
      ] }),
      t === "following" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }),
        " Following"
      ] })
    ] }) }, t)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4", children: [
      tab === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        upcomingTickets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TicketCard, { ticket: t }, t.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/events", className: "flex items-center justify-center gap-1 text-sm font-bold text-primary py-3", children: [
          "Browse more events ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
        ] })
      ] }),
      tab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: pastEvents.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryCard, { event }, event.id)) }),
      tab === "following" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        organizers.slice(0, 5).map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border/40 rounded-2xl flex items-center gap-3 p-3 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: org.avatar, alt: org.name, className: "h-12 w-12 rounded-full object-cover shrink-0 border border-border/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: org.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "@",
              org.handle,
              " · ",
              (org.followers / 1e3).toFixed(1),
              "k followers"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", className: "shrink-0 h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 fill-primary text-primary" }),
            " Following"
          ] })
        ] }, org.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/organizers", className: "flex items-center justify-center gap-1 text-sm font-bold text-primary py-3", children: [
          "Discover more organizers ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    desktop,
    mobile
  ] });
}
export {
  ProfilePage as component
};
