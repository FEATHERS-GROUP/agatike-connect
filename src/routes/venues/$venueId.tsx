import { createFileRoute } from "@tanstack/react-router";
import { VenueDetailsMobile } from "@/components/mobile/VenueDetailsMobile";
import { VenueDetailsDesktop } from "@/components/desktop/VenueDetailsDesktop";
import { getRentableVenueById } from "@/api/rentable_venues";

export const Route = createFileRoute("/venues/$venueId")({
  loader: async ({ params }) => {
    return await getRentableVenueById({ data: { id: params.venueId } });
  },
  component: VenueDetails,
});

import { useState, useEffect } from "react";
import { RenderedPage } from "@/components/page-builder/RenderedPage";
import { Skeleton } from "@/components/ui/skeleton";

function VenueDetails() {
  const venue = Route.useLoaderData();

  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
        <Skeleton className="w-full h-[50vh] md:h-[60vh] rounded-3xl" />
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return <div className="p-8 text-center">Venue not found</div>;
  }

  const innerContent = (
    <>
      <div className="md:hidden">
        <VenueDetailsMobile venue={venue} hideLayout={!!subdomainSlug} />
      </div>
      <div className="hidden md:block">
        <VenueDetailsDesktop venue={venue} hideLayout={!!subdomainSlug} />
      </div>
    </>
  );

  if (subdomainSlug) {
    return (
      <RenderedPage slug={subdomainSlug} isPreview={false} hideHero={true} hideComponents={true}>
        {innerContent}
      </RenderedPage>
    );
  }

  return innerContent;
}
