import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWorkspacePages,
  getWorkspacePage,
  upsertWorkspacePage,
  deleteWorkspacePage,
} from "@/api/workspace-pages";
import { getWorkspaceForms } from "@/api/rsvps";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  GripVertical,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Trash2,
  LayoutTemplate,
  Columns,
  AlignLeft,
  AlignRight,
  Link2,
  Users2,
  Grid,
  FileText,
  ExternalLink,
  Eye,
  Globe,
  ChevronRight,
  Pencil,
  Check,
  X,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { PAGE_TEMPLATES } from "@/lib/page-templates";

export const Route = createFileRoute("/dashboard/$workspaceSlug/page-builder/editor")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      pageId: search.pageId as string | undefined,
      templateId: search.templateId as string | undefined,
    };
  },
  component: PageBuilder,
});

// ─── Blank page factory ────────────────────────────────────────────────────────
function makeBlankPage() {
  return {
    id: null as string | null,
    slug: "",
    title: "",
    description: "",
    themeColor: "#000000",
    headerImageUrl: "",
    logoUrl: "",
    logoPosition: "hero" as "hero" | "navbar",
    fontFamily: "Inter",
    components: [] as any[],
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────
function PageBuilder() {
  const { pageId, templateId } = Route.useSearch();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const workspace_id = activeWorkspace?.id;
  const queryClient = useQueryClient();

  // Which page is being edited
  const [activePageId, setActivePageId] = useState<string | null>(pageId || null);
  const [editorState, setEditorState] = useState(makeBlankPage());
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Fetch: individual page when activePageId changes ──────────────────────
  const { data: pageData, isLoading: isLoadingPage } = useQuery({
    queryKey: ["workspace-page", activePageId],
    queryFn: () => getWorkspacePage({ data: { id: activePageId } } as any),
    enabled: !!activePageId,
  });

  // ── Forms for linking ─────────────────────────────────────────────────────
  const { data: forms = [] } = useQuery({
    queryKey: ["workspace-forms", workspace_id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  // ── Hydrate editor when page loads or template is selected ────────────────
  useEffect(() => {
    if (activePageId && pageData && !isInitialized) {
      const settingsBlock = pageData.components?.find((c: any) => c.type === "page_settings");
      setEditorState({
        id: pageData.id,
        slug: pageData.slug || "",
        title: pageData.title || "",
        description: pageData.description || "",
        themeColor: pageData.theme_color || "#000000",
        headerImageUrl: pageData.header_image_url || "",
        logoUrl: pageData.logo_url || "",
        logoPosition: settingsBlock?.logoPosition || "hero",
        fontFamily: settingsBlock?.fontFamily || "Inter",
        components: pageData.components?.filter((c: any) => c.type !== "page_settings") || [],
      });
      setIsInitialized(true);
    } else if (!activePageId && templateId && !isInitialized) {
      const template = PAGE_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setEditorState({
          id: null,
          slug: "",
          title: template.title,
          description: template.pageDescription,
          themeColor: template.themeColor,
          headerImageUrl: template.headerImageUrl,
          logoUrl: "",
          logoPosition: template.logoPosition,
          fontFamily: template.fontFamily,
          components: JSON.parse(JSON.stringify(template.components)), // Deep copy
        });
      }
      setIsInitialized(true);
    } else if (!activePageId && !templateId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [pageData, activePageId, templateId, isInitialized]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (values: any) => upsertWorkspacePage({ data: values } as any),
    onSuccess: (result) => {
      toast.success("Page saved & published!");
      // If it was a new page, store its id so subsequent saves update it
      if (!editorState.id && result?.id) {
        setEditorState((prev) => ({ ...prev, id: result.id }));
        setActivePageId(result.id);
        navigate({ from: Route.fullPath, search: { pageId: result.id }, replace: true });
      }
      queryClient.invalidateQueries({ queryKey: ["all-workspace-pages", workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["workspace-page", activePageId] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save page."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspacePage({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Page deleted.");
      queryClient.invalidateQueries({ queryKey: ["all-workspace-pages", workspace_id] });
      navigate({ to: `/dashboard/${activeWorkspace?.slug}/page-builder/` });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete page."),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePublish = () => {
    if (!editorState.slug) return toast.error("A URL slug is required.");
    saveMutation.mutate({
      id: editorState.id,
      workspace_id,
      slug: editorState.slug,
      title: editorState.title,
      description: editorState.description,
      theme_color: editorState.themeColor,
      header_image_url: editorState.headerImageUrl,
      logo_url: editorState.logoUrl,
      components: [
        {
          type: "page_settings",
          logoPosition: editorState.logoPosition,
          fontFamily: editorState.fontFamily,
        },
        ...editorState.components,
      ],
      is_published: true,
    });
  };



  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!", { description: url });
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  const MAX_PAGE_MEDIA_SIZE_MB = 7;

  const handleImageUpload = async (file: File, setter: (url: string) => void) => {
    if (file.size > MAX_PAGE_MEDIA_SIZE_MB * 1024 * 1024) {
      toast.error(`Image too large`, {
        description: `Max size is ${MAX_PAGE_MEDIA_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      });
      return;
    }
    const loadingToast = toast.loading("Uploading image...");
    try {
      const url = await uploadFileToStorage(file, `pages/${workspace_id}/${Date.now()}`);
      setter(url);
      toast.success("Uploaded!", { id: loadingToast });
    } catch {
      toast.error("Failed to upload", { id: loadingToast });
    }
  };

  // ── Component helpers ─────────────────────────────────────────────────────
  const addComponent = (type: string) => {
    const newComp: any = { id: Date.now().toString(), type, content: "" };
    if (type === "form_link") {
      newComp.content = forms.length > 0 ? forms[0].id : "";
      newComp.design = "card";
    } else if (type === "split_block") {
      newComp.text = "";
      newComp.imageUrl = "";
      newComp.imagePosition = "left";
    } else if (type === "button") {
      newComp.label = "Click Me";
      newComp.url = "";
    } else if (type === "sponsor_logos") {
      newComp.title = "Our Sponsors";
      newComp.logos = [];
    } else if (type === "form_grid") {
      newComp.columns = "2";
      newComp.cards = [];
    }
    setEditorState((prev) => ({ ...prev, components: [...prev.components, newComp] }));
  };

  const updateComponent = (index: number, key: string, value: any) => {
    const newComps = [...editorState.components];
    newComps[index] = { ...newComps[index], [key]: value };
    setEditorState((prev) => ({ ...prev, components: newComps }));
  };

  const removeComponent = (index: number) => {
    const newComps = [...editorState.components];
    newComps.splice(index, 1);
    setEditorState((prev) => ({ ...prev, components: newComps }));
  };

  const moveComponent = (index: number, dir: number) => {
    if (index + dir < 0 || index + dir >= editorState.components.length) return;
    const newComps = [...editorState.components];
    const temp = newComps[index];
    newComps[index] = newComps[index + dir];
    newComps[index + dir] = temp;
    setEditorState((prev) => ({ ...prev, components: newComps }));
  };

  const set = (field: string) => (value: any) =>
    setEditorState((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col bg-secondary/20">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/60 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
                <Link to={`/dashboard/${activeWorkspace?.slug}/page-builder/`}>
                  <ArrowLeft className="w-4 h-4" /> Back to Gallery
                </Link>
              </Button>
              <div className="h-4 w-px bg-border/60 mx-1" />
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">/p/</span>
                <span className="text-sm font-semibold truncate">
                  {editorState.slug || "untitled"}
                </span>
                {editorState.id && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                    <Check className="w-2.5 h-2.5" /> Saved
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {editorState.slug && editorState.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopyLink(editorState.slug)}
                  title="Copy public link"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </Button>
              )}
              {editorState.slug && editorState.id && (
                <Button variant="ghost" size="sm" asChild className="gap-2">
                  <a href={`/p/${editorState.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> View Live
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const previewData = {
                    workspace_id,
                    title: editorState.title,
                    description: editorState.description,
                    theme_color: editorState.themeColor,
                    header_image_url: editorState.headerImageUrl,
                    logo_url: editorState.logoUrl,
                    components: [
                      {
                        type: "page_settings",
                        logoPosition: editorState.logoPosition,
                        fontFamily: editorState.fontFamily,
                      },
                      ...editorState.components,
                    ],
                  };
                  localStorage.setItem("page_preview_data", JSON.stringify(previewData));
                  window.open(`/p/${editorState.slug || "preview"}?preview=true`, "_blank");
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
              </Button>

              {editorState.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this page?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>/p/{editorState.slug}</strong>. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => editorState.id && deleteMutation.mutate(editorState.id)}
                      >
                        Delete Page
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                onClick={handlePublish}
                disabled={saveMutation.isPending}
                size="sm"
                className="gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {editorState.id ? "Save & Publish" : "Publish Page"}
              </Button>
            </div>
          </div>

          {/* Builder Content */}
          {isLoadingPage && !!activePageId ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-4 md:p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* ─── Settings + Toolbox Panel ─────────────────────────── */}
                <div className="md:col-span-1 space-y-5">
                  {/* Toolbox */}
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <h2 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                      Add Blocks
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { type: "text", icon: Type, label: "Text Block" },
                        { type: "image", icon: ImageIcon, label: "Image Block" },
                        { type: "split_block", icon: Columns, label: "Split Layout" },
                        { type: "button", icon: Link2, label: "Action Button" },
                        { type: "form_link", icon: LayoutTemplate, label: "Basic Form Link" },
                        {
                          type: "form_grid",
                          icon: Grid,
                          label: "Advanced Form Grid",
                          highlight: true,
                        },
                        { type: "sponsor_logos", icon: Users2, label: "Logos Grid" },
                      ].map(({ type, icon: Icon, label, highlight }) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          className={`justify-start gap-2.5 w-full h-9 ${highlight ? "border-primary/40 text-primary hover:bg-primary/5" : ""}`}
                          onClick={() => addComponent(type)}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                          <span className="text-xs">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Page Settings */}
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm space-y-4">
                    <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Page Settings
                    </h2>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Page URL Slug</Label>
                      <div className="flex items-center">
                        <span className="bg-secondary px-2.5 py-2 rounded-l-md border border-r-0 border-border/60 text-xs text-muted-foreground">
                          /p/
                        </span>
                        <Input
                          value={editorState.slug}
                          onChange={(e) =>
                            set("slug")(
                              e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, ""),
                            )
                          }
                          placeholder="my-event-page"
                          className="rounded-l-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Theme Color</Label>
                      <div className="flex items-center gap-2.5">
                        <Input
                          type="color"
                          value={editorState.themeColor}
                          onChange={(e) => set("themeColor")(e.target.value)}
                          className="w-10 h-10 p-1 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground font-mono">
                          {editorState.themeColor}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Logo Position</Label>
                      <Select value={editorState.logoPosition} onValueChange={set("logoPosition")}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Centered on Hero</SelectItem>
                          <SelectItem value="navbar">Top Navigation Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Font Family</Label>
                      <Select value={editorState.fontFamily} onValueChange={set("fontFamily")}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter (Modern)</SelectItem>
                          <SelectItem value="Outfit">Outfit (Geometric)</SelectItem>
                          <SelectItem value="Montserrat">Montserrat (Bold)</SelectItem>
                          <SelectItem value="Playfair Display">Playfair (Elegant)</SelectItem>
                          <SelectItem value="Lora">Lora (Serif)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Logo Image</Label>
                      {editorState.logoUrl ? (
                        <div className="relative w-16 h-16 rounded-xl border border-border/60 overflow-hidden group">
                          <img
                            src={editorState.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2
                              className="w-4 h-4 text-white cursor-pointer"
                              onClick={() => set("logoUrl")("")}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block w-full">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                if (e.target.files[0].size > 2 * 1024 * 1024)
                                  return alert("File too large (max 2MB)");
                                handleImageUpload(e.target.files[0], set("logoUrl"));
                              }
                            }}
                          />
                          <div className="border-2 border-dashed border-border p-2 rounded-lg text-center text-xs text-muted-foreground hover:bg-secondary/50">
                            Upload Logo
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── Builder Canvas ───────────────────────────────────── */}
                <div className="md:col-span-2 space-y-5">
                  <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    {/* Hero Header */}
                    <div className="relative h-72 bg-secondary flex flex-col items-center justify-center text-center p-6">
                      {editorState.headerImageUrl ? (
                        <img
                          src={editorState.headerImageUrl}
                          alt="Header"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-primary/5">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                          <span className="text-sm">Add Hero Cover Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                      <div className="absolute top-3 right-3 z-20 flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                if (e.target.files[0].size > 5 * 1024 * 1024)
                                  return alert("File too large (max 5MB)");
                                handleImageUpload(e.target.files[0], set("headerImageUrl"));
                              }
                            }}
                          />
                          <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 flex items-center px-3 rounded-md text-xs">
                            <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Change Cover
                          </div>
                        </label>
                        {editorState.headerImageUrl && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => set("headerImageUrl")("")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-3">
                        <Input
                          value={editorState.title}
                          onChange={(e) => set("title")(e.target.value)}
                          placeholder="Hero Title (e.g. Welcome to Acme)"
                          className="text-2xl md:text-4xl font-bold text-center bg-transparent border-transparent text-white placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20"
                        />
                        <textarea
                          value={editorState.description}
                          onChange={(e) => set("description")(e.target.value)}
                          placeholder="Hero subtitle or description..."
                          className="w-full text-base text-center bg-transparent border-transparent text-white/90 placeholder:text-white/40 focus:bg-black/30 hover:bg-black/20 resize-none rounded-md p-2 outline-none focus:ring-1 focus:ring-white/30"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Components */}
                    <div className="p-5 space-y-4">
                      {editorState.components.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                          <Plus className="h-8 w-8 mb-2 opacity-40" />
                          <p className="text-sm">
                            Add blocks from the panel on the left to build your page.
                          </p>
                        </div>
                      )}

                      {editorState.components.map((comp, idx) => (
                        <ComponentBlock
                          key={comp.id}
                          comp={comp}
                          idx={idx}
                          forms={forms}
                          workspace_id={workspace_id}
                          updateComponent={updateComponent}
                          removeComponent={removeComponent}
                          moveComponent={moveComponent}
                          handleImageUpload={handleImageUpload}
                          canMoveUp={idx > 0}
                          canMoveDown={idx < editorState.components.length - 1}
                          eventId={undefined}
                          themeColor={editorState.themeColor}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

// ─── Component Block (individual block renderer) ───────────────────────────────
function ComponentBlock({
  comp,
  idx,
  forms,
  workspace_id,
  updateComponent,
  removeComponent,
  moveComponent,
  handleImageUpload,
  canMoveUp,
  canMoveDown,
  eventId,
  themeColor,
}: any) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative group border border-border/40 rounded-xl p-4 bg-secondary/20 hover:border-primary/40 transition-colors">
      {/* Move / delete controls */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canMoveUp && (
          <button onClick={() => moveComponent(idx, -1)} className="p-0.5 hover:text-primary">
            <GripVertical className="w-4 h-4 rotate-90" />
          </button>
        )}
        {canMoveDown && (
          <button onClick={() => moveComponent(idx, 1)} className="p-0.5 hover:text-primary">
            <GripVertical className="w-4 h-4 -rotate-90" />
          </button>
        )}
      </div>
      <button
        onClick={() => removeComponent(idx)}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive bg-background shadow-sm hover:bg-destructive/10 p-1.5 rounded-md z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Block header */}
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {comp.type.replace(/_/g, " ")}
          </span>
          <Button 
            size="sm" 
            variant={isEditing ? "default" : "outline"}
            className="h-7 text-xs" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done Editing" : "Edit Settings"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] uppercase text-muted-foreground whitespace-nowrap">
            Nav Label
          </Label>
          <Input
            placeholder="e.g. About"
            value={comp.menuName || ""}
            onChange={(e) => updateComponent(idx, "menuName", e.target.value)}
            className="h-6 text-xs w-28 bg-background"
          />
        </div>
      </div>

      {!isEditing ? (
        <PreviewComponent comp={comp} themeColor={themeColor} activeForms={forms} />
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* TEXT */}
      {comp.type === "text" && (
        <textarea
          value={comp.content}
          onChange={(e) => updateComponent(idx, "content", e.target.value)}
          placeholder="Write something..."
          className="w-full min-h-[100px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      )}

      {/* IMAGE */}
      {comp.type === "image" && (
        <div>
          {comp.url ? (
            <div className="relative rounded-lg overflow-hidden border border-border/60 group/img">
              <img
                src={comp.url}
                alt="Custom"
                className="w-full h-auto max-h-[400px] object-contain bg-background"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateComponent(idx, "url", "")}
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border/60 rounded-lg p-8 flex flex-col items-center justify-center bg-background cursor-pointer hover:border-primary/50">
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    if (e.target.files[0].size > 5 * 1024 * 1024)
                      return alert("File too large (max 5MB)");
                    handleImageUpload(e.target.files[0], (url: string) =>
                      updateComponent(idx, "url", url),
                    );
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">Upload Image (Max 5MB)</span>
            </label>
          )}
        </div>
      )}

      {/* SPLIT BLOCK */}
      {comp.type === "split_block" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Image + Text Layout</Label>
            <div className="flex items-center bg-background rounded-md border border-border/60 p-0.5">
              <button
                className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${comp.imagePosition === "left" ? "bg-secondary font-medium" : "text-muted-foreground"}`}
                onClick={() => updateComponent(idx, "imagePosition", "left")}
              >
                <AlignLeft className="w-3 h-3" /> Img Left
              </button>
              <button
                className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${comp.imagePosition === "right" ? "bg-secondary font-medium" : "text-muted-foreground"}`}
                onClick={() => updateComponent(idx, "imagePosition", "right")}
              >
                Img Right <AlignRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div
            className={`flex flex-col md:flex-row gap-4 ${comp.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}
          >
            <div className="flex-1 bg-background rounded-lg border border-border/60 overflow-hidden min-h-[180px] flex flex-col relative group/img">
              {comp.imageUrl ? (
                <>
                  <img
                    src={comp.imageUrl}
                    alt="Split"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateComponent(idx, "imageUrl", "")}
                    >
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                  <label className="cursor-pointer text-xs underline">
                    Choose File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          if (e.target.files[0].size > 5 * 1024 * 1024)
                            return alert("File too large (max 5MB)");
                          handleImageUpload(e.target.files[0], (url: string) =>
                            updateComponent(idx, "imageUrl", url),
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={comp.text}
                onChange={(e) => updateComponent(idx, "text", e.target.value)}
                placeholder="Write accompanying text..."
                className="w-full h-full min-h-[180px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* BUTTON */}
      {comp.type === "button" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Button Label</Label>
            <Input
              value={comp.label}
              onChange={(e) => updateComponent(idx, "label", e.target.value)}
              placeholder="e.g. Buy Tickets"
              className="bg-background"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Link URL</Label>
            <Input
              value={comp.url}
              onChange={(e) => updateComponent(idx, "url", e.target.value)}
              placeholder="https://..."
              className="bg-background"
            />
          </div>
        </div>
      )}

      {/* FORM LINK */}
      {comp.type === "form_link" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-[2] space-y-1">
              <Label className="text-xs">Select Form</Label>
              <Select
                value={comp.content}
                onValueChange={(val) => updateComponent(idx, "content", val)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {forms
                    .filter((f: any) => f.is_active)
                    .map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Design</Label>
              <Select
                value={comp.design || "card"}
                onValueChange={(val) => updateComponent(idx, "design", val)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Large Card</SelectItem>
                  <SelectItem value="button">Simple Button</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {comp.content && comp.design !== "button" && (
            <div className="p-3 border border-primary/20 rounded-lg bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary/20 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {forms.find((f: any) => f.id === comp.content)?.title}
                </p>
                <p className="text-xs text-muted-foreground">Auto-generated card</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPONSOR LOGOS */}
      {comp.type === "sponsor_logos" && (
        <div className="space-y-3">
          <Input
            value={comp.title}
            onChange={(e) => updateComponent(idx, "title", e.target.value)}
            placeholder="Section title (e.g. Our Sponsors)"
            className="bg-background"
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {comp.logos?.map((logo: any, logoIdx: number) => (
              <div
                key={logoIdx}
                className="relative group/logo border border-border/60 rounded-md overflow-hidden aspect-video bg-background flex items-center justify-center p-2"
              >
                <img src={logo.url} alt="Logo" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    const n = [...comp.logos];
                    n.splice(logoIdx, 1);
                    updateComponent(idx, "logos", n);
                  }}
                  className="absolute top-1 right-1 bg-destructive/90 text-white p-0.5 rounded opacity-0 group-hover/logo:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="relative border-2 border-dashed border-border/60 rounded-md aspect-video flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary transition-colors cursor-pointer">
              <Plus className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Add Logo</span>
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0])
                    handleImageUpload(e.target.files[0], (url: string) => {
                      updateComponent(idx, "logos", [...(comp.logos || []), { url }]);
                    });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FORM GRID */}
      {comp.type === "form_grid" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-xs text-muted-foreground">Advanced Form Grid</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded px-2 h-8">
                <Label
                  className="text-[10px] text-muted-foreground cursor-pointer"
                  htmlFor={`bg-${idx}`}
                >
                  Bg
                </Label>
                <Input
                  id={`bg-${idx}`}
                  type="color"
                  value={comp.cardBgColor || "#ffffff"}
                  onChange={(e) => updateComponent(idx, "cardBgColor", e.target.value)}
                  className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded px-2 h-8">
                <Label
                  className="text-[10px] text-muted-foreground cursor-pointer"
                  htmlFor={`text-${idx}`}
                >
                  Text
                </Label>
                <Input
                  id={`text-${idx}`}
                  type="color"
                  value={comp.cardTextColor || "#000000"}
                  onChange={(e) => updateComponent(idx, "cardTextColor", e.target.value)}
                  className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
              <Select
                value={comp.columns || "2"}
                onValueChange={(val) => updateComponent(idx, "columns", val)}
              >
                <SelectTrigger className="w-28 bg-background h-8 text-xs">
                  <SelectValue placeholder="Columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {comp.cards?.map((card: any, cardIdx: number) => (
              <div
                key={card.id || cardIdx}
                className="bg-background border border-border/60 rounded-xl p-4 relative group/card"
              >
                <button
                  onClick={() => {
                    const n = [...comp.cards];
                    n.splice(cardIdx, 1);
                    updateComponent(idx, "cards", n);
                  }}
                  className="absolute top-2 right-2 text-destructive opacity-0 group-hover/card:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                        Link to Form
                      </Label>
                      <Select
                        value={card.formId}
                        onValueChange={(val) => {
                          const n = [...comp.cards];
                          n[cardIdx].formId = val;
                          updateComponent(idx, "cards", n);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Form" />
                        </SelectTrigger>
                        <SelectContent>
                          {forms
                            .filter((f: any) => f.is_active)
                            .map((f: any) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                        Custom Title
                      </Label>
                      <Input
                        className="h-8 text-xs"
                        value={card.customTitle || ""}
                        onChange={(e) => {
                          const n = [...comp.cards];
                          n[cardIdx].customTitle = e.target.value;
                          updateComponent(idx, "cards", n);
                        }}
                        placeholder="e.g. VIP Registration"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                        Button Label
                      </Label>
                      <Input
                        className="h-8 text-xs"
                        value={card.buttonLabel || ""}
                        onChange={(e) => {
                          const n = [...comp.cards];
                          n[cardIdx].buttonLabel = e.target.value;
                          updateComponent(idx, "cards", n);
                        }}
                        placeholder="e.g. Register Now"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Bullet Points / Description
                    </Label>
                    <textarea
                      className="w-full h-full min-h-[100px] bg-secondary/30 border border-border/60 rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      value={card.bulletPoints || ""}
                      onChange={(e) => {
                        const n = [...comp.cards];
                        n[cardIdx].bulletPoints = e.target.value;
                        updateComponent(idx, "cards", n);
                      }}
                      placeholder={"• Name\n• Email\n• Ticket Type"}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed"
              onClick={() => {
                const newCard = {
                  id: Date.now().toString(),
                  formId: "",
                  customTitle: "",
                  bulletPoints: "",
                  buttonLabel: "Register",
                };
                updateComponent(idx, "cards", [...(comp.cards || []), newCard]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Form Card
            </Button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

// ─── Preview Component (Visual WYSIWYG) ─────────────────────────────────────
function PreviewComponent({ comp, themeColor, activeForms }: { comp: any, themeColor: string, activeForms: any[] }) {
  if (comp.type === "text") {
    return (
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl shadow-sm">
        <p className="whitespace-pre-wrap">{comp.content}</p>
      </div>
    );
  }

  if (comp.type === "image" && comp.url) {
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-sm">
        <img src={comp.url} alt="Content" className="w-full h-auto max-h-[400px] object-cover" />
      </div>
    );
  }

  if (comp.type === "split_block") {
    return (
      <div className={`flex flex-col md:flex-row gap-6 items-center ${comp.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}>
        {comp.imageUrl && (
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-sm">
            <img src={comp.imageUrl} alt="Split Content" className="w-full h-auto max-h-[300px] object-cover" />
          </div>
        )}
        {comp.text && (
          <div className="w-full md:w-1/2 prose prose-sm dark:prose-invert">
            <p className="whitespace-pre-wrap">{comp.text}</p>
          </div>
        )}
      </div>
    );
  }

  if (comp.type === "button") {
    return (
      <div className="flex justify-center w-full px-4 py-4">
        <div 
          className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center cursor-pointer"
          style={{ background: themeColor }}
        >
          {comp.label || "Click Here"}
        </div>
      </div>
    );
  }

  if (comp.type === "form_grid" && comp.cards?.length > 0) {
    const gridCols = comp.columns === "1" ? "grid-cols-1" : comp.columns === "3" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-4 pointer-events-none`}>
        {comp.cards.map((card: any, idx: number) => {
          let linkedForm = activeForms.find((f: any) => f.id === card.formId);
          if (!linkedForm) {
            linkedForm = { id: "preview-id", title: "Select a Form", description: "Please link a form in the editor.", cover_image_url: "" };
          }
          return (
            <div key={idx} className="border border-border/60 rounded-2xl p-5 flex flex-col h-full" style={{ backgroundColor: comp.cardBgColor || "var(--card)", color: comp.cardTextColor || "inherit" }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold">{card.customTitle || linkedForm.title}</h3>
                {linkedForm.cover_image_url && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 ml-3">
                    <img src={linkedForm.cover_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {card.bulletPoints ? (
                <div className="prose prose-xs dark:prose-invert mb-6 flex-1 whitespace-pre-wrap" style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}>
                  {card.bulletPoints}
                </div>
              ) : linkedForm.description ? (
                <p className="line-clamp-3 mb-6 flex-1 text-sm" style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}>
                  {linkedForm.description}
                </p>
              ) : <div className="flex-1" />}
              <div className="w-full rounded-full mt-auto py-2 text-center text-white text-sm font-medium" style={{ background: themeColor }}>
                {card.buttonLabel || "Register"}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (comp.type === "sponsor_logos" && comp.logos?.length > 0) {
    return (
      <div className="py-4 pointer-events-none">
        {comp.title && <h3 className="text-lg font-bold text-center mb-4">{comp.title}</h3>}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-center justify-items-center opacity-80">
          {comp.logos.map((logo: any, idx: number) => (
            <div key={idx} className="w-full max-w-[80px] aspect-video flex items-center justify-center grayscale">
              <img src={logo.url} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comp.type === "form_link" && comp.content) {
    let linkedForm = activeForms.find((f: any) => f.id === comp.content);
    if (!linkedForm) {
      linkedForm = { id: "preview-id", title: "Select a Form", description: "Please link a form in the editor.", cover_image_url: "" };
    }
    if (comp.design === "button") {
      return (
        <div className="flex justify-center w-full px-4 py-4 pointer-events-none">
          <div className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center cursor-pointer" style={{ background: themeColor }}>
            {linkedForm.title}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 pointer-events-none">
        {linkedForm.cover_image_url ? (
          <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden shrink-0">
            <img src={linkedForm.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full md:w-40 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-primary/30">{linkedForm.title.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">{linkedForm.title}</h3>
          {linkedForm.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{linkedForm.description}</p>}
          <div className="mt-auto rounded-full py-1.5 px-4 text-xs font-medium text-white" style={{ background: themeColor }}>
            Fill Form
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
      <p className="text-sm">Click "Edit Settings" to configure this block.</p>
    </div>
  );
}
