import { createFileRoute as routerCreateFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { EventDashboard } from "@/components/desktop/dashboard/views/EventDashboard";
import { CinemaDashboard } from "@/components/desktop/dashboard/views/CinemaDashboard";
import { VenueDashboard } from "@/components/desktop/dashboard/views/VenueDashboard";
import { SpaceDashboard } from "@/components/desktop/dashboard/views/SpaceDashboard";
import { ExperienceDashboard } from "@/components/desktop/dashboard/views/ExperienceDashboard";
import { TransportDashboard } from "@/components/desktop/dashboard/views/TransportDashboard";
import { BillingBanner } from "@/components/desktop/dashboard/BillingBanner";

export const Route = routerCreateFileRoute("/dashboard/$workspaceSlug/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { activeWorkspace } = useWorkspace();
  const type = activeWorkspace?.type;

  const renderDashboard = () => {
    switch (type) {
      case "CINEMA":
        return <CinemaDashboard />;
      case "VENUE":
        return <VenueDashboard />;
      case "SPACE":
        return <SpaceDashboard />;
      case "EXPERIENCE":
        return <ExperienceDashboard />;
      case "TRANSPORT":
        return <TransportDashboard />;
      case "EVENT":
      default:
        return <EventDashboard />;
    }
  };

  return (
    <>
      <BillingBanner />
      {renderDashboard()}
    </>
  );
}

