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
import { ArrowLeft, Globe, Check, Copy, ExternalLink, Eye, Trash2, Loader2 } from "lucide-react";

export function EditorTopbar({
  activeWorkspace,
  editorState,
  workspace_id,
  handleCopyLink,
  deleteMutation,
  handlePublish,
  saveMutation,
}: any) {
  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/60 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
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
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">/p/</span>
          <span className="text-sm font-semibold truncate">{editorState.slug || "untitled"}</span>
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
