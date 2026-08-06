import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, QrCode, Users, User, Calendar, CreditCard } from "lucide-react";
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

  // Data Mapping
  const cover = sub.space?.cover_url || "/venues.png";
  const title = sub.plan_name || "Membership";
  const venue = sub.space?.name || "Agatike Space";
  const currency = sub.space?.workspace?.currency || sub.space?.currency || "RWF";
  const price = new Intl.NumberFormat("en-RW", { style: "currency", currency }).format(
    sub.price || 0,
  );
  const type = sub.billing_cycle || "month";
  const status = sub.status || "Active";
  const isTeam = sub.booking_type === "group";
  const nextBilling = sub.next_billing_date
    ? new Date(sub.next_billing_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
  const startDate = sub.start_date
    ? new Date(sub.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <>
      {/* Mobile Design (Default) vs Desktop Design (md:) */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-primary/40 hover:shadow-md md:rounded-[20px]">
        {/* Top Cover Section - Desktop specific styling */}
        <div className="relative h-20 md:h-28 w-full">
          <img src={cover} alt={venue} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div>
              <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md">
                {title}
              </p>
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5 md:text-sm">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" /> {venue}
              </p>
            </div>
            <span
              className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm backdrop-blur-sm ${
                isExpiring ? "bg-amber-500/80 text-white" : "bg-green-500/80 text-white"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <Link
          to={`/profile/subscriptions/${sub.id}`}
          className="p-3 md:p-4 flex flex-col gap-3 cursor-pointer hover:bg-secondary/20 transition-colors"
        >
          {/* Price & Type */}
          <div className="flex justify-between items-center">
            <div className="text-sm md:text-base font-bold text-primary">
              {price}{" "}
              <span className="text-muted-foreground font-normal text-xs md:text-sm">/ {type}</span>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
              {isTeam ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isTeam ? "Team Plan" : "Personal"}
            </div>
          </div>

          {/* Desktop Only Extra Info Grid */}
          <div className="hidden md:grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Started On
              </p>
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> {startDate}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Next Billing
              </p>
              <p className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                <CreditCard className="h-3 w-3 text-primary" /> {nextBilling}
              </p>
            </div>
          </div>

          {/* Mobile Only Next Billing */}
          <div className="md:hidden pt-2 border-t border-border/40 text-xs flex justify-between items-center">
            <span className="text-muted-foreground">Next billing:</span>
            <span className="font-semibold">{nextBilling}</span>
          </div>
        </Link>

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
            <Button
              variant="outline"
              size="sm"
              className="h-7 md:h-8 text-xs font-semibold rounded-lg px-3 bg-card"
              onClick={(e) => {
                e.stopPropagation();
                setShowInvoice(true);
              }}
            >
              Invoice
            </Button>
            <Button
              size="sm"
              className="h-7 md:h-8 text-xs font-bold rounded-lg px-4 shadow-sm"
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
              {title} at {venue}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold">{price}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{startDate}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-500 font-bold">Paid</span>
            </div>
            <Button
              className="w-full mt-4 rounded-xl font-bold"
              onClick={() => setShowInvoice(false)}
            >
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
            <DialogDescription>
              You are renewing {title} for another {type}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-secondary/40 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-medium">Total Due</span>
              <span className="text-xl font-bold text-primary">{price}</span>
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
        <DialogContent className="max-w-xs rounded-3xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-center">{title}</DialogTitle>
            <DialogDescription className="text-center">Show this at {venue}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <p className="text-xs text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-md">
              ID: {(sub.id || "MEMB").substring(0, 8).toUpperCase()}-X9
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
