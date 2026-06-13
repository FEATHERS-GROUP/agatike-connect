import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { updateUserOnboarding } from "@/api/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight, RefreshCw } from "lucide-react";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Onboarding — Agatike" }],
  }),
  component: OnboardingPage,
});

const AVATAR_STYLES = ["micah", "avataaars", "bottts", "lorelei", "adventurer", "fun-emoji"];
const INTEREST_OPTIONS = [
  "Events",
  "Entertainment",
  "Experiences",
  "Music",
  "Sports",
  "Cinema",
  "Conferences",
  "Tech",
  "Art",
  "Food",
  "Fashion",
  "Gaming",
  "Business",
  "Health",
  "Education",
  "Bus Booking",
  "Travel & Transport",
  "Gym & Fitness",
  "Wellness",
  "Office Spaces",
  "Coworking",
  "Venue Booking",
  "Nightlife & Parties",
  "Networking",
  "Workshops",
  "Retreats",
  "Exhibitions & Expos",
  "Comedy",
  "Theater & Arts",
  "Festivals",
  "Pop-ups & Markets",
  "Real Estate",
  "Outdoors & Adventure",
  "Photography",
  "Startups",
];

function OnboardingPage() {
  const { user, isLoggedIn, isLoading: authLoading, refresh } = useUserAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("micah");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const generatedAvatars = Array.from({ length: 30 }).map(
    (_, i) => `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}_${i}`,
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
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
      const finalAvatar = selectedAvatar || generatedAvatars[0];
      await updateUserOnboarding({
        data: { interests: selectedInterests, profile: finalAvatar },
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

                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.some((i) => {
                      if (typeof i !== "string") return false;
                      const d = i.toLowerCase();
                      const o = interest.toLowerCase();
                      return d === o || d + "s" === o || d === o + "s";
                    });

                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 border-transparent"
                        } border`}
                      >
                        {interest}
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
                      src={selectedAvatar || generatedAvatars[0]}
                      alt="Selected profile"
                      className="h-32 w-32 rounded-full border-4 border-background bg-card shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-2 text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize transition-colors ${selectedStyle === style ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[250px] overflow-y-auto p-1">
                  {generatedAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all active:scale-95 ${
                        selectedAvatar === url
                          ? "border-primary shadow-sm"
                          : "border-border/40 opacity-70 hover:opacity-100 hover:border-primary/50"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="h-full w-full bg-card" />
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setSeed(Math.random().toString(36).substring(7))}
                  className="w-full rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Generate More
                </Button>

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
