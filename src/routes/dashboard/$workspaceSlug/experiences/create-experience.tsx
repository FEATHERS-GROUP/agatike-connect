import { createFileRoute } from "@tanstack/react-router";
import { CreateExperienceDesktop } from "@/components/desktop/CreateExperienceDesktop";
import { z } from "zod";

export const Route = createFileRoute("/dashboard/$workspaceSlug/experiences/create-experience")({
  validateSearch: z.object({
    step: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Create experience — Agatike" },
      {
        name: "description",
        content: "Publish your experience, tour, or hike in minutes.",
      },
    ],
  }),
  component: CreateExperienceRoute,
});

function CreateExperienceRoute() {
  return <CreateExperienceDesktop />;
}
