import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a4 as Star, J as MapPin, ac as Users } from "../_libs/lucide-react.mjs";
function EventCard({ event }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
    to: "/events/$eventId",
    params: { eventId: event.id },
    className:
      "group relative block overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "relative aspect-[4/5] overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
            src: event.cover,
            alt: event.title,
            loading: "lazy",
            className:
              "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "absolute inset-0",
            style: { background: "var(--gradient-dark)" },
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "absolute top-3 left-3 flex gap-2",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
              className:
                "rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur",
              children: event.category,
            }),
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className:
              "absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {
                className: "h-3 w-3 fill-primary text-primary",
              }),
              " ",
              event.rating,
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "absolute bottom-0 left-0 right-0 p-4 text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                className: "text-xs uppercase tracking-wider opacity-80",
                children: [event.date, " · ", event.time],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
                className: "mt-1 text-lg font-semibold leading-tight line-clamp-2",
                children: event.title,
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "mt-2 flex items-center justify-between text-xs opacity-90",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                      " ",
                      event.city,
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                    className: "inline-flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                      " ",
                      event.attendees.toLocaleString(),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex items-center justify-between px-4 py-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "text-xs text-muted-foreground",
            children: [
              "by ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                className: "text-foreground font-medium",
                children: event.organizer,
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "text-sm font-semibold",
            children: event.price === 0 ? "Free" : `from ${event.currency || "$"}${event.price}`,
          }),
        ],
      }),
    ],
  });
}
export { EventCard as E };
