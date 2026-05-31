import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { saveBadgeProject, getBadgeProjectById } from "@/api/badges";
import { getWorkspaceEvents } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { BadgeSidebar } from "@/components/badge-designer/BadgeSidebar";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";
import { Sponsor } from "@/components/badge-designer/constants";

export const Route = createFileRoute("/dashboard/$workspaceSlug/badge-designer/$projectId")({
  component: BadgeDesignerEditor,
});

function BadgeDesignerEditor() {
  const { workspaceSlug, projectId } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  // State matches DB schema fields
  const [config, setConfig] = useState({
    theme: "glass",
    gradientClass: "from-slate-900 to-black",
    logoText: "AGATIKE FESTIVAL",
    accentColor: "#f59e0b",
    fontFamily: "font-sans",
    showUserImage: true,
    bgImageUrl: "",
    bgOpacity: 50,
    backText:
      "NON-TRANSFERABLE\nValid only for the specified event date.\nSubject to terms and conditions.",
    eventId: "00000000-0000-0000-0000-000000000000",
    qrPlacement: "front", // front | back | none
    qrX: 50,
    qrY: 80,
    sectionPlacement: "front", // front | back | none
    sponsorsPlacement: "back", // front | back | none
    frontTextSize: "text-3xl",
  });

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  // Only fetch if projectId looks like a real UUID (Hasura rejects non-UUID values)
  const isRealUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    projectId,
  );

  const { data: existingProject, isLoading: isLoadingProject } = useQuery({
    queryKey: ["badge-project", projectId],
    queryFn: () => getBadgeProjectById({ data: { id: projectId } } as any),
    enabled: isRealUUID,
  });

  useEffect(() => {
    if (existingProject) {
      setConfig({
        theme: existingProject.theme || "glass",
        gradientClass: existingProject.gradient_class || "from-slate-900 to-black",
        logoText: existingProject.logo_text || "AGATIKE FESTIVAL",
        accentColor: existingProject.accent_color || "#f59e0b",
        fontFamily: existingProject.font_family || "font-sans",
        showUserImage: existingProject.show_user_image ?? true,
        bgImageUrl: existingProject.bg_image_url || "",
        bgOpacity: existingProject.front_design?.bgOpacity || 50,
        backText:
          existingProject.back_design?.text ||
          "NON-TRANSFERABLE\nValid only for the specified event date.\nSubject to terms and conditions.",
        eventId: existingProject.event_id || "00000000-0000-0000-0000-000000000000",
        qrPlacement: existingProject.front_design?.qrPlacement || "front",
        qrX: existingProject.front_design?.qrX ?? 50,
        qrY: existingProject.front_design?.qrY ?? 80,
        sectionPlacement: existingProject.front_design?.sectionPlacement || "front",
        sponsorsPlacement: existingProject.front_design?.sponsorsPlacement || "back",
        frontTextSize: existingProject.front_design?.textSize || "text-3xl",
      });
      if (existingProject.sponsors_json) {
        setSponsors(existingProject.sponsors_json);
      }
    }
  }, [existingProject]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const frontDesign = {
        theme: config.theme,
        gradient: config.gradientClass,
        accent: config.accentColor,
        bgImage: config.bgImageUrl,
        bgOpacity: config.bgOpacity,
        font: config.fontFamily,
        qrPlacement: config.qrPlacement,
        qrX: config.qrX,
        qrY: config.qrY,
        sectionPlacement: config.sectionPlacement,
        sponsorsPlacement: config.sponsorsPlacement,
        textSize: config.frontTextSize,
      };

      const backDesign = {
        theme: config.theme,
        gradient: config.gradientClass,
        bgImage: config.bgImageUrl,
        text: config.backText,
        qrPlacement: config.qrPlacement,
        sectionPlacement: config.sectionPlacement,
        sponsorsPlacement: config.sponsorsPlacement,
      };

      return await saveBadgeProject({
        data: {
          id: projectId !== "new" ? projectId : undefined,
          accent_color: config.accentColor,
          back_design: backDesign,
          bg_image_url: config.bgImageUrl,
          event_id:
            config.eventId === "00000000-0000-0000-0000-000000000000" ? null : config.eventId,
          font_family: config.fontFamily,
          front_design: frontDesign,
          gradient_class: config.gradientClass,
          logo_text: config.logoText,
          show_user_image: config.showUserImage,
          sponsors_json: sponsors,
          theme: config.theme,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Badge design saved successfully!");
      navigate({ to: `/dashboard/${workspaceSlug}/badge-designer` });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to save badge design. Please check your DB connection.");
    },
  });

  const handleUpload = async (file: File, key: string, callback: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploadingState((prev) => ({ ...prev, [key]: true }));
    try {
      const url = await uploadFileToStorage(file, "badges/media");
      callback(url);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploadingState((prev) => ({ ...prev, [key]: false }));
    }
  };

  const addSponsor = () => {
    setSponsors([
      ...sponsors,
      { id: Math.random().toString(), text: "", logoUrl: "", scale: 24, x: 50, y: 50 },
    ]);
    setActiveSide(config.sponsorsPlacement === "front" ? "front" : "back");
  };

  const updateSponsor = (id: string, field: keyof Sponsor, value: any) => {
    setSponsors(sponsors.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSponsor = (id: string) => {
    setSponsors(sponsors.filter((s) => s.id !== id));
  };

  // Drag and Drop Logic for Sponsors & QR Code
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    initialX: number,
    initialY: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX, initialY };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { id, startX, startY, initialX, initialY } = dragRef.current;

      // X drag direction doesn't need inversion because the Back Design container is rotated 180deg inside a 180deg rotated badge (canceling out horizontal inversion)
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = initialX + (dx / 340) * 100;
      let newY = initialY + (dy / 544) * 100;

      // Optional bounds
      if (newX < 0) newX = 0;
      if (newX > 100) newX = 100;
      if (newY < 0) newY = 0;
      if (newY > 100) newY = 100;

      if (id === "qrcode") {
        setConfig((prev) => ({ ...prev, qrX: newX, qrY: newY }));
      } else {
        setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s)));
      }
    };

    const handlePointerUp = () => {
      setDraggingId(null);
      dragRef.current = null;
    };

    if (draggingId) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingId, activeSide]);

  const isLocked = config.eventId === "00000000-0000-0000-0000-000000000000";

  if (isRealUUID && isLoadingProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <header className="flex-none flex items-center justify-between border-b border-border/60 bg-card/80 px-6 py-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <Link
            to={`/dashboard/${workspaceSlug}/badge-designer`}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Advanced Badge Designer</h1>
            <p className="text-xs text-muted-foreground">Project: {projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={config.eventId}
            onValueChange={(val) => {
              const selectedEvent = events.find((e: any) => e.id === val);
              setConfig({
                ...config,
                eventId: val,
                logoText: selectedEvent ? selectedEvent.title : config.logoText,
              });
            }}
          >
            <SelectTrigger
              className={`w-[250px] h-9 ${isLocked ? "ring-2 ring-primary ring-offset-2 animate-pulse" : ""}`}
            >
              <SelectValue placeholder="Link to Event to Unlock..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="00000000-0000-0000-0000-000000000000">
                Select Event to Unlock...
              </SelectItem>
              {events.map((ev: any) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLocked}
            className="rounded-full px-6 shadow-[var(--shadow-glow)] transition-all"
            style={{ background: isLocked ? "var(--muted)" : "var(--gradient-primary)" }}
          >
            {saveMutation.isPending ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Design
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <BadgeSidebar
          isLocked={isLocked}
          config={config}
          setConfig={setConfig}
          setActiveSide={setActiveSide}
          uploadingState={uploadingState}
          handleUpload={handleUpload}
          sponsors={sponsors}
          addSponsor={addSponsor}
          updateSponsor={updateSponsor}
          removeSponsor={removeSponsor}
        />

        <BadgePreview
          config={config}
          activeSide={activeSide}
          setActiveSide={setActiveSide}
          sponsors={sponsors}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          handlePointerDown={handlePointerDown}
        />
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .translate-z-1 { transform: translateZ(1px) translateX(-50%); }
      `}</style>
    </div>
  );
}
