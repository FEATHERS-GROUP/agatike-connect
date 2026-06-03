import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { events, experiences, movies } from "@/lib/mock-data";
import { EventDetailsMobile } from "@/components/mobile/EventDetailsMobile";
import { EventDetailsDesktop } from "@/components/desktop/EventDetailsDesktop";
import { getEventById } from "@/api/events";

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
});

function EventDetailsRoute() {
  const { event } = Route.useLoaderData();
  const { eventId } = Route.useParams();

  return (
    <>
      <div className="md:hidden">
        <EventDetailsMobile eventId={eventId} event={event} />
      </div>
      <div className="hidden md:block">
        <EventDetailsDesktop eventId={eventId} event={event} />
      </div>
    </>
  );
}
