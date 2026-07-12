import { useState } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileSpreadsheet, HardDrive, Download, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Folder, Eye, Plus, FileText, Presentation, Sparkles, Receipt } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listGoogleDriveFiles, getOrganizerIntegrations, createGoogleDriveFile, readGoogleDriveFileContent } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FolderPathItem = { id: string; name: string };

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/drive")({
  validateSearch: (search: Record<string, unknown>): { path?: string; pageToken?: string } => {
    return {
      path: search.path as string | undefined,
      pageToken: search.pageToken as string | undefined,
    }
  },
  component: DriveHub,
});

function DriveHub() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { path: pathQuery, pageToken } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"folder" | "doc" | "sheet" | "slide" | null>(null);
  
  const [projectFile, setProjectFile] = useState<any>(null);
  const [projectContent, setProjectContent] = useState<any>(null);

  // Parse path from URL, fallback to root
  let folderPath: FolderPathItem[] = [{ id: "root", name: "Drive" }];
  try {
    if (pathQuery) folderPath = JSON.parse(pathQuery);
  } catch (e) {
    console.error("Failed to parse path query", e);
  }

  const currentFolderId = folderPath[folderPath.length - 1].id;

  const { data: integrations, isLoading: loadingIntegrations } = useQuery({
    queryKey: ["organizer-integrations"],
    queryFn: () => getOrganizerIntegrations(),
  });

  const { data: driveResponse, isLoading: loadingFiles, refetch, isRefetching } = useQuery({
    queryKey: ["drive-files", pageToken, currentFolderId],
    queryFn: () => listGoogleDriveFiles({ data: { pageToken, folderId: currentFolderId } }),
    enabled: !!integrations?.google?.drive,
  });

  const createFileMutation = useMutation({
    mutationFn: (data: { name: string; mimeType: string }) => 
      createGoogleDriveFile({ data: { name: data.name, mimeType: data.mimeType, parentFolderId: currentFolderId } }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(`Failed to create: ${res.error}`);
        return;
      }
      toast.success(`${res.file.name} created successfully!`);
      setNewFolderOpen(false);
      setNewFileName("");
      queryClient.invalidateQueries({ queryKey: ["drive-files", pageToken, currentFolderId] });
      
      if (newFileType !== "folder") {
        if (res.file.webViewLink) {
          window.open(res.file.webViewLink, "_blank", "width=1000,height=800,noopener,noreferrer");
        } else {
          window.open(`https://drive.google.com/file/d/${res.file.id}/view`, "_blank", "width=1000,height=800,noopener,noreferrer");
        }
      }
      setNewFileType(null);
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const openProjectMutation = useMutation({
    mutationFn: (file: any) => readGoogleDriveFileContent({ data: { fileId: file.id } }),
    onSuccess: (res, file) => {
      if (!res.success) {
        toast.error(`Failed to read project: ${res.error}`);
        return;
      }
      try {
        const payload = JSON.parse(res.content);
        setProjectContent(payload);
        setProjectFile(file);
      } catch (e) {
        toast.error("Invalid Agatike project file format.");
      }
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const driveConnected = !!integrations?.google?.drive;
  const files = driveResponse?.files || [];
  const nextPageToken = driveResponse?.nextPageToken;

  const handleNextPage = () => {
    if (nextPageToken) {
      navigate({ search: { path: pathQuery, pageToken: nextPageToken } });
    }
  };

  const handlePrevPage = () => {
    navigate({ search: { path: pathQuery, pageToken: undefined } }); // simplified, doesn't store stack in URL for prev
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "Unknown size";
    const size = parseInt(bytes, 10);
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleImport = (fileId: string, fileName: string) => {
    toast.info(`Preparing to pull ${fileName}...`);
    toast.error("Pull logic requires database mapping to be configured.");
  };

  const handleCreateNew = () => {
    if (!newFileName.trim() || !newFileType) return;
    
    const mimeTypes = {
      folder: "application/vnd.google-apps.folder",
      doc: "application/vnd.google-apps.document",
      sheet: "application/vnd.google-apps.spreadsheet",
      slide: "application/vnd.google-apps.presentation",
    };

    createFileMutation.mutate({ name: newFileName, mimeType: mimeTypes[newFileType] });
  };

  const openNewDialog = (type: "folder" | "doc" | "sheet" | "slide") => {
    setNewFileType(type);
    setNewFileName("");
    setNewFolderOpen(true);
  };

  if (loadingIntegrations) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!driveConnected) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link
            to="/dashboard/$workspaceSlug/book"
            params={{ workspaceSlug }}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agatike Book
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-indigo-500" /> Drive Manager
          </h1>
        </div>

        <div className="rounded-3xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <HardDrive className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Google Drive Not Connected</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You need to connect your Google Drive account in Organizer Settings before you can browse and import files.
          </p>
          <Link to="/dashboard/settings" search={{ tab: "integrations" }}>
            <Button>Go to Integrations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            to="/dashboard/$workspaceSlug/book"
            params={{ workspaceSlug }}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agatike Book
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mt-2">
            <HardDrive className="h-8 w-8 text-indigo-500" /> Drive Manager
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your files and pull data into Agatike from Google Drive.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => openNewDialog("folder")}>
                <Folder className="h-4 w-4 mr-2" /> Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openNewDialog("doc")}>
                <FileText className="h-4 w-4 mr-2" /> Google Doc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openNewDialog("sheet")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Google Sheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openNewDialog("slide")}>
                <Presentation className="h-4 w-4 mr-2" /> Google Slide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={loadingFiles || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {driveResponse?.success === false && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error connecting to Google Drive</h3>
            <p className="text-sm mt-1">{driveResponse.error}</p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center overflow-x-auto">
          {folderPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center whitespace-nowrap">
              <Link 
                to="." 
                search={{ path: JSON.stringify(folderPath.slice(0, index + 1)) }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                  index === folderPath.length - 1 
                    ? "font-semibold text-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {index === 0 ? <HardDrive className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                {folder.name}
              </Link>
              {index < folderPath.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground opacity-50" />
              )}
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-border/40">
          {loadingFiles ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))
          ) : files.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>This folder is empty.</p>
            </div>
          ) : (
            files.map((file: any) => {
              const isFolder = file.mimeType === "application/vnd.google-apps.folder";
              const isAgatikeProject = file.name.includes(".agatike");
              
              return (
                <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  {isFolder ? (
                    <Link
                      to="."
                      search={{ path: JSON.stringify([...folderPath, { id: file.id, name: file.name }]) }}
                      className="flex items-center gap-4 cursor-pointer hover:opacity-80 flex-1"
                    >
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {file.iconLink ? (
                          <img src={file.iconLink} alt="" className="h-6 w-6 object-contain" />
                        ) : (
                          <Folder className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-indigo-600 dark:text-indigo-400">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(file.modifiedTime), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {isAgatikeProject ? (
                          <Sparkles className="h-5 w-5 text-indigo-500" />
                        ) : file.iconLink ? (
                          <img src={file.iconLink} alt="" className="h-6 w-6 object-contain" />
                        ) : (
                          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(file.modifiedTime), "MMM d, yyyy 'at' h:mm a")}</span>
                          <span>•</span>
                          <span>{isAgatikeProject ? "Agatike Project" : formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {!isFolder && !isAgatikeProject && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (file.webViewLink) {
                            window.open(file.webViewLink, "_blank", "width=1000,height=800,noopener,noreferrer");
                          } else {
                            window.open(`https://drive.google.com/file/d/${file.id}/view`, "_blank", "width=1000,height=800,noopener,noreferrer");
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    )}
                    {isAgatikeProject && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openProjectMutation.mutate(file)}
                        disabled={openProjectMutation.isPending && openProjectMutation.variables?.id === file.id}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Open Project
                      </Button>
                    )}
                    <Button 
                      variant={isFolder ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => isFolder ? navigate({ search: { path: JSON.stringify([...folderPath, { id: file.id, name: file.name }]) } }) : handleImport(file.id, file.name)}
                    >
                      {isFolder ? "Open Folder" : <><Download className="h-4 w-4 mr-2" /> Pull Data</>}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination Controls */}
        {(pageToken || nextPageToken) && (
          <div className="p-4 border-t border-border/40 bg-muted/10 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {pageToken ? "Page X" : "Page 1"}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={!pageToken || loadingFiles}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={!nextPageToken || loadingFiles}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!projectFile} onOpenChange={(open) => !open && setProjectFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> 
              {projectFile?.name} (Read-Only Preview)
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {projectContent?.projectType === "note" && (
              <div className="border rounded-xl p-6 bg-muted/20">
                <h2 className="text-2xl font-bold mb-4">{projectContent.payload.title || "Untitled Note"}</h2>
                <div 
                  className="prose prose-sm dark:prose-invert" 
                  dangerouslySetInnerHTML={{ __html: projectContent.payload.content }} 
                />
              </div>
            )}
            {projectContent?.projectType === "procurement" && (
              <div className="border rounded-xl p-6 bg-muted/20">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice #{projectContent.payload.invoice_number}
                </h2>
                <div className="text-sm space-y-2 mt-4">
                  <p><strong>Type:</strong> <span className="uppercase">{projectContent.payload.invoice_type}</span></p>
                  <p><strong>Created:</strong> {format(new Date(projectContent.payload.created_at), "PPP")}</p>
                  <p><strong>Items:</strong> {projectContent.payload.items?.length || 0}</p>
                  <p><strong>Subtotal:</strong> {projectContent.payload.currency} {projectContent.payload.items?.reduce((s: number, i: any) => s + Number(i.quantity) * Number(i.unit_price), 0)}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setProjectFile(null)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newFileType === "folder" ? "Create New Folder" : 
               newFileType === "doc" ? "Create New Google Doc" :
               newFileType === "sheet" ? "Create New Google Sheet" :
               "Create New Google Slide"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                autoFocus
                placeholder="Enter a name..." 
                value={newFileName} 
                onChange={(e) => setNewFileName(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNew} disabled={createFileMutation.isPending || !newFileName.trim()}>
              {createFileMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
