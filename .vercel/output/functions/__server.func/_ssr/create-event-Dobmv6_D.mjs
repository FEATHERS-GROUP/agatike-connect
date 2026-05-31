import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { L as Label } from "./label-B0bQ303g.mjs";
import { T as Textarea } from "./textarea-CxjW2y2Y.mjs";
import { d as categories } from "./router-EgqkzaPB.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import {
  j as Check,
  b as ArrowLeft,
  I as Image,
  r as Crown,
  J as MapPin,
  a3 as Sparkles,
  aa as Upload,
  c as ArrowRight,
  T as Plus,
  a6 as Trash2,
  a0 as ShoppingBag,
  C as Calendar,
} from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
const steps$1 = ["Basics", "Media", "Tickets", "Venue", "Publish"];
function CreateEventMobile() {
  useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [data, setData] = reactExports.useState({
    title: "",
    category: categories[0],
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    coverPreview: "",
    published: false,
  });
  const [tickets, setTickets] = reactExports.useState([
    { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
  ]);
  const updateField = (k, v) => setData({ ...data, [k]: v });
  const onCoverUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };
  if (data.published) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className:
        "min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className:
              "h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, {
              className: "h-8 w-8 text-primary-foreground",
            }),
          }),
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
          className: "text-3xl font-bold tracking-tight mb-2",
          children: "Event Published!",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
          className: "text-muted-foreground mb-8",
          children: ['"', data.title, '" is now live and ready for tickets.'],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/events/$eventId",
          params: { eventId: "1" },
          className: "w-full",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            className: "w-full h-12 rounded-full font-bold text-lg mb-3",
            children: "View Event Page",
          }),
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/dashboard",
          className: "w-full",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            variant: "outline",
            className: "w-full h-12 rounded-full font-bold text-lg",
            children: "Back to Dashboard",
          }),
        }),
      ],
    });
  }
  const next = () => setStep(Math.min(steps$1.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen bg-background pb-24 pt-safe-top",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className:
          "px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "/dashboard",
            className: "p-2 -ml-2 text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" }),
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "flex gap-1 items-center",
            children: steps$1.map((_, i) =>
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-2 w-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : i < step ? "bg-primary/50" : "bg-border"}`,
                },
                i,
              ),
            ),
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
            className: "text-primary font-bold text-sm p-2 -mr-2",
            children: "Save",
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "px-4 py-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
            className: "text-2xl font-bold tracking-tight mb-1",
            children: steps$1[step],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
            className: "text-sm text-muted-foreground mb-8",
            children: [
              step === 0 && "Let's start with the essential details.",
              step === 1 && "Add visuals to make your event stand out.",
              step === 2 && "Set up ticket tiers and pricing.",
              step === 3 && "Where is the magic happening?",
              step === 4 && "Review and make it live.",
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "space-y-6",
            children: [
              step === 0 &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                          className: "text-base font-semibold",
                          children: "Event Title",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                          value: data.title,
                          onChange: (e) => updateField("title", e.target.value),
                          placeholder: "AfroFuture Festival",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent text-lg px-4",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                          className: "text-base font-semibold",
                          children: "Category",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("select", {
                          value: data.category,
                          onChange: (e) => updateField("category", e.target.value),
                          className:
                            "mt-2 h-14 w-full rounded-2xl bg-secondary/50 border-transparent text-base px-4",
                          children: categories.map((c) =>
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: c }, c),
                          ),
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "grid grid-cols-2 gap-4",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                              className: "text-base font-semibold",
                              children: "Date",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                              type: "date",
                              value: data.date,
                              onChange: (e) => updateField("date", e.target.value),
                              className:
                                "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                              className: "text-base font-semibold",
                              children: "Time",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                              type: "time",
                              value: data.time,
                              onChange: (e) => updateField("time", e.target.value),
                              className:
                                "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                          className: "text-base font-semibold",
                          children: "Description",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, {
                          rows: 4,
                          value: data.description,
                          onChange: (e) => updateField("description", e.target.value),
                          placeholder: "Tell people what to expect...",
                          className:
                            "mt-2 rounded-2xl bg-secondary/50 border-transparent p-4 text-base",
                        }),
                      ],
                    }),
                  ],
                }),
              step === 1 &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                      className: "text-base font-semibold",
                      children: "Cover Media",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", {
                      className:
                        "block relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 transition active:scale-95 cursor-pointer",
                      children: [
                        data.coverPreview
                          ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                              src: data.coverPreview,
                              alt: "cover",
                              className: "h-full w-full object-cover",
                            })
                          : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className:
                                "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, {
                                  className: "h-10 w-10 mb-4 opacity-50",
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                  className: "font-semibold text-foreground mb-1",
                                  children: "Tap to upload poster",
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                  className: "text-xs",
                                  children: "Supports Images & Vertical Video",
                                }),
                              ],
                            }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                          type: "file",
                          accept: "image/*,video/*",
                          hidden: true,
                          onChange: onCoverUpload,
                        }),
                      ],
                    }),
                  ],
                }),
              step === 2 &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    tickets.map((t) =>
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className:
                            "rounded-3xl border border-border/40 bg-card p-4 shadow-sm relative overflow-hidden",
                          children: [
                            t.type === "vip" &&
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                                className:
                                  "absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl font-bold text-[10px] uppercase",
                                children: "VIP",
                              }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className: "grid gap-3 pt-2",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                  value: t.name,
                                  onChange: (e) =>
                                    setTickets(
                                      tickets.map((x) =>
                                        x.id === t.id ? { ...x, name: e.target.value } : x,
                                      ),
                                    ),
                                  placeholder: "Ticket Name",
                                  className:
                                    "h-12 rounded-xl bg-secondary/50 border-transparent font-bold",
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                  className: "grid grid-cols-2 gap-3",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                      className: "relative",
                                      children: [
                                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                                          className:
                                            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold",
                                          children: "$",
                                        }),
                                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                          type: "number",
                                          value: t.price,
                                          onChange: (e) =>
                                            setTickets(
                                              tickets.map((x) =>
                                                x.id === t.id
                                                  ? { ...x, price: Number(e.target.value) }
                                                  : x,
                                              ),
                                            ),
                                          className:
                                            "h-12 rounded-xl bg-secondary/50 border-transparent pl-8 font-bold",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                      type: "number",
                                      value: t.quantity,
                                      onChange: (e) =>
                                        setTickets(
                                          tickets.map((x) =>
                                            x.id === t.id
                                              ? { ...x, quantity: Number(e.target.value) }
                                              : x,
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
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                              variant: "ghost",
                              className:
                                "w-full mt-2 text-destructive hover:bg-destructive/10 h-10 rounded-xl",
                              onClick: () => setTickets(tickets.filter((x) => x.id !== t.id)),
                              children: "Remove",
                            }),
                          ],
                        },
                        t.id,
                      ),
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                          variant: "outline",
                          className: "flex-1 rounded-2xl h-12 border-dashed font-bold",
                          onClick: () =>
                            setTickets([
                              ...tickets,
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
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                          variant: "outline",
                          className:
                            "flex-1 rounded-2xl h-12 border-dashed font-bold border-primary text-primary hover:bg-primary/10",
                          onClick: () =>
                            setTickets([
                              ...tickets,
                              {
                                id: crypto.randomUUID(),
                                name: "VIP Pass",
                                price: 100,
                                quantity: 20,
                                type: "vip",
                              },
                            ]),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, {
                              className: "h-4 w-4 mr-2",
                            }),
                            " VIP Pass",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              step === 3 &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                          className: "text-base font-semibold",
                          children: "Venue Name",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                          value: data.venue,
                          onChange: (e) => updateField("venue", e.target.value),
                          placeholder: "e.g. BK Arena",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                          className: "text-base font-semibold",
                          children: "City",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                          value: data.city,
                          onChange: (e) => updateField("city", e.target.value),
                          placeholder: "e.g. Kigali, RW",
                          className:
                            "mt-2 h-14 rounded-2xl bg-secondary/50 border-transparent px-4",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className:
                        "aspect-[4/3] rounded-3xl overflow-hidden bg-secondary relative mt-4",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                          className: "absolute inset-0 bg-primary/10",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          className:
                            "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, {
                              className: "h-8 w-8 mb-2 opacity-50",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                              className: "font-semibold text-foreground",
                              children: "Interactive Map Preview",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              step === 4 &&
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "rounded-3xl border border-border/40 overflow-hidden bg-card",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        className: "aspect-[4/3] bg-secondary relative",
                        children: [
                          data.coverPreview &&
                            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                              src: data.coverPreview,
                              className: "w-full h-full object-cover",
                            }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                            className:
                              "absolute top-3 left-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md",
                            children: data.category,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        className: "p-4",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
                            className: "text-xl font-bold mb-1",
                            children: data.title || "Untitled Event",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                            className: "text-sm text-muted-foreground mb-4",
                            children: [data.date, " at ", data.time, " • ", data.venue],
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "border-t border-border/40 pt-4 space-y-2",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                className:
                                  "text-xs font-bold text-muted-foreground uppercase tracking-wider",
                                children: "Tickets Configured",
                              }),
                              tickets.map((t) =>
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                                        children: [t.quantity, "x ", t.name],
                                      }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                                        className: "font-bold",
                                        children: ["$", t.price],
                                      }),
                                    ],
                                  },
                                  t.id,
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className:
          "fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex gap-3",
          children: [
            step > 0 &&
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                variant: "secondary",
                onClick: prev,
                className: "h-14 rounded-full px-6 font-bold",
                children: "Back",
              }),
            step < steps$1.length - 1
              ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                  onClick: next,
                  className:
                    "flex-1 h-14 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]",
                  style: { background: "var(--gradient-primary)" },
                  children: "Next Step",
                })
              : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                  onClick: () => setData({ ...data, published: true }),
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
const steps = ["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP", "Publish"];
function CreateEventDesktop() {
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [data, setData] = reactExports.useState({
    title: "",
    category: categories[0],
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    address: "",
    coverPreview: "",
    vipPerks: "Priority entry, VIP lounge, complimentary welcome drink",
    published: false,
  });
  const [tickets, setTickets] = reactExports.useState([
    { id: "1", name: "General Admission", price: 25, quantity: 200, type: "paid" },
  ]);
  const [merch, setMerch] = reactExports.useState([{ id: "m1", name: "Event Tee", price: 20 }]);
  const StepIndicator = /* @__PURE__ */ jsxRuntimeExports.jsx("ol", {
    className: "grid grid-cols-7 gap-2",
    children: steps.map((s, i) =>
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: `rounded-2xl border p-3 text-xs ${i < step ? "border-primary bg-accent/40" : i === step ? "border-primary bg-background shadow-[var(--shadow-glow)]" : "border-border/60 bg-background"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
              className: "text-muted-foreground",
              children: ["Step ", i + 1],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "mt-0.5 font-medium text-foreground",
              children: s,
            }),
          ],
        },
        s,
      ),
    ),
  });
  const updateField = (k, v) => setData({ ...data, [k]: v });
  const onCoverUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    updateField("coverPreview", url);
  };
  if (data.published) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "min-h-screen bg-background",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "mx-auto max-w-xl px-6 py-24 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className:
                "mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground animate-scale-in",
              style: { background: "var(--gradient-primary)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8" }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", {
              className: "mt-6 text-3xl font-semibold tracking-tight",
              children: [data.title || "Your event", " is live"],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "mt-2 text-muted-foreground",
              children: "Share the link with your community and start selling tickets.",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "mt-6 flex justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                  to: "/dashboard",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                    variant: "outline",
                    className: "rounded-full",
                    children: "Back to dashboard",
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                  to: "/events",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
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
  }
  const next = () => setStep(Math.min(steps.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen bg-secondary/30",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "mx-auto max-w-5xl px-6 py-10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
            to: "/dashboard",
            className:
              "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              " Back to dashboard",
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "mt-4 flex items-end justify-between",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                    className: "text-2xl font-semibold tracking-tight",
                    children: "Create a new event",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                    className: "text-sm text-muted-foreground",
                    children: ["Step ", step + 1, " of ", steps.length, " · ", steps[step]],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                className:
                  "inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                  " Draft auto-saved",
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "mt-6",
            children: StepIndicator,
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className:
              "mt-6 rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]",
            children: [
              steps[step] === "Details" &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event title" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                          value: data.title,
                          onChange: (e) => updateField("title", e.target.value),
                          placeholder: "Afrobeats Night Live",
                          className: "mt-1",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "grid gap-4 md:grid-cols-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("select", {
                              value: data.category,
                              onChange: (e) => updateField("category", e.target.value),
                              className:
                                "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
                              children: categories.map((c) =>
                                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: c }, c),
                              ),
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          className: "grid grid-cols-2 gap-4",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                  type: "date",
                                  value: data.date,
                                  onChange: (e) => updateField("date", e.target.value),
                                  className: "mt-1",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Time" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                  type: "time",
                                  value: data.time,
                                  onChange: (e) => updateField("time", e.target.value),
                                  className: "mt-1",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, {
                          rows: 5,
                          value: data.description,
                          onChange: (e) => updateField("description", e.target.value),
                          placeholder: "Tell people what makes this night special…",
                          className: "mt-1",
                        }),
                      ],
                    }),
                  ],
                }),
              steps[step] === "Tickets" &&
                /* @__PURE__ */ jsxRuntimeExports.jsx(TicketEditor, { tickets, setTickets }),
              steps[step] === "Venue" &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "grid gap-4 md:grid-cols-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                              children: "Venue name",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                              value: data.venue,
                              onChange: (e) => updateField("venue", e.target.value),
                              placeholder: "Eko Convention Centre",
                              className: "mt-1",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                              value: data.city,
                              onChange: (e) => updateField("city", e.target.value),
                              placeholder: "Lagos, NG",
                              className: "mt-1",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                          value: data.address,
                          onChange: (e) => updateField("address", e.target.value),
                          placeholder: "Plot 1415 Adetokunbo Ademola Street, Victoria Island",
                          className: "mt-1",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                      className:
                        "aspect-[16/8] rounded-2xl border border-dashed border-border bg-secondary/40 grid place-items-center text-sm text-muted-foreground",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                        className: "inline-flex items-center gap-2",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
                          " Map preview appears here",
                        ],
                      }),
                    }),
                  ],
                }),
              steps[step] === "Media" &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cover image" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", {
                      className:
                        "block aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition hover:border-primary",
                      children: [
                        data.coverPreview
                          ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                              src: data.coverPreview,
                              alt: "cover",
                              className: "h-full w-full object-cover",
                            })
                          : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                              className:
                                "grid h-full place-items-center text-sm text-muted-foreground",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                                className: "text-center",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, {
                                    className: "mx-auto h-6 w-6",
                                  }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                    className: "mt-2",
                                    children: "Click to upload (any image)",
                                  }),
                                ],
                              }),
                            }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                          type: "file",
                          accept: "image/*",
                          hidden: true,
                          onChange: onCoverUpload,
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children: "Recommended 1920×1080. We auto-generate social cards.",
                    }),
                  ],
                }),
              steps[step] === "Merchandise" &&
                /* @__PURE__ */ jsxRuntimeExports.jsx(MerchEditor, { merch, setMerch }),
              steps[step] === "VIP" &&
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className:
                        "flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 p-4",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, {
                          className: "h-5 w-5 text-primary",
                        }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          className: "text-sm",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                              className: "font-medium",
                              children: "VIP access",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                              className: "text-muted-foreground",
                              children: "Define the experience for premium ticket holders.",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VIP perks" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, {
                          rows: 5,
                          value: data.vipPerks,
                          onChange: (e) => updateField("vipPerks", e.target.value),
                          className: "mt-1",
                        }),
                      ],
                    }),
                  ],
                }),
              steps[step] === "Publish" &&
                /* @__PURE__ */ jsxRuntimeExports.jsx(PublishReview, {
                  data,
                  tickets,
                  merch,
                  onPublish: () => setData({ ...data, published: true }),
                }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "mt-8 flex items-center justify-between border-t border-border/60 pt-6",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                    variant: "outline",
                    onClick: prev,
                    disabled: step === 0,
                    className: "rounded-full",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, {
                        className: "mr-1 h-4 w-4",
                      }),
                      " Back",
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                        variant: "ghost",
                        onClick: () => navigate({ to: "/dashboard" }),
                        children: "Save & exit",
                      }),
                      step < steps.length - 1
                        ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                            onClick: next,
                            className: "rounded-full",
                            style: { background: "var(--gradient-primary)" },
                            children: [
                              "Continue ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, {
                                className: "ml-1 h-4 w-4",
                              }),
                            ],
                          })
                        : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                            onClick: () => setData({ ...data, published: true }),
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
function TicketEditor({ tickets, setTickets }) {
  const add = (type) =>
    setTickets([
      ...tickets,
      {
        id: crypto.randomUUID(),
        name:
          type === "free"
            ? "Free RSVP"
            : type === "vip"
              ? "VIP"
              : type === "early"
                ? "Early Bird"
                : "Paid Ticket",
        price: type === "free" ? 0 : type === "vip" ? 95 : 25,
        quantity: 100,
        type,
      },
    ]);
  const update = (id, patch) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-4",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex flex-wrap gap-2",
        children: ["paid", "free", "early", "vip"].map((t) =>
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "rounded-full",
              onClick: () => add(t),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
                " ",
                t === "paid"
                  ? "Paid"
                  : t === "free"
                    ? "Free"
                    : t === "early"
                      ? "Early bird"
                      : "VIP",
              ],
            },
            t,
          ),
        ),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "space-y-3",
        children: [
          tickets.map((t) =>
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className:
                  "grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_120px_120px_auto]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                    value: t.name,
                    onChange: (e) => update(t.id, { name: e.target.value }),
                    placeholder: "Ticket name",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                    type: "number",
                    value: t.price,
                    onChange: (e) => update(t.id, { price: Number(e.target.value) }),
                    placeholder: "Price",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                    type: "number",
                    value: t.quantity,
                    onChange: (e) => update(t.id, { quantity: Number(e.target.value) }),
                    placeholder: "Quantity",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                    variant: "ghost",
                    size: "icon",
                    onClick: () => setTickets(tickets.filter((x) => x.id !== t.id)),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, {
                      className: "h-4 w-4 text-muted-foreground",
                    }),
                  }),
                ],
              },
              t.id,
            ),
          ),
          tickets.length === 0 &&
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "No tickets yet — add one above.",
            }),
        ],
      }),
    ],
  });
}
function MerchEditor({ merch, setMerch }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-4",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "inline-flex items-center gap-2 text-sm text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
              " Sell merch alongside tickets",
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
            variant: "outline",
            size: "sm",
            className: "rounded-full",
            onClick: () => setMerch([...merch, { id: crypto.randomUUID(), name: "", price: 0 }]),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
              " Add item",
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "space-y-3",
        children: merch.map((m) =>
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className:
                "grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_140px_auto]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                  value: m.name,
                  onChange: (e) =>
                    setMerch(
                      merch.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)),
                    ),
                  placeholder: "Tour Tee, Parking Pass…",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                  type: "number",
                  value: m.price,
                  onChange: (e) =>
                    setMerch(
                      merch.map((x) =>
                        x.id === m.id ? { ...x, price: Number(e.target.value) } : x,
                      ),
                    ),
                  placeholder: "Price",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => setMerch(merch.filter((x) => x.id !== m.id)),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, {
                    className: "h-4 w-4 text-muted-foreground",
                  }),
                }),
              ],
            },
            m.id,
          ),
        ),
      }),
    ],
  });
}
function PublishReview({ data, tickets, merch, onPublish }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "space-y-5",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "overflow-hidden rounded-2xl border border-border/60",
        children: [
          data.coverPreview
            ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                src: data.coverPreview,
                alt: "",
                className: "aspect-[16/8] w-full object-cover",
              })
            : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "aspect-[16/8] w-full bg-secondary",
              }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-xs uppercase tracking-wider text-muted-foreground",
                children: data.category,
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
                className: "mt-1 text-2xl font-semibold",
                children: data.title || "Untitled event",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                      " ",
                      data.date || "TBD",
                      " · ",
                      data.time || "TBD",
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
                      " ",
                      data.venue || "TBD",
                      ", ",
                      data.city || "",
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "mt-3 text-sm",
                children: data.description || "No description yet.",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "rounded-2xl border border-border/60 p-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                className: "text-sm font-semibold",
                children: ["Tickets (", tickets.length, ")"],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
                className: "mt-2 space-y-1 text-sm text-muted-foreground",
                children: tickets.map((t) =>
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "li",
                    { children: ["· ", t.name, " — $", t.price, " × ", t.quantity] },
                    t.id,
                  ),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "rounded-2xl border border-border/60 p-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                className: "text-sm font-semibold",
                children: ["Merchandise (", merch.length, ")"],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
                className: "mt-2 space-y-1 text-sm text-muted-foreground",
                children: merch.map((m) =>
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "li",
                    { children: ["· ", m.name || "(unnamed)", " — $", m.price] },
                    m.id,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        onClick: onPublish,
        className: "w-full h-12 rounded-2xl shadow-[var(--shadow-glow)]",
        style: { background: "var(--gradient-primary)" },
        children: "Publish event",
      }),
    ],
  });
}
function CreateEventRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "md:hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateEventMobile, {}),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "hidden md:block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateEventDesktop, {}),
      }),
    ],
  });
}
export { CreateEventRoute as component };
