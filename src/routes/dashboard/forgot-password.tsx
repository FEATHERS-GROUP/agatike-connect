import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Loader2,
  KeyRound,
  ArrowLeft,
  MousePointer2,
} from "lucide-react";
import { 
  sendDashboardPasswordResetOtp, 
  verifyDashboardPasswordResetOtp,
  resetDashboardPassword 
} from "@/api/auth";

export const Route = createFileRoute("/dashboard/forgot-password")({
  component: DashboardForgotPasswordPage,
});

const requestOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestOtpValues = z.infer<typeof requestOtpSchema>;
type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const features = [
  {
    title: "Secure Recovery",
    desc: "We use a one-time password to securely verify your identity before resetting your password.",
    image: "/admin-dashboard-preview.png",
  },
  {
    title: "Stay Protected",
    desc: "Your data is encrypted and protected. Manage your events with peace of mind.",
    image: "/procurement-preview.png",
  }
];

function DashboardForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const requestForm = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const verifyForm = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async (values: RequestOtpValues) => {
      return await sendDashboardPasswordResetOtp({ data: values } as any);
    },
    onSuccess: (data: any) => {
      setOtpToken(data.token);
      setEmail(requestForm.getValues("email"));
      setStep("verify");
      toast.success("OTP sent to your email!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send OTP.");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (values: VerifyOtpValues) => {
      return await verifyDashboardPasswordResetOtp({
        data: { otpToken, otp: values.otp },
      } as any);
    },
    onSuccess: () => {
      setStep("reset");
      toast.success("OTP verified! Please enter your new password.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid or expired OTP.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      return await resetDashboardPassword({
        data: {
          otpToken,
          otp: verifyForm.getValues("otp"),
          password: values.password,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Please sign in.");
      navigate({ to: "/dashboard/login" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset password.");
    },
  });

  const onRequestSubmit = (values: RequestOtpValues) => {
    requestOtpMutation.mutate(values);
  };

  const onVerifySubmit = (values: VerifyOtpValues) => {
    verifyOtpMutation.mutate(values);
  };

  const onResetSubmit = (values: ResetPasswordValues) => {
    resetPasswordMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#0a0a0a] font-sans">
      {/* Left side: Forgot Password Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-16 lg:px-20 z-10 relative">
        <Link 
          to="/dashboard/login"
          className="absolute top-8 left-6 sm:left-16 lg:left-20 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <div className="w-full max-w-md mx-auto mt-12 lg:mt-0">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6 rounded-2xl bg-orange-50 dark:bg-white/[0.02] border border-orange-100 dark:border-white/5">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-gray-900 dark:text-white">
              {step === "request" && "Forgot Password"}
              {step === "verify" && "OTP Verification"}
              {step === "reset" && "Reset Password"}
            </h1>
            <p className="text-gray-600 dark:text-white/60 text-lg">
              {step === "request" && "Enter your email address and we'll send you an OTP to reset your password."}
              {step === "verify" && `Enter the 6-digit OTP sent to ${email}.`}
              {step === "reset" && "Create a new password for your account."}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {step === "request" && (
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-white/80">Email Address</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      {...requestForm.register("email")}
                      type="email"
                      className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
                      placeholder="hello@example.com"
                    />
                  </div>
                  {requestForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{requestForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 mt-2"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset OTP"
                  )}
                </Button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-white/80">6-Digit OTP</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <Input
                      {...verifyForm.register("otp")}
                      type="text"
                      maxLength={6}
                      className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all text-center tracking-widest text-lg font-medium"
                      placeholder="------"
                    />
                  </div>
                  {verifyForm.formState.errors.otp && (
                    <p className="text-xs text-red-400">{verifyForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 mt-2"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-white/80">New Password</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      {...resetForm.register("password")}
                      type="password"
                      className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-white/80">Confirm Password</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      {...resetForm.register("confirmPassword")}
                      type="password"
                      className="pl-12 h-14 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 mt-2"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
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
              <KeyRound className="text-blue-400 w-8 h-8" />
            </div>

            <div className="absolute top-1/4 -right-8 w-20 h-20 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-3xl flex items-center justify-center animate-[pulse_3s_infinite] z-20 rotate-12 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Lock className="text-orange-400 w-10 h-10" />
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
