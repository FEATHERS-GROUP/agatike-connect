import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

const MapClient = lazy(() => import("@/components/site/MapClient"));
const MapDesktop = lazy(() =>
  import("@/components/desktop/MapDesktop").then((m) => ({ default: m.MapDesktop })),
);

function MapPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <div className="md:hidden">
        <MapClient />
      </div>
      <div className="hidden md:block">
        <MapDesktop />
      </div>
    </Suspense>
  );
}
