import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Ticket, Zap, Clock, ShieldCheck, ArrowRight } from "lucide-react";

interface AuthSuggestionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: () => void;
  redirectPath?: string;
}

export function AuthSuggestionModal({
  isOpen,
  onOpenChange,
  onSkip,
  redirectPath,
}: AuthSuggestionModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    const destination = redirectPath || window.location.pathname + window.location.search;
    navigate({
      to: "/signin",
      search: { redirect: destination } as any,
    });
  };

  const handleSignUp = () => {
    onOpenChange(false);
    const destination = redirectPath || window.location.pathname + window.location.search;
    navigate({
      to: "/signup",
      search: { redirect: destination } as any,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl p-6 border border-white/10 dark:border-white/5 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Ticket className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            Book Faster & Save Tickets
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm max-w-[320px] mx-auto">
            Create an account in seconds to unlock the full Agatike experience.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="my-6 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/20">
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Access Tickets Offline</h4>
              <p className="text-xs text-muted-foreground">Keep tickets safely stored in your dashboard and wallet.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/20">
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Faster Future Checkout</h4>
              <p className="text-xs text-muted-foreground">Pre-fill phone number, name, and email details next time.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/20">
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Manage Bookings & Refunds</h4>
              <p className="text-xs text-muted-foreground">Easy support access, transaction records, and cancellations.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSignUp}
            className="w-full h-12 rounded-xl text-base font-bold shadow-[var(--shadow-glow)] transition-all hover:scale-[1.01]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Create Account
          </Button>

          <Button
            variant="outline"
            onClick={handleSignIn}
            className="w-full h-12 rounded-xl text-base font-semibold border-border hover:bg-secondary/50"
          >
            Log in to existing account
          </Button>

          <button
            onClick={() => {
              onOpenChange(false);
              onSkip();
            }}
            className="w-full text-center py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mt-1"
          >
            Skip and checkout as guest
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
