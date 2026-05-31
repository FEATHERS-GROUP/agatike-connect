import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { L as Label } from "./label-B0bQ303g.mjs";
import { h as hero } from "./hero-event-BMhEj-B-.mjs";
import { a as Apple, M as Mail, z as Lock, u as EyeOff, t as Eye } from "../_libs/lucide-react.mjs";
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
function SignIn() {
  const [mode, setMode] = reactExports.useState("signin");
  const [showPw, setShowPw] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [submitted, setSubmitted] = reactExports.useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className:
          "mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "relative hidden overflow-hidden rounded-3xl lg:block",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                src: hero,
                alt: "",
                className: "h-[640px] w-full object-cover",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className:
                  "absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "absolute bottom-0 left-0 right-0 p-10 text-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "text-sm opacity-80",
                    children: "Africa's premium social event platform",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
                    className: "mt-2 text-3xl font-semibold leading-tight",
                    children: "Where the culture meets the calendar.",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "mt-3 text-sm opacity-80",
                    children: "Sign in to save events, follow organizers and unlock VIP drops.",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "mx-auto w-full max-w-md",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className:
                  "rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                        className:
                          "grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold",
                        style: {
                          background: "var(--gradient-primary)",
                        },
                        children: "A",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className: "text-lg font-semibold",
                        children: "Agatike",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                    className: "mt-6 text-2xl font-semibold tracking-tight",
                    children: mode === "signin" ? "Welcome back" : "Create your account",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "mt-1 text-sm text-muted-foreground",
                    children:
                      mode === "signin"
                        ? "Sign in to keep the culture moving."
                        : "Join thousands discovering events across Africa.",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "mt-6 grid grid-cols-2 gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                        variant: "outline",
                        type: "button",
                        className: "rounded-xl",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                            className:
                              "mr-2 inline-block h-4 w-4 rounded-full bg-[conic-gradient(at_50%_50%,#ea4335,#fbbc05,#34a853,#4285f4)]",
                          }),
                          "Google",
                        ],
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                        variant: "outline",
                        type: "button",
                        className: "rounded-xl",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, {
                            className: "mr-2 h-4 w-4",
                          }),
                          " Apple",
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "my-5 flex items-center gap-3 text-xs text-muted-foreground",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className: "h-px flex-1 bg-border",
                      }),
                      " or with email",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className: "h-px flex-1 bg-border",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
                    onSubmit,
                    className: "space-y-4",
                    children: [
                      mode === "signup" &&
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                              htmlFor: "name",
                              children: "Full name",
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                              id: "name",
                              required: true,
                              placeholder: "Amaka Okafor",
                              className: "mt-1",
                            }),
                          ],
                        }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                            htmlFor: "email",
                            children: "Email",
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "relative mt-1",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {
                                className:
                                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                id: "email",
                                required: true,
                                type: "email",
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                placeholder: "you@agatike.com",
                                className: "pl-9",
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, {
                                htmlFor: "pw",
                                children: "Password",
                              }),
                              mode === "signin" &&
                                /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                                  type: "button",
                                  className: "text-xs text-primary hover:underline",
                                  children: "Forgot?",
                                }),
                            ],
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "relative mt-1",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {
                                className:
                                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                                id: "pw",
                                required: true,
                                type: showPw ? "text" : "password",
                                placeholder: "••••••••",
                                className: "pl-9 pr-10",
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                                type: "button",
                                onClick: () => setShowPw(!showPw),
                                className:
                                  "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                                children: showPw
                                  ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, {
                                      className: "h-4 w-4",
                                    })
                                  : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, {
                                      className: "h-4 w-4",
                                    }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                        type: "submit",
                        className: "h-11 w-full rounded-xl shadow-[var(--shadow-glow)]",
                        style: {
                          background: "var(--gradient-primary)",
                        },
                        children: mode === "signin" ? "Sign in" : "Create account",
                      }),
                      submitted &&
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                          className:
                            "rounded-xl bg-accent px-3 py-2 text-center text-xs text-accent-foreground animate-fade-in",
                          children:
                            "Demo mode — auth isn't wired yet. Hook this form up when Agatike Cloud is enabled.",
                        }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                    className: "mt-6 text-center text-sm text-muted-foreground",
                    children: [
                      mode === "signin" ? "New to Agatike?" : "Already have an account?",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                        onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
                        className: "font-medium text-primary hover:underline",
                        children: mode === "signin" ? "Create an account" : "Sign in",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                className: "mt-4 text-center text-xs text-muted-foreground",
                children: [
                  "By continuing you agree to our",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                    to: "/",
                    className: "underline",
                    children: "Terms",
                  }),
                  " ",
                  "and",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                    to: "/",
                    className: "underline",
                    children: "Privacy",
                  }),
                  ".",
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { SignIn as component };
