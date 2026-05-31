import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFormDetails, createRSVP } from "@/api/rsvps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
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
      const standardFirstName = values['first_name'] || '';
      const standardLastName = values['last_name'] || '';
      const standardEmail = values['email'] || '';

      // Create answers array for custom fields
      const customAnswers = form.form_fields.map((field: any) => ({
        field_id: field.id,
        answer_value: Array.isArray(values[field.id]) ? JSON.stringify(values[field.id]) : String(values[field.id] || ''),
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
            data: customAnswers
          }
        }
      } as any);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const updateField = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form || !form.is_active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/60 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-foreground">Form Unavailable</h1>
          <p className="text-muted-foreground mt-2">This form is no longer accepting responses or does not exist.</p>
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
          <p className="text-muted-foreground mt-2">Your response has been successfully recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
      {form.cover_image_url && (
        <div className="w-full h-48 md:h-64 lg:h-80 relative">
          <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <div className={`max-w-2xl mx-auto px-4 ${form.cover_image_url ? '-mt-16 md:-mt-24 relative z-10' : 'pt-12'}`}>
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
          <div className="p-8 border-b border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground relative z-10">{form.title}</h1>
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
                      value={formData[field.id] || ''}
                      onChange={(e) => {
                        updateField(field.id, e.target.value);
                        if (field.label.toLowerCase().includes('first name')) {
                          updateField('first_name', e.target.value);
                        }
                        if (field.label.toLowerCase().includes('last name')) {
                          updateField('last_name', e.target.value);
                        }
                      }}
                    />
                  )}

                  {field.field_type === "email" && (
                    <Input 
                      type="email"
                      required={field.is_required}
                      className="h-12 bg-secondary/50 rounded-xl"
                      value={formData[field.id] || ''}
                      onChange={(e) => {
                        updateField(field.id, e.target.value);
                        // Also store as standard email field if label looks like email
                        if (field.label.toLowerCase().includes('email')) {
                          updateField('email', e.target.value);
                        }
                      }}
                    />
                  )}

                  {field.field_type === "textarea" && (
                    <textarea 
                      required={field.is_required}
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData[field.id] || ''}
                      onChange={(e) => updateField(field.id, e.target.value)}
                    />
                  )}

                  {field.field_type === "select" && (
                    <Select required={field.is_required} onValueChange={(val) => updateField(field.id, val)}>
                      <SelectTrigger className="h-12 bg-secondary/50 rounded-xl">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt: string, i: number) => (
                          <SelectItem key={i} value={opt}>{opt}</SelectItem>
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
                        <div key={i} className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-xl border border-border/40 hover:border-border transition-colors">
                          <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                          <Label htmlFor={`${field.id}-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {field.field_type === "checkbox" && (
                    <div className="space-y-2 mt-2">
                      {options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-xl border border-border/40 hover:border-border transition-colors">
                          <Checkbox 
                            id={`${field.id}-${i}`} 
                            onCheckedChange={(checked) => {
                              const currentArr = formData[field.id] || [];
                              if (checked) {
                                updateField(field.id, [...currentArr, opt]);
                              } else {
                                updateField(field.id, currentArr.filter((val: string) => val !== opt));
                              }
                            }}
                          />
                          <Label htmlFor={`${field.id}-${i}`} className="flex-1 cursor-pointer leading-normal">{opt}</Label>
                        </div>
                      ))}
                      {options.length === 0 && (
                        <div className="flex items-start space-x-3 mt-2">
                          <Checkbox 
                            required={field.is_required}
                            id={field.id} 
                            onCheckedChange={(checked) => updateField(field.id, checked)}
                          />
                          <Label htmlFor={field.id} className="flex-1 cursor-pointer leading-normal">
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
