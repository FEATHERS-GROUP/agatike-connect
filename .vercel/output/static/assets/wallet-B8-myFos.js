import { l as s, q as e, m as r } from "./index-BbCjida8.js";
import { Q as a } from "./qr-code-Bb2sladL.js";
const l = [
    ["path", { d: "M12 2v13", key: "1km8f5" }],
    ["path", { d: "m16 6-4-4-4 4", key: "13yo43" }],
    ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", key: "1b2hhj" }],
  ],
  d = s("share", l);
function i() {
  const t = r[0];
  return e.jsxs("div", {
    className:
      "min-h-screen bg-background pb-24 pt-safe-top md:pb-8 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl",
    children: [
      e.jsxs("div", {
        className: "px-4 py-6",
        children: [
          e.jsx("h1", { className: "text-3xl font-bold tracking-tight mb-6", children: "Wallet" }),
          e.jsxs("div", {
            className: "flex gap-4 border-b border-border/40 pb-2 mb-6",
            children: [
              e.jsx("button", {
                className: "text-primary font-bold border-b-2 border-primary pb-2 px-1",
                children: "Upcoming",
              }),
              e.jsx("button", {
                className: "text-muted-foreground font-medium pb-2 px-1",
                children: "Past",
              }),
              e.jsx("button", {
                className: "text-muted-foreground font-medium pb-2 px-1",
                children: "Passes",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "relative w-full rounded-[2rem] overflow-hidden shadow-2xl mb-8 group",
            children: [
              e.jsx("div", {
                className:
                  "absolute inset-0 bg-gradient-to-br from-primary via-accent to-background opacity-90 group-hover:scale-105 transition-transform duration-700",
              }),
              e.jsxs("div", {
                className: "relative flex flex-col items-center p-6 text-white text-center",
                children: [
                  e.jsx("span", {
                    className:
                      "bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4",
                    children: "VIP Pass",
                  }),
                  e.jsx("img", {
                    src: t.cover,
                    alt: "Event",
                    className:
                      "h-20 w-20 rounded-2xl object-cover border-2 border-white/20 mb-3 shadow-lg",
                  }),
                  e.jsx("h2", {
                    className: "text-2xl font-bold leading-tight mb-1",
                    children: t.title,
                  }),
                  e.jsxs("p", {
                    className: "text-white/80 text-sm mb-6",
                    children: [t.date, " • ", t.time],
                  }),
                  e.jsx("div", {
                    className: "bg-white p-4 rounded-3xl shadow-inner mb-6",
                    children: e.jsxs("div", {
                      className:
                        "w-48 h-48 bg-black rounded-xl flex items-center justify-center relative overflow-hidden",
                      children: [
                        e.jsx(a, { className: "h-32 w-32 text-white" }),
                        e.jsx("div", {
                          className:
                            "absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-transparent h-full w-full animate-[scan_2s_ease-in-out_infinite]",
                        }),
                      ],
                    }),
                  }),
                  e.jsxs("div", {
                    className:
                      "w-full border-t border-dashed border-white/30 pt-4 flex justify-between text-left",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("p", {
                            className: "text-white/60 text-[10px] uppercase font-bold",
                            children: "Venue",
                          }),
                          e.jsx("p", { className: "font-semibold text-sm", children: t.venue }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "text-right",
                        children: [
                          e.jsx("p", {
                            className: "text-white/60 text-[10px] uppercase font-bold",
                            children: "Order ID",
                          }),
                          e.jsx("p", {
                            className: "font-semibold text-sm",
                            children: "#TXN-9842A",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className:
                  "absolute top-1/2 -left-3 h-6 w-6 bg-background rounded-full -translate-y-1/2",
              }),
              e.jsx("div", {
                className:
                  "absolute top-1/2 -right-3 h-6 w-6 bg-background rounded-full -translate-y-1/2",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex gap-3",
            children: [
              e.jsxs("button", {
                className:
                  "flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground font-bold py-3.5 rounded-full hover:bg-secondary/80 transition-colors",
                children: [e.jsx(d, { className: "h-4 w-4" }), " Transfer"],
              }),
              e.jsx("button", {
                className:
                  "flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-full shadow-[var(--shadow-glow)] hover:bg-primary/90 transition-colors",
                children: "Apple Wallet",
              }),
            ],
          }),
        ],
      }),
      e.jsx("style", {
        children: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `,
      }),
    ],
  });
}
export { i as component };
