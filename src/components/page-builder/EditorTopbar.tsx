import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  FileText,
  Plus,
  Check,
  MessageSquare,
  Share2,
  Play,
  Settings,
  Globe,
  Loader2,
} from "lucide-react";
import { getWorkspacePageUrl } from "@/lib/utils";

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
  const currentMainPageId = editorState.parent_id || editorState.id;
  const currentMainPage = allPages.find((p: any) => p.id === currentMainPageId);

  const pageLogo = currentMainPage?.logo_url || editorState.logoUrl;
  const displayLogo = pageLogo || activeWorkspace?.logo_url || "/agatike-logo.svg";

  return (
    <div className="sticky top-0 z-20 bg-card border-b border-border/60 px-4 py-2 flex items-center justify-between gap-4 h-14 shrink-0">
      {/* Left: Logo & Dropdown */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Link
          to="/"
          className="flex items-center shrink-0 w-8 h-8 rounded-md justify-center p-1 overflow-hidden"
        >
          <img
            src={displayLogo}
            alt="Logo"
            className={`h-full w-full object-contain ${displayLogo === "/agatike-logo.svg" ? "dark:invert" : ""}`}
          />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2 text-foreground font-medium hover:bg-secondary/60"
            >
              <span className="truncate max-w-[200px]">
                {editorState.title || "Untitled"} - {activeWorkspace?.name || "Workspace"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Switch Page
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {(() => {
                const currentMainPageId = editorState.parent_id || editorState.id;
                const currentMainPage = allPages.find((p: any) => p.id === currentMainPageId);
                const currentSubPages = allPages.filter(
                  (p: any) => p.parent_id === currentMainPageId,
                );

                if (!currentMainPage) return null;

                return (
                  <React.Fragment>
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                        search={{ pageId: currentMainPage.id } as any}
                        className="cursor-pointer py-2"
                      >
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate font-medium">
                            {currentMainPage.title || "Untitled"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            /p/{currentMainPage.slug || "untitled"}
                          </span>
                        </div>
                        {currentMainPage.id === editorState.id && (
                          <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {currentSubPages.map((subPage: any) => (
                      <DropdownMenuItem key={subPage.id} asChild>
                        <Link
                          to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}
                          search={{ pageId: subPage.id } as any}
                          className="cursor-pointer py-2 pl-8 relative overflow-visible"
                        >
                          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                          <div className="absolute left-3 top-1/2 w-3 h-px bg-border" />
                          <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0 relative z-10" />
                          <div className="flex flex-col min-w-0 flex-1 relative z-10">
                            <span className="truncate font-medium text-xs">
                              {subPage.title || "Untitled"}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate">
                              /p/{subPage.slug || "untitled"}
                            </span>
                          </div>
                          {subPage.id === editorState.id && (
                            <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0 relative z-10" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </React.Fragment>
                );
              })()}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 ml-2 rounded-full hidden sm:flex"
          asChild
        >
          <Link to={`/dashboard/${activeWorkspace?.slug}/page-builder/editor` as any}>
            <Plus className="w-3.5 h-3.5" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          onClick={() => handleCopyLink(editorState.slug)}
          title="Share link"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          onClick={() =>
            window.open(getWorkspacePageUrl(editorState.slug), "_blank", "noopener,noreferrer")
          }
          title="Preview"
        >
          <Play className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePublish}
          disabled={saveMutation.isPending}
          size="sm"
          className="ml-2 h-8 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium shadow-sm transition-all"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          Publish
        </Button>
      </div>
    </div>
  );
}
