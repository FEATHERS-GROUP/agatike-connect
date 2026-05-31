import { q as s, L as a } from "./index-BbCjida8.js";
import { S as r } from "./star-CtaeFg5C.js";
import { M as t } from "./map-pin-C2ftX2X_.js";
import { U as l } from "./users-Cp-Hr28i.js";
function n({ event: e }) {
  return s.jsxs(a, {
    to: "/events/$eventId",
    params: { eventId: e.id },
    className:
      "group relative block overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]",
    children: [
      s.jsxs("div", {
        className: "relative aspect-[4/5] overflow-hidden",
        children: [
          s.jsx("img", {
            src: e.cover,
            alt: e.title,
            loading: "lazy",
            className:
              "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110",
          }),
          s.jsx("div", {
            className: "absolute inset-0",
            style: { background: "var(--gradient-dark)" },
          }),
          s.jsx("div", {
            className: "absolute top-3 left-3 flex gap-2",
            children: s.jsx("span", {
              className:
                "rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur",
              children: e.category,
            }),
          }),
          s.jsxs("div", {
            className:
              "absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur",
            children: [s.jsx(r, { className: "h-3 w-3 fill-primary text-primary" }), " ", e.rating],
          }),
          s.jsxs("div", {
            className: "absolute bottom-0 left-0 right-0 p-4 text-white",
            children: [
              s.jsxs("p", {
                className: "text-xs uppercase tracking-wider opacity-80",
                children: [e.date, " · ", e.time],
              }),
              s.jsx("h3", {
                className: "mt-1 text-lg font-semibold leading-tight line-clamp-2",
                children: e.title,
              }),
              s.jsxs("div", {
                className: "mt-2 flex items-center justify-between text-xs opacity-90",
                children: [
                  s.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [s.jsx(t, { className: "h-3 w-3" }), " ", e.city],
                  }),
                  s.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      s.jsx(l, { className: "h-3 w-3" }),
                      " ",
                      e.attendees.toLocaleString(),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      s.jsxs("div", {
        className: "flex items-center justify-between px-4 py-3",
        children: [
          s.jsxs("div", {
            className: "text-xs text-muted-foreground",
            children: [
              "by ",
              s.jsx("span", { className: "text-foreground font-medium", children: e.organizer }),
            ],
          }),
          s.jsx("div", {
            className: "text-sm font-semibold",
            children: e.price === 0 ? "Free" : `from ${e.currency || "$"}${e.price}`,
          }),
        ],
      }),
    ],
  });
}
export { n as E };
