import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllWorkspacePages, checkWorkspacePageSlugAvailability } from "@/api/workspace-pages";
import { updateWorkspacePageFolder } from "@/api/workspace-pages";
import { FolderManager } from "@/components/ui/FolderManager";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PAGE_TEMPLATES } from "@/lib/page-templates";
import { getWorkspacePageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  LayoutTemplate,
  FileText,
  Globe,
  Copy,
  ExternalLink,
  Calendar,
  HelpCircle,
  Briefcase,
  HandCoins,
  Users,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SlugPromptModal } from "@/components/page-builder/SlugPromptModal";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";

export const Route = createFileRoute("/dashboard/$workspaceSlug/page-builder/")({
  component: PageBuilderGallery,
});

function PageBuilderGallery() {
  const { activeWorkspace } = useWorkspace();
  const workspace_id = activeWorkspace?.id;
  const navigate = useNavigate();

  const { data: allPages = [], isLoading: isLoadingList } = useQuery({
    queryKey: ["all-workspace-pages", workspace_id],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  const {
    hasStudioAccess,
    canCreatePageBuilder,
    isLoading: limitsLoading,
  } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateWorkspacePageFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["all-workspace-pages", workspace_id] }),
  });

  const handleBulkMove = async (itemIds: string[], folderId: string | null) => {
    const promises = itemIds.map((id) => moveMutation.mutateAsync({ id, folderId }));
    await Promise.all(promises);
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    // Page deletion is handled from the editor
    console.log("Bulk delete not supported for pages. Please delete from the editor.");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = PAGE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPages = allPages.filter(
    (p: any) =>
      !p.parent_id &&
      ((p.title || "Untitled Page").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleCopyLink = (slug: string) => {
    const url = getWorkspacePageUrl(slug);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!", { description: url });
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Corporate":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "Events":
        return <Calendar className="w-5 h-5 text-rose-500" />;
      case "Customer Service":
        return <HelpCircle className="w-5 h-5 text-teal-500" />;
      case "HR":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "Sales":
        return <HandCoins className="w-5 h-5 text-emerald-500" />;
      case "Community":
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-500" />;
    }
  };

  const [slugPromptOpen, setSlugPromptOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleStartProject = (templateId: string | null) => {
    if (!canCreatePageBuilder()) {
      toast.error("Page Builder limit reached. Please upgrade your plan to create more pages.");
      return;
    }
    setSelectedTemplate(templateId);
    setSlugPromptOpen(true);
  };

  if (limitsLoading) return null;
  if (!hasStudioAccess()) {
    return (
      <div className="p-6 h-full">
        <UpgradePrompt
          title="Upgrade to Access Page Builder"
          description="Page Builder is a premium feature available in higher tier plans. Upgrade your subscription to start building custom portals."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary/10">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="templates" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="templates">Template Gallery</TabsTrigger>
                <TabsTrigger value="pages">Your Pages ({allPages.length})</TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages & templates..."
                  className="pl-9 bg-card h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Blank Page Card */}
                <div
                  className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl p-8 bg-card hover:bg-secondary/20 hover:border-primary/50 transition-colors cursor-pointer text-center h-64"
                  onClick={() => handleStartProject(null)}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Start from Scratch</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Build a custom page from a blank canvas
                  </p>
                </div>

                {/* Templates */}
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group border border-border/60 rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all cursor-pointer flex flex-col h-64"
                    onClick={() => handleStartProject(template.id)}
                  >
                    <div className="h-32 bg-secondary flex items-center justify-center relative overflow-hidden">
                      <img
                        src={template.headerImageUrl || `/page-templates/${template.id}.png`}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div
                        className="absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-semibold tracking-wider text-white backdrop-blur-sm"
                        style={{ backgroundColor: `${template.themeColor}dd` }}
                      >
                        {template.category}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-base mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                        {template.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-primary">Use Template</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pages">
              <FolderManager
                moduleType="page_builder"
                items={filteredPages}
                getItemId={(item) => item.id}
                getFolderId={(item) => item.folder_id}
                onMoveItems={handleBulkMove}
                onDeleteItems={handleBulkDelete}
              >
                {({ filteredItems, handleSelect, selectedIds, ItemMenu }) => (
                  <>
                    {isLoadingList ? (
                      <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="text-center py-20 bg-card rounded-2xl border border-border/60">
                        <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        {searchQuery ? (
                          <>
                            <h3 className="text-lg font-semibold mb-2">No results found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                              No pages match your search "{searchQuery}".
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                              You haven't created any custom pages. Choose a template or start from
                              scratch to build your first page.
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((page: any) => {
                          const isSelected = selectedIds.has(page.id);
                          return (
                            <div
                              key={page.id}
                              className="group relative border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all flex flex-col h-64"
                              style={{
                                borderColor: isSelected
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--border) / 0.6)",
                              }}
                            >
                              <div
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(c) => handleSelect(page.id, c as boolean)}
                                  className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary"
                                />
                              </div>
                              <div
                                className="h-32 flex items-center justify-center relative overflow-hidden cursor-pointer bg-secondary"
                                style={
                                  page.theme_color
                                    ? { backgroundColor: `${page.theme_color}22` }
                                    : {}
                                }
                                onClick={() =>
                                  navigate({
                                    to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                                    search: { pageId: page.id },
                                  })
                                }
                              >
                                {page.header_image_url ? (
                                  <img
                                    src={page.header_image_url}
                                    alt={page.title || "Untitled"}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <Globe
                                    className="w-12 h-12 opacity-20"
                                    style={{ color: page.theme_color || "currentColor" }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                                <div
                                  className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-semibold tracking-wider backdrop-blur-sm pointer-events-none ${
                                    page.is_published
                                      ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                      : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                  }`}
                                >
                                  {page.is_published ? "Published" : "Draft"}
                                </div>
                              </div>

                              <div className="p-4 flex flex-col flex-1">
                                <h3
                                  className="font-semibold text-base mb-1 truncate cursor-pointer hover:text-primary"
                                  onClick={() =>
                                    navigate({
                                      to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                                      search: { pageId: page.id },
                                    })
                                  }
                                >
                                  {page.title || "Untitled Page"}
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate mb-auto">
                                  <span className="opacity-50">/p/</span>
                                  {page.slug || "untitled"}
                                </p>

                                <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs hover:text-primary -ml-2"
                                    onClick={() =>
                                      navigate({
                                        to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                                        search: { pageId: page.id },
                                      })
                                    }
                                  >
                                    Edit Page
                                  </Button>
                                  <div className="flex items-center gap-1">
                                    {page.slug && page.is_published && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                          title="Copy Link"
                                          onClick={() => handleCopyLink(page.slug)}
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                          title="View Live"
                                          asChild
                                        >
                                          <a
                                            href={getWorkspacePageUrl(page.slug)}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </FolderManager>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <SlugPromptModal
        open={slugPromptOpen}
        setOpen={setSlugPromptOpen}
        workspaceSlug={activeWorkspace?.slug}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}
