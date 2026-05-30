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
      {/* If isPageLoading is true, we can hide the children and just show a loader,
          or we can overlay it. We'll use an overlay to avoid unmounting the app state. */}
      {showPageLoader ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Loading information...
          </p>
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
