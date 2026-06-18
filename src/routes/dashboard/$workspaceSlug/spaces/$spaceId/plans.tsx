import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { CreditCard, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/plans")({
  component: SpacePlansPage,
});

function SpacePlansPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading plans...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage pricing, billing cycles, and features.
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6 shadow-sm" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {space.plans?.map((plan: any, idx: number) => (
          <div key={idx} className="flex flex-col bg-card border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 to-primary/10"></div>
            
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-xl">{plan.name}</h4>
              <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-secondary">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-red-500/20 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              </div>
            </div>
            
            <div className="text-3xl font-bold mb-1 flex items-baseline gap-1">
              {space.currency} {Number(plan.price || 0).toLocaleString()}
              {plan.billing_cycle && plan.billing_cycle !== "One-time" && (
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  / {plan.billing_cycle}
                </span>
              )}
            </div>
            
            {plan.description && (
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                {plan.description}
              </p>
            )}

            <div className="space-y-3 flex-1 mt-2 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Features</p>
              {plan.features?.map((feat: string, fIdx: number) => (
                feat && (
                  <div key={fIdx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                )
              ))}
              {(!plan.features || plan.features.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No features listed.</p>
              )}
            </div>
          </div>
        ))}

        {(!space.plans || space.plans.length === 0) && (
          <div className="col-span-full p-12 text-center bg-secondary/20 border border-dashed border-border/60 rounded-3xl">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">No Membership Plans</h3>
            <p className="text-muted-foreground">Add membership plans or passes to monetize your space.</p>
          </div>
        )}
      </div>
    </div>
  );
}
