import { createFileRoute, useNavigate, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Loader2,
  Ticket,
  Users,
  BarChart3,
  MousePointer2,
  CalendarHeart,
  ShoppingCart,
  LayoutTemplate,
  Film,
  Building2,
  Plane,
} from "lucide-react";
import { loginOrganizer, googleAuthOrganizer } from "@/api/auth";
import { loginWorkspaceUser } from "@/api/workspace_users";
import { useGoogleLogin } from "@react-oauth/google";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/login")({
  component: DashboardLoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const features = [
  {
    title: "Powerful Insights",
    desc: "Track your ticket sales, manage your attendees, and scale your events with our all-in-one organizer platform.",
    image: "/admin-dashboard-preview.png",
  },
  {
    title: "Procurement & Finance",
    desc: "Create and manage purchase orders, track vendor deliveries, and automate your back-office procurement.",
    image: "/procurement-preview.png",
  },
  {
    title: "Ticket Designer",
    desc: "Design stunning digital and printable tickets with our intuitive drag-and-drop builder.",
    image: "/ticket-designer-preview.png",
  },
  {
    title: "Page Builder",
    desc: "Launch immersive event pages, registration forms, and beautiful websites instantly using our templates.",
    image: "/page-builder-preview.png",
  },
  {
    title: "Venue Designer & Cinema",
    desc: "Design interactive seating charts, host movie screenings, and manage your arena layouts visually.",
    image: "/cinema-preview.png",
  },
];

function DashboardLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { currentUser, isLoaded } = useWorkspace();

  useEffect(() => {
    if (isLoaded && currentUser) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isLoaded, currentUser, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      let orgError = null;
      try {
        const res = await loginOrganizer({ data: values } as any);
        return { ...res, redirectUrl: "/dashboard" };
      } catch (err: any) {
        orgError = err;
      }

      let wsError = null;
      try {
        const res = await loginWorkspaceUser({ data: values } as any);
        return res; // Already contains success and redirectUrl
      } catch (err: any) {
        wsError = err;
      }

      if (wsError && wsError.message === "Please activate your account first") {
        throw new Error(wsError.message);
      }

      throw new Error("Invalid credentials. User not found or Organizer not found.");
    },
    onSuccess: (data: any) => {
      setIsRedirecting(true);
      toast.success("Welcome back!");
      queryClient.clear();
      setTimeout(async () => {
        await router.invalidate();
        navigate({ to: data.redirectUrl || "/dashboard" });
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid credentials. Please try again.");
    },
  });

  const onSubmit = (values: LoginValues) => {
    mutation.mutate(values);
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setIsRedirecting(true);
      try {
        await googleAuthOrganizer({ data: { code } } as any);
        toast.success("Welcome back!");
        queryClient.clear();
        setTimeout(async () => {
          await router.invalidate();
          navigate({ to: "/dashboard" });
        }, 1000);
      } catch (err: any) {
        toast.error(err?.message || "Google Login Failed");
        setIsRedirecting(false);
      }
    },
    onError: () => {
      toast.error("Google Login Failed");
      setIsRedirecting(false);
    },
  });

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#0a0a0a] font-sans">
      {/* Left side: Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-16 lg:px-20 z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex h-12 items-center justify-center mb-8">
              <img
                src="/icon.svg"
                alt="Agatike Icon"
                className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-gray-900 dark:text-white">
              Organizer Portal
            </h1>
            <p className="text-gray-600 dark:text-white/60 text-lg">
              Sign in to manage your events, tickets, and attendees.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-white/80">Email Address</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    {...register("email")}
                    type="email"
                    className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="hello@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-white/80">Password</Label>
                  <Link
                    to="/dashboard/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(242,87,29,0.3)]"
                  >
                    Forgot password?
                  </Link>

                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    {...register("password")}
                    type="password"
                    className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 mt-2"
                style={{ background: "var(--gradient-primary)" }}
                disabled={mutation.isPending || isRedirecting}
              >
                {mutation.isPending || isRedirecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>

              <div className="relative py-2 mt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#0a0a0a] px-3 text-gray-500 dark:text-white/40 font-medium tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={() => googleLogin()}
                disabled={mutation.isPending || isRedirecting}
                className="w-full h-14 rounded-xl bg-gray-50 dark:bg-[#ffffff05] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 transition-all font-medium flex items-center justify-center shadow-none"
              >
                {isRedirecting && !mutation.isPending ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
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
                )}
                {isRedirecting && !mutation.isPending ? "Signing in..." : "Sign in with Google"}
              </Button>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500 dark:text-white/50">
              Don't have an organizer account?{" "}
              <Link
                to="/dashboard/create-organizer"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Create Profile
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Image showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-orange-50 dark:bg-[#111111] items-center justify-center p-12">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 w-full h-full max-h-[85vh] flex flex-col items-center justify-center">
          <div className="w-full relative rounded-2xl overflow-visible shadow-2xl group">
            {/* Dark overlay for aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#0a0a0a]/90 via-white/20 dark:via-[#0a0a0a]/20 to-transparent z-10 pointer-events-none rounded-2xl"></div>

            {features.map((feature, idx) => (
              <img
                key={idx}
                src={feature.image}
                alt={feature.title}
                onError={(e) => {
                  e.currentTarget.src = "/admin-dashboard-preview.png";
                }}
                className={`absolute inset-0 w-full h-full object-cover rounded-2xl border border-gray-200 dark:border-white/10 transition-opacity duration-1000 ${
                  currentFeature === idx ? "opacity-100 relative" : "opacity-0 absolute"
                }`}
              />
            ))}

            {/* Floating Animated Bubbles */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl flex items-center justify-center animate-[bounce_4s_infinite] z-20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <CalendarHeart className="text-blue-400 w-8 h-8" />
            </div>

            <div className="absolute top-1/4 -right-8 w-20 h-20 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-3xl flex items-center justify-center animate-[pulse_3s_infinite] z-20 rotate-12 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <LayoutTemplate className="text-orange-400 w-10 h-10" />
            </div>

            <div className="absolute top-1/2 -left-6 w-14 h-14 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full flex items-center justify-center animate-[bounce_5s_infinite_1s] z-20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Users className="text-purple-400 w-7 h-7" />
            </div>

            <div className="absolute bottom-1/4 -right-10 w-24 h-24 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-[2rem] flex items-center justify-center animate-[bounce_6s_infinite] z-20 -rotate-12 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <ShoppingCart className="text-green-400 w-12 h-12" />
            </div>

            <div className="absolute -bottom-10 left-1/4 w-16 h-16 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl flex items-center justify-center animate-[pulse_4s_infinite_1s] z-20 rotate-45 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <Film className="text-red-400 w-8 h-8" />
            </div>

            <div className="absolute top-5 left-1/3 w-14 h-14 bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 rounded-full flex items-center justify-center animate-[bounce_3.5s_infinite_0.5s] z-20 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
              <Building2 className="text-sky-400 w-7 h-7" />
            </div>

            <div className="absolute -bottom-6 right-1/4 w-12 h-12 bg-pink-500/20 backdrop-blur-xl border border-pink-500/30 rounded-full flex items-center justify-center animate-[bounce_4.5s_infinite_0.2s] z-20 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
              <Plane className="text-pink-400 w-6 h-6" />
            </div>

            {/* Animated Cursor clicking */}
            <div
              className="absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out flex flex-col items-center"
              style={{
                top: currentFeature % 2 === 0 ? "30%" : "50%",
                left: currentFeature % 3 === 0 ? "40%" : "60%",
              }}
            >
              <div className="relative">
                <MousePointer2 className="w-8 h-8 text-gray-900 dark:text-white fill-black drop-shadow-2xl -rotate-12" />
                <div
                  className="absolute top-0 left-0 w-8 h-8 rounded-full bg-gray-900/30 dark:bg-white/50 animate-ping"
                  key={currentFeature}
                ></div>
              </div>
            </div>

            {/* Dynamic Features Card */}
            <div className="absolute -bottom-8 left-10 right-10 z-20">
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-white/20 p-6 rounded-2xl w-full max-w-md relative min-h-[140px] overflow-hidden shadow-2xl mx-auto lg:mx-0">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`transition-all duration-700 absolute inset-0 p-6 flex flex-col justify-center ${
                      currentFeature === idx
                        ? "opacity-100 translate-y-0 z-10"
                        : "opacity-0 translate-y-4 z-0 pointer-events-none"
                    }`}
                  >
                    <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2 flex items-center gap-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}

                {/* Progress Indicators */}
                <div className="absolute bottom-4 left-6 flex gap-1.5 z-20">
                  {features.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        currentFeature === idx
                          ? "w-6 bg-primary"
                          : "w-2 bg-gray-300 dark:bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
