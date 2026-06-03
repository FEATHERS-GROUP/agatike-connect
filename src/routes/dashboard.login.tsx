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
import { Building2, Mail, Lock, Loader2 } from "lucide-react";
import { loginOrganizer } from "@/api/auth";

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
      return await loginOrganizer({ data: values } as any);
    },
    onSuccess: () => {
      setIsRedirecting(true);
      toast.success("Welcome back!");
      queryClient.clear();
      // Adding a tiny delay so the toast is visible before navigating
      setTimeout(async () => {
        await router.invalidate();
        navigate({ to: "/dashboard" });
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid credentials. Please try again.");
    },
  });

  const onSubmit = (values: LoginValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 items-center justify-center mb-4">
            <img src="/icon.svg" alt="Agatike Icon" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">Organizer Portal</h1>
          <p className="text-muted-foreground text-lg">Sign in to manage your events</p>
        </div>

        <div className="bg-card border border-border/60 rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </span>
                <Input
                  {...register("email")}
                  type="email"
                  className="pl-11 h-12 rounded-xl bg-secondary/50"
                  placeholder="hello@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </span>
                <Input
                  {...register("password")}
                  type="password"
                  className="pl-11 h-12 rounded-xl bg-secondary/50"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-bold"
              disabled={mutation.isPending || isRedirecting}
            >
              {mutation.isPending || isRedirecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              className="h-11 rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium"
              onClick={() => toast.info("Coming soon!")}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-11 rounded-xl bg-background hover:bg-accent/50 border-border/60 transition-colors shadow-sm text-sm font-medium"
              onClick={() => toast.info("Coming soon!")}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.22-3.41 1.95-2.88 6.55.33 7.82-.76 1.83-1.6 3.02-2.65 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 animate-in fade-in duration-1000 delay-300">
          Don't have an organizer account?{" "}
          <Link
            to="/dashboard/create-organizer"
            className="text-primary font-medium hover:underline"
          >
            Create Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
