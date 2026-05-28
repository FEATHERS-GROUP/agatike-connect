import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { events, experiences, movies } from "@/lib/mock-data";
import { EventDetailsMobile } from "@/components/mobile/EventDetailsMobile";
import { EventDetailsDesktop } from "@/components/desktop/EventDetailsDesktop";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const ev =
      events.find((e) => e.id === params.eventId) ||
      experiences.find((x) => x.id === params.eventId) ||
      movies.find((m) => m.id === params.eventId);
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
});

function EventDetailsRoute() {
  const { eventId } = Route.useParams();

  return (
    <>
      <div className="md:hidden">
        <EventDetailsMobile eventId={eventId} />
      </div>
      <div className="hidden md:block">
        <EventDetailsDesktop eventId={eventId} />
      </div>
    </>
  );
}
