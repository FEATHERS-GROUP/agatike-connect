import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { updateUserOnboarding } from "@/api/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight, RefreshCw, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/lib/countries";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split("T")[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal Details
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [phone, setPhone] = useState<string | undefined>("");

  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3: Avatar
  const [selectedStyle, setSelectedStyle] = useState("micah");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  // Performance: Generate only 8 avatars initially
  const generatedAvatars = Array.from({ length: 8 }).map(
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

  const handleNextStep1 = () => {
    if (!dateOfBirth || !gender || !phone) {
      toast.error("Please complete your personal details.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest!");
      return;
    }
    setStep(3);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const parsed = parsePhoneNumber(phone || "");
      const countryName = COUNTRIES.find((c) => c.code === parsed?.country)?.name || "Unknown";

      const finalAvatar = selectedAvatar || generatedAvatars[0];

      await updateUserOnboarding({
        data: {
          interests: selectedInterests,
          profile: finalAvatar,
          dateOfBirth,
          gender,
          phone,
          country: countryName,
        },
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Clean White Card Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-[2rem] border border-slate-200/60 bg-white p-8 sm:p-12 shadow-2xl overflow-hidden">
        
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center items-center gap-2">
          <img src="/icon.svg" alt="Agatike" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">Agatike</span>
        </div>

        {/* Animated Progress Bars */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${
                step >= s ? "bg-primary shadow-[0_0_12px_rgba(242,87,29,0.3)]" : "bg-slate-100"
              }`}
            />
          ))}
        </div>

        <div className="w-full">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Welcome, {user?.username?.split(" ")[0]}!
                </h1>
                <p className="text-base text-slate-500 max-w-md mx-auto">
                  Let's finish setting up your profile. This helps us personalize your experience.
                </p>
              </div>

              <div className="space-y-5 max-w-md mx-auto">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-dob" className="text-sm font-medium text-slate-700">
                      Date of Birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="onboarding-dob"
                        type="date"
                        required
                        max={maxDateString}
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        onClick={(e) => {
                          if (typeof e.currentTarget.showPicker === "function") {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="pl-10 h-12 w-full rounded-xl border-0 bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-gender" className="text-sm font-medium text-slate-700">
                      Gender
                    </Label>
                    <select
                      id="onboarding-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-12 w-full rounded-xl border-0 bg-slate-50 px-3 text-slate-900 shadow-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="onboarding-phone" className="text-sm font-medium text-slate-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <PhoneInput
                      id="onboarding-phone"
                      international
                      defaultCountry="RW"
                      limitMaxLength
                      value={phone}
                      onChange={setPhone}
                      className="flex h-12 w-full rounded-xl border-0 bg-slate-50 px-3 text-slate-900 shadow-sm focus-within:ring-1 focus-within:ring-primary transition-all"
                      numberInputProps={{
                        className:
                          "flex-1 bg-transparent border-none outline-none focus:ring-0 text-base ml-3 text-slate-900 placeholder:text-slate-400",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 max-w-md mx-auto">
                <Button
                  onClick={handleNextStep1}
                  disabled={!dateOfBirth || !gender || !phone}
                  className="h-14 w-full rounded-xl text-lg font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  What are you into?
                </h1>
                <p className="text-base text-slate-500 max-w-lg mx-auto">
                  Select the categories you love. We'll use these to recommend events, drops, and organizers just for you.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center py-4">
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
                      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                        isSelected
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(242,87,29,0.3)] scale-[1.02]"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4 max-w-md mx-auto">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-14 flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep2}
                  disabled={selectedInterests.length === 0}
                  className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Pick your avatar
                </h1>
                <p className="text-base text-slate-500 max-w-md mx-auto">
                  Choose how you want to be seen on Agatike.
                </p>
              </div>

              <div className="flex justify-center py-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                  <img
                    src={selectedAvatar || generatedAvatars[0]}
                    alt="Selected profile"
                    className="relative h-40 w-40 rounded-full border-[6px] border-slate-50 bg-white shadow-xl object-cover"
                  />
                  <div className="absolute bottom-1 right-1 rounded-full bg-primary p-2.5 text-white shadow-lg border-2 border-white">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-2 justify-start sm:justify-center">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`text-sm px-4 py-2 rounded-full whitespace-nowrap capitalize transition-colors ${
                        selectedStyle === style
                          ? "bg-primary text-white font-semibold shadow-[0_0_10px_rgba(242,87,29,0.3)]"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-3 p-2">
                  {generatedAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                        selectedAvatar === url
                          ? "border-primary shadow-[0_0_15px_rgba(242,87,29,0.2)] scale-105 z-10"
                          : "border-transparent bg-slate-50 opacity-60 hover:opacity-100 hover:bg-slate-100"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="h-full w-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSeed(Math.random().toString(36).substring(7))}
                  className="w-full rounded-xl h-12 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Generate New Avatars
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="h-14 flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finish setup"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
