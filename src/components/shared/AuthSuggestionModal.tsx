import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Ticket, Zap, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

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

  const isMobile = useMediaQuery("(max-width: 1023px)");

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-none w-screen h-[100dvh] m-0 p-0 rounded-none border-none bg-white [&>button]:hidden flex flex-col">
          {/* Top half: Orange with Hero Image */}
          <div className="relative h-[55dvh] w-full bg-[#F2571D] rounded-b-[40px] overflow-hidden flex items-center justify-center p-6 shadow-sm">
            <div className="absolute inset-0 opacity-20 pointer-events-none"></div>
            <img
              src="/assets/hero-event.jpg"
              alt="Event Culture"
              className="w-full h-full object-cover absolute inset-0 mix-blend-overlay opacity-60"
            />
            <div className="relative z-10 animate-in fade-in zoom-in duration-700">
              <img
                src="/icon.svg"
                alt="Agatike"
                className="h-28 w-28 object-contain brightness-0 invert mx-auto drop-shadow-xl"
              />
            </div>
          </div>

          {/* Bottom half: Content and Action */}
          <div className="flex flex-1 flex-col px-8 py-10 justify-between">
            <div className="space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-150">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Experience the best events.
              </h2>
              <p className="text-base text-muted-foreground pr-4">
                More than tracking, transform your nights into unforgettable memories.
              </p>
            </div>

            <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 mb-6 space-y-3">
              <Button
                onClick={handleSignIn}
                className="w-full h-14 rounded-full bg-[#F2571D] hover:bg-[#d64c18] text-white text-lg font-semibold shadow-lg shadow-[#F2571D]/30"
              >
                Log in
              </Button>
              <Button
                onClick={handleSignUp}
                variant="outline"
                className="w-full h-14 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 text-lg font-semibold"
              >
                Create account
              </Button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onSkip();
                }}
                className="w-full text-center py-3 text-sm font-medium text-muted-foreground hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
              >
                Skip and checkout as guest
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              <p className="text-xs text-muted-foreground">
                Keep tickets safely stored in your dashboard and wallet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/20">
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Faster Future Checkout</h4>
              <p className="text-xs text-muted-foreground">
                Pre-fill phone number, name, and email details next time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/20">
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Manage Bookings & Refunds</h4>
              <p className="text-xs text-muted-foreground">
                Easy support access, transaction records, and cancellations.
              </p>
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
