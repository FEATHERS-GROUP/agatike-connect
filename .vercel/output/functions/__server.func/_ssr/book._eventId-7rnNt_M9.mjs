import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { c as Route, g as events, h as experiences } from "./router-EgqkzaPB.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { L as Label } from "./label-B0bQ303g.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { k as ChevronLeft, ad as Wallet, q as CreditCard, a2 as Smartphone, $ as Shield, z as Lock } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function BookingMobile({ eventId }) {
  const navigate = useNavigate();
  const event = events.find((e) => e.id === eventId) || experiences.find((x) => x.id === eventId) || events[0];
  const [paymentMethod, setPaymentMethod] = reactExports.useState("apple");
  const [processing, setProcessing] = reactExports.useState(false);
  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate({ to: "/wallet" });
    }, 1500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground pb-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 pt-safe-top border-b border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/events/$eventId", params: { eventId }, className: "p-2 -ml-2 text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg tracking-tight", children: "Checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-6 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-4", children: "Order Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 bg-card/60 rounded-3xl p-4 border border-border/40 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: event.cover, className: "h-24 w-20 rounded-xl object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base leading-tight mb-1", children: event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-auto", children: [
              event.date,
              " • ",
              event.venue || event.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "1x General Admission" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                event.currency || "$",
                event.price || 25
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-4", children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setPaymentMethod("apple"),
              className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === "apple" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Apple Pay" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fast, secure checkout" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground"}`,
                    children: paymentMethod === "apple" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setPaymentMethod("card"),
              className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === "card" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-secondary rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Credit Card" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Visa, Mastercard, Amex" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground"}`,
                    children: paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setPaymentMethod("momo"),
              className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === "momo" ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Mobile Money" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "MTN MoMo, Airtel Money" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground"}`,
                    children: paymentMethod === "momo" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary" })
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Total to pay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold", children: [
          event.currency || "$",
          event.price || 25
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleCheckout,
          disabled: processing,
          className: "w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide",
          style: { background: "var(--gradient-primary)" },
          children: processing ? "Processing..." : `Pay ${event.currency || "$"}${event.price || 25}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
        " Secure encrypted checkout"
      ] })
    ] })
  ] });
}
function BookingDesktop({ eventId }) {
  const navigate = useNavigate();
  const event = events.find((e) => e.id === eventId) || experiences.find((x) => x.id === eventId) || events[0];
  const [paymentMethod, setPaymentMethod] = reactExports.useState("apple");
  const [processing, setProcessing] = reactExports.useState(false);
  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate({ to: "/wallet" });
    }, 1500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/events/$eventId",
          params: { eventId },
          className: "inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "mr-1 h-4 w-4" }),
            " Back to event"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_400px] gap-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Checkout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Contact Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Alex" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Doe" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "alex@example.com" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", placeholder: "+250 788 123 456" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-8 border-t border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-6", children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPaymentMethod("apple"),
                  className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === "apple" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-foreground text-background rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-6 w-6" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "Apple Pay" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Fast, secure checkout" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground"}`,
                        children: paymentMethod === "apple" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPaymentMethod("card"),
                  className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-secondary rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-6 w-6" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "Credit Card" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Visa, Mastercard, Amex" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground"}`,
                        children: paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" })
                      }
                    )
                  ]
                }
              ),
              paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl bg-secondary/30 border border-border/40 grid gap-4 animate-in fade-in slide-in-from-top-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Card Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "0000 0000 0000 0000" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "MM/YY" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CVC" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "123" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPaymentMethod("momo"),
                  className: `flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === "momo" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-6 w-6" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "Mobile Money" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "MTN MoMo, Airtel Money" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground"}`,
                        children: paymentMethod === "momo" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full bg-primary" })
                      }
                    )
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-6", children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: event.cover, className: "h-24 w-20 rounded-xl object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold leading-tight", children: event.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                event.date,
                " • ",
                event.venue || event.city
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm border-y border-border/60 py-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1x General Admission" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                event.currency || "$",
                event.price || 25
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Service Fee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "$2.50" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end mb-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold", children: [
              event.currency || "$",
              (event.price || 25) + 2.5
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleCheckout,
              disabled: processing,
              className: "w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4",
              style: { background: "var(--gradient-primary)" },
              children: processing ? "Processing..." : `Pay ${event.currency || "$"}${(event.price || 25) + 2.5}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }),
            " SSL Encrypted Checkout"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function BookingRoute() {
  const {
    eventId
  } = Route.useParams();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingMobile, { eventId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingDesktop, { eventId }) })
  ] });
}
export {
  BookingRoute as component
};
