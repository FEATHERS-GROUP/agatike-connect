import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { g as events } from "./router-EgqkzaPB.mjs";
import { Y as Settings, D as DollarSign, a7 as TrendingUp, T as Plus, V as ScanLine, l as ChevronRight, a5 as Ticket, i as ChartColumn, L as LayoutDashboard, f as Building2, g as CalendarDays, ac as Users, a0 as ShoppingBag, r as Crown, K as Megaphone, ad as Wallet, t as Eye } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function DashboardMobile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24 pt-safe-top text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-30 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-xl tracking-tight", children: "Organizer Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "gatike_user_admin" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 -mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6 text-foreground" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-6 relative overflow-hidden bg-card border border-border/40 shadow-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
          " Total Revenue (30d)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-bold tracking-tight mb-2", children: "$48,920" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-primary text-sm font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
          " +18.4% vs last month"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 h-16 w-full flex items-end justify-between", children: [4, 7, 5, 8, 6, 9, 12, 10, 14, 11, 15, 13].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-1.5 bg-primary/80 rounded-t-sm",
            style: { height: `${h * 10}%` }
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/create-event",
            className: "bg-primary text-primary-foreground rounded-3xl p-4 flex flex-col items-start gap-4 shadow-[var(--shadow-glow)] transition-transform active:scale-95",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/20 p-3 rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Create Event" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/scanner",
            className: "bg-secondary text-foreground rounded-3xl p-4 flex flex-col items-start gap-4 border border-border/40 shadow-sm transition-transform active:scale-95",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background p-3 rounded-2xl border border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-6 w-6 text-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Scan Tickets" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg tracking-tight", children: "Live Now" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse h-2 w-2 bg-primary rounded-full" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/40 bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-base", children: "Afrobeats Night Live" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Eko Convention Center" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-1 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Checked In" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "842 / 1,200" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full bg-secondary rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary w-[70%]" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-2xl p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Bar Sales" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "$3,420" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-2xl p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "VIP Scanned" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "45 / 50" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/40 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-5 w-5 text-muted-foreground mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold mb-1", children: "1,284" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tickets Sold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/40 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5 text-muted-foreground mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold mb-1", children: "92.3k" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Page Views" })
        ] })
      ] })
    ] })
  ] });
}
const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Workspaces", icon: Building2 },
  { label: "Events", icon: CalendarDays },
  { label: "Tickets", icon: Ticket },
  { label: "Analytics", icon: ChartColumn },
  { label: "Attendees", icon: Users },
  { label: "Scanning", icon: ScanLine },
  { label: "Merchandise", icon: ShoppingBag },
  { label: "VIP Access", icon: Crown },
  { label: "Campaigns", icon: Megaphone },
  { label: "Withdrawals", icon: Wallet },
  { label: "Settings", icon: Settings }
];
function DashboardDesktop() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-secondary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 flex items-center gap-2 px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
            style: { background: "var(--gradient-primary)" },
            children: "A"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold", children: "Agatike" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1 text-sm", children: nav.map((n) => {
        const href = n.label === "Workspaces" ? "/workspaces" : n.label === "Scanning" ? "/scanner" : null;
        const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${n.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`;
        return href ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: href, className: cls, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "h-4 w-4" }),
          " ",
          n.label
        ] }, n.label) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: cls, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "h-4 w-4" }),
          " ",
          n.label
        ] }, n.label);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border/60 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Upgrade to Pro" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Branded pages, marketing & advanced analytics." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "mt-3 w-full rounded-full",
            style: { background: "var(--gradient-primary)" },
            children: "Upgrade"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-6 lg:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Welcome back, Nala" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Here's what's happening today" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "rounded-full", children: "Export" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/workspaces", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "rounded-full", children: "Workspaces" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/create-event", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "rounded-full shadow-[var(--shadow-glow)]",
              style: { background: "var(--gradient-primary)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
                " New event"
              ]
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        { label: "Revenue (30d)", value: "$48,920", delta: "+18.4%", icon: DollarSign },
        { label: "Tickets sold", value: "1,284", delta: "+9.1%", icon: Ticket },
        { label: "Page views", value: "92,310", delta: "+24%", icon: Eye },
        { label: "Conversion", value: "6.8%", delta: "+1.2pt", icon: TrendingUp }
      ].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: k.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(k.icon, { className: "h-4 w-4 text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-semibold", children: k.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-primary", children: [
              k.delta,
              " vs last period"
            ] })
          ]
        },
        k.label
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Ticket sales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 text-xs", children: ["7d", "30d", "90d"].map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: `rounded-full px-3 py-1 ${i === 1 ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`,
                children: p
              },
              p
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SalesChart, {}) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Live event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Afrobeats Night Live · Eko" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Checked in", value: "842 / 1,200", pct: 70 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Bar revenue", value: "$3,420", pct: 48 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Merch sold", value: "186", pct: 62 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-5 w-full rounded-full", children: "Open scanner" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl border border-border/60 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Recent orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm text-primary hover:underline", children: "View all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/60", children: events.slice(0, 5).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-6 py-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: e.cover, className: "h-10 w-10 rounded-lg object-cover", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium", children: e.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              e.organizer,
              " · ",
              e.date
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden md:inline text-xs text-muted-foreground", children: [
            "x",
            2 + i
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "$",
            (e.price * (2 + i)).toFixed(0)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground", children: "Paid" })
        ] }, e.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Pricing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Transparent fees. Pay only when you sell." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-4 md:grid-cols-3", children: [
          {
            name: "Free",
            price: "$0",
            desc: "Up to 30 attendees",
            features: ["Free scanning", "Free withdrawals", "Email support"]
          },
          {
            name: "Pro",
            price: "$29/mo",
            featured: true,
            desc: "For growing organizers",
            features: [
              "Branded event pages",
              "Marketing tools",
              "Advanced analytics",
              "Priority support"
            ]
          },
          {
            name: "Enterprise",
            price: "Custom",
            desc: "Stadiums, festivals, conferences",
            features: [
              "Dedicated success team",
              "API access",
              "Custom integrations",
              "On-site staff"
            ]
          }
        ].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `relative rounded-3xl border p-6 ${p.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"} bg-card`,
            children: [
              p.featured && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "absolute -top-3 left-6 rounded-full px-3 py-1 text-xs text-primary-foreground",
                  style: { background: "var(--gradient-primary)" },
                  children: "Most popular"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-3xl font-semibold", children: p.price }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: p.desc }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 space-y-2 text-sm", children: p.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-primary", children: "✓" }),
                " ",
                f
              ] }, f)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: `mt-6 w-full rounded-full ${p.featured ? "" : "bg-foreground text-background hover:bg-foreground/90"}`,
                  style: p.featured ? { background: "var(--gradient-primary)" } : void 0,
                  children: p.featured ? "Start Pro" : p.name === "Enterprise" ? "Contact sales" : "Get started"
                }
              )
            ]
          },
          p.name
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 rounded-3xl border border-border/60 bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Create event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "A 7-step wizard, designed for speed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "rounded-full", style: { background: "var(--gradient-primary)" }, children: "Resume draft" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-6 grid gap-3 md:grid-cols-7", children: ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP access", "Publish"].map(
          (s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: `rounded-2xl border p-3 text-xs ${i < 3 ? "border-primary bg-accent/40" : "border-border/60 bg-background"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                  "Step ",
                  i + 1
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-medium text-foreground", children: s })
              ]
            },
            s
          )
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-center text-xs text-muted-foreground", children: [
        "Need to scan?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scanner", className: "text-primary hover:underline", children: "Open the mobile scanner →" })
      ] })
    ] })
  ] }) });
}
function Stat({ label, value, pct }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full rounded-full",
        style: { width: `${pct}%`, background: "var(--gradient-primary)" }
      }
    ) })
  ] });
}
function SalesChart() {
  const points = [12, 28, 22, 40, 36, 52, 48, 64, 58, 72, 80, 76, 92, 88];
  const max = Math.max(...points);
  const w = 600, h = 220, step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - p / max * (h - 20)}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${w} ${h}`, className: "h-full w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g", x1: "0", x2: "0", y1: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "oklch(0.7 0.2 45)", stopOpacity: "0.35" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "oklch(0.7 0.2 45)", stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: area, fill: "url(#g)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: "oklch(0.7 0.2 45)",
        strokeWidth: "2.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function DashboardRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardMobile, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardDesktop, {}) })
  ] });
}
export {
  DashboardRoute as component
};
