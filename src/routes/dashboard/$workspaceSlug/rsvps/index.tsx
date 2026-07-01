import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Loader2, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceForms,
  updateCustomForm,
  deleteCustomForm,
  getFormDetails,
  CustomForm,
} from "@/api/rsvps";
import { useState } from "react";
import { toast } from "sonner";
import { RsvpSummaryCards } from "@/components/dashboard/rsvps/RsvpSummaryCards";
import { RsvpSearchFilters } from "@/components/dashboard/rsvps/RsvpSearchFilters";
import { FormCard } from "@/components/dashboard/rsvps/FormCard";
import { DeleteFormDialog } from "@/components/dashboard/rsvps/DeleteFormDialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const { activeWorkspace } = useWorkspace();
  const { workspaceSlug } = Route.useParams();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [deleteConfirmForm, setDeleteConfirmForm] = useState<CustomForm | null>(null);
  const [isExportingBeforeDelete, setIsExportingBeforeDelete] = useState(false);

  const { data: forms = [], isLoading } = useQuery<CustomForm[]>({
    queryKey: ["workspace-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateCustomForm({ data: { id, is_active } } as any),
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? "Form opened to responses" : "Form closed successfully");
      queryClient.invalidateQueries({ queryKey: ["workspace-forms", activeWorkspace?.id] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update form status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomForm({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Form deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["workspace-forms", activeWorkspace?.id] });
      setDeleteConfirmForm(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete form"),
  });

  const handleExportDataForForm = async (formId: string, formTitle: string) => {
    setIsExportingBeforeDelete(true);
    const loadingToast = toast.loading("Fetching form details for export...");
    try {
      const fullForm = await getFormDetails({ data: { id: formId } } as any);
      if (!fullForm) {
        toast.error("Form not found", { id: loadingToast });
        setIsExportingBeforeDelete(false);
        return;
      }

      const rsvps = fullForm.rsvps || [];
      const dynamicFields = fullForm.form_fields || [];

      if (!rsvps.length) {
        toast.error("No responses to export", { id: loadingToast });
        setIsExportingBeforeDelete(false);
        return;
      }

      const headers = ["First Name", "Last Name", "Email Address", "Status", "Date Registered"];
      dynamicFields.forEach((f: any) => headers.push(f.label));

      // Escape header column names to prevent syntax issues if header contains commas or quotes
      const csvRows = [headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",")];

      rsvps.forEach((rsvp: any) => {
        const row = [
          `"${(rsvp.first_name || "").replace(/"/g, '""')}"`,
          `"${(rsvp.last_name || "").replace(/"/g, '""')}"`,
          `"${(rsvp.email || "").replace(/"/g, '""')}"`,
          `"${(rsvp.status || "Registered").replace(/"/g, '""')}"`,
          `"${new Date(rsvp.created_at).toLocaleString()}"`,
        ];

        dynamicFields.forEach((f: any) => {
          const answerObj = rsvp.rsvp_answers?.find((a: any) => a.field_id === f.id);
          let val = answerObj?.answer_value || "";

          // If it's a JSON array (e.g. multi-checkbox answers), parse and format nicely
          if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                val = parsed.join(", ");
              }
            } catch (e) {
              // Keep original string if not valid JSON
            }
          }

          val = String(val).replace(/"/g, '""');
          row.push(`"${val}"`);
        });

        csvRows.push(row.join(","));
      });

      const csvString = csvRows.join("\n");
      // Prepend UTF-8 BOM (\ufeff) to make Excel parse special characters correctly
      const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_rsvps.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Export successful", { id: loadingToast });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data", { id: loadingToast });
    } finally {
      setIsExportingBeforeDelete(false);
    }
  };

  const filteredForms = forms.filter(
    (f: any) => !search || f.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RSVP Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage custom registration forms for{" "}
            {activeWorkspace?.name || "your workspace"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/$workspaceSlug/rsvps/create" params={{ workspaceSlug }}>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Create Form
            </Button>
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <RsvpSummaryCards forms={forms} />

      {/* Search and Filter */}
      <RsvpSearchFilters search={search} setSearch={setSearch} />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center shadow-sm">
          <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No forms found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            You haven't created any custom RSVP forms yet.
          </p>
          <Link to="/dashboard/$workspaceSlug/rsvps/create" params={{ workspaceSlug }}>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Create First Form
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form: CustomForm) => (
            <FormCard
              key={form.id}
              form={form}
              workspaceSlug={workspaceSlug}
              onToggleActive={(f) =>
                toggleActiveMutation.mutate({ id: f.id, is_active: !f.is_active })
              }
              onDeleteClick={(f) => setDeleteConfirmForm(f)}
              isToggling={toggleActiveMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteFormDialog
        form={deleteConfirmForm}
        onClose={() => setDeleteConfirmForm(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
        onExport={handleExportDataForForm}
        isExporting={isExportingBeforeDelete}
      />
    </div>
  );
}
