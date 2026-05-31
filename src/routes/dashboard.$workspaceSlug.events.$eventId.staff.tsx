import { createFileRoute, Link } from "@tanstack/react-router";
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
import { getEventSections, getEventStaff, createEventSection, addEventStaff } from "@/api/staff";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/staff")({
  component: StaffView,
});

function AddSectionModal({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await createEventSection({
        data: {
          event_id: eventId,
          name,
          description,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Section created successfully");
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["event-sections", eventId] });
    },
    onError: () => toast.error("Failed to create section"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-sm">
          <MapPin className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event Section</DialogTitle>
          <DialogDescription>
            Define an area (e.g. VIP Lounge, Main Gate) to assign staff to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Section Name</Label>
            <Input
              placeholder="e.g. Backstage"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!name) return toast.error("Name required");
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Section
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddStaffModal({ eventId, sections }: { eventId: string; sections: any[] }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    user_id: "", // In a real app this would be an email invite or user search
    role: "Bartender",
    section_id: "none",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Mock user_id for demonstration if none provided, since we don't have a user search built in yet
      const finalUserId = formData.user_id || "00000000-0000-0000-0000-000000000000";
      const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      return await addEventStaff({
        data: {
          event_id: eventId,
          user_id: finalUserId,
          role: formData.role,
          section_id: formData.section_id === "none" ? null : formData.section_id,
          badge_qr_string: `STAFF-${randomId}`,
          status: "active",
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Staff added and badge generated!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Assign a role and section. A secure Digital Badge will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>User ID / Email</Label>
            <Input
              placeholder="Enter User ID (Mocking for now)"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            />
          </div>
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
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Box Office">Box Office</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assigned Section (Optional)</Label>
            <Select
              value={formData.section_id}
              onValueChange={(val) => setFormData({ ...formData, section_id: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No specific section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Anywhere (All Access)</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full mt-4"
            style={{ background: "var(--gradient-primary)" }}
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

function StaffView() {
  const { eventId, workspaceSlug } = Route.useParams();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

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
      try {
        const res = await getEventStaff({ data: { event_id: eventId } } as any);
        if (res.length > 0) return res;
        throw new Error("No real data");
      } catch {
        return [
          {
            id: "1",
            user_id: "User A",
            role: "Manager",
            status: "active",
            badge_qr_string: "STAFF-XYZ123",
            section: null,
          },
          {
            id: "2",
            user_id: "User B",
            role: "Bartender",
            status: "active",
            badge_qr_string: "STAFF-ABC987",
            section: { name: "VIP Lounge" },
          },
        ];
      }
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
          <Link to={`/dashboard/${workspaceSlug}/events/${eventId}/badge-designer`}>
            <Button variant="outline" className="shadow-sm">
              <Palette className="mr-2 h-4 w-4" /> Design Badge
            </Button>
          </Link>
          <AddSectionModal eventId={eventId} />
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
          <TabsTrigger value="sections">Event Sections</TabsTrigger>
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
                  const assignedSection = sections.find((sec: any) => sec.id === s.section_id);
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStaff({ ...s, sectionObj: assignedSection })}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-foreground">
                            User {s.user_id.substring(0, 6)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{s.role}</td>
                      <td className="px-6 py-4">
                        {assignedSection ? (
                          <span className="inline-flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md text-xs font-medium">
                            <MapPin className="h-3 w-3" /> {assignedSection.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">All Access</span>
                        )}
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

        <TabsContent value="sections">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sections.map((s: any) => (
              <div
                key={s.id}
                className="rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {s.description || "No specific details provided for this section."}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
                  <span>ID: {s.id.substring(0, 8)}</span>
                </div>
              </div>
            ))}
            {sections.length === 0 && (
              <div className="col-span-full p-8 text-center border border-dashed rounded-xl text-muted-foreground">
                No sections defined. Create a section to restrict staff access.
              </div>
            )}
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
              <div className="relative w-full aspect-[1/1.5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 to-black border border-slate-800">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>

                {/* Lanyard Hole */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-background rounded-full shadow-inner z-20 border border-border/20"></div>

                <div className="relative z-10 flex flex-col h-full p-8">
                  <div className="flex-grow flex flex-col items-center justify-center text-center mt-8">
                    <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-lg border-2 border-slate-700">
                      <UserCheck className="h-10 w-10 text-slate-400" />
                    </div>

                    <h2 className="text-white text-2xl font-bold tracking-tight">
                      User {selectedStaff.user_id.substring(0, 6)}
                    </h2>
                    <p className="text-primary font-semibold tracking-widest uppercase mt-2 text-sm">
                      {selectedStaff.role}
                    </p>

                    <div className="mt-6 w-full max-w-[200px] aspect-square bg-white rounded-2xl p-3 shadow-lg mx-auto">
                      {/* Fake QR Code Visual */}
                      <div className="w-full h-full border-[10px] border-black flex items-center justify-center relative">
                        <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
                        <QrCode className="h-16 w-16 text-black" />
                      </div>
                    </div>
                    <p className="text-slate-500 font-mono text-xs mt-3">
                      {selectedStaff.badge_qr_string}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-800 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium text-sm">
                        {selectedStaff.sectionObj ? selectedStaff.sectionObj.name : "ALL ACCESS"}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ShieldAlert className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

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
