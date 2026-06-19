import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: `/dashboard/${params.workspaceSlug}/Cinema/${params.cinemaId}/overview`,
    });
  },
});
