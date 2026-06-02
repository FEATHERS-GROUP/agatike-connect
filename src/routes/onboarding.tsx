import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { updateUserOnboarding } from "@/api/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Music,
  Ticket,
  Map,
  Trophy,
  Check,
  ArrowRight,
  Coffee,
  Palette,
} from "lucide-react";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Onboarding — Agatike" }],
  }),
  component: OnboardingPage,
});

const INTERESTS = [
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Music,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500",
  },
  {
    id: "event",
    label: "Events",
    icon: Ticket,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
  {
    id: "experience",
    label: "Experiences",
    icon: Map,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500",
  },
  {
    id: "sport",
    label: "Sports",
    icon: Trophy,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500",
  },
];

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryleigh&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly&backgroundColor=ffdfbf",
];

function OnboardingPage() {
  const { user, isLoggedIn, isLoading: authLoading, refresh } = useUserAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to signin if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate({ to: "/signin", replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest!");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserOnboarding({
        data: { interests: selectedInterests, profile: selectedAvatar },
      } as any);

      toast.success("Profile complete! Welcome to Agatike.");
      await refresh();
      await router.invalidate();
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error("Failed to save your preferences. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-screen lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6">
        {/* Visual Header (Desktop only) */}
        <div className="hidden relative h-full w-full shrink-0 lg:flex lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <h2 className="text-3xl font-semibold leading-tight">Curate your vibe.</h2>
            <p className="mt-3 text-sm opacity-80">
              Tell us what you love, and we'll bring the culture directly to your feed.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative flex flex-1 flex-col px-6 py-12 lg:mx-auto lg:w-full lg:max-w-md lg:p-0">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div
              className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`}
            />
          </div>

          <div className="flex-1 animate-fade-in">
            {step === 1 ? (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">What are you into?</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select the categories you love. We'll use these to recommend events and
                    organizers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    const Icon = interest.icon;

                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 p-6 transition-all active:scale-95 ${
                          isSelected
                            ? `border-primary ${interest.bg}`
                            : "border-border/40 bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className={`rounded-full p-3 ${interest.bg}`}>
                          <Icon className={`h-6 w-6 ${interest.color}`} />
                        </div>
                        <span className={`font-semibold ${isSelected ? "text-primary" : ""}`}>
                          {interest.label}
                        </span>

                        {isSelected && (
                          <div className="absolute right-3 top-3 rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={selectedInterests.length === 0}
                  className="mt-8 h-12 w-full rounded-xl text-base font-bold shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Pick an avatar</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose how you want to be seen on Agatike.
                  </p>
                </div>

                <div className="flex justify-center py-6">
                  <div className="relative">
                    <img
                      src={selectedAvatar}
                      alt="Selected profile"
                      className="h-32 w-32 rounded-full border-4 border-background bg-card shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-2 text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all active:scale-95 ${
                        selectedAvatar === avatar
                          ? "border-primary"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={avatar} alt={`Avatar ${idx}`} className="h-full w-full bg-card" />
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 flex-1 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="h-12 flex-1 rounded-xl shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finish setup"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
