import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { EditorTopbar } from "@/components/page-builder/EditorTopbar";
import { EditorCanvas } from "@/components/page-builder/EditorCanvas";
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
      parentId: search.parentId as string | undefined,
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
    navbarStyle: "transparent" as "transparent" | "solid",
    fontFamily: "Inter",
    heroAlign: "center" as
      | "center"
      | "top-left"
      | "top-center"
      | "top-right"
      | "center-left"
      | "center-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right",
    heroOverlayColor: "#000000",
    heroOverlayOpacity: 40,
    heroButtonText: "",
    heroButtonActionType: "url" as "url" | "page" | "form" | "phone",
    heroButtonLink: "",
    heroForegroundImageUrl: "",
    heroForegroundPosition: "right" as "left" | "right",
    elementShape: "rounded-2xl",
    parent_id: null as string | null,
    components: [] as any[],
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────
function PageBuilder() {
  const { pageId, templateId, parentId } = Route.useSearch();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const workspace_id = activeWorkspace?.id;
  const queryClient = useQueryClient();

  // Which page is being edited
  const [activePageId, setActivePageId] = useState<string | null>(pageId || null);
  const [editorState, setEditorState] = useState(makeBlankPage());
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Sync URL params to local state ────────────────────────────────────────
  useEffect(() => {
    setActivePageId(pageId || null);
    setIsInitialized(false);
    if (!pageId && !templateId) {
      setEditorState({ ...makeBlankPage(), parent_id: parentId || null });
    }
  }, [pageId, templateId, parentId]);

  // ── Fetch: individual page when activePageId changes ──────────────────────
  const { data: pageData, isLoading: isLoadingPage } = useQuery({
    queryKey: ["workspace-page", activePageId],
    queryFn: () => getWorkspacePage({ data: { id: activePageId } } as any),
    enabled: !!activePageId,
  });

  // ── Fetch: all pages for the dropdown switcher ────────────────────────────
  const { data: allPages = [] } = useQuery({
    queryKey: ["all-workspace-pages", workspace_id],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
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
        navbarStyle: settingsBlock?.navbarStyle || "transparent",
        fontFamily: settingsBlock?.fontFamily || "Inter",
        heroAlign: settingsBlock?.heroAlign || "center",
        heroOverlayColor: settingsBlock?.heroOverlayColor || "#000000",
        heroOverlayOpacity: settingsBlock?.heroOverlayOpacity ?? 40,
        heroButtonText: settingsBlock?.heroButtonText || "",
        heroButtonActionType: settingsBlock?.heroButtonActionType || "url",
        heroButtonLink: settingsBlock?.heroButtonLink || "",
        heroForegroundImageUrl: settingsBlock?.heroForegroundImageUrl || "",
        heroForegroundPosition: settingsBlock?.heroForegroundPosition || "right",
        elementShape: settingsBlock?.elementShape || "rounded-2xl",
        parent_id: pageData.parent_id || null,
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
          navbarStyle: "transparent",
          fontFamily: template.fontFamily,
          heroAlign: "center",
          heroOverlayColor: "#000000",
          heroOverlayOpacity: 40,
          heroButtonText: "",
          heroButtonActionType: "url",
          heroButtonLink: "",
          heroForegroundImageUrl: "",
          heroForegroundPosition: "right",
          elementShape: "rounded-2xl",
          parent_id: parentId || null,
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
        navigate({
          from: Route.fullPath,
          search: { pageId: result.id, templateId: undefined },
          replace: true,
        });
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
      parent_id: editorState.parent_id,
      components: [
        {
          type: "page_settings",
          logoPosition: editorState.logoPosition,
          navbarStyle: editorState.navbarStyle,
          fontFamily: editorState.fontFamily,
          heroAlign: editorState.heroAlign,
          heroOverlayColor: editorState.heroOverlayColor,
          heroOverlayOpacity: editorState.heroOverlayOpacity,
          heroButtonText: editorState.heroButtonText,
          heroButtonActionType: editorState.heroButtonActionType,
          heroButtonLink: editorState.heroButtonLink,
          heroForegroundImageUrl: editorState.heroForegroundImageUrl,
          heroForegroundPosition: editorState.heroForegroundPosition,
          elementShape: editorState.elementShape,
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
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-secondary/20 relative">
        {/* Top Bar */}
        <EditorTopbar
          activeWorkspace={activeWorkspace}
          editorState={editorState}
          workspace_id={workspace_id}
          allPages={allPages}
          handleCopyLink={handleCopyLink}
          deleteMutation={deleteMutation}
          handlePublish={handlePublish}
          saveMutation={saveMutation}
        />

        {/* Builder Content */}
        {isLoadingPage && !!activePageId ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EditorCanvas
            addComponent={addComponent}
            editorState={editorState}
            set={set}
            handleImageUpload={handleImageUpload}
            allPages={allPages}
            forms={forms}
            workspace_id={workspace_id}
            updateComponent={updateComponent}
            removeComponent={removeComponent}
            moveComponent={moveComponent}
          />
        )}
      </div>
    </div>
  );
}
