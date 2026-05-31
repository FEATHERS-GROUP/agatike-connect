import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Search, Settings, Ticket, User, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFormDetails, updateCustomForm } from "@/api/rsvps";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/$formId")({
  component: FormRsvpsPage,
});

function FormRsvpsPage() {
  const { activeWorkspace } = useWorkspace();
  const { formId, workspaceSlug } = Route.useParams();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsActive, setSettingsActive] = useState(false);

  const openSettings = () => {
    setSettingsTitle(form?.title || "");
    setSettingsDesc(form?.description || "");
    setSettingsActive(form?.is_active ?? true);
    setIsSettingsOpen(true);
  };

  const { data: form, isLoading } = useQuery({
    queryKey: ["form-details", formId],
    queryFn: () => getFormDetails({ data: { id: formId } } as any),
    enabled: !!formId,
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => updateCustomForm({ data: values } as any),
    onSuccess: () => {
      toast.success("Form settings updated");
      queryClient.invalidateQueries({ queryKey: ["form-details", formId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-forms"] });
      setIsSettingsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update form");
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-primary animate-pulse">
        Loading form data...
      </div>
    );
  }

  if (!form) {
    return <div className="p-12 text-center text-muted-foreground">Form not found.</div>;
  }

  const rsvps = form.rsvps || [];
  const dynamicFields = form.form_fields || [];

  const filteredRsvps = rsvps.filter(
    (r: any) =>
      !search ||
      r.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSaveSettings = () => {
    updateMutation.mutate({
      id: formId,
      title: settingsTitle,
      description: settingsDesc,
      is_active: settingsActive,
    });
  };

  const handleExportData = () => {
    if (!filteredRsvps.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["First Name", "Last Name", "Email Address", "Status", "Date Registered"];
    dynamicFields.forEach((f: any) => headers.push(f.label));

    const csvRows = [headers.join(",")];

    filteredRsvps.forEach((rsvp: any) => {
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
    a.download = `${form.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_rsvps.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Export successful");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/$workspaceSlug/rsvps" params={{ workspaceSlug }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-secondary/50 hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {form.title}
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${form.is_active ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"}`}
              >
                {form.is_active ? "Active" : "Closed"}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage RSVPs and responses for this form.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
            onClick={openSettings}
          >
            <Settings className="mr-2 h-4 w-4" /> Form Settings
          </Button>
          <Button
            className="rounded-full shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
            onClick={handleExportData}
          >
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </header>

      <div className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium md:sticky md:left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                  Attendee
                </th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Registered</th>
                {dynamicFields.map((field: any) => (
                  <th key={field.id} className="px-6 py-4 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRsvps.length === 0 ? (
                <tr>
                  <td
                    colSpan={4 + dynamicFields.length}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No RSVPs found.
                  </td>
                </tr>
              ) : (
                filteredRsvps.map((rsvp: any) => (
                  <tr key={rsvp.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 md:sticky md:left-0 bg-card group-hover:bg-secondary/20 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm shrink-0">
                          <span className="font-semibold text-xs">
                            {(rsvp.first_name?.[0] || "?") + (rsvp.last_name?.[0] || "")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {rsvp.first_name} {rsvp.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{rsvp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rsvp.status === "Attended"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        }`}
                      >
                        {rsvp.status || "Registered"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(rsvp.created_at).toLocaleString()}
                    </td>

                    {/* Render dynamic answers */}
                    {dynamicFields.map((field: any) => {
                      const answerObj = rsvp.rsvp_answers?.find(
                        (a: any) => a.field_id === field.id,
                      );
                      const val = answerObj?.answer_value;
                      return (
                        <td
                          key={field.id}
                          className="px-6 py-4 text-muted-foreground max-w-[200px] truncate"
                          title={val}
                        >
                          {val || "-"}
                        </td>
                      );
                    })}

                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem>Mark as Attended</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            Delete RSVP
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
            <DialogDescription>Update the core details of your form.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Form Title</Label>
              <Input
                className="rounded-xl"
                value={settingsTitle}
                onChange={(e) => setSettingsTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={settingsDesc}
                onChange={(e) => setSettingsDesc(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm mt-2">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Accept Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Turn this off to close the form to new RSVPs.
                </p>
              </div>
              <Switch checked={settingsActive} onCheckedChange={setSettingsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setIsSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full shadow-sm"
              onClick={handleSaveSettings}
              disabled={updateMutation.isPending}
              style={{ background: "var(--gradient-primary)", color: "white" }}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
