import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouter } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-E-djmUEt.mjs";
import { F as Footer } from "./Footer-CKAawvDD.mjs";
import { B as Button } from "./button-DRsDTWYQ.mjs";
import { I as Input } from "./input-B51fUUFa.mjs";
import { o as organizers, f as cn } from "./router-EgqkzaPB.mjs";
import {
  R as Root,
  P as Portal,
  a as Content,
  C as Close,
  T as Title,
  D as Description,
  O as Overlay,
} from "../_libs/radix-ui__react-dialog.mjs";
import { D as Drawer$1 } from "../_libs/vaul.mjs";
import {
  W as Search,
  m as CircleCheck,
  a9 as Twitter,
  x as Instagram,
  ag as X,
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Dialog = Root;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    ),
    ...props,
  }),
);
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, {
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, {
        ref,
        className: cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          className,
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, {
            className:
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                className: "sr-only",
                children: "Close",
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
    ...props,
  });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Title, {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props,
  }),
);
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props,
  }),
);
DialogDescription.displayName = Description.displayName;
const Drawer = ({ shouldScaleBackground = true, ...props }) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer$1.Root, { shouldScaleBackground, ...props });
Drawer.displayName = "Drawer";
const DrawerPortal = Drawer$1.Portal;
const DrawerOverlay = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer$1.Overlay, {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props,
  }),
);
DrawerOverlay.displayName = Drawer$1.Overlay.displayName;
const DrawerContent = reactExports.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerPortal, {
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerOverlay, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Drawer$1.Content, {
        ref,
        className: cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className,
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted",
          }),
          children,
        ],
      }),
    ],
  }),
);
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({ className, ...props }) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: cn("grid gap-1.5 p-4 text-center sm:text-left", className),
    ...props,
  });
DrawerHeader.displayName = "DrawerHeader";
const DrawerTitle = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer$1.Title, {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props,
  }),
);
DrawerTitle.displayName = Drawer$1.Title.displayName;
const DrawerDescription = reactExports.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer$1.Description, {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props,
  }),
);
DrawerDescription.displayName = Drawer$1.Description.displayName;
function OrganizersPage() {
  useRouter();
  const [selectedOrg, setSelectedOrg] = reactExports.useState(null);
  const isMobile = useIsMobile();
  const handleOrgClick = (org) => {
    setSelectedOrg(org);
  };
  const closeProfile = () => {
    setSelectedOrg(null);
  };
  const ProfileContent = ({ org }) =>
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex flex-col items-center pt-4 pb-6 px-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className:
            "h-24 w-24 rounded-full overflow-hidden border border-border/40 shadow-sm mb-4 relative",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
            src: org.avatar,
            alt: org.name,
            className: "w-full h-full object-cover",
          }),
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex items-center gap-1.5 mb-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
              className: "text-xl font-bold",
              children: org.name,
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {
              className: "h-5 w-5 text-primary fill-primary/20",
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
          className: "text-sm font-medium text-muted-foreground mb-4",
          children: ["@", org.handle, " • ", (org.followers / 1e3).toFixed(1), "k followers"],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-center text-sm mb-6 max-w-xs",
          children: org.bio,
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "flex gap-4 w-full justify-center mb-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
              variant: "outline",
              size: "icon",
              className: "rounded-full",
              asChild: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
                href: org.twitterUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "h-4 w-4" }),
              }),
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
              variant: "outline",
              size: "icon",
              className: "rounded-full",
              asChild: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
                href: org.instagramUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, {
                  className: "h-4 w-4",
                }),
              }),
            }),
          ],
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          className: "w-full max-w-xs rounded-full font-bold shadow-[var(--shadow-glow)]",
          style: {
            background: "var(--gradient-primary)",
          },
          children: "Follow",
        }),
      ],
    });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className:
      "min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "hidden md:block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className:
          "md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-2",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "relative flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, {
              className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
              placeholder: "Search organizers...",
              className: "pl-9 rounded-full bg-secondary/60 border-transparent text-sm h-10",
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("header", {
            className: "hidden md:flex flex-wrap items-end justify-between gap-4 mb-8",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
                  className: "text-3xl font-semibold tracking-tight",
                  children: "Popular Organizers",
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
                  className: "mt-1 text-sm text-muted-foreground",
                  children: "Discover and follow Africa's best creators and venues.",
                }),
              ],
            }),
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5",
            children: organizers.map((org) =>
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  onClick: () => handleOrgClick(org),
                  className:
                    "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                      className:
                        "relative h-20 w-20 mb-3 rounded-full overflow-hidden border border-border/40",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
                        src: org.avatar,
                        alt: org.name,
                        className: "w-full h-full object-cover",
                      }),
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
                      className: "font-semibold text-sm leading-tight line-clamp-1 w-full",
                      children: org.name,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", {
                      className: "text-xs text-muted-foreground mt-1",
                      children: [(org.followers / 1e3).toFixed(1), "k followers"],
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                      className:
                        "w-full mt-4 rounded-full text-xs font-semibold h-8 shadow-[var(--shadow-glow)]",
                      style: {
                        background: "var(--gradient-primary)",
                      },
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                      children: "Follow",
                    }),
                  ],
                },
                org.id,
              ),
            ),
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "hidden md:block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
      }),
      isMobile
        ? /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, {
            open: !!selectedOrg,
            onOpenChange: (open) => !open && closeProfile(),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, {
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerHeader, {
                  className: "sr-only",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, {
                      children: selectedOrg?.name,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerDescription, {
                      children: ["Profile details for ", selectedOrg?.name],
                    }),
                  ],
                }),
                selectedOrg &&
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileContent, { org: selectedOrg }),
              ],
            }),
          })
        : /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, {
            open: !!selectedOrg,
            onOpenChange: (open) => !open && closeProfile(),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
              className: "sm:max-w-md rounded-3xl",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, {
                  className: "sr-only",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
                      children: selectedOrg?.name,
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, {
                      children: ["Profile details for ", selectedOrg?.name],
                    }),
                  ],
                }),
                selectedOrg &&
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileContent, { org: selectedOrg }),
              ],
            }),
          }),
    ],
  });
}
export { OrganizersPage as component };
