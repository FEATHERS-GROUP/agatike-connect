import React, { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { createSessionBooking } from "@/api/space_classes";
import { sendTicketsEmail } from "@/api/email";
import { generateFallbackReceipt } from "@/lib/pdf-receipt";
import { Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";


interface SessionBookingModalProps {
  session: any | null;
  space: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionBookingModal({ session, space, user, isOpen, onClose }: SessionBookingModalProps) {
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("MTN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bookMutation = useMutation({
    mutationFn: async ({ fee_charged, payment_status }: { fee_charged: number, payment_status: string }) => {
      const bookingRef = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const newBooking = await createSessionBooking({
        data: {
          object: {
            session_id: session.id,
            customer_id: user?.id,
            customer_name: user?.name || user?.email || "Customer",
            fee_charged,
            billing_status: payment_status,
            status: "confirmed"
          }
        }
      });

      const ticketObj = {
        name: session.class?.name || "Class Session",
        price: fee_charged,
        currency: space?.workspace?.currency || space?.currency || "RWF",
        booking_ref: bookingRef,
      };

      const fallbackPdf = await generateFallbackReceipt({
        entityName: space?.name || "Space",
        ticket: ticketObj,
        bookingRef,
        customerName: user?.name || user?.email || "Customer",
        dateStr: `${format(new Date(session.start_time), "MMM dd, yyyy")} ${format(new Date(session.start_time), "HH:mm")}`
      });

      if (user?.email) {
        await sendTicketsEmail({
          data: {
            to: user.email,
            subject: `Booking Confirmed: ${session.class?.name || "Session"}`,
            eventName: space?.name || "Space",
            html: `
              <h2>Your booking is confirmed!</h2>
              <p>You have successfully booked a spot for <strong>${session.class?.name || "the session"}</strong>.</p>
              <p><strong>Date & Time:</strong> ${format(new Date(session.start_time), "MMM dd, yyyy h:mm a")}</p>
              <p><strong>Instructor:</strong> ${session.coach_name || "N/A"}</p>
              <p>Please find your ticket and receipt attached.</p>
            `,
            attachments: [fallbackPdf]
          }
        });
      }

      return newBooking;
    },
    onSuccess: () => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Booking confirmed successfully!");
      queryClient.invalidateQueries({ queryKey: ["space_sessions"] });
      setTimeout(() => {
        handleClose();
      }, 2000);
    },
    onError: (err) => {
      console.error(err);
      setIsProcessing(false);
      toast.error("Failed to book the session. Please try again.");
    }
  });

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  const handleBook = () => {
    if (!session) return;
    
    if (session.class?.is_free_with_subscription) {
      setIsProcessing(true);
      bookMutation.mutate({ fee_charged: 0, payment_status: "paid" });
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleProceedPayment = async () => {
    if (!session) return;
    setIsProcessing(true);
    setIsPaymentModalOpen(false); 
    
    bookMutation.mutate({ 
      fee_charged: session.class?.price || 0, 
      payment_status: "paid" 
    });
  };

  if (!session) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && handleClose()}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 overflow-hidden">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Spot Secured!</h2>
              <p className="text-muted-foreground">We've sent your ticket and receipt to your email.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Book Session
                </DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40">
                  <h3 className="font-bold text-lg mb-1">{session.class?.name || "Class"}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(session.start_time), "MMM d, yyyy")} • {format(new Date(session.start_time), "HH:mm")} - {format(new Date(session.end_time), "HH:mm")}</span>
                  </div>
                  {session.coach_name && (
                    <p className="text-sm font-medium">Instructor: <span className="text-foreground">{session.coach_name}</span></p>
                  )}
                </div>

                <div className="p-4 bg-background border border-border/40 rounded-2xl flex justify-between items-center shadow-sm">
                  <span className="font-semibold">Total Fee:</span>
                  {session.class?.is_free_with_subscription ? (
                    <span className="text-lg font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">Included in Plan</span>
                  ) : (
                    <span className="text-lg font-black text-foreground">
                      {(session.class?.price || 0).toLocaleString()} <span className="text-sm text-muted-foreground">{space?.workspace?.currency || space?.currency || "RWF"}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border/40 gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={handleClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl h-12 font-bold" onClick={handleBook} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : session.class?.is_free_with_subscription ? (
                    "Confirm Booking"
                  ) : (
                    `Pay & Book`
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onProceed={handleProceedPayment}
        baseAmount={session.class?.price || 0}
        baseCurrency={space?.workspace?.currency || space?.currency || "RWF"}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isProcessing={isProcessing}
        isGenerating={false}
        workspaceId={space?.workspace_id}
        itemLabel={`Booking: ${session.class?.name || "Session"}`}
      />
    </>
  );
}
