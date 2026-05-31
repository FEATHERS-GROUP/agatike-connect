import { q as s, o as d, m as r, L as i } from "./index-BbCjida8.js";
import { N as t } from "./Navbar-8zxmLK7V.js";
import { F as o } from "./Footer-CxcHC3QW.js";
import { S as m, F as c } from "./FeedCard-CKEA7cdP.js";
import { B as l } from "./button-BtHMdeJ3.js";
import "./input-Bn2qJlr0.js";
import "./plus-DEJHAl15.js";
import "./x-B77yeb99.js";
import "./calendar-days-Bc2SBC-l.js";
import "./send-i6bAB18C.js";
function b() {
  return s.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      s.jsx(t, {}),
      s.jsxs("div", {
        className: "mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]",
        children: [
          s.jsxs("main", {
            children: [
              s.jsx(m, {}),
              s.jsx("div", {
                className: "mt-8 space-y-8",
                children: d.map((e, a) => s.jsx(c, { post: e }, `${e.id}-${a}`)),
              }),
            ],
          }),
          s.jsxs("aside", {
            className: "hidden lg:block space-y-6",
            children: [
              s.jsxs("div", {
                className: "rounded-2xl border border-border/60 bg-card p-5",
                children: [
                  s.jsx("p", { className: "text-sm font-semibold", children: "Upcoming for you" }),
                  s.jsx("div", {
                    className: "mt-4 space-y-3",
                    children: r
                      .slice(0, 3)
                      .map((e) =>
                        s.jsxs(
                          i,
                          {
                            to: "/events/$eventId",
                            params: { eventId: e.id },
                            className:
                              "flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition",
                            children: [
                              s.jsx("img", {
                                src: e.cover,
                                className: "h-12 w-12 rounded-lg object-cover",
                                alt: e.title,
                              }),
                              s.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  s.jsx("p", {
                                    className: "truncate text-sm font-medium",
                                    children: e.title,
                                  }),
                                  s.jsxs("p", {
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
              s.jsxs("div", {
                className: "rounded-2xl border border-border/60 bg-card p-5",
                children: [
                  s.jsx("p", {
                    className: "text-sm font-semibold",
                    children: "Suggested organizers",
                  }),
                  s.jsx("div", {
                    className: "mt-4 space-y-3",
                    children: r
                      .slice(2, 5)
                      .map((e) =>
                        s.jsxs(
                          "div",
                          {
                            className: "flex items-center gap-3",
                            children: [
                              s.jsx("img", {
                                src: e.cover,
                                className: "h-10 w-10 rounded-full object-cover",
                                alt: e.organizer,
                              }),
                              s.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  s.jsx("p", {
                                    className: "truncate text-sm font-medium",
                                    children: e.organizer,
                                  }),
                                  s.jsxs("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: ["@", e.organizerHandle],
                                  }),
                                ],
                              }),
                              s.jsx(l, {
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
      s.jsx(o, {}),
    ],
  });
}
export { b as component };
