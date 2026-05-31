import { l as g, w as d, q as e, y as j, L as N } from "./index-BbCjida8.js";
import { X as w } from "./x-B77yeb99.js";
import { C as y } from "./calendar-days-Bc2SBC-l.js";
import { S as k } from "./send-i6bAB18C.js";
const S = [
    [
      "path",
      {
        d: "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",
        key: "oz39mx",
      },
    ],
  ],
  z = g("bookmark", S);
const I = [
    ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
    ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
    ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }],
  ],
  C = g("ellipsis", I);
function E({ stories: s, initialIndex: n, onClose: i, onStoryFinished: o }) {
  const [c, x] = d.useState(n),
    [t, l] = d.useState(0),
    [u, h] = d.useState(0),
    v = 5e3,
    r = s[c],
    f = r.items[t];
  d.useEffect(() => {
    h(0);
    const a = setInterval(() => {
      h((m) => (m >= 100 ? (clearInterval(a), p(), 100) : m + 100 / (v / 50)));
    }, 50);
    return () => clearInterval(a);
  }, [c, t]);
  const p = () => {
      t < r.items.length - 1
        ? l((a) => a + 1)
        : c < s.length - 1
          ? (o?.(r.id), x((a) => a + 1), l(0))
          : (o?.(r.id), i());
    },
    b = () => {
      t > 0 ? l((a) => a - 1) : c > 0 && (x((a) => a - 1), l(s[c - 1].items.length - 1));
    };
  return e.jsx("div", {
    className: "fixed inset-0 z-[200] flex items-center justify-center bg-black",
    children: e.jsxs("div", {
      className: "relative w-full h-full max-w-md bg-black",
      children: [
        e.jsx("div", {
          className: "absolute top-0 inset-x-0 z-20 flex gap-1 p-4 pt-safe-top",
          children: r.items.map((a, m) =>
            e.jsx(
              "div",
              {
                className: "h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm",
                children: e.jsx("div", {
                  className: "h-full bg-white transition-all duration-75 ease-linear rounded-full",
                  style: { width: `${m === t ? u : m < t ? 100 : 0}%` },
                }),
              },
              a.id,
            ),
          ),
        }),
        e.jsxs("div", {
          className:
            "absolute top-8 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe-top",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className: "h-8 w-8 rounded-full overflow-hidden border border-white/20",
                  children: e.jsx("img", {
                    src: r.avatar,
                    alt: r.name,
                    className: "h-full w-full object-cover",
                  }),
                }),
                e.jsx("span", {
                  className: "text-sm font-semibold text-white drop-shadow-md",
                  children: r.name,
                }),
              ],
            }),
            e.jsx("button", {
              onClick: i,
              className: "text-white hover:text-white/80 p-2 drop-shadow-md",
              children: e.jsx(w, { className: "h-6 w-6" }),
            }),
          ],
        }),
        e.jsxs("div", {
          className: "relative w-full h-full flex items-center justify-center",
          children: [
            e.jsx(
              "img",
              { src: f.image, alt: "Story", className: "w-full h-full object-cover" },
              f.id,
            ),
            e.jsx("div", {
              className:
                "absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none",
            }),
            e.jsx("div", {
              className:
                "absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none",
            }),
            e.jsxs("div", {
              className: "absolute bottom-10 inset-x-6 text-white z-20",
              children: [
                e.jsx("h2", {
                  className: "text-2xl font-bold mb-2 shadow-black drop-shadow-lg",
                  children: r.name,
                }),
                e.jsxs("p", {
                  className: "text-sm text-white/90 shadow-black drop-shadow-md",
                  children: ["Live moment from ", r.name],
                }),
              ],
            }),
          ],
        }),
        e.jsx("div", { className: "absolute inset-y-0 left-0 w-1/3 z-10", onClick: b }),
        e.jsx("div", { className: "absolute inset-y-0 right-0 w-2/3 z-10", onClick: p }),
      ],
    }),
  });
}
function _({ items: s = j }) {
  const [n, i] = d.useState(null),
    [o, c] = d.useState(new Set()),
    x = (t) => {
      c((l) => {
        const u = new Set(l);
        return (u.add(t), u);
      });
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", {
        className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none",
        children: s.map((t, l) =>
          e.jsxs(
            "div",
            {
              className:
                "flex shrink-0 flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95",
              onClick: () => i(l),
              children: [
                e.jsx("div", {
                  className: `rounded-full p-[2px] ${o.has(t.id) ? "bg-border" : ""}`,
                  style: o.has(t.id) ? void 0 : { background: "var(--gradient-primary)" },
                  children: e.jsx("div", {
                    className: "rounded-full bg-background p-[2px]",
                    children: e.jsx("img", {
                      src: t.avatar,
                      alt: t.name,
                      className: "h-16 w-16 rounded-full object-cover",
                      loading: "lazy",
                    }),
                  }),
                }),
                e.jsx("span", { className: "text-xs text-muted-foreground", children: t.name }),
              ],
            },
            t.id,
          ),
        ),
      }),
      n !== null &&
        e.jsx(E, { stories: s, initialIndex: n, onClose: () => i(null), onStoryFinished: x }),
    ],
  });
}
function A({ post: s }) {
  const [n, i] = d.useState(!1),
    o = (s.id || "").length % 2 === 0;
  return e.jsx("div", {
    className: "w-full px-4 mb-6",
    children: e.jsxs("div", {
      className: "w-full bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm",
      children: [
        e.jsxs("div", {
          className:
            "flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm z-10 relative",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className: "relative",
                  children: e.jsx("div", {
                    className: "h-10 w-10 rounded-full overflow-hidden border border-border",
                    children: e.jsx("img", {
                      src: s.organizerAvatar || "https://i.pravatar.cc/100",
                      alt: "Organizer",
                      className: "w-full h-full object-cover",
                    }),
                  }),
                }),
                e.jsxs("div", {
                  className: "flex flex-col",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("span", {
                          className: "text-sm font-bold text-foreground leading-none",
                          children: s.handle || s.organizerHandle || "organizer",
                        }),
                        o &&
                          e.jsxs("span", {
                            className:
                              "bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                            children: [e.jsx(y, { className: "h-3 w-3" }), " New Event"],
                          }),
                      ],
                    }),
                    e.jsx("span", {
                      className: "text-[10px] text-muted-foreground mt-1",
                      children: "Kigali, RW",
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("button", {
              className: "text-foreground p-1 hover:bg-secondary rounded-full transition-colors",
              children: e.jsx(C, { className: "h-5 w-5" }),
            }),
          ],
        }),
        e.jsx(N, {
          to: "/community/$postId",
          params: { postId: s.id || "p-0" },
          className: "block w-full aspect-square bg-secondary relative",
          children: e.jsx("img", {
            src: s.image || s.cover,
            alt: "Feed",
            className: "h-full w-full object-cover transition-transform active:scale-[0.98]",
          }),
        }),
        e.jsxs("div", {
          className: "flex items-center justify-between px-4 py-3",
          children: [
            e.jsx("div", {
              className: "flex items-center gap-4 text-sm font-medium text-muted-foreground",
              children: e.jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [
                  e.jsxs("div", {
                    className: "flex -space-x-1",
                    children: [
                      e.jsx("img", {
                        src: "https://i.pravatar.cc/100?img=5",
                        className: "w-5 h-5 rounded-full border-2 border-card z-20",
                      }),
                      e.jsx("img", {
                        src: "https://i.pravatar.cc/100?img=6",
                        className: "w-5 h-5 rounded-full border-2 border-card z-10",
                      }),
                    ],
                  }),
                  e.jsxs("p", {
                    className: "text-xs",
                    children: [
                      "Followed by ",
                      e.jsx("span", {
                        className: "font-bold text-foreground",
                        children: "angryswan",
                      }),
                      " and",
                      " ",
                      e.jsx("span", {
                        className: "font-bold text-foreground",
                        children: "800 others",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            e.jsxs("div", {
              className: "flex gap-4",
              children: [
                e.jsx("button", {
                  className: "focus:outline-none transition-transform active:scale-90",
                  children: e.jsx(k, {
                    className: "h-6 w-6 text-foreground hover:text-foreground/80",
                    style: { transform: "rotate(15deg)" },
                  }),
                }),
                e.jsx("button", {
                  onClick: () => i(!n),
                  className: "focus:outline-none transition-transform active:scale-90",
                  children: e.jsx(z, {
                    className: `h-6 w-6 ${n ? "fill-foreground text-foreground" : "text-foreground hover:text-foreground/80"}`,
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsx("div", {
          className: "px-4 pb-4",
          children: e.jsxs("p", {
            className: "text-sm text-foreground",
            children: [
              e.jsx("span", {
                className: "font-bold mr-1",
                children: s.handle || s.organizerHandle || "organizer",
              }),
              s.caption ||
                "Join us for the most anticipated event of the year. Tickets are selling out fast! Don't miss this amazing night.",
            ],
          }),
        }),
      ],
    }),
  });
}
export { A as F, _ as S };
