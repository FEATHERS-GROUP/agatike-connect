import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { a as Route$2, g as events, h as experiences, k as movies, t as ticketTiers, m as merch } from "./router-EgqkzaPB.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { k as ChevronLeft, H as Heart, _ as Share2, C as Calendar, o as Clock, J as MapPin, a4 as Star, P as Minus, T as Plus, $ as Shield, ac as Users } from "../_libs/lucide-react.mjs";
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
import "./input-B51fUUFa.mjs";
function EventDetailsMobile({ eventId }) {
  const event = events.find((e) => e.id === eventId) || experiences.find((x) => x.id === eventId) || movies.find((m) => m.id === eventId) || events[0];
  const [tier, setTier] = reactExports.useState(ticketTiers[0].id);
  const [qty, setQty] = reactExports.useState(1);
  const selected = ticketTiers.find((t) => t.id === tier);
  const total = selected.price * qty;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground pb-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative h-[65vh] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/explore",
          className: "absolute top-safe-top left-4 z-30 h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 mt-4",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6 text-white" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-safe-top right-4 z-30 flex gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5 text-white" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: event.cover,
          alt: event.title,
          className: "absolute inset-0 h-full w-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 z-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-white/10 shadow-sm", children: event.category || event.genre || "Event" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-bold tracking-tight text-white shadow-sm leading-none mb-4", children: event.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-white/90 text-sm font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary" }),
            " ",
            event.date || "Today"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
            " ",
            event.time || event.duration || "All day"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
            " ",
            event.venue || event.cinema || event.city,
            ", ",
            event.city
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-primary fill-primary" }),
            " ",
            event.rating || "5.0"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-6 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-card/60 backdrop-blur rounded-3xl p-3 border border-border/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: event.cover,
              className: "h-12 w-12 rounded-full object-cover border border-border",
              alt: event.organizer || event.host || event.cinema || "Host"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold leading-tight", children: event.organizer || event.host || event.cinema }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "@",
              event.organizerHandle || "host"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "rounded-full h-8 px-4 font-bold", children: "Follow" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-2", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm uppercase tracking-wider text-muted-foreground font-semibold", children: [
          event.date || "Today",
          " · ",
          event.time || event.duration || "All day"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed mt-2", children: event.description || event.synopsis || "An exciting experience awaits you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Community" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-primary", children: [
            (event.attendees || event.spots || 0).toLocaleString(),
            " going"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex -space-x-3", children: [
          Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: `https://i.pravatar.cc/100?img=${i + 20}`,
              className: "h-10 w-10 rounded-full border-2 border-background"
            },
            i
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold", children: [
            "+",
            (event.attendees || event.spots || 0) > 6 ? (event.attendees || event.spots || 0) - 6 : 0
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-4", children: "Tickets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ticketTiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setTier(t.id),
            className: `w-full rounded-3xl border p-4 transition-all duration-300 ${tier === t.id ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/40 bg-card/50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base", children: t.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-lg text-primary", children: [
                  event.currency || "$",
                  t.price
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: t.perks.join(" · ") }),
              tier === t.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t border-border/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Quantity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-background rounded-full px-2 py-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-foreground",
                      onClick: (e) => {
                        e.stopPropagation();
                        setQty(Math.max(1, qty - 1));
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center font-bold text-sm", children: qty }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-foreground",
                      onClick: (e) => {
                        e.stopPropagation();
                        setQty(qty + 1);
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" })
                    }
                  )
                ] })
              ] })
            ]
          },
          t.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold", children: [
          event.currency || "$",
          total
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          asChild: true,
          className: "w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide",
          style: { background: "var(--gradient-primary)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/book/$eventId", params: { eventId: event.id }, className: "w-full block", children: "Get Tickets" })
        }
      )
    ] })
  ] });
}
function EventDetailsDesktop({ eventId }) {
  const event = events.find((e) => e.id === eventId) || experiences.find((x) => x.id === eventId) || movies.find((m) => m.id === eventId) || events[0];
  const [tier, setTier] = reactExports.useState(ticketTiers[0].id);
  const [qty, setQty] = reactExports.useState(1);
  const selected = ticketTiers.find((t) => t.id === tier);
  const total = selected.price * qty;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative h-[60vh] min-h-[420px] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: event.cover,
          alt: event.title,
          className: "absolute inset-0 h-full w-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur", children: event.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 max-w-3xl text-4xl font-semibold md:text-5xl", children: event.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            " ",
            event.date || "Today"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
            " ",
            event.time || event.duration || "All day"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            " ",
            event.venue || event.cinema || event.city,
            ",",
            " ",
            event.city
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }),
            " ",
            event.rating || "5.0"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: event.cover,
                className: "h-12 w-12 rounded-full object-cover",
                alt: event.organizer || event.host || event.cinema || "Organizer"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold", children: "Organized by" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
                event.organizer || event.host || event.cinema || "Host",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "@",
                  event.organizerHandle || "host"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "rounded-full", children: "Follow" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "About this event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-muted-foreground leading-relaxed", children: [
            event.description || event.synopsis || "Join us for an exciting experience.",
            " Expect curated sound, immersive lighting and a crowd that brings the energy. Doors open one hour before showtime — bring an ID and your good vibes."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Lineup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-4", children: ["DJ Nala", "Burna Sound", "Amapiano Live", "Surprise Guest"].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-2xl border border-border/60 bg-card p-4 text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mx-auto h-14 w-14 rounded-full",
                    style: { background: "var(--gradient-primary)" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium", children: n })
              ]
            },
            n
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold", children: [
            "People going · ",
            (event.attendees || event.spots || 0).toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex -space-x-3", children: [
            Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-10 w-10 rounded-full border-2 border-background",
                style: { background: `oklch(${0.6 + i % 3 * 0.1} 0.18 ${30 + i * 20})` }
              },
              i
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 grid h-10 place-items-center rounded-full bg-secondary px-3 text-xs font-medium", children: [
              "+",
              " ",
              ((event.attendees || event.spots || 0) - 8 > 0 ? (event.attendees || event.spots || 0) - 8 : 0).toLocaleString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Merchandise & add-ons" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-2 gap-4 md:grid-cols-4", children: merch.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "overflow-hidden rounded-2xl border border-border/60 bg-card",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: m.image,
                    alt: m.name,
                    className: "aspect-square w-full object-cover",
                    loading: "lazy"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: m.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold", children: [
                      event.currency || "$",
                      m.price
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "rounded-full", children: "Add" })
                  ] })
                ] })
              ]
            },
            m.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mr-2 h-5 w-5" }),
            " ",
            event.venue || event.cinema || event.city,
            ",",
            " ",
            event.city
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Community reviews" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: [
            { n: "Amaka O.", t: "Best night out I've had in months. Sound was unreal." },
            { n: "Kwame B.", t: "Smooth entry, great staff, would 100% come back." }
          ].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
              r.n,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-primary text-primary" }),
                " 5.0"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: r.t })
          ] }, r.n)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "lg:sticky lg:top-24 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Starting from" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-semibold", children: [
              event.currency || "$",
              ticketTiers[0].price
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-2", children: ticketTiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setTier(t.id),
              className: `w-full rounded-2xl border p-4 text-left transition ${tier === t.id ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-secondary"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: t.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
                    event.currency || "$",
                    t.price
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: t.perks.join(" · ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-primary", children: [
                  t.remaining,
                  " left"
                ] })
              ]
            },
            t.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between rounded-2xl border border-border bg-background p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 text-sm", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setQty(Math.max(1, qty - 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center font-medium", children: qty }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setQty(qty + 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-semibold", children: [
              event.currency || "$",
              total
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              asChild: true,
              className: "mt-4 h-12 w-full rounded-2xl text-base shadow-[var(--shadow-glow)]",
              style: { background: "var(--gradient-primary)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/book/$eventId", params: { eventId: event.id }, className: "w-full block", children: "Get Tickets" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
            " Secure checkout · Mobile QR ticket"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-dashed border-border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-28 w-28 place-items-center rounded-xl bg-foreground text-background text-xs font-mono", children: "QR PREVIEW" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Tickets are scanned at the door from your phone." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            " ",
            (event.attendees || event.spots || 0).toLocaleString(),
            " ",
            "going"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "text-primary hover:underline", children: "See moments" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function EventDetailsRoute() {
  const {
    eventId
  } = Route$2.useParams();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EventDetailsMobile, { eventId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EventDetailsDesktop, { eventId }) })
  ] });
}
export {
  EventDetailsRoute as component
};
