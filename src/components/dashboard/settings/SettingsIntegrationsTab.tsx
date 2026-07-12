import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  HardDrive, 
  Calendar, 
  LayoutGrid, 
  Palette, 
  CheckCircle2, 
  Link2, 
  Unlink, 
  AlertCircle,
  FolderSync,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizerIntegrations, saveGoogleCredentials, disconnectGoogleIntegration, updateIntegrationSettings } from "@/api/integrations";
import { useWorkspace } from "@/contexts/WorkspaceContext";

function IntegrationsContent() {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["organizer-integrations"],
    queryFn: () => getOrganizerIntegrations(),
  });

  const driveConnected = !!integrations?.google?.drive;
  const calendarConnected = !!integrations?.google?.calendar;
  
  const driveSettings = integrations?.google?.drive?.settings || {};
  const [driveSyncFolders, setDriveSyncFolders] = useState(driveSettings.syncFolders || false);

  const updateSettingsMutation = useMutation({
    mutationFn: async (input: any) => {
      return await updateIntegrationSettings(input);
    },
    onSuccess: (data: any) => {
      if (data && data.success === false) {
        toast.error(`Error saving settings: ${data.error}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["organizer-integrations"] });
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(`Request Error: ${error.message}`);
    }
  });

  const saveCredsMutation = useMutation({
    mutationFn: async (input: any) => {
      console.log("[saveCredsMutation] Executing saveGoogleCredentials with input:", input);
      const res = await saveGoogleCredentials(input);
      console.log("[saveCredsMutation] Raw response from saveGoogleCredentials:", res);
      return res;
    },
    onSuccess: (data: any) => {
      console.log("[saveCredsMutation] Response:", data);
      if (data && data.success === false) {
        toast.error(`Database Error: ${data.error}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["organizer-integrations"] });
      toast.success("Credentials saved to database successfully!");
    },
    onError: (error) => {
      console.error("[saveCredsMutation] Failed to save credentials to database:", error);
      toast.error(`Request Error: ${error.message}`);
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (input: any) => {
      console.log("[disconnectMutation] Executing disconnectGoogleIntegration with input:", input);
      const res = await disconnectGoogleIntegration(input);
      console.log("[disconnectMutation] Raw response:", res);
      return res;
    },
    onSuccess: (data: any) => {
      console.log("[disconnectMutation] Response:", data);
      if (data && data.success === false) {
        toast.error(`Error: ${data.error}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["organizer-integrations"] });
      toast.success("Disconnected successfully!");
    },
    onError: (error) => {
      console.error("[disconnectMutation] Failed to disconnect:", error);
      toast.error(`Request Error: ${error.message}`);
    }
  });

  const isDriveLoading = 
    (saveCredsMutation.isPending && saveCredsMutation.variables?.data?.type === "drive") || 
    (disconnectMutation.isPending && disconnectMutation.variables?.data?.type === "drive");

  const isCalendarLoading = 
    (saveCredsMutation.isPending && saveCredsMutation.variables?.data?.type === "calendar") || 
    (disconnectMutation.isPending && disconnectMutation.variables?.data?.type === "calendar");

  const driveLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("[driveLogin] OAuth Popup Success! Token:", tokenResponse);
      console.log("[driveLogin] Mutating drive token data");
      saveCredsMutation.mutate({
        data: {
          type: "drive",
          tokenData: tokenResponse
        }
      } as any);
    },
    onError: (error) => {
      console.error("[driveLogin] OAuth Popup Failed:", error);
      toast.error("Google Drive connection failed in popup");
    },
    scope: "https://www.googleapis.com/auth/drive.file"
  });

  const calendarLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("[calendarLogin] OAuth Popup Success! Token:", tokenResponse);
      console.log("[calendarLogin] Mutating calendar token data");
      saveCredsMutation.mutate({
        data: {
          type: "calendar",
          tokenData: tokenResponse
        }
      } as any);
    },
    onError: (error) => {
      console.error("[calendarLogin] OAuth Popup Failed:", error);
      toast.error("Google Calendar connection failed in popup");
    },
    scope: "https://www.googleapis.com/auth/calendar.events"
  });

  const handleConnectDrive = () => {
    if (driveConnected) {
      disconnectMutation.mutate({ data: { type: "drive" } } as any);
      toast.success("Google Drive disconnected");
    } else {
      driveLogin();
    }
  };

  const handleConnectCalendar = () => {
    if (calendarConnected) {
      disconnectMutation.mutate({ data: { type: "calendar" } } as any);
      toast.success("Google Calendar disconnected");
    } else {
      calendarLogin();
    }
  };

  const handleToggleSync = (checked: boolean) => {
    setDriveSyncFolders(checked);
    updateSettingsMutation.mutate({
      data: {
        type: "drive",
        settings: { syncFolders: checked }
      }
    } as any);
  };

  const handleFolderChange = (value: string) => {
    updateSettingsMutation.mutate({
      data: {
        type: "drive",
        settings: { exportFolder: value }
      }
    } as any);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Global Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect your workspace with third-party tools to automate your workflows. These settings apply globally across your organizer workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Google Drive Integration */}
        <div className={`rounded-xl border transition-all duration-300 ${driveConnected ? "border-primary/50 shadow-md bg-primary/5" : "border-border bg-card"}`}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${driveConnected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Google Drive</h3>
                    {driveConnected && (
                      <span className="flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    Export excel files, backup folders, and seamlessly move information from Agatike to your Google Drive.
                  </p>
                </div>
              </div>
              <Button 
                variant={driveConnected ? "outline" : "default"} 
                onClick={handleConnectDrive}
                disabled={isDriveLoading}
                className={driveConnected ? "text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10" : ""}
              >
                {isDriveLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {driveConnected ? "Disconnecting..." : "Connecting..."}</>
                ) : driveConnected ? (
                  <><Unlink className="w-4 h-4 mr-2" /> Disconnect</>
                ) : (
                  <><Link2 className="w-4 h-4 mr-2" /> Connect</>
                )}
              </Button>
            </div>

            {driveConnected && (
              <div className="mt-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-2">
                <div className="flex items-start gap-3 p-3 mb-6 bg-blue-500/10 text-blue-600 rounded-lg text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>
                    <strong>Note:</strong> Files can only be added or modified by Agatike. We cannot delete files or folders from your Google Drive account to ensure your data remains safe.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Default Export Folder</Label>
                    <Select defaultValue={driveSettings.exportFolder || "agatike-exports"} onValueChange={handleFolderChange}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">My Drive (Root)</SelectItem>
                        <SelectItem value="agatike-exports">/Agatike Exports</SelectItem>
                        <SelectItem value="agatike-events">/Agatike Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose where exported Excel files will be saved.</p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Enable Folder Sync</Label>
                      <p className="text-xs text-muted-foreground">Automatically backup event folders</p>
                    </div>
                    <Switch checked={driveSyncFolders} onCheckedChange={handleToggleSync} disabled={updateSettingsMutation.isPending} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className={`rounded-xl border transition-all duration-300 ${calendarConnected ? "border-primary/50 shadow-md bg-primary/5" : "border-border bg-card"}`}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${calendarConnected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Google Calendar</h3>
                    {calendarConnected && (
                      <span className="flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    Automatically sync all your workspace events and meetings directly to your Google Calendar.
                  </p>
                </div>
              </div>
              <Button 
                variant={calendarConnected ? "outline" : "default"} 
                onClick={handleConnectCalendar}
                disabled={isCalendarLoading}
                className={calendarConnected ? "text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10" : ""}
              >
                {isCalendarLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {calendarConnected ? "Disconnecting..." : "Connecting..."}</>
                ) : calendarConnected ? (
                  <><Unlink className="w-4 h-4 mr-2" /> Disconnect</>
                ) : (
                  <><Link2 className="w-4 h-4 mr-2" /> Connect</>
                )}
              </Button>
            </div>

            {calendarConnected && (
              <div className="mt-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 p-4 bg-background border rounded-lg">
                  <div className="bg-green-500/10 p-2 rounded-full text-green-600 shrink-0">
                    <FolderSync className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Automatic Sync Enabled</h4>
                    <p className="text-xs text-muted-foreground">
                      Events created in Agatike will be automatically pushed to your primary Google Calendar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Integrations */}
        <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500 rounded-xl border border-border bg-card">
          <div className="p-6 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-muted text-muted-foreground shrink-0">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-muted-foreground">Microsoft Office 365</h3>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/80">
                  Sync with OneDrive and Outlook Calendar.
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>Connect</Button>
          </div>
        </div>

        <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500 rounded-xl border border-border bg-card">
          <div className="p-6 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-muted text-muted-foreground shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-muted-foreground">Canva</h3>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/80">
                  Import designs and flyers directly into your Agatike events.
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>Connect</Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function SettingsIntegrationsTab() {
  // @ts-ignore
  const clientId = import.meta.env.GOOGLE_AUTH_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
        <h3 className="font-bold mb-1">Missing Google Configuration</h3>
        <p className="text-sm">Please make sure GOOGLE_AUTH_CLIENT_ID is set in your .env file.</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <IntegrationsContent />
    </GoogleOAuthProvider>
  );
}
