import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlatformModules, getModulesForWorkspaceType } from "@/hooks/usePlatformModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDatabaseWorkspace } from "@/api/workspaces";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Workspace } from "@/contexts/WorkspaceContext";

interface WorkspaceModulesModalProps {
  workspace: Workspace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceModulesModal({ workspace, isOpen, onClose }: WorkspaceModulesModalProps) {
  const { data: allModules = [], isLoading: isLoadingModules } = usePlatformModules();
  const platformModules = getModulesForWorkspaceType(
    allModules,
    workspace?.type || "EVENT",
    !!workspace?.business,
  );
  const queryClient = useQueryClient();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (workspace && isOpen) {
      setSelectedModules(workspace.modules || []);
    }
  }, [workspace, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (moduls: string[]) => {
      if (!workspace) return;
      return await updateDatabaseWorkspace({
        data: {
          id: workspace.id,
          moduls,
          name: workspace.name,
          updated_at: new Date().toISOString(),
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Workspace modules updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onClose();
    },
    onError: (error) => toast.error(error.message || "Failed to update workspace modules."),
  });

  const toggleModule = (moduleId: string, isMandatory?: boolean) => {
    if (isMandatory) return; // Cannot toggle mandatory modules
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl bg-card border-border/60 max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <DialogTitle className="text-xl">Manage Workspace Modules</DialogTitle>
          <DialogDescription>
            Select the features you want active in <strong>{workspace?.name}</strong>. You can
            change this at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-6 flex-1 bg-secondary/10">
          {isLoadingModules ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platformModules?.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.includes(mod.id);
                const isMandatory = mod.mandatory;

                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id, isMandatory)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 bg-card hover:border-primary/50"
                    } ${isMandatory ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{mod.label}</span>
                        {isMandatory && (
                          <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                        {!isMandatory && isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/60 bg-card flex justify-end gap-3 rounded-b-3xl">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate(selectedModules)}
            disabled={updateMutation.isPending || isLoadingModules}
            className="rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Modules"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
