import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { L as Label } from "./label-B0bQ303g.mjs";
import { T as Textarea } from "./textarea-CxjW2y2Y.mjs";
import { b as ArrowLeft, T as Plus, f as Building2, F as Film, S as Music2, a8 as Trophy, Q as Mountain, j as Check } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const types = [{
  id: "venue",
  title: "Event venue",
  desc: "Rentable space hosting concerts, weddings, conferences.",
  icon: Building2
}, {
  id: "cinema",
  title: "Movie theater",
  desc: "Sell reserved seats, screenings and snack bundles.",
  icon: Film
}, {
  id: "club",
  title: "Nightclub",
  desc: "Recurring nights, guestlists, bottle tables.",
  icon: Music2
}, {
  id: "festival",
  title: "Festival / stadium",
  desc: "Multi-day events with VIP, parking and merch.",
  icon: Trophy
}, {
  id: "tour",
  title: "Experience host",
  desc: "Hikes, run clubs, surf camps, wellness retreats.",
  icon: Mountain
}];
function Workspaces() {
  const [list, setList] = reactExports.useState([{
    id: "w1",
    name: "Nala Sound",
    type: "club",
    city: "Lagos, NG"
  }]);
  const [open, setOpen] = reactExports.useState(false);
  const [type, setType] = reactExports.useState("venue");
  const [name, setName] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [desc, setDesc] = reactExports.useState("");
  const [created, setCreated] = reactExports.useState(false);
  const create = () => {
    if (!name.trim()) return;
    setList([...list, {
      id: crypto.randomUUID(),
      name,
      type,
      city: city || "—"
    }]);
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      setOpen(false);
      setName("");
      setCity("");
      setDesc("");
    }, 1400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-secondary/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to dashboard"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Workspaces" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Each venue, cinema or tour brand gets its own workspace with separate analytics, payouts and staff." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), className: "rounded-full shadow-[var(--shadow-glow)]", style: {
          background: "var(--gradient-primary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " New workspace"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 gap-4 md:grid-cols-2", children: list.map((w) => {
        const t = types.find((x) => x.id === w.type);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground", style: {
            background: "var(--gradient-primary)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: w.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              t.title,
              " · ",
              w.city
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "rounded-full", children: "Open" })
        ] }, w.id);
      }) }),
      open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in", onClick: () => setOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-glow)] animate-scale-in", onClick: (e) => e.stopPropagation(), children: created ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-full text-primary-foreground", style: {
          background: "var(--gradient-primary)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-xl font-semibold", children: "Workspace created" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You can now publish events under this workspace." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold", children: "Create a new workspace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Pick the type of organization you're running." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2", children: types.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setType(t.id), className: `flex items-start gap-3 rounded-2xl border p-3 text-left transition ${type === t.id ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-secondary"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: t.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t.desc })
          ] })
        ] }, t.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Workspace name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Silverbird Cinemas, Karura Run Club", className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary city" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: city, onChange: (e) => setCity(e.target.value), placeholder: "Lagos, NG", className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "About" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: desc, onChange: (e) => setDesc(e.target.value), placeholder: "What does this workspace host?", className: "mt-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: create, disabled: !name.trim(), className: "rounded-full", style: {
            background: "var(--gradient-primary)"
          }, children: "Create workspace" })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  Workspaces as component
};
