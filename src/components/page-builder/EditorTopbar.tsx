import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Trash2,
  Loader2,
  ChevronDown,
  FileText,
  Plus,
} from "lucide-react";

export function EditorTopbar({
  activeWorkspace,
  editorState,
  workspace_id,
  allPages = [],
  handleCopyLink,
  deleteMutation,
  handlePublish,
  saveMutation,
}: any) {
  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/60 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <Link to="/" className="flex items-center shrink-0">
          <img src="/agatike-logo.svg" alt="Agatike" className="h-6 w-auto object-contain" />
        </Link>
        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to={`/dashboard/${activeWorkspace?.slug}/page-builder/` as any}>
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>
        </Button>
        <div className="h-4 w-px bg-border/60 mx-1" />
        <div className="flex items-center gap-2 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold truncate max-w-[150px]">
                  {editorState.slug || "untitled"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pages in Website
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {allPages
                  .filter((p: any) => !p.parent_id)
                  .map((page: any) => (
                    <div key={page.id}>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                          search={{ pageId: page.id } as any}
                          className="cursor-pointer py-2"
                        >
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="truncate font-medium">{page.title || "Untitled"}</span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              /p/{page.slug || "untitled"}
                            </span>
                          </div>
                          {page.id === editorState.id && (
                            <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                      {allPages
                        .filter((child: any) => child.parent_id === page.id)
                        .map((child: any) => (
                          <DropdownMenuItem
                            key={child.id}
                            asChild
                            className="ml-6 pl-2 border-l border-border/60 rounded-none"
                          >
                            <Link
                              to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                              search={{ pageId: child.id } as any}
                              className="cursor-pointer py-1.5"
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate text-xs font-medium">
                                  {child.title || "Untitled"}
                                </span>
                                <span className="text-[9px] text-muted-foreground truncate">
                                  /p/{child.slug || "untitled"}
                                </span>
                              </div>
                              {child.id === editorState.id && (
                                <Check className="h-3 w-3 text-primary ml-2 shrink-0" />
                              )}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </div>
                  ))}
              </div>
              <DropdownMenuSeparator />
              {editorState.id && !editorState.parent_id && (
                <DropdownMenuItem asChild>
                  <Link
                    to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                    search={{ parentId: editorState.id } as any}
                    className="cursor-pointer text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sub-Page
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link
                  to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                  search={{} as any}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Website Page
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {editorState.id && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20">
              <Check className="w-2.5 h-2.5" /> Saved
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {editorState.slug && editorState.id && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => handleCopyLink(editorState.slug)}
            title="Copy public link"
          >
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </Button>
        )}
        {editorState.slug && editorState.id && (
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href={`/p/${editorState.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> View Live
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const previewData = {
              workspace_id,
              title: editorState.title,
              description: editorState.description,
              theme_color: editorState.themeColor,
              header_image_url: editorState.headerImageUrl,
              logo_url: editorState.logoUrl,
              components: [
                {
                  type: "page_settings",
                  logoPosition: editorState.logoPosition,
                  fontFamily: editorState.fontFamily,
                },
                ...editorState.components,
              ],
            };
            localStorage.setItem("page_preview_data", JSON.stringify(previewData));
            window.open(`/p/${editorState.slug || "preview"}?preview=true`, "_blank");
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
        </Button>

        {editorState.id && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this page?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>/p/{editorState.slug}</strong>. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => editorState.id && deleteMutation.mutate(editorState.id)}
                >
                  Delete Page
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button
          onClick={handlePublish}
          disabled={saveMutation.isPending}
          size="sm"
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {editorState.id ? "Save & Publish" : "Publish Page"}
        </Button>
      </div>
    </div>
  );
}
