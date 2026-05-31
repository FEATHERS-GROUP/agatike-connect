import {
  l as u,
  B as p,
  m as i,
  n as b,
  w as n,
  q as e,
  L as f,
  f as w,
} from "./index-BbCjida8.js";
import { B as j } from "./button-BtHMdeJ3.js";
import { C as g } from "./chevron-left-OCApdNuE.js";
import { W as N } from "./wallet-DciablDh.js";
import { S as k } from "./shield-AtXNGzjz.js";
import { I as t } from "./input-Bn2qJlr0.js";
import { L as c } from "./label-MewfGgAd.js";
import { N as $ } from "./Navbar-8zxmLK7V.js";
import { F as C } from "./Footer-CxcHC3QW.js";
import { L as M } from "./lock-BepScWQs.js";
import "./plus-DEJHAl15.js";
const P = [
    ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
    ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }],
  ],
  y = u("credit-card", P);
const S = [
    ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
    ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ],
  v = u("smartphone", S);
function L({ eventId: d }) {
  const m = p(),
    s = i.find((l) => l.id === d) || b.find((l) => l.id === d) || i[0],
    [r, a] = n.useState("apple"),
    [o, x] = n.useState(!1),
    h = () => {
      (x(!0),
        setTimeout(() => {
          m({ to: "/wallet" });
        }, 1500));
    };
  return e.jsxs("div", {
    className: "min-h-screen bg-background text-foreground pb-32",
    children: [
      e.jsxs("div", {
        className:
          "px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 pt-safe-top border-b border-border/40",
        children: [
          e.jsx(f, {
            to: "/events/$eventId",
            params: { eventId: d },
            className: "p-2 -ml-2 text-foreground",
            children: e.jsx(g, { className: "h-6 w-6" }),
          }),
          e.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "Checkout" }),
          e.jsx("div", { className: "w-10" }),
        ],
      }),
      e.jsxs("div", {
        className: "px-4 py-6 space-y-8",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h2", { className: "text-lg font-bold mb-4", children: "Order Summary" }),
              e.jsxs("div", {
                className:
                  "flex gap-4 bg-card/60 rounded-3xl p-4 border border-border/40 backdrop-blur",
                children: [
                  e.jsx("img", { src: s.cover, className: "h-24 w-20 rounded-xl object-cover" }),
                  e.jsxs("div", {
                    className: "flex flex-col flex-1 py-1",
                    children: [
                      e.jsx("h3", {
                        className: "font-bold text-base leading-tight mb-1",
                        children: s.title,
                      }),
                      e.jsxs("p", {
                        className: "text-xs text-muted-foreground mb-auto",
                        children: [s.date, " • ", s.venue || s.city],
                      }),
                      e.jsxs("div", {
                        className: "flex justify-between items-end mt-2",
                        children: [
                          e.jsx("span", {
                            className: "text-sm font-medium",
                            children: "1x General Admission",
                          }),
                          e.jsxs("span", {
                            className: "font-bold",
                            children: [s.currency || "$", s.price || 25],
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
            children: [
              e.jsx("h2", { className: "text-lg font-bold mb-4", children: "Payment Method" }),
              e.jsxs("div", {
                className: "space-y-3",
                children: [
                  e.jsxs("button", {
                    onClick: () => a("apple"),
                    className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${r === "apple" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
                    children: [
                      e.jsx("div", {
                        className:
                          "h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center",
                        children: e.jsx(N, { className: "h-5 w-5" }),
                      }),
                      e.jsxs("div", {
                        className: "text-left flex-1",
                        children: [
                          e.jsx("p", { className: "font-bold", children: "Apple Pay" }),
                          e.jsx("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Fast, secure checkout",
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${r === "apple" ? "border-primary" : "border-muted-foreground"}`,
                        children:
                          r === "apple" &&
                          e.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" }),
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => a("card"),
                    className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${r === "card" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
                    children: [
                      e.jsx("div", {
                        className:
                          "h-10 w-10 bg-secondary rounded-full flex items-center justify-center",
                        children: e.jsx(y, { className: "h-5 w-5" }),
                      }),
                      e.jsxs("div", {
                        className: "text-left flex-1",
                        children: [
                          e.jsx("p", { className: "font-bold", children: "Credit Card" }),
                          e.jsx("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Visa, Mastercard, Amex",
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${r === "card" ? "border-primary" : "border-muted-foreground"}`,
                        children:
                          r === "card" &&
                          e.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" }),
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => a("momo"),
                    className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${r === "momo" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
                    children: [
                      e.jsx("div", {
                        className:
                          "h-10 w-10 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center",
                        children: e.jsx(v, { className: "h-5 w-5" }),
                      }),
                      e.jsxs("div", {
                        className: "text-left flex-1",
                        children: [
                          e.jsx("p", { className: "font-bold", children: "Mobile Money" }),
                          e.jsx("p", {
                            className: "text-xs text-muted-foreground",
                            children: "MTN MoMo, Airtel Money",
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${r === "momo" ? "border-primary" : "border-muted-foreground"}`,
                        children:
                          r === "momo" &&
                          e.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" }),
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
        className:
          "fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between mb-3 px-2",
            children: [
              e.jsx("span", {
                className: "text-sm font-medium text-muted-foreground",
                children: "Total to pay",
              }),
              e.jsxs("span", {
                className: "text-xl font-bold",
                children: [s.currency || "$", s.price || 25],
              }),
            ],
          }),
          e.jsx(j, {
            onClick: h,
            disabled: o,
            className:
              "w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide",
            style: { background: "var(--gradient-primary)" },
            children: o ? "Processing..." : `Pay ${s.currency || "$"}${s.price || 25}`,
          }),
          e.jsxs("div", {
            className:
              "mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground",
            children: [e.jsx(k, { className: "h-3.5 w-3.5" }), " Secure encrypted checkout"],
          }),
        ],
      }),
    ],
  });
}
function A({ eventId: d }) {
  const m = p(),
    s = i.find((l) => l.id === d) || b.find((l) => l.id === d) || i[0],
    [r, a] = n.useState("apple"),
    [o, x] = n.useState(!1),
    h = () => {
      (x(!0),
        setTimeout(() => {
          m({ to: "/wallet" });
        }, 1500));
    };
  return e.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      e.jsx($, {}),
      e.jsxs("main", {
        className: "mx-auto max-w-6xl px-6 py-12",
        children: [
          e.jsxs(f, {
            to: "/events/$eventId",
            params: { eventId: d },
            className:
              "inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8",
            children: [e.jsx(g, { className: "mr-1 h-4 w-4" }), " Back to event"],
          }),
          e.jsxs("div", {
            className: "grid lg:grid-cols-[1fr_400px] gap-12",
            children: [
              e.jsxs("div", {
                className: "space-y-10",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Checkout" }),
                      e.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          e.jsx("h2", {
                            className: "text-xl font-semibold",
                            children: "Contact Information",
                          }),
                          e.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              e.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  e.jsx(c, { children: "First Name" }),
                                  e.jsx(t, { placeholder: "Alex" }),
                                ],
                              }),
                              e.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  e.jsx(c, { children: "Last Name" }),
                                  e.jsx(t, { placeholder: "Doe" }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "space-y-2",
                            children: [
                              e.jsx(c, { children: "Email" }),
                              e.jsx(t, { type: "email", placeholder: "alex@example.com" }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "space-y-2",
                            children: [
                              e.jsx(c, { children: "Phone Number" }),
                              e.jsx(t, { type: "tel", placeholder: "+250 788 123 456" }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "pt-8 border-t border-border/40",
                    children: [
                      e.jsx("h2", {
                        className: "text-xl font-semibold mb-6",
                        children: "Payment Method",
                      }),
                      e.jsxs("div", {
                        className: "grid gap-4",
                        children: [
                          e.jsxs("button", {
                            onClick: () => a("apple"),
                            className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${r === "apple" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                            children: [
                              e.jsx("div", {
                                className:
                                  "h-12 w-12 bg-foreground text-background rounded-full flex items-center justify-center shrink-0",
                                children: e.jsx(N, { className: "h-6 w-6" }),
                              }),
                              e.jsxs("div", {
                                className: "text-left flex-1",
                                children: [
                                  e.jsx("p", {
                                    className: "font-semibold text-lg",
                                    children: "Apple Pay",
                                  }),
                                  e.jsx("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Fast, secure checkout",
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${r === "apple" ? "border-primary" : "border-muted-foreground"}`,
                                children:
                                  r === "apple" &&
                                  e.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" }),
                              }),
                            ],
                          }),
                          e.jsxs("button", {
                            onClick: () => a("card"),
                            className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${r === "card" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                            children: [
                              e.jsx("div", {
                                className:
                                  "h-12 w-12 bg-secondary rounded-full flex items-center justify-center shrink-0",
                                children: e.jsx(y, { className: "h-6 w-6" }),
                              }),
                              e.jsxs("div", {
                                className: "text-left flex-1",
                                children: [
                                  e.jsx("p", {
                                    className: "font-semibold text-lg",
                                    children: "Credit Card",
                                  }),
                                  e.jsx("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Visa, Mastercard, Amex",
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${r === "card" ? "border-primary" : "border-muted-foreground"}`,
                                children:
                                  r === "card" &&
                                  e.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" }),
                              }),
                            ],
                          }),
                          r === "card" &&
                            e.jsxs("div", {
                              className:
                                "p-6 rounded-2xl bg-secondary/30 border border-border/40 grid gap-4 animate-in fade-in slide-in-from-top-2",
                              children: [
                                e.jsxs("div", {
                                  className: "space-y-2",
                                  children: [
                                    e.jsx(c, { children: "Card Number" }),
                                    e.jsx(t, { placeholder: "0000 0000 0000 0000" }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "grid grid-cols-2 gap-4",
                                  children: [
                                    e.jsxs("div", {
                                      className: "space-y-2",
                                      children: [
                                        e.jsx(c, { children: "Expiry Date" }),
                                        e.jsx(t, { placeholder: "MM/YY" }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "space-y-2",
                                      children: [
                                        e.jsx(c, { children: "CVC" }),
                                        e.jsx(t, { placeholder: "123" }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          e.jsxs("button", {
                            onClick: () => a("momo"),
                            className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${r === "momo" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                            children: [
                              e.jsx("div", {
                                className:
                                  "h-12 w-12 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0",
                                children: e.jsx(v, { className: "h-6 w-6" }),
                              }),
                              e.jsxs("div", {
                                className: "text-left flex-1",
                                children: [
                                  e.jsx("p", {
                                    className: "font-semibold text-lg",
                                    children: "Mobile Money",
                                  }),
                                  e.jsx("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "MTN MoMo, Airtel Money",
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${r === "momo" ? "border-primary" : "border-muted-foreground"}`,
                                children:
                                  r === "momo" &&
                                  e.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                children: e.jsxs("div", {
                  className:
                    "sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]",
                  children: [
                    e.jsx("h2", {
                      className: "text-xl font-semibold mb-6",
                      children: "Order Summary",
                    }),
                    e.jsxs("div", {
                      className: "flex gap-4 mb-6",
                      children: [
                        e.jsx("img", {
                          src: s.cover,
                          className: "h-24 w-20 rounded-xl object-cover",
                        }),
                        e.jsxs("div", {
                          className: "flex flex-col",
                          children: [
                            e.jsx("h3", {
                              className: "font-semibold leading-tight",
                              children: s.title,
                            }),
                            e.jsxs("p", {
                              className: "text-sm text-muted-foreground mt-1",
                              children: [s.date, " • ", s.venue || s.city],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "space-y-4 text-sm border-y border-border/60 py-4 mb-4",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-center",
                          children: [
                            e.jsx("span", { children: "1x General Admission" }),
                            e.jsxs("span", {
                              className: "font-medium",
                              children: [s.currency || "$", s.price || 25],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-muted-foreground",
                          children: [
                            e.jsx("span", { children: "Service Fee" }),
                            e.jsx("span", { children: "$2.50" }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "flex justify-between items-end mb-8",
                      children: [
                        e.jsx("span", { className: "font-semibold", children: "Total" }),
                        e.jsxs("span", {
                          className: "text-2xl font-bold",
                          children: [s.currency || "$", (s.price || 25) + 2.5],
                        }),
                      ],
                    }),
                    e.jsx(j, {
                      onClick: h,
                      disabled: o,
                      className:
                        "w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4",
                      style: { background: "var(--gradient-primary)" },
                      children: o
                        ? "Processing..."
                        : `Pay ${s.currency || "$"}${(s.price || 25) + 2.5}`,
                    }),
                    e.jsxs("div", {
                      className:
                        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
                      children: [e.jsx(M, { className: "h-4 w-4" }), " SSL Encrypted Checkout"],
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
      e.jsx(C, {}),
    ],
  });
}
function O() {
  const { eventId: d } = w.useParams();
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", { className: "md:hidden", children: e.jsx(L, { eventId: d }) }),
      e.jsx("div", { className: "hidden md:block", children: e.jsx(A, { eventId: d }) }),
    ],
  });
}
export { O as component };
