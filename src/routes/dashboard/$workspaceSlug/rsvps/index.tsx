import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
  Edit2,
  Eye,
  Ban,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceForms, updateCustomForm, deleteCustomForm, getFormDetails } from "@/api/rsvps";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";


export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { workspaceSlug } = Route.useParams();
  const [search, setSearch] = useState("");

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["workspace-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const filteredForms = forms.filter(
    (f: any) => !search || f.title.toLowerCase().includes(search.toLowerCase()),
  );

  const queryClient = useQueryClient();
  const [deleteConfirmForm, setDeleteConfirmForm] = useState<any>(null);
  const [isExportingBeforeDelete, setIsExportingBeforeDelete] = useState(false);

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

      const csvRows = [headers.join(",")];

      rsvps.forEach((rsvp: any) => {
        const row = [
          `"${rsvp.first_name || ""}"`,
          `"${rsvp.last_name || ""}"`,
          `"${rsvp.email || ""}"`,
          `"${rsvp.status || "Registered"}"`,
          `"${new Date(rsvp.created_at).toLocaleString()}"`,
        ];

        dynamicFields.forEach((f: any) => {
          const answerObj = rsvp.rsvp_answers?.find((a: any) => a.field_id === f.id);
          let val = answerObj?.answer_value || "";
          val = val.replace(/"/g, '""');
          row.push(`"${val}"`);
        });

        csvRows.push(row.join(","));
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Forms</p>
              <h3 className="text-3xl font-bold mt-2">{forms.filter((f) => f.is_active).length}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <LayoutTemplate className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
              <h3 className="text-3xl font-bold mt-2">
                {forms.reduce((acc, f) => acc + (f.rsvps?.length || 0), 0)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="rounded-full shadow-sm w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

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
          {filteredForms.map((form: any) => (
            <div
              key={form.id}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              onClick={() =>
                navigate({
                  to: "/dashboard/$workspaceSlug/rsvps/$formId",
                  params: {
                    workspaceSlug,
                    formId: form.id,
                  },
                })
              }
            >
              <div className="h-32 w-full bg-secondary relative overflow-hidden">
                <img
                  src={form.cover_image_url || "/default-form-cover.png"}
                  alt={form.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      form.is_active
                        ? "bg-green-500/90 text-white backdrop-blur-sm shadow-sm"
                        : "bg-secondary/90 text-muted-foreground backdrop-blur-sm"
                    }`}
                  >
                    {form.is_active ? "Active" : "Closed"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {form.title}
                  </h3>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full -mt-1 -mr-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
                          }}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" /> Copy Public Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: "/dashboard/$workspaceSlug/rsvps/$formId",
                              params: { workspaceSlug, formId: form.id },
                            })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> View RSVPs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: form.id,
                              is_active: !form.is_active,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                        >
                          <Ban className="mr-2 h-4 w-4" /> {form.is_active ? "Close Form" : "Open Form"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          onClick={() => setDeleteConfirmForm(form)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {form.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                  <div className="flex items-center text-sm font-medium">
                    <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    {form.rsvps?.length || 0} RSVPs
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmForm !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending && !isExportingBeforeDelete) {
            setDeleteConfirmForm(null);
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
                {deleteConfirmForm?.rsvps?.length > 0 ? (
                  <>
                    <p className="leading-relaxed">
                      This form contains <strong className="text-foreground">{deleteConfirmForm.rsvps.length} responses</strong>. 
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
              onClick={() => setDeleteConfirmForm(null)}
              disabled={deleteMutation.isPending || isExportingBeforeDelete}
            >
              Cancel
            </Button>
            {deleteConfirmForm?.rsvps?.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="destructive"
                  className="rounded-full w-full sm:w-auto bg-red-600 hover:bg-red-700 font-medium"
                  onClick={() => deleteMutation.mutate(deleteConfirmForm.id)}
                  disabled={deleteMutation.isPending || isExportingBeforeDelete}
                >
                  {deleteMutation.isPending ? (
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
                    await handleExportDataForForm(deleteConfirmForm.id, deleteConfirmForm.title);
                    deleteMutation.mutate(deleteConfirmForm.id);
                  }}
                  disabled={deleteMutation.isPending || isExportingBeforeDelete}
                >
                  {isExportingBeforeDelete ? (
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
                onClick={() => deleteMutation.mutate(deleteConfirmForm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
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
    </div>
  );
}
