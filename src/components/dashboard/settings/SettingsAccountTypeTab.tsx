import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPricingPlans } from "@/api/billing";
import { sendAccountConversionOtp, convertOrganizerAccount } from "@/api/organizers";
import { uploadFile } from "@/api/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UploadCloud,
  CheckCircle2,
  Building2,
  User,
  Loader2,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface SettingsAccountTypeTabProps {
  profile: any;
}

export function SettingsAccountTypeTab({ profile }: SettingsAccountTypeTabProps) {
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<"business" | "personal">(
    profile?.business ? "business" : "personal",
  );
  const [step, setStep] = useState<number>(0);
  // Step 0: Overview/Selection
  // Step 1: Certificate Upload (if business)
  // Step 2: Plan Selection
  // Step 3: Password Confirmation
  // Step 4: OTP Verification
  // Step 5: Final Loading

  const [certFile, setCertFile] = useState<File | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [isFinalLoading, setIsFinalLoading] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: async () => await getPricingPlans(),
  });

  // Filter plans based on targetType
  const availablePlans =
    plans?.filter((p) => {
      if (targetType === "business") {
        return !p.name.toLowerCase().includes("basic") && !p.name.toLowerCase().includes("pro");
      }
      return p.name.toLowerCase().includes("basic") || p.name.toLowerCase().includes("pro");
    }) || [];

  const sendOtpMutation = useMutation({
    mutationFn: async () =>
      await sendAccountConversionOtp({
        data: { email: profile?.email, phone: profile?.phone },
      } as any),
    onSuccess: (data) => {
      setOtpToken(data.token);
      toast.success("Verification code sent!");
      setStep(4);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send code");
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (certUrl: string) => {
      return await convertOrganizerAccount({
        data: {
          targetType,
          password,
          otp,
          otpToken,
          business_cert: certUrl,
          plan_id: selectedPlanId,
        } as any,
      });
    },
    onSuccess: () => {
      // The 60s loader handles the block, then we reset
      setTimeout(() => {
        toast.success("Account conversion requested successfully!");
        queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
        setIsFinalLoading(false);
        setStep(0);
      }, 60000);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to convert account");
      setIsFinalLoading(false);
    },
  });

  const handleStartConversion = (type: "business" | "personal") => {
    setTargetType(type);
    if (type === "business") {
      setStep(1);
    } else {
      setStep(2); // skip cert for personal
    }
  };

  const handleNextFromCert = () => {
    if (!certFile) {
      toast.error("Please upload your business certificate");
      return;
    }
    setStep(2);
  };

  const handleNextFromPlan = () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan to continue");
      return;
    }
    setStep(3);
  };

  const handleNextFromPassword = () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }
    sendOtpMutation.mutate();
  };

  const handleFinalSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setIsFinalLoading(true);
    setStep(5);

    let certUrl = profile?.business_cert || "";
    if (certFile) {
      try {
        const base64 = await fileToBase64(certFile);
        const ext = certFile.name.split(".").pop() || "pdf";
        const res = await uploadFile({
          data: { base64, contentType: certFile.type, folder: "organizers/certs", ext },
        } as any);
        certUrl = res.url;
      } catch (err) {
        setIsFinalLoading(false);
        setStep(4);
        toast.error("Certificate upload failed");
        return;
      }
    }

    convertMutation.mutate(certUrl);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
      {step === 0 && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-[17px] font-bold mb-2">Account Type</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account classification and capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Card */}
            <Card
              className={`border-2 transition-all ${!profile?.business ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl ${!profile?.business ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Personal Account</h3>
                    {!profile?.business && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Basic event creation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Standard payout terms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Limited features
                  </li>
                </ul>
                {profile?.business && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStartConversion("personal")}
                  >
                    Downgrade to Personal
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Business Card */}
            <Card
              className={`border-2 transition-all ${profile?.business ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl ${profile?.business ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Business Account</h3>
                    {profile?.business && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified badge
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Priority payouts & low fees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Advanced analytics
                  </li>
                </ul>
                {!profile?.business && (
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleStartConversion("business")}
                  >
                    Upgrade to Business
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {profile?.active === false && profile?.business_cert && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-700 dark:text-orange-400">Review Pending</h4>
                <p className="text-sm text-orange-600/80 dark:text-orange-300/80 mt-1">
                  Your account conversion is currently pending admin approval. You will be notified
                  once reviewed.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Certificate */}
      {step === 1 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button
            variant="ghost"
            onClick={() => setStep(0)}
            className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <h2 className="text-[17px] font-bold mb-2">Upload Business Certificate</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please provide your official business registration certificate.
          </p>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
            <input
              type="file"
              id="cert-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-primary">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                PDF, JPG or PNG (max. 10MB)
              </span>
            </label>
            {certFile && (
              <div className="mt-4 p-3 bg-background border border-border rounded-md text-sm font-medium flex items-center justify-between">
                <span className="truncate max-w-[200px]">{certFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setCertFile(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleNextFromCert}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue to Plans
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Plan Selection */}
      {step === 2 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button
            variant="ghost"
            onClick={() => setStep(targetType === "business" ? 1 : 0)}
            className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <h2 className="text-[17px] font-bold mb-2">
            Select a {targetType === "business" ? "Business" : "Personal"} Plan
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            By continuing, you agree that your next billing cycle will be charged based on the
            selected plan.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {availablePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${selectedPlanId === plan.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="text-right">
                      <span className="font-bold text-lg">${plan.price}</span>
                      <span className="text-xs text-muted-foreground block">
                        /{plan.billing_cycle === "yearly" ? "yr" : "mo"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
            {availablePlans.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                No suitable plans found for this account type.
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleNextFromPlan}
              disabled={!selectedPlanId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm & Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Password Confirmation */}
      {step === 3 && (
        <div className="animate-in slide-in-from-right-4 duration-300 max-w-sm">
          <Button
            variant="ghost"
            onClick={() => setStep(2)}
            className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-[17px] font-bold mb-2">Confirm your password</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please enter your current password to authorize this change.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                placeholder="••••••••"
              />
            </div>
            <Button
              onClick={handleNextFromPassword}
              disabled={!password || sendOtpMutation.isPending}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sendOtpMutation.isPending ? "Sending code..." : "Send Verification Code"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: OTP Verification */}
      {step === 4 && (
        <div className="animate-in slide-in-from-right-4 duration-300 max-w-sm">
          <Button
            variant="ghost"
            onClick={() => setStep(3)}
            className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <h2 className="text-[17px] font-bold mb-2">Check your device</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a 6-digit verification code to your email and phone. Enter it below to finalize
            the conversion.
          </p>

          <div className="flex justify-center mb-8">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleFinalSubmit}
              disabled={otp.length !== 6 || convertMutation.isPending}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {convertMutation.isPending ? "Verifying..." : "Verify & Convert"}
            </Button>

            <div className="text-center">
              <button
                onClick={() => sendOtpMutation.mutate()}
                disabled={sendOtpMutation.isPending}
                className="text-xs font-medium text-primary hover:underline"
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Full Screen Loading Overlay */}
      <Dialog open={isFinalLoading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="hidden">
            <DialogTitle>Converting Account</DialogTitle>
            <DialogDescription>Please wait</DialogDescription>
          </DialogHeader>
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">Converting your account...</h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Please do not close this window. We are updating your workspaces, generating new
              billing profiles, and notifying the admin team.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
