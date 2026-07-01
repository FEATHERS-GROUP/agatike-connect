import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SpreadsheetEntryForm } from "@/components/page-builder/SpreadsheetEntryForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutTemplate, Loader2, FileText, CheckCircle2, FileSpreadsheet } from "lucide-react";

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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/20 relative">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2 rounded-full hover:bg-secondary/50">
              <Link to={`/dashboard/${activeWorkspace?.slug}/book/finance`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-black tracking-tight">New Request</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 relative z-10">
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Select Template</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Choose which form template you want to use. Templates are created and linked to your Page Builder portals.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requestBlocks.map((block) => {
                const isSelected = selectedFormCompId === block.comp.id;
                return (
                  <button
                    key={block.comp.id}
                    onClick={() => setSelectedFormCompId(block.comp.id)}
                    className={`group relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isSelected 
                        ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20 scale-[1.02]" 
                        : "border-border/60 bg-card/60 hover:border-primary/50 hover:bg-card hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                      isSelected 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-secondary/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base mb-1.5 text-foreground leading-tight group-hover:text-primary transition-colors">
                      {block.comp.title || "Untitled Form"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {block.comp.type === "damage_report" ? "Damage Report" : "Budget Request"} form on portal <span className="font-medium text-foreground/80">"{block.page.title || block.page.slug}"</span>
                    </p>
                  </button>
                );
              })}
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
