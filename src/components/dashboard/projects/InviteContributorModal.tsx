import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { inviteContributor, getContributors, removeContributor } from "@/api/project_contributors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-md bg-zinc-950 border-border/40">
        <DialogHeader>
          <DialogTitle>Project Contributors</DialogTitle>
        </DialogHeader>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 rounded-xl border border-border/60 bg-white/5 p-4">
          <h3 className="text-sm font-medium">Invite a new contributor</h3>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>Email address</Label>
              <Input
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Access</Label>
              <select
                className="h-10 w-[120px] rounded-xl border border-border/60 bg-background px-3 focus:outline-none focus:border-primary"
                value={accessLevel}
                onChange={(e: any) => setAccessLevel(e.target.value)}
              >
                <option value="view">View only</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!email || inviteMutation.isPending}
              style={{ background: "var(--gradient-primary)" }}
            >
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Existing Contributors</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : contributors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contributors invited yet.</p>
          ) : (
            <div className="divide-y divide-border/40 rounded-xl border border-border/60">
              {contributors.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{c.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">Access: {c.access_level}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    onClick={() => removeMutation.mutate(c.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}
