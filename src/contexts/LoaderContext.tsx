import React, { createContext, useContext, useState, useEffect } from "react";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useRouterState } from "@tanstack/react-router";
import { useWorkspace } from "./WorkspaceContext";

// Configure nProgress
nProgress.configure({ showSpinner: false });

interface LoaderContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // We can also provide a way to show a full-screen block vs just the progress bar
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Automatically show loader when router is pending (e.g. on page refresh or navigation)
  const isRouterPending = useRouterState({ select: (s) => s.status === "pending" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // Also show loader when workspaces are being initially fetched for the dashboard
  const { isLoading: isWorkspaceLoading } = useWorkspace();

  const isDashboard = pathname.startsWith("/dashboard");
  const showPageLoader = isPageLoading || (isDashboard && isWorkspaceLoading);

  useEffect(() => {
    if (isLoading || showPageLoader || isRouterPending) {
      nProgress.start();
    } else {
      nProgress.done();
    }
  }, [isLoading, showPageLoader, isRouterPending]);

  return (
    <LoaderContext.Provider
      value={{ isLoading, setIsLoading, isPageLoading, setIsPageLoading }}
    >
      {/* If showPageLoader is true, we display a dashboard skeleton with a centered logo */}
      {showPageLoader ? (
        <div className="fixed inset-0 z-[9999] flex bg-background">
          
          {/* Centered Logo Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div
                className="grid h-20 w-20 place-items-center rounded-3xl text-primary-foreground font-bold text-3xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                A
              </div>
              <span className="text-3xl font-bold tracking-tight">Agatike</span>
            </div>
          </div>

          {/* Sidebar Skeleton (Background) */}
          <aside className="hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background/50 p-4 md:flex md:flex-col opacity-60">
            {/* Logo placeholder space */}
            <div className="mb-6 h-9 w-32 animate-pulse rounded-lg bg-muted" />
            
            <div className="mb-8 h-10 w-full animate-pulse rounded-xl bg-muted" />

            <div className="space-y-3 flex-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-9 w-full animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton (Background) */}
          <main className="flex-1 p-6 lg:p-10 overflow-hidden opacity-60">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded-lg bg-muted" />
                </div>
                <div className="hidden sm:block h-9 w-32 animate-pulse rounded-full bg-muted" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
              
              <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
            </div>
          </main>
        </div>
      ) : (
        children
      )}

      {/* For background tasks (isLoading), we might just show a subtle overlay or nothing, 
          since nprogress is already running at the top. */}
      {isLoading && !showPageLoader && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}
