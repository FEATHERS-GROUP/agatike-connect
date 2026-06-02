import { createFileRoute, useParams } from "@tanstack/react-router";
import { Search, Download, User, FileDown, Eye, Mail, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventAttendees, addEventAttendees } from "@/api/attendees";
import { sendAttendeeEmail } from "@/api/email";
import { getWorkspaceForms, getFormDetails } from "@/api/rsvps";
import { getAllBadgeProjects } from "@/api/badges";
import { getOrganizerProfile } from "@/api/organizers";
import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const { data: attendees = [], isLoading } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
  });

  const { data: forms = [], enabled: isFormsEnabled } = useQuery({
    queryKey: ["custom-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: organizer } = useQuery({
    queryKey: ["organizer-profile"],
    queryFn: () => getOrganizerProfile(),
  });

  const { data: workspaceBadges = [] } = useQuery({
    queryKey: ["badge-projects", activeWorkspace?.id],
    queryFn: () => getAllBadgeProjects({ data: { workspace_id: activeWorkspace?.id } } as any),
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
        const ticket_type =
          answers["Ticket Type / Registration Type"] ||
          answers["Ticket Type"] ||
          answers["Registration Type"] ||
          "Form Registration";

        // Generate a random 8-character alphanumeric string for the QR code
        const qrcode_number = Math.random().toString(36).substring(2, 10).toUpperCase();

        return {
          event_id: eventId,
          names,
          email,
          phone,
          ticket_type,
          quanity: "1",
          qrcode_number,
          payment_method: "None",
          status: "registered",
          type: "attendee", // To differentiate from customer
          ticket_id: null,
          user_id: null,
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
                  Select a Custom Form to import its responses as attendees. Answers will be mapped
                  into custom fields.
                </p>
                <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
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

        {selectedAttendees.length > 0 && (
          <div className="ml-auto flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <span className="text-sm font-medium text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
              {selectedAttendees.length} selected
            </span>
            <BulkEmailModal
              selectedAttendees={selectedAttendees}
              attendees={attendees}
              activeWorkspace={activeWorkspace}
              workspaceBadges={workspaceBadges}
              eventId={eventId}
              organizer={organizer}
              onClearSelection={() => setSelectedAttendees([])}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-muted-foreground/30 text-primary cursor-pointer"
                  checked={
                    filteredAttendees.length > 0 &&
                    selectedAttendees.length === filteredAttendees.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAttendees(filteredAttendees.map((a: any) => a.id));
                    } else {
                      setSelectedAttendees([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-4 font-medium">Attendee</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Ticket / Status</th>
              <th className="px-6 py-4 font-medium">Registration Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Loading attendees...
                </td>
              </tr>
            ) : filteredAttendees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No attendees found.
                </td>
              </tr>
            ) : (
              filteredAttendees.map((a: any) => (
                <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-muted-foreground/30 text-primary cursor-pointer"
                      checked={selectedAttendees.includes(a.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttendees((prev) => [...prev, a.id]);
                        } else {
                          setSelectedAttendees((prev) => prev.filter((id) => id !== a.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {a.names || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {a.email || a.phone || "No contact info"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium capitalize">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs ${a.type === "customer" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}
                    >
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
                    <AttendeeDetailsModal
                      attendee={a}
                      activeWorkspace={activeWorkspace}
                      workspaceBadges={workspaceBadges}
                      eventId={eventId}
                      organizer={organizer}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendeeDetailsModal({
  attendee,
  activeWorkspace,
  workspaceBadges,
  eventId,
  organizer,
}: {
  attendee: any;
  activeWorkspace: any;
  workspaceBadges: any[];
  eventId: string;
  organizer: any;
}) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("email");
  const eventObj = attendee?.events || {};
  const eventName = eventObj.title || "[Event Name]";
  const firstStop = eventObj.tour_stops?.[0] || {};
  const eventDate = firstStop.date || "[Event Date]";
  const eventTime = firstStop.time || "[Event Time]";
  const eventVenue = firstStop.venue || firstStop.city || "[Venue Name]";
  const orgName = activeWorkspace?.name || "The Organizer";
  const contactEmail = organizer?.email || "[Contact Email]";
  const contactPhone = organizer?.phone || "[Phone Number]";

  const defaultTemplate = `
<p>Dear [First Name],</p>
<br/>
<p>Thank you for registering for ${eventName}. We are pleased to confirm your registration and look forward to welcoming you.</p>
<br/>
<h3>Event Details</h3>
<ul>
  <li><strong>Event:</strong> ${eventName}</li>
  <li><strong>Date:</strong> ${eventDate}</li>
  <li><strong>Time:</strong> ${eventTime}</li>
  <li><strong>Venue:</strong> ${eventVenue}</li>
</ul>
<br/>
<h3>Your Registration Information</h3>
[Registration Details]
<br/>
<h3>Important Information</h3>
<ul>
  <li>Please arrive at least [X] minutes before the event start time.</li>
  <li>Bring a valid photo ID (if required).</li>
  <li>Present your Registration ID, Ticket Number, or QR Code at the registration desk for entry.</li>
  <li>If you can no longer attend, please notify us at ${contactEmail}.</li>
</ul>
<br/>
<p>If you have any questions, please contact us at ${contactEmail} or ${contactPhone}.</p>
<p>We look forward to seeing you at the event.</p>
<br/>
<p>Kind regards,</p>
<p>${organizer?.name || activeWorkspace?.name || "Organizer"}<br/>${orgName}<br/>${contactEmail}<br/>${contactPhone}</p>
  `.trim();

  const [subject, setSubject] = useState(`Registration Confirmed – ${eventName}`);
  const [message, setMessage] = useState(defaultTemplate);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    workspaceBadges?.find((b: any) => b.event_id === eventId)?.id || workspaceBadges?.[0]?.id || "",
  );

  const origin = window.location.origin.includes("localhost")
    ? "https://agatike.rw"
    : window.location.origin;
  const badgeLink =
    attendee.qrcode_number && selectedBadgeId
      ? `${origin}/a/${attendee.qrcode_number}?badgeId=${selectedBadgeId}`
      : "";

  const sendMutation = useMutation({
    mutationFn: async () => {
      let finalMessage = message;
      if (contactMethod === "email") {
        const isCustomer = attendee.type !== "rsvp";
        const registrationInfo = isCustomer
          ? `
            <p>Please keep the following details available, as they will be required to access the venue:</p>
            <ul>
              <li><strong>Registration ID:</strong> ${attendee.id?.substring(0, 8).toUpperCase()}</li>
              <li><strong>Ticket Number:</strong> ${attendee.qrcode_number || "N/A"}</li>
              <li><strong>Registered Name:</strong> ${attendee.names}</li>
              <li><strong>Registered Email:</strong> ${attendee.email}</li>
            </ul>
            <p><a href="${badgeLink}" target="_blank"><strong>Click here to view your digital ticket</strong></a></p>
          `
          : `
            <p>Here is your digital badge information. You will use this badge to seamlessly access the event.</p>
            <p><a href="${badgeLink}" target="_blank"><strong>Click here to view and download your digital badge</strong></a></p>
          `;

        finalMessage = finalMessage
          .replace(/&#91;/g, "[")
          .replace(/&#93;/g, "]")
          .replace(/\{\{\s*(?:first\s*)?name\s*\}\}/gi, attendee.names?.split(" ")[0] || "Attendee")
          .replace(
            /\[[^\]]*(?:first\s*)?name[^\]]*\]/gi,
            attendee.names?.split(" ")[0] || "Attendee",
          )
          .replace(
            /\{\{\s*registration[_\s]*(?:details|information|info)\s*\}\}/gi,
            registrationInfo.trim(),
          )
          .replace(
            /\[[^\]]*registration[^\]]*(?:details?|information|info)[^\]]*\]/gi,
            registrationInfo.trim(),
          )
          .replace(/\{\{\s*contact[_\s]*email\s*\}\}/gi, contactEmail)
          .replace(/\[[^\]]*contact[^\]]*email[^\]]*\]/gi, contactEmail)
          .replace(/\{\{\s*phone[_\s]*number\s*\}\}/gi, contactPhone)
          .replace(/\[[^\]]*phone[^\]]*number[^\]]*\]/gi, contactPhone);

        return sendAttendeeEmail({
          data: {
            to: attendee.email,
            subject,
            message: finalMessage,
            eventName: attendee.events?.title,
            organizerName: activeWorkspace?.name,
            organizerLogo: activeWorkspace?.logo_url,
            organizerSocials: organizer?.socials,
            badgeLink: selectedBadgeId ? badgeLink : "",
            appUrl: window.location.origin,
          },
        } as any);
      }
      // SMS API would go here, mock for now
      return new Promise((r) => setTimeout(r, 1000));
    },
    onSuccess: () => {
      toast.success(`${contactMethod.toUpperCase()} sent successfully!`);
      setIsContactOpen(false);
      setMessage("");
      setSubject("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  const handleSend = () => {
    sendMutation.mutate();
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
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
                <p className="font-medium capitalize">{attendee.type || "Attendee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Ticket Type</p>
                <p className="font-medium">{attendee.ticket_type || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="font-medium capitalize">{attendee.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Quantity</p>
                <p className="font-medium">{attendee.quanity || "1"}</p>
              </div>
            </div>

            {attendee.custom_fields && Object.keys(attendee.custom_fields).length > 0 && (
              <div className="mt-6 border-t border-border/60 pt-4">
                <h4 className="text-sm font-semibold mb-3">Custom Responses</h4>
                <div className="space-y-3">
                  {Object.entries(attendee.custom_fields).map(
                    ([question, answer]: [string, any]) => (
                      <div key={question} className="bg-secondary/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">{question}</p>
                        <p className="text-sm">
                          {Array.isArray(answer) ? answer.join(", ") : String(answer)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {workspaceBadges && workspaceBadges.length > 0 && (
              <div className="mt-6 border-t border-border/60 pt-4">
                <h4 className="text-sm font-semibold mb-3">Badge Design</h4>
                <Select value={selectedBadgeId} onValueChange={(val) => setSelectedBadgeId(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a badge design" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaceBadges.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.logo_text || b.theme || "Untitled Design"}{" "}
                        {b.event_id === eventId ? "(Event Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  This badge design will be used when viewing or emailing the badge.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            {selectedBadgeId && attendee.qrcode_number && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.open(badgeLink, "_blank")}
              >
                <Eye className="w-4 h-4 mr-2" /> View Badge
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!attendee.phone}
              onClick={() => {
                setContactMethod("sms");
                setIsContactOpen(true);
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> SMS
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!attendee.email}
              onClick={() => {
                setContactMethod("email");
                setIsContactOpen(true);
              }}
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className={contactMethod === "email" ? "max-w-3xl" : ""}>
          <DialogHeader>
            <DialogTitle>Send {contactMethod.toUpperCase()}</DialogTitle>
            <DialogDescription>
              To: {contactMethod === "email" ? attendee.email : attendee.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {contactMethod === "email" && (
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}
            {contactMethod === "email" ? (
              <div className="bg-background rounded-md border border-input">
                <ReactQuill
                  theme="snow"
                  value={message}
                  onChange={setMessage}
                  className="h-[200px] mb-12"
                />
              </div>
            ) : (
              <Textarea
                placeholder={`Write your ${contactMethod} message here... (e.g., event updates, venue instructions)`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px]"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}>
              {sendMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BulkEmailModal({
  selectedAttendees,
  attendees,
  activeWorkspace,
  workspaceBadges,
  eventId,
  organizer,
  onClearSelection,
}: {
  selectedAttendees: string[];
  attendees: any[];
  activeWorkspace: any;
  workspaceBadges: any[];
  eventId: string;
  organizer: any;
  onClearSelection: () => void;
}) {
  const eventObj = attendees?.[0]?.events || {};
  const eventName = eventObj.title || "[Event Name]";
  const firstStop = eventObj.tour_stops?.[0] || {};
  const eventDate = firstStop.date || "[Event Date]";
  const eventTime = firstStop.time || "[Event Time]";
  const eventVenue = firstStop.venue || firstStop.city || "[Venue Name]";
  const orgName = activeWorkspace?.name || "The Organizer";
  const contactEmail = organizer?.email || "[Contact Email]";
  const contactPhone = organizer?.phone || "[Phone Number]";

  const defaultTemplate = `
<p>Dear [First Name],</p>
<br/>
<p>Thank you for registering for ${eventName}. We are pleased to confirm your registration and look forward to welcoming you.</p>
<br/>
<h3>Event Details</h3>
<ul>
  <li><strong>Event:</strong> ${eventName}</li>
  <li><strong>Date:</strong> ${eventDate}</li>
  <li><strong>Time:</strong> ${eventTime}</li>
  <li><strong>Venue:</strong> ${eventVenue}</li>
</ul>
<br/>
<h3>Your Registration Information</h3>
[Registration Details]
<br/>
<h3>Important Information</h3>
<ul>
  <li>Please arrive at least [X] minutes before the event start time.</li>
  <li>Bring a valid photo ID (if required).</li>
  <li>Present your Registration ID, Ticket Number, or QR Code at the registration desk for entry.</li>
  <li>If you can no longer attend, please notify us at ${contactEmail}.</li>
</ul>
<br/>
<p>If you have any questions, please contact us at ${contactEmail} or ${contactPhone}.</p>
<p>We look forward to seeing you at the event.</p>
<br/>
<p>Kind regards,</p>
<p>${organizer?.name || activeWorkspace?.name || "Organizer"}<br/>${orgName}<br/>${contactEmail}<br/>${contactPhone}</p>
  `.trim();

  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState(`Registration Confirmed – ${eventName}`);
  const [message, setMessage] = useState(defaultTemplate);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    workspaceBadges?.find((b: any) => b.event_id === eventId)?.id || workspaceBadges?.[0]?.id || "",
  );

  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleSendBulk = async () => {
    setIsSending(true);
    setProgress({ current: 0, total: selectedAttendees.length });

    for (let i = 0; i < selectedAttendees.length; i++) {
      const attendee = attendees.find((a) => a.id === selectedAttendees[i]);
      if (!attendee || !attendee.email) {
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        continue;
      }

      const origin = window.location.origin.includes("localhost")
        ? "https://agatike.rw"
        : window.location.origin;
      const badgeLink =
        attendee.qrcode_number && selectedBadgeId
          ? `${origin}/a/${attendee.qrcode_number}?badgeId=${selectedBadgeId}`
          : "";

      const isCustomer = attendee.type !== "rsvp";
      const registrationInfo = isCustomer
        ? `
          <p>Please keep the following details available, as they will be required to access the venue:</p>
          <ul>
            <li><strong>Registration ID:</strong> ${attendee.id?.substring(0, 8).toUpperCase()}</li>
            <li><strong>Ticket Number:</strong> ${attendee.qrcode_number || "N/A"}</li>
            <li><strong>Registered Name:</strong> ${attendee.names}</li>
            <li><strong>Registered Email:</strong> ${attendee.email}</li>
          </ul>
          <p><a href="${badgeLink}" target="_blank"><strong>Click here to view your digital ticket</strong></a></p>
        `
        : `
          <p>Here is your digital badge information. You will use this badge to seamlessly access the event.</p>
          <p><a href="${badgeLink}" target="_blank"><strong>Click here to view and download your digital badge</strong></a></p>
        `;

      const finalMessage = message
        .replace(/&#91;/g, "[")
        .replace(/&#93;/g, "]")
        .replace(/\{\{\s*(?:first\s*)?name\s*\}\}/gi, attendee.names?.split(" ")[0] || "Attendee")
        .replace(/\[[^\]]*(?:first\s*)?name[^\]]*\]/gi, attendee.names?.split(" ")[0] || "Attendee")
        .replace(
          /\{\{\s*registration[_\s]*(?:details|information|info)\s*\}\}/gi,
          registrationInfo.trim(),
        )
        .replace(
          /\[[^\]]*registration[^\]]*(?:details?|information|info)[^\]]*\]/gi,
          registrationInfo.trim(),
        )
        .replace(/\{\{\s*contact[_\s]*email\s*\}\}/gi, contactEmail)
        .replace(/\[[^\]]*contact[^\]]*email[^\]]*\]/gi, contactEmail)
        .replace(/\{\{\s*phone[_\s]*number\s*\}\}/gi, contactPhone)
        .replace(/\[[^\]]*phone[^\]]*number[^\]]*\]/gi, contactPhone);

      try {
        await sendAttendeeEmail({
          data: {
            to: attendee.email,
            subject,
            message: finalMessage,
            eventName: attendee.events?.title,
            organizerName: activeWorkspace?.name,
            organizerLogo: activeWorkspace?.logo_url,
            organizerSocials: organizer?.socials,
            badgeLink,
            appUrl: window.location.origin,
          },
        } as any);
      } catch (err) {
        console.error("Failed to send to", attendee.email, err);
      }
      setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
    }

    setIsSending(false);
    toast.success(`Successfully sent emails to ${selectedAttendees.length} attendees.`);
    setIsOpen(false);
    onClearSelection();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSending && setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-sm">
          <Mail className="mr-2 h-4 w-4" /> Send Bulk Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Email Attendees</DialogTitle>
          <DialogDescription>
            You are about to email {selectedAttendees.length} attendees.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Body</label>
            <div className="bg-background rounded-md border border-input">
              <ReactQuill
                theme="snow"
                value={message}
                onChange={setMessage}
                readOnly={isSending}
                className="h-[250px] mb-12"
              />
            </div>
          </div>

          {workspaceBadges && workspaceBadges.length > 0 && (
            <div className="mt-4 border-t border-border/60 pt-4">
              <label className="text-sm font-medium mb-2 block">Attach Badge Design</label>
              <Select
                value={selectedBadgeId}
                onValueChange={setSelectedBadgeId}
                disabled={isSending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a badge design" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceBadges.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.logo_text || b.theme || "Untitled Design"}{" "}
                      {b.event_id === eventId ? "(Event Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isSending && (
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg text-center animate-in fade-in">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">
                Sending emails... {progress.current} of {progress.total}
              </p>
              <div className="w-full bg-secondary mt-2 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendBulk} disabled={!message.trim() || isSending}>
            {isSending ? "Sending..." : "Send to All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
