import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createOrganizerAccount, checkOrganizerHandle } from "@/api/organizers";
import { sendSignupOtp } from "@/api/auth";
import { getUserByHandle } from "@/api/users";
import { uploadFile } from "@/api/storage";
import {
  Building2,
  User,
  Briefcase,
  CheckCircle2,
  Search,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/create-organizer")({
  component: CreateOrganizerPage,
});

const AVAILABLE_FIELDS = [
  "Music & Concerts",
  "Nightlife",
  "Tech & Innovation",
  "Business & Networking",
  "Sports",
  "Arts & Culture",
  "Food & Beverage",
  "Comedy",
  "Workshops",
];

const AVAILABLE_SPECIALITIES = [
  "EDM & House",
  "Afrobeats",
  "Hip Hop",
  "Live Bands",
  "VIP Experiences",
  "Conferences",
  "Gala Dinners",
  "Exhibitions",
  "Brand Activations",
];

const formSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    handle: z
      .string()
      .min(3, "Handle must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    national_id: z.string().optional(),
    field: z.array(z.string()).min(1, "Please select at least one primary field"),
    speciality: z.array(z.string()).optional(),
    numberOfEvents: z.string().min(1, "Please select the estimated volume of events"),
    bio: z.string().optional(),
    business_cert: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
    phone: z.string().min(8, "Valid phone number is required"),
    email: z.string().email("Valid email is required"),
    business: z.boolean(),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof formSchema>;

function CreateOrganizerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isGeneratingHandle, setIsGeneratingHandle] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [syncHandle, setSyncHandle] = useState("");
  const [syncUserId, setSyncUserId] = useState<string | null>(null);

  const {
    data: linkedUser,
    isFetching: isLookingUpUser,
    refetch: lookupUser,
  } = useQuery({
    queryKey: ["userLookup", syncHandle.replace(/^@/, "").trim()],
    queryFn: async () =>
      await getUserByHandle({ data: { handle: syncHandle.replace(/^@/, "").trim() } } as any),
    enabled: false,
  });

  const handleLookup = async () => {
    if (!syncHandle.trim()) return;
    const result = await lookupUser();
    if (result.data) {
      setSyncUserId(result.data.id);
      toast.success(`Account found: ${result.data.username}`);
    } else {
      setSyncUserId(null);
      toast.error("No user found with that handle");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field: [],
      speciality: [],
      gender: "",
      numberOfEvents: "",
      business: false,
      phone: "",
      email: "",
      confirm_password: "",
      terms: false,
    },
  });

  const nameValue = watch("name");
  const isBusiness = watch("business");

  useEffect(() => {
    const generateUnique = async () => {
      if (!nameValue) {
        setValue("handle", "", { shouldValidate: true });
        return;
      }

      setIsGeneratingHandle(true);
      const baseHandle = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, "");

      try {
        let isAvailable = await checkOrganizerHandle({ data: { handle: baseHandle } } as any);
        if (isAvailable) {
          setValue("handle", baseHandle, { shouldValidate: true });
        } else {
          let suffix = 1;
          let newHandle = "";
          while (!isAvailable && suffix < 100) {
            newHandle = `${baseHandle}${suffix.toString().padStart(2, "0")}`;
            isAvailable = await checkOrganizerHandle({ data: { handle: newHandle } } as any);
            suffix++;
          }
          setValue("handle", newHandle, { shouldValidate: true });
        }
      } catch (error) {
        setValue("handle", baseHandle, { shouldValidate: true });
      } finally {
        setIsGeneratingHandle(false);
      }
    };

    const timeoutId = setTimeout(() => {
      generateUnique();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [nameValue, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { terms, confirm_password, instagram, tiktok, youtube, ...restValues } = values;
      
      let finalBusinessCert = restValues.business_cert;
      if (finalBusinessCert && finalBusinessCert.startsWith("data:")) {
        const match = finalBusinessCert.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          try {
            const res = await uploadFile({
              data: {
                base64: match[2],
                contentType: match[1],
                folder: "organizers/certs",
                ext: match[1].split("/")[1] || "bin",
              },
            } as any);
            finalBusinessCert = res.url;
          } catch (err) {
            console.error("Failed to upload business cert", err);
          }
        }
      }

      let finalNationalId = restValues.national_id;
      if (finalNationalId && finalNationalId.startsWith("data:")) {
        const match = finalNationalId.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          try {
            const res = await uploadFile({
              data: {
                base64: match[2],
                contentType: match[1],
                folder: "organizers/ids",
                ext: match[1].split("/")[1] || "bin",
              },
            } as any);
            finalNationalId = res.url;
          } catch (err) {
            console.error("Failed to upload national ID", err);
          }
        }
      }

      const payload = {
        ...restValues,
        business_cert: finalBusinessCert,
        national_id: finalNationalId,
        field: values.field.join(", "),
        user_id: syncUserId,
        speciality:
          values.speciality && values.speciality.length > 0 ? { tags: values.speciality } : {},
        socials: { instagram, tiktok, youtube },
      };
      return await createOrganizerAccount({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Profile created! Please log in with your new credentials.");
      navigate({ to: "/dashboard/login" });
    },
    onError: (error) => {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!otpStep) {
      setIsSendingOtp(true);
      try {
        const result = await sendSignupOtp({ data: { email: values.email } } as any);
        if (result.success && result.token) {
          setOtpToken(result.token);
          setOtpStep(true);
          toast.success("Verification code sent to your email!");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to send verification code.");
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    if (otpInput.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    mutation.mutate({ ...values, otpToken, otp: otpInput } as any);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 3) {
      fieldsToValidate = ["name", "handle", "email", "phone"];
    }
    if (step === 4) {
      fieldsToValidate = ["field", "numberOfEvents"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden flex flex-col py-10 px-4 items-center justify-center">
      {/* Immersive Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] opacity-30 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/icon.svg" alt="Agatike" className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Create Organizer Profile</h1>
              <p className="text-sm text-white/60">Join Agatike and start managing premium events.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-white/50 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative w-full rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
          
          {/* Animated Progress Bars */}
          <div className="flex gap-2 mb-10">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${
                  i + 1 <= step 
                    ? "bg-primary shadow-[0_0_12px_rgba(242,87,29,0.8)]" 
                    : "bg-white/10"
                }`} 
              />
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            {/* STEP 1: Account Type */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-white">Choose Account Type</h2>
                  <p className="text-white/60">Select how you will be operating on Agatike.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal */}
                  <div
                    onClick={() => setValue("business", false)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      !isBusiness
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(242,87,29,0.2)] scale-[1.02]"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${!isBusiness ? "bg-primary text-white shadow-[0_0_15px_rgba(242,87,29,0.4)]" : "bg-white/10 text-white/50"}`}>
                        <User className="h-6 w-6" />
                      </div>
                      {!isBusiness && <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(242,87,29,0.6)]" />}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">Personal</h3>
                    <p className="text-sm text-white/60">For individuals, freelancers, and independent event organizers.</p>
                  </div>

                  {/* Business */}
                  <div
                    onClick={() => setValue("business", true)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      isBusiness
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(242,87,29,0.2)] scale-[1.02]"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${isBusiness ? "bg-primary text-white shadow-[0_0_15px_rgba(242,87,29,0.4)]" : "bg-white/10 text-white/50"}`}>
                        <Building2 className="h-6 w-6" />
                      </div>
                      {isBusiness && <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(242,87,29,0.6)]" />}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">Registered Business</h3>
                    <p className="text-sm text-white/60">For registered companies, venues, and professional agencies.</p>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <Button
                    onClick={nextStep}
                    className="h-14 w-full md:w-auto px-10 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Sync Account */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 text-primary grid place-items-center mb-6 shadow-[0_0_20px_rgba(242,87,29,0.3)]">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-white">Already on Agatike?</h2>
                  <p className="text-white/60 max-w-md mx-auto">
                    If you already have a standard user account, you can sync it to your new organizer
                    profile. This is completely optional.
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                      <Input
                        placeholder="Enter your user @handle"
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl text-lg placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        value={syncHandle}
                        onChange={(e) => setSyncHandle(e.target.value)}
                        disabled={!!syncUserId}
                      />
                    </div>
                    {syncUserId ? (
                      <Button
                        variant="outline"
                        className="h-14 rounded-xl px-8 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          setSyncUserId(null);
                          setSyncHandle("");
                        }}
                      >
                        Unlink
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-14 rounded-xl px-8 bg-white/10 text-white hover:bg-white/20 border-0"
                        onClick={handleLookup}
                        disabled={isLookingUpUser || !syncHandle}
                      >
                        {isLookingUpUser ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
                      </Button>
                    )}
                  </div>

                  {syncUserId && linkedUser && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl flex items-center justify-center gap-3 font-medium">
                      <CheckCircle2 className="h-6 w-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> 
                      Successfully linked with {linkedUser.username}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-10 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-14 flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {syncUserId ? "Continue" : "Skip"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Basic Info */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                    <User className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                    <p className="text-sm text-white/60">Tell us who you are.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/80">Full Name / Organization Name *</Label>
                    <Input
                      {...register("name")}
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                      placeholder="e.g. Kigali Events Co."
                    />
                    {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Unique Handle *</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        @
                      </span>
                      <Input
                        {...register("handle")}
                        readOnly
                        className="pl-9 pr-10 h-12 rounded-xl bg-white/5 opacity-70 border-white/10 text-white/70 cursor-not-allowed"
                        placeholder="kigali_events"
                      />
                      {isGeneratingHandle && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 animate-spin" />
                      )}
                    </div>
                    {errors.handle && <p className="text-xs text-red-400">{errors.handle.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Email Address *</Label>
                    <Input
                      {...register("email")}
                      type="email"
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                      placeholder="hello@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Phone Number *</Label>
                    <Input
                      {...register("phone")}
                      type="tel"
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                      placeholder="+250 700 000 000"
                    />
                    {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
                  </div>

                  {!isBusiness && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/80">National ID / Passport (Optional)</Label>
                      <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setValue("national_id", event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                          {watch("national_id") ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-400" /> Document Attached
                            </>
                          ) : (
                            "Click to upload ID/Passport"
                          )}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white/80">Date of Birth / Inception Date</Label>
                    <Input
                      {...register("dateOfBirth")}
                      type="date"
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary [color-scheme:dark]"
                    />
                  </div>

                  {!isBusiness && (
                    <div className="space-y-2">
                      <Label className="text-white/80">Gender</Label>
                      <Select onValueChange={(v) => setValue("gender", v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary focus:border-transparent">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white">
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-14 flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Expertise */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                    <Briefcase className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Expertise & Details</h2>
                    <p className="text-sm text-white/60">What kind of events do you host?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-white/80">Primary Fields *</Label>
                    <p className="text-sm text-white/50 mt-0">Select all that apply to your events.</p>
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {AVAILABLE_FIELDS.map((f) => {
                        const currentFields = watch("field") || [];
                        const isSelected = currentFields.includes(f);
                        return (
                          <div
                            key={f}
                            onClick={() => {
                              if (isSelected) {
                                setValue("field", currentFields.filter((item) => item !== f), { shouldValidate: true });
                              } else {
                                setValue("field", [...currentFields, f], { shouldValidate: true });
                              }
                            }}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 border ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(242,87,29,0.4)] scale-[1.02]"
                                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {f}
                          </div>
                        );
                      })}
                    </div>
                    {errors.field && <p className="text-xs text-red-400 mt-2">{errors.field.message}</p>}
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-white/80">Speciality Tags (Optional)</Label>
                    <p className="text-sm text-white/50 mt-0">Select specific niches you excel in.</p>
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {AVAILABLE_SPECIALITIES.map((s) => {
                        const currentSpecs = watch("speciality") || [];
                        const isSelected = currentSpecs.includes(s);
                        return (
                          <div
                            key={s}
                            onClick={() => {
                              if (isSelected) {
                                setValue("speciality", currentSpecs.filter((item) => item !== s), { shouldValidate: true });
                              } else {
                                setValue("speciality", [...currentSpecs, s], { shouldValidate: true });
                              }
                            }}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 border ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(242,87,29,0.4)] scale-[1.02]"
                                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {s}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-white/80">Estimated Events Per Year *</Label>
                    <Select onValueChange={(v) => setValue("numberOfEvents", v, { shouldValidate: true })}>
                      <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary focus:border-transparent">
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-white/10 text-white">
                        <SelectItem value="0-10">0 - 10 events</SelectItem>
                        <SelectItem value="11-50">11 - 50 events</SelectItem>
                        <SelectItem value="50+">50+ events</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.numberOfEvents && <p className="text-xs text-red-400">{errors.numberOfEvents.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2 mt-2">
                    <Label className="text-white/80">Organizer Bio</Label>
                    <Textarea
                      {...register("bio")}
                      className="min-h-[120px] rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary resize-none"
                      placeholder="Tell attendees about your organization..."
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2 mt-2">
                    <Label className="text-white/80">Social Media Links (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/50">Instagram</Label>
                        <Input
                          {...register("instagram")}
                          placeholder="@handle"
                          className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/50">TikTok</Label>
                        <Input
                          {...register("tiktok")}
                          placeholder="@handle"
                          className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/50">YouTube</Label>
                        <Input
                          {...register("youtube")}
                          placeholder="Channel URL"
                          className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {isBusiness && (
                    <div className="space-y-2 md:col-span-2 mt-4">
                      <Label className="text-white/80">Business Certificate (Upload Document/Image)</Label>
                      <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setValue("business_cert", event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                          {watch("business_cert") ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-400" /> Certificate Attached
                            </>
                          ) : (
                            "Click to upload certificate"
                          )}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-14 flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Security & Agreement */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                {otpStep ? (
                  <div className="space-y-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(242,87,29,0.3)]">
                        <CheckCircle2 className="h-8 w-8 drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">Verify your email</h3>
                      <p className="text-base text-white/60">
                        We've sent a 6-digit code to <strong>{watch("email")}</strong>. Please enter
                        it below to launch your profile.
                      </p>
                    </div>
                    <div className="max-w-xs mx-auto mt-8">
                      <Label htmlFor="org-otp" className="sr-only">
                        Verification Code
                      </Label>
                      <Input
                        id="org-otp"
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest h-16 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        maxLength={6}
                        disabled={mutation.isPending}
                      />
                    </div>
                    <div className="max-w-xs mx-auto pt-6 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => { setOtpStep(false); setOtpInput(""); }}
                        className="h-14 flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                        disabled={mutation.isPending}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                        style={{ background: "var(--gradient-primary)" }}
                        disabled={mutation.isPending || otpInput.length < 6}
                      >
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Create"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                      <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                        <ShieldCheck className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Security & Agreement</h2>
                        <p className="text-sm text-white/60">Secure your organizer account.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/80">Secure Password *</Label>
                        <Input
                          {...register("password")}
                          type="password"
                          className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          placeholder="••••••••"
                        />
                        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80">Confirm Password *</Label>
                        <Input
                          {...register("confirm_password")}
                          type="password"
                          className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          placeholder="••••••••"
                        />
                        {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
                      </div>

                      <div className="md:col-span-2 flex items-start space-x-3 mt-6 bg-white/5 p-4 rounded-xl border border-white/10">
                        <Checkbox
                          id="terms"
                          checked={watch("terms")}
                          onCheckedChange={(checked) => setValue("terms", checked as boolean, { shouldValidate: true })}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-white/30"
                        />
                        <div className="space-y-1 leading-none">
                          <label htmlFor="terms" className="text-sm font-medium leading-none text-white/80 cursor-pointer">
                            Accept Terms and Conditions
                          </label>
                          <p className="text-sm text-white/50">
                            You agree to our Terms of Service and Privacy Policy.
                          </p>
                          {errors.terms && <p className="text-xs text-red-400 mt-2">{errors.terms.message}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-14 flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                        disabled={isSendingOtp}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                        style={{ background: "var(--gradient-primary)" }}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Profile"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              Already have an organizer account?{" "}
              <Link to="/dashboard/login" className="font-semibold text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(242,87,29,0.3)]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
