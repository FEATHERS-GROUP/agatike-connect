import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/promotions")({
  component: SpacePromotionsPage,
});

function SpacePromotionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Promotions & Discounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount codes and referrals for this branch.
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-10">
          <Plus className="h-4 w-4" /> Add Code
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-8 text-center text-muted-foreground shadow-sm">
        <Tag className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No promotions yet</h3>
        <p className="text-sm">Create a discount code to offer specialized pricing to your members.</p>
        <Button variant="outline" className="mt-4 rounded-xl">
          Create first code
        </Button>
      </div>
    </div>
  );
}
