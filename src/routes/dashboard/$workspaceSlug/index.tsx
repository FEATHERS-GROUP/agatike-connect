import { createFileRoute } from "@tanstack/react-query";
import { createFileRoute as routerCreateFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { EventDashboard } from "@/components/desktop/dashboard/views/EventDashboard";
import { CinemaDashboard } from "@/components/desktop/dashboard/views/CinemaDashboard";
import { VenueDashboard } from "@/components/desktop/dashboard/views/VenueDashboard";
import { SpaceDashboard } from "@/components/desktop/dashboard/views/SpaceDashboard";
import { ExperienceDashboard } from "@/components/desktop/dashboard/views/ExperienceDashboard";

export const Route = routerCreateFileRoute("/dashboard/$workspaceSlug/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { activeWorkspace } = useWorkspace();
  const type = activeWorkspace?.type;

  switch (type) {
    case "CINEMA":
      return <CinemaDashboard />;
    case "VENUE":
      return <VenueDashboard />;
    case "SPACE":
      return <SpaceDashboard />;
    case "EXPERIENCE":
      return <ExperienceDashboard />;
    case "EVENT":
    default:
      return <EventDashboard />;
  }
}
