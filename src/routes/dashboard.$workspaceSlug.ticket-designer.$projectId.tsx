import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import ReactQuill from "react-quill-new";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ticketProjects } from "@/lib/mock-data";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceEvents, saveTicketProject, getTicketProjectById, updateTicketProject } from "@/api/events";
import { toast } from "sonner";

function getCurrencySymbol(currency?: string) {
  if (!currency) return "$";
  switch (currency.toUpperCase()) {
    case "EUR": return "€";
    case "GBP": return "£";
    case "RWF": return "RWF ";
    case "KES": return "KES ";
    case "UGX": return "UGX ";
    default: return "$";
  }
}

export const Route = createFileRoute("/dashboard/$workspaceSlug/ticket-designer/$projectId")({
  head: () => ({
    meta: [
      { title: "Ticket Designer — Agatike" },
    ],
  }),
  component: TicketDesignerPage,
});

type Template = "concert" | "movie" | "experience" | "conference" | "entrance";

const templates: { id: Template; label: string; icon: any; accent: string }[] = [
  { id: "concert", label: "Concert / Event", icon: TicketIcon, accent: "#f97316" },
  { id: "movie", label: "Movie", icon: Film, accent: "#dc2626" },
  { id: "experience", label: "Experience", icon: Mountain, accent: "#16a34a" },
  { id: "conference", label: "Conference", icon: Briefcase, accent: "#0ea5e9" },
  { id: "entrance", label: "General Entrance", icon: MapPin, accent: "#8b5cf6" },
];

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
  titleSize: number;       // px
  subtitleSize: number;    // px
  metaSize: number;        // px
  titleAlign: "left" | "center" | "right";
  titleOffsetY: number;    // % from default position
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
  const { workspaceSlug, projectId } = useParams({ from: "/dashboard/$workspaceSlug/ticket-designer/$projectId" });
  const { activeWorkspace } = useWorkspace();

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: dbProject, isLoading: isProjectLoading } = useQuery({
    queryKey: ["ticket-project", projectId],
    queryFn: () => getTicketProjectById({ data: { id: projectId } } as any),
    enabled: !!projectId && projectId.includes("-"), // ensure it looks like a uuid
  });

  // Find existing project or load defaults
  const existingProject = useMemo(() => ticketProjects.find(p => p.id === projectId), [projectId]);

  // Read template from URL if it's a new project
  const searchParams = new URLSearchParams(window.location.search);
  const initialTemplate = searchParams.get("template") as Template || "concert";
  const initialEventId = searchParams.get("eventId") || "";
  const initialName = searchParams.get("name") || "Untitled Project";

  const [projectName, setProjectName] = useState(existingProject?.name || initialName);
  const [eventId, setEventId] = useState(existingProject?.eventId || initialEventId);
  
  const eventMatch = events.find((e: any) => e.id === eventId);
  const ticketTiers = eventMatch?.event_tickets || [];
  const tourStops = Array.isArray(eventMatch?.tour_stops) ? eventMatch.tour_stops : [];

  const [activeTourStopIdx, setActiveTourStopIdx] = useState<number>(-1);
  const [activeTierId, setActiveTierId] = useState<string>("");
  const [editScope, setEditScope] = useState<"base" | "tier">("base");
  const [sameDesignForLocations, setSameDesignForLocations] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"setup" | "design" | "media" | "content" | "layout" | "back">("setup");
  const [previewMode, setPreviewMode] = useState<"Front" | "Back" | "Mobile">("Front");
  const [isDirty, setIsDirty] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [baseDesign, setBaseDesign] = useState<TicketDesign>({
    template: existingProject?.template || initialTemplate,
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
    logoScale: existingProject?.logoScale || 24,
    logoOpacity: existingProject?.logoOpacity ?? 1,
    logoColorMode: existingProject?.logoColorMode || "original",
    layout: defaultLayout,
    back: defaultBack,
  });

  const [overrides, setOverrides] = useState<any>(existingProject?.design_overrides || {
    tourStops: {}, tiers: {}, combinations: {}
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (dbProject && !isInitialized) {
      setProjectName(dbProject.name || "Untitled Project");
      setEventId(dbProject.eventId || "");
      const savedOverrides = dbProject.design_overrides || {};
      setBaseDesign({
        template: dbProject.template || initialTemplate,
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
        logoColorMode: dbProject.logoColorMode || "original",
        layout: savedOverrides.layout || defaultLayout,
        back: savedOverrides.back || defaultBack,
      });
      setOverrides(savedOverrides.overrides || { tourStops: {}, tiers: {}, combinations: {} });
      if (savedOverrides.sameDesignForLocations !== undefined) setSameDesignForLocations(savedOverrides.sameDesignForLocations);
      if (savedOverrides.lastEditScope === "tier" || savedOverrides.lastEditScope === "combination") setEditScope("tier");
      else setEditScope("base");
      if (savedOverrides.lastActiveTierId) setActiveTierId(savedOverrides.lastActiveTierId);
      if (savedOverrides.lastActiveTourStopIdx !== undefined) setActiveTourStopIdx(savedOverrides.lastActiveTourStopIdx);
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

  const orderId = useMemo(
    () => "AGT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    [],
  );

  const saveMutation = useMutation({
    mutationFn: async (variables: any) => updateTicketProject({ data: variables } as any),
    onSuccess: () => {
      setIsDirty(false);
      toast.success("Project saved successfully!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error saving project! Please check the console.");
    }
  });

  if (isProjectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
              [key]: value
            }
          }
        }));
      } else {
        // Specific Tier (applies globally across all locations)
        setOverrides((prev: any) => ({
          ...prev,
          tiers: {
            ...prev.tiers,
            [activeTierId]: { ...(prev.tiers[activeTierId] || {}), [key]: value }
          }
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
          [activeTourStopIdx]: { ...(prev.tourStops[activeTourStopIdx] || {}), [key]: value }
        }
      }));
      return;
    }

    // Truly global Base Template
    setBaseDesign(prev => ({ ...prev, [key]: value }));
  };

  const activeStop = activeTourStopIdx >= 0 ? tourStops[activeTourStopIdx] : (tourStops[0] || null);
  const activeTier = activeTierId ? ticketTiers.find((t: any) => t.id === activeTierId) : (ticketTiers[0] || null);

  const dynamicDefaults = {
    title: eventMatch?.title || "Event Title",
    subtitle: activeStop?.venue ? `${activeStop.venue} · ${activeStop.city}${activeStop.address ? `\n${activeStop.address}` : ""}` : (eventMatch?.category || "Event"),
    date: activeStop?.date || "TBD",
    time: activeStop?.time || "TBD",
    price: activeTier?.cost?.toString() || "0",
    tierName: activeTier?.type || "General",
    seat: "General Admission",
    currency: getCurrencySymbol(activeWorkspace?.wallet?.currency as string),
    brand: activeWorkspace?.name?.toUpperCase() || "AGATIKE",
  };

  const mergedDesign = {
    ...baseDesign,
    ...(!sameDesignForLocations && activeTourStopIdx >= 0 ? overrides.tourStops[activeTourStopIdx] : {}),
    ...(activeTierId ? overrides.tiers[activeTierId] : {}),
    ...(!sameDesignForLocations && activeTourStopIdx >= 0 && activeTierId ? overrides.combinations[`${activeTourStopIdx}_${activeTierId}`] : {})
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDesign("cover", String(reader.result));
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
      eventId: eventId || null,
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
      const canvas = await html2canvas(ticketElement, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${projectName.replace(/\s+/g, '-').toLowerCase()}-ticket.pdf`);
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
      ...(!sameDesignForLocations && activeTourStopIdx >= 0 ? overrides.tourStops[activeTourStopIdx] : {}),
      ...(tierId ? overrides.tiers[tierId] : {}),
      ...(!sameDesignForLocations && activeTourStopIdx >= 0 && tierId ? overrides.combinations[`${activeTourStopIdx}_${tierId}`] : {})
    };
  };

  const getTourStopSpecificDesign = (stopIdx: number) => {
    return {
      ...baseDesign,
      ...(!sameDesignForLocations && stopIdx >= 0 ? overrides.tourStops[stopIdx] : {}),
      ...(activeTierId ? overrides.tiers[activeTierId] : {}),
      ...(!sameDesignForLocations && stopIdx >= 0 && activeTierId ? overrides.combinations[`${stopIdx}_${activeTierId}`] : {})
    };
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-secondary/30 overflow-hidden">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/$workspaceSlug/ticket-designer" params={{ workspaceSlug: workspaceSlug || "" }} className="rounded-full p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Ticket Projects / Editor</p>
            <Input 
              value={projectName} 
              onChange={(e) => { setProjectName(e.target.value); setIsDirty(true); }} 
              className="h-7 px-1 py-0 border-transparent hover:border-border/60 focus:border-primary focus-visible:ring-0 shadow-none bg-transparent font-semibold text-lg sm:w-64 md:w-80"
              placeholder="Name this project..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <UserPlus className="mr-2 h-4 w-4" /> Invite Contributor
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`rounded-full shadow-[var(--shadow-glow)] transition-all ${isDirty ? "animate-pulse" : ""}`}
            style={{ background: isDirty ? "var(--gradient-primary)" : "var(--border)" }}
          >
            <Save className="mr-1 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : isDirty ? "Save changes" : "Saved"}
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
                        className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTourStopIdx === idx ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
                     >
                        {stop.city || `Location ${idx + 1}`}
                     </button>
                 ))}
              </div>
           )}
        </div>
      )}

      <div className="flex-1 min-h-0 grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        {/* Controls */}
        <aside className="space-y-6 overflow-y-auto pb-10 pr-2 -mr-2">
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
                  <Field label="Assign to Event">
                <select 
                  value={eventId}
                  onChange={e => { setEventId(e.target.value); setIsDirty(true); }}
                  disabled={!!dbProject?.eventId}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary/20"
                >
                  <option value="">-- No Event Assigned --</option>
                  {events.map((ev: any) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Design Mode" icon={Eye}>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Design all tickets at once, or switch modes to create unique designs for specific locations and tiers.
              </p>
              
              {tourStops.length > 0 && sameDesignForLocations && (
                <Field label="1. Preview Location / Date">
                  <select 
                    value={activeTourStopIdx}
                    onChange={e => setActiveTourStopIdx(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={-1}>All Locations (Base Preview)</option>
                    {tourStops.map((stop: any, i: number) => (
                      <option key={i} value={i}>{stop.city || "TBD"} - {stop.date || "TBD"}</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label={tourStops.length > 0 && sameDesignForLocations ? "2. What are you designing right now?" : "What are you designing right now?"}>
                  <select 
                    value={editScope}
                    onChange={e => {
                       const scope = e.target.value as any;
                       setEditScope(scope);
                       if (scope === "tier" && !activeTierId && ticketTiers.length > 0) setActiveTierId(ticketTiers[0].id);
                       if (scope === "base") {
                         setActiveTierId("");
                       }
                    }}
                    className="w-full rounded-xl border border-primary/60 bg-primary/10 text-primary px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                  >
                    <option value="base">Base Template (Applies to ALL tickets)</option>
                    {ticketTiers.length > 1 && <option value="tier">Specific Tiers independently</option>}
                  </select>
              </Field>

              {editScope === "tier" && ticketTiers.length > 0 && (
                <Field label="Currently Editing Tier">
                  <select 
                    value={activeTierId}
                    onChange={e => setActiveTierId(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {ticketTiers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.type} (${t.cost})</option>
                    ))}
                  </select>
                </Field>
              )}
              
              {editScope === "tier" && (
                <div className="rounded-lg bg-primary/5 p-3 text-xs text-primary/80 border border-primary/20">
                  <p><strong>Tip:</strong> You are seeing all your tiers in the live preview. Click on any ticket on the right to select it and edit its unique design!</p>
                </div>
              )}
            </div>
          </Section>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">

          <Section title="Palette" icon={Palette}>
            <div className="grid grid-cols-3 gap-2">
              {palettes.map((p) => (
                <button
                  key={p.name}
                  onClick={() => updateDesign("palette", p)}
                  className={`h-14 rounded-xl border-2 transition ${
                    mergedDesign.palette?.name === p.name ? "border-primary" : "border-transparent"
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
                    mergedDesign.font?.name === f.name ? "border-primary bg-accent/40" : "border-border/60"
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
                  {(mergedDesign.cover || eventMatch?.cover) ? "Replace cover" : "Drop image or click to upload"}
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
                        toast.error("Only PNG images are allowed for logos to preserve transparency.");
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("Logo file size must be under 2MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => updateDesign("logoImage", String(reader.result));
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
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Event details (title, venue, dates) are pulled automatically from the linked event. Only brand information can be edited here.</p>
                </div>
                <div className="space-y-3">
                  <Field label="Brand / Workspace Name">
                    <Input value={mergedDesign.logoText || ""} onChange={(e) => updateDesign("logoText", e.target.value)} placeholder={dynamicDefaults.brand} />
                  </Field>
                  <Field label="Seat / Section">
                    <Input value={mergedDesign.seat || ""} onChange={(e) => updateDesign("seat", e.target.value)} placeholder={dynamicDefaults.seat} />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Text Sizes" icon={Type}>
                <div className="space-y-4">
                  <Field label={`Title size: ${mergedDesign.layout?.titleSize ?? defaultLayout.titleSize}px`}>
                    <input
                      type="range" min="18" max="52" step="1"
                      value={mergedDesign.layout?.titleSize ?? defaultLayout.titleSize}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), titleSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Subtitle size: ${mergedDesign.layout?.subtitleSize ?? defaultLayout.subtitleSize}px`}>
                    <input
                      type="range" min="10" max="24" step="1"
                      value={mergedDesign.layout?.subtitleSize ?? defaultLayout.subtitleSize}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), subtitleSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Info row size: ${mergedDesign.layout?.metaSize ?? defaultLayout.metaSize}px`}>
                    <input
                      type="range" min="8" max="18" step="1"
                      value={mergedDesign.layout?.metaSize ?? defaultLayout.metaSize}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), metaSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Text Alignment" icon={AlignLeft}>
                <Field label="Title alignment">
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => {
                      const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                      return (
                        <button
                          key={align}
                          onClick={() => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), titleAlign: align })}
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
                      type="range" min="-30" max="30" step="1"
                      value={mergedDesign.layout?.titleOffsetY ?? 0}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), titleOffsetY: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Subtitle Y offset: ${mergedDesign.layout?.subtitleOffsetY ?? 0}%`}>
                    <input
                      type="range" min="-30" max="30" step="1"
                      value={mergedDesign.layout?.subtitleOffsetY ?? 0}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), subtitleOffsetY: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Field>
                  <Field label={`Info row Y offset: ${mergedDesign.layout?.metaOffsetY ?? 0}%`}>
                    <input
                      type="range" min="-30" max="30" step="1"
                      value={mergedDesign.layout?.metaOffsetY ?? 0}
                      onChange={(e) => updateDesign("layout", { ...(mergedDesign.layout || defaultLayout), metaOffsetY: Number(e.target.value) })}
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
                      <ReactQuill
                      theme="snow"
                      value={mergedDesign.back?.backText ?? (mergedDesign.template === "experience" ? DEFAULT_EXPERIENCE_BACK_HTML : DEFAULT_TERMS_HTML)}
                      onChange={(val) => updateDesign("back", { ...(mergedDesign.back || defaultBack), backText: val })}
                      modules={{
                        toolbar: [
                          [{ header: [false, 2, 3] }],
                          ["bold", "italic", "underline"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["clean"],
                        ],
                      }}
                      formats={["header", "bold", "italic", "underline", "list"]}
                    />
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
                        reader.onload = () => updateDesign("back", { ...(mergedDesign.back || defaultBack), backImage: String(reader.result) });
                        reader.readAsDataURL(file);
                      }}
                    />
                    {mergedDesign.back?.backImage ? "Replace back image" : "Upload background image for back"}
                  </label>
                  {mergedDesign.back?.backImage && (
                    <>
                      <Field label={`Image opacity: ${Math.round((mergedDesign.back?.backImageOpacity ?? 0.35) * 100)}%`}>
                        <input
                          type="range" min="0.05" max="1" step="0.05"
                          value={mergedDesign.back?.backImageOpacity ?? 0.35}
                          onChange={(e) => updateDesign("back", { ...(mergedDesign.back || defaultBack), backImageOpacity: Number(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </Field>
                      <button
                        onClick={() => updateDesign("back", { ...(mergedDesign.back || defaultBack), backImage: "" })}
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
                <h3 className="text-lg font-semibold">{dynamicDefaults.tierName} · {mergedDesign.template}</h3>
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

            <div className={`flex-1 flex ${editScope === "tier" && ticketTiers.length > 0 ? "flex-col py-8 justify-start" : "items-center justify-center"} overflow-auto gap-12`}>
              {editScope === "tier" && ticketTiers.length > 0 ? (
                ticketTiers.map((tier: any) => {
                  const tDesign = getTierSpecificDesign(tier.id);
                  const isSelected = activeTierId === tier.id;
                  const stopSubtitle = activeTourStopIdx >= 0 && tourStops[activeTourStopIdx]?.venue ? `${tourStops[activeTourStopIdx].venue} · ${tourStops[activeTourStopIdx].city}${tourStops[activeTourStopIdx].address ? `\n${tourStops[activeTourStopIdx].address}` : ""}` : "";
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
                        subtitle={tDesign.subtitle || stopSubtitle || dynamicDefaults.subtitle || ""}
                        date={tDesign.date || (activeTourStopIdx >= 0 ? tourStops[activeTourStopIdx].date : dynamicDefaults.date) || ""}
                        time={tDesign.time || (activeTourStopIdx >= 0 ? tourStops[activeTourStopIdx].time : dynamicDefaults.time) || ""}
                        seat={tDesign.seat || dynamicDefaults.seat}
                        price={tier.cost?.toString() || "0"}
                        currency={tDesign.currency || dynamicDefaults.currency}
                        cover={tDesign.cover || eventMatch?.cover || ""}
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
                  cover={mergedDesign.cover || eventMatch?.cover || ""}
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
              <Button onClick={exportPDF} disabled={isExporting} className="rounded-full shadow-sm shrink-0">
                <Download className="mr-2 h-4 w-4" /> {isExporting ? "Generating PDF..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </section>
      </div>
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

function TicketPreview(props: {
  template: Template;
  palette: { from: string; to: string; name: string };
  font: { css: string; name: string };
  tier: string;
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
  logoScale: number;
  logoOpacity: number;
  logoColorMode: string;
  orderId: string;
  previewMode: "Front" | "Back" | "Mobile";
  onLogoClick?: () => void;
  layout: TicketLayout;
  back: TicketBack;
}) {
  const {
    palette,
    font,
    tier,
    title,
    subtitle,
    date,
    time,
    seat,
    price,
    currency,
    cover,
    logoText,
    logoImage,
    logoScale,
    logoOpacity,
    logoColorMode,
    orderId,
    template,
    previewMode,
    onLogoClick,
    layout,
    back,
  } = props;

  if (previewMode === "Front" || previewMode === "Back") {
    const isBack = previewMode === "Back";

    // ── Shared back side ──────────────────────────────────────────────────
    const BackSide = (
      <div className="relative flex-1 p-7" style={{ background: "rgba(0,0,0,0.25)" }}>
        {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover opacity-20 -scale-x-100" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-end mb-4">
            <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
            {logoImage && <img src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="ml-2 max-w-[100px] object-contain" alt="" />}
          </div>
          <div className="flex-1 flex flex-col justify-end relative">
            {back.backImage && <img src={back.backImage} className="absolute inset-0 h-full w-full object-cover rounded-xl" style={{ opacity: back.backImageOpacity }} alt="" />}
            <div className="relative z-10 ticket-back-content text-[10px] text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
          </div>
        </div>
      </div>
    );

    // ── Shared stub (matches Concert front stub) ─────────────────────────
    const Stub = (
      <div className="flex w-[160px] flex-col justify-between bg-black/20 p-5">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-widest opacity-80">Admit One</p>
          <p className="mt-1 text-[10px] font-mono opacity-80 break-all">{orderId}</p>
        </div>
        <div className="rounded-xl bg-white p-1.5 self-start">
          <QRCode value={orderId} size={80} />
        </div>
        <div className="text-left">
          <p className="text-[9px] opacity-80">Scan at entrance</p>
        </div>
      </div>
    );

    // ── Perforator ────────────────────────────────────────────────────────
    const Perf = (
      <div className="relative w-px">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="h-full w-px border-l-2 border-dashed border-white/40" />
      </div>
    );

    // ═══════════════════════════════════════════════════════════════════════
    // CONCERT – horizontal, gradient overlay, bottom-left text
    // ═══════════════════════════════════════════════════════════════════════
    if (template === "concert") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[28px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, height: 230 }}
        >
          {isBack ? BackSide : (
            <div className="relative flex-1 p-7">
              {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">{tier} · {template}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
                    {logoImage && <img src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="mt-1 max-w-[120px] object-contain cursor-pointer hover:opacity-80 transition-opacity" alt="Logo" onClick={onLogoClick} />}
                  </div>
                </div>
                <div style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign }}>
                  <h2 className="font-black leading-tight drop-shadow" style={{ fontSize: `${layout.titleSize}px` }}>{title}</h2>
                  <p className="mt-1 text-white/80 whitespace-pre-line" style={{ fontSize: `${layout.subtitleSize}px` }}>{subtitle}</p>
                </div>
                <div className="grid grid-cols-4 gap-3" style={{ fontSize: `${layout.metaSize}px` }}>
                  <Cell label="Date" value={date} /><Cell label="Time" value={time} /><Cell label="Seat" value={seat} /><Cell label="Price" value={`${currency}${price}`} />
                </div>
              </div>
            </div>
          )}
          {Perf}
          {Stub}
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MOVIE – wide cinematic, full-bleed cover, dramatic vignette
    // ═══════════════════════════════════════════════════════════════════════
    if (template === "movie") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[24px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, height: 240 }}
        >
          {/* Full-bleed background */}
          {cover ? (
            <img src={cover} className={`absolute inset-0 h-full w-full object-cover ${isBack ? "-scale-x-100" : ""}`} alt="" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }} />
          )}
          {/* Color grade overlay */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${palette.from}bb, ${palette.to}66)`, mixBlendMode: "multiply" }} />
          {/* Cinematic vignette — dark edges, light center */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/10 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <>
              <div className="relative z-10 flex-1 p-7 flex flex-col justify-end">
                <p className="text-xs font-black tracking-[0.3em] mb-3 opacity-80">{logoText}</p>
                <div className="ticket-back-content text-[10px] text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
              </div>
              {/* Film-hole perforator */}
              <div className="relative w-px z-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-card/80" style={{ top: `${10 + i * 15}%` }} />
                ))}
                <div className="h-full w-px border-l-2 border-dashed border-white/30" />
              </div>
              <div className="relative z-10 flex w-[170px] flex-col items-center justify-between bg-black/50 p-5 text-center backdrop-blur-sm">
                {back.backImage && <img src={back.backImage} className="absolute inset-0 h-full w-full object-cover" style={{ opacity: back.backImageOpacity }} alt="" />}
                <p className="relative z-10 text-[9px] uppercase tracking-widest text-white/50">Scan to enter</p>
                <div className="relative z-10 rounded-lg bg-white p-2"><QRCode value={orderId} size={90} /></div>
                <p className="relative z-10 text-[9px] font-mono text-white/50">{orderId}</p>
              </div>
            </>
          ) : (
            /* ── Front ─────────────────────────────────────────────── */
            <>
              {/* Main content area */}
              <div className="relative z-10 flex flex-1 flex-col justify-between p-7">
                {/* Top: tier badge + logo */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">{tier}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {logoImage && (
                      <img src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="max-w-[120px] object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />
                    )}
                    <span className="text-xs font-black tracking-[0.3em] opacity-90">{logoText}</span>
                  </div>
                </div>

                {/* Center: dramatic title */}
                <div style={{ textAlign: layout.titleAlign as any, marginTop: `${layout.titleOffsetY * 0.5}%` }}>
                  <h2 className="font-black leading-none tracking-tight drop-shadow-2xl" style={{ fontSize: `${layout.titleSize + 6}px`, textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}>{title}</h2>
                  <p className="mt-2 text-white/70 tracking-widest uppercase whitespace-pre-line" style={{ fontSize: `${layout.subtitleSize - 1}px`, letterSpacing: "0.2em" }}>{subtitle}</p>
                </div>

                {/* Bottom: info row */}
                <div className="flex gap-8" style={{ fontSize: `${layout.metaSize}px` }}>
                  <Cell label="Date" value={date} />
                  <Cell label="Showtime" value={time} />
                  <Cell label="Screen" value={seat} />
                  <Cell label="Price" value={`${currency}${price}`} />
                </div>
              </div>

              {/* Film-hole perforation */}
              <div className="relative w-px z-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-card/80" style={{ top: `${10 + i * 15}%` }} />
                ))}
                <div className="h-full w-px border-l-2 border-dashed border-white/30" />
              </div>

              {/* QR stub */}
              <div className="relative z-10 flex w-[170px] flex-col items-center justify-between bg-black/50 p-5 text-center backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-widest text-white/50">Now Showing</p>
                <div className="rounded-xl bg-white p-2"><QRCode value={orderId} size={96} /></div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5">Admit One</p>
                  <p className="text-[9px] font-mono text-white/60">{orderId}</p>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPERIENCE – adventure boarding pass, split cover / info panel
    // ═══════════════════════════════════════════════════════════════════════
    if (template === "experience") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[24px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, height: 260 }}
        >
          {/* ── Left: full-bleed cover panel ─────────────────────── */}
          <div className="relative flex-1 overflow-hidden">
            {cover ? (
              <img src={cover} className={`absolute inset-0 h-full w-full object-cover ${isBack ? "-scale-x-100" : ""}`} alt="" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${palette.from}, ${palette.to})` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${palette.from}99, ${palette.to}55)`, mixBlendMode: "multiply" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

            {isBack ? (
              /* Back left: inclusions */
              <div className="relative z-10 flex h-full flex-col justify-end p-6">
                <p className="text-xs font-black tracking-[0.3em] mb-2 opacity-80">{logoText}</p>
                <div
                  className="ticket-back-content text-[10px] text-white/85 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_EXPERIENCE_BACK_HTML }}
                />
              </div>
            ) : (
              /* Front left: activity name */
              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                <div className="flex items-center gap-2">
                  {logoImage && <img src={logoImage} style={{ height: `${logoScale * 0.65}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />}
                  <span className="text-[10px] font-black tracking-[0.25em] opacity-90">{logoText}</span>
                </div>
                <div style={{ textAlign: layout.titleAlign as any, marginTop: `${layout.titleOffsetY * 0.5}%` }}>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 mb-1">Experience</p>
                  <h2 className="font-black leading-tight drop-shadow-xl" style={{ fontSize: `${layout.titleSize + 2}px` }}>{title}</h2>
                  <p className="mt-1 text-white/70 whitespace-pre-line" style={{ fontSize: `${layout.subtitleSize}px` }}>{subtitle}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Perforator ───────────────────────────────────────── */}
          <div className="relative w-px z-10">
            <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
            <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
            <div className="h-full w-px border-l-2 border-dashed border-white/40" />
          </div>

          {/* ── Right: dark info panel ───────────────────────────── */}
          <div
            className="relative flex w-[280px] flex-col justify-between p-6"
            style={{ background: `linear-gradient(160deg, ${palette.from}ee, ${palette.to}cc)` }}
          >
            {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover opacity-15" alt="" />}
            <div className="absolute inset-0 bg-black/50" />

            {isBack ? (
              /* Back right: QR */
              <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
                <p className="text-[9px] uppercase tracking-widest text-white/50">{tier}</p>
                <div className="rounded-xl bg-white p-2"><QRCode value={orderId} size={100} /></div>
                <p className="text-[9px] font-mono text-white/50">{orderId}</p>
              </div>
            ) : (
              /* Front right: adventure details */
              <div className="relative z-10 flex h-full flex-col justify-between">
                {/* Tier badge */}
                <span className="self-start rounded-md bg-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">{tier}</span>

                {/* Info fields */}
                <div className="space-y-2.5" style={{ fontSize: `${layout.metaSize}px` }}>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50">📍 Pickup Point</p>
                    <p className="font-bold text-xs leading-tight mt-0.5">{seat || "Check booking confirmation"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50">🏁 Activity Location</p>
                    <p className="font-bold text-xs leading-tight mt-0.5 whitespace-pre-line">{subtitle || "TBA"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-white/20 pt-2.5">
                    <div><p className="text-[9px] uppercase tracking-widest text-white/50">Date</p><p className="font-bold text-[11px]">{date}</p></div>
                    <div><p className="text-[9px] uppercase tracking-widest text-white/50">Time</p><p className="font-bold text-[11px]">{time}</p></div>
                  </div>
                </div>

                {/* QR + price */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5">Price</p>
                    <p className="text-base font-black">{currency}{price}</p>
                  </div>
                  <div className="rounded-lg bg-white p-1.5"><QRCode value={orderId} size={60} /></div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONFERENCE – movie-ticket portrait style with conference labels
    // ═══════════════════════════════════════════════════════════════════════
    if (template === "conference") {
      return (
        <div
          id="ticket-preview-container"
          className="relative flex w-[500px] max-w-full flex-col overflow-hidden rounded-[28px] text-white shadow-2xl"
          style={{ fontFamily: font.css, background: `linear-gradient(180deg, ${palette.from}, ${palette.to})`, height: 280 }}
        >
          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <>
              {/* Back header + terms */}
              <div className="relative flex-1 flex flex-col p-6 overflow-hidden bg-black/60">
                {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover opacity-20 -scale-x-100" alt="" />}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/20" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <span className="text-[10px] font-black tracking-[0.2em]">{logoText}</span>
                  </div>
                  <div className="flex-1 ticket-back-content text-[10px] text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
                </div>
              </div>
              
              {/* Perforation */}
              <div className="relative h-px mx-0">
                <div className="absolute -left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="absolute -right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="w-full border-t-2 border-dashed border-white/40" />
              </div>

              {/* Back stub */}
              <div className="relative flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md">
                {back.backImage && <img src={back.backImage} className="absolute inset-0 h-full w-full object-cover rounded-b-[28px]" style={{ opacity: back.backImageOpacity }} alt="" />}
                <div className="relative z-10">
                  <p className="text-[9px] uppercase tracking-widest text-white/60">Scan to enter</p>
                  <p className="text-[10px] font-mono text-white/80 mt-0.5">{orderId}</p>
                </div>
                <div className="relative z-10 rounded-xl bg-white p-1.5"><QRCode value={orderId} size={64} /></div>
              </div>
            </>
          ) : (
            <>
              {/* Poster header – taller cover with conference branding */}
              <div className="relative h-[130px] overflow-hidden">
                {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover opacity-55" alt="" />}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-center" style={{ textAlign: layout.titleAlign as any }}>
                  <h2 className="font-black leading-tight drop-shadow-lg" style={{ fontSize: `${layout.titleSize}px` }}>{title}</h2>
                  <p className="text-white/80 mt-0.5 whitespace-pre-line" style={{ fontSize: `${layout.subtitleSize}px` }}>{subtitle}</p>
                </div>
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">{tier}</span>
                  <div className="flex items-center gap-1.5">
                    {logoImage && <img src={logoImage} style={{ height: `${logoScale * 0.6}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />}
                    <span className="text-[10px] font-black tracking-[0.2em]">{logoText}</span>
                  </div>
                </div>
              </div>

              {/* Info row – conference labels */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/15" style={{ fontSize: `${layout.metaSize}px` }}>
                <Cell label="Date" value={date} />
                <Cell label="Time" value={time} />
                <Cell label="Hall / Room" value={seat} />
                <Cell label="Pass" value={`${currency}${price}`} />
              </div>

              {/* Perforation */}
              <div className="relative h-px mx-0">
                <div className="absolute -left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="absolute -right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="w-full border-t-2 border-dashed border-white/40" />
              </div>

              {/* Bottom stub */}
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/60">Conference Pass</p>
                  <p className="text-[10px] font-mono">{orderId}</p>
                </div>
                <div className="rounded-xl bg-white p-1.5"><QRCode value={orderId} size={52} /></div>
                <p className="text-[9px] text-white/60 text-right">Scan at<br/>registration</p>
              </div>
            </>
          )}
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENTRANCE – museum/park pass, clean white card with colored stub
    // ═══════════════════════════════════════════════════════════════════════
    if (template === "entrance") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[16px] shadow-xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, height: 260, background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
        >
          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <div className="flex flex-1 flex-row bg-white text-slate-900">
              {/* Center Content (White) */}
              <div className="relative flex-1 p-8 flex flex-col">
                <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 mb-6">{logoText}</p>
                <div className="ticket-back-content text-[11px] text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
              </div>

              {/* Perforation line */}
              <div className="relative w-px h-full bg-white flex flex-col items-center">
                 <div className="absolute -top-3 h-6 w-6 rounded-full bg-slate-50" />
                 <div className="absolute -bottom-3 h-6 w-6 rounded-full bg-slate-50" />
              </div>

              {/* Right Stub (Colored, which becomes Left due to flex-row-reverse) */}
              <div className="w-[160px] flex flex-col items-center justify-center p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}>
                <div className="rounded-xl bg-white p-1.5 mb-4"><QRCode value={orderId} size={84} /></div>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Scan at Gate</p>
                <p className="text-[11px] font-mono opacity-100 mt-1">{orderId}</p>
              </div>
            </div>
          ) : (
            /* ── Front ─────────────────────────────────────────────── */
            <div className="flex flex-1 flex-row bg-white text-slate-900">
              {/* Left Image */}
              <div className="relative w-[220px]">
                {cover ? (
                  <img src={cover} className="absolute inset-0 h-full w-full object-cover" alt="" />
                ) : (
                  <div className="absolute inset-0 bg-slate-200" />
                )}
                {/* Overlay tier tag */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
                  {tier}
                </div>
              </div>

              {/* Center Content */}
              <div className="flex-1 flex flex-col justify-between p-7 bg-white relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {logoImage && <img src={logoImage} style={{ height: `${logoScale * 0.5}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0)" : "none" }} className="object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} /> }
                    <span className="text-[11px] font-black tracking-[0.2em] text-slate-400">{logoText}</span>
                  </div>
                </div>

                <div style={{ textAlign: layout.titleAlign as any, marginTop: `${layout.titleOffsetY * 0.5}%` }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 whitespace-pre-line">{subtitle}</p>
                  <h2 className="font-black leading-tight text-slate-900" style={{ fontSize: `${layout.titleSize + 4}px` }}>{title}</h2>
                </div>

                <div className="flex items-center gap-8 border-t border-slate-100 pt-4 mt-4" style={{ fontSize: `${layout.metaSize}px` }}>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Date</p>
                    <p className="font-bold mt-0.5">{date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Entry</p>
                    <p className="font-bold mt-0.5">{time || "All Day"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Admit</p>
                    <p className="font-bold mt-0.5">{seat || "1 Person"}</p>
                  </div>
                </div>
              </div>

              {/* Perforation line */}
              <div className="relative w-px h-full bg-white flex flex-col items-center">
                 <div className="absolute -top-3 h-6 w-6 rounded-full bg-slate-50" />
                 <div className="absolute -bottom-3 h-6 w-6 rounded-full bg-slate-50" />
              </div>

              {/* Right Stub (Colored) */}
              <div className="w-[160px] flex flex-col items-center justify-between p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}>
                <div className="w-full text-right">
                   <p className="text-[10px] uppercase tracking-widest opacity-80">Price</p>
                   <p className="text-base font-black">{currency}{price}</p>
                </div>
                <div className="rounded-xl bg-white p-1.5"><QRCode value={orderId} size={84} /></div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback (shouldn't hit)
    return null;
  }
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-white/20 pt-2">
      <p className="text-[9px] uppercase tracking-widest text-white/50">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  );
}
