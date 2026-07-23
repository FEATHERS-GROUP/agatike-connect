import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hero from "@/assets/hero-event.jpg";

interface MobileLoginFlowProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  googleLogin: () => void;
  showPw: boolean;
  setShowPw: (val: boolean) => void;
}

export function MobileLoginFlow({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  error,
  onSubmit,
  googleLogin,
  showPw,
  setShowPw,
}: MobileLoginFlowProps) {
  const [screen, setScreen] = useState<"splash" | "onboarding" | "login">("splash");

  const navigate = useNavigate();
  const [touchStartY, setTouchStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto transition from splash to onboarding after 2 seconds
  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => {
        setScreen("onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 10) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY > 0) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;
      if (deltaY > 0) {
        setTranslateY(deltaY);
        // Only prevent default if we are actively pulling down
        if (deltaY > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 120) {
      navigate({ to: "/" });
    } else {
      setTranslateY(0);
    }
    setTouchStartY(0);
  };

  const pullStyles = {
    transform: `translateY(${translateY > 0 ? translateY * 0.4 : 0}px)`,
    transition: touchStartY === 0 ? "transform 0.3s ease-out" : "none",
  };

  if (screen === "splash") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F2571D] text-white">
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
          {/* App Logo or Hero placeholder for splash */}
          <img
            src="/icon.svg"
            alt="Agatike Logo"
            className="h-24 w-24 object-contain brightness-0 invert"
          />
        </div>
        <div className="pb-10">
          <h1 className="text-2xl font-bold tracking-widest text-white">Agatike</h1>
        </div>
      </div>
    );
  }

  if (screen === "onboarding") {
    return (
      <div
        ref={containerRef}
        className="flex min-h-[100dvh] flex-col bg-white"
        style={pullStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top half: Orange with Hero Image */}
        <div className="relative h-[55dvh] w-full bg-[#F2571D] rounded-b-[40px] overflow-hidden flex items-center justify-center p-6 shadow-sm">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {/* Decorative background clouds/stars can go here */}
          </div>
          <img
            src={hero}
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
              onClick={() => setScreen("login")}
              className="w-full h-14 rounded-full bg-[#F2571D] hover:bg-[#d64c18] text-white text-lg font-semibold shadow-lg shadow-[#F2571D]/30"
            >
              Log in
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-14 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 text-lg font-semibold"
            >
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div
      ref={containerRef}
      className="flex min-h-[100dvh] flex-col bg-slate-50/50 px-6 py-6 animate-in slide-in-from-right fade-in duration-300"
      style={pullStyles}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-300 rounded-full" />

      {/* Header */}
      <div className="pt-8 pb-6">
        <button
          onClick={() => setScreen("onboarding")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Log in</h1>
        <p className="text-sm text-muted-foreground">
          By logging in, you agree to our{" "}
          <Link to="/" className="font-medium text-slate-900 underline">
            Terms of Use
          </Link>
          .
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email-mobile"
              className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
            >
              Email
            </Label>
            <div className="relative">
              <Input
                id="email-mobile"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="h-14 rounded-2xl bg-white border-transparent shadow-sm px-5 text-base focus-visible:ring-1 focus-visible:ring-[#F2571D]"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="pw-mobile"
                className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
              >
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#F2571D] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="pw-mobile"
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-white border-transparent shadow-sm px-5 text-base focus-visible:ring-1 focus-visible:ring-[#F2571D] pr-12"
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
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium text-center">
            {error}
          </p>
        )}

        <div className="pt-2 pb-6">
          <Button
            type="submit"
            className="w-full h-14 rounded-full bg-[#F2571D] hover:bg-[#d64c18] text-white text-lg font-semibold shadow-lg shadow-[#F2571D]/30"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Connect"}
          </Button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50/50 px-4 text-muted-foreground font-medium">Or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => googleLogin()}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 text-base font-medium"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 text-base font-medium"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.22-3.41 1.95-2.88 6.55.33 7.82-.76 1.83-1.6 3.02-2.65 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Sign in with Apple
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground pb-8">
          For more information, please see our{" "}
          <Link to="/" className="font-medium text-slate-900 underline">
            Privacy policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
