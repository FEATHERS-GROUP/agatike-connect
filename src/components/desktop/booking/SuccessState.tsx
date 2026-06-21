import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
  eventTitle: string;
  recipientEmail?: string;
}

export function SuccessState({ eventTitle, recipientEmail }: SuccessStateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
      <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
        Your tickets for {eventTitle} have been secured. We've sent them to {recipientEmail}.
      </p>
      <p className="text-sm text-muted-foreground animate-pulse">
        Redirecting to event details...
      </p>
    </div>
  );
}
