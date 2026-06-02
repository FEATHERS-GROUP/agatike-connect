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
import { useEffect } from "react";
import { UserAuthProvider, useUserAuth } from "@/contexts/UserAuthContext";
import { MobileNav } from "@/components/mobile/MobileNav";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { SplashLoader } from "@/components/site/SplashLoader";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Toaster } from "@/components/ui/sonner";
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
    <html lang="en">
      <head>
        <HeadContent />
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

  const location = useRouterState({ select: s => s.location });

  // Hide bottom nav on detail/booking/community/ticket/f/b pages, dashboard, and auth pages
  const hideNav =
    location.pathname.match(/^\/(events|book|community|ticket|f|b)\/.+/) ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/onboarding";

  return (
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <UserAuthProvider>
          <AuthRedirect />
          <WorkspaceProvider>
            <LoaderProvider>
              {/* The main content area with bottom padding to avoid overlapping the navbar on mobile */}
              <div className={`min-h-screen md:pb-0 ${hideNav ? "" : "pb-24"}`}>
                <Outlet />
              </div>

              {/* Floating Mobile Navigation - Hidden on Desktop */}
              {!hideNav && (
                <div className="md:hidden">
                  <MobileNav />
                </div>
              )}

              <InstallPrompt />
              <SplashLoader />
              <Toaster position="top-center" />
            </LoaderProvider>
          </WorkspaceProvider>
        </UserAuthProvider>
      </QueryClientProvider>
    </AppProvider>
  );
}

// Component to handle authentication redirect based on user status and device type.
function AuthRedirect() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useUserAuth();
  const location = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const publicPaths = ['/signin', '/signup', '/onboarding'];
    const isPublic = publicPaths.some((p) => location.pathname.startsWith(p));
    if (isMobile && !isLoggedIn && !isPublic) {
      navigate({ to: '/signin', replace: true });
    }
  }, [isLoading, isLoggedIn, location.pathname, navigate]);

  return null;
}
