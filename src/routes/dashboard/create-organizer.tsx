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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createOrganizerAccount, checkOrganizerHandle } from "@/api/organizers";
import { sendSignupOtp } from "@/api/auth";
import { getUserByHandle } from "@/api/users";
import { uploadFile } from "@/api/storage";
import { getPricingPlans } from "@/api/billing";
import { getAllPaymentProviderFees } from "@/api/pawapay";
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
  Calculator,
  Wallet,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/create-organizer")({
  component: CreateOrganizerPage,
});

const CATEGORIES = [
  { id: "bottts", label: "Robots" },
  { id: "shapes", label: "Shapes" },
  { id: "identicon", label: "Patterns" },
  { id: "adventurer", label: "Characters" },
  { id: "fun-emoji", label: "Emojis" },
  { id: "micah", label: "Stylized" },
];

const generateAvatars = (category: string) => {
  const bg = ["b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9"];
  return Array.from({ length: 12 }).map(() => {
    const color = bg[Math.floor(Math.random() * bg.length)];
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${color}`;
  });
};

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
  "Festivals",
  "Health & Wellness",
  "Education",
  "Fashion & Beauty",
  "Gaming & E-Sports",
  "Charity & Causes",
  "Film & Media",
  "Web3 & Crypto",
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
  "Corporate Events",
  "Hackathons",
  "Stand-up Comedy",
  "Food Festivals",
  "Pop-up Shops",
  "Webinars",
  "Masterclasses",
  "Trade Shows",
  "R&B / Soul",
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
    image: z.string().min(1, "Profile picture or logo is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirm_password: z.string(),
    phone: z.string().min(8, "Valid phone number is required"),
    email: z.string().email("Valid email is required"),
    business: z.boolean(),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
    fee_acknowledgement: z.boolean().refine((val) => val === true, "You must accept the fee structure"),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .superRefine((data, ctx) => {
    if (!data.national_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "National ID / Passport is required",
        path: ["national_id"],
      });
    }
    
    if (data.business && !data.business_cert) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business Certificate is required for registered businesses",
        path: ["business_cert"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function CreateOrganizerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [isGeneratingHandle, setIsGeneratingHandle] = useState(false);
  const { currentUser, isLoaded } = useWorkspace();

  useEffect(() => {
    if (isLoaded && currentUser) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isLoaded, currentUser, navigate]);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("identicon");

  useEffect(() => {
    setAvatarOptions(generateAvatars(activeCategory));
  }, [activeCategory]);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timerId = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCountdown]);

  const [syncHandle, setSyncHandle] = useState("");
  const [syncUserId, setSyncUserId] = useState<string | null>(null);

  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(5000);
  const [calcTicketCount, setCalcTicketCount] = useState<number>(100);
  const [calcPlanId, setCalcPlanId] = useState<string>("");
  const [calcCountry, setCalcCountry] = useState<string>("RWA");
  const [calcNetwork, setCalcNetwork] = useState<string>("");

  const { data: pricingPlans = [] } = useQuery({
    queryKey: ["pricingPlans"],
    queryFn: async () => await getPricingPlans(),
  });

  const { data: providerFees = [] } = useQuery({
    queryKey: ["providerFees"],
    queryFn: async () => await getAllPaymentProviderFees(),
  });

  const selectedPlan = pricingPlans.find((p: any) => p.id === calcPlanId) || pricingPlans[0] || {};
  const availableCountries = Array.from(new Set(providerFees.map((f: any) => f.country_code).filter(Boolean)));
  const availableNetworks = providerFees.filter((f: any) => f.country_code === calcCountry);
  const selectedNetwork = availableNetworks.find((f: any) => f.network === calcNetwork) || availableNetworks[0] || {};

  useEffect(() => {
    if (pricingPlans.length > 0 && !calcPlanId) {
      setCalcPlanId(pricingPlans[0].id);
    }
  }, [pricingPlans, calcPlanId]);

  useEffect(() => {
    if (availableNetworks.length > 0 && (!calcNetwork || !availableNetworks.find((n:any)=>n.network === calcNetwork))) {
      setCalcNetwork(availableNetworks[0].network);
    }
  }, [availableNetworks, calcNetwork]);

  const totalTicketSales = calcTicketPrice * calcTicketCount;
  
  const custServicePct = Number(selectedPlan.customer_service_fee_percentage) || 0;
  const custCollectionPct = Number(selectedPlan.customer_collection_fee_percentage) || 0;
  const custFixed = Number(selectedPlan.customer_collection_fee_fixed) || 0;
  
  const customerFeePerTicket = (calcTicketPrice * (custServicePct + custCollectionPct) / 100) + custFixed;
  const totalCustomerFee = customerFeePerTicket * calcTicketCount;

  const orgCollectionPct = Number(selectedPlan.organizer_collection_fee_percentage) || 0;
  const orgFixed = Number(selectedPlan.organizer_collection_fee_fixed) || 0;
  const organizerFeePerTicket = (calcTicketPrice * (orgCollectionPct) / 100) + orgFixed;
  const totalOrganizerFee = organizerFeePerTicket * calcTicketCount;

  const estimatedWalletBalance = totalTicketSales - totalOrganizerFee;

  const withdrawalFeePct = Number(selectedPlan.withdrawal_fee_percentage) || 0;
  const withdrawalFeeFixed = Number(selectedPlan.withdrawal_fee_fixed) || 0;
  
  const providerDisbursementPct = Number(selectedNetwork?.disbursement_percentage) || 0;
  const providerDisbursementFee = (estimatedWalletBalance * (providerDisbursementPct / 100)) + (Number(selectedNetwork?.disbursement_fixed_fee) || 0);
  
  const agatikeWithdrawalFee = (estimatedWalletBalance * (withdrawalFeePct / 100)) + withdrawalFeeFixed;
  const finalAmount = estimatedWalletBalance - agatikeWithdrawalFee - providerDisbursementFee;

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
      fee_acknowledgement: false,
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
      const { terms, confirm_password, instagram, tiktok, youtube, fee_acknowledgement, ...restValues } = values as any;

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

      let finalImage = restValues.image;
      if (finalImage && finalImage.startsWith("data:")) {
        const match = finalImage.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          try {
            const res = await uploadFile({
              data: {
                base64: match[2],
                contentType: match[1],
                folder: "organizers/profiles",
                ext: match[1].split("/")[1] || "bin",
              },
            } as any);
            finalImage = res.url;
          } catch (err) {
            console.error("Failed to upload image", err);
          }
        }
      }

      const payload = {
        ...restValues,
        business_cert: finalBusinessCert,
        national_id: finalNationalId,
        image: finalImage,
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
        const result = await sendSignupOtp({
          data: { email: values.email, phone: values.phone },
        } as any);
        if (result.success && result.token) {
          setOtpToken(result.token);
          setOtpStep(true);
          setResendCountdown(30);
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

  const handleResendOtp = async () => {
    const values = watch();
    setIsSendingOtp(true);
    try {
      const result = await sendSignupOtp({
        data: { email: values.email, phone: values.phone },
      } as any);
      if (result.success && result.token) {
        setOtpToken(result.token);
        setResendCountdown(30);
        toast.success("Verification code resent to your email!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 3) {
      fieldsToValidate = ["name", "handle", "email", "phone"];
    }
    if (step === 4) {
      fieldsToValidate = ["field"];
    }
    if (step === 5) {
      fieldsToValidate = ["numberOfEvents"];
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
    <div className="flex min-h-[100dvh] w-full bg-white dark:bg-[#0a0a0a] font-sans overflow-hidden">
      {/* Left side: Form */}
      <div className="w-full lg:w-[50%] flex flex-col px-6 sm:px-12 lg:px-16 py-12 z-10 overflow-y-auto max-h-[100dvh]">
        <div className="w-full max-w-2xl mx-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src="/icon.svg"
                alt="Agatike"
                className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Create Organizer Profile
                </h1>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Join Agatike and start managing premium events.
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
              Step {step} of {totalSteps}
            </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="relative w-full rounded-[2.5rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-2xl p-8 sm:p-12 shadow-xl dark:shadow-2xl">
            {/* Animated Progress Bars */}
            <div className="flex gap-2 mb-10">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${
                    i + 1 <= step
                      ? "bg-primary shadow-[0_0_12px_rgba(242,87,29,0.8)]"
                      : "bg-gray-200 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="w-full">
              {/* STEP 1: Account Type */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                      Choose Account Type
                    </h2>
                    <p className="text-gray-600 dark:text-white/60">
                      Select how you will be operating on Agatike.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal */}
                    <div
                      onClick={() => setValue("business", false)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        !isBusiness
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(242,87,29,0.2)] scale-[1.02]"
                          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl ${!isBusiness ? "bg-primary text-white shadow-[0_0_15px_rgba(242,87,29,0.4)]" : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/50"}`}
                        >
                          <User className="h-6 w-6" />
                        </div>
                        {!isBusiness && (
                          <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(242,87,29,0.6)]" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        Personal
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-white/60">
                        For individuals, freelancers, and independent event organizers.
                      </p>
                    </div>

                    {/* Business */}
                    <div
                      onClick={() => setValue("business", true)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        isBusiness
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(242,87,29,0.2)] scale-[1.02]"
                          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl ${isBusiness ? "bg-primary text-white shadow-[0_0_15px_rgba(242,87,29,0.4)]" : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/50"}`}
                        >
                          <Building2 className="h-6 w-6" />
                        </div>
                        {isBusiness && (
                          <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(242,87,29,0.6)]" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        Registered Business
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-white/60">
                        For registered companies, venues, and professional agencies.
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <Button
                      type="button"
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
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                      Already on Agatike?
                    </h2>
                    <p className="text-gray-600 dark:text-white/60 max-w-md mx-auto">
                      If you already have a standard user account, you can sync it to your new
                      organizer profile. This is completely optional.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white/50" />
                        <Input
                          placeholder="Enter your user @handle"
                          className="pl-12 h-14 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl text-lg placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          value={syncHandle}
                          onChange={(e) => setSyncHandle(e.target.value)}
                          disabled={!!syncUserId}
                        />
                      </div>
                      {syncUserId ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-14 rounded-xl px-8 bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                          onClick={() => {
                            setSyncUserId(null);
                            setSyncHandle("");
                          }}
                        >
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-14 rounded-xl px-8 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-300 dark:bg-white/20 border-0"
                          onClick={handleLookup}
                          disabled={isLookingUpUser || !syncHandle}
                        >
                          {isLookingUpUser ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Verify"
                          )}
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
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
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
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                      <User className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Basic Information
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-white/60">
                        Tell us who you are.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        Full Name / Organization Name *
                      </Label>
                      <Input
                        {...register("name")}
                        className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        placeholder="e.g. Kigali Events Co."
                      />
                      {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">Unique Handle *</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/40">
                          @
                        </span>
                        <Input
                          {...register("handle")}
                          readOnly
                          className="pl-9 pr-10 h-12 rounded-xl bg-gray-100 dark:bg-white/5 opacity-70 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 cursor-not-allowed"
                          placeholder="kigali_events"
                        />
                        {isGeneratingHandle && (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white/50 animate-spin" />
                        )}
                      </div>
                      {errors.handle && (
                        <p className="text-xs text-red-400">{errors.handle.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">Email Address *</Label>
                      <Input
                        {...register("email")}
                        type="email"
                        className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        placeholder="hello@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">Phone Number *</Label>
                      <Input
                        {...register("phone")}
                        type="tel"
                        className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                        placeholder="+250 700 000 000"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-400">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        National ID / Passport *
                      </Label>
                      <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 transition-colors">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setValue("national_id", event.target?.result as string, { shouldValidate: true });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-white/70 flex items-center gap-2">
                          {watch("national_id") ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-400" /> Document Attached
                            </>
                          ) : (
                            "Click to upload ID/Passport"
                          )}
                        </span>
                      </label>
                      {errors.national_id && (
                        <p className="text-xs text-red-400">{errors.national_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        Profile Picture / Logo *
                      </Label>
                      <div className="flex flex-col gap-4">
                        <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setValue("image", event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span className="text-sm font-medium text-gray-600 dark:text-white/70 flex items-center gap-2">
                            {watch("image") && !watch("image")?.includes("api.dicebear.com") ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-400" /> Image Attached
                              </>
                            ) : (
                              "Click to upload profile picture"
                            )}
                          </span>
                        </label>
                        <div className="flex items-center justify-center gap-4">
                           <span className="text-sm text-gray-500 font-medium uppercase">Or</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAvatarModalOpen(true)}
                          className="h-12 w-full rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40"
                        >
                          Choose from generated avatars
                        </Button>
                        {watch("image") && watch("image")?.includes("api.dicebear.com") && (
                          <div className="flex justify-center mt-2">
                             <img src={watch("image")} alt="Selected Avatar" className="w-16 h-16 rounded-full border-2 border-primary/30 bg-gray-100" />
                          </div>
                        )}
                      </div>
                      {errors.image && (
                        <p className="text-xs text-red-400">{errors.image.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        {isBusiness ? "Date of Registration" : "Date of Birth"}
                      </Label>
                      <Input
                        {...register("dateOfBirth")}
                        type="date"
                        className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        {isBusiness ? "Organization Type" : "Gender"}
                      </Label>
                      <Select onValueChange={(v) => setValue("gender", v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-primary focus:border-transparent">
                          <SelectValue
                            placeholder={isBusiness ? "Select organization type" : "Select gender"}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                          {isBusiness ? (
                            <>
                              <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                              <SelectItem value="Corp">Corporation</SelectItem>
                              <SelectItem value="Non-Profit">Non-Profit Organization</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="SoleProprietorship">
                                Sole Proprietorship
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
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
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                      <Briefcase className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Expertise & Details
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-white/60">
                        What kind of events do you host?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">Primary Fields *</Label>
                      <p className="text-sm text-gray-500 dark:text-white/50 mt-0">
                        Select all that apply to your events.
                      </p>
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {AVAILABLE_FIELDS.map((f) => {
                          const currentFields = watch("field") || [];
                          const isSelected = currentFields.includes(f);
                          return (
                            <div
                              key={f}
                              onClick={() => {
                                if (isSelected) {
                                  setValue(
                                    "field",
                                    currentFields.filter((item) => item !== f),
                                    { shouldValidate: true },
                                  );
                                } else {
                                  setValue("field", [...currentFields, f], {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border ${
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(242,87,29,0.4)] scale-[1.02]"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/70 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
                              )}
                              {f}
                            </div>
                          );
                        })}
                      </div>
                      {errors.field && (
                        <p className="text-xs text-red-400 mt-2">{errors.field.message}</p>
                      )}
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        Speciality Tags (Optional)
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-white/50 mt-0">
                        Select specific niches you excel in.
                      </p>
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {AVAILABLE_SPECIALITIES.map((s) => {
                          const currentSpecs = watch("speciality") || [];
                          const isSelected = currentSpecs.includes(s);
                          return (
                            <div
                              key={s}
                              onClick={() => {
                                if (isSelected) {
                                  setValue(
                                    "speciality",
                                    currentSpecs.filter((item) => item !== s),
                                    { shouldValidate: true },
                                  );
                                } else {
                                  setValue("speciality", [...currentSpecs, s], {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border ${
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(242,87,29,0.4)] scale-[1.02]"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/70 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
                              )}
                              {s}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: Organizer Details */}
              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                      <User className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Organizer Details
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-white/60">
                        Tell us a bit more about your brand.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        Estimated Events Per Year *
                      </Label>
                      <Select
                        onValueChange={(v) =>
                          setValue("numberOfEvents", v, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-primary focus:border-transparent">
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                          <SelectItem value="0-10">0 - 10 events</SelectItem>
                          <SelectItem value="11-50">11 - 50 events</SelectItem>
                          <SelectItem value="50+">50+ events</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.numberOfEvents && (
                        <p className="text-xs text-red-400">{errors.numberOfEvents.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2 mt-2">
                      <Label className="text-gray-700 dark:text-white/80">Organizer Bio</Label>
                      <Textarea
                        {...register("bio")}
                        className="min-h-[120px] rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary resize-none"
                        placeholder="Tell attendees about your organization..."
                      />
                    </div>

                    <div className="space-y-4 md:col-span-2 mt-2">
                      <Label className="text-gray-700 dark:text-white/80">
                        Social Media Links (Optional)
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-white/50">
                            Instagram
                          </Label>
                          <Input
                            {...register("instagram")}
                            placeholder="@handle"
                            className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-white/50">TikTok</Label>
                          <Input
                            {...register("tiktok")}
                            placeholder="@handle"
                            className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-white/50">
                            YouTube
                          </Label>
                          <Input
                            {...register("youtube")}
                            placeholder="Channel URL"
                            className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {isBusiness && (
                      <div className="space-y-2 md:col-span-2 mt-4">
                        <Label className="text-gray-700 dark:text-white/80">
                          Business Certificate (Upload Document/Image) *
                        </Label>
                        <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 transition-colors">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setValue("business_cert", event.target?.result as string, { shouldValidate: true });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span className="text-sm font-medium text-gray-600 dark:text-white/70 flex items-center gap-2">
                            {watch("business_cert") ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-400" /> Certificate
                                Attached
                              </>
                            ) : (
                              "Click to upload certificate"
                            )}
                          </span>
                        </label>
                        {errors.business_cert && (
                          <p className="text-xs text-red-400">{errors.business_cert.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 6: Security & Agreement */}
              {step === 6 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                  {otpStep ? (
                    <div className="space-y-6">
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(242,87,29,0.3)]">
                          <CheckCircle2 className="h-8 w-8 drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                          Verify your email
                        </h3>
                        <p className="text-base text-gray-600 dark:text-white/60">
                          We've sent a 6-digit code to <strong>{watch("email")}</strong>. Please
                          enter it below to launch your profile.
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
                          className="text-center text-2xl tracking-widest h-16 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                          maxLength={6}
                          disabled={mutation.isPending}
                        />
                      </div>
                      <div className="max-w-xs mx-auto pt-6 flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpStep(false);
                            setOtpInput("");
                          }}
                          className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                          disabled={mutation.isPending}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSubmit(onSubmit)}
                          className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                          style={{ background: "var(--gradient-primary)" }}
                          disabled={mutation.isPending || otpInput.length < 6}
                        >
                          {mutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Verify & Create"
                          )}
                        </Button>
                      </div>
                      <div className="text-center mt-6 text-sm text-gray-500 dark:text-white/50">
                        Didn't receive the code?{" "}
                        {resendCountdown > 0 ? (
                          <span className="font-medium text-gray-700 dark:text-white/70">
                            Resend in {resendCountdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-primary font-semibold hover:underline"
                            disabled={isSendingOtp}
                          >
                            Resend now
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Fee Acknowledgement (Kept outside modal) */}
                      <div className="mb-10 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="flex flex-col gap-4">
                          <div className="text-sm text-gray-600 dark:text-white/70">
                            <strong>Pricing & Fees:</strong> We use transparent transaction pricing. To see exactly how much you'll earn on your selected plan and payment method, you can use our Fee Calculator.
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsFeeModalOpen(true)}
                            className="w-full md:w-auto self-start border-primary/50 text-primary hover:bg-primary/10"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Open Fee Calculator
                          </Button>

                          <div className="flex items-start space-x-3 mt-2 pt-4 border-t border-gray-200 dark:border-white/10">
                            <Checkbox
                              id="fee_acknowledgement"
                              checked={watch("fee_acknowledgement")}
                              onCheckedChange={(checked) =>
                                setValue("fee_acknowledgement", checked as boolean, { shouldValidate: true })
                              }
                              className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-300 dark:border-white/30"
                            />
                            <div className="space-y-1">
                              <label
                                htmlFor="fee_acknowledgement"
                                className="text-sm font-medium leading-none text-gray-700 dark:text-white/80 cursor-pointer"
                              >
                                I understand and agree to Agatike's pricing, transaction fees, and payout processing fees.
                              </label>
                              {errors.fee_acknowledgement && (
                                <p className="text-xs text-red-500 mt-1">{errors.fee_acknowledgement.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                        <div className="p-2.5 bg-primary/20 rounded-xl shadow-[0_0_15px_rgba(242,87,29,0.2)]">
                          <ShieldCheck className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(242,87,29,0.6)]" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Security & Agreement
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-white/60">
                            Secure your organizer account.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-white/80">
                            Secure Password *
                          </Label>
                          <Input
                            {...register("password")}
                            type="password"
                            className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                            placeholder="••••••••"
                          />
                          {errors.password && (
                            <p className="text-xs text-red-400">{errors.password.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-white/80">
                            Confirm Password *
                          </Label>
                          <Input
                            {...register("confirm_password")}
                            type="password"
                            className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus-visible:ring-primary focus-visible:border-primary"
                            placeholder="••••••••"
                          />
                          {errors.confirm_password && (
                            <p className="text-xs text-red-400">
                              {errors.confirm_password.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2 flex items-start space-x-3 mt-6 bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                          <Checkbox
                            id="terms"
                            checked={watch("terms")}
                            onCheckedChange={(checked) =>
                              setValue("terms", checked as boolean, { shouldValidate: true })
                            }
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-white/30"
                          />
                          <div className="space-y-1 leading-none">
                            <label
                              htmlFor="terms"
                              className="text-sm font-medium leading-none text-gray-700 dark:text-white/80 cursor-pointer"
                            >
                              Accept Terms and Conditions
                            </label>
                            <p className="text-sm text-gray-500 dark:text-white/50">
                              You agree to our Terms of Service and Privacy Policy.
                            </p>
                            {errors.terms && (
                              <p className="text-xs text-red-400 mt-2">{errors.terms.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-10">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="h-14 flex-1 rounded-xl bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white"
                          disabled={isSendingOtp}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSubmit(onSubmit)}
                          className="h-14 flex-[2] rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300"
                          style={{ background: "var(--gradient-primary)" }}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Create Profile"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-white/60">
                Already have an organizer account?{" "}
                <Link
                  to="/dashboard/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors drop-shadow-[0_0_5px_rgba(242,87,29,0.3)]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Image showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-orange-50 dark:bg-[#111111] items-center justify-center p-12">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 w-full h-full max-h-[85vh] flex flex-col items-center justify-center">
          <div className="w-full relative rounded-2xl overflow-visible shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#0a0a0a]/90 via-white/20 dark:via-[#0a0a0a]/20 to-transparent z-10 pointer-events-none rounded-2xl"></div>

            <img
              src="/admin-dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full h-auto object-cover rounded-2xl border border-gray-200 dark:border-white/10"
            />

            {/* Dynamic Features Card */}
            <div className="absolute -bottom-8 left-10 right-10 z-20">
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-white/20 p-6 rounded-2xl w-full max-w-md relative min-h-[140px] shadow-2xl mx-auto lg:mx-0 flex flex-col justify-center">
                <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2 flex items-center gap-2">
                  <Building2 className="text-primary w-5 h-5" /> Join the Platform
                </h3>
                <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
                  Powering the next generation of live experiences. Manage your events, analyze
                  data, and engage your audience all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Calculator Modal */}
      <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Fee Calculator
            </DialogTitle>
            <DialogDescription>
              Estimate your earnings based on your selected plan and payment method.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-white/80">Ticket Price (RWF)</Label>
              <Input
                type="number"
                value={calcTicketPrice}
                onChange={(e) => setCalcTicketPrice(Number(e.target.value) || 0)}
                className="h-10 rounded-lg bg-gray-50 dark:bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-white/80">Expected Tickets Sold</Label>
              <Input
                type="number"
                value={calcTicketCount}
                onChange={(e) => setCalcTicketCount(Number(e.target.value) || 0)}
                className="h-10 rounded-lg bg-gray-50 dark:bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-white/80">Agatike Plan</Label>
              <Select value={calcPlanId} onValueChange={setCalcPlanId}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  {pricingPlans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-white/80">Country</Label>
              <Select value={calcCountry} onValueChange={setCalcCountry}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((c: any) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs text-gray-700 dark:text-white/80">Expected Payout Network</Label>
              <Select value={calcNetwork} onValueChange={setCalcNetwork}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                  {availableNetworks.map((n: any) => (
                    <SelectItem key={n.network} value={n.network}>
                      {n.network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-3 text-sm border border-gray-200 dark:border-white/10">
            <div className="flex justify-between text-gray-600 dark:text-white/70">
              <span>Total Ticket Sales:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{totalTicketSales.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-white/70">
              <span>Agatike Organizer Fee:</span>
              <span className="text-red-500 font-medium">- {totalOrganizerFee.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-white/70">
              <span>Estimated Wallet Balance:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{estimatedWalletBalance.toLocaleString()} RWF</span>
            </div>
            <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-white/50">
              <span>Withdrawal Fee:</span>
              <span>- {(agatikeWithdrawalFee + providerDisbursementFee).toLocaleString()} RWF</span>
            </div>
            <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
            <div className="flex justify-between font-bold text-lg text-primary">
              <span>Final Amount You Receive:</span>
              <span>{finalAmount.toLocaleString()} RWF</span>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1 text-right">
              * Note: Customer pays a separate fee of {totalCustomerFee.toLocaleString()} RWF on checkout.
            </div>
          </div>
          
          <div className="mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-gray-600 dark:text-white/70 leading-relaxed">
            <strong>Pricing Explanation:</strong> Agatike uses transparent transaction pricing. Ticket sales fees and payout processing fees are shown clearly before every withdrawal.
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsFeeModalOpen(false)}>Close Calculator</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Choose an Avatar</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 bg-muted/50">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground border border-border hover:border-input"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto">
              {avatarOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                    watch("image") === opt
                      ? "border-primary ring-4 ring-primary/10"
                      : "border-transparent bg-background shadow-sm hover:shadow"
                  }`}
                  onClick={() => {
                     setValue("image", opt);
                     setIsAvatarModalOpen(false);
                  }}
                >
                  <img
                    src={opt}
                    alt="Avatar"
                    className="w-full aspect-square object-cover mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3 bg-background">
            <Button type="button" variant="ghost" onClick={() => setIsAvatarModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Fee Calculator Button */}
      <Button
        type="button"
        onClick={() => setIsFeeModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-full shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 flex items-center gap-2 text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Calculator className="w-5 h-5" />
        <span className="font-semibold">Fee Calculator</span>
      </Button>
    </div>
  );
}
