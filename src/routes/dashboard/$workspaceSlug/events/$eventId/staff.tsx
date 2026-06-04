import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, UserCheck, MapPin, ShieldAlert, Loader2, QrCode, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventSections,
  getEventStaff,
  createEventSection,
  addEventStaff,
  updateEventStaff,
} from "@/api/staff";
import { getEventById } from "@/api/events";
import { createCustomForm } from "@/api/rsvps";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { getBadgeProjectByEventId } from "@/api/badges";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/staff")({
  component: StaffView,
});

function GenerateVendorFormModal({
  eventId,
  activeWorkspace,
}: {
  eventId: string;
  activeWorkspace: any;
}) {
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [collectPhone, setCollectPhone] = useState(true);
  const [collectProfileImage, setCollectProfileImage] = useState(true);
  const [collectGender, setCollectGender] = useState(false);
  const [collectDob, setCollectDob] = useState(false);
  const navigate = useNavigate();

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const generateVendorForm = useMutation({
    mutationFn: async () => {
      const fields: any[] = [
        {
          label: "Staff Member Role / Title",
          field_type: "text",
          is_required: true,
          order: 1,
        },
      ];

      let order = 2;
      if (collectPhone) {
        fields.push({
          label: "Staff Member Phone Number",
          field_type: "text",
          is_required: true,
          order: order++,
        });
      }
      if (collectProfileImage) {
        fields.push({
          label: "Profile Image",
          field_type: "file",
          is_required: false,
          order: order++,
        });
      }
      if (collectGender) {
        fields.push({
          label: "Gender",
          field_type: "select",
          is_required: false,
          order: order++,
          options: ["Male", "Female", "Other", "Prefer not to say"],
        });
      }
      if (collectDob) {
        fields.push({
          label: "Date of Birth",
          field_type: "date",
          is_required: false,
          order: order++,
        });
      }

      const formPayload = {
        title: `${vendorName} - Staff Registration`,
        description:
          "Please fill out this form for each staff member you are bringing to the event.",
        workspace_id: activeWorkspace?.id,
        event_id: eventId,
        cover_image_url: eventData?.cover || null,
        is_active: true,
        form_fields: {
          data: fields,
        },
      };
      return await createCustomForm({ data: formPayload } as any);
    },
    onSuccess: (data: any) => {
      if (data && data.id) {
        toast.success("Vendor Form Created");
        setOpen(false);
        navigate({
          to: "/dashboard/$workspaceSlug/rsvps/$formId",
          params: { workspaceSlug: activeWorkspace?.slug || "workspace", formId: data.id },
        });
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to generate form"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button style={{ background: "var(--gradient-primary)", color: "white" }}>
          <Plus className="mr-2 h-4 w-4" /> Generate Vendor Form
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Setup Vendor Form</DialogTitle>
          <DialogDescription>
            Create a custom registration link tailored for a specific vendor or contractor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Vendor / Company Name</Label>
            <Input
              placeholder="e.g. Gorilla Security"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              This will be used as the form's title.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50">
            <Label className="text-sm font-semibold">Information to Collect</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked disabled className="rounded border-gray-300" />
                First Name, Last Name, Email{" "}
                <span className="text-xs text-muted-foreground">(Required)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={collectPhone}
                  onChange={(e) => setCollectPhone(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Phone Number <span className="text-xs text-muted-foreground">(Required)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={collectProfileImage}
                  onChange={(e) => setCollectProfileImage(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Profile Image <span className="text-xs text-muted-foreground">(Recommended)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={collectGender}
                  onChange={(e) => setCollectGender(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Gender
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={collectDob}
                  onChange={(e) => setCollectDob(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Date of Birth
              </label>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            style={{ background: "var(--gradient-primary)", color: "white" }}
            onClick={() => {
              if (!vendorName) return toast.error("Vendor Name is required");
              generateVendorForm.mutate();
            }}
            disabled={generateVendorForm.isPending}
          >
            {generateVendorForm.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Form Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddStaffModal({ eventId, sections }: { eventId: string; sections: any[] }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [registrationType, setRegistrationType] = useState("account"); // "account" or "no-account"
  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "Volunteer",
    allowed_sections: [] as string[],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Mock user_id for demonstration if none provided
      const finalUserId =
        registrationType === "account"
          ? formData.user_id || "00000000-0000-0000-0000-000000000000"
          : null;
      const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      return await addEventStaff({
        data: {
          event_id: eventId,
          user_id: finalUserId,
          first_name: registrationType === "no-account" ? formData.first_name : null,
          last_name: registrationType === "no-account" ? formData.last_name : null,
          email: registrationType === "no-account" ? formData.email : null,
          phone: registrationType === "no-account" ? formData.phone : null,
          role: formData.role,
          allowed_sections: formData.allowed_sections,
          badge_qr_string: `STAFF-${randomId}`,
          status: "active",
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Staff added and badge generated!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
      setFormData({
        user_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "Volunteer",
        allowed_sections: [],
      });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add staff"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Assign a role and section. A secure Digital Badge will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Tabs value={registrationType} onValueChange={setRegistrationType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="account">Agatike Account</TabsTrigger>
              <TabsTrigger value="no-account">No Account (Link)</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>User ID / Email Search</Label>
                <Input
                  placeholder="Enter User ID (Mocking for now)"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="no-account" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organizer">Organizer</SelectItem>
                <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Security Lead">Security Lead</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Gate Staff">Gate Staff / Check-in</SelectItem>
                <SelectItem value="Box Office">Box Office / Ticketing</SelectItem>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Bar Staff">Bar Staff</SelectItem>
                <SelectItem value="Catering Staff">Catering Staff</SelectItem>
                <SelectItem value="VIP Host">VIP Host / Concierge</SelectItem>
                <SelectItem value="Stage Manager">Stage Manager</SelectItem>
                <SelectItem value="Stage Hand">Stage Hand</SelectItem>
                <SelectItem value="AV Technician">AV Tech</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Medical Staff">Medical / First Aid</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold">Allowed Sections (Access Control)</Label>
            <div className="space-y-2 border border-border/50 rounded-xl p-3 bg-secondary/10 max-h-[150px] overflow-y-auto">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={formData.allowed_sections.includes("*")}
                  onCheckedChange={(c) => {
                    if (c) setFormData({ ...formData, allowed_sections: ["*"] });
                    else setFormData({ ...formData, allowed_sections: [] });
                  }}
                />
                <span className="font-medium">All Access (Everywhere)</span>
              </label>
              {sections.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 text-sm cursor-pointer ${formData.allowed_sections.includes("*") ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Checkbox
                    disabled={formData.allowed_sections.includes("*")}
                    checked={formData.allowed_sections.includes(s.id)}
                    onCheckedChange={(c) => {
                      if (c) {
                        setFormData({
                          ...formData,
                          allowed_sections: [...formData.allowed_sections, s.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowed_sections: formData.allowed_sections.filter((id) => id !== s.id),
                        });
                      }
                    }}
                  />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Selecting specific sections restricts their badge scan to only those areas.
            </p>
          </div>
          <Button
            className="w-full mt-4"
            style={{ background: "var(--gradient-primary)", color: "white" }}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Staff Badge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditAccessModal({ staff, sections }: { staff: any; sections: any[] }) {
  const [open, setOpen] = useState(false);
  const [allowedSections, setAllowedSections] = useState<string[]>(staff.allowed_sections || []);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await updateEventStaff({
        data: { id: staff.id, allowed_sections: allowedSections },
      } as any);
    },
    onSuccess: () => {
      toast.success("Access updated successfully");
      queryClient.invalidateQueries({ queryKey: ["event-staff"] });
      setOpen(false);
    },
    onError: () => toast.error("Failed to update access"),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) setAllowedSections(staff.allowed_sections || []);
      }}
    >
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded ml-2 transition-colors uppercase tracking-wider"
        >
          Edit
        </button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Staff Access</DialogTitle>
          <DialogDescription>
            Update the sections {staff.first_name} {staff.last_name} is allowed to access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2 border border-border/50 rounded-xl p-3 bg-secondary/10 max-h-[200px] overflow-y-auto">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={allowedSections.includes("*")}
                onCheckedChange={(c) => {
                  if (c) setAllowedSections(["*"]);
                  else setAllowedSections([]);
                }}
              />
              <span className="font-medium">All Access (Everywhere)</span>
            </label>
            {sections.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-2 text-sm cursor-pointer ${allowedSections.includes("*") ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Checkbox
                  disabled={allowedSections.includes("*")}
                  checked={allowedSections.includes(s.id)}
                  onCheckedChange={(c) => {
                    if (c) setAllowedSections([...allowedSections, s.id]);
                    else setAllowedSections(allowedSections.filter((id) => id !== s.id));
                  }}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <Button
            className="w-full mt-4"
            style={{ background: "var(--gradient-primary)", color: "white" }}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Access Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StaffView() {
  const { eventId, workspaceSlug } = Route.useParams();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: badgeProject } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  // We are using fallback mock data if the DB tables aren't perfectly seeded yet
  const { data: sections = [] } = useQuery({
    queryKey: ["event-sections", eventId],
    queryFn: async () => {
      try {
        return await getEventSections({ data: { event_id: eventId } } as any);
      } catch {
        return [
          { id: "1", name: "VIP Lounge" },
          { id: "2", name: "Main Bar" },
        ];
      }
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["event-staff", eventId],
    queryFn: async () => {
      const res = await getEventStaff({ data: { event_id: eventId } } as any);
      return res || [];
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team & Staff</h1>
          <p className="text-sm text-muted-foreground">
            Manage roles, assign sections, and generate digital badges.
          </p>
        </div>
        <div className="flex gap-3">
          <AddStaffModal eventId={eventId} sections={sections} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
            <h3 className="text-2xl font-bold">{staff.length}</h3>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Sections</p>
            <h3 className="text-2xl font-bold">{sections.length}</h3>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Security Scans</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </div>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Team Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Assigned Section</th>
                  <th className="px-6 py-4 font-medium">Badge ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {staff.map((s: any) => {
                  const assignedSections =
                    s.allowed_sections && s.allowed_sections.length > 0
                      ? s.allowed_sections
                          .map((id: string) => sections.find((sec: any) => sec.id === id))
                          .filter(Boolean)
                      : [];
                  const isUnregistered = !s.user_id && (s.first_name || s.last_name);
                  const displayName = isUnregistered
                    ? `${s.first_name || ""} ${s.last_name || ""}`.trim()
                    : `User ${s.user_id?.substring(0, 6) || "Unknown"}`;
                  const displayInitials = isUnregistered ? (
                    `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase()
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  );

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStaff({ ...s, sectionObjs: assignedSections })}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.profile_image ? (
                            <img
                              src={s.profile_image}
                              alt={displayName}
                              className="h-9 w-9 rounded-full object-cover border border-border shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors font-bold text-xs shrink-0">
                              {displayInitials}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{displayName}</p>
                            {isUnregistered && s.email && (
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{s.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {s.allowed_sections?.includes("*") ? (
                            <span className="text-muted-foreground text-xs font-medium bg-secondary/50 px-2 py-0.5 rounded-md">
                              All Access
                            </span>
                          ) : assignedSections.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {assignedSections.map((sec: any) => (
                                <span
                                  key={sec.id}
                                  className="inline-flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap"
                                >
                                  <MapPin className="h-3 w-3" /> {sec.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-red-500 text-[10px] font-medium uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-md">
                              No Access
                            </span>
                          )}
                          <EditAccessModal staff={s} sections={sections} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md w-max">
                          <QrCode className="h-3 w-3" /> {s.badge_qr_string}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No staff members assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-semibold mb-2">Vendor & Contractor Forms</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Share a dedicated form with external companies (e.g., Security, Caterers) to let them
              list their staff. Once submitted, you can import their roster directly into your staff
              directory.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard/$workspaceSlug/rsvps" params={{ workspaceSlug }}>
                <Button variant="outline">View All Custom Forms</Button>
              </Link>
              <GenerateVendorFormModal eventId={eventId} activeWorkspace={activeWorkspace} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Digital Badge Preview</SheetTitle>
            <SheetDescription>
              This is how the badge looks on the staff member's phone.
            </SheetDescription>
          </SheetHeader>

          {selectedStaff && (
            <div className="flex flex-col items-center mt-4">
              {badgeProject ? (
                <div className="w-[340px] relative origin-top mx-auto">
                  <BadgePreview
                    config={{
                      theme: badgeProject.theme,
                      fontFamily: badgeProject.font_family,
                      gradientClass: badgeProject.gradient_class,
                      bgImageUrl: badgeProject.bg_image_url,
                      logoText: badgeProject.logo_text,
                      showUserImage: badgeProject.show_user_image,
                      accentColor: badgeProject.accent_color,
                      ...(badgeProject.front_design || {}),
                    }}
                    isDesigner={false}
                    mockUser={{
                      name:
                        !selectedStaff.user_id &&
                        (selectedStaff.first_name || selectedStaff.last_name)
                          ? `${selectedStaff.first_name || ""} ${selectedStaff.last_name || ""}`.trim()
                          : `User ${selectedStaff.user_id?.substring(0, 6) || "Unknown"}`,
                      role: selectedStaff.role,
                      qrString: selectedStaff.badge_qr_string,
                      sectionName: selectedStaff.allowed_sections?.includes("*")
                        ? "ALL ACCESS"
                        : selectedStaff.sectionObjs && selectedStaff.sectionObjs.length > 0
                          ? selectedStaff.sectionObjs.map((s: any) => s.name).join(", ")
                          : "NO ACCESS",
                      initials:
                        `${selectedStaff.first_name?.[0] || ""}${selectedStaff.last_name?.[0] || ""}`.toUpperCase(),
                      profileImage: selectedStaff.profile_image,
                    }}
                    sponsors={badgeProject.sponsors_json || []}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl w-full flex flex-col items-center">
                  <Palette className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p>No Badge Design created for this event yet.</p>
                  <Link
                    to="/dashboard/$workspaceSlug/badge-designer/$projectId"
                    params={{ workspaceSlug, projectId: "new" }}
                    search={{ eventId }}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Badge Design
                  </Link>
                </div>
              )}

              <div className="mt-8 flex gap-3 w-full">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => toast.success("Copied secure link!")}
                >
                  Copy Link
                </Button>
                <Button className="flex-1" style={{ background: "var(--gradient-primary)" }}>
                  Send via Email
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
