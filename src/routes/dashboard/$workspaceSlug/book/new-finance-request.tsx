import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllWorkspacePages, upsertWorkspacePage } from "@/api/workspace-pages";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SpreadsheetEntryForm } from "@/components/page-builder/SpreadsheetEntryForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  LayoutTemplate,
  Loader2,
  FileText,
  CheckCircle2,
  FileSpreadsheet,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/new-finance-request")({
  component: NewFinanceRequestPage,
});

function NewFinanceRequestPage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;

  const queryClient = useQueryClient();
  const [selectedFormCompId, setSelectedFormCompId] = useState<string>("");
  const [editingBlock, setEditingBlock] = useState<{ page: any; comp: any } | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<{ page: any; comp: any } | null>(null);
  const [deleteConfirmationTitle, setDeleteConfirmationTitle] = useState("");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["workspace-pages", wsId],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id: wsId } } as any),
    enabled: !!wsId,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => upsertWorkspacePage({ data } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-pages", wsId] });
      setEditingBlock(null);
      setDeletingBlock(null);
      setDeleteConfirmationTitle("");
      toast.success("Changes saved successfully!");
    },
    onError: () => toast.error("Failed to save template"),
  });

  const handleSaveEdit = () => {
    if (!editingBlock) return;
    const newComps = (
      typeof editingBlock.page.components === "string"
        ? JSON.parse(editingBlock.page.components)
        : editingBlock.page.components
    ).map((c: any) => (c.id === editingBlock.comp.id ? editingBlock.comp : c));
    upsertMutation.mutate({
      id: editingBlock.page.id,
      workspace_id: editingBlock.page.workspace_id,
      slug: editingBlock.page.slug,
      title: editingBlock.page.title || "",
      description: editingBlock.page.description || "",
      header_image_url: editingBlock.page.header_image_url || "",
      logo_url: editingBlock.page.logo_url || "",
      theme_color: editingBlock.page.theme_color || "",
      components: newComps,
      is_published: editingBlock.page.is_published ?? true,
    });
  };

  const handleCreateNew = () => {
    if (pages.length === 0) {
      toast.error("Please create at least one page in Page Builder first.");
      return;
    }
    const page = pages[0]; // Put it on the first available page
    const newComp = {
      id: crypto.randomUUID(),
      type: "budget_request",
      title: "New Request Template",
      description: "",
      columns: [
        { name: "Description", type: "text" },
        { name: "Amount", type: "number" },
      ],
    };
    const newComps =
      typeof page.components === "string" ? JSON.parse(page.components) : page.components || [];
    newComps.push(newComp);

    upsertMutation.mutate({
      id: page.id,
      workspace_id: page.workspace_id,
      slug: page.slug,
      title: page.title || "",
      description: page.description || "",
      header_image_url: page.header_image_url || "",
      logo_url: page.logo_url || "",
      theme_color: page.theme_color || "",
      components: newComps,
      is_published: page.is_published ?? true,
    });
  };

  const handleDelete = () => {
    if (!deletingBlock) return;
    const newComps = (
      typeof deletingBlock.page.components === "string"
        ? JSON.parse(deletingBlock.page.components)
        : deletingBlock.page.components
    ).filter((c: any) => c.id !== deletingBlock.comp.id);
    upsertMutation.mutate({
      id: deletingBlock.page.id,
      workspace_id: deletingBlock.page.workspace_id,
      slug: deletingBlock.page.slug,
      title: deletingBlock.page.title || "",
      description: deletingBlock.page.description || "",
      header_image_url: deletingBlock.page.header_image_url || "",
      logo_url: deletingBlock.page.logo_url || "",
      theme_color: deletingBlock.page.theme_color || "",
      components: newComps,
      is_published: deletingBlock.page.is_published ?? true,
    });
  };

  // Find all request blocks across all pages
  const requestBlocks: { page: any; comp: any }[] = [];
  pages.forEach((page: any) => {
    if (!page.components) return;
    try {
      const comps =
        typeof page.components === "string" ? JSON.parse(page.components) : page.components;
      comps.forEach((comp: any) => {
        if (comp.type === "budget_request" || comp.type === "damage_report") {
          requestBlocks.push({ page, comp });
        }
      });
    } catch (e) {
      // ignore
    }
  });

  const selectedBlock = requestBlocks.find((b) => b.comp.id === selectedFormCompId);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link to={`/dashboard/${activeWorkspace?.slug}/book/finance`}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/60"></div>
            <h1 className="text-xl font-bold tracking-tight">New Request</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNew}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold tracking-tight">Select Template</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Choose which form template you want to use. Templates are created and linked to your
            Page Builder portals.
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
                  <div
                    key={block.comp.id}
                    onClick={() => setSelectedFormCompId(block.comp.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedFormCompId(block.comp.id);
                      }
                    }}
                    className={`group relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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

                    <div className="flex justify-between items-start w-full">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent selecting the template when clicking edit
                            setEditingBlock({
                              page: block.page,
                              comp: JSON.parse(JSON.stringify(block.comp)),
                            });
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBlock({ page: block.page, comp: block.comp });
                            setDeleteConfirmationTitle("");
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base mb-1.5 text-foreground leading-tight group-hover:text-primary transition-colors">
                      {block.comp.title || "Untitled Form"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {block.comp.type === "damage_report" ? "Damage Report" : "Budget Request"}{" "}
                      form on portal{" "}
                      <span className="font-medium text-foreground/80">
                        "{block.page.title || block.page.slug}"
                      </span>
                    </p>
                  </div>
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

      {/* Inline Edit Modal */}
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Customize the form title, description, and required columns for this template.
            </DialogDescription>
          </DialogHeader>

          {editingBlock && (
            <div className="space-y-6 py-4 overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input
                    value={editingBlock.comp.title || ""}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        comp: { ...editingBlock.comp, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Budget Request"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    value={editingBlock.comp.description || ""}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        comp: { ...editingBlock.comp, description: e.target.value },
                      })
                    }
                    placeholder="e.g. Please fill out the items below."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Spreadsheet Columns</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const cols = editingBlock.comp.columns || [];
                        setEditingBlock({
                          ...editingBlock,
                          comp: {
                            ...editingBlock.comp,
                            columns: [...cols, { name: "New Column", type: "text" }],
                          },
                        });
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Column
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(editingBlock.comp.columns || []).map((col: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center bg-secondary/30 p-2 rounded-lg border border-border/50"
                      >
                        <Input
                          value={col.name}
                          onChange={(e) => {
                            const newCols = [...editingBlock.comp.columns];
                            newCols[idx].name = e.target.value;
                            setEditingBlock({
                              ...editingBlock,
                              comp: { ...editingBlock.comp, columns: newCols },
                            });
                          }}
                          placeholder="Column Name"
                          className="bg-background"
                        />
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={col.type || "text"}
                          onChange={(e) => {
                            const newCols = [...editingBlock.comp.columns];
                            newCols[idx].type = e.target.value;
                            setEditingBlock({
                              ...editingBlock,
                              comp: { ...editingBlock.comp, columns: newCols },
                            });
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="date">Date</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newCols = [...editingBlock.comp.columns];
                            newCols.splice(idx, 1);
                            setEditingBlock({
                              ...editingBlock,
                              comp: { ...editingBlock.comp, columns: newCols },
                            });
                          }}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBlock(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingBlock} onOpenChange={(open) => !open && setDeletingBlock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingBlock && (
            <div className="space-y-4 py-4">
              <p className="text-sm">
                To confirm deletion, please type the title of the template:
                <br />
                <span className="font-bold text-foreground">
                  "{deletingBlock.comp.title || "Untitled Form"}"
                </span>
              </p>
              <Input
                value={deleteConfirmationTitle}
                onChange={(e) => setDeleteConfirmationTitle(e.target.value)}
                placeholder="Type the exact title here..."
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingBlock(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                upsertMutation.isPending ||
                deleteConfirmationTitle !== (deletingBlock?.comp.title || "Untitled Form")
              }
            >
              {upsertMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
