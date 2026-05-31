import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFormDetails, createRSVP } from "@/api/rsvps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2, UploadCloud, FileIcon } from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/f/$formId")({
  component: PublicFormPage,
});

function PublicFormPage() {
  const { formId } = Route.useParams();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: form, isLoading } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: () => getFormDetails({ data: { id: formId } } as any),
    enabled: !!formId,
  });

  const mutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      // Find standard fields if available or use fallbacks
      const standardFirstName = values["first_name"] || "";
      const standardLastName = values["last_name"] || "";
      const standardEmail = values["email"] || "";

      // Create answers array for custom fields
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
    mutation.mutate(formData);
  };

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
      const url = await uploadFileToStorage(file, `form_uploads/${formId}`);
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

  if (!form || !form.is_active) {
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
            {form ? form.title : "Form Unavailable"}
          </h1>
          <p className="text-muted-foreground mt-3 relative z-10 text-base">
            This form is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="bg-card p-12 rounded-2xl shadow-sm border border-border/60 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Thank You!</h1>
          <p className="text-muted-foreground mt-2">
            Your response has been successfully recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
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
          <div className="p-8 border-b border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground relative z-10">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-base text-muted-foreground mt-3 relative z-10 whitespace-pre-wrap leading-relaxed">
                {form.description}
              </p>
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
                        // Also store as standard email field if label looks like email
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

                  {/* First/last name binding is handled in the text field's onChange */}
                </div>
              );
            })}

            <div className="pt-6 border-t border-border/60">
              <Button
                type="submit"
                className="w-full h-14 text-lg rounded-xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit"}
              </Button>
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
  );
}
