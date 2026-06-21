import React, { useState } from "react";
import { MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function SubscriptionCard({ sub }: { sub: any }) {
  const isExpiring = sub.status === "Expiring Soon";
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
        <div
          className="flex gap-3 p-3 border-b border-border/40 cursor-pointer hover:bg-secondary/20 transition-colors"
          onClick={() => setShowQR(true)}
        >
          <img
            src={sub.cover}
            alt={sub.title}
            className="w-16 h-16 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{sub.title}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isExpiring ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {sub.venue}
              </p>
            </div>
            <div className="text-xs font-semibold text-primary mt-1">
              {sub.price} <span className="text-muted-foreground font-normal">/ {sub.type}</span>
            </div>
          </div>
        </div>
        <div className="bg-secondary/20 p-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Next billing: <span className="font-semibold text-foreground">{sub.nextBilling}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg px-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowInvoice(true);
              }}
            >
              Invoice
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs rounded-lg px-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
        <DialogContent className="max-w-sm rounded-3xl">
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
        <DialogContent className="max-w-sm rounded-3xl">
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
                // mock success toast here normally
              }}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Scan Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-xs rounded-3xl">
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
