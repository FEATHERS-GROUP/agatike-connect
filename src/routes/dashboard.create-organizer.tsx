import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createOrganizerAccount, checkOrganizerHandle } from "@/api/organizers";
import { getUserByHandle } from "@/api/users";
import { 
  Building2, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Search, 
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export const Route = createFileRoute("/dashboard/create-organizer")({
  component: CreateOrganizerPage,
});

const AVAILABLE_FIELDS = [
  "Music & Concerts", "Nightlife", "Tech & Innovation", 
  "Business & Networking", "Sports", "Arts & Culture", 
  "Food & Beverage", "Comedy", "Workshops"
];

const AVAILABLE_SPECIALITIES = [
  "EDM & House", "Afrobeats", "Hip Hop", "Live Bands",
  "VIP Experiences", "Conferences", "Gala Dinners", 
  "Exhibitions", "Brand Activations"
];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  handle: z.string().min(3, "Handle must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
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
  business: z.boolean().default(false),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormValues = z.infer<typeof formSchema>;

function CreateOrganizerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isGeneratingHandle, setIsGeneratingHandle] = useState(false);
  
  const [syncHandle, setSyncHandle] = useState("");
  const [syncUserId, setSyncUserId] = useState<string | null>(null);

  // Existing User Lookup Query
  const { data: linkedUser, isFetching: isLookingUpUser, refetch: lookupUser } = useQuery({
    queryKey: ["userLookup", syncHandle],
    queryFn: async () => await getUserByHandle({ data: { handle: syncHandle } }),
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

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<FormValues>({
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
    }
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
      const baseHandle = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '');
      
      try {
        let isAvailable = await checkOrganizerHandle({ data: { handle: baseHandle } });
        if (isAvailable) {
          setValue("handle", baseHandle, { shouldValidate: true });
        } else {
          let suffix = 1;
          let newHandle = "";
          while (!isAvailable && suffix < 100) {
            newHandle = `${baseHandle}${suffix.toString().padStart(2, '0')}`;
            isAvailable = await checkOrganizerHandle({ data: { handle: newHandle } });
            suffix++;
          }
          setValue("handle", newHandle, { shouldValidate: true });
        }
      } catch (error) {
        // Fallback if API fails
        setValue("handle", baseHandle, { shouldValidate: true });
      } finally {
        setIsGeneratingHandle(false);
      }
    };

    const timeoutId = setTimeout(() => {
      generateUnique();
    }, 600); // Debounce to prevent API spam while typing

    return () => clearTimeout(timeoutId);
  }, [nameValue, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { terms, confirm_password, instagram, tiktok, youtube, ...restValues } = values;
      const payload = {
        ...restValues,
        field: values.field.join(", "),
        user_id: syncUserId,
        speciality: values.speciality && values.speciality.length > 0 ? { tags: values.speciality } : {},
        socials: { instagram, tiktok, youtube }, 
      };
      return await createOrganizerAccount({ data: payload });
    },
    onSuccess: () => {
      toast.success("Profile created! Please log in with your new credentials.");
      navigate({ to: "/dashboard/login" });
    },
    onError: (error) => {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 3) {
      fieldsToValidate = ['name', 'handle', 'email', 'phone'];
    }
    if (step === 4) {
      fieldsToValidate = ['field', 'numberOfEvents'];
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
    <div className="min-h-screen bg-secondary/20 pb-20">
      <div className="bg-background border-b border-border/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Organizer Profile</h1>
            <p className="text-sm text-muted-foreground">Join Agatike and start managing premium events.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-full rounded-full transition-all ${
                i + 1 <= step ? 'bg-primary' : 'bg-secondary/60'
              }`} 
            />
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-8">
          
          {/* STEP 1: Account Type */}
          {step === 1 && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Account Type</h2>
                <p className="text-muted-foreground">Select how you will be operating on Agatike.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Card */}
                <div 
                  onClick={() => setValue("business", false)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    !isBusiness 
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                    : "border-border/60 hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${!isBusiness ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <User className="h-6 w-6" />
                    </div>
                    {!isBusiness && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Personal</h3>
                  <p className="text-sm text-muted-foreground">For individuals, freelancers, and independent event organizers.</p>
                </div>

                {/* Business Card */}
                <div 
                  onClick={() => setValue("business", true)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isBusiness 
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                    : "border-border/60 hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isBusiness ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    {isBusiness && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Registered Business</h3>
                  <p className="text-sm text-muted-foreground">For registered companies, venues, and professional agencies.</p>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: Sync Account */}
          {step === 2 && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Already on Agatike?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  If you already have a standard user account, you can sync it to your new organizer profile. This is completely optional.
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter your user @handle" 
                      className="pl-9 h-12 bg-secondary/50 rounded-xl text-lg"
                      value={syncHandle}
                      onChange={(e) => setSyncHandle(e.target.value)}
                      disabled={!!syncUserId}
                    />
                  </div>
                  {syncUserId ? (
                    <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => { setSyncUserId(null); setSyncHandle(""); }}>
                      Unlink
                    </Button>
                  ) : (
                    <Button variant="secondary" className="h-12 rounded-xl px-6" onClick={handleLookup} disabled={isLookingUpUser}>
                      {isLookingUpUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                    </Button>
                  )}
                </div>
                
                {syncUserId && linkedUser && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5" /> Successfully linked with {linkedUser.username}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 3: Basic Info */}
          {step === 3 && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name / Organization Name *</Label>
                  <Input {...register("name")} className="h-11 rounded-xl bg-secondary/50" placeholder="e.g. Kigali Events Co." />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Unique Handle *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input {...register("handle")} readOnly className="pl-8 pr-10 h-11 rounded-xl bg-secondary/30 text-muted-foreground cursor-not-allowed" placeholder="kigali_events" />
                    {isGeneratingHandle && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  {errors.handle && <p className="text-xs text-red-500">{errors.handle.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input {...register("email")} type="email" className="h-11 rounded-xl bg-secondary/50" placeholder="hello@example.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input {...register("phone")} type="tel" className="h-11 rounded-xl bg-secondary/50" placeholder="+250 700 000 000" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                
                {!isBusiness && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>National ID / Passport (Upload Document/Image)</Label>
                    <label className="flex h-16 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors">
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
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {watch("national_id") ? (
                          <><CheckCircle2 className="h-5 w-5 text-green-500" /> Document Attached</>
                        ) : (
                          "Click to upload ID/Passport"
                        )}
                      </span>
                    </label>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Date of Birth / Inception Date</Label>
                  <Input {...register("dateOfBirth")} type="date" className="h-11 rounded-xl bg-secondary/50" />
                </div>

                {!isBusiness && (
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => setValue("gender", v)}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/50">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 4: Expertise */}
          {step === 4 && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Expertise & Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 md:col-span-2">
                  <Label>Primary Fields *</Label>
                  <p className="text-xs text-muted-foreground mt-0">Select all that apply to your events.</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FIELDS.map(f => {
                      const currentFields = watch("field") || [];
                      const isSelected = currentFields.includes(f);
                      return (
                        <div 
                          key={f}
                          onClick={() => {
                            if (isSelected) {
                              setValue("field", currentFields.filter(item => item !== f), { shouldValidate: true });
                            } else {
                              setValue("field", [...currentFields, f], { shouldValidate: true });
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                            isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-secondary/30 border-border/60 hover:bg-secondary/60 text-muted-foreground"
                          }`}
                        >
                          {f}
                        </div>
                      );
                    })}
                  </div>
                  {errors.field && <p className="text-xs text-red-500">{errors.field.message}</p>}
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <Label>Speciality Tags (Optional)</Label>
                  <p className="text-xs text-muted-foreground mt-0">Select specific niches you excel in.</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SPECIALITIES.map(s => {
                      const currentSpecs = watch("speciality") || [];
                      const isSelected = currentSpecs.includes(s);
                      return (
                        <div 
                          key={s}
                          onClick={() => {
                            if (isSelected) {
                              setValue("speciality", currentSpecs.filter(item => item !== s), { shouldValidate: true });
                            } else {
                              setValue("speciality", [...currentSpecs, s], { shouldValidate: true });
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                            isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-secondary/30 border-border/60 hover:bg-secondary/60 text-muted-foreground"
                          }`}
                        >
                          {s}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Estimated Events Per Year *</Label>
                  <Select onValueChange={(v) => setValue("numberOfEvents", v, { shouldValidate: true })}>
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/50">
                      <SelectValue placeholder="Select volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10">0 - 10 events</SelectItem>
                      <SelectItem value="11-50">11 - 50 events</SelectItem>
                      <SelectItem value="50+">50+ events</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.numberOfEvents && <p className="text-xs text-red-500">{errors.numberOfEvents.message}</p>}
                </div>
                
                <div className="space-y-2 md:col-span-2 mt-4">
                  <Label>Organizer Bio</Label>
                  <Textarea {...register("bio")} className="min-h-[120px] rounded-xl bg-secondary/50 resize-none" placeholder="Tell attendees about your organization..." />
                </div>
                
                <div className="space-y-4 md:col-span-2 mt-2">
                  <Label>Social Media Links (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Instagram</Label>
                      <Input {...register("instagram")} placeholder="@handle" className="h-11 rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">TikTok</Label>
                      <Input {...register("tiktok")} placeholder="@handle" className="h-11 rounded-xl bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">YouTube</Label>
                      <Input {...register("youtube")} placeholder="Channel URL" className="h-11 rounded-xl bg-secondary/50" />
                    </div>
                  </div>
                </div>
                
                {isBusiness && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Business Certificate (Upload Document/Image)</Label>
                    <label className="flex h-16 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors">
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
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {watch("business_cert") ? (
                          <><CheckCircle2 className="h-5 w-5 text-green-500" /> Certificate Attached</>
                        ) : (
                          "Click to upload certificate"
                        )}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 5: Security & Agreement */}
          {step === 5 && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Security & Agreement</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Secure Password *</Label>
                  <Input {...register("password")} type="password" className="h-11 rounded-xl bg-secondary/50" placeholder="••••••••" />
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input {...register("confirm_password")} type="password" className="h-11 rounded-xl bg-secondary/50" placeholder="••••••••" />
                  {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
                </div>

                <div className="md:col-span-2 flex items-center space-x-3 mt-4 mb-2">
                  <Checkbox 
                    id="terms" 
                    checked={watch("terms")} 
                    onCheckedChange={(checked) => setValue("terms", checked as boolean, { shouldValidate: true })} 
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="terms" className="font-normal text-muted-foreground cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </Label>
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || mutation.isPending}
              className="rounded-xl h-12 px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="rounded-xl h-12 px-8 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit(onSubmit)} 
                disabled={mutation.isPending}
                className="rounded-xl h-12 px-8 shadow-[var(--shadow-glow)] gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Launch Profile
              </Button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
