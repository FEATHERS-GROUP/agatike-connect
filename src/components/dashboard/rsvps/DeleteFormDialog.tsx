import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomForm } from "@/api/rsvps";

interface DeleteFormDialogProps {
  form: CustomForm | null;
  onClose: () => void;
  onDelete: (formId: string) => void;
  isDeleting: boolean;
  onExport: (formId: string, formTitle: string) => Promise<void>;
  isExporting: boolean;
}

export function DeleteFormDialog({
  form,
  onClose,
  onDelete,
  isDeleting,
  onExport,
  isExporting,
}: DeleteFormDialogProps) {
  if (!form) return null;

  const responsesCount = form.rsvps?.length || 0;

  return (
    <Dialog
      open={form !== null}
      onOpenChange={(open) => {
        if (!open && !isDeleting && !isExporting) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-xl font-bold">
            <Trash2 className="h-5 w-5" />
            Delete RSVP Form
          </DialogTitle>
          <DialogDescription asChild>
            <div className="pt-3 text-sm text-muted-foreground space-y-4">
              {responsesCount > 0 ? (
                <>
                  <p className="leading-relaxed">
                    This form contains <strong className="text-foreground">{responsesCount} responses</strong>. 
                    Would you like to export them to Excel (CSV) before deleting the form?
                  </p>
                  <p className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs leading-relaxed">
                    <span className="font-semibold text-red-500 block mb-0.5">Warning:</span> 
                    Once deleted, the form and all its responses are permanently removed and cannot be recovered.
                  </p>
                </>
              ) : (
                <p className="leading-relaxed">
                  Are you sure you want to delete this form? This action cannot be undone.
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-border/40">
          <Button
            variant="outline"
            className="rounded-full w-full sm:w-auto order-last sm:order-first"
            onClick={onClose}
            disabled={isDeleting || isExporting}
          >
            Cancel
          </Button>
          {responsesCount > 0 ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="destructive"
                className="rounded-full w-full sm:w-auto bg-red-600 hover:bg-red-700 font-medium"
                onClick={() => onDelete(form.id)}
                disabled={isDeleting || isExporting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete Anyway"
                )}
              </Button>
              <Button
                className="rounded-full w-full sm:w-auto text-white font-medium shadow-sm transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
                onClick={async () => {
                  await onExport(form.id, form.title);
                  onDelete(form.id);
                }}
                disabled={isDeleting || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                  </>
                ) : (
                  "Export & Delete"
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              className="rounded-full w-full sm:w-auto bg-red-600 hover:bg-red-700 font-medium"
              onClick={() => onDelete(form.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Form"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
