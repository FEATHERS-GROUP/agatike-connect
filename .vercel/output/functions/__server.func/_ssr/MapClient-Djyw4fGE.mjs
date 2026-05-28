import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L } from "../_libs/leaflet.mjs";
import { g as events } from "./router-EgqkzaPB.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { e as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as ArrowLeft, m as CircleCheck, J as MapPin, l as ChevronRight } from "../_libs/lucide-react.mjs";
import { M as MapContainer, T as TileLayer, a as Marker, u as useMap } from "../_libs/react-leaflet.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/react-leaflet__core.mjs";
function MapController({ selectedEvent }) {
  const map = useMap();
  reactExports.useEffect(() => {
    if (selectedEvent && selectedEvent.lat && selectedEvent.lng) {
      map.flyTo([selectedEvent.lat, selectedEvent.lng], 14, { duration: 0.5 });
    }
  }, [selectedEvent, map]);
  return null;
}
function MapClient() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = reactExports.useState(null);
  const defaultCenter = [-1.9441, 30.0619];
  const createCustomIcon = (event, isSelected) => {
    const selectedClass = isSelected ? "scale-125 z-50" : "z-10 hover:scale-110";
    const headHtml = event.hasStory ? `
        <div class="rounded-full p-[2px] shadow-lg" style="background: var(--gradient-primary)">
          <div class="rounded-full bg-background p-[2px]">
            <img src="${event.cover}" class="h-12 w-12 rounded-full object-cover block" />
          </div>
        </div>
      ` : `
        <div class="rounded-full p-[2px] shadow-lg bg-background border border-border/40">
          <img src="${event.cover}" class="h-12 w-12 rounded-full object-cover block" />
        </div>
      `;
    event.hasStory ? "border-t-[#e11d48]" : "border-t-background";
    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative flex flex-col items-center transition-transform duration-300 ${selectedClass}">
          <!-- Pin Head -->
          ${headHtml}
          <!-- Pin Point (Triangle) -->
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] ${event.hasStory ? "border-t-primary" : "border-t-background"} -mt-[1px] shadow-sm drop-shadow-md z-0"></div>
          
          <!-- Label -->
          <div class="mt-1 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-border/40 pointer-events-none">
            <span class="text-[10px] font-bold truncate max-w-[80px] block text-foreground">@${event.organizerHandle}</span>
          </div>
        </div>
      `,
      iconSize: [60, 85],
      iconAnchor: [30, 60]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[100dvh] w-full bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 left-0 right-0 z-[400] pt-safe-top px-4 py-3 flex items-center gap-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => router.history.back(),
          className: "p-2 -ml-2 rounded-full text-white bg-black/20 backdrop-blur-md pointer-events-auto transition-colors active:bg-black/40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-6 w-6" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg text-white drop-shadow-md", children: "Live Map" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      MapContainer,
      {
        center: defaultCenter,
        zoom: 13,
        className: "h-full w-full",
        zoomControl: false,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TileLayer,
            {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapController, { selectedEvent }),
          events.filter((e) => e.lat && e.lng).map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Marker,
            {
              position: [event.lat, event.lng],
              icon: createCustomIcon(event, selectedEvent?.id === event.id),
              eventHandlers: {
                click: () => setSelectedEvent(event)
              }
            },
            event.id
          ))
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `absolute bottom-0 left-0 right-0 z-[400] transition-transform duration-500 ease-in-out ${selectedEvent ? "translate-y-0" : "translate-y-full"}`,
        children: selectedEvent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-border/40 px-6 pt-2 pb-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1.5 bg-secondary mx-auto rounded-full mb-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-16 w-16 rounded-full p-[2px] ${selectedEvent.hasStory ? "" : "border border-border"}`,
                  style: selectedEvent.hasStory ? { background: "var(--gradient-primary)" } : {},
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full rounded-full bg-background p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: selectedEvent.cover,
                      alt: selectedEvent.organizer,
                      className: "h-full w-full rounded-full object-cover"
                    }
                  ) })
                }
              ),
              selectedEvent.hasStory && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background uppercase tracking-wider", children: "Live" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-sm", children: [
                  "@",
                  selectedEvent.organizerHandle
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary fill-primary/20" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg leading-tight truncate", children: selectedEvent.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                " ",
                selectedEvent.venue
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
            selectedEvent.hasStory && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "flex-1 rounded-xl h-12 font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community/$postId", params: { postId: selectedEvent.id }, children: "View Story" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                asChild: true,
                className: `rounded-xl h-12 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent border-0 ${selectedEvent.hasStory ? "flex-1" : "w-full"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/book/$eventId", params: { eventId: selectedEvent.id }, children: [
                  "Book Tickets ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })
                ] })
              }
            )
          ] })
        ] })
      }
    ),
    selectedEvent && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 z-[300] bg-background/20 backdrop-blur-[1px] transition-opacity",
        onClick: () => setSelectedEvent(null)
      }
    )
  ] });
}
export {
  MapClient as default
};
