import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Apple, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, googleAuthUser } from "@/api/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { useMediaQuery } from "@mantine/hooks";
import { MobileLoginFlow } from "@/components/mobile/MobileLoginFlow";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Agatike" },
      {
        name: "description",
        content: "Sign in to discover events, save tickets and follow organizers.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const router = useRouter();
  const { refresh, isLoggedIn, isLoading: authLoading } = useUserAuth();
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate({ to: "/", replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginUser({ data: { email, password } } as any);
      toast.success("Welcome back!");
      await refresh();
      await router.invalidate();

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect");

      if (redirectUrl) {
        navigate({ to: redirectUrl as any });
      } else {
        navigate({ to: typeof window !== "undefined" && window.innerWidth < 768 ? "/" : "/feed" });
      }
    } catch (err: any) {
      const message = err?.message || "Invalid email or password";
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
        toast.success("Welcome back!");
        await refresh();
        await router.invalidate();

        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect");

        if (redirectUrl) {
          navigate({ to: redirectUrl as any });
        } else {
          navigate({
            to: typeof window !== "undefined" && window.innerWidth < 768 ? "/" : "/feed",
          });
        }
      } catch (err: any) {
        const message = err?.message || "Google Login Failed";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Login Failed");
    },
  });

  const isMobile = useMediaQuery("(max-width: 1023px)");

  // Mobile View
  if (isMobile) {
    return (
      <MobileLoginFlow
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={onSubmit}
        googleLogin={googleLogin}
        showPw={showPw}
        setShowPw={setShowPw}
      />
    );
  }

  // Desktop View
  return (
    <div className="hidden lg:flex min-h-screen w-full bg-slate-50 p-4 xl:p-6">
      <div className="flex w-full overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-2xl">
        {/* Left Panel */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-black p-12 text-white lg:flex xl:w-5/12">
          {/* Abstract Image Background */}
          <img
            src={hero}
            alt="Live event"
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

          <div className="relative z-10 flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
            THE PREMIUM PLATFORM
            <div className="h-px w-12 bg-white/50" />
          </div>

          <div className="relative z-10 mt-auto">
            <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Where <br /> Culture Meets <br /> The Calendar
            </h2>
            <p className="mt-6 max-w-sm text-sm font-medium leading-relaxed text-white/70">
              Sign in to save events, follow your favorite organizers, and unlock exclusive VIP
              drops.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24 xl:px-32">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-10 flex justify-center items-center gap-2">
              <img src="/icon.svg" alt="Agatike" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold tracking-tight">Agatike</span>
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
              <p className="mt-3 text-sm text-slate-500">
                Enter your email and password to access your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="signin-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-base placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-pw" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signin-pw"
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-0 bg-slate-50 pl-4 pr-12 text-base placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-xs font-medium text-slate-600 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  Forgot Password
                </Link>
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive mt-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-6 h-12 w-full rounded-xl text-base font-semibold shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with Google
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.22-3.41 1.95-2.88 6.55.33 7.82-.76 1.83-1.6 3.02-2.65 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Sign In with Apple
              </Button>
            </div>
          </div>

          <div className="mt-20 flex justify-center text-sm font-medium text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="ml-1 text-slate-900 font-semibold hover:text-primary transition-colors hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
