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
  return (
    <div className="sticky top-0 z-20 bg-card border-b border-border/60 px-4 py-2 flex items-center justify-between gap-4 h-14 shrink-0">
      {/* Left: Logo & Dropdown */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Link to="/" className="flex items-center shrink-0 w-8 h-8 bg-black rounded-md justify-center p-1">
          <img src="/agatike-logo.svg" alt="A" className="h-full w-full object-contain filter invert" />
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
              {allPages
                .filter((p: any) => !p.parent_id)
                .map((page: any) => (
                  <DropdownMenuItem key={page.id} asChild>
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
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center: Segmented Controls */}
      <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-border/40 shrink-0">
        <Button variant="ghost" size="sm" className="rounded-full h-7 px-4 text-xs text-muted-foreground hover:text-foreground">
          Sitemap
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-7 px-4 text-xs text-muted-foreground hover:text-foreground">
          Wireframe
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-7 px-4 text-xs bg-background shadow-sm text-foreground font-medium">
          Website
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80" onClick={() => handleCopyLink(editorState.slug)}>
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80" asChild>
          <a href={getWorkspacePageUrl(editorState.slug)} target="_blank" rel="noreferrer">
            <Play className="w-4 h-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80">
          <Settings className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePublish}
          disabled={saveMutation.isPending}
          size="sm"
          className="ml-2 h-8 px-4 rounded-full bg-[#004B03] hover:bg-[#003802] text-white gap-2 font-medium"
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
