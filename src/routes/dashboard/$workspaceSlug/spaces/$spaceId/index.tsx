import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/$workspaceSlug/spaces/$spaceId/overview",
      params: { workspaceSlug: params.workspaceSlug, spaceId: params.spaceId },
      replace: true,
    });
  },
});
