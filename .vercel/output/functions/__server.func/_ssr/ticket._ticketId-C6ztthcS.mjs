import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { R as Route$3, u as upcomingTickets } from "./router-EgqkzaPB.mjs";
import { t as toPng } from "../_libs/html-to-image.mjs";
import { j as jspdf_node_minExports } from "../_libs/jspdf.mjs";
import { Q as QRCode } from "../_libs/react-qr-code.mjs";
import { B as Barcode } from "../_libs/react-barcode.mjs";
import {
  k as ChevronLeft,
  y as LoaderCircle,
  s as Download,
  F as Film,
  e as Briefcase,
  J as MapPin,
  m as CircleCheck,
  a5 as Ticket,
  ab as User,
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "fs";
import "path";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/qr.js.mjs";
import "../_libs/jsbarcode.mjs";
function PrintableTicket({ ticket, id }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    id,
    className:
      "absolute top-0 left-0 -z-50 opacity-0 pointer-events-none bg-white text-black w-[800px] h-[300px] overflow-hidden shadow-none flex",
    style: { fontFamily: "'Inter', sans-serif" },
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicPrintablePass, { ticket }),
  });
}
function DynamicPrintablePass({ ticket }) {
  if (ticket.ticketCategory === "movie") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full h-full flex bg-[#dc2626] text-white",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "flex-1 flex flex-col justify-between p-8 border-r-2 border-dashed border-white/50 relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex justify-between items-start",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "flex-1 pr-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                      className:
                        "text-4xl font-serif italic uppercase tracking-wider mb-1 leading-tight",
                      children: ticket.title,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-base uppercase tracking-widest text-white/80",
                      children: ticket.cinema,
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Film, {
                  className: "w-10 h-10 text-white/30 flex-shrink-0",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "grid grid-cols-2 gap-x-4 gap-y-2 mt-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "bg-white/10 rounded px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-[9px] uppercase tracking-widest text-white/70 mb-0.5",
                      children: "Date",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-base font-bold",
                      children: ticket.date,
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "bg-white/10 rounded px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-[9px] uppercase tracking-widest text-white/70 mb-0.5",
                      children: "Time",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-base font-bold",
                      children: ticket.showtimes?.[0] || "18:30",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "bg-white/10 rounded px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-[9px] uppercase tracking-widest text-white/70 mb-0.5",
                      children: "Screen",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-base font-bold",
                      children: "IMAX 4",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "bg-white/10 rounded px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-[9px] uppercase tracking-widest text-white/70 mb-0.5",
                      children: "Seat",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-base font-bold",
                      children: ticket.seat?.split("·")[1]?.trim() || "H4",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "w-[200px] bg-[#b91c1c] p-6 flex flex-col justify-between items-center text-center relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className:
                "text-2xl font-bold tracking-[0.3em] uppercase -rotate-90 absolute left-4 top-1/2 -translate-y-1/2 text-white/20 whitespace-nowrap",
              children: "Admit One",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "z-10 ml-8 w-full flex flex-col items-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-xs uppercase tracking-widest mb-1 text-white",
                  children: "Booking Ref",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-sm font-mono font-bold mb-4 text-white",
                  children: ticket.orderId,
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "bg-white p-2 rounded-lg flex flex-col items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, {
                      value: ticket.orderId,
                      size: 60,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                      className: "scale-75 origin-top",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode, {
                        value: ticket.orderId,
                        displayValue: false,
                        height: 30,
                        width: 1.5,
                        background: "transparent",
                      }),
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
  if (ticket.ticketCategory === "conference") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full h-full flex bg-[#0ea5e9] text-white",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "flex-1 p-8 border-r-2 border-dashed border-white/50 flex flex-col justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex items-center gap-6",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className:
                    "w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-12 h-12" }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-sm uppercase tracking-widest text-white/80 mb-1",
                      children: "Attendee",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
                      className: "text-4xl font-bold mb-1",
                      children: "Alex Doe",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-xl text-yellow-300 font-medium",
                      children: "Frontend Engineer @ Agatike",
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex justify-between items-end",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
                      className: "text-2xl font-bold mb-1",
                      children: ticket.title,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                      className: "text-white/80 flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                        " ",
                        ticket.venue || ticket.city,
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "text-right",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-xs uppercase tracking-widest text-white/70",
                      children: "Access Level",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                      className: "text-2xl font-black tracking-widest uppercase",
                      children: "ALL ACCESS",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "w-[200px] bg-white text-black p-6 flex flex-col justify-between items-center text-center relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full shadow-inner",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full shadow-inner",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, {
              className: "w-8 h-8 text-[#0ea5e9] mb-2",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-[10px] uppercase tracking-widest text-gray-500 mb-1",
              children: "Registration",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-xs font-mono font-bold mb-auto",
              children: ticket.orderId,
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "w-full mt-4 flex flex-col items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: ticket.orderId, size: 64 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "scale-[0.8] origin-top",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode, {
                    value: ticket.orderId,
                    displayValue: false,
                    height: 40,
                    width: 2,
                    background: "transparent",
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "w-full h-full flex bg-[#1a1a1a] text-white",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className:
          "w-[120px] bg-white text-black flex flex-col items-center justify-between py-6 border-r-2 border-dashed border-gray-400",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: ticket.orderId, size: 70 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "flex-1 flex items-center justify-center -rotate-90",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode, {
              value: ticket.orderId,
              displayValue: true,
              height: 40,
              width: 1.5,
              fontSize: 14,
              background: "transparent",
            }),
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex-1 relative overflow-hidden flex flex-col",
        children: [
          ticket.cover &&
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
              src: ticket.cover,
              alt: "Event",
              className: "absolute inset-0 w-full h-full object-cover opacity-60",
            }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "relative z-10 p-8 flex flex-col justify-between h-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                    className: "text-orange-500 font-bold tracking-[0.3em] uppercase text-sm mb-2",
                    children: "Live Performance",
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                    className:
                      "text-6xl font-black uppercase leading-none drop-shadow-lg max-w-[400px]",
                    children: ticket.title,
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className:
                  "flex gap-6 items-end drop-shadow-md bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-[9px] text-white/70 uppercase tracking-widest mb-0.5",
                        children: "Location",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs font-bold text-white",
                        children: ticket.city,
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs text-white/80",
                        children: ticket.venue,
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-[9px] text-white/70 uppercase tracking-widest mb-0.5",
                        children: "Date",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs font-bold text-white",
                        children: ticket.date,
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-[9px] text-white/70 uppercase tracking-widest mb-0.5",
                        children: "Time",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs font-bold text-orange-400",
                        children: ticket.time,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className:
          "w-[160px] bg-white text-black p-4 flex flex-col justify-center items-center relative border-l-2 border-dashed border-gray-400",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "absolute -left-4 -top-4 w-8 h-8 bg-black rounded-full",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "absolute -left-4 -bottom-4 w-8 h-8 bg-black rounded-full",
          }),
          ticket.ticketCategory === "experience"
            ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "w-full text-center space-y-5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className:
                          "text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Date",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-sm font-black leading-tight",
                        children: ticket.date,
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className:
                          "text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Time",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-sm font-black text-orange-600",
                        children: ticket.time,
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className:
                          "text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Location",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs font-bold leading-tight",
                        children: ticket.city,
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-[10px] text-gray-500 leading-tight",
                        children: ticket.venue,
                      }),
                    ],
                  }),
                ],
              })
            : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "w-full text-center space-y-6",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Gate",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-2xl font-black",
                        children: "12",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Row",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-2xl font-black",
                        children: "24",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-xs uppercase text-gray-400 font-bold tracking-widest mb-1",
                        children: "Seat",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                        className: "text-lg font-black text-orange-600 leading-tight px-1",
                        children: ticket.seat || "36",
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
function TicketViewer() {
  const { ticketId } = Route$3.useParams();
  const ticket = upcomingTickets.find((t) => t.id === ticketId);
  const [isDownloading, setIsDownloading] = reactExports.useState(false);
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const element = document.getElementById("printable-ticket");
      if (!element) throw new Error("Ticket element not found");
      const imgData = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "transparent",
        style: {
          opacity: "1",
        },
      });
      const pdf = new jspdf_node_minExports.jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 300],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 800, 300);
      pdf.save(`agatike-ticket-${ticket?.orderId || ticketId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  if (!ticket) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className:
        "min-h-screen flex flex-col items-center justify-center bg-background text-foreground",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-lg font-bold mb-4",
          children: "Ticket not found",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/profile",
          className: "bg-secondary text-foreground px-6 py-2 rounded-xl font-bold",
          children: "Go back",
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "relative min-h-screen font-sans overflow-hidden",
    children: [
      ticket.cover &&
        /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
              src: ticket.cover,
              alt: "",
              "aria-hidden": true,
              className:
                "absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-60 pointer-events-none select-none",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "absolute inset-0 bg-black/50 pointer-events-none",
            }),
          ],
        }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "relative z-10 px-5 pt-14 pb-36",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "flex items-center justify-between mb-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
                to: "/profile",
                className:
                  "w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, {
                  className: "w-6 h-6 text-white",
                }),
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                className: "font-bold text-lg text-white",
                children: [
                  "Upcoming",
                  " ",
                  ticket.ticketCategory === "movie"
                    ? "Movie"
                    : ticket.ticketCategory === "conference"
                      ? "Conference"
                      : "Event",
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12" }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "mb-6 px-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                className: "text-white/60 text-sm mb-1",
                children: [ticket.date, ", ", ticket.time || ticket.showtimes?.[0]],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                className: "text-3xl font-bold tracking-tight text-white drop-shadow-md",
                children: ticket.title,
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicPass, { ticket }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "fixed bottom-8 left-0 right-0 flex justify-center px-5 z-50",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
          onClick: handleDownload,
          disabled: isDownloading,
          className:
            "bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:bg-orange-600 transition-colors text-lg disabled:opacity-70 disabled:cursor-not-allowed",
          children: [
            isDownloading
              ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, {
                  className: "w-6 h-6 animate-spin",
                })
              : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-6 h-6" }),
            isDownloading ? "Generating PDF..." : "Download PDF",
          ],
        }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PrintableTicket, { id: "printable-ticket", ticket }),
    ],
  });
}
function DynamicPass({ ticket }) {
  const Barcode2 = () =>
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "mt-14 w-full h-16 flex items-center justify-center px-2",
      children: Array.from({
        length: 45,
      }).map((_, i) => {
        const w = (i * 13) % 4 === 0 ? "4px" : (i * 7) % 3 === 0 ? "1px" : "2px";
        const mr = (i * 5) % 2 === 0 ? "2px" : "4px";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-black h-full",
            style: {
              width: w,
              marginRight: mr,
            },
          },
          i,
        );
      }),
    });
  if (ticket.ticketCategory === "movie") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
          children: "Moviegoer",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-2xl font-bold mb-8",
          children: "Alex Doe",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex justify-between items-center mb-6 relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className:
                "w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "w-2 h-2 rounded-full bg-black",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "flex-1 border-t-2 border-dashed border-gray-300 mx-2",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className:
                    "w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "w-full flex justify-center z-10",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "bg-white px-3",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "w-6 h-6" }),
              }),
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex justify-between items-end mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-lg",
                  children: ticket.showtimes?.[0] || "18:30",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mt-1",
                  children: "Start Time",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-right",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-lg",
                  children: ticket.duration || "2h 15m",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mt-1",
                  children: "Duration",
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
          children: "Booking Reference",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-xl font-bold tracking-wide mb-8",
          children: ticket.orderId,
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Cinema",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm truncate",
                  children: ticket.cinema,
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Screen",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm",
                  children: "IMAX 4",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-right",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Seat",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm",
                  children: ticket.seat.split("·")[1]?.trim() || "H4",
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className:
            "absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode2, {}),
      ],
    });
  }
  if (ticket.ticketCategory === "conference") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex justify-between items-start mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
                  children: "Attendee",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-2xl font-bold",
                  children: "Alex Doe",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-[#2dd4bf] font-bold text-sm mt-1",
                  children: "Frontend Engineer",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
              src: "https://i.pravatar.cc/150?u=me",
              alt: "Alex Doe",
              className: "w-14 h-14 rounded-full border-2 border-gray-100",
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex justify-between items-center mb-6 relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className:
                "w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "w-2 h-2 rounded-full bg-black",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "flex-1 border-t-2 border-dashed border-gray-300 mx-2",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className:
                    "w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "w-full flex justify-center z-10",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "bg-white px-3",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, {
                  className: "w-6 h-6",
                }),
              }),
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex justify-between items-end mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-lg",
                  children: ticket.city || "Kigali",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mt-1 truncate max-w-[120px]",
                  children: ticket.venue || "Kigali Arena",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-right",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-lg",
                  children: ticket.date,
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mt-1",
                  children: "Day 1",
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
          children: "Registration ID",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-xl font-bold tracking-wide mb-8",
          children: ticket.orderId,
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Pass Type",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm",
                  children: "All Access",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Company",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm",
                  children: "Agatike",
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "text-right",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-gray-500 text-xs font-medium mb-1",
                  children: "Status",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "font-bold text-sm text-green-600",
                  children: "Verified",
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className:
            "absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode2, {}),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
        children: ticket.ticketCategory === "free" ? "Guest" : "Passenger",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "text-2xl font-bold mb-8",
        children: "Alex Doe",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex justify-between items-center mb-6 relative",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className:
              "w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "w-2 h-2 rounded-full bg-black",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "flex-1 border-t-2 border-dashed border-gray-300 mx-2",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                className: "w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black",
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "w-full flex justify-center z-10",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "bg-white px-3",
              children:
                ticket.ticketCategory === "experience"
                  ? /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-6 h-6" })
                  : ticket.ticketCategory === "free"
                    ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {
                        className: "w-6 h-6 text-green-500",
                      })
                    : /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-6 h-6" }),
            }),
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex justify-between items-end mb-8",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "font-bold text-lg max-w-[140px] leading-tight truncate",
                children: ticket.city || ticket.venue || "Kigali",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-gray-500 text-xs font-medium mt-1",
                children: "Location",
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "text-right",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "font-bold text-lg",
                children: ticket.time || "18:00",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-gray-500 text-xs font-medium mt-1",
                children: "Doors Open",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider",
        children: "Booking Reference",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "text-xl font-bold tracking-wide mb-8",
        children: ticket.orderId,
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-gray-500 text-xs font-medium mb-1",
                children: "Category",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "font-bold text-sm truncate",
                children: ticket.ticketType,
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-gray-500 text-xs font-medium mb-1",
                children: "Gate",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "font-bold text-sm",
                children: "G-12",
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "text-right",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "text-gray-500 text-xs font-medium mb-1",
                children: "Seat",
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                className: "font-bold text-sm truncate max-w-[80px]",
                children: ticket.seat || "GA",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className:
          "absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200",
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Barcode2, {}),
    ],
  });
}
export { TicketViewer as component };
