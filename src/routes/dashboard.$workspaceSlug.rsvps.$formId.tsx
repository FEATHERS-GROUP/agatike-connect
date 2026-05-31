import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Search, Settings, Ticket, User, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFormDetails, updateCustomForm, updateRsvpStatus } from "@/api/rsvps";
import { getWorkspaceEvents } from "@/api/events";
import { addEventStaff } from "@/api/staff";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/$formId")({
  component: FormRsvpsPage,
});

function FormRsvpsPage() {
  const { activeWorkspace } = useWorkspace();
  const { formId, workspaceSlug } = Route.useParams();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [importRsvp, setImportRsvp] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedRsvps, setSelectedRsvps] = useState<string[]>([]);
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsActive, setSettingsActive] = useState(false);

  const { data: form, isLoading } = useQuery({
    queryKey: ["custom-form", formId],
    queryFn: () => getFormDetails({ data: { id: formId } } as any),
    enabled: !!formId,
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => updateCustomForm({ data: { id: formId, ...values } } as any),
    onSuccess: () => {
      toast.success("Form settings updated");
      queryClient.invalidateQueries({ queryKey: ["custom-form", formId] });
      setIsSettingsOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Update failed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) return <div className="p-12 text-center text-muted-foreground">Form not found.</div>;

  const rsvps = form.rsvps || [];
  const dynamicFields = form.form_fields || [];

  const filteredRsvps = rsvps.filter(
    (r: any) =>
      r.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRsvps(filteredRsvps.map((r: any) => r.id));
    } else {
      setSelectedRsvps([]);
    }
  };

  const handleSelectRsvp = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRsvps([...selectedRsvps, id]);
    } else {
      setSelectedRsvps(selectedRsvps.filter((rId) => rId !== id));
    }
  };

  const openSettings = () => {
    setSettingsTitle(form.title);
    setSettingsDesc(form.description || "");
    setSettingsActive(form.is_active);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    updateMutation.mutate({
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
          {selectedRsvps.length > 0 && (
            <Button
              className="rounded-full shadow-sm"
              style={{ background: "var(--gradient-primary)", color: "white" }}
              onClick={() => setShowBulkImport(true)}
            >
              Bulk Import Selected ({selectedRsvps.length})
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
            onClick={openSettings}
          >
            <Settings className="mr-2 h-4 w-4" /> Form Settings
          </Button>
          <Button
            className="rounded-full shadow-sm"
            variant="outline"
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
                <th className="px-6 py-4 font-medium md:sticky md:left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] w-12">
                  <Checkbox 
                    checked={selectedRsvps.length === filteredRsvps.length && filteredRsvps.length > 0} 
                    onCheckedChange={(c) => handleSelectAll(c as boolean)} 
                  />
                </th>
                <th className="px-6 py-4 font-medium">Attendee</th>
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
                    colSpan={5 + dynamicFields.length}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No RSVPs found.
                  </td>
                </tr>
              ) : (
                filteredRsvps.map((rsvp: any) => {
                  const extracted = extractStaffDataFromRsvp(rsvp, dynamicFields);
                  return (
                  <tr key={rsvp.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 md:sticky md:left-0 bg-card group-hover:bg-secondary/20 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                      <Checkbox 
                        checked={selectedRsvps.includes(rsvp.id)} 
                        onCheckedChange={(c) => handleSelectRsvp(rsvp.id, c as boolean)} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {extracted.profileImage ? (
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-border shadow-sm shrink-0">
                            <img src={extracted.profileImage} alt={extracted.firstName} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm shrink-0">
                            <span className="font-semibold text-xs">
                              {(extracted.firstName?.[0] || "?") + (extracted.lastName?.[0] || "")}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {extracted.firstName} {extracted.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{extracted.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rsvp.status === "Attended"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : rsvp.status === "Imported"
                            ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
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
                      
                      const isImage = val && (field.field_type === "file" || val.includes("firebasestorage") || val.match(/\.(jpeg|jpg|gif|png|webp)$/i));

                      return (
                        <td
                          key={field.id}
                          className="px-6 py-4 text-muted-foreground max-w-[200px] truncate"
                          title={!isImage ? val : "Image Upload"}
                        >
                          {isImage ? (
                            <a href={val} target="_blank" rel="noreferrer" className="block">
                              <img src={val} alt="Upload" className="h-10 w-10 object-cover rounded-md border border-border/50 hover:scale-150 transition-transform shadow-sm" />
                            </a>
                          ) : (
                            val || "-"
                          )}
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
                          <DropdownMenuItem onClick={() => setImportRsvp(rsvp)}>
                            Import as Event Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            Delete RSVP
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  );
                })
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

      {importRsvp && (
        <ImportStaffDialog 
          rsvp={importRsvp} 
          workspaceId={activeWorkspace?.id} 
          defaultEventId={form.event_id}
          formFields={dynamicFields}
          onClose={() => setImportRsvp(null)} 
        />
      )}

      {showBulkImport && selectedRsvps.length > 0 && (
        <BulkImportStaffDialog 
          rsvps={rsvps.filter((r: any) => selectedRsvps.includes(r.id))} 
          workspaceId={activeWorkspace?.id || ""} 
          defaultEventId={form.event_id}
          formFields={dynamicFields}
          onClose={() => {
            setShowBulkImport(false);
            setSelectedRsvps([]);
          }} 
        />
      )}
    </div>
  );
}

const extractStaffDataFromRsvp = (rsvp: any, formFields: any[] = []) => {
  let firstName = rsvp.first_name || "";
  let lastName = rsvp.last_name || "";
  let email = rsvp.email || "";
  let phone = "";
  let profileImage = "";

  if (rsvp.rsvp_answers) {
    for (const answer of rsvp.rsvp_answers) {
      const field = formFields.find((f: any) => f.id === answer.field_id);
      const fieldLabel = (field?.label || "").toLowerCase();
      const fieldType = (field?.field_type || "").toLowerCase();
      const val = answer.answer_value || "";

      // Try to find phone
      if (!phone && (val.match(/^[0-9+() -]{7,20}$/) || fieldLabel.includes("phone"))) {
        phone = val;
      }
      // Try to find email
      if (!email && (val.includes("@") || fieldLabel.includes("email") || fieldType === "email")) {
        email = val;
      }
      // Try to find name if missing
      if ((!firstName || !lastName) && (fieldLabel.includes("name") || fieldLabel.includes("staff member"))) {
        if (!firstName && !lastName) {
          const parts = val.split(" ");
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(" ") || "";
        }
      }
      // Try to find image
      if (!profileImage && (val.includes("firebasestorage") || fieldType === "file" || fieldLabel.includes("image") || fieldLabel.includes("photo") || fieldLabel.includes("avatar"))) {
        profileImage = val;
      }
    }
  }

  return { firstName, lastName, email, phone, profileImage };
};

function ImportStaffDialog({ rsvp, workspaceId, defaultEventId, formFields, onClose }: { rsvp: any, workspaceId?: string, defaultEventId?: string, formFields: any[], onClose: () => void }) {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState(defaultEventId || "");
  const [role, setRole] = useState("Security");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: workspaceId } } as any),
    enabled: !!workspaceId,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const extracted = extractStaffDataFromRsvp(rsvp, formFields);

      const result = await addEventStaff({
        data: {
          event_id: eventId,
          user_id: rsvp.user_id || null,
          section_id: null,
          first_name: extracted.firstName,
          last_name: extracted.lastName,
          email: extracted.email,
          phone: extracted.phone,
          profile_image: extracted.profileImage,
          role: role,
          status: "active",
          badge_qr_string: `STAFF-${randomId}`,
        }
      } as any);

      await updateRsvpStatus({ data: { id: rsvp.id, status: "Imported" } } as any);
      return result;
    },
    onSuccess: () => {
      toast.success("Staff imported successfully!");
      queryClient.invalidateQueries({ queryKey: ["custom-form"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to import staff")
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import as Event Staff</DialogTitle>
          <DialogDescription>
            Import {rsvp.first_name} {rsvp.last_name} into an event's staff directory.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!defaultEventId && (
            <div className="space-y-2">
              <Label>Select Event</Label>
              {isLoading ? (
                <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading events...</div>
              ) : (
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Assign Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Security Lead">Security Lead</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Gate Staff">Gate Staff / Check-in</SelectItem>
                <SelectItem value="Catering Staff">Catering Staff</SelectItem>
                <SelectItem value="AV Technician">AV Tech</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Medical Staff">Medical / First Aid</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full mt-2" 
            style={{ background: "var(--gradient-primary)", color: "white" }}
            disabled={!eventId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Staff & Generate Badge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BulkImportStaffDialog({ rsvps, onClose, workspaceId, defaultEventId, formFields }: { rsvps: any[], onClose: () => void, workspaceId: string, defaultEventId?: string, formFields: any[] }) {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState<string>(defaultEventId || "");
  const [role, setRole] = useState<string>("Security");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: async () => {
      // dynamic import for getEvents here or we just assume getEvents exists
      const { getEvents } = await import("@/api/events");
      return await getEvents({ data: { workspace_id: workspaceId } } as any);
    },
    enabled: !!workspaceId,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const promises = rsvps.map(async (rsvp) => {
        const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
        const extracted = extractStaffDataFromRsvp(rsvp, formFields);

        const result = await addEventStaff({
          data: {
            event_id: eventId,
            user_id: rsvp.user_id || null,
            section_id: null,
            first_name: extracted.firstName,
            last_name: extracted.lastName,
            email: extracted.email,
            phone: extracted.phone,
            profile_image: extracted.profileImage,
            role: role,
            status: "active",
            badge_qr_string: `STAFF-${randomId}`,
          }
        } as any);

        await updateRsvpStatus({ data: { id: rsvp.id, status: "Imported" } } as any);
        return result;
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`${rsvps.length} staff members imported successfully!`);
      queryClient.invalidateQueries({ queryKey: ["custom-form"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to import bulk staff")
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import as Event Staff</DialogTitle>
          <DialogDescription>
            Import {rsvps.length} attendees into an event's staff directory.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!defaultEventId && (
            <div className="space-y-2">
              <Label>Select Event</Label>
              {isLoading ? (
                <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading events...</div>
              ) : (
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Assign Default Role to All</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Security Lead">Security Lead</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Gate Staff">Gate Staff / Check-in</SelectItem>
                <SelectItem value="Catering Staff">Catering Staff</SelectItem>
                <SelectItem value="AV Technician">AV Tech</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Medical Staff">Medical / First Aid</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full mt-2" 
            style={{ background: "var(--gradient-primary)", color: "white" }}
            disabled={!eventId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {rsvps.length} Staff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
