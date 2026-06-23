import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Apple, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, googleAuthUser } from "@/api/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
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
  const { refresh } = useUserAuth();
  const [showPw, setShowPw] = useState(false);
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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-screen lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6 lg:py-10">
        {/* Visual Header */}
        <div className="relative h-[35vh] w-full shrink-0 lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          <div className="absolute bottom-8 left-6 right-6 lg:bottom-0 lg:left-0 lg:right-0 lg:p-10 lg:text-white">
            <p className="text-xs font-medium text-white/90 lg:text-sm lg:opacity-80">
              The premium platform
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-white lg:mt-2 lg:text-3xl">
              Where the culture meets the calendar.
            </h2>
            <p className="hidden mt-3 text-sm opacity-80 lg:block">
              Sign in to save events, follow organizers and unlock VIP drops.
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
            <h1 className="text-2xl font-semibold tracking-tight lg:mt-6 lg:text-center">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground lg:text-center">
              Sign in to keep the culture moving.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="h-11 rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium"
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
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-11 rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.22-3.41 1.95-2.88 6.55.33 7.82-.76 1.83-1.6 3.02-2.65 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email{" "}
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agatike.com"
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-pw">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signin-pw"
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
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

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to Agatike?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-auto pt-6 text-center text-xs text-muted-foreground lg:mt-4 lg:pt-0">
            By continuing you agree to our{" "}
            <Link to="/" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/" className="underline">
              Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
