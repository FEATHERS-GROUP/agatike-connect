import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PAGE_TEMPLATES } from "@/lib/page-templates";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, LayoutTemplate, FileText, Globe, Copy, ExternalLink, Calendar, HelpCircle, Briefcase, HandCoins, Users } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
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
      case "Corporate": return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "Events": return <Calendar className="w-5 h-5 text-rose-500" />;
      case "Customer Service": return <HelpCircle className="w-5 h-5 text-teal-500" />;
      case "HR": return <Users className="w-5 h-5 text-purple-500" />;
      case "Sales": return <HandCoins className="w-5 h-5 text-emerald-500" />;
      case "Non-Profit": return <HandCoins className="w-5 h-5 text-amber-500" />;
      default: return <LayoutTemplate className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary/10">
      <div className="border-b border-border/60 bg-card p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Page Builder</h1>
            <p className="text-muted-foreground mt-1">Create and manage your custom landing pages</p>
          </div>
          <Button onClick={() => navigate({ to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor` })}>
            <Plus className="w-4 h-4 mr-2" /> Blank Page
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="templates">Template Gallery</TabsTrigger>
              <TabsTrigger value="pages">Your Pages ({allPages.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Blank Page Card */}
                <div 
                  className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl p-8 bg-card hover:bg-secondary/20 hover:border-primary/50 transition-colors cursor-pointer text-center h-64"
                  onClick={() => navigate({ to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor` })}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Start from Scratch</h3>
                  <p className="text-sm text-muted-foreground mt-2">Build a custom page from a blank canvas</p>
                </div>

                {/* Templates */}
                {PAGE_TEMPLATES.map(template => (
                  <div 
                    key={template.id} 
                    className="group border border-border/60 rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all cursor-pointer flex flex-col h-64"
                    onClick={() => navigate({ 
                      to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                      search: { templateId: template.id }
                    })}
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
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{template.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-primary">Use Template</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pages">
              {isLoadingList ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : allPages.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border/60">
                  <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    You haven't created any custom pages. Choose a template or start from scratch to build your first page.
                  </p>
                  <Button onClick={() => navigate({ to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor` })}>
                    <Plus className="w-4 h-4 mr-2" /> Create Page
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPages.map((page: any) => (
                    <div 
                      key={page.id} 
                      className="group border border-border/60 rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all flex flex-col h-64"
                    >
                      <div 
                        className="h-32 flex items-center justify-center relative overflow-hidden cursor-pointer bg-secondary"
                        style={page.theme_color ? { backgroundColor: `${page.theme_color}22` } : {}}
                        onClick={() => navigate({ 
                          to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                          search: { pageId: page.id }
                        })}
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
                            style={{ color: page.theme_color || 'currentColor' }} 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                        <div 
                          className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-semibold tracking-wider backdrop-blur-sm pointer-events-none ${
                            page.is_published ? "bg-green-500/20 text-green-500 border border-green-500/30" : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                          }`}
                        >
                          {page.is_published ? "Published" : "Draft"}
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 
                          className="font-semibold text-base mb-1 truncate cursor-pointer hover:text-primary"
                          onClick={() => navigate({ 
                            to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                            search: { pageId: page.id }
                          })}
                        >
                          {page.title || "Untitled Page"}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate mb-auto">
                          <span className="opacity-50">/p/</span>{page.slug || "untitled"}
                        </p>
                        
                        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs hover:text-primary -ml-2"
                            onClick={() => navigate({ 
                              to: `/dashboard/${activeWorkspace?.slug}/page-builder/editor`,
                              search: { pageId: page.id }
                            })}
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
                                  <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
