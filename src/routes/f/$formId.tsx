import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFormDetails, createRSVP } from "@/api/rsvps";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2, UploadCloud, FileIcon, ArrowLeft } from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { buildStoragePath } from "@/api/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { CheckYourPhone } from "@/components/shared/CheckYourPhone";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";

export const Route = createFileRoute("/f/$formId")({
  component: PublicFormPage,
});

function PublicFormPage() {
  const { formId } = Route.useParams();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Read payment config from URL query params (stable, won't change)
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const isPaymentMode = searchParams.get("pay") === "1";
  const paymentAmount = searchParams.get("amount") || "";
  const paymentLabel = searchParams.get("label") || "";
  const paymentDescription = searchParams.get("description") || "";
  const paymentWorkspaceIdFromUrl = searchParams.get("workspace_id") || "";
  const paymentColor = searchParams.get("color") || "";
  const paymentSlug = searchParams.get("slug") || "";

  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("MTN_MOMO_RWA");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  const { data: form, isLoading } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: () => getFormDetails({ data: { id: formId } } as any),
    enabled: !!formId,
  });

  // Fetch the landing page to get logo and back URL
  const { data: landingPage } = useQuery({
    queryKey: ["workspace-page-slug", paymentSlug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug: paymentSlug } } as any),
    enabled: !!paymentSlug,
  });

  // Use form's own workspace_id as authoritative fallback (form.workspace_id resolves after query)
  const paymentWorkspaceId = paymentWorkspaceIdFromUrl || form?.workspace_id || "";

  const { canCreateRsvp } = useSubscriptionLimits(form?.workspace?.orgnizer_id, form?.workspace_id);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const standardFirstName = values["first_name"] || "";
      const standardLastName = values["last_name"] || "";
      const standardEmail = values["email"] || "";

      const customAnswers = form.form_fields.map((field: any) => ({
        field_id: field.id,
        answer_value: Array.isArray(values[field.id])
          ? JSON.stringify(values[field.id])
          : String(values[field.id] || ""),
      }));

      return createRSVP({
        data: {
          form_id: formId,
          user_id: null,
          first_name: standardFirstName,
          last_name: standardLastName,
          email: standardEmail,
          status: "Submitted",
          rsvp_answers: {
            data: customAnswers,
          },
        },
      } as any);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateRsvp()) {
      toast.error("Form Limit Reached", {
        description: "This form has reached its maximum number of allowed responses.",
      });
      return;
    }

    if (isPaymentMode) {
      // Save form data and open payment modal
      setPendingFormData({ ...formData });
      setIsPaymentModalOpen(true);
    } else {
      mutation.mutate(formData);
    }
  };

  const doPayment = async (details: any) => {
    setIsProcessingPayment(true);
    setIsPaymentModalOpen(false); // Close modal immediately so CheckYourPhone appears faster
    try {
      const pawaRes = await initiatePawaPayDeposit({
        data: {
          amount: Number(paymentAmount || 0),
          phone: details.phone,
          network: details.network,
          currency: details.currency || "RWF",
          type: `page_builder_checkout::${paymentSlug || "unknown"}`,
          referenceId: crypto.randomUUID(),
          workspaceId: form?.workspace_id || paymentWorkspaceId,
          reason: paymentLabel || "Page Payment",
          shortfall: details.shortfall || 0,
        },
      } as any);

      setPawapayDepositId(pawaRes.depositId);
      setIsPollingPawaPay(true);
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (!isPollingPawaPay || !pawapayDepositId) return;

    let done = false; // local guard — prevents double mutation if interval fires before clearInterval

    const intervalId = setInterval(async () => {
      if (done) return;
      try {
        const res = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
        if (
          res?.status?.toLowerCase() === "completed" ||
          res?.status?.toLowerCase() === "success"
        ) {
          if (done) return;
          done = true;
          clearInterval(intervalId); // stop immediately — don't wait for cleanup
          setIsPollingPawaPay(false);
          toast.success("Payment successful!");
          if (pendingFormData) {
            mutation.mutate(pendingFormData);
          }
        } else if (res?.status?.toLowerCase() === "failed") {
          if (done) return;
          done = true;
          clearInterval(intervalId);
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => {
      done = true;
      clearInterval(intervalId);
    };
  }, [isPollingPawaPay, pawapayDepositId]);

  const updateField = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File is too large (max 5MB)");
    }
    const loadingToast = toast.loading("Uploading file...");
    try {
      const folderPath = buildStoragePath("public", "forms", formId, "uploads");
      const url = await uploadFileToStorage(file, folderPath);
      updateField(fieldId, url);
      toast.success("File uploaded successfully", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to upload file", { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form || !form.is_active || form.is_expired) {
    const coverImage = form?.cover_image_url || "/default-form-cover.png";
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
        </div>

        <div className="relative z-10 bg-card p-10 rounded-3xl shadow-2xl border border-border/50 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-3xl" />
          <h1 className="text-3xl font-bold text-foreground relative z-10">
            {form ? (form.is_expired ? "Subscription Expired" : form.title) : "Form Unavailable"}
          </h1>
          <p className="text-muted-foreground mt-3 relative z-10 text-base">
            {form?.is_expired
              ? "This form is temporarily unavailable due to workspace limits."
              : "This form is no longer accepting responses."}
          </p>
        </div>
      </div>
    );
  }

  const themeColor = paymentColor || "var(--primary)";
  const pageTitle = isPaymentMode && paymentLabel ? paymentLabel : form.title;
  const pageDescription =
    isPaymentMode && paymentDescription ? paymentDescription : form.description;

  // Back URL: if we came from a page builder slug, navigate back there
  const backUrl = paymentSlug
    ? typeof window !== "undefined"
      ? `${window.location.protocol}//${paymentSlug}.${window.location.host.replace(/^[^.]+\./, "")}`
      : "/"
    : "/";

  const logoUrl = landingPage?.logo_url || "";

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary/20">
        {/* Branded header */}
        {isPaymentMode && (
          <div className="w-full px-4 py-3 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <a
              href={backUrl}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to page
            </a>
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />}
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-card p-12 rounded-2xl shadow-sm border border-border/60 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Thank You!</h1>
            <p className="text-muted-foreground mt-2">
              {isPaymentMode
                ? "Your payment and registration have been successfully recorded."
                : "Your response has been successfully recorded."}
            </p>
            {isPaymentMode && paymentSlug && (
              <a
                href={backUrl}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {paymentSlug}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen "Check Your Phone" overlay — show immediately when processing starts */}
      {(isPollingPawaPay || isProcessingPayment) && (
        <CheckYourPhone
          amount={Number(paymentAmount) || undefined}
          themeColor={themeColor}
          onCancel={async () => {
            setIsPollingPawaPay(false);
            setIsProcessingPayment(false);
            if (pawapayDepositId) {
              try {
                await cancelPendingPayment({ data: { depositId: pawapayDepositId } } as any);
              } catch (e) {
                console.error("Cancel cleanup failed:", e);
              }
            }
          }}
        />
      )}

      <div className="min-h-screen bg-secondary/20 pb-20">
        {/* Branded sticky header */}
        {isPaymentMode && (
          <div className="w-full px-4 py-3 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <a
              href={backUrl}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to page
            </a>
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />}
          </div>
        )}
        <div className="w-full h-48 md:h-64 lg:h-80 relative">
          <img
            src={form.cover_image_url || "/default-form-cover.png"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
            <div
              className="p-8 border-b border-border/60 relative overflow-hidden"
              style={{
                background: isPaymentMode
                  ? `linear-gradient(135deg, ${themeColor}15, transparent)`
                  : undefined,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground relative z-10">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="text-base text-muted-foreground mt-3 relative z-10 whitespace-pre-wrap leading-relaxed">
                  {pageDescription}
                </p>
              )}
              {isPaymentMode && paymentAmount && (
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white relative z-10"
                  style={{ backgroundColor: themeColor }}
                >
                  Amount: {Number(paymentAmount).toLocaleString()} RWF
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {form.form_fields.map((field: any) => {
                const options = field.options || [];

                return (
                  <div key={field.id} className="space-y-3">
                    <Label className="text-base font-semibold">
                      {field.label} {field.is_required && <span className="text-red-500">*</span>}
                    </Label>

                    {field.field_type === "text" && (
                      <Input
                        required={field.is_required}
                        className="h-12 bg-secondary/50 rounded-xl"
                        value={formData[field.id] || ""}
                        onChange={(e) => {
                          updateField(field.id, e.target.value);
                          if (field.label.toLowerCase().includes("first name")) {
                            updateField("first_name", e.target.value);
                          }
                          if (field.label.toLowerCase().includes("last name")) {
                            updateField("last_name", e.target.value);
                          }
                        }}
                      />
                    )}

                    {field.field_type === "email" && (
                      <Input
                        type="email"
                        required={field.is_required}
                        className="h-12 bg-secondary/50 rounded-xl"
                        value={formData[field.id] || ""}
                        onChange={(e) => {
                          updateField(field.id, e.target.value);
                          if (field.label.toLowerCase().includes("email")) {
                            updateField("email", e.target.value);
                          }
                        }}
                      />
                    )}

                    {field.field_type === "textarea" && (
                      <textarea
                        required={field.is_required}
                        className="flex min-h-[120px] w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData[field.id] || ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                      />
                    )}

                    {field.field_type === "file" && (
                      <div className="flex flex-col gap-3">
                        <Label
                          htmlFor={`file-${field.id}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {formData[field.id] ? (
                              <>
                                <FileIcon className="w-8 h-8 mb-3 text-primary" />
                                <p className="mb-2 text-sm text-foreground font-semibold">
                                  File Uploaded
                                </p>
                                <a
                                  href={formData[field.id]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary underline truncate max-w-[200px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View File
                                </a>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold text-foreground">
                                    Click to upload
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">Max file size: 5MB</p>
                              </>
                            )}
                          </div>
                          <input
                            id={`file-${field.id}`}
                            type="file"
                            className="hidden"
                            required={field.is_required && !formData[field.id]}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(field.id, file);
                            }}
                          />
                        </Label>
                      </div>
                    )}

                    {field.field_type === "date" && (
                      <Input
                        type="date"
                        required={field.is_required}
                        className="h-12 bg-secondary/50 rounded-xl"
                        value={formData[field.id] || ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                      />
                    )}

                    {field.field_type === "select" && (
                      <Select
                        required={field.is_required}
                        onValueChange={(val) => updateField(field.id, val)}
                      >
                        <SelectTrigger className="h-12 bg-secondary/50 rounded-xl">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt: string, i: number) => (
                            <SelectItem key={i} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.field_type === "radio" && (
                      <RadioGroup
                        required={field.is_required}
                        className="space-y-2 mt-2"
                        onValueChange={(val) => updateField(field.id, val)}
                      >
                        {options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-xl border border-border/40 hover:border-border transition-colors"
                          >
                            <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                            <Label htmlFor={`${field.id}-${i}`} className="flex-1 cursor-pointer">
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.field_type === "checkbox" && (
                      <div className="space-y-2 mt-2">
                        {options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-xl border border-border/40 hover:border-border transition-colors"
                          >
                            <Checkbox
                              id={`${field.id}-${i}`}
                              onCheckedChange={(checked) => {
                                const currentArr = formData[field.id] || [];
                                if (checked) {
                                  updateField(field.id, [...currentArr, opt]);
                                } else {
                                  updateField(
                                    field.id,
                                    currentArr.filter((val: string) => val !== opt),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`${field.id}-${i}`}
                              className="flex-1 cursor-pointer leading-normal"
                            >
                              {opt}
                            </Label>
                          </div>
                        ))}
                        {options.length === 0 && (
                          <div className="flex items-start space-x-3 mt-2">
                            <Checkbox
                              required={field.is_required}
                              id={field.id}
                              onCheckedChange={(checked) => updateField(field.id, checked)}
                            />
                            <Label
                              htmlFor={field.id}
                              className="flex-1 cursor-pointer leading-normal"
                            >
                              I agree to the terms
                            </Label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-6 border-t border-border/60">
                {!canCreateRsvp() ? (
                  <div className="text-center p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold mb-4">
                    This form has reached its maximum response capacity and is no longer accepting
                    submissions.
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg rounded-xl font-bold shadow-lg"
                    style={
                      isPaymentMode
                        ? { backgroundColor: themeColor, color: "#fff" }
                        : { background: "var(--gradient-primary)" }
                    }
                    disabled={mutation.isPending || isProcessingPayment}
                  >
                    {mutation.isPending || isProcessingPayment ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : isPaymentMode ? (
                      `Pay ${Number(paymentAmount).toLocaleString()} RWF & Register`
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-center">
              Powered by <span className="ml-1 font-bold text-foreground">Agatike Connect</span>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentMode && form && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onProceed={doPayment}
          baseAmount={Number(paymentAmount) || 0}
          baseCurrency="RWF"
          itemLabel={paymentLabel || form.title}
          themeColor={themeColor}
          workspaceId={form.workspace_id || paymentWorkspaceId}
          isProcessing={isProcessingPayment}
          isGenerating={false}
        />
      )}
    </>
  );
}
