import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { inviteContributor, getContributors, removeContributor } from "@/api/project_contributors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2, Mail, Shield, Users, ChevronDown } from "lucide-react";

interface InviteContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: "ticket_project" | "page_project" | "badge_project" | "venue_project";
  resourceId: string;
}

export function InviteContributorModal({ isOpen, onClose, resourceType, resourceId }: InviteContributorModalProps) {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");

  const { data: contributors = [], isLoading } = useQuery({
    queryKey: ["contributors", resourceType, resourceId],
    queryFn: () => getContributors({ data: { resource_type: resourceType, resource_id: resourceId } } as any),
    enabled: isOpen && !!resourceId,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteContributor({
        data: {
          email,
          workspace_id: activeWorkspace?.id!,
          resource_type: resourceType,
          resource_id: resourceId,
          access_level: accessLevel,
        },
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributors", resourceType, resourceId] });
      setEmail("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeContributor({ data: { id } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributors", resourceType, resourceId] });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-background border-border/60 p-0 overflow-hidden shadow-2xl">
        <div className="relative p-6 pb-4 bg-secondary/30 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent border-b border-border/60">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Manage Contributors
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Invite team members or collaborators to access this specific design project.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full"></div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">Invite a new contributor</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end gap-3 p-1">
              <div className="flex-1 w-full space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-card border-border/60 focus:border-primary/50 focus:ring-primary/50 text-foreground rounded-xl placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>
              </div>

              <div className="w-full sm:w-[140px] space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium ml-1">Access</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    className="w-full h-11 pl-9 pr-8 rounded-xl border border-border/60 bg-card text-foreground text-sm appearance-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                    value={accessLevel}
                    onChange={(e: any) => setAccessLevel(e.target.value)}
                  >
                    <option value="view" className="bg-background">View only</option>
                    <option value="edit" className="bg-background">Can edit</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Button
                onClick={() => inviteMutation.mutate()}
                disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || inviteMutation.isPending}
                className="h-11 px-6 rounded-xl w-full sm:w-auto font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                {inviteMutation.isPending ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-muted-foreground/30 rounded-full"></div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Existing Contributors</h3>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="text-sm text-muted-foreground animate-pulse">Loading contributors...</p>
                </div>
              ) : contributors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No contributors yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Invite team members above to grant them access to this project.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {contributors.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium text-sm">
                            {c.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">{c.email}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {c.access_level === "edit" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                <EditIcon className="w-3 h-3" /> Can Edit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                <EyeIcon className="w-3 h-3" /> View Only
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-full flex-shrink-0"
                        onClick={() => removeMutation.mutate(c.id)}
                        disabled={removeMutation.isPending}
                        title="Remove Contributor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
