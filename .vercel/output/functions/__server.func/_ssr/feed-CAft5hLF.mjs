import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { S as Stories, F as FeedCard } from "./FeedCard-BbM5ZDwU.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { i as feedPosts, g as events } from "./router-EgqkzaPB.mjs";
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
import "./input-B51fUUFa.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function Feed() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("main", {
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stories, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "mt-8 space-y-8",
                children: feedPosts.map((p, i) =>
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCard, { post: p }, `${p.id}-${i}`),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", {
            className: "hidden lg:block space-y-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "rounded-2xl border border-border/60 bg-card p-5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "text-sm font-semibold",
                    children: "Upcoming for you",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "mt-4 space-y-3",
                    children: events.slice(0, 3).map((e) =>
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Link,
                        {
                          to: "/events/$eventId",
                          params: {
                            eventId: e.id,
                          },
                          className:
                            "flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                              src: e.cover,
                              className: "h-12 w-12 rounded-lg object-cover",
                              alt: e.title,
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className: "min-w-0",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                  className: "truncate text-sm font-medium",
                                  children: e.title,
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                                  className: "text-xs text-muted-foreground",
                                  children: [e.date, " · ", e.city],
                                }),
                              ],
                            }),
                          ],
                        },
                        e.id,
                      ),
                    ),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "rounded-2xl border border-border/60 bg-card p-5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "text-sm font-semibold",
                    children: "Suggested organizers",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "mt-4 space-y-3",
                    children: events.slice(2, 5).map((e) =>
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "flex items-center gap-3",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                              src: e.cover,
                              className: "h-10 w-10 rounded-full object-cover",
                              alt: e.organizer,
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                              className: "min-w-0",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                                  className: "truncate text-sm font-medium",
                                  children: e.organizer,
                                }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                                  className: "text-xs text-muted-foreground",
                                  children: ["@", e.organizerHandle],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                              size: "sm",
                              variant: "outline",
                              className: "ml-auto rounded-full",
                              children: "Follow",
                            }),
                          ],
                        },
                        e.id,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    ],
  });
}
export { Feed as component };
