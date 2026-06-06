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
    meta: [
      { title: "Edit Experience — Agatike" },
    ],
  }),
  component: EditExperienceRoute,
});

function EditExperienceRoute() {
  const { experienceId: eventId } = useParams({ strict: false }) as { experienceId: string };

  const { data: experience, isLoading } = useQuery({
    queryKey: ["event", experienceId],
    queryFn: () => getEventById({ data: { id: experienceId } } as any),
    enabled: !!experienceId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Parse tickets into the format expected by CreateExperienceDesktop
  const initialTickets = experience?.event_tickets?.map((t: any) => ({
    id: t.id,
    name: t.type || "General Admission",
    price: Number(t.cost || 0),
    quantity: Number(t.remaining || 0) + Number(t.sold || 0)
  })) || [];

  const initialData = {
    title: experience?.title || "",
    category: experience?.category || "",
    description: experience?.description || "",
    cover: experience?.cover || "",
    // Fallbacks if not serialized in db yet
    city: experience?.tour_stops?.[0]?.city || experience?.tour_stops?.[0]?.venue || "",
    date: experience?.tour_stops?.[0]?.date || "",
    itinerary: Array.isArray(experience?.lineup) ? experience.lineup : [], // Just reuse lineup for itinerary temporarily if we want
    tickets: initialTickets,
  };

  return <CreateExperienceDesktop isEdit={true} initialData={initialData} />;
}
