import {
  l as u,
  q as e,
  y as b,
  L as t,
  u as f,
  m as i,
  n as x,
  t as h,
  o as p,
  g,
  s as j,
} from "./index-BbCjida8.js";
import { S as o, F as v } from "./FeedCard-CKEA7cdP.js";
import { B as l } from "./button-BtHMdeJ3.js";
import { S as N } from "./send-i6bAB18C.js";
import { N as w } from "./Navbar-8zxmLK7V.js";
import { F as y } from "./Footer-CxcHC3QW.js";
import { E as d } from "./EventCard-DGZ7bjrd.js";
import { S as k, I as n } from "./input-Bn2qJlr0.js";
import { h as S } from "./hero-event-Cqx_3vn6.js";
import { S as z, A } from "./sparkles-e08jvUQW.js";
import { M as F } from "./map-pin-C2ftX2X_.js";
import { S as $ } from "./star-CtaeFg5C.js";
import "./x-B77yeb99.js";
import "./calendar-days-Bc2SBC-l.js";
import "./plus-DEJHAl15.js";
import "./users-Cp-Hr28i.js";
const E = [
    [
      "path",
      {
        d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
        key: "18u6gg",
      },
    ],
    ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
  ],
  I = u("camera", E);
function L() {
  const a = p;
  return e.jsxs("div", {
    className: "h-full w-full bg-background text-foreground pb-20",
    children: [
      e.jsxs("div", {
        className:
          "flex items-center justify-between px-4 py-3 sticky top-0 bg-background z-30 border-b border-border/40 pt-safe-top",
        children: [
          e.jsx("button", {
            className: "text-foreground",
            children: e.jsx(I, { className: "h-6 w-6" }),
          }),
          e.jsx("h1", {
            className: "text-xl font-semibold tracking-tight",
            style: { fontFamily: "cursive", fontStyle: "italic" },
            children: "Agatike",
          }),
          e.jsx("button", {
            className: "text-foreground",
            style: { transform: "rotate(15deg) translateY(-2px)" },
            children: e.jsx(N, { className: "h-6 w-6" }),
          }),
        ],
      }),
      e.jsx("div", {
        className: "px-4 py-3 border-b border-border/40",
        children: e.jsx(o, { items: b }),
      }),
      e.jsxs("div", {
        className: "pt-5 pb-3 border-b border-border/40",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between px-4 mb-3",
            children: [
              e.jsx("h2", {
                className: "text-lg font-bold tracking-tight text-foreground",
                children: "Popular Organizers",
              }),
              e.jsx(t, {
                to: "/organizers",
                className: "text-sm font-bold text-primary",
                children: "See all",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2",
            children: f.map((r) =>
              e.jsxs(
                t,
                {
                  to: "/organizers",
                  className:
                    "w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block",
                  children: [
                    e.jsx("img", {
                      src: r.avatar,
                      alt: r.name,
                      className: "w-16 h-16 rounded-full object-cover mb-3",
                    }),
                    e.jsx("p", {
                      className: "font-semibold text-sm leading-tight line-clamp-1",
                      children: r.name,
                    }),
                    e.jsxs("p", {
                      className: "text-[10px] text-muted-foreground mt-1 line-clamp-1",
                      children: ["@", r.handle],
                    }),
                    e.jsx(l, {
                      size: "sm",
                      className:
                        "mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider",
                      onClick: (s) => s.preventDefault(),
                      children: "Follow",
                    }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "pt-5 pb-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between px-4 mb-3",
            children: [
              e.jsx("h2", {
                className: "text-lg font-bold tracking-tight text-foreground",
                children: "Upcoming Events",
              }),
              e.jsx(t, {
                to: "/events",
                className: "text-sm font-bold text-primary",
                children: "See all",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2",
            children: i.map((r) =>
              e.jsxs(
                t,
                {
                  to: "/events/$eventId",
                  params: { eventId: r.id },
                  className:
                    "w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
                  children: [
                    e.jsxs("div", {
                      className: "aspect-[4/3] relative",
                      children: [
                        e.jsx("img", {
                          src: r.cover,
                          alt: r.title,
                          className: "w-full h-full object-cover",
                        }),
                        e.jsxs("div", {
                          className:
                            "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                          children: [r.currency || "$", r.price],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "p-3",
                      children: [
                        e.jsx("p", {
                          className: "font-semibold text-sm leading-tight line-clamp-2",
                          children: r.title,
                        }),
                        e.jsxs("div", {
                          className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
                          children: [
                            e.jsx("span", { className: "truncate", children: r.date }),
                            e.jsx("span", { children: "•" }),
                            e.jsx("span", { className: "truncate", children: r.city }),
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "pt-5 pb-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between px-4 mb-3",
            children: [
              e.jsx("h2", {
                className: "text-lg font-bold tracking-tight text-foreground",
                children: "Discover Experiences",
              }),
              e.jsx(t, {
                to: "/experiences",
                className: "text-sm font-bold text-primary",
                children: "See all",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2",
            children: x.map((r) =>
              e.jsxs(
                t,
                {
                  to: "/events/$eventId",
                  params: { eventId: r.id },
                  className:
                    "w-56 shrink-0 rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
                  children: [
                    e.jsxs("div", {
                      className: "aspect-[4/3] relative",
                      children: [
                        e.jsx("img", {
                          src: r.cover,
                          alt: r.title,
                          className: "w-full h-full object-cover",
                        }),
                        e.jsxs("div", {
                          className:
                            "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                          children: [r.currency || "$", r.price],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "p-3",
                      children: [
                        e.jsx("h3", {
                          className: "font-bold text-sm leading-tight line-clamp-1",
                          children: r.title,
                        }),
                        e.jsx("p", {
                          className: "text-muted-foreground text-xs mt-1",
                          children: r.host,
                        }),
                      ],
                    }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "pt-2 pb-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between px-4 mb-3",
            children: [
              e.jsx("h2", {
                className: "text-lg font-bold tracking-tight text-foreground",
                children: "Now Showing",
              }),
              e.jsx(t, {
                to: "/movies",
                className: "text-sm font-bold text-primary",
                children: "See all",
              }),
            ],
          }),
          e.jsx("div", {
            className: "flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2",
            children: h.map((r) =>
              e.jsxs(
                t,
                {
                  to: "/movies",
                  className: "w-32 shrink-0 block transition-transform active:scale-95",
                  children: [
                    e.jsxs("div", {
                      className:
                        "aspect-[2/3] relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2",
                      children: [
                        e.jsx("img", {
                          src: r.cover,
                          alt: r.title,
                          className: "w-full h-full object-cover",
                        }),
                        e.jsx("div", {
                          className:
                            "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                          children: r.rating,
                        }),
                      ],
                    }),
                    e.jsx("h3", {
                      className: "font-bold text-sm leading-tight line-clamp-1",
                      children: r.title,
                    }),
                    e.jsx("p", {
                      className: "text-muted-foreground text-[10px] mt-0.5",
                      children: r.genre,
                    }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        ],
      }),
      e.jsx("div", {
        className: "w-full pt-2 pb-24",
        children: a.map((r, s) => e.jsx(v, { post: r }, `${r.id}-${s}`)),
      }),
      e.jsx("style", {
        children: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
      }),
    ],
  });
}
function M() {
  const a = i.slice(0, 6),
    r = i.slice(1, 5);
  return e.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      e.jsx(w, {}),
      e.jsx("section", {
        className: "relative",
        children: e.jsxs("div", {
          className: "relative h-[78vh] min-h-[560px] w-full overflow-hidden",
          children: [
            e.jsx("img", {
              src: S,
              alt: "Live event crowd",
              className: "absolute inset-0 h-full w-full object-cover",
            }),
            e.jsx("div", {
              className:
                "absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background",
            }),
            e.jsx("div", {
              className:
                "absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent",
            }),
            e.jsxs("div", {
              className: "relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14",
              children: [
                e.jsxs("span", {
                  className:
                    "inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur",
                  children: [
                    e.jsx(z, { className: "h-3.5 w-3.5 text-primary" }),
                    " Trending across Africa this week",
                  ],
                }),
                e.jsxs("h1", {
                  className: "mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl",
                  children: [
                    "Live the moments that",
                    " ",
                    e.jsx("span", {
                      style: {
                        background: "var(--gradient-primary)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      },
                      children: "move the culture.",
                    }),
                  ],
                }),
                e.jsx("p", {
                  className: "mt-4 max-w-xl text-muted-foreground md:text-lg",
                  children:
                    "Tickets, stories, and after-movies from Africa's best nightlife, festivals, sports and experiences — all in one place.",
                }),
                e.jsxs("div", {
                  className:
                    "mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl",
                  children: [
                    e.jsxs("div", {
                      className: "grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]",
                      children: [
                        e.jsxs("div", {
                          className: "relative",
                          children: [
                            e.jsx(k, {
                              className:
                                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                            }),
                            e.jsx(n, {
                              placeholder: "Events, organizers, artists…",
                              className: "h-12 border-transparent bg-secondary/60 pl-9",
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "relative",
                          children: [
                            e.jsx(F, {
                              className:
                                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                            }),
                            e.jsx(n, {
                              placeholder: "City",
                              className: "h-12 border-transparent bg-secondary/60 pl-9",
                            }),
                          ],
                        }),
                        e.jsx(l, {
                          className: "h-12 rounded-xl px-6",
                          style: { background: "var(--gradient-primary)" },
                          children: "Search",
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "mt-3 flex flex-wrap gap-2 px-1",
                      children: g.map((s) =>
                        e.jsx(
                          "button",
                          {
                            className:
                              "rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                            children: s,
                          },
                          s,
                        ),
                      ),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      e.jsxs("section", {
        className: "mx-auto max-w-7xl px-6 pt-10",
        children: [
          e.jsxs("div", {
            className: "mb-4 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "Stories from recent events",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Live moments from organizers you'll love.",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/feed",
                className: "text-sm text-primary hover:underline",
                children: "Open feed →",
              }),
            ],
          }),
          e.jsx(o, {}),
        ],
      }),
      e.jsxs("section", {
        className: "mx-auto max-w-7xl px-6 pt-8",
        children: [
          e.jsxs("div", {
            className: "mb-4 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "Now showing — cinemas near you",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Movie theaters using Agatike to drop showtimes.",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/movies",
                className: "text-sm text-primary hover:underline",
                children: "All movies →",
              }),
            ],
          }),
          e.jsx(o, { items: j }),
        ],
      }),
      e.jsx(c, {
        title: "Trending events",
        subtitle: "What everyone's talking about right now",
        children: e.jsx(m, { children: a.map((s) => e.jsx(d, { event: s }, s.id)) }),
      }),
      e.jsx(c, {
        title: "Upcoming this weekend",
        subtitle: "Lock your plans in for the next 48 hours",
        children: e.jsx(m, { cols: 4, children: r.map((s) => e.jsx(d, { event: s }, s.id)) }),
      }),
      e.jsxs("section", {
        className: "mx-auto mt-20 max-w-7xl px-6",
        children: [
          e.jsxs("div", {
            className: "mb-6 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "At the movies this week",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Reserved seats and IMAX, straight from your phone.",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/movies",
                className: "text-sm text-primary hover:underline",
                children: "Browse showtimes →",
              }),
            ],
          }),
          e.jsx("div", {
            className: "grid grid-cols-2 gap-5 md:grid-cols-4",
            children: h.map((s) =>
              e.jsxs(
                t,
                {
                  to: "/movies",
                  className: "group block",
                  children: [
                    e.jsxs("div", {
                      className: "relative aspect-[2/3] overflow-hidden rounded-2xl",
                      children: [
                        e.jsx("img", {
                          src: s.cover,
                          alt: s.title,
                          className:
                            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                          loading: "lazy",
                        }),
                        e.jsx("span", {
                          className:
                            "absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur",
                          children: s.rating,
                        }),
                      ],
                    }),
                    e.jsx("p", { className: "mt-3 truncate font-semibold", children: s.title }),
                    e.jsxs("p", {
                      className: "text-xs text-muted-foreground",
                      children: [s.genre, " · ", s.duration],
                    }),
                    e.jsx("p", { className: "mt-1 text-xs text-primary", children: s.cinema }),
                  ],
                },
                s.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        className: "mx-auto mt-20 max-w-7xl px-6",
        children: [
          e.jsxs("div", {
            className: "mb-6 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "Experiences — hike, run, surf",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Outdoor adventures and clubs you can join this week.",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/experiences",
                className: "text-sm text-primary hover:underline",
                children: "Explore all →",
              }),
            ],
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3",
            children: x.slice(0, 3).map((s) =>
              e.jsxs(
                t,
                {
                  to: "/experiences",
                  className:
                    "group overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1",
                  children: [
                    e.jsxs("div", {
                      className: "relative aspect-[4/3] overflow-hidden",
                      children: [
                        e.jsx("img", {
                          src: s.cover,
                          alt: s.title,
                          className:
                            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                          loading: "lazy",
                        }),
                        e.jsx("span", {
                          className:
                            "absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs",
                          children: s.category,
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "p-4",
                      children: [
                        e.jsx("p", { className: "font-semibold", children: s.title }),
                        e.jsxs("p", {
                          className: "text-xs text-muted-foreground",
                          children: [s.host, " · ", s.city],
                        }),
                        e.jsxs("p", {
                          className: "mt-2 text-sm",
                          children: [
                            s.price === 0 ? "Free" : `From ${s.currency || "$"}${s.price}`,
                            " · ",
                            s.duration,
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                s.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        className: "mx-auto mt-20 max-w-7xl px-6",
        children: [
          e.jsxs("div", {
            className: "mb-6 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "Popular organizers",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Africa's most loved creators and venues",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/organizers",
                className: "text-sm text-primary hover:underline",
                children: "See all →",
              }),
            ],
          }),
          e.jsx("div", {
            className: "grid grid-cols-2 gap-4 md:grid-cols-4",
            children: i.slice(0, 4).map((s) =>
              e.jsxs(
                "div",
                {
                  className:
                    "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1",
                  children: [
                    e.jsx("img", {
                      src: s.cover,
                      alt: s.organizer,
                      className: "h-16 w-16 rounded-full object-cover",
                      loading: "lazy",
                    }),
                    e.jsx("p", { className: "mt-4 font-semibold", children: s.organizer }),
                    e.jsxs("p", {
                      className: "text-xs text-muted-foreground",
                      children: ["@", s.organizerHandle, " · ", s.city],
                    }),
                    e.jsxs("div", {
                      className: "mt-3 flex items-center gap-1 text-xs",
                      children: [
                        e.jsx($, { className: "h-3 w-3 fill-primary text-primary" }),
                        " ",
                        s.rating,
                        " ·",
                        " ",
                        (s.attendees * 12).toLocaleString(),
                        " followers",
                      ],
                    }),
                    e.jsx(l, {
                      variant: "outline",
                      className: "mt-4 w-full rounded-full",
                      children: "Follow",
                    }),
                  ],
                },
                s.id,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        className: "mx-auto mt-20 max-w-7xl px-6",
        children: [
          e.jsxs("div", {
            className: "mb-6 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-semibold",
                    children: "Moments from the community",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Photos, videos and reviews from real attendees",
                  }),
                ],
              }),
              e.jsx(t, {
                to: "/feed",
                className: "text-sm text-primary hover:underline",
                children: "See all →",
              }),
            ],
          }),
          e.jsx("div", {
            className: "grid grid-cols-2 gap-3 md:grid-cols-4",
            children: p.slice(0, 4).map((s) =>
              e.jsxs(
                "div",
                {
                  className: "group relative aspect-square overflow-hidden rounded-2xl",
                  children: [
                    e.jsx("img", {
                      src: s.image,
                      alt: s.eventTitle,
                      className:
                        "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                      loading: "lazy",
                    }),
                    e.jsx("div", {
                      className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent",
                    }),
                    e.jsxs("div", {
                      className: "absolute bottom-3 left-3 right-3 text-xs text-white",
                      children: [
                        e.jsxs("p", { className: "font-semibold", children: ["@", s.handle] }),
                        e.jsx("p", { className: "opacity-80 line-clamp-1", children: s.caption }),
                      ],
                    }),
                  ],
                },
                s.id,
              ),
            ),
          }),
        ],
      }),
      e.jsx("section", {
        className: "mx-auto mt-24 max-w-7xl px-6",
        children: e.jsx("div", {
          className: "relative overflow-hidden rounded-3xl border border-border/60 p-10 md:p-16",
          style: { background: "var(--gradient-warm)" },
          children: e.jsxs("div", {
            className: "relative max-w-2xl text-primary-foreground",
            children: [
              e.jsx("h3", {
                className: "text-3xl font-semibold md:text-4xl",
                children: "Selling tickets? Agatike pays out the same week.",
              }),
              e.jsx("p", {
                className: "mt-3 opacity-90",
                children:
                  "Build a branded event page, sell tickets and merch, scan attendees and pull analytics — all in one place.",
              }),
              e.jsxs("div", {
                className: "mt-6 flex flex-wrap gap-3",
                children: [
                  e.jsx(t, {
                    to: "/dashboard",
                    children: e.jsxs(l, {
                      className:
                        "rounded-full bg-background text-foreground hover:bg-background/90",
                      children: [
                        "Open organizer dashboard ",
                        e.jsx(A, { className: "ml-2 h-4 w-4" }),
                      ],
                    }),
                  }),
                  e.jsx(l, {
                    variant: "outline",
                    className:
                      "rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10",
                    children: "See pricing",
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
      e.jsx(y, {}),
    ],
  });
}
function c({ title: a, subtitle: r, children: s }) {
  return e.jsxs("section", {
    className: "mx-auto mt-20 max-w-7xl px-6",
    children: [
      e.jsxs("div", {
        className: "mb-6 flex items-end justify-between",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h2", { className: "text-xl font-semibold", children: a }),
              r && e.jsx("p", { className: "text-sm text-muted-foreground", children: r }),
            ],
          }),
          e.jsx("a", {
            href: "#",
            className: "text-sm text-primary hover:underline",
            children: "View all →",
          }),
        ],
      }),
      s,
    ],
  });
}
function m({ children: a, cols: r = 3 }) {
  const s = r === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return e.jsx("div", { className: `grid grid-cols-1 gap-5 sm:grid-cols-2 ${s}`, children: a });
}
function J() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", { className: "md:hidden", children: e.jsx(L, {}) }),
      e.jsx("div", { className: "hidden md:block", children: e.jsx(M, {}) }),
    ],
  });
}
export { J as component };
