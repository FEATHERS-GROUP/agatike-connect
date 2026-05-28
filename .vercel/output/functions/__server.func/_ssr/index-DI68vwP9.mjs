import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as stories, o as organizers, g as events, h as experiences, k as movies, i as feedPosts, d as categories, j as movieStories } from "./router-EgqkzaPB.mjs";
import { S as Stories, F as FeedCard } from "./FeedCard-BbM5ZDwU.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { E as EventCard } from "./EventCard-vDo0sI8k.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { h as hero } from "./hero-event-BMhEj-B-.mjs";
import { h as Camera, X as Send, a3 as Sparkles, W as Search, J as MapPin, a4 as Star, c as ArrowRight } from "../_libs/lucide-react.mjs";
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
function HomeMobile() {
  const items = feedPosts;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full w-full bg-background text-foreground pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 sticky top-0 bg-background z-30 border-b border-border/40 pt-safe-top", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h1",
        {
          className: "text-xl font-semibold tracking-tight",
          style: { fontFamily: "cursive", fontStyle: "italic" },
          children: "Agatike"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-foreground", style: { transform: "rotate(15deg) translateY(-2px)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-6 w-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stories, { items: stories }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-5 pb-3 border-b border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight text-foreground", children: "Popular Organizers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/organizers", className: "text-sm font-bold text-primary", children: "See all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2", children: organizers.map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/organizers",
          className: "w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: org.avatar,
                alt: org.name,
                className: "w-16 h-16 rounded-full object-cover mb-3"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm leading-tight line-clamp-1", children: org.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1 line-clamp-1", children: [
              "@",
              org.handle
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider",
                onClick: (e) => e.preventDefault(),
                children: "Follow"
              }
            )
          ]
        },
        org.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-5 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight text-foreground", children: "Upcoming Events" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/events", className: "text-sm font-bold text-primary", children: "See all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2", children: events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/events/$eventId",
          params: { eventId: event.id },
          className: "w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
          children: [
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
          ]
        },
        event.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-5 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight text-foreground", children: "Discover Experiences" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/experiences", className: "text-sm font-bold text-primary", children: "See all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2", children: experiences.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/events/$eventId",
          params: { eventId: x.id },
          className: "w-56 shrink-0 rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[4/3] relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: x.cover, alt: x.title, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm", children: [
                x.currency || "$",
                x.price
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm leading-tight line-clamp-1", children: x.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mt-1", children: x.host })
            ] })
          ]
        },
        x.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight text-foreground", children: "Now Showing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/movies", className: "text-sm font-bold text-primary", children: "See all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2", children: movies.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/movies",
          className: "w-32 shrink-0 block transition-transform active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[2/3] relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.cover, alt: m.title, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm", children: m.rating })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm leading-tight line-clamp-1", children: m.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-[10px] mt-0.5", children: m.genre })
          ]
        },
        m.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full pt-2 pb-24", children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCard, { post: item }, `${item.id}-${index}`)) }),
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
function HomeDesktop() {
  const trending = events.slice(0, 6);
  const weekend = events.slice(1, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[78vh] min-h-[560px] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: hero,
          alt: "Live event crowd",
          className: "absolute inset-0 h-full w-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          " Trending across Africa this week"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl", children: [
          "Live the moments that",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: {
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                color: "transparent"
              },
              children: "move the culture."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl text-muted-foreground md:text-lg", children: "Tickets, stories, and after-movies from Africa's best nightlife, festivals, sports and experiences — all in one place." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Events, organizers, artists…",
                  className: "h-12 border-transparent bg-secondary/60 pl-9"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "City",
                  className: "h-12 border-transparent bg-secondary/60 pl-9"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "h-12 rounded-xl px-6",
                style: { background: "var(--gradient-primary)" },
                children: "Search"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2 px-1", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
              children: c
            },
            c
          )) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-6 pt-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Stories from recent events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Live moments from organizers you'll love." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "text-sm text-primary hover:underline", children: "Open feed →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stories, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-6 pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Now showing — cinemas near you" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Movie theaters using Agatike to drop showtimes." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/movies", className: "text-sm text-primary hover:underline", children: "All movies →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stories, { items: movieStories })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Trending events", subtitle: "What everyone's talking about right now", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { children: trending.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventCard, { event: e }, e.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Upcoming this weekend", subtitle: "Lock your plans in for the next 48 hours", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { cols: 4, children: weekend.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventCard, { event: e }, e.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-20 max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "At the movies this week" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Reserved seats and IMAX, straight from your phone." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/movies", className: "text-sm text-primary hover:underline", children: "Browse showtimes →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-4", children: movies.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/movies", className: "group block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[2/3] overflow-hidden rounded-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: m.cover,
              alt: m.title,
              className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur", children: m.rating })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 truncate font-semibold", children: m.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          m.genre,
          " · ",
          m.duration
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-primary", children: m.cinema })
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-20 max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Experiences — hike, run, surf" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Outdoor adventures and clubs you can join this week." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/experiences", className: "text-sm text-primary hover:underline", children: "Explore all →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3", children: experiences.slice(0, 3).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/experiences",
          className: "group overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: x.cover,
                  alt: x.title,
                  className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                  loading: "lazy"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs", children: x.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: x.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                x.host,
                " · ",
                x.city
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
                x.price === 0 ? "Free" : `From ${x.currency || "$"}${x.price}`,
                " · ",
                x.duration
              ] })
            ] })
          ]
        },
        x.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-20 max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Popular organizers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Africa's most loved creators and venues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/organizers", className: "text-sm text-primary hover:underline", children: "See all →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: events.slice(0, 4).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: e.cover,
                alt: e.organizer,
                className: "h-16 w-16 rounded-full object-cover",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-semibold", children: e.organizer }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "@",
              e.organizerHandle,
              " · ",
              e.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-primary text-primary" }),
              " ",
              e.rating,
              " ·",
              " ",
              (e.attendees * 12).toLocaleString(),
              " followers"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-4 w-full rounded-full", children: "Follow" })
          ]
        },
        e.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-20 max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Moments from the community" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Photos, videos and reviews from real attendees" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "text-sm text-primary hover:underline", children: "See all →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: feedPosts.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative aspect-square overflow-hidden rounded-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: p.image,
            alt: p.eventTitle,
            className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
            loading: "lazy"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 left-3 right-3 text-xs text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
            "@",
            p.handle
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-80 line-clamp-1", children: p.caption })
        ] })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto mt-24 max-w-7xl px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "relative overflow-hidden rounded-3xl border border-border/60 p-10 md:p-16",
        style: { background: "var(--gradient-warm)" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-2xl text-primary-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-semibold md:text-4xl", children: "Selling tickets? Agatike pays out the same week." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 opacity-90", children: "Build a branded event page, sell tickets and merch, scan attendees and pull analytics — all in one place." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "rounded-full bg-background text-foreground hover:bg-background/90", children: [
              "Open organizer dashboard ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10",
                children: "See pricing"
              }
            )
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Section({
  title,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-20 max-w-7xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "text-sm text-primary hover:underline", children: "View all →" })
    ] }),
    children
  ] });
}
function Grid({ children, cols = 3 }) {
  const c = cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid grid-cols-1 gap-5 sm:grid-cols-2 ${c}`, children });
}
function Home() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeMobile, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeDesktop, {}) })
  ] });
}
export {
  Home as component
};
