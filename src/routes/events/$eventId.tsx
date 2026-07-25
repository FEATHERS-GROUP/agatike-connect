import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { EventDetailsMobile } from "@/components/mobile/EventDetailsMobile";
import { EventDetailsDesktop } from "@/components/desktop/EventDetailsDesktop";
import { getEventById } from "@/api/events";
import { useState, useEffect } from "react";
import { RenderedPage } from "@/components/page-builder/RenderedPage";

// Stubbed mock data
const events: any[] = [];
const experiences: any[] = [];
const movies: any[] = [];

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    let ev =
      events.find((e) => e.id === params.eventId) ||
      experiences.find((x) => x.id === params.eventId) ||
      movies.find((m) => m.id === params.eventId);

    if (!ev) {
      try {
        ev = await getEventById({ data: { id: params.eventId } } as any);
      } catch (err) {
        console.error("Event not found in DB", err);
      }
    }

    if (!ev) throw notFound();
    return { event: ev };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.event as any;
    return {
      meta: loaderData
        ? [
            { title: `${e.title} — Agatike` },
            { name: "description", content: e.description || e.synopsis },
            { property: "og:title", content: e.title },
            { property: "og:description", content: e.description || e.synopsis },
            { property: "og:image", content: e.cover },
          ]
        : [],
    };
  },
  component: EventDetailsRoute,
  pendingComponent: EventDetailsSkeleton,
});

function EventDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <Skeleton className="w-full aspect-[21/9] rounded-2xl md:rounded-3xl" />
      <div className="grid md:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-2xl mt-8" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function EventDetailsRoute() {
  const { event } = Route.useLoaderData();
  const { eventId } = Route.useParams();

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

  const innerContent = (
    <>
      <div className="md:hidden">
        <EventDetailsMobile eventId={eventId} event={event} />
      </div>
      <div className="hidden md:block">
        <EventDetailsDesktop eventId={eventId} event={event} />
      </div>
    </>
  );

  if (subdomainSlug) {
    return (
      <RenderedPage slug={subdomainSlug} isPreview={false} hideHero={true}>
        {innerContent}
      </RenderedPage>
    );
  }

  return innerContent;
}
