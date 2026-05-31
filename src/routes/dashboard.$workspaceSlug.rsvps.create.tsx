import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Save,
  LayoutTemplate,
  Type,
  AlignLeft,
  CheckSquare,
  List,
  Calendar,
  HelpCircle,
  Loader2,
  Upload,
  MessageSquare,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCustomForm } from "@/api/rsvps";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { uploadFile } from "@/api/storage";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPLATES = [
  {
    id: "event",
    title: "Event RSVP",
    description: "Collect attendee information, dietary restrictions, and attendance confirmation.",
    icon: Calendar,
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    glowClass: "group-hover:bg-blue-500/20",
    formValues: {
      title: "Event RSVP",
      description: "Please fill out this form to confirm your attendance.",
      fields: [
        { id: "1", label: "First Name", field_type: "text", is_required: true },
        { id: "2", label: "Last Name", field_type: "text", is_required: true },
        { id: "3", label: "Email Address", field_type: "email", is_required: true },
        {
          id: "4",
          label: "Will you attend?",
          field_type: "radio",
          is_required: true,
          options: "Yes, I will be there, No, I cannot make it",
        },
        { id: "5", label: "Dietary Restrictions", field_type: "textarea", is_required: false },
      ],
    },
  },
  {
    id: "feedback",
    title: "Feedback & Survey",
    description: "Gather feedback and ratings to improve your services.",
    icon: MessageSquare,
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-500",
    glowClass: "group-hover:bg-purple-500/20",
    formValues: {
      title: "Customer Feedback",
      description: "We value your feedback. Please let us know how we did.",
      fields: [
        { id: "1", label: "First Name", field_type: "text", is_required: true },
        { id: "2", label: "Email Address", field_type: "email", is_required: true },
        {
          id: "3",
          label: "How would you rate your experience?",
          field_type: "select",
          is_required: true,
          options: "Excellent, Good, Average, Poor",
        },
        { id: "4", label: "Any additional feedback?", field_type: "textarea", is_required: false },
      ],
    },
  },
  {
    id: "contact",
    title: "Contact Information",
    description: "A simple form to collect contact details from your audience.",
    icon: Phone,
    bgClass: "bg-green-500/10",
    textClass: "text-green-500",
    glowClass: "group-hover:bg-green-500/20",
    formValues: {
      title: "Contact Information",
      description: "Leave your details and we will get back to you.",
      fields: [
        { id: "1", label: "First Name", field_type: "text", is_required: true },
        { id: "2", label: "Last Name", field_type: "text", is_required: true },
        { id: "3", label: "Email Address", field_type: "email", is_required: true },
        { id: "4", label: "Phone Number", field_type: "text", is_required: false },
        { id: "5", label: "Company", field_type: "text", is_required: false },
      ],
    },
  },
  {
    id: "blank",
    title: "Start from Scratch",
    description: "Start with a blank canvas and build exactly what you need.",
    icon: FileText,
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-500",
    glowClass: "group-hover:bg-orange-500/20",
    formValues: {
      title: "",
      description: "",
      fields: [
        { id: "1", label: "First Name", field_type: "text", is_required: true },
        { id: "2", label: "Last Name", field_type: "text", is_required: true },
        { id: "3", label: "Email Address", field_type: "email", is_required: true },
      ],
    },
  },
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/create")({
  component: CreateFormPage,
});

const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  field_type: z.enum(["text", "textarea", "email", "select", "checkbox", "radio"]),
  is_required: z.boolean().default(false),
  options: z.string().optional(), // We'll store comma-separated options for simplicity in UI, then save as JSON
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  fields: z.array(fieldSchema).min(1, "Add at least one field"),
});

type FormValues = z.infer<typeof formSchema>;

function CreateFormPage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug } = Route.useParams();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setCoverFile(f);
    const url = URL.createObjectURL(f);
    setValue("cover_image_url", url);
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: TEMPLATES[3].formValues as any,
  });

  const handleSelectTemplate = (template: (typeof TEMPLATES)[0]) => {
    reset(template.formValues as any);
    setSelectedTemplate(template.id);
  };

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "fields",
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let finalCoverUrl = values.cover_image_url || "";
      if (coverFile) {
        try {
          const base64 = await fileToBase64(coverFile);
          const ext = coverFile.name.split(".").pop() || "jpg";
          const res = await uploadFile({
            data: { base64, contentType: coverFile.type, folder: "forms/covers", ext },
          } as any);
          finalCoverUrl = res.url;
        } catch (err) {
          console.error("Cover upload failed:", err);
          throw new Error("Cover image upload failed. Please try again.");
        }
      }

      // Format fields for Hasura insertion
      const formattedFields = values.fields.map((f, index) => ({
        label: f.label,
        field_type: f.field_type,
        is_required: f.is_required,
        order: index,
        options: f.options ? f.options.split(",").map((s) => s.trim()) : [],
      }));

      return createCustomForm({
        data: {
          workspace_id: activeWorkspace?.id,
          title: values.title,
          description: values.description,
          event_id: null,
          cover_image_url: finalCoverUrl,
          is_active: true,
          form_fields: {
            data: formattedFields,
          },
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Form created successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspace-forms"] });
      navigate({ to: "/dashboard/$workspaceSlug/rsvps", params: { workspaceSlug } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create form");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const addField = (type: "text" | "textarea" | "email" | "select" | "checkbox" | "radio") => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      label: "New Field",
      field_type: type,
      is_required: false,
      options: type === "select" || type === "radio" ? "Option 1, Option 2" : "",
    });
  };

  if (!selectedTemplate) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary/50 hover:bg-secondary"
            onClick={() =>
              navigate({ to: "/dashboard/$workspaceSlug/rsvps", params: { workspaceSlug } })
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Choose a Template</h1>
            <p className="text-muted-foreground mt-1 text-base">
              Select a starting point for your new form.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="group relative bg-card border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col items-start"
                onClick={() => handleSelectTemplate(t)}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${t.bgClass} rounded-full blur-3xl -mr-10 -mt-10 ${t.glowClass} transition-colors`}
                />
                <div
                  className={`h-12 w-12 rounded-full ${t.bgClass} ${t.textClass} flex items-center justify-center mb-4 relative z-10`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">{t.title}</h3>
                <p className="text-muted-foreground text-sm relative z-10 flex-1">
                  {t.description}
                </p>
                <div className="mt-6 font-semibold text-sm text-primary flex items-center group-hover:translate-x-1 transition-transform relative z-10">
                  Use Template <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/60">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setSelectedTemplate(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Form</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() =>
              navigate({ to: "/dashboard/$workspaceSlug/rsvps", params: { workspaceSlug } })
            }
          >
            Cancel
          </Button>
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save & Publish
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Form General Settings */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <LayoutTemplate className="mr-2 h-5 w-5 text-primary" /> Form Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                These details will be shown at the top of your public form.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  {...register("title")}
                  className="h-12 text-lg font-medium rounded-xl bg-secondary/50"
                  placeholder="e.g., Tech Innovators RSVP"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  {...register("description")}
                  className="flex min-h-[100px] w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Provide instructions or details about the event..."
                />
              </div>
            </div>
          </div>

          {/* Fields Builder */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/60 bg-secondary/20">
              <h2 className="text-lg font-semibold flex items-center">
                <List className="mr-2 h-5 w-5 text-primary" /> Form Fields
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Customize the questions you want to ask attendees.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {fields.map((field, index) => {
                const fType = watch(`fields.${index}.field_type`);
                const needsOptions = fType === "select" || fType === "radio";

                return (
                  <div
                    key={field.id}
                    className="group relative rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md flex gap-4"
                  >
                    <div className="flex-none pt-2 cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Question Label
                          </Label>
                          <Input
                            {...register(`fields.${index}.label`)}
                            className="font-medium bg-transparent border-t-0 border-l-0 border-r-0 rounded-none border-b-2 border-muted focus-visible:ring-0 focus-visible:border-primary px-0 pb-1 h-auto"
                          />
                          {errors.fields?.[index]?.label && (
                            <p className="text-xs text-red-500">
                              {errors.fields[index]?.label?.message}
                            </p>
                          )}
                        </div>
                        <div className="w-48 space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Type
                          </Label>
                          <Select
                            value={fType}
                            onValueChange={(val) =>
                              setValue(`fields.${index}.field_type`, val as any)
                            }
                          >
                            <SelectTrigger className="h-9 rounded-lg bg-secondary/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Short Text</SelectItem>
                              <SelectItem value="textarea">Long Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="radio">Multiple Choice</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {needsOptions && (
                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Options (Comma separated)
                          </Label>
                          <Input
                            {...register(`fields.${index}.options`)}
                            className="bg-secondary/30 h-9"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            {...register(`fields.${index}.is_required`)}
                            className="rounded border-muted text-primary focus:ring-primary"
                          />
                          Required Field
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {errors.fields?.root && (
                <p className="text-sm text-red-500 font-medium">{errors.fields.root.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Add Field
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => addField("text")}
              >
                <Type className="h-5 w-5 text-primary" />
                <span className="text-xs">Short Text</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => addField("textarea")}
              >
                <AlignLeft className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Long Text</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => addField("select")}
              >
                <List className="h-5 w-5 text-purple-500" />
                <span className="text-xs">Dropdown</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => addField("radio")}
              >
                <CheckSquare className="h-5 w-5 text-green-500" />
                <span className="text-xs">Choice</span>
              </Button>
            </div>

            <div className="mt-8 border-t border-border/60 pt-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <label className="block aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 transition hover:border-primary relative group">
                    {watch("cover_image_url") ? (
                      <img
                        src={watch("cover_image_url")}
                        alt="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">
                        <div className="text-center">
                          <Upload className="mx-auto h-6 w-6" />
                          <p className="mt-2">Click to upload (Max 5MB)</p>
                        </div>
                      </div>
                    )}
                    {watch("cover_image_url") && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <p className="text-sm font-medium">Click to change</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" hidden onChange={onCoverUpload} />
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Or paste image URL</Label>
                  <Input
                    {...register("cover_image_url")}
                    className="bg-secondary/50 h-9 text-sm"
                    placeholder="https://..."
                    onChange={(e) => {
                      setValue("cover_image_url", e.target.value);
                      setCoverFile(null);
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Optional banner image for the form.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
