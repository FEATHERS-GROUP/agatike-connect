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
            <img src="/agatike-logo-white.svg" alt="Agatike Icon" className="h-20 w-auto object-contain" />
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

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => toast.info("Coming soon!")}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => toast.info("Coming soon!")}
            >
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
