import { createFileRoute, useParams } from "@tanstack/react-router";
import { Search, Download, User, FileDown, Eye, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventAttendees, addEventAttendees } from "@/api/attendees";
import { getWorkspaceForms, getFormDetails } from "@/api/rsvps";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/attendees")({
  component: AttendeesView,
});

function AttendeesView() {
  const { eventId, workspaceSlug } = useParams({ strict: false });
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState("");

  const { data: attendees = [], isLoading } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
  });

  const { data: forms = [], enabled: isFormsEnabled } = useQuery({
    queryKey: ["custom-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const importMutation = useMutation({
    mutationFn: async (formId: string) => {
      const formDetails = await getFormDetails({ data: { id: formId } } as any);
      const rsvps = formDetails?.rsvps || [];
      if (!rsvps.length) throw new Error("No responses found for this form.");

      const formFields = formDetails.form_fields || [];
      const fieldMap = formFields.reduce((acc: any, f: any) => ({ ...acc, [f.id]: f.label }), {});

      const objects = rsvps.map((rsvp: any) => {
        const answers: any = {};
        (rsvp.rsvp_answers || []).forEach((ans: any) => {
          const label = fieldMap[ans.field_id] || ans.field_id;
          answers[label] = ans.answer_value;
        });

        const names = answers["Names"] || answers["Name"] || rsvp.first_name || "";
        const email = answers["Email"] || answers["Email Address"] || rsvp.email || "";
        const phone = answers["Phone"] || answers["Phone Number"] || "";

        return {
          event_id: eventId,
          names,
          email,
          phone,
          status: "registered",
          type: "attendee", // To differentiate from customer
          custom_fields: answers,
        };
      });

      return addEventAttendees({ data: { objects } } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendees", eventId] });
      toast.success("Attendees imported successfully");
      setIsImportModalOpen(false);
      setSelectedFormId("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to import attendees"),
  });

  const filteredAttendees = attendees.filter((a: any) => {
    const term = searchTerm.toLowerCase();
    return (
      (a.names && a.names.toLowerCase().includes(term)) ||
      (a.email && a.email.toLowerCase().includes(term)) ||
      (a.type && a.type.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendees</h1>
          <p className="text-sm text-muted-foreground">Manage event attendees and ticket buyers.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="rounded-full shadow-sm">
                <FileDown className="mr-2 h-4 w-4" /> Import Registrations
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Attendees from Form</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Select a Custom Form to import its responses as attendees. Answers will be mapped into custom fields.
                </p>
                <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                <Button 
                  disabled={!selectedFormId || importMutation.isPending} 
                  onClick={() => importMutation.mutate(selectedFormId)}
                >
                  {importMutation.isPending ? "Importing..." : "Import Attendees"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="rounded-full shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </header>

      <div className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full bg-secondary/50 border-transparent"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Attendee</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Ticket / Status</th>
              <th className="px-6 py-4 font-medium">Registration Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading attendees...</td></tr>
            ) : filteredAttendees.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No attendees found.</td></tr>
            ) : filteredAttendees.map((a: any) => (
              <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{a.names || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.email || a.phone || "No contact info"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium capitalize">
                  <span className={`inline-flex px-2 py-1 rounded text-xs ${a.type === 'customer' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                    {a.type || "Attendee"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{a.ticket_type || "N/A"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{a.status}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {format(new Date(a.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <AttendeeDetailsModal attendee={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendeeDetailsModal({ attendee }: { attendee: any }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("email");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Implement actual sending logic here later
    toast.success(`${contactMethod.toUpperCase()} sent to ${attendee.names || 'attendee'}!`);
    setIsContactOpen(false);
    setMessage("");
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
            <DialogDescription>
              {attendee.names} ({attendee.email || attendee.phone})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium capitalize">{attendee.type || 'Attendee'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Ticket Type</p>
                <p className="font-medium">{attendee.ticket_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="font-medium capitalize">{attendee.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Quantity</p>
                <p className="font-medium">{attendee.quanity || '1'}</p>
              </div>
            </div>

            {attendee.custom_fields && Object.keys(attendee.custom_fields).length > 0 && (
              <div className="mt-6 border-t border-border/60 pt-4">
                <h4 className="text-sm font-semibold mb-3">Custom Responses</h4>
                <div className="space-y-3">
                  {Object.entries(attendee.custom_fields).map(([question, answer]: [string, any]) => (
                    <div key={question} className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{question}</p>
                      <p className="text-sm">{Array.isArray(answer) ? answer.join(", ") : String(answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={!attendee.phone}
              onClick={() => { setContactMethod("sms"); setIsContactOpen(true); }}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> SMS
            </Button>
            <Button 
              className="w-full sm:w-auto"
              disabled={!attendee.email}
              onClick={() => { setContactMethod("email"); setIsContactOpen(true); }}
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {contactMethod.toUpperCase()}</DialogTitle>
            <DialogDescription>
              To: {contactMethod === 'email' ? attendee.email : attendee.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={`Write your ${contactMethod} message here... (e.g., event updates, venue instructions)`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactOpen(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={!message.trim()}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
