import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  sendUserPasswordResetOtp, 
  verifyUserPasswordResetOtp,
  resetUserPassword 
} from "@/api/auth";
import hero from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Agatike" },
      {
        name: "description",
        content: "Reset your Agatike account password securely.",
      },
    ],
  }),
  component: ForgotPassword,
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

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
      return await sendUserPasswordResetOtp({ data: values } as any);
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
      return await verifyUserPasswordResetOtp({
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
      return await resetUserPassword({
        data: {
          otpToken,
          otp: verifyForm.getValues("otp"),
          password: values.password,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Please sign in.");
      navigate({ to: "/signin" });
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
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-screen lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6 lg:py-10">
        {/* Visual Header */}
        <div className="relative h-[35vh] w-full shrink-0 lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          
          {/* Back button overlay */}
          <div className="absolute top-6 left-6 z-10 hidden lg:block">
            <Link 
              to="/signin"
              className="flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>

          <div className="absolute bottom-8 left-6 right-6 lg:bottom-0 lg:left-0 lg:right-0 lg:p-10 lg:text-white">
            <p className="text-xs font-medium text-white/90 lg:text-sm lg:opacity-80">
              Account Recovery
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-white lg:mt-2 lg:text-3xl">
              Get back to the culture.
            </h2>
            <p className="hidden mt-3 text-sm opacity-80 lg:block">
              Securely reset your password and reclaim your access.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-background px-6 pb-12 pt-8 lg:-mt-0 lg:mx-auto lg:w-full lg:max-w-md lg:rounded-none lg:bg-transparent lg:p-0">
          {/* Mobile Handle */}
          <div className="absolute left-1/2 top-3 h-1 w-12 -translate-x-1/2 rounded-full bg-border lg:hidden" />
          
          <div className="lg:hidden mb-6">
            <Link 
              to="/signin"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>

          <div className="lg:rounded-3xl lg:border lg:border-border/60 lg:bg-card lg:p-8 lg:shadow-[var(--shadow-card)]">
            <div className="hidden lg:flex justify-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <h1 className="text-2xl font-semibold tracking-tight lg:mt-6 lg:text-center">
              {step === "request" && "Forgot Password"}
              {step === "verify" && "OTP Verification"}
              {step === "reset" && "Reset Password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground lg:text-center">
              {step === "request" && "Enter your email address and we'll send you an OTP."}
              {step === "verify" && `Enter the 6-digit OTP sent to ${email}.`}
              {step === "reset" && "Create a new password for your account."}
            </p>

            <div className="mt-8">
              {step === "request" && (
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        {...requestForm.register("email")}
                        type="email"
                        placeholder="you@agatike.com"
                        className="pl-9"
                        disabled={requestOtpMutation.isPending}
                      />
                    </div>
                    {requestForm.formState.errors.email && (
                      <p className="mt-1.5 text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)] mt-2"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset OTP"}
                  </Button>
                </form>
              )}

              {step === "verify" && (
                <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="verify-otp">6-Digit OTP</Label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="verify-otp"
                        {...verifyForm.register("otp")}
                        type="text"
                        maxLength={6}
                        placeholder="------"
                        className="pl-9 text-center tracking-widest text-lg font-medium"
                        disabled={verifyOtpMutation.isPending}
                      />
                    </div>
                    {verifyForm.formState.errors.otp && (
                      <p className="mt-1.5 text-xs text-destructive">{verifyForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)] mt-2"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify OTP"}
                  </Button>
                </form>
              )}

              {step === "reset" && (
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="new-pw">New Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="new-pw"
                        {...resetForm.register("password")}
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        disabled={resetPasswordMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {resetForm.formState.errors.password && (
                      <p className="mt-1.5 text-xs text-destructive">{resetForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirm-pw">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-pw"
                        {...resetForm.register("confirmPassword")}
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        disabled={resetPasswordMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)] mt-4"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                  </Button>
                </form>
              )}
            </div>

            {step === "request" && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/signin" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
