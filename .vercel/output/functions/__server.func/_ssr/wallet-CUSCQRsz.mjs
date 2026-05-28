import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as events } from "./router-EgqkzaPB.mjs";
import { U as QrCode, Z as Share } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function WalletPage() {
  const activeTicket = events[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24 pt-safe-top md:pb-8 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight mb-6", children: "Wallet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 border-b border-border/40 pb-2 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-primary font-bold border-b-2 border-primary pb-2 px-1", children: "Upcoming" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-muted-foreground font-medium pb-2 px-1", children: "Past" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-muted-foreground font-medium pb-2 px-1", children: "Passes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-[2rem] overflow-hidden shadow-2xl mb-8 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary via-accent to-background opacity-90 group-hover:scale-105 transition-transform duration-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center p-6 text-white text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4", children: "VIP Pass" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeTicket.cover, alt: "Event", className: "h-20 w-20 rounded-2xl object-cover border-2 border-white/20 mb-3 shadow-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold leading-tight mb-1", children: activeTicket.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/80 text-sm mb-6", children: [
            activeTicket.date,
            " • ",
            activeTicket.time
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4 rounded-3xl shadow-inner mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-48 h-48 bg-black rounded-xl flex items-center justify-center relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-32 w-32 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-transparent h-full w-full animate-[scan_2s_ease-in-out_infinite]" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full border-t border-dashed border-white/30 pt-4 flex justify-between text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-[10px] uppercase font-bold", children: "Venue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: activeTicket.venue })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-[10px] uppercase font-bold", children: "Order ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "#TXN-9842A" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 -left-3 h-6 w-6 bg-background rounded-full -translate-y-1/2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 -right-3 h-6 w-6 bg-background rounded-full -translate-y-1/2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground font-bold py-3.5 rounded-full hover:bg-secondary/80 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "h-4 w-4" }),
          " Transfer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-full shadow-[var(--shadow-glow)] hover:bg-primary/90 transition-colors", children: "Apple Wallet" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      ` })
  ] });
}
export {
  WalletPage as component
};
