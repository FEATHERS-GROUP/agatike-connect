import { createFileRoute, useParams } from "@tanstack/react-router";
import { CreateExperienceDesktop } from "@/components/desktop/CreateExperienceDesktop";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/api/events";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/dashboard/$workspaceSlug/experiences/$experienceId/edit")({
  validateSearch: z.object({
    step: z.number().catch(0),
  }),
  head: () => ({
    meta: [{ title: "Edit Experience — Agatike" }],
  }),
  component: EditExperienceRoute,
});

function EditExperienceRoute() {
  const { experienceId: eventId } = useParams({ strict: false }) as { experienceId: string };

  const { data: experience, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Parse tickets into the format expected by CreateExperienceDesktop
  const initialTickets =
    experience?.event_tickets?.map((t: any, idx: number) => ({
      id: t.id,
      name: t.type || "General Admission",
      price: Number(t.cost || 0),
      quantity: Number(t.remaining || 0) + Number(t.sold || 0),
      includes: idx === 0 ? experience?.tour_stops?.included || [""] : [""],
      form_id: t.form_id || "",
    })) || [];

  const initialData = {
    id: experience?.id || "",
    title: experience?.title || "",
    category: experience?.category || "",
    description: experience?.description || "",
    cover: experience?.cover || "",
    city: experience?.tour_stops?.city || "",
    venueName: experience?.tour_stops?.venueName || "",
    venueAddress: experience?.tour_stops?.venueAddress || "",
    venueLat: experience?.tour_stops?.venueCoordinates?.lat || null,
    venueLng: experience?.tour_stops?.venueCoordinates?.lng || null,
    date: experience?.event_requency?.date || "",
    duration: experience?.tour_stops?.duration || "",
    startTime: experience?.tour_stops?.startTime || "",
    endTime: experience?.tour_stops?.endTime || "",
    routeDistance: experience?.tour_stops?.routeDistance || null,
    numberOfDays: experience?.event_requency?.numberOfDays || 1,
    itinerary: experience?.tour_stops?.itinerary || [],
    tickets: initialTickets,
  };

  return <CreateExperienceDesktop isEdit={true} initialData={initialData} />;
}
