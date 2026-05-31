import { l as n, q as e, L as d, m as v } from "./index-BbCjida8.js";
import { B as t } from "./button-BtHMdeJ3.js";
import { S as x } from "./settings-DI2M_FYs.js";
import { P as h } from "./plus-DEJHAl15.js";
import { S as u } from "./scan-line-CkHDv9zx.js";
import { C as y } from "./chevron-right-Nht500oB.js";
import { T as i } from "./ticket-BfFChqFx.js";
import { B as w } from "./building-2-BdKFUmBj.js";
import { C as k } from "./calendar-days-Bc2SBC-l.js";
import { U as $ } from "./users-Cp-Hr28i.js";
import { S as C } from "./shopping-bag-BtM_9esQ.js";
import { C as M } from "./crown-BCGC55Ge.js";
import { W as S } from "./wallet-DciablDh.js";
import { E as P } from "./eye-BR3N6Y_-.js";
const L = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "M18 17V9", key: "2bz60n" }],
    ["path", { d: "M13 17V5", key: "1frdt8" }],
    ["path", { d: "M8 17v-3", key: "17ska0" }],
  ],
  p = n("chart-column", L);
const A = [
    ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
    ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }],
  ],
  b = n("dollar-sign", A);
const _ = [
    ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
    ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
    ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
    ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }],
  ],
  E = n("layout-dashboard", _);
const T = [
    [
      "path",
      {
        d: "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
        key: "q8bfy3",
      },
    ],
    ["path", { d: "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14", key: "1853fq" }],
    ["path", { d: "M8 6v8", key: "15ugcq" }],
  ],
  B = n("megaphone", T);
const D = [
    ["path", { d: "M16 7h6v6", key: "box55l" }],
    ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }],
  ],
  g = n("trending-up", D);
function V() {
  return e.jsxs("div", {
    className: "min-h-screen bg-background pb-24 pt-safe-top text-foreground",
    children: [
      e.jsxs("div", {
        className:
          "px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-30 flex items-center justify-between",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "font-bold text-xl tracking-tight",
                children: "Organizer Mode",
              }),
              e.jsx("p", {
                className: "text-xs text-muted-foreground",
                children: "gatike_user_admin",
              }),
            ],
          }),
          e.jsx("button", {
            className: "p-2 -mr-2",
            children: e.jsx(x, { className: "h-6 w-6 text-foreground" }),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "px-4 py-2 space-y-6",
        children: [
          e.jsxs("div", {
            className:
              "rounded-3xl p-6 relative overflow-hidden bg-card border border-border/40 shadow-xl",
            children: [
              e.jsx("div", {
                className:
                  "absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none",
              }),
              e.jsxs("div", {
                className: "flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1",
                children: [e.jsx(b, { className: "h-4 w-4" }), " Total Revenue (30d)"],
              }),
              e.jsx("h2", {
                className: "text-4xl font-bold tracking-tight mb-2",
                children: "$48,920",
              }),
              e.jsxs("div", {
                className: "flex items-center gap-1 text-primary text-sm font-bold",
                children: [e.jsx(g, { className: "h-4 w-4" }), " +18.4% vs last month"],
              }),
              e.jsx("div", {
                className: "mt-6 h-16 w-full flex items-end justify-between",
                children: [4, 7, 5, 8, 6, 9, 12, 10, 14, 11, 15, 13].map((s, a) =>
                  e.jsx(
                    "div",
                    {
                      className: "w-1.5 bg-primary/80 rounded-t-sm",
                      style: { height: `${s * 10}%` },
                    },
                    a,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              e.jsxs(d, {
                to: "/create-event",
                className:
                  "bg-primary text-primary-foreground rounded-3xl p-4 flex flex-col items-start gap-4 shadow-[var(--shadow-glow)] transition-transform active:scale-95",
                children: [
                  e.jsx("div", {
                    className: "bg-white/20 p-3 rounded-2xl",
                    children: e.jsx(h, { className: "h-6 w-6" }),
                  }),
                  e.jsx("span", { className: "font-bold", children: "Create Event" }),
                ],
              }),
              e.jsxs(d, {
                to: "/scanner",
                className:
                  "bg-secondary text-foreground rounded-3xl p-4 flex flex-col items-start gap-4 border border-border/40 shadow-sm transition-transform active:scale-95",
                children: [
                  e.jsx("div", {
                    className: "bg-background p-3 rounded-2xl border border-border/40",
                    children: e.jsx(u, { className: "h-6 w-6 text-foreground" }),
                  }),
                  e.jsx("span", { className: "font-bold", children: "Scan Tickets" }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between mb-4",
                children: [
                  e.jsx("h3", {
                    className: "font-bold text-lg tracking-tight",
                    children: "Live Now",
                  }),
                  e.jsx("span", { className: "animate-pulse h-2 w-2 bg-primary rounded-full" }),
                ],
              }),
              e.jsxs("div", {
                className: "rounded-3xl border border-border/40 bg-card p-5",
                children: [
                  e.jsxs("div", {
                    className: "flex justify-between items-center mb-4",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("h4", {
                            className: "font-bold text-base",
                            children: "Afrobeats Night Live",
                          }),
                          e.jsx("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Eko Convention Center",
                          }),
                        ],
                      }),
                      e.jsx(t, {
                        size: "icon",
                        variant: "ghost",
                        className: "rounded-full",
                        children: e.jsx(y, { className: "h-5 w-5" }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "space-y-4",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsxs("div", {
                            className: "flex justify-between text-xs mb-1 font-medium",
                            children: [
                              e.jsx("span", { children: "Checked In" }),
                              e.jsx("span", { className: "text-primary", children: "842 / 1,200" }),
                            ],
                          }),
                          e.jsx("div", {
                            className: "h-2 w-full bg-secondary rounded-full overflow-hidden",
                            children: e.jsx("div", { className: "h-full bg-primary w-[70%]" }),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "grid grid-cols-2 gap-4 pt-2",
                        children: [
                          e.jsxs("div", {
                            className: "bg-secondary rounded-2xl p-3",
                            children: [
                              e.jsx("p", {
                                className: "text-xs text-muted-foreground mb-1",
                                children: "Bar Sales",
                              }),
                              e.jsx("p", { className: "font-bold", children: "$3,420" }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "bg-secondary rounded-2xl p-3",
                            children: [
                              e.jsx("p", {
                                className: "text-xs text-muted-foreground mb-1",
                                children: "VIP Scanned",
                              }),
                              e.jsx("p", { className: "font-bold", children: "45 / 50" }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              e.jsxs("div", {
                className: "rounded-3xl border border-border/40 bg-card p-4",
                children: [
                  e.jsx(i, { className: "h-5 w-5 text-muted-foreground mb-2" }),
                  e.jsx("p", { className: "text-2xl font-bold mb-1", children: "1,284" }),
                  e.jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: "Tickets Sold",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "rounded-3xl border border-border/40 bg-card p-4",
                children: [
                  e.jsx(p, { className: "h-5 w-5 text-muted-foreground mb-2" }),
                  e.jsx("p", { className: "text-2xl font-bold mb-1", children: "92.3k" }),
                  e.jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: "Page Views",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const z = [
  { label: "Dashboard", icon: E, active: !0 },
  { label: "Workspaces", icon: w },
  { label: "Events", icon: k },
  { label: "Tickets", icon: i },
  { label: "Analytics", icon: p },
  { label: "Attendees", icon: $ },
  { label: "Scanning", icon: u },
  { label: "Merchandise", icon: C },
  { label: "VIP Access", icon: M },
  { label: "Campaigns", icon: B },
  { label: "Withdrawals", icon: S },
  { label: "Settings", icon: x },
];
function W() {
  return e.jsx("div", {
    className: "min-h-screen bg-secondary/30",
    children: e.jsxs("div", {
      className: "flex",
      children: [
        e.jsxs("aside", {
          className:
            "sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:block",
          children: [
            e.jsxs(d, {
              to: "/",
              className: "mb-6 flex items-center gap-2 px-2",
              children: [
                e.jsx("div", {
                  className:
                    "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
                  style: { background: "var(--gradient-primary)" },
                  children: "A",
                }),
                e.jsx("span", { className: "text-lg font-semibold", children: "Agatike" }),
              ],
            }),
            e.jsx("nav", {
              className: "space-y-1 text-sm",
              children: z.map((s) => {
                const a =
                    s.label === "Workspaces"
                      ? "/workspaces"
                      : s.label === "Scanning"
                        ? "/scanner"
                        : null,
                  r = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${s.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`;
                return a
                  ? e.jsxs(
                      d,
                      {
                        to: a,
                        className: r,
                        children: [e.jsx(s.icon, { className: "h-4 w-4" }), " ", s.label],
                      },
                      s.label,
                    )
                  : e.jsxs(
                      "button",
                      {
                        className: r,
                        children: [e.jsx(s.icon, { className: "h-4 w-4" }), " ", s.label],
                      },
                      s.label,
                    );
              }),
            }),
            e.jsxs("div", {
              className: "mt-8 rounded-2xl border border-border/60 p-4",
              children: [
                e.jsx("p", { className: "text-sm font-semibold", children: "Upgrade to Pro" }),
                e.jsx("p", {
                  className: "mt-1 text-xs text-muted-foreground",
                  children: "Branded pages, marketing & advanced analytics.",
                }),
                e.jsx(t, {
                  className: "mt-3 w-full rounded-full",
                  style: { background: "var(--gradient-primary)" },
                  children: "Upgrade",
                }),
              ],
            }),
          ],
        }),
        e.jsxs("main", {
          className: "flex-1 p-6 lg:p-10",
          children: [
            e.jsxs("header", {
              className: "flex flex-wrap items-center justify-between gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Welcome back, Nala",
                    }),
                    e.jsx("h1", {
                      className: "text-2xl font-semibold",
                      children: "Here's what's happening today",
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(t, { variant: "outline", className: "rounded-full", children: "Export" }),
                    e.jsx(d, {
                      to: "/workspaces",
                      children: e.jsx(t, {
                        variant: "outline",
                        className: "rounded-full",
                        children: "Workspaces",
                      }),
                    }),
                    e.jsx(d, {
                      to: "/create-event",
                      children: e.jsxs(t, {
                        className: "rounded-full shadow-[var(--shadow-glow)]",
                        style: { background: "var(--gradient-primary)" },
                        children: [e.jsx(h, { className: "mr-1 h-4 w-4" }), " New event"],
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className: "mt-8 grid grid-cols-1 gap-4 md:grid-cols-4",
              children: [
                { label: "Revenue (30d)", value: "$48,920", delta: "+18.4%", icon: b },
                { label: "Tickets sold", value: "1,284", delta: "+9.1%", icon: i },
                { label: "Page views", value: "92,310", delta: "+24%", icon: P },
                { label: "Conversion", value: "6.8%", delta: "+1.2pt", icon: g },
              ].map((s) =>
                e.jsxs(
                  "div",
                  {
                    className:
                      "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          e.jsx("p", {
                            className: "text-xs uppercase tracking-wider text-muted-foreground",
                            children: s.label,
                          }),
                          e.jsx(s.icon, { className: "h-4 w-4 text-primary" }),
                        ],
                      }),
                      e.jsx("p", { className: "mt-2 text-2xl font-semibold", children: s.value }),
                      e.jsxs("p", {
                        className: "mt-1 text-xs text-primary",
                        children: [s.delta, " vs last period"],
                      }),
                    ],
                  },
                  s.label,
                ),
              ),
            }),
            e.jsxs("div", {
              className: "mt-6 grid gap-4 lg:grid-cols-3",
              children: [
                e.jsxs("div", {
                  className: "rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        e.jsx("h3", { className: "font-semibold", children: "Ticket sales" }),
                        e.jsx("div", {
                          className: "flex gap-1 text-xs",
                          children: ["7d", "30d", "90d"].map((s, a) =>
                            e.jsx(
                              "button",
                              {
                                className: `rounded-full px-3 py-1 ${a === 1 ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`,
                                children: s,
                              },
                              s,
                            ),
                          ),
                        }),
                      ],
                    }),
                    e.jsx("div", { className: "mt-6 h-56", children: e.jsx(R, {}) }),
                  ],
                }),
                e.jsxs("div", {
                  className: "rounded-2xl border border-border/60 bg-card p-6",
                  children: [
                    e.jsx("h3", { className: "font-semibold", children: "Live event" }),
                    e.jsx("p", {
                      className: "mt-1 text-xs text-muted-foreground",
                      children: "Afrobeats Night Live · Eko",
                    }),
                    e.jsxs("div", {
                      className: "mt-4 space-y-3",
                      children: [
                        e.jsx(c, { label: "Checked in", value: "842 / 1,200", pct: 70 }),
                        e.jsx(c, { label: "Bar revenue", value: "$3,420", pct: 48 }),
                        e.jsx(c, { label: "Merch sold", value: "186", pct: 62 }),
                      ],
                    }),
                    e.jsx(t, {
                      variant: "outline",
                      className: "mt-5 w-full rounded-full",
                      children: "Open scanner",
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs("div", {
              className: "mt-6 rounded-2xl border border-border/60 bg-card",
              children: [
                e.jsxs("div", {
                  className: "flex items-center justify-between p-6",
                  children: [
                    e.jsx("h3", { className: "font-semibold", children: "Recent orders" }),
                    e.jsx("button", {
                      className: "text-sm text-primary hover:underline",
                      children: "View all",
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "divide-y divide-border/60",
                  children: v
                    .slice(0, 5)
                    .map((s, a) =>
                      e.jsxs(
                        "div",
                        {
                          className: "flex items-center gap-4 px-6 py-3 text-sm",
                          children: [
                            e.jsx("img", {
                              src: s.cover,
                              className: "h-10 w-10 rounded-lg object-cover",
                              alt: "",
                            }),
                            e.jsxs("div", {
                              className: "min-w-0 flex-1",
                              children: [
                                e.jsx("p", {
                                  className: "truncate font-medium",
                                  children: s.title,
                                }),
                                e.jsxs("p", {
                                  className: "text-xs text-muted-foreground",
                                  children: [s.organizer, " · ", s.date],
                                }),
                              ],
                            }),
                            e.jsxs("span", {
                              className: "hidden md:inline text-xs text-muted-foreground",
                              children: ["x", 2 + a],
                            }),
                            e.jsxs("span", {
                              className: "font-semibold",
                              children: ["$", (s.price * (2 + a)).toFixed(0)],
                            }),
                            e.jsx("span", {
                              className:
                                "rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground",
                              children: "Paid",
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
              className: "mt-12",
              children: [
                e.jsx("div", {
                  className: "flex items-end justify-between",
                  children: e.jsxs("div", {
                    children: [
                      e.jsx("h2", { className: "text-xl font-semibold", children: "Pricing" }),
                      e.jsx("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Transparent fees. Pay only when you sell.",
                      }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "mt-5 grid gap-4 md:grid-cols-3",
                  children: [
                    {
                      name: "Free",
                      price: "$0",
                      desc: "Up to 30 attendees",
                      features: ["Free scanning", "Free withdrawals", "Email support"],
                    },
                    {
                      name: "Pro",
                      price: "$29/mo",
                      featured: !0,
                      desc: "For growing organizers",
                      features: [
                        "Branded event pages",
                        "Marketing tools",
                        "Advanced analytics",
                        "Priority support",
                      ],
                    },
                    {
                      name: "Enterprise",
                      price: "Custom",
                      desc: "Stadiums, festivals, conferences",
                      features: [
                        "Dedicated success team",
                        "API access",
                        "Custom integrations",
                        "On-site staff",
                      ],
                    },
                  ].map((s) =>
                    e.jsxs(
                      "div",
                      {
                        className: `relative rounded-3xl border p-6 ${s.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"} bg-card`,
                        children: [
                          s.featured &&
                            e.jsx("span", {
                              className:
                                "absolute -top-3 left-6 rounded-full px-3 py-1 text-xs text-primary-foreground",
                              style: { background: "var(--gradient-primary)" },
                              children: "Most popular",
                            }),
                          e.jsx("p", {
                            className: "text-sm text-muted-foreground",
                            children: s.name,
                          }),
                          e.jsx("p", {
                            className: "mt-1 text-3xl font-semibold",
                            children: s.price,
                          }),
                          e.jsx("p", {
                            className: "mt-1 text-xs text-muted-foreground",
                            children: s.desc,
                          }),
                          e.jsx("ul", {
                            className: "mt-5 space-y-2 text-sm",
                            children: s.features.map((a) =>
                              e.jsxs(
                                "li",
                                {
                                  className: "flex items-center gap-2",
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-primary",
                                      children: "✓",
                                    }),
                                    " ",
                                    a,
                                  ],
                                },
                                a,
                              ),
                            ),
                          }),
                          e.jsx(t, {
                            className: `mt-6 w-full rounded-full ${s.featured ? "" : "bg-foreground text-background hover:bg-foreground/90"}`,
                            style: s.featured ? { background: "var(--gradient-primary)" } : void 0,
                            children: s.featured
                              ? "Start Pro"
                              : s.name === "Enterprise"
                                ? "Contact sales"
                                : "Get started",
                          }),
                        ],
                      },
                      s.name,
                    ),
                  ),
                }),
              ],
            }),
            e.jsxs("section", {
              className: "mt-12 rounded-3xl border border-border/60 bg-card p-6",
              children: [
                e.jsxs("div", {
                  className: "flex flex-wrap items-center justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("h2", {
                          className: "text-xl font-semibold",
                          children: "Create event",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-muted-foreground",
                          children: "A 7-step wizard, designed for speed.",
                        }),
                      ],
                    }),
                    e.jsx(t, {
                      className: "rounded-full",
                      style: { background: "var(--gradient-primary)" },
                      children: "Resume draft",
                    }),
                  ],
                }),
                e.jsx("ol", {
                  className: "mt-6 grid gap-3 md:grid-cols-7",
                  children: [
                    "Details",
                    "Tickets",
                    "Venue",
                    "Media",
                    "Merchandise",
                    "VIP access",
                    "Publish",
                  ].map((s, a) =>
                    e.jsxs(
                      "li",
                      {
                        className: `rounded-2xl border p-3 text-xs ${a < 3 ? "border-primary bg-accent/40" : "border-border/60 bg-background"}`,
                        children: [
                          e.jsxs("p", {
                            className: "text-muted-foreground",
                            children: ["Step ", a + 1],
                          }),
                          e.jsx("p", {
                            className: "mt-1 font-medium text-foreground",
                            children: s,
                          }),
                        ],
                      },
                      s,
                    ),
                  ),
                }),
              ],
            }),
            e.jsxs("p", {
              className: "mt-8 text-center text-xs text-muted-foreground",
              children: [
                "Need to scan?",
                " ",
                e.jsx(d, {
                  to: "/scanner",
                  className: "text-primary hover:underline",
                  children: "Open the mobile scanner →",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function c({ label: s, value: a, pct: r }) {
  return e.jsxs("div", {
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between text-xs",
        children: [
          e.jsx("span", { className: "text-muted-foreground", children: s }),
          e.jsx("span", { className: "font-medium", children: a }),
        ],
      }),
      e.jsx("div", {
        className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary",
        children: e.jsx("div", {
          className: "h-full rounded-full",
          style: { width: `${r}%`, background: "var(--gradient-primary)" },
        }),
      }),
    ],
  });
}
function R() {
  const s = [12, 28, 22, 40, 36, 52, 48, 64, 58, 72, 80, 76, 92, 88],
    a = Math.max(...s),
    r = 600,
    l = 220,
    f = r / (s.length - 1),
    o = s.map((N, m) => `${m === 0 ? "M" : "L"} ${m * f} ${l - (N / a) * (l - 20)}`).join(" "),
    j = `${o} L ${r} ${l} L 0 ${l} Z`;
  return e.jsxs("svg", {
    viewBox: `0 0 ${r} ${l}`,
    className: "h-full w-full",
    children: [
      e.jsx("defs", {
        children: e.jsxs("linearGradient", {
          id: "g",
          x1: "0",
          x2: "0",
          y1: "0",
          y2: "1",
          children: [
            e.jsx("stop", { offset: "0%", stopColor: "oklch(0.7 0.2 45)", stopOpacity: "0.35" }),
            e.jsx("stop", { offset: "100%", stopColor: "oklch(0.7 0.2 45)", stopOpacity: "0" }),
          ],
        }),
      }),
      e.jsx("path", { d: j, fill: "url(#g)" }),
      e.jsx("path", {
        d: o,
        fill: "none",
        stroke: "oklch(0.7 0.2 45)",
        strokeWidth: "2.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ],
  });
}
function se() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", { className: "md:hidden", children: e.jsx(V, {}) }),
      e.jsx("div", { className: "hidden md:block", children: e.jsx(W, {}) }),
    ],
  });
}
export { se as component };
