import { createFileRoute, useNavigate, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { loginOrganizer, googleAuthOrganizer } from "@/api/auth";
import { loginWorkspaceUser } from "@/api/workspace_users";
import { useGoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/dashboard/login")({
  component: DashboardLoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function DashboardLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

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

      // If workspace user found but not activated, bubble up that specific error
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
    <div className="relative min-h-[100dvh] w-full bg-[#0a0a0a] text-white overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-12 sm:py-24">
      {/* Immersive Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] opacity-30 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl overflow-hidden">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 items-center justify-center mb-4">
            <img
              src="/icon.svg"
              alt="Agatike Icon"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3 text-white">Organizer Portal</h1>
          <p className="text-white/60 text-lg">Sign in to manage your events</p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/80">Email Address</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Mail className="h-5 w-5" />
                </span>
                <Input
                  {...register("email")}
                  type="email"
                  className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="hello@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/80">Password</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(242,87,29,0.3)]"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Lock className="h-5 w-5" />
                </span>
                <Input
                  {...register("password")}
                  type="password"
                  className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
              style={{ background: "var(--gradient-primary)" }}
              disabled={mutation.isPending || isRedirecting}
            >
              {mutation.isPending || isRedirecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={() => googleLogin()}
              disabled={mutation.isPending || isRedirecting}
              className="w-full h-14 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white transition-all font-medium flex items-center justify-center"
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

          <p className="mt-8 text-center text-sm text-white/60">
            Don't have an organizer account?{" "}
            <Link
              to="/dashboard/create-organizer"
              className="font-semibold text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(242,87,29,0.3)]"
            >
              Create Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
