import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WorkspaceList } from "@/components/dashboard/workspaces/WorkspaceList";
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";
import { BillingBanner } from "@/components/desktop/dashboard/BillingBanner";

export const Route = createFileRoute("/dashboard/workspaces")({
  head: () => ({
    meta: [
      { title: "Workspaces — Agatike Dashboard" },
      { name: "description", content: "Create and switch between your workspaces." },
    ],
  }),
  component: Workspaces,
});

function Workspaces() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <BillingBanner />
      <WorkspaceList onOpenWizard={() => setIsWizardOpen(true)} />
      {isWizardOpen && <WorkspaceWizard onClose={() => setIsWizardOpen(false)} />}
    </>
  );
}
