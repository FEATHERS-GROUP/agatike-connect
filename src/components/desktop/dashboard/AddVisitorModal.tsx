import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createSpaceSubscription } from "@/api/space_subscriptions";
import { processVisitorPass } from "@/api/visitor_passes";
import { StepIndicator, Row } from "./AddMemberModal";
import { SpaceMember } from "./MembersTable";

export function AddVisitorModal({ open, onOpenChange, spaces, workspaceId, members }: { open: boolean, onOpenChange: (open: boolean) => void, spaces: any[], workspaceId: string, members: SpaceMember[] }) {
  const queryClient = useQueryClient();
  const [visitorStep, setVisitorStep] = useState(0);
  const [visitorSubmitting, setVisitorSubmitting] = useState(false);
  const [visitorError, setVisitorError] = useState("");
  const [visitorSuccess, setVisitorSuccess] = useState("");
  const [visitorSpaceId, setVisitorSpaceId] = useState("");
  const [visitorForm, setVisitorForm] = useState({
    name: "", email: "", phone: "",
    visitDate: new Date().toISOString().split("T")[0],
    hostedBy: "", // name of member/host they came with
    hostEmail: "",
    notes: "",
  });

  // Reset form when opened
  if (open && visitorStep === 0 && !visitorSpaceId && spaces.length > 0) {
    setVisitorSpaceId(spaces[0].id);
  }

  const visitorStepLabels = ["Details", "Visit Info", "Review"];

  const canNextVisitor = () => {
    if (visitorStep === 0) return !!visitorForm.name && !!visitorForm.phone;
    if (visitorStep === 1) return !!visitorSpaceId && !!visitorForm.visitDate && !!visitorForm.hostedBy;
    return true;
  };

  const handleVisitorSubmit = async () => {
    setVisitorError("");
    setVisitorSubmitting(true);
    try {
      const visitorSpace = spaces.find((s: any) => s.id === visitorSpaceId) as any;

      const subscription = await createSpaceSubscription({
        data: {
          space_id: visitorSpaceId,
          user_id: null,
          customer_name: visitorForm.name,
          customer_email: visitorForm.email || `visitor-${Date.now()}@noemail.local`,
          customer_phone: visitorForm.phone,
          customer_address: visitorForm.hostedBy, // host name stored here
          plan_name: "Day Visit",
          price: "0",
          billing_cycle: "one-time",
          start_date: visitorForm.visitDate,
          booking_type: "visitor",
          team_members: [],
        }
      });

      const visitorId = subscription.id.split("-")[0].toUpperCase();

      await processVisitorPass({
        data: {
          to: visitorForm.email,
          visitorName: visitorForm.name,
          visitorId,
          spaceName: visitorSpace?.name || "Our Space",
          visitDate: visitorForm.visitDate,
          hostedBy: visitorForm.hostedBy,
        }
      });

      queryClient.invalidateQueries({ queryKey: ["workspace_subscriptions", workspaceId] });
      
      setVisitorSuccess(
        visitorForm.email
          ? `✓ Visitor logged! Pass sent to ${visitorForm.email}`
          : `✓ Visitor logged! Please ask them to write down ID: ${visitorId}`
      );
      
      // Delay closing modal slightly longer so they can read the ID
      setTimeout(() => {
        onOpenChange(false);
        setVisitorStep(0);
        setVisitorForm({ name: "", email: "", phone: "", visitDate: new Date().toISOString().split("T")[0], hostedBy: "", hostEmail: "", notes: "" });
      }, 4000);
    } catch (err: any) {
      setVisitorError(err.message || "Something went wrong.");
    } finally {
      setVisitorSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !visitorSubmitting && onOpenChange(v)}>
      <DialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden border-border/60">
        <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-rose-500/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log a Visitor</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Track who visited and who they came with.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <StepIndicator steps={visitorStepLabels} current={visitorStep} />
          </div>
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
          {visitorStep === 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visitor Details</p>
              <Input placeholder="Full name *" value={visitorForm.name} onChange={e => setVisitorForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl h-10" />
              <Input type="email" placeholder="Email (optional)" value={visitorForm.email} onChange={e => setVisitorForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl h-10" />
              <Input placeholder="Phone number *" value={visitorForm.phone} onChange={e => setVisitorForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl h-10" />
            </>
          )}

          {visitorStep === 1 && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Space *</Label>
                <select value={visitorSpaceId} onChange={e => setVisitorSpaceId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="">Select a space…</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Visit Date *</Label>
                <Input type="date" value={visitorForm.visitDate} onChange={e => setVisitorForm(f => ({ ...f, visitDate: e.target.value }))} className="rounded-xl h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Hosted by (member / host) *</Label>
                <Input placeholder="Name of the member they came with *" value={visitorForm.hostedBy}
                  onChange={e => setVisitorForm(f => ({ ...f, hostedBy: e.target.value }))} className="rounded-xl h-10"
                  list="members-list" />
                <datalist id="members-list">
                  {members.filter(m => m.category === "member").map(m => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-muted-foreground mt-1">Start typing to autocomplete from existing members.</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Notes (optional)</Label>
                <Input placeholder="Reason for visit, etc." value={visitorForm.notes} onChange={e => setVisitorForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl h-10" />
              </div>
            </>
          )}

          {visitorStep === 2 && (
            <div className="space-y-3">
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 space-y-2 text-sm">
                <Row label="Name" value={visitorForm.name} />
                {visitorForm.email && <Row label="Email" value={visitorForm.email} />}
                <Row label="Phone" value={visitorForm.phone} />
                <div className="border-t border-rose-500/10 pt-2 mt-2">
                  <Row label="Space" value={spaces.find(s => s.id === visitorSpaceId)?.name || "—"} />
                  <Row label="Visit date" value={visitorForm.visitDate} />
                  <Row label="Hosted by" value={visitorForm.hostedBy} highlight />
                  {visitorForm.notes && <Row label="Notes" value={visitorForm.notes} />}
                </div>
              </div>
              {visitorError && <p className="text-sm text-red-500 font-medium">{visitorError}</p>}
              {visitorSuccess && <p className="text-sm text-green-500 font-semibold">{visitorSuccess}</p>}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {visitorStep > 0 && (
            <Button variant="outline" className="gap-1 rounded-xl flex-1" onClick={() => setVisitorStep(s => s - 1)} disabled={visitorSubmitting}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {visitorStep === 0 && (
            <Button variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          )}
          {visitorStep < 2 ? (
            <Button className="gap-1 rounded-xl flex-1 bg-rose-500 hover:bg-rose-500/90 text-white"
              disabled={!canNextVisitor()} onClick={() => setVisitorStep(s => s + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="rounded-xl flex-1 bg-rose-500 hover:bg-rose-500/90 text-white"
              disabled={visitorSubmitting} onClick={handleVisitorSubmit}>
              {visitorSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Logging…</> : "Log Visitor"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
