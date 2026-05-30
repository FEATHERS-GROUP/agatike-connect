import { createFileRoute } from "@tanstack/react-router";
import { CreateEventDesktop } from "@/components/desktop/CreateEventDesktop";
import { z } from "zod";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/create-event")({
  validateSearch: z.object({
    step: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Create event — Agatike" },
      {
        name: "description",
        content: "Publish your event in minutes: tickets, venue, merchandise and VIP.",
      },
    ],
  }),
  component: CreateEventRoute,
});

function CreateEventRoute() {
  return <CreateEventDesktop />;
}
