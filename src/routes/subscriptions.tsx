import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const mockSubscriptions = [
  {
    id: "sub_1",
    title: "Premium Gym Access",
    venue: "Fit & Flex Center",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-14",
    price: "$50.00",
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_2",
    title: "Gold Swimming Session",
    venue: "Aqua Oasis",
    type: "Monthly",
    status: "Expiring Soon",
    nextBilling: "2026-06-20",
    price: "$30.00",
    cover:
      "https://images.unsplash.com/photo-1519315901367-f34f9274ceb3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_3",
    title: "Dedicated Workspace",
    venue: "Kigali Tech Hub",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-01",
    price: "$150.00",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop",
  },
];

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});

/* ─── Subscription Card ─── */
function SubscriptionCard({ sub }: { sub: any }) {
  const isExpiring = sub.status === "Expiring Soon";
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col mb-4">
        <div
          className="flex gap-3 p-3 border-b border-border/40 cursor-pointer hover:bg-secondary/20 transition-colors"
          onClick={() => setShowQR(true)}
        >
          <img
            src={sub.cover}
            alt={sub.title}
            className="w-16 h-16 object-cover rounded-2xl shrink-0"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex justify-between items-start mb-0.5">
                <p className="font-bold text-sm leading-tight">{sub.title}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap inline-block mb-1 ${isExpiring ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}
              >
                {sub.status}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {sub.venue}
              </p>
            </div>
            <div className="text-xs font-bold text-primary mt-1.5">
              {sub.price}{" "}
              <span className="text-muted-foreground font-normal text-[10px]">/ {sub.type}</span>
            </div>
          </div>
        </div>
        <div className="bg-secondary/20 p-3 flex flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Next billing: <span className="font-bold text-foreground">{sub.nextBilling}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold rounded-xl px-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowInvoice(true);
              }}
            >
              Invoice
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold rounded-xl px-3 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                setShowRenew(true);
              }}
            >
              Renew
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-sm rounded-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Recent Invoice</DialogTitle>
            <DialogDescription>
              {sub.title} at {sub.venue}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold">{sub.price}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">14 May 2026</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-500 font-bold">Paid</span>
            </div>
            <Button className="w-full mt-4 rounded-xl" onClick={() => setShowInvoice(false)}>
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-sm rounded-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>You are renewing {sub.title} for another month.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-secondary/40 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-medium">Total Due</span>
              <span className="text-xl font-bold text-primary">{sub.price}</span>
            </div>
            <Button
              className="w-full h-12 rounded-xl text-base font-bold"
              onClick={() => {
                setShowRenew(false);
              }}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Scan Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-xs rounded-3xl w-[90vw]">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-center">{sub.title}</DialogTitle>
            <DialogDescription className="text-center">Show this at {sub.venue}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {sub.id.toUpperCase()}-X9</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubscriptionsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg tracking-tight">Subscriptions</h1>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Manage Plans</h2>
          <p className="text-muted-foreground text-sm">
            View and manage your active subscriptions, long-term rentals, and passes.
          </p>
        </div>

        <div className="space-y-4">
          {mockSubscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} />
          ))}
        </div>
      </main>
    </div>
  );
}
