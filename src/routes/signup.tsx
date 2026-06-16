import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signupUser, sendSignupOtp, googleAuthUser } from "@/api/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Agatike" },
      {
        name: "description",
        content: "Create an account to discover events, save tickets and follow organizers.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const router = useRouter();
  const { refresh } = useUserAuth();

  const [step, setStep] = useState(0); // 0: Method, 1: Details
  const [showPw, setShowPw] = useState(false);
  
  // Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // OTP Verification
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpStep) {
      if (!name || !email || !password) {
        setError("Please fill out all fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!agreed) {
        setError("You must agree to the Terms and Privacy Policy.");
        return;
      }

      setIsLoading(true);
      try {
        const result = await sendSignupOtp({ data: { email } } as any);
        if (result.success && result.token) {
          setOtpToken(result.token);
          setOtpStep(true);
          toast.success("Verification code sent to your email!");
        }
      } catch (err: any) {
        const message = err?.message || "Failed to send verification code. Please try again.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // OTP Step Submission
    if (otpInput.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);

    try {
      await signupUser({
        data: {
          username: name,
          email,
          password,
          agreed_to_terms: agreed,
          otpToken,
          otp: otpInput,
        },
      } as any);
      toast.success("Account created! Let's set up your profile.");
      await refresh();
      await router.invalidate();
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      const message = err?.message || "Could not create account. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setIsLoading(true);
      setError("");
      try {
        await googleAuthUser({ data: { code } } as any);
        toast.success("Account ready! Let's personalize your experience.");
        await refresh();
        await router.invalidate();
        navigate({ to: "/onboarding" });
      } catch (err: any) {
        const message = err?.message || "Google Signup Failed";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Signup Failed");
    },
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-screen lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6 lg:py-10">
        {/* Visual Header */}
        <div className="relative h-[25vh] w-full shrink-0 lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          <div className="absolute bottom-8 left-6 right-6 lg:bottom-0 lg:left-0 lg:right-0 lg:p-10 lg:text-white">
            <p className="text-xs font-medium text-white/90 lg:text-sm lg:opacity-80">
              The premium platform
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-white lg:mt-2 lg:text-3xl">
              Join the movement.
            </h2>
            <p className="hidden mt-3 text-sm opacity-80 lg:block">
              Create an account to save events, follow organizers and unlock VIP drops.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-background px-6 pb-12 pt-8 lg:-mt-0 lg:mx-auto lg:w-full lg:max-w-md lg:rounded-none lg:bg-transparent lg:p-0">
          {/* Mobile Handle */}
          <div className="absolute left-1/2 top-3 h-1 w-12 -translate-x-1/2 rounded-full bg-border lg:hidden" />

          <div className="lg:rounded-3xl lg:border lg:border-border/60 lg:bg-card lg:p-8 lg:shadow-[var(--shadow-card)]">
            <div className="hidden lg:flex justify-center">
              <img src="/icon.svg" alt="Agatike" className="h-12 w-12 object-contain" />
            </div>
            
            <div className="flex items-center justify-between lg:mt-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                {otpStep ? "Verify email" : step === 0 ? "Create your account" : "Your details"}
              </h1>
            </div>
            
            <p className="mt-1 text-sm text-muted-foreground">
              {otpStep 
                ? "Almost there! Let's verify your email." 
                : step === 0 
                  ? "Join thousands discovering events worldwide."
                  : "We need just a few details to get you started."
              }
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              {otpStep ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="signup-otp">Verification Code</Label>
                    <Input
                      id="signup-otp"
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="000000"
                      className="text-center text-xl tracking-widest h-12"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 rounded-xl"
                      onClick={() => {
                        setOtpStep(false);
                        setOtpInput("");
                        setError("");
                      }}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="h-11 flex-1 rounded-xl shadow-[var(--shadow-glow)]"
                      style={{ background: "var(--gradient-primary)" }}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Create"}
                    </Button>
                  </div>
                </div>
              ) : step === 0 ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 mt-6">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => googleLogin()}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium flex justify-center items-center"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {isLoading ? "Signing up..." : "Sign up with Google"}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="h-12 w-full rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium flex justify-center items-center"
                    >
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.22-3.41 1.95-2.88 6.55.33 7.82-.76 1.83-1.6 3.02-2.65 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Sign up with Apple
                    </Button>
                  </div>

                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    className="h-12 w-full rounded-xl shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Create account with Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 mt-6">
                  <div>
                    <Label htmlFor="signup-name">Full name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Amaka Okafor"
                        className="pl-9 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@agatike.com"
                        className="pl-9 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-pw">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-pw"
                        required
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pl-9 pr-10 h-11"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 py-2">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs leading-snug text-muted-foreground">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        target="_blank"
                        className="underline text-primary hover:text-primary/80"
                      >
                        Terms
                      </Link>
                      ,{" "}
                      <Link
                        to="/privacy"
                        target="_blank"
                        className="underline text-primary hover:text-primary/80"
                      >
                        Privacy Policy
                      </Link>
                      , and to provide valid identification for verification.
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="h-11 flex-1 rounded-xl"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="h-11 flex-[2] rounded-xl shadow-[var(--shadow-glow)]"
                      style={{ background: "var(--gradient-primary)" }}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign up"}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
