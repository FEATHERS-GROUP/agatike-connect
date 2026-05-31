import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouter } from "../_libs/tanstack__react-router.mjs";
import { b as Route$1, i as feedPosts, g as events } from "./router-EgqkzaPB.mjs";
import { b as ArrowLeft, m as CircleCheck, I as Image, X as Send } from "../_libs/lucide-react.mjs";
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
function PostCommunityPage() {
  const { postId } = Route$1.useParams();
  const router = useRouter();
  const post = feedPosts.find((p) => p.id === postId) || feedPosts[0];
  const organizerEvent = events.find((e) => e.organizerHandle === post.handle) || events[0];
  const [isFollowing, setIsFollowing] = reactExports.useState(false);
  const [commentText, setCommentText] = reactExports.useState("");
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "min-h-screen bg-background pb-24 md:pb-8 md:max-w-xl md:mx-auto shadow-xl relative",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: `flex items-center justify-between px-4 pb-3 pt-safe-top fixed top-0 left-0 right-0 mx-auto w-full md:max-w-xl z-40 transition-colors duration-300 min-h-[60px] ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/40" : "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                onClick: () => router.history.back(),
                className: `p-2 -ml-2 rounded-full transition-colors ${scrolled ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/20 backdrop-blur-sm"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, {
                  className: "h-6 w-6",
                }),
              }),
              scrolled
                ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "flex items-center gap-2 animate-in fade-in duration-300",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: organizerEvent.cover,
                        className: "w-8 h-8 rounded-full object-cover border border-border",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        className: "flex flex-col",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                            className: "font-bold text-sm leading-none",
                            children: organizerEvent.organizer,
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                            className: "text-[10px] text-muted-foreground",
                            children: ["@", organizerEvent.organizerHandle],
                          }),
                        ],
                      }),
                    ],
                  })
                : /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                    className: "font-bold text-lg tracking-tight text-transparent",
                    children: "Community",
                  }),
            ],
          }),
          scrolled &&
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              onClick: () => setIsFollowing(!isFollowing),
              className: `px-3 py-1 rounded-full text-xs font-bold transition-colors animate-in fade-in duration-300 ${isFollowing ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`,
              children: isFollowing ? "Following" : "Follow",
            }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "w-full aspect-video md:aspect-[21/9] bg-secondary relative",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
            src: post.image,
            alt: "Post header",
            className: "w-full h-full object-cover",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none",
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "absolute bottom-4 left-4 right-4 flex items-center justify-between",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    className: "relative",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: organizerEvent.cover,
                        alt: organizerEvent.organizer,
                        className: "w-12 h-12 rounded-full border-2 border-background object-cover",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                        className: "absolute bottom-0 right-0 bg-background rounded-full p-0.5",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {
                          className: "h-4 w-4 text-primary fill-primary/20",
                        }),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
                        className: "font-bold text-white text-shadow-sm",
                        children: organizerEvent.organizer,
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                        className: "text-xs text-white/80 drop-shadow-sm",
                        children: ["@", organizerEvent.organizerHandle],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                onClick: () => setIsFollowing(!isFollowing),
                className: `px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${isFollowing ? "bg-white/20 text-white backdrop-blur-md border border-white/30" : "bg-primary text-primary-foreground"}`,
                children: isFollowing ? "Following" : "Follow",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "px-4 py-4 border-b border-border/40",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
          className: "text-sm text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
              className: "font-bold mr-2",
              children: ["@", post.handle],
            }),
            post.caption,
          ],
        }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "w-full pt-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", {
            className: "px-4 text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2",
            children: [
              "Community Conversations",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                className: "bg-secondary text-foreground px-2 py-0.5 rounded-full text-[10px]",
                children: post.comments,
              }),
            ],
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "px-4 space-y-5",
            children:
              post.commentsList &&
              post.commentsList.map((comment) =>
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex gap-3",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: comment.avatar,
                        alt: comment.handle,
                        className: "w-8 h-8 rounded-full object-cover shrink-0",
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                        className: "flex-1",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
                                className: "font-bold text-sm",
                                children: ["@", comment.handle],
                              }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                                className: "text-[10px] text-muted-foreground",
                                children: comment.time,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                            className: "text-sm text-foreground/90 mt-0.5",
                            children: comment.text,
                          }),
                        ],
                      }),
                    ],
                  },
                  comment.id,
                ),
              ),
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className:
          "fixed bottom-0 left-0 right-0 md:max-w-xl md:mx-auto bg-background/90 backdrop-blur-md border-t border-border/40 p-4 pb-safe-bottom z-40",
        children: isFollowing
          ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex gap-3 items-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                  src: "https://i.pravatar.cc/150?u=me",
                  alt: "You",
                  className: "w-8 h-8 rounded-full object-cover shrink-0",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
                  className:
                    "flex-1 flex items-center bg-secondary/50 border border-border/40 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-shadow",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
                      type: "text",
                      value: commentText,
                      onChange: (e) => setCommentText(e.target.value),
                      placeholder: "Join the conversation...",
                      className: "flex-1 bg-transparent text-sm focus:outline-none py-1",
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                      className:
                        "p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, {
                        className: "w-5 h-5",
                      }),
                    }),
                  ],
                }),
                commentText.trim().length > 0 &&
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
                    className: "text-primary p-2",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }),
                  }),
              ],
            })
          : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              className: "flex flex-col items-center justify-center py-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "text-sm text-muted-foreground font-medium mb-2",
                  children: "You must follow the organizer to join the conversation",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
                  onClick: () => setIsFollowing(true),
                  className: "text-primary font-bold text-sm hover:underline",
                  children: ["Follow @", post.handle],
                }),
              ],
            }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24" }),
    ],
  });
}
export { PostCommunityPage as component };
