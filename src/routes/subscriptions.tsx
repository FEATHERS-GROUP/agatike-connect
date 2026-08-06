import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, CalendarDays, Building2, Plus, Unlink, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUserSession } from "@/api/auth";
import {
  getUserSubscriptions,
  getLinkedCredentials,
  addLinkedGroupSubscription,
  removeLinkedGroupSubscription,
  renewSpaceSubscription,
} from "@/api/space_subscriptions";
import QRCode from "react-qr-code";

export const Route = createFileRoute("/subscriptions")({
  loader: async () => {
    const session = await getUserSession();
    const linkedCreds = await getLinkedCredentials();
    if (!session) return { subscriptions: [], userEmail: null, linkedCreds };

    const subscriptions = await getUserSubscriptions({
      data: { user_id: session.id, email: session.email },
    });
    return { subscriptions, userEmail: session.email, linkedCreds };
  },
  component: SubscriptionsPage,
});

/** Determine if a subscription is still valid based on next_billing_date */
function getSubscriptionValidity(sub: any): { isValid: boolean; label: string; color: string } {
  const status = (sub.status || "").toLowerCase();
  if (status === "cancelled" || status === "inactive") {
    return { isValid: false, label: "Cancelled", color: "bg-red-500/10 text-red-500" };
  }

  if (sub.next_billing_date) {
    const nextBilling = new Date(sub.next_billing_date);
    const now = new Date();
    if (nextBilling < now) {
      return { isValid: false, label: "Expired", color: "bg-red-500/10 text-red-500" };
    }
    // Expiring within 3 days
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (nextBilling.getTime() - now.getTime() < threeDays) {
      return { isValid: true, label: "Expiring Soon", color: "bg-amber-500/10 text-amber-500" };
    }
  }

  return { isValid: true, label: "Active", color: "bg-green-500/10 text-green-500" };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

/* ─── Subscription Card ─── */
function SubscriptionCard({
  sub,
  userEmail,
  linkedCreds,
}: {
  sub: any;
  userEmail: string | null;
  linkedCreds: any[];
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  const validity = useMemo(() => getSubscriptionValidity(sub), [sub]);
  const latestInvoice = sub.invoices?.[0] || null;
  const currency = sub.space?.currency || "RWF";

  // Determine if the current user is a team member (not the purchaser)
  const isGroupSub = sub.booking_type === "group";
  const matchedMember = useMemo(() => {
    if (!isGroupSub || !sub.team_members) return null;

    // First try userEmail
    if (userEmail) {
      const match = sub.team_members.find((m: any) => m.email === userEmail);
      if (match) return match;
    }

    // Then try linkedCreds
    for (const cred of linkedCreds) {
      let match = null;
      if (cred.email) match = sub.team_members.find((m: any) => m.email === cred.email);
      if (match) return match;
      if (cred.membership_id)
        match = sub.team_members.find((m: any) => m.membership_id === cred.membership_id);
      if (match) return match;
    }

    return null;
  }, [isGroupSub, userEmail, sub.team_members, linkedCreds]);

  // Is this user just a team member (not the one who purchased)?
  const isTeamMemberOnly = isGroupSub && matchedMember !== null && sub.customer_email !== userEmail;

  // Did they explicitly link this, or was it automatically matched by their login email?
  const isExplicitlyLinked = isTeamMemberOnly && (!userEmail || matchedMember.email !== userEmail);

  // QR payload: for team members use their personal membership_id, for owner use subscription id
  const qrId =
    isTeamMemberOnly && matchedMember?.membership_id ? matchedMember.membership_id : sub.id;
  const qrPayload =
    typeof window !== "undefined" ? `${window.location.origin}/v/${qrId}` : `/v/${qrId}`;

  // Compute the "next billing" display — fall back to calculating from start_date + billing_cycle
  const nextBillingDisplay = useMemo(() => {
    if (sub.next_billing_date) return formatDate(sub.next_billing_date);
    if (!sub.start_date) return "N/A";
    const start = new Date(sub.start_date);
    const cycle = (sub.billing_cycle || "").toLowerCase();
    if (cycle === "daily") start.setDate(start.getDate() + 1);
    else if (cycle === "monthly") start.setMonth(start.getMonth() + 1);
    else if (cycle === "annually" || cycle === "yearly") start.setFullYear(start.getFullYear() + 1);
    else return formatDate(sub.start_date);
    return formatDate(start.toISOString());
  }, [sub]);

  const handleUnlink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!matchedMember) return;
    setIsUnlinking(true);
    try {
      await removeLinkedGroupSubscription({
        data: { email: matchedMember.email, membership_id: matchedMember.membership_id },
      });
      await router.invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      // Create pending invoice and extend next_billing_date
      await renewSpaceSubscription({ data: { subscription_id: sub.id } });
      toast.success("Subscription renewed successfully!");
      setShowRenew(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to renew subscription");
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm flex flex-col mb-4 transition-all hover:border-primary/40 hover:shadow-md md:rounded-[20px]">
        {/* Top Cover Section */}
        <div 
          className="relative h-20 md:h-28 w-full cursor-pointer"
          onClick={() => navigate({ to: '/profile/subscriptions/$subscriptionId', params: { subscriptionId: String(sub.id) } })}
        >
          <img
            src={
              sub.space?.cover_url ||
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop"
            }
            alt={sub.plan_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md">
                  {sub.plan_name}
                </p>
                {isGroupSub && (
                  <span className="flex items-center gap-1 text-[10px] text-white/90 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full shrink-0 shadow-sm border border-white/10">
                    <Building2 className="h-2.5 w-2.5" />
                    {isTeamMemberOnly ? "Team Member" : "Company"}
                  </span>
                )}
              </div>
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5 md:text-sm">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" /> {sub.space?.name || "Unknown Venue"}
              </p>
            </div>
            <span
              className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm backdrop-blur-sm ${validity.color.replace('bg-', 'bg-white/90 text-').replace('/10', '')}`}
              style={{
                backgroundColor: validity.label === 'Active' ? 'rgba(34, 197, 94, 0.9)' : validity.label === 'Expiring Soon' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                color: '#fff'
              }}
            >
              {validity.label}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div 
          className="p-3 md:p-4 flex flex-col gap-3 cursor-pointer hover:bg-secondary/20 transition-colors"
          onClick={() => navigate({ to: '/profile/subscriptions/$subscriptionId', params: { subscriptionId: String(sub.id) } })}
        >
          {/* Price & Customer Info */}
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
            {!isGroupSub ? (
              <div className="text-sm md:text-base font-bold text-primary">
                {sub.price} {currency}{" "}
                <span className="text-muted-foreground font-normal text-xs md:text-sm">
                  / {sub.billing_cycle}
                </span>
              </div>
            ) : (
              <div className="text-sm md:text-base font-bold text-foreground">
                Group Subscription
              </div>
            )}
            
            {isTeamMemberOnly && matchedMember && (
              <div className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                Purchased by <span className="font-semibold text-foreground">{sub.customer_name}</span>
              </div>
            )}
          </div>
          
          {/* Desktop/Tablet Detailed Grid */}
          <div className="hidden sm:grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                {sub.billing_cycle?.toLowerCase() === "one-time" || sub.billing_cycle?.toLowerCase() === "onetime" || isGroupSub 
                  ? (isTeamMemberOnly ? "Member Since" : "Start Date") 
                  : "Start Date"}
              </p>
              <p className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                <CalendarDays className="h-3 w-3 text-muted-foreground" /> {formatDate(sub.start_date)}
              </p>
            </div>
            {!(sub.billing_cycle?.toLowerCase() === "one-time" || sub.billing_cycle?.toLowerCase() === "onetime" || isGroupSub) && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Next Billing</p>
                <p className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <CalendarDays className="h-3 w-3 text-primary" /> {nextBillingDisplay}
                </p>
              </div>
            )}
          </div>

          {/* Mobile Only Dates Row */}
          <div className="sm:hidden pt-2 border-t border-border/40 text-xs flex justify-between items-center text-muted-foreground">
            {sub.billing_cycle?.toLowerCase() === "one-time" || sub.billing_cycle?.toLowerCase() === "onetime" ? (
              <span>Start: <span className="font-semibold text-foreground">{formatDate(sub.start_date)}</span></span>
            ) : isGroupSub ? (
              <span>{isTeamMemberOnly ? "Since" : "Start"}: <span className="font-semibold text-foreground">{formatDate(sub.start_date)}</span></span>
            ) : (
              <span>Next billing: <span className="font-semibold text-foreground">{nextBillingDisplay}</span></span>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-secondary/20 p-3 md:p-4 flex items-center justify-between border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 md:h-8 text-xs font-semibold rounded-lg px-2 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowQR(true);
            }}
          >
            <QrCode className="h-4 w-4 mr-1.5" /> Show Pass
          </Button>
          
          <div className="flex gap-2">
            {!isGroupSub && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 md:h-8 text-[10px] md:text-xs font-semibold rounded-lg px-2.5 md:px-3 bg-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInvoice(true);
                  }}
                >
                  Invoice
                </Button>
                {(!validity.isValid || validity.label === "Expiring Soon") && (
                  <Button
                    size="sm"
                    className="h-7 md:h-8 text-[10px] md:text-xs font-bold rounded-lg px-3 md:px-4 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRenew(true);
                    }}
                  >
                    Renew
                  </Button>
                )}
              </>
            )}
            {isExplicitlyLinked && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 md:h-8 text-[10px] md:text-xs font-semibold rounded-lg px-2.5 md:px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 bg-card"
                onClick={handleUnlink}
                disabled={isUnlinking}
              >
                {isUnlinking ? "..." : <Unlink className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />}
                Unlink
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal — individual only */}
      {!isGroupSub && (
        <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
          <DialogContent className="max-w-sm rounded-3xl w-[90vw]">
            <DialogHeader>
              <DialogTitle>Recent Invoice</DialogTitle>
              <DialogDescription>
                {sub.plan_name} at {sub.space?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 text-sm">
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Invoice #</span>
                    <span className="font-bold font-mono text-xs">
                      {latestInvoice?.invoice_number || `INV-${sub.id.substring(0, 8).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">
                      {latestInvoice?.amount || sub.price} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(latestInvoice?.created_at || sub.start_date)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-500 font-bold capitalize">
                      {latestInvoice?.status || "paid"}
                    </span>
                  </div>
                </>
              <Button className="w-full mt-4 rounded-xl" onClick={() => setShowInvoice(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Renew Modal — individual only */}
      {!isGroupSub && (
        <Dialog open={showRenew} onOpenChange={setShowRenew}>
          <DialogContent className="max-w-sm rounded-3xl w-[90vw]">
            <DialogHeader>
              <DialogTitle>Renew Subscription</DialogTitle>
              <DialogDescription>
                You are renewing {sub.plan_name} for another {sub.billing_cycle || "period"}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-secondary/40 p-4 rounded-2xl flex justify-between items-center">
                <span className="font-medium">Total Due</span>
                <span className="text-xl font-bold text-primary">
                  {sub.price} {currency}
                </span>
              </div>
              <Button
                className="w-full h-12 rounded-xl text-base font-bold"
                onClick={handleRenew}
                disabled={isRenewing}
              >
                {isRenewing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code / Membership Validation Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-xs rounded-3xl w-[90vw]">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-center">{sub.plan_name}</DialogTitle>
            <DialogDescription className="text-center">
              {isTeamMemberOnly
                ? `Your pass at ${sub.space?.name || "the venue"}`
                : `Show this at ${sub.space?.name || "the venue"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCode
                value={qrPayload}
                size={192}
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            {isTeamMemberOnly && matchedMember && (
              <div className="w-full bg-secondary/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Your Name
                </p>
                <p className="font-bold text-sm">{matchedMember.name}</p>
                {matchedMember.membership_id && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {matchedMember.membership_id}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubscriptionsPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { subscriptions, userEmail, linkedCreds } = Route.useLoaderData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  const handleLinkSubscription = async () => {
    if (!linkInput.trim()) return;
    setIsLinking(true);
    setLinkError("");

    try {
      const isEmail = linkInput.includes("@");
      const payload = isEmail
        ? { email: linkInput.trim() }
        : { membership_id: linkInput.trim().toUpperCase() };

      await addLinkedGroupSubscription({ data: payload });
      await router.invalidate();

      setShowAddModal(false);
      setLinkInput("");
    } catch (e: any) {
      setLinkError(e.message || "Failed to link subscription");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="bg-background text-foreground pb-6 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Subscriptions</h1>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Manage Plans</h2>
            <p className="text-muted-foreground text-sm">
              View and manage your active subscriptions, long-term rentals, and passes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub: any) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                userEmail={userEmail}
                linkedCreds={linkedCreds || []}
              />
            ))
          ) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border/60">
              <p className="text-muted-foreground text-sm font-medium">
                You have no active subscriptions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button className="rounded-full" onClick={() => navigate({ to: "/venues" })}>
                  Browse Spaces
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowAddModal(true)}
                >
                  Link a Pass
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Subscription Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-sm rounded-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Link a Pass</DialogTitle>
            <DialogDescription>
              Enter your email or Membership ID to link a company or group subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold px-1">Email or Membership ID</label>
              <Input
                placeholder="e.g. 202611ABCDEF or me@company.com"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="h-12 rounded-xl"
              />
              {linkError && <p className="text-xs text-red-500 px-1">{linkError}</p>}
            </div>
            <Button
              className="w-full h-12 rounded-xl font-bold"
              onClick={handleLinkSubscription}
              disabled={isLinking || !linkInput.trim()}
            >
              {isLinking ? "Linking..." : "Link Subscription"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
