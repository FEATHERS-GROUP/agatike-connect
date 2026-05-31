import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as stories } from "./router-EgqkzaPB.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import {
  g as CalendarDays,
  E as Ellipsis,
  X as Send,
  d as Bookmark,
  ag as X,
} from "../_libs/lucide-react.mjs";
function StoryViewer({ stories: stories2, initialIndex, onClose, onStoryFinished }) {
  const [currentOrgIndex, setCurrentOrgIndex] = reactExports.useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = reactExports.useState(0);
  const [progress, setProgress] = reactExports.useState(0);
  const duration = 5e3;
  const currentOrg = stories2[currentOrgIndex];
  const currentItem = currentOrg.items[currentStoryIndex];
  reactExports.useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleNext();
          return 100;
        }
        return prev + 100 / (duration / 50);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentOrgIndex, currentStoryIndex]);
  const handleNext = () => {
    if (currentStoryIndex < currentOrg.items.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentOrgIndex < stories2.length - 1) {
      onStoryFinished?.(currentOrg.id);
      setCurrentOrgIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onStoryFinished?.(currentOrg.id);
      onClose();
    }
  };
  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentOrgIndex > 0) {
      setCurrentOrgIndex((prev) => prev - 1);
      setCurrentStoryIndex(stories2[currentOrgIndex - 1].items.length - 1);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "fixed inset-0 z-[200] flex items-center justify-center bg-black",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "relative w-full h-full max-w-md bg-black",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute top-0 inset-x-0 z-20 flex gap-1 p-4 pt-safe-top",
          children: currentOrg.items.map((item, i) =>
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "h-full bg-white transition-all duration-75 ease-linear rounded-full",
                  style: {
                    width: `${i === currentStoryIndex ? progress : i < currentStoryIndex ? 100 : 0}%`,
                  },
                }),
              },
              item.id,
            ),
          ),
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "absolute top-8 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe-top",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "h-8 w-8 rounded-full overflow-hidden border border-white/20",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                    src: currentOrg.avatar,
                    alt: currentOrg.name,
                    className: "h-full w-full object-cover",
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                  className: "text-sm font-semibold text-white drop-shadow-md",
                  children: currentOrg.name,
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              onClick: onClose,
              className: "text-white hover:text-white/80 p-2 drop-shadow-md",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }),
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "relative w-full h-full flex items-center justify-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: currentItem.image,
                alt: "Story",
                className: "w-full h-full object-cover",
              },
              currentItem.id,
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className:
                "absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className:
                "absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "absolute bottom-10 inset-x-6 text-white z-20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
                  className: "text-2xl font-bold mb-2 shadow-black drop-shadow-lg",
                  children: currentOrg.name,
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                  className: "text-sm text-white/90 shadow-black drop-shadow-md",
                  children: ["Live moment from ", currentOrg.name],
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute inset-y-0 left-0 w-1/3 z-10",
          onClick: handlePrev,
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "absolute inset-y-0 right-0 w-2/3 z-10",
          onClick: handleNext,
        }),
      ],
    }),
  });
}
function Stories({ items = stories }) {
  const [activeStoryIndex, setActiveStoryIndex] = reactExports.useState(null);
  const [viewedStories, setViewedStories] = reactExports.useState(/* @__PURE__ */ new Set());
  const handleStoryFinished = (orgId) => {
    setViewedStories((prev) => {
      const next = new Set(prev);
      next.add(orgId);
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none",
        children: items.map((s, i) =>
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className:
                "flex shrink-0 flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95",
              onClick: () => setActiveStoryIndex(i),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: `rounded-full p-[2px] ${viewedStories.has(s.id) ? "bg-border" : ""}`,
                  style: viewedStories.has(s.id)
                    ? void 0
                    : { background: "var(--gradient-primary)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "rounded-full bg-background p-[2px]",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                      src: s.avatar,
                      alt: s.name,
                      className: "h-16 w-16 rounded-full object-cover",
                      loading: "lazy",
                    }),
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: s.name,
                }),
              ],
            },
            s.id,
          ),
        ),
      }),
      activeStoryIndex !== null &&
        /* @__PURE__ */ jsxRuntimeExports.jsx(StoryViewer, {
          stories: items,
          initialIndex: activeStoryIndex,
          onClose: () => setActiveStoryIndex(null),
          onStoryFinished: handleStoryFinished,
        }),
    ],
  });
}
function FeedCard({ post }) {
  const [isSaved, setIsSaved] = reactExports.useState(false);
  const hasUpcomingEvent = (post.id || "").length % 2 === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "w-full px-4 mb-6",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "w-full bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className:
            "flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm z-10 relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                  className: "relative",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                    className: "h-10 w-10 rounded-full overflow-hidden border border-border",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                      src: post.organizerAvatar || "https://i.pravatar.cc/100",
                      alt: "Organizer",
                      className: "w-full h-full object-cover",
                    }),
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className: "flex flex-col",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                          className: "text-sm font-bold text-foreground leading-none",
                          children: post.handle || post.organizerHandle || "organizer",
                        }),
                        hasUpcomingEvent &&
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                            className:
                              "bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, {
                                className: "h-3 w-3",
                              }),
                              " New Event",
                            ],
                          }),
                      ],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                      className: "text-[10px] text-muted-foreground mt-1",
                      children: "Kigali, RW",
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              className: "text-foreground p-1 hover:bg-secondary rounded-full transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-5 w-5" }),
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          to: "/community/$postId",
          params: { postId: post.id || "p-0" },
          className: "block w-full aspect-square bg-secondary relative",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
            src: post.image || post.cover,
            alt: "Feed",
            className: "h-full w-full object-cover transition-transform active:scale-[0.98]",
          }),
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex items-center justify-between px-4 py-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "flex items-center gap-4 text-sm font-medium text-muted-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "flex -space-x-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: "https://i.pravatar.cc/100?img=5",
                        className: "w-5 h-5 rounded-full border-2 border-card z-20",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: "https://i.pravatar.cc/100?img=6",
                        className: "w-5 h-5 rounded-full border-2 border-card z-10",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                    className: "text-xs",
                    children: [
                      "Followed by ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className: "font-bold text-foreground",
                        children: "angryswan",
                      }),
                      " and",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                        className: "font-bold text-foreground",
                        children: "800 others",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex gap-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                  className: "focus:outline-none transition-transform active:scale-90",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, {
                    className: "h-6 w-6 text-foreground hover:text-foreground/80",
                    style: { transform: "rotate(15deg)" },
                  }),
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                  onClick: () => setIsSaved(!isSaved),
                  className: "focus:outline-none transition-transform active:scale-90",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, {
                    className: `h-6 w-6 ${isSaved ? "fill-foreground text-foreground" : "text-foreground hover:text-foreground/80"}`,
                  }),
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "px-4 pb-4",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
            className: "text-sm text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                className: "font-bold mr-1",
                children: post.handle || post.organizerHandle || "organizer",
              }),
              post.caption ||
                "Join us for the most anticipated event of the year. Tickets are selling out fast! Don't miss this amazing night.",
            ],
          }),
        }),
      ],
    }),
  });
}
export { FeedCard as F, Stories as S };
