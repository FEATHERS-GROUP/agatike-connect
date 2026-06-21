import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { lazy, Suspense, useState as _useState, useEffect as _useEffect } from "react";

function ClientOnly({ children, fallback }: { children: any, fallback?: any }) {
  const [mounted, setMounted] = _useState(false);
  _useEffect(() => setMounted(true), []);
  return mounted ? children : (fallback || null);
}
const ReactQuill = lazy(() => import("react-quill-new"));
import "react-quill-new/dist/quill.snow.css";
import {
  ArrowLeft,
  Ticket as TicketIcon,
  Sparkles,
  Palette,
  Type,
  Image as ImageIcon,
  Download,
  Save,
  Crown,
  Film,
  Mountain,
  Briefcase,
  Calendar,
  Eye,
  Edit2,
  MapPin,
  UserPlus,
  Layout,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getRentableVenues } from "@/api/rentable_venues";
import { getCinemas } from "@/api/cinemas";
import { getCinemaTicketTiers } from "@/api/cinema_ticket_tiers";
import {
  getWorkspaceEvents,
  saveTicketProject,
  getTicketProjectById,
  updateTicketProject,
} from "@/api/events";
import { uploadFile } from "@/api/storage";
import { toast } from "sonner";
import { InviteContributorModal } from "@/components/dashboard/projects/InviteContributorModal";
import { getContributorAccessLevel } from "@/api/project_contributors";

function getCurrencySymbol(currency?: string) {
  if (!currency) return "$";
  switch (currency.toUpperCase()) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "RWF":
      return "RWF ";
    case "KES":
      return "KES ";
    case "UGX":
      return "UGX ";
    default:
      return "$";
  }
}

export const Route = createFileRoute("/dashboard/$workspaceSlug/ticket-designer/$projectId")({
  head: () => ({
    meta: [{ title: "Ticket Designer — Agatike" }],
  }),
  component: TicketDesignerPage,
});

import { Template } from "@/components/desktop/dashboard/ticket-designer/templates/types";

// Stubbed mock data
const ticketProjects: any[] = [];

const templates: { id: Template; label: string; icon: any; accent: string }[] = [
  { id: "concert-1", label: "Concert (Classic)", icon: TicketIcon, accent: "#f97316" },
  { id: "concert-2", label: "Concert (Lanyard)", icon: TicketIcon, accent: "#ea580c" },
  { id: "movie-1", label: "Movie (Cinematic)", icon: Film, accent: "#dc2626" },
  { id: "movie-2", label: "Movie (Vintage)", icon: Film, accent: "#b91c1c" },
  { id: "experience-1", label: "Experience (Pass)", icon: Mountain, accent: "#16a34a" },
  { id: "experience-2", label: "Experience (Tech)", icon: Mountain, accent: "#15803d" },
  { id: "conference-1", label: "Conference (Standard)", icon: Briefcase, accent: "#0ea5e9" },
  { id: "conference-2", label: "Conference (VIP)", icon: Briefcase, accent: "#0369a1" },
  { id: "entrance-1", label: "Entrance (Clean)", icon: MapPin, accent: "#8b5cf6" },
  { id: "entrance-2", label: "Entrance (Wallet)", icon: MapPin, accent: "#7c3aed" },
];

function migrateTemplate(t: string): Template {
  if (t === "concert") return "concert-1";
  if (t === "movie") return "movie-1";
  if (t === "experience") return "experience-1";
  if (t === "conference") return "conference-1";
  if (t === "entrance") return "entrance-1";
  return t as Template;
}

const palettes = [
  { name: "Sunset", from: "#f97316", to: "#db2777" },
  { name: "Midnight", from: "#0f172a", to: "#4f46e5" },
  { name: "Emerald", from: "#064e3b", to: "#10b981" },
  { name: "Noir", from: "#111111", to: "#3f3f46" },
  { name: "Royal", from: "#7c3aed", to: "#ec4899" },
  { name: "Ocean", from: "#0c2340", to: "#2d8a9e" },
  { name: "Neon", from: "#ff00cc", to: "#333399" },
  { name: "Aurora", from: "#00c6ff", to: "#0072ff" },
  { name: "Lava", from: "#ff416c", to: "#ff4b2b" },
  { name: "Forest", from: "#134e5e", to: "#71b280" },
  { name: "Gold", from: "#855e11", to: "#dfb054" },
  { name: "Void", from: "#0f0c29", to: "#24243e" },
];

const fonts = [
  { name: "Modern", css: "'Inter', sans-serif" },
  { name: "Editorial", css: "'Playfair Display', serif" },
  { name: "Display", css: "'Space Grotesk', sans-serif" },
  { name: "Mono", css: "'JetBrains Mono', monospace" },
  { name: "Elegant", css: "'Cormorant Garamond', serif" },
  { name: "Fun", css: "'Comic Sans MS', cursive" },
  { name: "Classic", css: "'Georgia', serif" },
  { name: "Tech", css: "'Roboto Mono', monospace" },
];

type TicketLayout = {
  titleSize: number; // px
  subtitleSize: number; // px
  metaSize: number; // px
  titleAlign: "left" | "center" | "right";
  titleOffsetY: number; // % from default position
  subtitleOffsetY: number;
  metaOffsetY: number;
};

type TicketBack = {
  backText: string;
  backImage: string;
  backImageOpacity: number;
};

type TicketDesign = {
  template: Template;
  palette: any;
  font: any;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  currency: string;
  cover: string;
  logoText: string;
  logoImage?: string;
  logoScale?: number;
  logoOpacity?: number;
  logoColorMode?: "original" | "white" | "black";
  layout?: TicketLayout;
  back?: TicketBack;
};

const defaultLayout: TicketLayout = {
  titleSize: 30,
  subtitleSize: 14,
  metaSize: 11,
  titleAlign: "left",
  titleOffsetY: 0,
  subtitleOffsetY: 0,
  metaOffsetY: 0,
};

const DEFAULT_TERMS_HTML = `<p><strong>Terms &amp; Conditions</strong></p><p>• Ticket is non-refundable and non-transferable.</p><p>• Organizer reserves the right to refuse entry.</p><p>• Retain this ticket for the duration of the event.</p>`;

const DEFAULT_EXPERIENCE_BACK_HTML = `<p><strong>What's Included</strong></p><p>• Professional certified guide</p><p>• All safety equipment &amp; gear</p><p>• Pickup &amp; drop-off service</p><p>• Refreshments during activity</p><p>• Insurance coverage</p><p>• Photo/video of experience</p>`;

const defaultBack: TicketBack = {
  backText: DEFAULT_TERMS_HTML,
  backImage: "",
  backImageOpacity: 0.35,
};

function TicketDesignerPage() {
  const { workspaceSlug, projectId } = useParams({
    from: "/dashboard/$workspaceSlug/ticket-designer/$projectId",
  });
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: cinemas = [] } = useQuery({
    queryKey: ["workspace-cinemas", activeWorkspace?.id],
    queryFn: () => getCinemas({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: userAccessLevel = "edit", error: accessError, isError: isAccessError } = useQuery({
    queryKey: ["project-access", projectId],
    queryFn: () => getContributorAccessLevel({ data: { resource_type: "ticket_project", resource_id: projectId } } as any),
    enabled: !!projectId && projectId.includes("-"),
  });

  const { data: dbProject, isLoading: isProjectLoading, error: projectError, isError: isProjectError } = useQuery({
    queryKey: ["ticket-project", projectId],
    queryFn: () => getTicketProjectById({ data: { id: projectId } } as any),
    enabled: !!projectId && projectId.includes("-"), // ensure it looks like a uuid
  });

  // Find existing project or load defaults
  const existingProject = useMemo(
    () => ticketProjects.find((p) => p.id === projectId),
    [projectId],
  );

  // Read template from URL if it's a new project
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialTemplate = migrateTemplate((searchParams.get("template") as string) || "concert-1");
  const initialEventId = searchParams.get("eventId") || "";
  const initialName = searchParams.get("name") || "Untitled Project";

  const [projectName, setProjectName] = useState(existingProject?.name || initialName);
  const [eventId, setEventId] = useState(existingProject?.eventId || initialEventId);
  const initialVenueId = searchParams.get("venueId") || "";
  const [venueId, setVenueId] = useState(existingProject?.venueId || initialVenueId);
  // Check if initialVenueId belongs to a cinema
  const initialCinemaId = searchParams.get("cinemaId") || "";
  const [cinemaId, setCinemaId] = useState(existingProject?.cinemaId || initialCinemaId);
  const [assignmentType, setAssignmentType] = useState<"event" | "venue" | "cinema">(
    existingProject?.cinemaId || initialCinemaId ? "cinema" : (existingProject?.venueId || initialVenueId ? "venue" : "event")
  );

  const { data: cinemaTiers = [] } = useQuery({
    queryKey: ["cinema-tiers", activeWorkspace?.id],
    queryFn: () => getCinemaTicketTiers({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id && assignmentType === "cinema",
  });

  const eventMatch = events.find((e: any) => e.id === eventId);
  const venueMatch = venues.find((v: any) => v.id === venueId);
  const cinemaMatch = cinemas.find((c: any) => c.id === cinemaId);
  const allTicketTiers = useMemo(() => {
    if (assignmentType === "event") return eventMatch?.event_tickets || [];
    if (assignmentType === "venue") return venueMatch?.pricing_tiers?.map((t: any) => ({ ...t, id: t.name, type: t.name, cost: t.amount })) || [];
    if (assignmentType === "cinema") return cinemaTiers.map((t: any) => ({ id: t.id, type: t.name, cost: t.price })) || [];
    return [];
  }, [assignmentType, eventMatch?.event_tickets, venueMatch?.pricing_tiers, cinemaTiers]);
  const tourStops = Array.isArray(eventMatch?.tour_stops) ? eventMatch.tour_stops : [];

  const [activeTourStopIdx, setActiveTourStopIdx] = useState<number>(-1);

  const ticketTiers = useMemo(() => {
    if (activeTourStopIdx === -1) return allTicketTiers;
    return allTicketTiers.filter(
      (t: any) => t.tour_stop_idx == null || t.tour_stop_idx === activeTourStopIdx,
    );
  }, [allTicketTiers, activeTourStopIdx]);
  const [activeTierId, setActiveTierId] = useState<string>("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editScope, setEditScope] = useState<"base" | "tier">("base");
  const [sameDesignForLocations, setSameDesignForLocations] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "setup" | "design" | "media" | "content" | "layout" | "back"
  >("setup");
  const [previewMode, setPreviewMode] = useState<"Front" | "Back" | "Mobile">("Front");
  const [isDirty, setIsDirty] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [baseDesign, setBaseDesign] = useState<TicketDesign>({
    template: migrateTemplate((existingProject?.template as string) || initialTemplate),
    palette: existingProject?.palette || palettes[0],
    font: existingProject?.font || fonts[0],
    title: existingProject?.title || "",
    subtitle: existingProject?.subtitle || "",
    date: existingProject?.date || "",
    time: existingProject?.time || "",
    seat: existingProject?.seat || "",
    price: existingProject?.price || "",
    currency: existingProject?.currency || "",
    cover: existingProject?.cover || eventMatch?.cover || "",
    logoText: existingProject?.logoText || "",
    logoImage: existingProject?.logoImage || "",
    logoScale: Number(existingProject?.logoScale) || 24,
    logoOpacity:
      existingProject?.logoOpacity !== undefined ? Number(existingProject.logoOpacity) : 1,
    logoColorMode: (existingProject?.logoColorMode as "original" | "white" | "black") || "original",
    layout: defaultLayout,
    back: defaultBack,
  });

  const [overrides, setOverrides] = useState<any>(
    existingProject?.design_overrides || {
      tourStops: {},
      tiers: {},
      combinations: {},
    },
  );

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (dbProject && !isInitialized) {
      setProjectName(dbProject.name || "Untitled Project");
      setEventId(dbProject.eventId || "");
      setVenueId(dbProject.venueId || "");
      setCinemaId(dbProject.cinemaId || "");
      setAssignmentType(dbProject.cinemaId ? "cinema" : (dbProject.venueId ? "venue" : "event"));
      const savedOverrides = dbProject.design_overrides || {};
      setBaseDesign({
        template: migrateTemplate((dbProject.template as string) || initialTemplate),
        palette: dbProject.palette || palettes[0],
        font: dbProject.font || fonts[0],
        title: "",
        subtitle: "",
        date: "",
        time: "",
        seat: dbProject.seat || "",
        price: "",
        currency: "",
        cover: dbProject.coverImage || "",
        logoText: dbProject.logoText || "",
        logoImage: dbProject.logoImage || "",
        logoScale: Number(dbProject.logoScale) || 24,
        logoOpacity: Number(dbProject.logoOpacity) || 1,
        logoColorMode: (dbProject.logoColorMode as "original" | "white" | "black") || "original",
        layout: savedOverrides.layout || defaultLayout,
        back: savedOverrides.back || defaultBack,
      });
      setOverrides(savedOverrides.overrides || { tourStops: {}, tiers: {}, combinations: {} });
      if (savedOverrides.sameDesignForLocations !== undefined)
        setSameDesignForLocations(savedOverrides.sameDesignForLocations);
      if (savedOverrides.lastEditScope === "tier" || savedOverrides.lastEditScope === "combination")
        setEditScope("tier");
      else setEditScope("base");
      if (savedOverrides.lastActiveTierId) setActiveTierId(savedOverrides.lastActiveTierId);
      if (savedOverrides.lastActiveTourStopIdx !== undefined)
        setActiveTourStopIdx(savedOverrides.lastActiveTourStopIdx);
      setIsInitialized(true);
      setIsDirty(false);
    }
  }, [dbProject, isInitialized, initialTemplate]);

  useEffect(() => {
    // Only reset if they actively toggle to something invalid
    if (isInitialized) {
      if (!activeTierId && editScope === "tier") setEditScope("base");
    }
  }, [activeTierId, isInitialized]);

  useEffect(() => {
    if (editScope === "tier" && activeTierId) {
      const el = document.getElementById(`tier-preview-${activeTierId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeTierId, editScope]);

  const orderId = useMemo(() => "AGT-" + Math.random().toString(36).slice(2, 8).toUpperCase(), []);

  const saveMutation = useMutation({
    mutationFn: async (variables: any) => updateTicketProject({ data: variables } as any),
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["ticket-project", projectId] });
      toast.success("Project saved successfully!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error saving project! Please check the console.");
    },
  });

  console.log("TicketDesigner Render: ", { isProjectLoading, dbProject, projectError, isProjectError, userAccessLevel, accessError, isAccessError });
  if (isProjectError || isAccessError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
        <p className="mb-2">Project Error: {projectError?.message || "None"}</p>
        <p>Access Error: {accessError?.message || "None"}</p>
      </div>
    );
  }

  if (isProjectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading Ticket Project...</p>
      </div>
    );
  }

  const updateDesign = (key: keyof TicketDesign, value: any) => {
    setIsDirty(true);

    // Check if we are designing a specific Tier
    if (editScope === "tier" && activeTierId) {
      if (activeTourStopIdx >= 0 && !sameDesignForLocations) {
        // Combination: Specific Tier inside a Specific Location
        setOverrides((prev: any) => ({
          ...prev,
          combinations: {
            ...prev.combinations,
            [`${activeTourStopIdx}_${activeTierId}`]: {
              ...(prev.combinations[`${activeTourStopIdx}_${activeTierId}`] || {}),
              [key]: value,
            },
          },
        }));
      } else {
        // Specific Tier (applies globally across all locations)
        setOverrides((prev: any) => ({
          ...prev,
          tiers: {
            ...prev.tiers,
            [activeTierId]: { ...(prev.tiers[activeTierId] || {}), [key]: value },
          },
        }));
      }
      return;
    }

    // We are in "base" mode (not designing a specific tier)
    if (activeTourStopIdx >= 0 && !sameDesignForLocations) {
      // Specific Location (applies to all tiers in this location)
      setOverrides((prev: any) => ({
        ...prev,
        tourStops: {
          ...prev.tourStops,
          [activeTourStopIdx]: { ...(prev.tourStops[activeTourStopIdx] || {}), [key]: value },
        },
      }));
      return;
    }

    // Truly global Base Template
    setBaseDesign((prev) => ({ ...prev, [key]: value }));
  };

  const activeStop = activeTourStopIdx >= 0 ? tourStops[activeTourStopIdx] : tourStops[0] || null;
  const activeTier = activeTierId
    ? ticketTiers.find((t: any) => t.id === activeTierId)
    : ticketTiers[0] || null;

  const dynamicDefaults = {
    title:
      assignmentType === "event"
        ? eventMatch?.title || "Event Title"
        : assignmentType === "cinema"
        ? cinemaMatch?.name || "Cinema Ticket"
        : venueMatch?.name || "Venue Ticket",
    subtitle:
      assignmentType === "event"
        ? activeStop?.venue
          ? `${activeStop.venue} · ${activeStop.city}${activeStop.address ? `\n${activeStop.address}` : ""}`
          : eventMatch?.category || "Event"
        : assignmentType === "cinema"
        ? cinemaMatch?.address
          ? `${cinemaMatch.address}${cinemaMatch.city ? ` · ${cinemaMatch.city}` : ""}`
          : "Cinema Location TBD"
        : venueMatch?.address
          ? `${venueMatch.address}${venueMatch.city ? ` · ${venueMatch.city}` : ""}`
          : venueMatch?.type || "Location TBD",
    date: assignmentType === "event" ? activeStop?.date || "TBD" : "Valid for 1 Day",
    time: assignmentType === "event" ? activeStop?.time || "TBD" : "Anytime during opening hours",

    price: activeTier?.cost?.toString() || "0",
    tierName: activeTier?.type || "General",
    seat: "General Admission",
    currency: getCurrencySymbol(activeWorkspace?.currency || activeWorkspace?.wallet?.currency),
    brand: activeWorkspace?.name?.toUpperCase() || "Agatike",
  };

  const mergedDesign = {
    ...baseDesign,
    ...(!sameDesignForLocations && activeTourStopIdx >= 0
      ? overrides.tourStops[activeTourStopIdx]
      : {}),
    ...(activeTierId ? overrides.tiers[activeTierId] : {}),
    ...(!sameDesignForLocations && activeTourStopIdx >= 0 && activeTierId
      ? overrides.combinations[`${activeTourStopIdx}_${activeTierId}`]
      : {}),
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image size must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      updateDesign("cover", dataUrl); // Immediate preview

      try {
        const base64 = dataUrl.split(",")[1];
        const res = await uploadFile({
          data: {
            base64,
            contentType: file.type,
            folder: "tickets/covers",
            ext: file.type.split("/")[1] || "jpg",
          },
        } as any);
        updateDesign("cover", res.url);
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload cover permanently. It might not save correctly.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: projectId,
      coverImage: baseDesign.cover,
      design_overrides: {
        overrides,
        layout: baseDesign.layout || defaultLayout,
        back: baseDesign.back || defaultBack,
        lastEditScope: editScope,
        lastActiveTierId: activeTierId,
        lastActiveTourStopIdx: activeTourStopIdx,
        sameDesignForLocations,
      },
      eventId: assignmentType === "event" ? eventId || null : null,
      venueId: assignmentType === "venue" ? venueId || null : null,
      cinemaId: assignmentType === "cinema" ? cinemaId || null : null,
      font: baseDesign.font,
      logoText: baseDesign.logoText,
      name: projectName,
      palette: baseDesign.palette,
      seat: baseDesign.seat,
      template: baseDesign.template,
      tier: dynamicDefaults.tierName,
      updated_on: new Date().toISOString(),
      logoScale: String(baseDesign.logoScale || 24),
      logoImage: baseDesign.logoImage || "",
      logoOpacity: String(baseDesign.logoOpacity ?? 1),
      logoColorMode: baseDesign.logoColorMode || "original",
    });
  };

  const exportPDF = async () => {
    if (isDirty) {
      toast.error("Please save your project changes before exporting.");
      return;
    }

    const ticketElement = document.getElementById("ticket-preview-container");
    if (!ticketElement) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${projectName.replace(/\s+/g, "-").toLowerCase()}-ticket.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      toast.error("An error occurred while generating the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoClick = () => {
    const current = mergedDesign.logoScale || 24;
    let next = 24;
    if (current === 24) next = 32;
    else if (current === 32) next = 48;
    else if (current === 48) next = 64;
    else next = 24;
    updateDesign("logoScale", next);
  };

  const getTierSpecificDesign = (tierId: string) => {
    return {
      ...baseDesign,
      ...(!sameDesignForLocations && activeTourStopIdx >= 0
        ? overrides.tourStops[activeTourStopIdx]
        : {}),
      ...(tierId ? overrides.tiers[tierId] : {}),
      ...(!sameDesignForLocations && activeTourStopIdx >= 0 && tierId
        ? overrides.combinations[`${activeTourStopIdx}_${tierId}`]
        : {}),
    };
  };

  const getTourStopSpecificDesign = (stopIdx: number) => {
    return {
      ...baseDesign,
      ...(!sameDesignForLocations && stopIdx >= 0 ? overrides.tourStops[stopIdx] : {}),
      ...(activeTierId ? overrides.tiers[activeTierId] : {}),
      ...(!sameDesignForLocations && stopIdx >= 0 && activeTierId
        ? overrides.combinations[`${stopIdx}_${activeTierId}`]
        : {}),
    };
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-secondary/30 overflow-hidden">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/$workspaceSlug/ticket-designer"
            params={{ workspaceSlug: workspaceSlug || "" }}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Ticket Projects / Editor</p>
            <Input
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setIsDirty(true);
              }}
              className="h-7 px-1 py-0 border-transparent hover:border-border/60 focus:border-primary focus-visible:ring-0 shadow-none bg-transparent font-semibold text-lg sm:w-64 md:w-80"
              placeholder="Name this project..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <Button
            variant="outline"
            className="rounded-full border-border/60 bg-white/5 hover:bg-white/10"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Contributor
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || userAccessLevel === "view"}
            className={`rounded-full shadow-[var(--shadow-glow)] transition-all ${isDirty && userAccessLevel !== "view" ? "animate-pulse" : ""}`}
            style={{ background: isDirty && userAccessLevel !== "view" ? "var(--gradient-primary)" : "var(--border)" }}
          >
            <Save className="mr-1 h-4 w-4" />{" "}
            {saveMutation.isPending ? "Saving..." : userAccessLevel === "view" ? "View Only" : isDirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </header>

      {tourStops.length > 1 && (
        <div className="flex items-center gap-6 bg-background px-6 py-2.5 border-b border-border/60 overflow-x-auto hide-scrollbar z-10">
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={sameDesignForLocations}
              onChange={(e) => {
                const checked = e.target.checked;
                setSameDesignForLocations(checked);
                if (checked) {
                  setActiveTourStopIdx(-1);
                } else {
                  setActiveTourStopIdx(0);
                }
              }}
              className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary bg-secondary/50"
            />
            <span className="text-sm font-medium">Use same design for all locations</span>
          </label>

          {!sameDesignForLocations && (
            <div className="flex items-center gap-2 border-l border-border/60 pl-6">
              {tourStops.map((stop: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveTourStopIdx(idx)}
                  className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTourStopIdx === idx ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {stop.venue || stop.city || `Location ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        {/* Controls */}
        <aside className="min-h-0 space-y-6 overflow-y-auto pb-10 pr-2 -mr-2">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary/50 p-1">
            {(["setup", "design", "media", "layout", "back", "content"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all capitalize ${activeTab === tab ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
              >
                {tab === "back" ? "Back Side" : tab}
              </button>
            ))}
          </div>

          {activeTab === "setup" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Assignment" icon={Calendar}>
                <div className="space-y-3">
                  <Field label="Assign to Event or Venue">
                    <select
                      value={
                        assignmentType === "event" && eventId
                          ? `event:${eventId}`
                          : assignmentType === "venue" && venueId
                            ? `venue:${venueId}`
                            : assignmentType === "cinema" && cinemaId
                            ? `cinema:${cinemaId}`
                            : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setAssignmentType("event");
                          setEventId("");
                          setVenueId("");
                          setCinemaId("");
                        } else if (val.startsWith("event:")) {
                          setAssignmentType("event");
                          setEventId(val.replace("event:", ""));
                          setVenueId("");
                          setCinemaId("");
                        } else if (val.startsWith("venue:")) {
                          setAssignmentType("venue");
                          setVenueId(val.replace("venue:", ""));
                          setEventId("");
                          setCinemaId("");
                        } else if (val.startsWith("cinema:")) {
                          setAssignmentType("cinema");
                          setCinemaId(val.replace("cinema:", ""));
                          setVenueId("");
                          setEventId("");
                        }
                        setIsDirty(true);
                      }}
                      disabled={!!dbProject?.eventId || !!dbProject?.venueId || !!dbProject?.cinemaId}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary/20"
                    >
                      <option value="">-- No Assignment --</option>
                      {events.length > 0 && (
                        <optgroup label="Events">
                          {events.map((ev: any) => (
                            <option key={ev.id} value={`event:${ev.id}`}>
                              {ev.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {venues.length > 0 && (
                        <optgroup label="Venues">
                          {venues.map((v: any) => (
                            <option key={v.id} value={`venue:${v.id}`}>
                              {v.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {cinemas.length > 0 && (
                        <optgroup label="Cinemas / Theatres">
                          {cinemas.map((c: any) => (
                            <option key={c.id} value={`cinema:${c.id}`}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Design Mode" icon={Eye}>
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Design all tickets at once, or switch modes to create unique designs for
                    specific locations and tiers.
                  </p>

                  {tourStops.length > 0 && sameDesignForLocations && (
                    <Field label="1. Preview Location / Date">
                      <select
                        value={activeTourStopIdx}
                        onChange={(e) => setActiveTourStopIdx(Number(e.target.value))}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        <option value={-1}>All Locations (Base Preview)</option>
                        {tourStops.map((stop: any, i: number) => (
                          <option key={i} value={i}>
                            {stop.venue || stop.city || "TBD"} - {stop.date || "TBD"}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  <Field
                    label={
                      tourStops.length > 0 && sameDesignForLocations
                        ? "2. What are you designing right now?"
                        : "What are you designing right now?"
                    }
                  >
                    <select
                      value={editScope}
                      onChange={(e) => {
                        const scope = e.target.value as any;
                        setEditScope(scope);
                        if (scope === "tier" && !activeTierId && ticketTiers.length > 0)
                          setActiveTierId(ticketTiers[0].id);
                        if (scope === "base") {
                          setActiveTierId("");
                        }
                      }}
                      className="w-full rounded-xl border border-primary/60 bg-primary/10 text-primary px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                    >
                      <option value="base">{assignmentType === "cinema" ? "Base Design (All Movies/Tiers)" : "Base Template (Applies to ALL tickets)"}</option>
                      {ticketTiers.length > 1 && (
                        <option value="tier">{assignmentType === "cinema" ? "Specific Movie/Tier independently" : "Specific Tiers independently"}</option>
                      )}
                    </select>
                  </Field>

                  {editScope === "tier" && ticketTiers.length > 0 && (
                    <Field label="Currently Editing Tier">
                      <select
                        value={activeTierId}
                        onChange={(e) => setActiveTierId(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        {ticketTiers.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.type} {assignmentType !== "cinema" && `(${t.cost})`}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {editScope === "tier" && (
                    <div className="rounded-lg bg-primary/5 p-3 text-xs text-primary/80 border border-primary/20">
                      <p>
                        <strong>Tip:</strong> You are seeing all your tiers in the live preview.
                        Click on any ticket on the right to select it and edit its unique design!
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Template" icon={TicketIcon}>
                <div className="grid grid-cols-2 gap-2">
                  {templates
                    .filter((t) => t.id.startsWith(mergedDesign.template.split("-")[0]))
                    .map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => updateDesign("template", t.id)}
                          className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                            mergedDesign.template === t.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          <Icon className="mb-2 h-6 w-6" style={{ color: t.accent }} />
                          <span className="text-[10px] font-semibold text-center">{t.label}</span>
                        </button>
                      );
                    })}
                </div>
              </Section>

              <Section title="Palette" icon={Palette}>
                <div className="grid grid-cols-3 gap-2">
                  {palettes.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => updateDesign("palette", p)}
                      className={`h-14 rounded-xl border-2 transition ${
                        mergedDesign.palette?.name === p.name
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                      title={p.name}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Typography" icon={Type}>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => updateDesign("font", f)}
                      style={{ fontFamily: f.css }}
                      className={`rounded-xl border p-3 text-left text-sm ${
                        mergedDesign.font?.name === f.name
                          ? "border-primary bg-accent/40"
                          : "border-border/60"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{f.name}</p>
                      <p className="font-semibold">Aa Bb 123</p>
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Cover image" icon={ImageIcon}>
                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground hover:bg-secondary">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files?.[0])}
                  />
                  {mergedDesign.cover || eventMatch?.cover
                    ? "Replace cover"
                    : "Drop image or click to upload"}
                </label>
              </Section>

              <Section title="Logo image" icon={ImageIcon}>
                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground hover:bg-secondary">
                  <input
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.type !== "image/png") {
                        toast.error(
                          "Only PNG images are allowed for logos to preserve transparency.",
                        );
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("Logo file size must be under 2MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const dataUrl = String(reader.result);
                        updateDesign("logoImage", dataUrl); // Immediate preview

                        try {
                          const base64 = dataUrl.split(",")[1];
                          const res = await uploadFile({
                            data: {
                              base64,
                              contentType: file.type,
                              folder: "tickets/logos",
                              ext: "png",
                            },
                          } as any);
                          updateDesign("logoImage", res.url);
                        } catch (err) {
                          toast.error(
                            "Failed to upload logo permanently. It might not save correctly.",
                          );
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {mergedDesign.logoImage ? "Replace logo (PNG < 2MB)" : "Drop PNG logo (< 2MB)"}
                </label>
              </Section>

              {mergedDesign.logoImage && (
                <Section title="Logo settings" icon={ImageIcon}>
                  <div className="space-y-4">
                    <Field label="Size">
                      <input
                        type="range"
                        min="16"
                        max="80"
                        value={mergedDesign.logoScale || 24}
                        onChange={(e) => updateDesign("logoScale", Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </Field>
                    <Field label="Opacity">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={mergedDesign.logoOpacity ?? 1}
                        onChange={(e) => updateDesign("logoOpacity", Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </Field>
                    <Field label="Color Theme">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDesign("logoColorMode", "original")}
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${mergedDesign.logoColorMode === "original" || !mergedDesign.logoColorMode ? "border-primary bg-primary/20 text-primary" : "border-border/60 hover:bg-secondary"}`}
                        >
                          Original
                        </button>
                        <button
                          onClick={() => updateDesign("logoColorMode", "white")}
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${mergedDesign.logoColorMode === "white" ? "border-primary bg-primary/20 text-primary" : "border-border/60 hover:bg-secondary"}`}
                        >
                          White
                        </button>
                        <button
                          onClick={() => updateDesign("logoColorMode", "black")}
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${mergedDesign.logoColorMode === "black" ? "border-primary bg-primary/20 text-primary" : "border-border/60 hover:bg-secondary"}`}
                        >
                          Black
                        </button>
                      </div>
                    </Field>
                  </div>
                </Section>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Content" icon={TicketIcon}>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 mb-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Event details (title, venue, dates) are pulled automatically from the linked
                    event. Only brand information can be edited here.
                  </p>
                </div>
                <div className="space-y-3">
                  <Field label="Brand / Workspace Name">
                    <Input
                      value={mergedDesign.logoText || ""}
                      onChange={(e) => updateDesign("logoText", e.target.value)}
                      placeholder={dynamicDefaults.brand}
                    />
                  </Field>
                  <Field label="Seat / Section">
                    <Input
                      value={mergedDesign.seat || ""}
                      onChange={(e) => updateDesign("seat", e.target.value)}
                      placeholder={dynamicDefaults.seat}
                    />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Text Sizes" icon={Type}>
                <div className="space-y-4">
                  <Field
                    label={`Title size: ${mergedDesign.layout?.titleSize ?? defaultLayout.titleSize}px`}
                  >
                    <input
                      type="range"
                      min="18"
                      max="52"
                      step="1"
                      value={mergedDesign.layout?.titleSize ?? defaultLayout.titleSize}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          titleSize: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field
                    label={`Subtitle size: ${mergedDesign.layout?.subtitleSize ?? defaultLayout.subtitleSize}px`}
                  >
                    <input
                      type="range"
                      min="10"
                      max="24"
                      step="1"
                      value={mergedDesign.layout?.subtitleSize ?? defaultLayout.subtitleSize}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          subtitleSize: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field
                    label={`Info row size: ${mergedDesign.layout?.metaSize ?? defaultLayout.metaSize}px`}
                  >
                    <input
                      type="range"
                      min="8"
                      max="18"
                      step="1"
                      value={mergedDesign.layout?.metaSize ?? defaultLayout.metaSize}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          metaSize: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Text Alignment" icon={AlignLeft}>
                <Field label="Title alignment">
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => {
                      const Icon =
                        align === "left"
                          ? AlignLeft
                          : align === "center"
                            ? AlignCenter
                            : AlignRight;
                      return (
                        <button
                          key={align}
                          onClick={() =>
                            updateDesign("layout", {
                              ...(mergedDesign.layout || defaultLayout),
                              titleAlign: align,
                            })
                          }
                          className={`flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-xs transition ${
                            (mergedDesign.layout?.titleAlign ?? "left") === align
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-border/60 hover:bg-secondary"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </Section>

              <Section title="Vertical Position" icon={Move}>
                <div className="space-y-4">
                  <Field label={`Title Y offset: ${mergedDesign.layout?.titleOffsetY ?? 0}%`}>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={mergedDesign.layout?.titleOffsetY ?? 0}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          titleOffsetY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Subtitle Y offset: ${mergedDesign.layout?.subtitleOffsetY ?? 0}%`}>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={mergedDesign.layout?.subtitleOffsetY ?? 0}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          subtitleOffsetY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Info row Y offset: ${mergedDesign.layout?.metaOffsetY ?? 0}%`}>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={mergedDesign.layout?.metaOffsetY ?? 0}
                      onChange={(e) =>
                        updateDesign("layout", {
                          ...(mergedDesign.layout || defaultLayout),
                          metaOffsetY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </Field>
                  <button
                    onClick={() => updateDesign("layout", defaultLayout)}
                    className="w-full rounded-xl border border-border/60 py-2 text-xs text-muted-foreground hover:bg-secondary transition"
                  >
                    Reset to defaults
                  </button>
                </div>
              </Section>
            </div>
          )}

          {activeTab === "back" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Back Side Text" icon={Type}>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Custom message / terms</Label>
                  <div className="quill-ticket-editor rounded-xl overflow-hidden border border-border/60">
                    <ClientOnly fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl" />}><Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl" />}><ReactQuill
                      theme="snow"
                      value={
                        mergedDesign.back?.backText ??
                        (mergedDesign.template === "experience"
                          ? DEFAULT_EXPERIENCE_BACK_HTML
                          : DEFAULT_TERMS_HTML)
                      }
                      onChange={(val) =>
                        updateDesign("back", {
                          ...(mergedDesign.back || defaultBack),
                          backText: val,
                        })
                      }
                      modules={{
                        toolbar: [
                          [{ header: [false, 2, 3] }],
                          ["bold", "italic", "underline"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["clean"],
                        ],
                      }}
                      formats={["header", "bold", "italic", "underline", "list"]}
                    /></Suspense></ClientOnly>
                  </div>
                </div>
              </Section>

              <Section title="Back Side Image" icon={ImageIcon}>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground hover:bg-secondary">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () =>
                          updateDesign("back", {
                            ...(mergedDesign.back || defaultBack),
                            backImage: String(reader.result),
                          });
                        reader.readAsDataURL(file);
                      }}
                    />
                    {mergedDesign.back?.backImage
                      ? "Replace back image"
                      : "Upload background image for back"}
                  </label>
                  {mergedDesign.back?.backImage && (
                    <>
                      <Field
                        label={`Image opacity: ${Math.round((mergedDesign.back?.backImageOpacity ?? 0.35) * 100)}%`}
                      >
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={mergedDesign.back?.backImageOpacity ?? 0.35}
                          onChange={(e) =>
                            updateDesign("back", {
                              ...(mergedDesign.back || defaultBack),
                              backImageOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-primary"
                        />
                      </Field>
                      <button
                        onClick={() =>
                          updateDesign("back", {
                            ...(mergedDesign.back || defaultBack),
                            backImage: "",
                          })
                        }
                        className="w-full rounded-xl border border-destructive/40 py-2 text-xs text-destructive hover:bg-destructive/10 transition"
                      >
                        Remove image
                      </button>
                    </>
                  )}
                </div>
              </Section>
            </div>
          )}
        </aside>

        {/* Preview */}
        <section className="flex flex-col gap-6 min-h-0">
          <div className="flex-1 min-h-0 rounded-3xl border border-border/60 bg-card p-8 flex flex-col overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Live preview
                </p>
                <h3 className="text-lg font-semibold">
                  {dynamicDefaults.tierName} · {mergedDesign.template}
                </h3>
              </div>
              <div className="flex gap-2 text-xs">
                {(["Front", "Back", "Mobile"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setPreviewMode(v)}
                    className={`rounded-full px-3 py-1 ${v === previewMode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`flex-1 flex ${editScope === "tier" && ticketTiers.length > 0 ? "flex-col py-8 justify-start" : "items-center justify-center"} overflow-auto gap-12`}
            >
              {editScope === "tier" && ticketTiers.length > 0 ? (
                ticketTiers.map((tier: any) => {
                  const tDesign = getTierSpecificDesign(tier.id);
                  const isSelected = activeTierId === tier.id;
                  const stopSubtitle =
                    activeTourStopIdx >= 0 && tourStops[activeTourStopIdx]?.venue
                      ? `${tourStops[activeTourStopIdx].venue} · ${tourStops[activeTourStopIdx].city}${tourStops[activeTourStopIdx].address ? `\n${tourStops[activeTourStopIdx].address}` : ""}`
                      : "";
                  return (
                    <div
                      key={tier.id}
                      id={`tier-preview-${tier.id}`}
                      className={`relative cursor-pointer transition-all duration-300 mx-auto ${isSelected ? "ring-4 ring-primary ring-offset-8 ring-offset-card rounded-[28px] scale-100" : "opacity-40 hover:opacity-80 scale-95"}`}
                      onClick={() => setActiveTierId(tier.id)}
                    >
                      <TicketPreview
                        template={tDesign.template}
                        palette={tDesign.palette}
                        font={tDesign.font}
                        tier={tier.type || "General"}
                        title={tDesign.title || dynamicDefaults.title || ""}
                        subtitle={
                          tDesign.subtitle || stopSubtitle || dynamicDefaults.subtitle || ""
                        }
                        date={
                          tDesign.date ||
                          (activeTourStopIdx >= 0
                            ? tourStops[activeTourStopIdx].date
                            : dynamicDefaults.date) ||
                          ""
                        }
                        time={
                          tDesign.time ||
                          (activeTourStopIdx >= 0
                            ? tourStops[activeTourStopIdx].time
                            : dynamicDefaults.time) ||
                          ""
                        }
                        seat={tDesign.seat || dynamicDefaults.seat}
                        price={tier.cost?.toString() || "0"}
                        currency={tDesign.currency || dynamicDefaults.currency}
                        cover={
                          tDesign.cover ||
                          (assignmentType === "cinema"
                            ? cinemaMatch?.cover_url
                            : assignmentType === "venue"
                            ? venueMatch?.cover_url || venueMatch?.images?.[0]
                            : eventMatch?.cover) ||
                          ""
                        }
                        logoText={tDesign.logoText || dynamicDefaults.brand}
                        logoImage={tDesign.logoImage}
                        logoScale={tDesign.logoScale || 24}
                        logoOpacity={tDesign.logoOpacity ?? 1}
                        logoColorMode={tDesign.logoColorMode || "original"}
                        orderId={orderId}
                        previewMode={previewMode}
                        onLogoClick={handleLogoClick}
                        layout={tDesign.layout || defaultLayout}
                        back={tDesign.back || defaultBack}
                      />
                      {isSelected && (
                        <div className="absolute -right-2 -top-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50">
                          Currently Editing
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <TicketPreview
                  template={mergedDesign.template}
                  palette={mergedDesign.palette}
                  font={mergedDesign.font}
                  tier={dynamicDefaults.tierName}
                  title={mergedDesign.title || dynamicDefaults.title || ""}
                  subtitle={mergedDesign.subtitle || dynamicDefaults.subtitle || ""}
                  date={mergedDesign.date || dynamicDefaults.date || ""}
                  time={mergedDesign.time || dynamicDefaults.time || ""}
                  seat={mergedDesign.seat || dynamicDefaults.seat}
                  price={mergedDesign.price || dynamicDefaults.price || ""}
                  currency={mergedDesign.currency || dynamicDefaults.currency}
                  cover={
                    mergedDesign.cover ||
                    (assignmentType === "cinema"
                      ? cinemaMatch?.cover_url
                      : assignmentType === "venue"
                      ? venueMatch?.cover_url || venueMatch?.images?.[0]
                      : eventMatch?.cover) ||
                    ""
                  }
                  logoText={mergedDesign.logoText || dynamicDefaults.brand}
                  logoImage={mergedDesign.logoImage}
                  logoScale={mergedDesign.logoScale || 24}
                  logoOpacity={mergedDesign.logoOpacity ?? 1}
                  logoColorMode={mergedDesign.logoColorMode || "original"}
                  orderId={orderId}
                  previewMode={previewMode}
                  onLogoClick={handleLogoClick}
                  layout={mergedDesign.layout || defaultLayout}
                  back={mergedDesign.back || defaultBack}
                />
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Export</p>
                <h4 className="mt-1 font-semibold text-base">Print-Ready PDF</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generate a high-quality, print-ready PDF of your ticket design.
                </p>
              </div>
              <Button
                onClick={exportPDF}
                disabled={isExporting}
                className="rounded-full shadow-sm shrink-0"
              >
                <Download className="mr-2 h-4 w-4" />{" "}
                {isExporting ? "Generating PDF..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <InviteContributorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        resourceType="ticket_project"
        resourceId={projectId}
      />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
