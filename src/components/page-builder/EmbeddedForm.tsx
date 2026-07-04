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
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export function EmbeddedForm({ formId }: { formId: string }) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isPreview = formId === "preview-id";

  const { data: fetchedForm, isLoading } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: () => getFormDetails({ data: { id: formId } } as any),
    enabled: !!formId && !isPreview,
  });

  const form = isPreview
    ? {
        title: "Example Embedded Form",
        description: "This is how your embedded form will look on the page.",
        is_active: true,
        form_fields: [
          { id: "1", label: "Full Name", field_type: "text", is_required: true },
          { id: "2", label: "Email Address", field_type: "email", is_required: true },
          { id: "3", label: "Your Message", field_type: "textarea", is_required: false },
        ],
      }
    : fetchedForm;

  const { canCreateRsvp } = useSubscriptionLimits(fetchedForm?.workspace?.orgnizer_id, fetchedForm?.workspace_id);

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
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreview && !canCreateRsvp()) {
      toast.error("Form Limit Reached", {
        description: "This form has reached its maximum number of allowed responses."
      });
      return;
    }
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form || !form.is_active) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl shadow-sm border border-border/60">
        <h3 className="text-xl font-bold text-foreground">Form Unavailable</h3>
        <p className="text-muted-foreground mt-2">This form is no longer accepting responses.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="p-12 bg-card rounded-2xl shadow-sm border border-border/60 text-center animate-in zoom-in-95 duration-500">
        <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Thank You!</h3>
        <p className="text-muted-foreground mt-2">Your response has been successfully recorded.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden relative">
      <div className="p-6 border-b border-border/60 relative overflow-hidden bg-secondary/20">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{form.title}</h3>
        {form.description && (
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
            {form.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {form.form_fields.map((field: any) => {
          const options = field.options || [];

          return (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-semibold">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </Label>

              {field.field_type === "text" && (
                <Input
                  required={field.is_required}
                  className="bg-secondary/30"
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
                  className="bg-secondary/30"
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
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData[field.id] || ""}
                  onChange={(e) => updateField(field.id, e.target.value)}
                />
              )}

              {field.field_type === "file" && (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor={`file-${field.id}`}
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center">
                      {formData[field.id] ? (
                        <>
                          <FileIcon className="w-6 h-6 mb-2 text-primary" />
                          <p className="mb-1 text-sm text-foreground font-semibold">
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
                          <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Click to upload</span>
                          </p>
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
                  className="bg-secondary/30"
                  value={formData[field.id] || ""}
                  onChange={(e) => updateField(field.id, e.target.value)}
                />
              )}

              {field.field_type === "select" && (
                <Select
                  required={field.is_required}
                  onValueChange={(val) => updateField(field.id, val)}
                >
                  <SelectTrigger className="bg-secondary/30">
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
                  className="space-y-1 mt-2"
                  onValueChange={(val) => updateField(field.id, val)}
                >
                  {options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-lg border border-border/40"
                    >
                      <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                      <Label htmlFor={`${field.id}-${i}`} className="flex-1 cursor-pointer text-sm">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {field.field_type === "checkbox" && (
                <div className="space-y-1 mt-2">
                  {options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-lg border border-border/40"
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
                        className="flex-1 cursor-pointer text-sm leading-none"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                  {options.length === 0 && (
                    <div className="flex items-start space-x-2 mt-2">
                      <Checkbox
                        required={field.is_required}
                        id={field.id}
                        onCheckedChange={(checked) => updateField(field.id, checked)}
                      />
                      <Label htmlFor={field.id} className="flex-1 cursor-pointer text-sm">
                        I agree to the terms
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border/60">
          {!isPreview && !canCreateRsvp() ? (
            <div className="text-center p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-semibold mb-4">
              This form has reached its maximum response capacity.
            </div>
          ) : (
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
