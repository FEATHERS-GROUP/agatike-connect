import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WorkspaceList } from "@/components/dashboard/workspaces/WorkspaceList";
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";
import { BillingBanner } from "@/components/desktop/dashboard/BillingBanner";
import { OnboardingSlider } from "@/components/dashboard/OnboardingSlider";
import { useWorkspace } from "@/contexts/WorkspaceContext";

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
  const { currentUser } = useWorkspace();

  return (
    <>
      <BillingBanner />
      {currentUser?.role === "organizer" && currentUser?.isActive === false ? (
        <div className="flex flex-col items-center justify-center p-6 text-center mt-20">
          <div className="bg-primary/10 p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Pending Activation</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your account is currently under review by the Agatike team. This process usually takes
            between 2 to 24 hours depending on traffic. Once approved, you will be able to create
            workspaces and manage your Operations.
          </p>
        </div>
      ) : (
        <>
          <WorkspaceList onOpenWizard={() => setIsWizardOpen(true)} />
          {isWizardOpen && <WorkspaceWizard onClose={() => setIsWizardOpen(false)} />}
        </>
      )}
      <OnboardingSlider />
    </>
  );
}
