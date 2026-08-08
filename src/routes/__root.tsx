import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppProvider } from "@/lib/AppContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserAuthProvider, useUserAuth } from "@/contexts/UserAuthContext";
import { MobileNav } from "@/components/mobile/MobileNav";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { SplashLoader } from "@/components/site/SplashLoader";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalNotificationListener } from "@/components/providers/GlobalNotificationListener";
import { GlobalUserNotificationListener } from "@/components/providers/GlobalUserNotificationListener";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Rss, ShoppingCart } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/page-builder/CartSidebar";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { useQuery } from "@tanstack/react-query";

function TelemetryTracker() {
  useTelemetry();
  return null;
}
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Agatike App" },
      { name: "description", content: "Agatike Generated Project" },
      { name: "author", content: "Agatike" },
      { property: "og:title", content: "Agatike App" },
      { property: "og:description", content: "Agatike Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Agatike" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
        crossOrigin: "use-credentials",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/icon.svg",
      },
      {
        rel: "apple-touch-icon",
        href: "/icon.svg",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('agatike-theme');
                if (!theme) {
                  theme = 'light';
                }
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}

              try {
                var manifestLink = document.querySelector('link[rel="manifest"]');
                if (manifestLink) {
                  if (window.location.pathname.startsWith('/dashboard')) {
                    manifestLink.href = '/manifest-dashboard.json';
                  } else {
                    manifestLink.href = '/manifest.json';
                  }
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // No auth logic here; AuthRedirect will manage redirects.
  const { queryClient } = Route.useRouteContext();
  // Auth redirect logic is handled by AuthRedirect component.
  // location variable removed; handled in AuthRedirect

  const location = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    } else if ("serviceWorker" in navigator && !import.meta.env.PROD) {
      // Unregister in dev to prevent Vite HMR loops
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  useEffect(() => {
    // Dynamically update manifest on client-side navigation
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (manifestLink) {
        if (location.pathname.startsWith("/dashboard")) {
          manifestLink.href = "/manifest-dashboard.json";
        } else {
          manifestLink.href = "/manifest.json";
        }
      }
    } catch (_) {}
  }, [location.pathname]);

  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSub =
        window.location.hostname.split(".").length >
          (window.location.hostname.includes("localhost") ? 1 : 2) &&
        window.location.hostname.split(".")[0] !== "www";
      setIsSubdomain(isSub);
    }
  }, []);

  // Hide bottom nav on detail/booking/community/f/b pages, dashboard, auth pages, and all subdomains (page builder)
  const hideNav = Boolean(
    isSubdomain ||
    location.pathname.match(/^\/(events|venues|spaces|book|book-movie|community|f|b)\/.+/) ||
    (location.pathname.match(/^\/.+\/message$/) && !!(location.search as any)?.chatId) ||
    (location.pathname.startsWith("/buses/") && location.pathname !== "/buses/mobile") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/onboarding" ||
    (location.search as any)?.embed === "true" ||
    (location.search as any)?.embed === true,
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.GOOGLE_AUTH_CLIENT_ID || ""}>
      <ThemeProvider defaultTheme="light" storageKey="agatike-theme">
        <AppProvider>
          <QueryClientProvider client={queryClient}>
            <UserAuthProvider>
              <WorkspaceProvider>
                <LoaderProvider>
                  <CartProvider>
                    <TelemetryTracker />
                    <GlobalNotificationListener />
                    <GlobalUserNotificationListener />
                    <SubdomainThemeProvider>
                      {/* The main content area with bottom padding to avoid overlapping the navbar on mobile */}
                      <div
                        className={`min-h-[100dvh] print:min-h-0 md:pb-0 ${hideNav ? "" : "pb-24"}`}
                      >
                        <Outlet />
                      </div>
                    </SubdomainThemeProvider>

                    <CartSidebar />

                    {/* Floating Mobile Navigation - Hidden on Desktop */}
                    {!hideNav && (
                      <div className="md:hidden" id="mobile-nav-container">
                        <MobileNav />
                      </div>
                    )}

                    <AuthDependentFeedBubble hideNav={hideNav} />
                    <CartBubble hideNav={hideNav} />

                    <InstallPrompt />
                    <SplashLoader />
                    <Toaster position="top-center" />
                  </CartProvider>
                </LoaderProvider>
              </WorkspaceProvider>
            </UserAuthProvider>
          </QueryClientProvider>
        </AppProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

// Component to handle authentication redirect based on user status and device type.
function AuthRedirect() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useUserAuth();
  const location = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && !isLoggedIn) {
      const authRequiredPaths = [
        "/feed",
        "/profile",
        "/settings",
        "/community",
        "/dashboard",
        "/ticket",
        "/wallet",
      ];
      const needsAuth = authRequiredPaths.some(
        (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
      );
      if (needsAuth) {
        navigate({ to: "/signin", replace: true });
      }
    }
  }, [isLoading, isLoggedIn, location.pathname, navigate]);

  return null;
}

function SubdomainThemeProvider({ children }: { children: React.ReactNode }) {
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
  }, []);

  const { data: pageData } = useQuery({
    queryKey: ["workspace-page-by-slug", subdomainSlug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug: subdomainSlug! } } as any),
    enabled: !!subdomainSlug,
  });

  const settingsBlock = pageData?.components?.find((c: any) => c.type === "page_settings");
  const themeColor = settingsBlock?.themeColor || pageData?.theme_color || undefined;

  return (
    <>
      {themeColor && (
        <style>
          {`
            :root {
              --primary: ${themeColor};
            }
          `}
        </style>
      )}
      {children}
    </>
  );
}

function AuthDependentFeedBubble({ hideNav }: { hideNav: boolean }) {
  const { isLoggedIn } = useUserAuth();
  const location = useRouterState({ select: (s) => s.location });

  if (!isLoggedIn || hideNav || location.pathname === "/feed") return null;

  return (
    <Link
      to="/feed"
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 hidden md:flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-transform hover:scale-105 active:scale-95"
      style={{ background: "var(--gradient-primary)" }}
      aria-label="Go to Feed"
    >
      <Rss className="h-6 w-6 text-white" />
    </Link>
  );
}

function CartBubble({ hideNav }: { hideNav: boolean }) {
  const { cartCount, openCart } = useCart();
  const location = useRouterState({ select: (s) => s.location });

  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
  }, []);

  const { data: pageData } = useQuery({
    queryKey: ["workspace-page-by-slug", subdomainSlug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug: subdomainSlug! } } as any),
    enabled: !!subdomainSlug,
  });

  const settingsBlock = pageData?.components?.find((c: any) => c.type === "page_settings");
  const themeColor = settingsBlock?.themeColor || pageData?.theme_color || undefined;

  const isCustomerPage = !!subdomainSlug || location.pathname.startsWith("/p/");

  if (
    !isCustomerPage ||
    cartCount === 0 ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <button
      onClick={openCart}
      className={`fixed ${hideNav ? "bottom-8 md:bottom-8" : "bottom-24 md:bottom-8"} left-4 md:left-8 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-transform hover:scale-105 active:scale-95 bg-foreground`}
      aria-label="Open Cart"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 text-background" />
        <span
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
          style={
            themeColor
              ? { backgroundColor: themeColor, color: "#fff" }
              : { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
          }
        >
          {cartCount}
        </span>
      </div>
    </button>
  );
}
