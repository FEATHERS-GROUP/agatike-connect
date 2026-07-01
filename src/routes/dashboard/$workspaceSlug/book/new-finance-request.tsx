import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SpreadsheetEntryForm } from "@/components/page-builder/SpreadsheetEntryForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutTemplate, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/new-finance-request")({
  component: NewFinanceRequestPage,
});

function NewFinanceRequestPage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;

  const [selectedFormCompId, setSelectedFormCompId] = useState<string>("");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["workspace-pages", wsId],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id: wsId } } as any),
    enabled: !!wsId,
  });

  // Find all request blocks across all pages
  const requestBlocks: { page: any; comp: any }[] = [];
  pages.forEach((page: any) => {
    if (!page.components) return;
    try {
      const comps = typeof page.components === "string" ? JSON.parse(page.components) : page.components;
      comps.forEach((comp: any) => {
        if (comp.type === "budget_request" || comp.type === "damage_report") {
          requestBlocks.push({ page, comp });
        }
      });
    } catch (e) {
      // ignore
    }
  });

  const selectedBlock = requestBlocks.find(b => b.comp.id === selectedFormCompId);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2 rounded-full">
              <Link to={`/dashboard/${activeWorkspace?.slug}/book/finance`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">New Internal Request</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            Select Request Template
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose which form template you want to use. Templates are created in the Page Builder.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading templates...</span>
            </div>
          ) : requestBlocks.length === 0 ? (
            <div className="bg-secondary/20 rounded-xl p-6 text-center border border-dashed border-border/50">
              <p className="text-muted-foreground text-sm mb-4">
                No Request blocks found in any of your Page Builder portals.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/dashboard/${activeWorkspace?.slug}/page-builder`}>
                  Open Page Builder
                </Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-md">
              <Select value={selectedFormCompId} onValueChange={setSelectedFormCompId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {requestBlocks.map((block) => (
                    <SelectItem key={block.comp.id} value={block.comp.id}>
                      {block.comp.title || "Untitled Form"} ({block.comp.type === "damage_report" ? "Damage" : "Budget"}) - on "{block.page.title || block.page.slug}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedBlock && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SpreadsheetEntryForm 
              workspace_id={wsId!} 
              themeColor="var(--primary)" 
              comp={selectedBlock.comp} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
