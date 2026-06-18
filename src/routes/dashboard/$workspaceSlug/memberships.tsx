import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Users, Eye, RefreshCw, Building2, Download, UserPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembersTable, type SpaceMember } from "@/components/desktop/dashboard/MembersTable";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceSubscriptionsByWorkspaceId, createSpaceSubscription } from "@/api/space_subscriptions";
import { getSpaces } from "@/api/spaces";
import { createInvoiceRecord } from "@/api/invoices";
import { sendSubscriptionConfirmationEmail, sendSubscriptionInvoiceEmail, sendCompanyRosterEmail, sendMemberWelcomeEmail } from "@/api/email";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/memberships")({
  component: MembershipsPage,
});

const BILLING_CYCLES = ["Monthly", "Annually", "Daily", "Weekly", "One-time"];

function MembershipsPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["workspace_subscriptions", activeWorkspace?.id],
    queryFn: () => getWorkspaceSubscriptionsByWorkspaceId({ data: { workspace_id: activeWorkspace!.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces", activeWorkspace?.id],
    queryFn: () => getSpaces({ data: { workspace_id: activeWorkspace!.id } }),
    enabled: !!activeWorkspace?.id,
  });

  // ── Members list derived from subscriptions ────────────────────────────
  const members: SpaceMember[] = useMemo(() => {
    if (isLoading) return [];
    const transformed: SpaceMember[] = [];
    for (const sub of subscriptions) {
      const isGroup = sub.booking_type === "group";
      const status = sub.status === "cancelled" || sub.status === "inactive" ? "Expired" : "Active";
      const joinedDate = sub.start_date
        ? new Date(sub.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

      if (isGroup && sub.team_members && Array.isArray(sub.team_members)) {
        for (const member of sub.team_members) {
          transformed.push({
            id: `sub-${sub.id}-mem-${member.email || member.membership_id || Math.random()}`,
            name: member.name || "Unknown Member",
            email: member.email || undefined,
            phone: member.phone || undefined,
            membershipId: member.membership_id || undefined,
            type: "Company",
            category: "member",
            organization: sub.customer_name,
            plan: sub.plan_name,
            employees: sub.team_members.length,
            status: status as any,
            subscriptionType: "new",
            billedAs: "Organization",
            space: sub.space?.name,
            joinedDate,
          });
        }
      } else {
        transformed.push({
          id: `sub-${sub.id}`,
          name: sub.customer_name || "Unknown",
          email: sub.customer_email || undefined,
          phone: sub.customer_phone || undefined,
          membershipId: sub.id?.substring(0, 10).toUpperCase() || undefined,
          type: "Individual",
          category: "member",
          plan: sub.plan_name,
          employees: 1,
          status: status as any,
          subscriptionType: "new",
          billedAs: "Individual",
          space: sub.space?.name,
          joinedDate,
        });
      }
    }
    return transformed;
  }, [subscriptions, isLoading]);

  const stats = [
    { label: "Total Members",    value: members.filter(m => m.category === "member").length,                             icon: Users,     color: "text-orange-500",  bg: "bg-orange-500/10"  },
    { label: "Visitors",         value: members.filter(m => m.category === "visitor").length,                            icon: Eye,       color: "text-rose-500",    bg: "bg-rose-500/10"    },
    { label: "Re-using",         value: members.filter(m => m.subscriptionType === "returning").length,                  icon: RefreshCw, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Companies / Orgs", value: members.filter(m => m.type !== "Individual" && m.category === "member").length,  icon: Building2, color: "text-purple-500",  bg: "bg-purple-500/10"  },
  ];

  // ── Add Member modal state ─────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "", phone: "" }]);
  const [form, setForm] = useState({
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

  const handlePlanChange = (planName: string) => {
    const plan = availablePlans.find((p: any) => p.name === planName);
    setForm(f => ({
      ...f,
      planName,
      price: plan?.price ? String(plan.price) : f.price,
      billingCycle: plan?.billing_cycle || f.billingCycle,
    }));
  };

  const openModal = () => {
    setShowModal(true);
    setSuccessMsg("");
    setErrorMsg("");
    setBookingType("individual");
    setSelectedSpaceId(spaces[0]?.id || "");
    setTeamMembers([{ name: "", email: "", phone: "" }]);
    setForm({ name: "", email: "", phone: "", planName: "", price: "", billingCycle: "Monthly", startDate: new Date().toISOString().split("T")[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.name || !form.email || !form.phone || !form.planName || !selectedSpaceId) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const currency = selectedSpace?.currency || "RWF";
      const numMembers = bookingType === "group" ? Math.max(1, teamMembers.length) : 1;
      const priceNum = parseInt(form.price.replace(/[^0-9]/g, "")) || 0;
      const totalPrice = priceNum * numMembers;
      const finalPriceString = `${currency} ${totalPrice.toLocaleString()}`;

      // 1. Create the subscription
      const subscription = await createSpaceSubscription({
        data: {
          space_id: selectedSpaceId,
          user_id: null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          plan_name: form.planName,
          price: finalPriceString,
          billing_cycle: form.billingCycle,
          start_date: form.startDate,
          booking_type: bookingType,
          team_members: bookingType === "group" ? teamMembers : [],
        }
      });

      const savedMembers: any[] = subscription?.team_members || [];
      const invoiceDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
      const groupPlanName = bookingType === "group" ? `${form.planName} (Group of ${teamMembers.length})` : form.planName;

      // 2. Create invoice
      const invoice = await createInvoiceRecord({
        data: {
          spaceName: selectedSpace?.name || "Our Space",
          customerName: form.name,
          customerEmail: form.email,
          planName: groupPlanName,
          amount: String(totalPrice),
          currency,
          billingCycle: form.billingCycle,
          startDate: form.startDate,
          spaceId: selectedSpaceId,
          referenceId: subscription?.id,
        }
      });

      const invoiceNumber = invoice?.invoiceNumber || `AGT-${Date.now()}`;
      const pdfBase64 = invoice?.pdfBase64 || null;
      const formattedStart = new Date(form.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

      // 3. Send emails
      if (bookingType === "group") {
        await sendCompanyRosterEmail({
          data: {
            to: form.email,
            companyName: form.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: groupPlanName,
            price: finalPriceString,
            billingCycle: form.billingCycle,
            startDate: formattedStart,
            invoiceNumber,
            invoiceDate,
            memberCount: savedMembers.length,
            members: savedMembers,
            pdfBase64,
          }
        });
        for (const m of savedMembers) {
          if (m.email) {
            await sendMemberWelcomeEmail({
              data: {
                to: m.email,
                memberName: m.name,
                companyName: form.name,
                spaceName: selectedSpace?.name || "Our Space",
                planName: form.planName,
                startDate: formattedStart,
                membershipId: m.membership_id || "—",
              }
            });
          }
        }
      } else {
        await sendSubscriptionConfirmationEmail({
          data: {
            to: form.email,
            customerName: form.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: form.planName,
            price: finalPriceString,
            billingCycle: form.billingCycle,
            startDate: form.startDate,
          }
        });
        await sendSubscriptionInvoiceEmail({
          data: {
            to: form.email,
            customerName: form.name,
            spaceName: selectedSpace?.name || "Our Space",
            planName: form.planName,
            price: finalPriceString,
            billingCycle: form.billingCycle,
            invoiceDate,
            invoiceNumber,
            startDate: form.startDate,
            pdfBase64,
          }
        });
      }

      // 4. Refresh table
      queryClient.invalidateQueries({ queryKey: ["workspace_subscriptions", activeWorkspace?.id] });
      setSuccessMsg(`✓ Subscription created and confirmation sent to ${form.email}`);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memberships</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            All members, visitors, and organizations across every space in{" "}
            <span className="text-foreground font-semibold">{activeWorkspace?.name ?? workspaceSlug}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-xl h-11 px-5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={openModal} className="gap-2 rounded-xl h-11 px-5" style={{ background: "var(--gradient-primary)" }}>
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:border-orange-500/30 transition-colors">
            <div className={`h-11 w-11 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">{s.label}</p>
              <h4 className="text-2xl font-bold mt-0.5">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <MembersTable members={members} pageSize={8} showSearch showFilters showSpaceColumn />

      {/* ── Add Member Modal ───────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={(v) => !isSubmitting && setShowModal(v)}>
        <DialogContent className="max-w-lg w-[95vw] rounded-3xl p-0 overflow-hidden border-border/60">
          {/* Header */}
          <div className="p-6 border-b border-border/40 bg-secondary/5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Register New Member</DialogTitle>
              <DialogDescription>
                The member will receive an email confirmation and invoice with their Membership ID.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Booking type */}
            <div>
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Type</Label>
              <div className="flex gap-3">
                {(["individual", "group"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBookingType(t)}
                    className={`flex-1 h-10 rounded-xl text-sm font-semibold border transition-all ${
                      bookingType === t
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-border/60 bg-card text-muted-foreground hover:border-orange-500/50"
                    }`}
                  >
                    {t === "individual" ? "Individual" : "Company / Group"}
                  </button>
                ))}
              </div>
            </div>

            {/* Space */}
            <div>
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Space *</Label>
              <select
                value={selectedSpaceId}
                onChange={e => { setSelectedSpaceId(e.target.value); setForm(f => ({ ...f, planName: "", price: "" })); }}
                className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              >
                <option value="">Select a space…</option>
                {spaces.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Plan */}
            <div>
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Plan *</Label>
              {availablePlans.length > 0 ? (
                <select
                  value={form.planName}
                  onChange={e => handlePlanChange(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="">Select a plan…</option>
                  {availablePlans.map((p: any) => (
                    <option key={p.name} value={p.name}>{p.name} — {selectedSpace?.currency} {p.price}</option>
                  ))}
                </select>
              ) : (
                <Input placeholder="Plan name" value={form.planName} onChange={e => setForm(f => ({ ...f, planName: e.target.value }))} className="rounded-xl h-10" required />
              )}
            </div>

            {/* Price + Billing Cycle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Price ({selectedSpace?.currency || "RWF"})</Label>
                <Input type="number" min="0" placeholder="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="rounded-xl h-10" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Billing Cycle</Label>
                <select
                  value={form.billingCycle}
                  onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="rounded-xl h-10" required />
            </div>

            {/* Customer info */}
            <div className="border-t border-border/40 pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {bookingType === "group" ? "Company Details" : "Customer Details"}
              </p>
              <Input placeholder={bookingType === "group" ? "Company name *" : "Full name *"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl h-10" required />
              <Input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl h-10" required />
              <Input placeholder="Phone number *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl h-10" required />
            </div>

            {/* Team members for group */}
            {bookingType === "group" && (
              <div className="border-t border-border/40 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Members</p>
                  <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-xs rounded-xl" onClick={() => setTeamMembers(t => [...t, { name: "", email: "", phone: "" }])}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                {teamMembers.map((m, i) => (
                  <div key={i} className="p-3 rounded-2xl border border-border/40 bg-secondary/5 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-semibold">Member {i + 1}</span>
                      {teamMembers.length > 1 && (
                        <button type="button" onClick={() => setTeamMembers(t => t.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <Input placeholder="Name" value={m.name} onChange={e => setTeamMembers(t => t.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} className="rounded-xl h-9 text-sm" />
                    <Input type="email" placeholder="Email" value={m.email} onChange={e => setTeamMembers(t => t.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))} className="rounded-xl h-9 text-sm" />
                    <Input placeholder="Phone" value={m.phone} onChange={e => setTeamMembers(t => t.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x))} className="rounded-xl h-9 text-sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Feedback */}
            {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-500 font-semibold">{successMsg}</p>}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl" style={{ background: "var(--gradient-primary)" }} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing…</> : "Register & Send Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

