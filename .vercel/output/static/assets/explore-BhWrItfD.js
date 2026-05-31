import {
  q as e,
  g as i,
  L as r,
  M as o,
  m as l,
  u as d,
  n as c,
  t as n,
} from "./index-BbCjida8.js";
import { S as m, I as x } from "./input-Bn2qJlr0.js";
import { B as t } from "./button-BtHMdeJ3.js";
import { S as h } from "./sliders-horizontal-CHxSZqJl.js";
import { M as p } from "./map-pin-C2ftX2X_.js";
function v() {
  return e.jsxs("div", {
    className:
      "min-h-screen bg-background pb-20 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] md:pb-8 shadow-xl",
    children: [
      e.jsx("div", {
        className:
          "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top",
        children: e.jsxs("div", {
          className: "px-4 py-3",
          children: [
            e.jsxs("div", {
              className: "flex gap-2",
              children: [
                e.jsxs("div", {
                  className: "relative flex-1",
                  children: [
                    e.jsx(m, {
                      className:
                        "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                    }),
                    e.jsx(x, {
                      placeholder: "Search events, artists, venues...",
                      className:
                        "h-12 bg-secondary/50 border-transparent pl-10 rounded-2xl text-base shadow-sm focus-visible:ring-primary/50",
                    }),
                  ],
                }),
                e.jsx(t, {
                  variant: "outline",
                  size: "icon",
                  className: "h-12 w-12 rounded-2xl shrink-0 border-border/50",
                  children: e.jsx(h, { className: "h-5 w-5" }),
                }),
              ],
            }),
            e.jsx("div", {
              className: "flex gap-2 overflow-x-auto mt-4 pb-2 hide-scrollbar",
              children: i.map((s, a) =>
                e.jsx(
                  "button",
                  {
                    className: `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${a === 0 ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-secondary-foreground border border-border/40 hover:bg-secondary"}`,
                    children: s,
                  },
                  s,
                ),
              ),
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "px-4 py-6 space-y-8",
        children: [
          e.jsxs(r, {
            to: "/map",
            className:
              "relative h-40 w-full rounded-3xl overflow-hidden group cursor-pointer shadow-[var(--shadow-card)] block",
            children: [
              e.jsx("div", {
                className:
                  "absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10",
              }),
              e.jsx("img", {
                src: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop",
                alt: "Map View",
                className: "w-full h-full object-cover opacity-60 dark:opacity-40",
              }),
              e.jsxs("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center z-20",
                children: [
                  e.jsx("div", {
                    className:
                      "h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-2 group-hover:scale-110 transition-transform",
                    children: e.jsx(o, { className: "h-6 w-6 text-primary-foreground" }),
                  }),
                  e.jsx("span", {
                    className:
                      "font-bold text-foreground bg-background/80 px-3 py-1 rounded-full backdrop-blur text-sm",
                    children: "Explore Map View",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between mb-4",
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-bold tracking-tight",
                    children: "Trending Nearby",
                  }),
                  e.jsx(r, {
                    to: "/",
                    className: "text-sm text-primary font-medium",
                    children: "See all",
                  }),
                ],
              }),
              e.jsx("div", {
                className: "grid grid-cols-2 gap-3",
                children: l
                  .slice(0, 4)
                  .map((s, a) =>
                    e.jsxs(
                      r,
                      {
                        to: "/events/$eventId",
                        params: { eventId: s.id },
                        className: `group relative rounded-3xl overflow-hidden bg-card shadow-[var(--shadow-card)] ${a === 0 || a === 3 ? "aspect-[3/4]" : "aspect-square"}`,
                        children: [
                          e.jsx("img", {
                            src: s.cover,
                            alt: s.title,
                            className:
                              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                          }),
                          e.jsx("div", {
                            className:
                              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
                          }),
                          e.jsxs("div", {
                            className: "absolute bottom-0 left-0 right-0 p-3",
                            children: [
                              e.jsx("div", {
                                className:
                                  "text-[10px] font-bold text-primary mb-1 uppercase tracking-wider",
                                children: s.category,
                              }),
                              e.jsx("h3", {
                                className:
                                  "text-white font-semibold text-sm leading-tight line-clamp-2",
                                children: s.title,
                              }),
                              e.jsxs("div", {
                                className: "text-white/80 text-[10px] mt-1 flex items-center gap-1",
                                children: [e.jsx(p, { className: "h-3 w-3" }), " ", s.city],
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
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between mb-4",
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-bold tracking-tight",
                    children: "Popular Organizers",
                  }),
                  e.jsx(r, {
                    to: "/organizers",
                    className: "text-sm font-bold text-primary",
                    children: "See all",
                  }),
                ],
              }),
              e.jsx("div", {
                className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2",
                children: d.map((s) =>
                  e.jsxs(
                    r,
                    {
                      to: "/organizers",
                      className:
                        "w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block",
                      children: [
                        e.jsx("img", {
                          src: s.avatar,
                          alt: s.name,
                          className: "w-16 h-16 rounded-full object-cover mb-3",
                        }),
                        e.jsx("p", {
                          className: "font-semibold text-sm leading-tight line-clamp-1",
                          children: s.name,
                        }),
                        e.jsxs("p", {
                          className: "text-[10px] text-muted-foreground mt-1 line-clamp-1",
                          children: ["@", s.handle],
                        }),
                        e.jsx(t, {
                          size: "sm",
                          className:
                            "mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider",
                          onClick: (a) => a.preventDefault(),
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
            children: [
              e.jsx("div", {
                className: "flex items-center justify-between mb-4",
                children: e.jsx("h2", {
                  className: "text-xl font-bold tracking-tight",
                  children: "Upcoming Events",
                }),
              }),
              e.jsx("div", {
                className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2",
                children: l.map((s) =>
                  e.jsxs(
                    r,
                    {
                      to: "/events/$eventId",
                      params: { eventId: s.id },
                      className:
                        "w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
                      children: [
                        e.jsxs("div", {
                          className: "aspect-[4/3] relative",
                          children: [
                            e.jsx("img", {
                              src: s.cover,
                              alt: s.title,
                              className: "w-full h-full object-cover",
                            }),
                            e.jsxs("div", {
                              className:
                                "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                              children: [s.currency || "$", s.price],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "p-3",
                          children: [
                            e.jsx("p", {
                              className: "font-semibold text-sm leading-tight line-clamp-2",
                              children: s.title,
                            }),
                            e.jsxs("div", {
                              className:
                                "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
                              children: [
                                e.jsx("span", { className: "truncate", children: s.date }),
                                e.jsx("span", { children: "•" }),
                                e.jsx("span", { className: "truncate", children: s.city }),
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
            children: [
              e.jsx("div", {
                className: "flex items-center justify-between mb-4",
                children: e.jsx("h2", {
                  className: "text-xl font-bold tracking-tight",
                  children: "Unique Experiences",
                }),
              }),
              e.jsx("div", {
                className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4",
                children: c.map((s) =>
                  e.jsxs(
                    r,
                    {
                      to: "/events/$eventId",
                      params: { eventId: s.id },
                      className:
                        "w-64 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95",
                      children: [
                        e.jsxs("div", {
                          className: "aspect-video relative",
                          children: [
                            e.jsx("img", {
                              src: s.cover,
                              alt: s.title,
                              className: "w-full h-full object-cover",
                            }),
                            e.jsxs("div", {
                              className:
                                "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium",
                              children: [s.currency || "$", s.price],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "p-4",
                          children: [
                            e.jsx("h3", {
                              className: "font-semibold text-sm line-clamp-1",
                              children: s.title,
                            }),
                            e.jsx("p", {
                              className: "text-muted-foreground text-xs mt-1",
                              children: s.host,
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
            children: [
              e.jsx("div", {
                className: "flex items-center justify-between mb-4",
                children: e.jsx("h2", {
                  className: "text-xl font-bold tracking-tight",
                  children: "Now Showing",
                }),
              }),
              e.jsx("div", {
                className: "flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4",
                children: n.map((s) =>
                  e.jsxs(
                    r,
                    {
                      to: "/movies",
                      className: "w-32 shrink-0 block transition-transform active:scale-95",
                      children: [
                        e.jsxs("div", {
                          className:
                            "aspect-[2/3] relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2",
                          children: [
                            e.jsx("img", {
                              src: s.cover,
                              alt: s.title,
                              className: "w-full h-full object-cover",
                            }),
                            e.jsx("div", {
                              className:
                                "absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                              children: s.rating,
                            }),
                          ],
                        }),
                        e.jsx("h3", {
                          className: "font-semibold text-sm leading-tight line-clamp-1",
                          children: s.title,
                        }),
                        e.jsx("p", {
                          className: "text-muted-foreground text-[10px] mt-0.5",
                          children: s.genre,
                        }),
                      ],
                    },
                    s.id,
                  ),
                ),
              }),
            ],
          }),
        ],
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
export { v as component };
