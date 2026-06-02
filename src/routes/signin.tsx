import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Apple, ArrowLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/api/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
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
      navigate({ to: "/" });
    } catch (err: any) {
      const message = err?.message || "Invalid email or password";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-[calc(100vh-4rem)] lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6 lg:py-10">
        {/* Visual Header */}
        <div className="relative h-[35vh] w-full shrink-0 lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          <div className="absolute bottom-8 left-6 right-6 lg:bottom-0 lg:left-0 lg:right-0 lg:p-10 lg:text-white">
            <p className="text-xs font-medium text-white/90 lg:text-sm lg:opacity-80">
              Africa's premium platform
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
            <div className="hidden lg:flex items-center gap-2">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                A
              </div>
              <span className="text-lg font-semibold">Agatike</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight lg:mt-6">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to keep the culture moving.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button variant="outline" type="button" className="rounded-xl">
                <span className="mr-2 inline-block h-4 w-4 rounded-full bg-[conic-gradient(at_50%_50%,#ea4335,#fbbc05,#34a853,#4285f4)]" />
                Google
              </Button>
              <Button variant="outline" type="button" className="rounded-xl">
                <Apple className="mr-2 h-4 w-4" /> Apple
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
