import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpaceSessions, createSpaceSession, updateSpaceSession, deleteSpaceSession,
  getSessionBookings, createSessionBooking, updateSessionBooking,
} from "@/api/space_classes";
import { getSpaceClasses } from "@/api/space_classes";
import { getSpaceResources } from "@/api/space_resources";
import { getSpaceSubscriptionsBySpaceId } from "@/api/space_subscriptions";
import { getWorkspaceUsers } from "@/api/workspace_users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays, Plus, Trash2, Users, Clock, ChevronRight,
  UserCheck, X, DollarSign, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/sessions")({
  component: SessionsPage,
});

function billingBadge(status: string) {
  const map: Record<string, string> = {
    free: "bg-slate-500/10 text-slate-500",
    included: "bg-green-500/10 text-green-600",
    pending: "bg-amber-500/10 text-amber-600",
    paid: "bg-blue-500/10 text-blue-600",
  };
  return map[status] || "bg-muted text-muted-foreground";
}

function SessionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["space_sessions", spaceId],
    queryFn: () => getSpaceSessions({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["space_classes", spaceId],
    queryFn: () => getSpaceClasses({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });
  const { data: resources = [] } = useQuery({
    queryKey: ["space_resources", spaceId],
    queryFn: () => getSpaceResources({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });
  const { data: staff = [] } = useQuery({
    queryKey: ["workspace_users"],
    queryFn: () => getWorkspaceUsers(),
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ["workspace_subscriptions", spaceId],
    queryFn: () => getSpaceSubscriptionsBySpaceId({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  // ── create session ─────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    class_id: "", resource_id: "", coach_id: "", coach_name: "",
    start_time: "", end_time: "", notes: "",
  });

  const createMutation = useMutation({
    mutationFn: createSpaceSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_sessions", spaceId] });
      toast.success("Session scheduled!");
      setShowCreate(false);
      setSessionForm({ class_id: "", resource_id: "", coach_id: "", coach_name: "", start_time: "", end_time: "", notes: "" });
    },
    onError: () => toast.error("Failed to schedule session."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpaceSession,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["space_sessions", spaceId] }); toast.success("Session cancelled."); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = (classes as any[]).find((c: any) => c.id === sessionForm.class_id);
    const selectedCoach = (staff as any[]).find((s: any) => s.id === sessionForm.coach_id);
    createMutation.mutate({
      data: {
        object: {
          class_id: sessionForm.class_id,
          resource_id: sessionForm.resource_id || null,
          coach_id: sessionForm.coach_id || null,
          coach_name: selectedCoach?.name || sessionForm.coach_name || null,
          start_time: new Date(sessionForm.start_time).toISOString(),
          end_time: new Date(sessionForm.end_time).toISOString(),
          notes: sessionForm.notes || null,
        }
      }
    });
  };

  // ── session detail / bookings ──────────────────────────────────
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { data: sessionBookings = [] } = useQuery({
    queryKey: ["session_bookings", selectedSession?.id],
    queryFn: () => getSessionBookings({ data: { session_id: selectedSession.id } }),
    enabled: !!selectedSession?.id,
  });

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSubscriptionId, setBookingSubscriptionId] = useState("");

  const addBookingMutation = useMutation({
    mutationFn: createSessionBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_bookings", selectedSession?.id] });
      toast.success("Member booked for session!");
      setShowBookingForm(false);
      setBookingSubscriptionId("");
    },
    onError: () => toast.error("Failed to add booking."),
  });

  const removeBookingMutation = useMutation({
    mutationFn: updateSessionBooking,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["session_bookings", selectedSession?.id] }); toast.success("Booking cancelled."); },
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = (subscriptions as any[]).find((s: any) => s.id === bookingSubscriptionId);
    const sessionClass = selectedSession?.class;
    const isFree = sessionClass?.is_free_with_subscription && sub;
    const feeCharged = isFree ? 0 : Number(sessionClass?.price || 0);
    const billingStatus = isFree ? "included" : feeCharged === 0 ? "free" : "pending";

    addBookingMutation.mutate({
      data: {
        object: {
          session_id: selectedSession.id,
          subscription_id: bookingSubscriptionId || null,
          customer_name: sub?.customer_name || "",
          customer_email: sub?.customer_email || "",
          fee_charged: feeCharged,
          billing_status: billingStatus,
        }
      }
    });
  };

  const activeSubscriptions = (subscriptions as any[]).filter((s: any) => s.status === "active");

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-orange-500" />
            Sessions
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Schedule class sessions, assign coaches, and manage member bookings.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          disabled={classes.length === 0}
          className="shrink-0 gap-2 rounded-xl h-10 px-5 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {classes.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          No class templates found. Go to <strong className="mx-1">Classes</strong> to create one first.
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="bg-secondary/30 border border-dashed border-border rounded-2xl p-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">No sessions scheduled</h3>
          <p className="text-muted-foreground text-sm">Schedule your first class session to start taking bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any) => {
            const spotsLeft = session.class?.max_capacity - (session.bookings?.length || 0);
            const isFull = spotsLeft <= 0;
            return (
              <div
                key={session.id}
                className="bg-card border border-border/60 rounded-2xl p-5 hover:border-orange-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{session.class?.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        session.status === "scheduled" ? "bg-green-500/10 text-green-500" :
                        session.status === "completed" ? "bg-blue-500/10 text-blue-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>{session.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.start_time).toLocaleDateString()} · {new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(session.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {session.coach_name && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5" />
                          {session.coach_name}
                        </span>
                      )}
                      {session.resource && (
                        <span className="flex items-center gap-1">
                          📍 {session.resource.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isFull ? "text-red-500" : "text-green-500"}`}>
                        {isFull ? "Full" : `${spotsLeft} spots left`}
                      </p>
                      <p className="text-xs text-muted-foreground">{session.bookings?.length || 0} / {session.class?.max_capacity}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Session Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule a Session</DialogTitle>
            <DialogDescription>Pick a class, assign a coach, and set the time.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Class</label>
              <select value={sessionForm.class_id} onChange={e => setSessionForm(f => ({ ...f, class_id: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                <option value="" disabled>Select a class...</option>
                {(classes as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.duration_minutes} min, max {c.max_capacity})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Resource / Room</label>
                <select value={sessionForm.resource_id} onChange={e => setSessionForm(f => ({ ...f, resource_id: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">No room assigned</option>
                  {(resources as any[]).map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Coach</label>
                <select value={sessionForm.coach_id} onChange={e => {
                  const coach = (staff as any[]).find((s: any) => s.id === e.target.value);
                  setSessionForm(f => ({ ...f, coach_id: e.target.value, coach_name: coach?.name || "" }));
                }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">No coach assigned</option>
                  {(staff as any[]).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start Time</label>
                <Input type="datetime-local" value={sessionForm.start_time} onChange={e => setSessionForm(f => ({ ...f, start_time: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Time</label>
                <Input type="datetime-local" value={sessionForm.end_time} onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input value={sessionForm.notes} onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes for this session..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} style={{ background: "var(--gradient-primary)" }}>
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Session Detail Dialog ── */}
      <Dialog open={!!selectedSession} onOpenChange={open => !open && setSelectedSession(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSession?.class?.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">Session Details</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <span className="flex flex-wrap gap-3 text-sm mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(selectedSession.start_time).toLocaleDateString()} · {new Date(selectedSession.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(selectedSession.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {selectedSession.coach_name && <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" />{selectedSession.coach_name}</span>}
                  {selectedSession.resource && <span>📍 {selectedSession.resource.name}</span>}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking info bar */}
            <div className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {sessionBookings.length} / {selectedSession?.class?.max_capacity} booked
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-orange-500" />
                {selectedSession?.class?.is_free_with_subscription ? (
                  <span className="text-green-500 font-medium">Free for subscribers</span>
                ) : (
                  <span className="font-medium">{Number(selectedSession?.class?.price || 0).toLocaleString()} per session</span>
                )}
              </div>
            </div>

            {/* Member list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Participants</h4>
                {(sessionBookings.length < (selectedSession?.class?.max_capacity || 999)) && (
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg h-8 text-xs" onClick={() => setShowBookingForm(true)}>
                    <Plus className="h-3 w-3" /> Add Member
                  </Button>
                )}
              </div>

              {sessionBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">
                  No participants yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-auto">
                  {sessionBookings.map((bk: any) => (
                    <div key={bk.id} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                      <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {(bk.customer_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{bk.customer_name || "—"}</p>
                        {bk.subscription && (
                          <p className="text-xs text-muted-foreground">{bk.subscription.plan_name}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${billingBadge(bk.billing_status)}`}>
                        {bk.billing_status === "included" ? "✓ Included" : bk.billing_status === "free" ? "Free" : bk.billing_status === "paid" ? "Paid" : "Pending"}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                        onClick={() => removeBookingMutation.mutate({ data: { id: bk.id, object: { status: "cancelled" } } })}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add booking inline form */}
              {showBookingForm && (
                <form onSubmit={handleAddBooking} className="flex gap-2 mt-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                  <select
                    value={bookingSubscriptionId}
                    onChange={e => setBookingSubscriptionId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="" disabled>Select a subscriber...</option>
                    {activeSubscriptions.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.customer_name} — {s.plan_name}</option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" className="h-9 px-4" disabled={addBookingMutation.isPending} style={{ background: "var(--gradient-primary)" }}>
                    Book
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setShowBookingForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-between mt-2">
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm("Cancel this session?")) {
                  deleteMutation.mutate({ data: { id: selectedSession.id } });
                  setSelectedSession(null);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Cancel Session
            </Button>
            <Button variant="secondary" onClick={() => setSelectedSession(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
