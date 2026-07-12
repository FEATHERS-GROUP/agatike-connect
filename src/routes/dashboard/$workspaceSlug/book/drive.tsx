import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileSpreadsheet, HardDrive, Download, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listGoogleDriveFiles, getOrganizerIntegrations } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/drive")({
  component: DriveHub,
});

function DriveHub() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();

  const { data: integrations, isLoading: loadingIntegrations } = useQuery({
    queryKey: ["organizer-integrations"],
    queryFn: () => getOrganizerIntegrations(),
  });

  const { data: driveResponse, isLoading: loadingFiles, refetch, isRefetching } = useQuery({
    queryKey: ["drive-files"],
    queryFn: () => listGoogleDriveFiles(),
    enabled: !!integrations?.google?.drive,
  });

  const driveConnected = !!integrations?.google?.drive;
  const files = driveResponse?.files || [];

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "Unknown size";
    const size = parseInt(bytes, 10);
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleImport = (fileId: string, fileName: string) => {
    // We will build the import logic later.
    toast.info(`Preparing to import ${fileName}...`);
    toast.error("Import logic requires database mapping to be configured.");
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
            to={`/dashboard/${workspaceSlug}/book`}
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
            You need to connect your Google Drive account in Organizer Settings before you can browse and import Excel files.
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
            to={`/dashboard/${workspaceSlug}/book`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agatike Book
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full mb-3 ml-4">
            Beta Feature
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-indigo-500" /> Drive Manager
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your exported Excel files and pull data into Agatike from Google Drive.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          disabled={loadingFiles || isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Files
        </Button>
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

      <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
        <div className="p-6 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" /> Excel Files in Drive
          </h2>
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
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No Excel files found in your Google Drive.</p>
            </div>
          ) : (
            files.map((file: any) => (
              <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(file.modifiedTime), "MMM d, yyyy 'at' h:mm a")}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleImport(file.id, file.name)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
