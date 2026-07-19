import { CheckCircle2, Package, Smartphone, QrCode } from "lucide-react";

interface SuccessStateProps {
  eventTitle: string;
  recipientEmail?: string;
  hasMerch?: boolean;
}

export function SuccessState({ eventTitle, recipientEmail, hasMerch }: SuccessStateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
      <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
        Your tickets for {eventTitle} have been secured. We've sent them to {recipientEmail}.
      </p>

      {hasMerch && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 max-w-md w-full mb-8 text-left shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Merchandise Order</p>
              <p className="text-xs text-muted-foreground">Pickup instructions</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your merchandise can be picked up <strong className="text-foreground">on the day of the event</strong>. 
            Please collect it at the merchandise desk using either of the methods below:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-secondary/30 rounded-xl p-3 border border-border/50">
              <Smartphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Phone Number Pickup</p>
                <p className="text-xs text-muted-foreground">
                  Show your registered phone number at the merchandise desk for pickup.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-secondary/30 rounded-xl p-3 border border-border/50">
              <QrCode className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Ticket QR Scan Pickup</p>
                <p className="text-xs text-muted-foreground">
                  Show your event ticket QR code — staff will scan it and hand you your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground animate-pulse">Redirecting to event details...</p>
    </div>
  );
}
