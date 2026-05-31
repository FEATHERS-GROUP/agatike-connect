import { e as b, C as p, o as d, m as c, w as l, q as e } from "./index-BbCjida8.js";
import { A as f } from "./arrow-left-CHuZXlQs.js";
import { C as g } from "./circle-check-DTgEIP1Q.js";
import { I as j } from "./image-CnMZ8cHR.js";
import { S as v } from "./send-i6bAB18C.js";
function z() {
  const { postId: m } = b.useParams(),
    x = p(),
    t = d.find((s) => s.id === m) || d[0],
    r = c.find((s) => s.organizerHandle === t.handle) || c[0],
    [o, n] = l.useState(!1),
    [i, u] = l.useState(""),
    [a, h] = l.useState(!1);
  return (
    l.useEffect(() => {
      const s = () => {
        h(window.scrollY > 150);
      };
      return (window.addEventListener("scroll", s), () => window.removeEventListener("scroll", s));
    }, []),
    e.jsxs("div", {
      className:
        "min-h-screen bg-background pb-24 md:pb-8 md:max-w-xl md:mx-auto shadow-xl relative",
      children: [
        e.jsxs("div", {
          className: `flex items-center justify-between px-4 pb-3 pt-safe-top fixed top-0 left-0 right-0 mx-auto w-full md:max-w-xl z-40 transition-colors duration-300 min-h-[60px] ${a ? "bg-background/90 backdrop-blur-md border-b border-border/40" : "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent"}`,
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("button", {
                  onClick: () => x.history.back(),
                  className: `p-2 -ml-2 rounded-full transition-colors ${a ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/20 backdrop-blur-sm"}`,
                  children: e.jsx(f, { className: "h-6 w-6" }),
                }),
                a
                  ? e.jsxs("div", {
                      className: "flex items-center gap-2 animate-in fade-in duration-300",
                      children: [
                        e.jsx("img", {
                          src: r.cover,
                          className: "w-8 h-8 rounded-full object-cover border border-border",
                        }),
                        e.jsxs("div", {
                          className: "flex flex-col",
                          children: [
                            e.jsx("span", {
                              className: "font-bold text-sm leading-none",
                              children: r.organizer,
                            }),
                            e.jsxs("span", {
                              className: "text-[10px] text-muted-foreground",
                              children: ["@", r.organizerHandle],
                            }),
                          ],
                        }),
                      ],
                    })
                  : e.jsx("h1", {
                      className: "font-bold text-lg tracking-tight text-transparent",
                      children: "Community",
                    }),
              ],
            }),
            a &&
              e.jsx("button", {
                onClick: () => n(!o),
                className: `px-3 py-1 rounded-full text-xs font-bold transition-colors animate-in fade-in duration-300 ${o ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`,
                children: o ? "Following" : "Follow",
              }),
          ],
        }),
        e.jsxs("div", {
          className: "w-full aspect-video md:aspect-[21/9] bg-secondary relative",
          children: [
            e.jsx("img", {
              src: t.image,
              alt: "Post header",
              className: "w-full h-full object-cover",
            }),
            e.jsx("div", {
              className:
                "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none",
            }),
            e.jsxs("div", {
              className: "absolute bottom-4 left-4 right-4 flex items-center justify-between",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-3",
                  children: [
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("img", {
                          src: r.cover,
                          alt: r.organizer,
                          className:
                            "w-12 h-12 rounded-full border-2 border-background object-cover",
                        }),
                        e.jsx("div", {
                          className: "absolute bottom-0 right-0 bg-background rounded-full p-0.5",
                          children: e.jsx(g, { className: "h-4 w-4 text-primary fill-primary/20" }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h2", {
                          className: "font-bold text-white text-shadow-sm",
                          children: r.organizer,
                        }),
                        e.jsxs("p", {
                          className: "text-xs text-white/80 drop-shadow-sm",
                          children: ["@", r.organizerHandle],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("button", {
                  onClick: () => n(!o),
                  className: `px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${o ? "bg-white/20 text-white backdrop-blur-md border border-white/30" : "bg-primary text-primary-foreground"}`,
                  children: o ? "Following" : "Follow",
                }),
              ],
            }),
          ],
        }),
        e.jsx("div", {
          className: "px-4 py-4 border-b border-border/40",
          children: e.jsxs("p", {
            className: "text-sm text-foreground",
            children: [
              e.jsxs("span", { className: "font-bold mr-2", children: ["@", t.handle] }),
              t.caption,
            ],
          }),
        }),
        e.jsxs("div", {
          className: "w-full pt-4",
          children: [
            e.jsxs("h3", {
              className:
                "px-4 text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2",
              children: [
                "Community Conversations",
                " ",
                e.jsx("span", {
                  className: "bg-secondary text-foreground px-2 py-0.5 rounded-full text-[10px]",
                  children: t.comments,
                }),
              ],
            }),
            e.jsx("div", {
              className: "px-4 space-y-5",
              children:
                t.commentsList &&
                t.commentsList.map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className: "flex gap-3",
                      children: [
                        e.jsx("img", {
                          src: s.avatar,
                          alt: s.handle,
                          className: "w-8 h-8 rounded-full object-cover shrink-0",
                        }),
                        e.jsxs("div", {
                          className: "flex-1",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-2",
                              children: [
                                e.jsxs("span", {
                                  className: "font-bold text-sm",
                                  children: ["@", s.handle],
                                }),
                                e.jsx("span", {
                                  className: "text-[10px] text-muted-foreground",
                                  children: s.time,
                                }),
                              ],
                            }),
                            e.jsx("p", {
                              className: "text-sm text-foreground/90 mt-0.5",
                              children: s.text,
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
        e.jsx("div", {
          className:
            "fixed bottom-0 left-0 right-0 md:max-w-xl md:mx-auto bg-background/90 backdrop-blur-md border-t border-border/40 p-4 pb-safe-bottom z-40",
          children: o
            ? e.jsxs("div", {
                className: "flex gap-3 items-center",
                children: [
                  e.jsx("img", {
                    src: "https://i.pravatar.cc/150?u=me",
                    alt: "You",
                    className: "w-8 h-8 rounded-full object-cover shrink-0",
                  }),
                  e.jsxs("div", {
                    className:
                      "flex-1 flex items-center bg-secondary/50 border border-border/40 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-shadow",
                    children: [
                      e.jsx("input", {
                        type: "text",
                        value: i,
                        onChange: (s) => u(s.target.value),
                        placeholder: "Join the conversation...",
                        className: "flex-1 bg-transparent text-sm focus:outline-none py-1",
                      }),
                      e.jsx("button", {
                        className:
                          "p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1",
                        children: e.jsx(j, { className: "w-5 h-5" }),
                      }),
                    ],
                  }),
                  i.trim().length > 0 &&
                    e.jsx("button", {
                      className: "text-primary p-2",
                      children: e.jsx(v, { className: "w-5 h-5" }),
                    }),
                ],
              })
            : e.jsxs("div", {
                className: "flex flex-col items-center justify-center py-2",
                children: [
                  e.jsx("p", {
                    className: "text-sm text-muted-foreground font-medium mb-2",
                    children: "You must follow the organizer to join the conversation",
                  }),
                  e.jsxs("button", {
                    onClick: () => n(!0),
                    className: "text-primary font-bold text-sm hover:underline",
                    children: ["Follow @", t.handle],
                  }),
                ],
              }),
        }),
        e.jsx("div", { className: "h-24" }),
      ],
    })
  );
}
export { z as component };
