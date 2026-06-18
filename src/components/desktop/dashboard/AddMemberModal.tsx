import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createSpaceSubscription } from "@/api/space_subscriptions";
import { createInvoiceRecord } from "@/api/invoices";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionInvoiceEmail,
  sendCompanyRosterEmail,
  sendMemberWelcomeEmail,
} from "@/api/email";

const BILLING_CYCLES = ["Monthly", "Annually", "Daily", "Weekly", "One-time"];

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                "flex items-center justify-center rounded-full text-xs font-bold w-7 h-7 shrink-0 transition-all",
                done
                  ? "bg-green-500 text-white"
                  : active
                    ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                    : "bg-secondary/60 text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider hidden sm:block",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-1 transition-all",
                  done ? "bg-green-500/50" : "bg-border/40",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-2 py-0.5">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span
        className={cn(
          "text-xs font-semibold text-right",
          highlight ? "text-orange-500" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function AddMemberModal({
  open,
  onOpenChange,
  spaces,
  workspaceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: any[];
  workspaceId: string;
}) {
  const queryClient = useQueryClient();
  const [memberStep, setMemberStep] = useState(0);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "", phone: "" }]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    planName: "",
    price: "",
    billingCycle: "Monthly",
    startDate: new Date().toISOString().split("T")[0],
  });

  const selectedSpace = spaces.find((s: any) => s.id === selectedSpaceId);
  const availablePlans: any[] = selectedSpace?.plans || [];

  // Reset form when opened
  if (open && memberStep === 0 && !selectedSpaceId && spaces.length > 0) {
    setSelectedSpaceId(spaces[0].id);
  }

  const memberStepLabels = ["Type & Space", "Plan & Date", "Details", "Review"];

  const canNextMember = () => {
    if (memberStep === 0) return !!selectedSpaceId;
    if (memberStep === 1)
      return !!memberForm.planName && !!memberForm.price && !!memberForm.startDate;
    if (memberStep === 2) return !!memberForm.name && !!memberForm.email && !!memberForm.phone;
    return true;
  };

  const handleMemberSubmit = async () => {
    setMemberError("");
    setMemberSubmitting(true);
    try {
      const currency = selectedSpace?.currency || "RWF";
      const numMembers = bookingType === "group" ? Math.max(1, teamMembers.length) : 1;
      const priceNum = parseInt(String(memberForm.price).replace(/[^0-9]/g, "")) || 0;
      const totalPrice = priceNum * numMembers;
      const finalPriceString = `${currency} ${totalPrice.toLocaleString()}`;

      const subscription = await createSpaceSubscription({
        data: {
          space_id: selectedSpaceId,
          user_id: null,
          customer_name: memberForm.name,
          customer_email: memberForm.email,
          customer_phone: memberForm.phone,
          plan_name: memberForm.planName,
          price: finalPriceString,
          billing_cycle: memberForm.billingCycle,
          start_date: memberForm.startDate,
          booking_type: bookingType,
          team_members: bookingType === "group" ? teamMembers : [],
        },
      });

      const savedMembers: any[] = subscription?.team_members || [];
      const invoiceDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const groupPlanName =
        bookingType === "group"
          ? `${memberForm.planName} (Group of ${teamMembers.length})`
          : memberForm.planName;

      const invoice = await createInvoiceRecord({
        data: {
          spaceName: selectedSpace?.name || "Our Space",
          customerName: memberForm.name,
          customerEmail: memberForm.email,
          planName: groupPlanName,
          amount: String(totalPrice),
          currency,
          billingCycle: memberForm.billingCycle,
          startDate: memberForm.startDate,
          spaceId: selectedSpaceId,
          referenceId: subscription?.id,
        },
      });

      const invoiceNumber = invoice?.invoiceNumber || `AGT-${Date.now()}`;
      const pdfBase64 = invoice?.pdfBase64 || null;
      const formattedStart = new Date(memberForm.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (bookingType === "group") {
        await sendCompanyRosterEmail({
          data: {
            to: memberForm.email,
            companyName: memberForm.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: groupPlanName,
            price: finalPriceString,
            billingCycle: memberForm.billingCycle,
            startDate: formattedStart,
            invoiceNumber,
            invoiceDate,
            memberCount: savedMembers.length,
            members: savedMembers,
            pdfBase64,
          },
        });
        for (const m of savedMembers) {
          if (m.email)
            await sendMemberWelcomeEmail({
              data: {
                to: m.email,
                memberName: m.name,
                companyName: memberForm.name,
                spaceName: selectedSpace?.name || "Our Space",
                planName: memberForm.planName,
                startDate: formattedStart,
                membershipId: m.membership_id || "—",
              },
            });
        }
      } else {
        await sendSubscriptionConfirmationEmail({
          data: {
            to: memberForm.email,
            customerName: memberForm.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: memberForm.planName,
            price: finalPriceString,
            billingCycle: memberForm.billingCycle,
            startDate: memberForm.startDate,
          },
        });
        await sendSubscriptionInvoiceEmail({
          data: {
            to: memberForm.email,
            customerName: memberForm.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: memberForm.planName,
            price: finalPriceString,
            billingCycle: memberForm.billingCycle,
            invoiceDate,
            invoiceNumber,
            startDate: memberForm.startDate,
            pdfBase64,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["workspace_subscriptions", workspaceId] });
      setMemberSuccess(`✓ Registered and confirmation sent to ${memberForm.email}`);
      setTimeout(() => {
        onOpenChange(false);
        setMemberStep(0);
        setMemberForm({
          name: "",
          email: "",
          phone: "",
          planName: "",
          price: "",
          billingCycle: "Monthly",
          startDate: new Date().toISOString().split("T")[0],
        });
        setTeamMembers([{ name: "", email: "", phone: "" }]);
      }, 2000);
    } catch (err: any) {
      setMemberError(err.message || "Something went wrong.");
    } finally {
      setMemberSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !memberSubmitting && onOpenChange(v)}>
      <DialogContent className="max-w-lg w-[95vw] rounded-3xl p-0 overflow-hidden border-border/60">
        <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-secondary/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Register New Member</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Member will receive a confirmation email with their Membership ID & invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <StepIndicator steps={memberStepLabels} current={memberStep} />
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {memberStep === 0 && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                  Booking Type
                </Label>
                <div className="flex gap-3">
                  {(["individual", "group"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBookingType(t)}
                      className={cn(
                        "flex-1 h-11 rounded-xl text-sm font-semibold border transition-all",
                        bookingType === t
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-border/60 bg-card text-muted-foreground hover:border-orange-500/40",
                      )}
                    >
                      {t === "individual" ? "Individual" : "Company / Group"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                  Space *
                </Label>
                <select
                  value={selectedSpaceId}
                  onChange={(e) => {
                    setSelectedSpaceId(e.target.value);
                    setMemberForm((f) => ({ ...f, planName: "", price: "" }));
                  }}
                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select a space…</option>
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {memberStep === 1 && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                  Plan *
                </Label>
                {availablePlans.length > 0 ? (
                  <select
                    value={memberForm.planName}
                    onChange={(e) => {
                      const p = availablePlans.find((x: any) => x.name === e.target.value);
                      setMemberForm((f) => ({
                        ...f,
                        planName: e.target.value,
                        price: p?.price ? String(p.price) : f.price,
                        billingCycle: p?.billing_cycle || f.billingCycle,
                      }));
                    }}
                    className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select a plan…</option>
                    {availablePlans.map((p: any) => (
                      <option key={p.name} value={p.name}>
                        {p.name} — {selectedSpace?.currency} {p.price}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="Plan name"
                    value={memberForm.planName}
                    onChange={(e) => setMemberForm((f) => ({ ...f, planName: e.target.value }))}
                    className="rounded-xl h-10"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                    Price ({selectedSpace?.currency || "RWF"})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={memberForm.price}
                    onChange={(e) => setMemberForm((f) => ({ ...f, price: e.target.value }))}
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                    Billing Cycle
                  </Label>
                  <select
                    value={memberForm.billingCycle}
                    onChange={(e) => setMemberForm((f) => ({ ...f, billingCycle: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {BILLING_CYCLES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">
                  Start Date *
                </Label>
                <Input
                  type="date"
                  value={memberForm.startDate}
                  onChange={(e) => setMemberForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
            </>
          )}

          {memberStep === 2 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {bookingType === "group" ? "Company Details" : "Customer Details"}
              </p>
              <Input
                placeholder={bookingType === "group" ? "Company name *" : "Full name *"}
                value={memberForm.name}
                onChange={(e) => setMemberForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl h-10"
              />
              <Input
                type="email"
                placeholder="Email address *"
                value={memberForm.email}
                onChange={(e) => setMemberForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-xl h-10"
              />
              <Input
                placeholder="Phone number *"
                value={memberForm.phone}
                onChange={(e) => setMemberForm((f) => ({ ...f, phone: e.target.value }))}
                className="rounded-xl h-10"
              />

              {bookingType === "group" && (
                <div className="border-t border-border/40 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Team Members
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs rounded-xl"
                      onClick={() =>
                        setTeamMembers((t) => [...t, { name: "", email: "", phone: "" }])
                      }
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {teamMembers.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl border border-border/40 bg-secondary/5 space-y-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground font-semibold">
                          Member {i + 1}
                        </span>
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTeamMembers((t) => t.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="Name"
                        value={m.name}
                        onChange={(e) =>
                          setTeamMembers((t) =>
                            t.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)),
                          )
                        }
                        className="rounded-xl h-9 text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={m.email}
                        onChange={(e) =>
                          setTeamMembers((t) =>
                            t.map((x, idx) => (idx === i ? { ...x, email: e.target.value } : x)),
                          )
                        }
                        className="rounded-xl h-9 text-sm"
                      />
                      <Input
                        placeholder="Phone"
                        value={m.phone}
                        onChange={(e) =>
                          setTeamMembers((t) =>
                            t.map((x, idx) => (idx === i ? { ...x, phone: e.target.value } : x)),
                          )
                        }
                        className="rounded-xl h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {memberStep === 3 && (
            <div className="space-y-3">
              <div className="bg-secondary/10 rounded-2xl p-4 space-y-2 text-sm">
                <Row
                  label="Type"
                  value={bookingType === "group" ? "Company / Group" : "Individual"}
                />
                <Row label="Space" value={selectedSpace?.name || "—"} />
                <Row label="Plan" value={memberForm.planName} />
                <Row
                  label="Price"
                  value={`${selectedSpace?.currency || "RWF"} ${memberForm.price}`}
                />
                <Row label="Billing" value={memberForm.billingCycle} />
                <Row label="Start" value={memberForm.startDate} />
                <div className="border-t border-border/30 pt-2 mt-2">
                  <Row label="Name" value={memberForm.name} />
                  <Row label="Email" value={memberForm.email} />
                  <Row label="Phone" value={memberForm.phone} />
                  {bookingType === "group" && (
                    <Row
                      label="Team size"
                      value={`${teamMembers.length} member${teamMembers.length !== 1 ? "s" : ""}`}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                A confirmation email and invoice PDF will be sent to{" "}
                <strong>{memberForm.email}</strong>.
                {bookingType === "group" &&
                  " Each team member will also receive a welcome email with their personal Membership ID."}
              </p>
              {memberError && <p className="text-sm text-red-500 font-medium">{memberError}</p>}
              {memberSuccess && (
                <p className="text-sm text-green-500 font-semibold">{memberSuccess}</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {memberStep > 0 && (
            <Button
              variant="outline"
              className="gap-1 rounded-xl flex-1"
              onClick={() => setMemberStep((s) => s - 1)}
              disabled={memberSubmitting}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {memberStep === 0 && (
            <Button
              variant="outline"
              className="rounded-xl flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}
          {memberStep < 3 ? (
            <Button
              className="gap-1 rounded-xl flex-1"
              style={{ background: "var(--gradient-primary)" }}
              disabled={!canNextMember()}
              onClick={() => setMemberStep((s) => s + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="gap-1 rounded-xl flex-1"
              style={{ background: "var(--gradient-primary)" }}
              disabled={memberSubmitting}
              onClick={handleMemberSubmit}
            >
              {memberSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Processing…
                </>
              ) : (
                "Register & Send Invoice"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
