import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Apple } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Agatike" },
      { name: "description", content: "Sign in to discover events, save tickets and follow organizers." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center">
        {/* Visual */}
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img src={hero} alt="" className="h-[640px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <p className="text-sm opacity-80">Africa's premium social event platform</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">Where the culture meets the calendar.</h2>
            <p className="mt-3 text-sm opacity-80">Sign in to save events, follow organizers and unlock VIP drops.</p>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>A</div>
              <span className="text-lg font-semibold">Agatike</span>
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to keep the culture moving." : "Join thousands discovering events across Africa."}
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
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required placeholder="Amaka Okafor" className="mt-1" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agatike.com" className="pl-9" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Password</Label>
                  {mode === "signin" && <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>}
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pw" required type={showPw ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>

              {submitted && (
                <p className="rounded-xl bg-accent px-3 py-2 text-center text-xs text-accent-foreground animate-fade-in">
                  Demo mode — auth isn't wired yet. Hook this form up when Lovable Cloud is enabled.
                </p>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Agatike?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-primary hover:underline">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/" className="underline">Terms</Link> and <Link to="/" className="underline">Privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}