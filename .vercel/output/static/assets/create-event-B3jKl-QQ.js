import { l as S, B as T, w as g, g as N, q as e, L as b } from "./index-BbCjida8.js";
import { B as c } from "./button-BtHMdeJ3.js";
import { I as o } from "./input-Bn2qJlr0.js";
import { L as x } from "./label-MewfGgAd.js";
import { T as k } from "./textarea-BuTZw7wx.js";
import { C as V } from "./check-GbEytpJN.js";
import { A as C } from "./arrow-left-CHuZXlQs.js";
import { I as B } from "./image-CnMZ8cHR.js";
import { C as M } from "./crown-BCGC55Ge.js";
import { M as P } from "./map-pin-C2ftX2X_.js";
import { N as I } from "./Navbar-8zxmLK7V.js";
import { S as q, A as L } from "./sparkles-e08jvUQW.js";
import { P as D } from "./plus-DEJHAl15.js";
import { S as R } from "./shopping-bag-BtM_9esQ.js";
import { C as _ } from "./calendar-Ccx9if8g.js";
const $ = [
    ["path", { d: "M10 11v6", key: "nco0om" }],
    ["path", { d: "M14 11v6", key: "outv1u" }],
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
    ["path", { d: "M3 6h18", key: "d0wm0j" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }],
  ],
  E = S("trash-2", $);
const F = [
    ["path", { d: "M12 3v12", key: "1x0j5s" }],
    ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ],
  z = S("upload", F),
  f = ["Basics", "Media", "Tickets", "Venue", "Publish"];
function G() {
  T();
  const [r, l] = g.useState(0),
    [t, d] = g.useState({
      title: "",
      category: N[0],
      description: "",
      date: "",
      time: "",
      venue: "",
      city: "",
      coverPreview: "",
      published: !1,
    }),
    [s, n] = g.useState([
      { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
    ]),
    u = (a, m) => d({ ...t, [a]: m }),
    j = (a) => {
      const m = a.target.files?.[0];
      if (!m) return;
      const h = URL.createObjectURL(m);
      u("coverPreview", h);
    };
  if (t.published)
    return e.jsxs("div", {
      className:
        "min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center",
      children: [
        e.jsx("div", {
          className: "h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6",
          children: e.jsx("div", {
            className:
              "h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]",
            children: e.jsx(V, { className: "h-8 w-8 text-primary-foreground" }),
          }),
        }),
        e.jsx("h1", {
          className: "text-3xl font-bold tracking-tight mb-2",
          children: "Event Published!",
        }),
        e.jsxs("p", {
          className: "text-muted-foreground mb-8",
          children: ['"', t.title, '" is now live and ready for tickets.'],
        }),
        e.jsx(b, {
          to: "/events/$eventId",
          params: { eventId: "1" },
          className: "w-full",
          children: e.jsx(c, {
            className: "w-full h-12 rounded-full font-bold text-lg mb-3",
            children: "View Event Page",
          }),
        }),
        e.jsx(b, {
          to: "/dashboard",
          className: "w-full",
          children: e.jsx(c, {
            variant: "outline",
            className: "w-full h-12 rounded-full font-bold text-lg",
            children: "Back to Dashboard",
          }),
        }),
      ],
    });
  const y = () => l(Math.min(f.length - 1, r + 1)),
    w = () => l(Math.max(0, r - 1));
  return e.jsxs("div", {
    className: "min-h-screen bg-background pb-24 pt-safe-top",
    children: [
      e.jsxs("div", {
        className:
          "px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30",
        children: [
          e.jsx(b, {
            to: "/dashboard",
            className: "p-2 -ml-2 text-foreground",
            children: e.jsx(C, { className: "h-6 w-6" }),
          }),
          e.jsx("div", {
            className: "flex gap-1 items-center",
            children: f.map((a, m) =>
              e.jsx(
                "div",
                {
                  className: `h-2 w-2 rounded-full transition-all ${m === r ? "w-6 bg-primary" : m < r ? "bg-primary/50" : "bg-border"}`,
                },
                m,
              ),
            ),
          }),
          e.jsx("button", {
            className: "text-primary font-bold text-sm p-2 -mr-2",
            children: "Save",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "px-4 py-6",
        children: [
          e.jsx("h1", { className: "text-2xl font-bold tracking-tight mb-1", children: f[r] }),
          e.jsxs("p", {
            className: "text-sm text-muted-foreground mb-8",
            children: [
              r === 0 && "Let's start with the essential details.",
              r === 1 && "Add visuals to make your event stand out.",
              r === 2 && "Set up ticket tiers and pricing.",
              r === 3 && "Where is the magic happening?",
              r === 4 && "Review and make it live.",
            ],
          }),
          e.jsxs("div", {
            className: "space-y-6",
            children: [
              r === 0 &&
                e.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { className: "text-base font-semibold", children: "Event Title" }),
                        e.jsx(o, {
                          value: t.title,
                          onChange: (a) => u("title", a.target.value),
                          placeholder: "AfroFuture Festival",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent text-lg px-4",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { className: "text-base font-semibold", children: "Category" }),
                        e.jsx("select", {
                          value: t.category,
                          onChange: (a) => u("category", a.target.value),
                          className:
                            "mt-2 h-14 w-full rounded-2xl bg-secondary/50 border-transparent text-base px-4",
                          children: N.map((a) => e.jsx("option", { children: a }, a)),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "grid grid-cols-2 gap-4",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx(x, { className: "text-base font-semibold", children: "Date" }),
                            e.jsx(o, {
                              type: "date",
                              value: t.date,
                              onChange: (a) => u("date", a.target.value),
                              className:
                                "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          children: [
                            e.jsx(x, { className: "text-base font-semibold", children: "Time" }),
                            e.jsx(o, {
                              type: "time",
                              value: t.time,
                              onChange: (a) => u("time", a.target.value),
                              className:
                                "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { className: "text-base font-semibold", children: "Description" }),
                        e.jsx(k, {
                          rows: 4,
                          value: t.description,
                          onChange: (a) => u("description", a.target.value),
                          placeholder: "Tell people what to expect...",
                          className:
                            "mt-2 rounded-2xl bg-secondary/50 border-transparent p-4 text-base",
                        }),
                      ],
                    }),
                  ],
                }),
              r === 1 &&
                e.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    e.jsx(x, { className: "text-base font-semibold", children: "Cover Media" }),
                    e.jsxs("label", {
                      className:
                        "block relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 transition active:scale-95 cursor-pointer",
                      children: [
                        t.coverPreview
                          ? e.jsx("img", {
                              src: t.coverPreview,
                              alt: "cover",
                              className: "h-full w-full object-cover",
                            })
                          : e.jsxs("div", {
                              className:
                                "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center",
                              children: [
                                e.jsx(B, { className: "h-10 w-10 mb-4 opacity-50" }),
                                e.jsx("p", {
                                  className: "font-semibold text-foreground mb-1",
                                  children: "Tap to upload poster",
                                }),
                                e.jsx("p", {
                                  className: "text-xs",
                                  children: "Supports Images & Vertical Video",
                                }),
                              ],
                            }),
                        e.jsx("input", {
                          type: "file",
                          accept: "image/*,video/*",
                          hidden: !0,
                          onChange: j,
                        }),
                      ],
                    }),
                  ],
                }),
              r === 2 &&
                e.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    s.map((a) =>
                      e.jsxs(
                        "div",
                        {
                          className:
                            "rounded-3xl border border-border/40 bg-card p-4 shadow-sm relative overflow-hidden",
                          children: [
                            a.type === "vip" &&
                              e.jsx("div", {
                                className:
                                  "absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl font-bold text-[10px] uppercase",
                                children: "VIP",
                              }),
                            e.jsxs("div", {
                              className: "grid gap-3 pt-2",
                              children: [
                                e.jsx(o, {
                                  value: a.name,
                                  onChange: (m) =>
                                    n(
                                      s.map((h) =>
                                        h.id === a.id ? { ...h, name: m.target.value } : h,
                                      ),
                                    ),
                                  placeholder: "Ticket Name",
                                  className:
                                    "h-12 rounded-xl bg-secondary/50 border-transparent font-bold",
                                }),
                                e.jsxs("div", {
                                  className: "grid grid-cols-2 gap-3",
                                  children: [
                                    e.jsxs("div", {
                                      className: "relative",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold",
                                          children: "$",
                                        }),
                                        e.jsx(o, {
                                          type: "number",
                                          value: a.price,
                                          onChange: (m) =>
                                            n(
                                              s.map((h) =>
                                                h.id === a.id
                                                  ? { ...h, price: Number(m.target.value) }
                                                  : h,
                                              ),
                                            ),
                                          className:
                                            "h-12 rounded-xl bg-secondary/50 border-transparent pl-8 font-bold",
                                        }),
                                      ],
                                    }),
                                    e.jsx(o, {
                                      type: "number",
                                      value: a.quantity,
                                      onChange: (m) =>
                                        n(
                                          s.map((h) =>
                                            h.id === a.id
                                              ? { ...h, quantity: Number(m.target.value) }
                                              : h,
                                          ),
                                        ),
                                      placeholder: "Qty",
                                      className:
                                        "h-12 rounded-xl bg-secondary/50 border-transparent font-bold",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx(c, {
                              variant: "ghost",
                              className:
                                "w-full mt-2 text-destructive hover:bg-destructive/10 h-10 rounded-xl",
                              onClick: () => n(s.filter((m) => m.id !== a.id)),
                              children: "Remove",
                            }),
                          ],
                        },
                        a.id,
                      ),
                    ),
                    e.jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        e.jsx(c, {
                          variant: "outline",
                          className: "flex-1 rounded-2xl h-12 border-dashed font-bold",
                          onClick: () =>
                            n([
                              ...s,
                              {
                                id: crypto.randomUUID(),
                                name: "General Admission",
                                price: 25,
                                quantity: 100,
                                type: "paid",
                              },
                            ]),
                          children: "+ Paid Ticket",
                        }),
                        e.jsxs(c, {
                          variant: "outline",
                          className:
                            "flex-1 rounded-2xl h-12 border-dashed font-bold border-primary text-primary hover:bg-primary/10",
                          onClick: () =>
                            n([
                              ...s,
                              {
                                id: crypto.randomUUID(),
                                name: "VIP Pass",
                                price: 100,
                                quantity: 20,
                                type: "vip",
                              },
                            ]),
                          children: [e.jsx(M, { className: "h-4 w-4 mr-2" }), " VIP Pass"],
                        }),
                      ],
                    }),
                  ],
                }),
              r === 3 &&
                e.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { className: "text-base font-semibold", children: "Venue Name" }),
                        e.jsx(o, {
                          value: t.venue,
                          onChange: (a) => u("venue", a.target.value),
                          placeholder: "e.g. BK Arena",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { className: "text-base font-semibold", children: "City" }),
                        e.jsx(o, {
                          value: t.city,
                          onChange: (a) => u("city", a.target.value),
                          placeholder: "e.g. Kigali, RW",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className:
                        "aspect-[4/3] rounded-3xl overflow-hidden bg-secondary relative mt-4",
                      children: [
                        e.jsx("div", { className: "absolute inset-0 bg-primary/10" }),
                        e.jsxs("div", {
                          className:
                            "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground",
                          children: [
                            e.jsx(P, { className: "h-8 w-8 mb-2 opacity-50" }),
                            e.jsx("p", {
                              className: "font-semibold text-foreground",
                              children: "Interactive Map Preview",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              r === 4 &&
                e.jsx("div", {
                  className: "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: e.jsxs("div", {
                    className: "rounded-3xl border border-border/40 overflow-hidden bg-card",
                    children: [
                      e.jsxs("div", {
                        className: "aspect-[4/3] bg-secondary relative",
                        children: [
                          t.coverPreview &&
                            e.jsx("img", {
                              src: t.coverPreview,
                              className: "w-full h-full object-cover",
                            }),
                          e.jsx("div", {
                            className:
                              "absolute top-3 left-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md",
                            children: t.category,
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "p-4",
                        children: [
                          e.jsx("h3", {
                            className: "text-xl font-bold mb-1",
                            children: t.title || "Untitled Event",
                          }),
                          e.jsxs("p", {
                            className: "text-sm text-muted-foreground mb-4",
                            children: [t.date, " at ", t.time, " • ", t.venue],
                          }),
                          e.jsxs("div", {
                            className: "border-t border-border/40 pt-4 space-y-2",
                            children: [
                              e.jsx("p", {
                                className:
                                  "text-xs font-bold text-muted-foreground uppercase tracking-wider",
                                children: "Tickets Configured",
                              }),
                              s.map((a) =>
                                e.jsxs(
                                  "div",
                                  {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      e.jsxs("span", { children: [a.quantity, "x ", a.name] }),
                                      e.jsxs("span", {
                                        className: "font-bold",
                                        children: ["$", a.price],
                                      }),
                                    ],
                                  },
                                  a.id,
                                ),
                              ),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className:
          "fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe",
        children: e.jsxs("div", {
          className: "flex gap-3",
          children: [
            r > 0 &&
              e.jsx(c, {
                variant: "secondary",
                onClick: w,
                className: "h-14 rounded-full px-6 font-bold",
                children: "Back",
              }),
            r < f.length - 1
              ? e.jsx(c, {
                  onClick: y,
                  className:
                    "flex-1 h-14 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]",
                  style: { background: "var(--gradient-primary)" },
                  children: "Next Step",
                })
              : e.jsx(c, {
                  onClick: () => d({ ...t, published: !0 }),
                  className:
                    "flex-1 h-14 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]",
                  style: { background: "var(--gradient-primary)" },
                  children: "Publish Event",
                }),
          ],
        }),
      }),
    ],
  });
}
const p = ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP", "Publish"];
function W() {
  const r = T(),
    [l, t] = g.useState(0),
    [d, s] = g.useState({
      title: "",
      category: N[0],
      description: "",
      date: "",
      time: "",
      venue: "",
      city: "",
      address: "",
      coverPreview: "",
      vipPerks: "Priority entry, VIP lounge, complimentary welcome drink",
      published: !1,
    }),
    [n, u] = g.useState([
      { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
    ]),
    [j, y] = g.useState([{ id: "m1", name: "Event Tee", price: 20 }]),
    w = e.jsx("ol", {
      className: "grid grid-cols-7 gap-2",
      children: p.map((i, v) =>
        e.jsxs(
          "li",
          {
            className: `rounded-2xl border p-3 text-xs ${v < l ? "border-primary bg-accent/40" : v === l ? "border-primary bg-background shadow-[var(--shadow-glow)]" : "border-border/60 bg-background"}`,
            children: [
              e.jsxs("p", { className: "text-muted-foreground", children: ["Step ", v + 1] }),
              e.jsx("p", { className: "mt-0.5 font-medium text-foreground", children: i }),
            ],
          },
          i,
        ),
      ),
    }),
    a = (i, v) => s({ ...d, [i]: v }),
    m = (i) => {
      const v = i.target.files?.[0];
      if (!v) return;
      const A = URL.createObjectURL(v);
      a("coverPreview", A);
    };
  if (d.published)
    return e.jsxs("div", {
      className: "min-h-screen bg-background",
      children: [
        e.jsx(I, {}),
        e.jsxs("div", {
          className: "mx-auto max-w-xl px-6 py-24 text-center",
          children: [
            e.jsx("div", {
              className:
                "mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground animate-scale-in",
              style: { background: "var(--gradient-primary)" },
              children: e.jsx(V, { className: "h-8 w-8" }),
            }),
            e.jsxs("h1", {
              className: "mt-6 text-3xl font-semibold tracking-tight",
              children: [d.title || "Your event", " is live"],
            }),
            e.jsx("p", {
              className: "mt-2 text-muted-foreground",
              children: "Share the link with your community and start selling tickets.",
            }),
            e.jsxs("div", {
              className: "mt-6 flex justify-center gap-2",
              children: [
                e.jsx(b, {
                  to: "/dashboard",
                  children: e.jsx(c, {
                    variant: "outline",
                    className: "rounded-full",
                    children: "Back to dashboard",
                  }),
                }),
                e.jsx(b, {
                  to: "/events",
                  children: e.jsx(c, {
                    className: "rounded-full",
                    style: { background: "var(--gradient-primary)" },
                    children: "View on Agatike",
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  const h = () => t(Math.min(p.length - 1, l + 1)),
    U = () => t(Math.max(0, l - 1));
  return e.jsxs("div", {
    className: "min-h-screen bg-secondary/30",
    children: [
      e.jsx(I, {}),
      e.jsxs("div", {
        className: "mx-auto max-w-5xl px-6 py-10",
        children: [
          e.jsxs(b, {
            to: "/dashboard",
            className:
              "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
            children: [e.jsx(C, { className: "h-4 w-4" }), " Back to dashboard"],
          }),
          e.jsxs("div", {
            className: "mt-4 flex items-end justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h1", {
                    className: "text-2xl font-semibold tracking-tight",
                    children: "Create a new event",
                  }),
                  e.jsxs("p", {
                    className: "text-sm text-muted-foreground",
                    children: ["Step ", l + 1, " of ", p.length, " · ", p[l]],
                  }),
                ],
              }),
              e.jsxs("span", {
                className:
                  "inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground",
                children: [e.jsx(q, { className: "h-3 w-3" }), " Draft auto-saved"],
              }),
            ],
          }),
          e.jsx("div", { className: "mt-6", children: w }),
          e.jsxs("div", {
            className:
              "mt-6 rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]",
            children: [
              p[l] === "Details" &&
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { children: "Event title" }),
                        e.jsx(o, {
                          value: d.title,
                          onChange: (i) => a("title", i.target.value),
                          placeholder: "Afrobeats Night Live",
                          className: "mt-1",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "grid gap-4 md:grid-cols-2",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx(x, { children: "Category" }),
                            e.jsx("select", {
                              value: d.category,
                              onChange: (i) => a("category", i.target.value),
                              className:
                                "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
                              children: N.map((i) => e.jsx("option", { children: i }, i)),
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "grid grid-cols-2 gap-4",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx(x, { children: "Date" }),
                                e.jsx(o, {
                                  type: "date",
                                  value: d.date,
                                  onChange: (i) => a("date", i.target.value),
                                  className: "mt-1",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              children: [
                                e.jsx(x, { children: "Time" }),
                                e.jsx(o, {
                                  type: "time",
                                  value: d.time,
                                  onChange: (i) => a("time", i.target.value),
                                  className: "mt-1",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { children: "Description" }),
                        e.jsx(k, {
                          rows: 5,
                          value: d.description,
                          onChange: (i) => a("description", i.target.value),
                          placeholder: "Tell people what makes this night special…",
                          className: "mt-1",
                        }),
                      ],
                    }),
                  ],
                }),
              p[l] === "Tickets" && e.jsx(H, { tickets: n, setTickets: u }),
              p[l] === "Venue" &&
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsxs("div", {
                      className: "grid gap-4 md:grid-cols-2",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx(x, { children: "Venue name" }),
                            e.jsx(o, {
                              value: d.venue,
                              onChange: (i) => a("venue", i.target.value),
                              placeholder: "Eko Convention Centre",
                              className: "mt-1",
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          children: [
                            e.jsx(x, { children: "City" }),
                            e.jsx(o, {
                              value: d.city,
                              onChange: (i) => a("city", i.target.value),
                              placeholder: "Lagos, NG",
                              className: "mt-1",
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { children: "Address" }),
                        e.jsx(o, {
                          value: d.address,
                          onChange: (i) => a("address", i.target.value),
                          placeholder: "Plot 1415 Adetokunbo Ademola Street, Victoria Island",
                          className: "mt-1",
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className:
                        "aspect-[16/8] rounded-2xl border border-dashed border-border bg-secondary/40 grid place-items-center text-sm text-muted-foreground",
                      children: e.jsxs("span", {
                        className: "inline-flex items-center gap-2",
                        children: [e.jsx(P, { className: "h-4 w-4" }), " Map preview appears here"],
                      }),
                    }),
                  ],
                }),
              p[l] === "Media" &&
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsx(x, { children: "Cover image" }),
                    e.jsxs("label", {
                      className:
                        "block aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition hover:border-primary",
                      children: [
                        d.coverPreview
                          ? e.jsx("img", {
                              src: d.coverPreview,
                              alt: "cover",
                              className: "h-full w-full object-cover",
                            })
                          : e.jsx("div", {
                              className:
                                "grid h-full place-items-center text-sm text-muted-foreground",
                              children: e.jsxs("div", {
                                className: "text-center",
                                children: [
                                  e.jsx(z, { className: "mx-auto h-6 w-6" }),
                                  e.jsx("p", {
                                    className: "mt-2",
                                    children: "Click to upload (any image)",
                                  }),
                                ],
                              }),
                            }),
                        e.jsx("input", {
                          type: "file",
                          accept: "image/*",
                          hidden: !0,
                          onChange: m,
                        }),
                      ],
                    }),
                    e.jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children: "Recommended 1920×1080. We auto-generate social cards.",
                    }),
                  ],
                }),
              p[l] === "Merchandise" && e.jsx(K, { merch: j, setMerch: y }),
              p[l] === "VIP" &&
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsxs("div", {
                      className:
                        "flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 p-4",
                      children: [
                        e.jsx(M, { className: "h-5 w-5 text-primary" }),
                        e.jsxs("div", {
                          className: "text-sm",
                          children: [
                            e.jsx("p", { className: "font-medium", children: "VIP access" }),
                            e.jsx("p", {
                              className: "text-muted-foreground",
                              children: "Define the experience for premium ticket holders.",
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx(x, { children: "VIP perks" }),
                        e.jsx(k, {
                          rows: 5,
                          value: d.vipPerks,
                          onChange: (i) => a("vipPerks", i.target.value),
                          className: "mt-1",
                        }),
                      ],
                    }),
                  ],
                }),
              p[l] === "Publish" &&
                e.jsx(O, {
                  data: d,
                  tickets: n,
                  merch: j,
                  onPublish: () => s({ ...d, published: !0 }),
                }),
              e.jsxs("div", {
                className: "mt-8 flex items-center justify-between border-t border-border/60 pt-6",
                children: [
                  e.jsxs(c, {
                    variant: "outline",
                    onClick: U,
                    disabled: l === 0,
                    className: "rounded-full",
                    children: [e.jsx(C, { className: "mr-1 h-4 w-4" }), " Back"],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      e.jsx(c, {
                        variant: "ghost",
                        onClick: () => r({ to: "/dashboard" }),
                        children: "Save & exit",
                      }),
                      l < p.length - 1
                        ? e.jsxs(c, {
                            onClick: h,
                            className: "rounded-full",
                            style: { background: "var(--gradient-primary)" },
                            children: ["Continue ", e.jsx(L, { className: "ml-1 h-4 w-4" })],
                          })
                        : e.jsx(c, {
                            onClick: () => s({ ...d, published: !0 }),
                            className: "rounded-full shadow-[var(--shadow-glow)]",
                            style: { background: "var(--gradient-primary)" },
                            children: "Publish event",
                          }),
                    ],
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
function H({ tickets: r, setTickets: l }) {
  const t = (s) =>
      l([
        ...r,
        {
          id: crypto.randomUUID(),
          name:
            s === "free"
              ? "Free RSVP"
              : s === "vip"
                ? "VIP"
                : s === "early"
                  ? "Early Bird"
                  : "Paid Ticket",
          price: s === "free" ? 0 : s === "vip" ? 95 : 25,
          quantity: 100,
          type: s,
        },
      ]),
    d = (s, n) => l(r.map((u) => (u.id === s ? { ...u, ...n } : u)));
  return e.jsxs("div", {
    className: "space-y-4",
    children: [
      e.jsx("div", {
        className: "flex flex-wrap gap-2",
        children: ["paid", "free", "early", "vip"].map((s) =>
          e.jsxs(
            c,
            {
              variant: "outline",
              size: "sm",
              className: "rounded-full",
              onClick: () => t(s),
              children: [
                e.jsx(D, { className: "mr-1 h-3.5 w-3.5" }),
                " ",
                s === "paid"
                  ? "Paid"
                  : s === "free"
                    ? "Free"
                    : s === "early"
                      ? "Early bird"
                      : "VIP",
              ],
            },
            s,
          ),
        ),
      }),
      e.jsxs("div", {
        className: "space-y-3",
        children: [
          r.map((s) =>
            e.jsxs(
              "div",
              {
                className:
                  "grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_120px_120px_auto]",
                children: [
                  e.jsx(o, {
                    value: s.name,
                    onChange: (n) => d(s.id, { name: n.target.value }),
                    placeholder: "Ticket name",
                  }),
                  e.jsx(o, {
                    type: "number",
                    value: s.price,
                    onChange: (n) => d(s.id, { price: Number(n.target.value) }),
                    placeholder: "Price",
                  }),
                  e.jsx(o, {
                    type: "number",
                    value: s.quantity,
                    onChange: (n) => d(s.id, { quantity: Number(n.target.value) }),
                    placeholder: "Quantity",
                  }),
                  e.jsx(c, {
                    variant: "ghost",
                    size: "icon",
                    onClick: () => l(r.filter((n) => n.id !== s.id)),
                    children: e.jsx(E, { className: "h-4 w-4 text-muted-foreground" }),
                  }),
                ],
              },
              s.id,
            ),
          ),
          r.length === 0 &&
            e.jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "No tickets yet — add one above.",
            }),
        ],
      }),
    ],
  });
}
function K({ merch: r, setMerch: l }) {
  return e.jsxs("div", {
    className: "space-y-4",
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          e.jsxs("div", {
            className: "inline-flex items-center gap-2 text-sm text-muted-foreground",
            children: [e.jsx(R, { className: "h-4 w-4" }), " Sell merch alongside tickets"],
          }),
          e.jsxs(c, {
            variant: "outline",
            size: "sm",
            className: "rounded-full",
            onClick: () => l([...r, { id: crypto.randomUUID(), name: "", price: 0 }]),
            children: [e.jsx(D, { className: "mr-1 h-3.5 w-3.5" }), " Add item"],
          }),
        ],
      }),
      e.jsx("div", {
        className: "space-y-3",
        children: r.map((t) =>
          e.jsxs(
            "div",
            {
              className:
                "grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_140px_auto]",
              children: [
                e.jsx(o, {
                  value: t.name,
                  onChange: (d) =>
                    l(r.map((s) => (s.id === t.id ? { ...s, name: d.target.value } : s))),
                  placeholder: "Tour Tee, Parking Pass…",
                }),
                e.jsx(o, {
                  type: "number",
                  value: t.price,
                  onChange: (d) =>
                    l(r.map((s) => (s.id === t.id ? { ...s, price: Number(d.target.value) } : s))),
                  placeholder: "Price",
                }),
                e.jsx(c, {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => l(r.filter((d) => d.id !== t.id)),
                  children: e.jsx(E, { className: "h-4 w-4 text-muted-foreground" }),
                }),
              ],
            },
            t.id,
          ),
        ),
      }),
    ],
  });
}
function O({ data: r, tickets: l, merch: t, onPublish: d }) {
  return e.jsxs("div", {
    className: "space-y-5",
    children: [
      e.jsxs("div", {
        className: "overflow-hidden rounded-2xl border border-border/60",
        children: [
          r.coverPreview
            ? e.jsx("img", {
                src: r.coverPreview,
                alt: "",
                className: "aspect-[16/8] w-full object-cover",
              })
            : e.jsx("div", { className: "aspect-[16/8] w-full bg-secondary" }),
          e.jsxs("div", {
            className: "p-5",
            children: [
              e.jsx("p", {
                className: "text-xs uppercase tracking-wider text-muted-foreground",
                children: r.category,
              }),
              e.jsx("h3", {
                className: "mt-1 text-2xl font-semibold",
                children: r.title || "Untitled event",
              }),
              e.jsxs("div", {
                className: "mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground",
                children: [
                  e.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      e.jsx(_, { className: "h-4 w-4" }),
                      " ",
                      r.date || "TBD",
                      " · ",
                      r.time || "TBD",
                    ],
                  }),
                  e.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      e.jsx(P, { className: "h-4 w-4" }),
                      " ",
                      r.venue || "TBD",
                      ", ",
                      r.city || "",
                    ],
                  }),
                ],
              }),
              e.jsx("p", {
                className: "mt-3 text-sm",
                children: r.description || "No description yet.",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: [
          e.jsxs("div", {
            className: "rounded-2xl border border-border/60 p-4",
            children: [
              e.jsxs("p", {
                className: "text-sm font-semibold",
                children: ["Tickets (", l.length, ")"],
              }),
              e.jsx("ul", {
                className: "mt-2 space-y-1 text-sm text-muted-foreground",
                children: l.map((s) =>
                  e.jsxs(
                    "li",
                    { children: ["· ", s.name, " — $", s.price, " × ", s.quantity] },
                    s.id,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "rounded-2xl border border-border/60 p-4",
            children: [
              e.jsxs("p", {
                className: "text-sm font-semibold",
                children: ["Merchandise (", t.length, ")"],
              }),
              e.jsx("ul", {
                className: "mt-2 space-y-1 text-sm text-muted-foreground",
                children: t.map((s) =>
                  e.jsxs("li", { children: ["· ", s.name || "(unnamed)", " — $", s.price] }, s.id),
                ),
              }),
            ],
          }),
        ],
      }),
      e.jsx(c, {
        onClick: d,
        className: "w-full h-12 rounded-2xl shadow-[var(--shadow-glow)]",
        style: { background: "var(--gradient-primary)" },
        children: "Publish event",
      }),
    ],
  });
}
function oe() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", { className: "md:hidden", children: e.jsx(G, {}) }),
      e.jsx("div", { className: "hidden md:block", children: e.jsx(W, {}) }),
    ],
  });
}
export { oe as component };
