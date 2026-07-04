import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface UpgradePromptProps {
  title: string;
  description: string;
}

export function UpgradePrompt({ title, description }: UpgradePromptProps) {
  const { activeWorkspace } = useWorkspace();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-card rounded-3xl border border-border/60 shadow-sm">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline" className="rounded-full">
          <Link to={`/dashboard/${activeWorkspace?.slug || ""}`}>
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Link to="/dashboard/billing/subscriptions/pricingplans">
            Upgrade Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
