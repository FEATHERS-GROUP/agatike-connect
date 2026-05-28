import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { b as ArrowLeft, v as Flashlight, ae as Wifi, af as WifiOff, V as ScanLine, m as CircleCheck, n as CircleX, ac as Users, r as Crown, j as Check, ag as X } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./router-EgqkzaPB.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function ScannerMobile() {
  const [result, setResult] = reactExports.useState("idle");
  const [online, setOnline] = reactExports.useState(true);
  const [torch, setTorch] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (result !== "idle") {
      const timer = setTimeout(() => setResult("idle"), 2500);
      return () => clearTimeout(timer);
    }
  }, [result]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-4 pt-safe-top pb-4 bg-black/80 backdrop-blur-md z-30 border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "p-2 -ml-2 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-sm tracking-tight", children: "Afrobeats Night" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50", children: "Door 2 • General Entry" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setTorch(!torch),
            className: `p-2 rounded-full ${torch ? "bg-white text-black" : "text-white"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flashlight, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setOnline(!online),
            className: `p-1.5 rounded-full ${online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`,
            children: online ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative flex flex-col items-center justify-center p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#0a0a0a]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-20",
          style: {
            backgroundImage: "radial-gradient(circle at center, #333 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `relative w-full max-w-sm aspect-square rounded-[2.5rem] border-4 transition-colors duration-300 ${result === "idle" ? "border-primary/50" : result === "success" || result === "vip" ? "border-emerald-500" : "border-red-500"}`,
          children: [
            result === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-primary/10 animate-pulse rounded-[2rem]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/70", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-12 w-12 mb-2 opacity-50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold tracking-widest uppercase", children: "Align QR Code" })
              ] })
            ] }),
            result !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm ${result === "success" || result === "vip" ? "bg-emerald-500/20" : "bg-red-500/20"}`,
                children: result === "success" || result === "vip" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-24 w-24 text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-24 w-24 text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-32 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 text-sm font-bold shadow-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-primary" }),
          " 842 In"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px bg-white/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/60", children: "358 Left" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl border-t border-white/10 p-6 pb-safe transition-transform duration-300 ${result !== "idle" ? "translate-y-0" : "translate-y-[120%]"}`,
        children: result !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-in slide-in-from-bottom-4 duration-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "https://i.pravatar.cc/150?img=12",
                className: "h-full w-full rounded-full border-2 border-black object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: "Amaka Okafor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 text-sm", children: "#AG-48211" })
            ] }),
            result === "vip" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50 px-3 py-1 rounded-full flex items-center gap-1 font-bold text-xs uppercase", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
              " VIP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `w-full p-4 rounded-2xl text-center font-bold text-lg tracking-wide ${result === "fail" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`,
              children: result === "fail" ? "TICKET ALREADY SCANNED" : "ENTRY APPROVED"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4 right-4 z-50 flex gap-2", children: result === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setResult("success"),
          className: "flex-1 bg-white/10 text-white p-3 rounded-full text-xs font-bold",
          children: "Mock Success"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setResult("vip"),
          className: "flex-1 bg-[#FFD700]/20 text-[#FFD700] p-3 rounded-full text-xs font-bold",
          children: "Mock VIP"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setResult("fail"),
          className: "flex-1 bg-red-500/20 text-red-400 p-3 rounded-full text-xs font-bold",
          children: "Mock Fail"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes scan {
          0% { transform: translateY(-100px); }
          50% { transform: translateY(100px); }
          100% { transform: translateY(-100px); }
        }
      ` })
  ] });
}
function ScannerDesktop() {
  const [result, setResult] = reactExports.useState("idle");
  const [online, setOnline] = reactExports.useState(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[oklch(0.1_0.01_50)] text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-screen max-w-md flex-col px-5 pt-6 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/dashboard",
          className: "inline-flex items-center gap-2 text-sm text-white/70 hover:text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Dashboard"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setOnline(!online),
          className: `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${online ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`,
          children: [
            online ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-3 w-3" }),
            online ? "Online" : "Offline mode"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-white/50", children: "Now scanning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Afrobeats Night Live" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60", children: "Eko Convention Centre · Door 2" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-6 aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-black", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.3_0.06_50)_0%,oklch(0.08_0.01_50)_70%)]" }),
      [
        "top-4 left-4 border-l-2 border-t-2",
        "top-4 right-4 border-r-2 border-t-2",
        "bottom-4 left-4 border-l-2 border-b-2",
        "bottom-4 right-4 border-r-2 border-b-2"
      ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `absolute h-12 w-12 rounded-md ${c}`,
          style: { borderColor: "oklch(0.78 0.18 55)" }
        },
        c
      )),
      result === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-4 right-4 top-1/2 h-px",
          style: {
            background: "linear-gradient(90deg, transparent, oklch(0.78 0.18 55), transparent)",
            boxShadow: "0 0 30px oklch(0.78 0.18 55)"
          }
        }
      ),
      result !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `grid h-24 w-24 place-items-center rounded-full ${result === "success" || result === "vip" ? "bg-emerald-500" : "bg-red-500"} text-white animate-scale-in`,
          children: result === "success" || result === "vip" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-12 w-12" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-12 w-12" })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 left-0 right-0 text-center text-xs text-white/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "mx-auto mb-1 h-4 w-4" }),
        " Align QR inside the frame"
      ] })
    ] }),
    result !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 animate-fade-in rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-12 w-12 rounded-full",
            style: { background: "var(--gradient-primary)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Amaka Okafor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/60", children: [
            "Order #AG-48211 · ",
            result === "vip" ? "VIP Lounge" : "General Admission",
            " x1"
          ] })
        ] }),
        result === "vip" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
          " VIP"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: `mt-4 rounded-2xl px-3 py-2 text-sm ${result === "fail" ? "bg-red-500/10 text-red-200" : "bg-emerald-500/10 text-emerald-200"}`,
          children: result === "fail" ? "Ticket already used at 21:14" : "Welcome — entry confirmed"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto grid grid-cols-3 gap-2 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => setResult("success"),
          className: "h-14 rounded-2xl",
          style: { background: "var(--gradient-primary)" },
          children: "Valid"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => setResult("vip"),
          variant: "outline",
          className: "h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10",
          children: "VIP"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => setResult("fail"),
          variant: "outline",
          className: "h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10",
          children: "Reject"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setResult("idle"),
        className: "mt-3 text-center text-xs text-white/50 hover:text-white",
        children: "Reset scanner"
      }
    )
  ] }) });
}
function ScannerRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScannerMobile, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScannerDesktop, {}) })
  ] });
}
export {
  ScannerRoute as component
};
