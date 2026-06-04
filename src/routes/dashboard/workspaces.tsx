import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WorkspaceList } from "@/components/dashboard/workspaces/WorkspaceList";
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";

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
      <WorkspaceList onOpenWizard={() => setIsWizardOpen(true)} />
      {isWizardOpen && <WorkspaceWizard onClose={() => setIsWizardOpen(false)} />}
    </>
  );
}
