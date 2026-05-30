import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
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

type Template = "concert" | "movie" | "experience" | "conference";

const templates: { id: Template; label: string; icon: any; accent: string }[] = [
  { id: "concert", label: "Concert / Event", icon: TicketIcon, accent: "#f97316" },
  { id: "movie", label: "Movie", icon: Film, accent: "#dc2626" },
  { id: "experience", label: "Experience", icon: Mountain, accent: "#16a34a" },
  { id: "conference", label: "Conference", icon: Briefcase, accent: "#0ea5e9" },
];

const palettes = [
  { name: "Sunset", from: "#f97316", to: "#db2777" },
  { name: "Midnight", from: "#0f172a", to: "#4f46e5" },
  { name: "Emerald", from: "#064e3b", to: "#10b981" },
  { name: "Noir", from: "#111111", to: "#3f3f46" },
  { name: "Royal", from: "#7c3aed", to: "#ec4899" },
  { name: "Ocean", from: "#0c2340", to: "#2d8a9e" },
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
  const [editScope, setEditScope] = useState<"base" | "stop" | "tier" | "combination">("base");
  const [activeTab, setActiveTab] = useState<"setup" | "design" | "media" | "content">("setup");
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
  });

  const [overrides, setOverrides] = useState<any>(existingProject?.design_overrides || {
    tourStops: {}, tiers: {}, combinations: {}
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (dbProject && !isInitialized) {
      setProjectName(dbProject.name || "Untitled Project");
      setEventId(dbProject.eventId || "");
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
      });
      setOverrides(dbProject.design_overrides || { tourStops: {}, tiers: {}, combinations: {} });
      setIsInitialized(true);
      setIsDirty(false);
    }
  }, [dbProject, isInitialized, initialTemplate]);

  useEffect(() => {
    if (activeTourStopIdx === -1 && (editScope === "stop" || editScope === "combination")) setEditScope("base");
    if (!activeTierId && (editScope === "tier" || editScope === "combination")) setEditScope("base");
  }, [activeTourStopIdx, activeTierId]);

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
    if (editScope === "base") {
      setBaseDesign(prev => ({ ...prev, [key]: value }));
    } else {
      setOverrides((prev: any) => {
        const next = { ...prev };
        let target: any;
        if (editScope === "stop") target = { ...(next.tourStops[activeTourStopIdx] || {}) };
        else if (editScope === "tier") target = { ...(next.tiers[activeTierId] || {}) };
        else target = { ...(next.combinations[`${activeTourStopIdx}_${activeTierId}`] || {}) };
        
        if (value === "" || value === null || value === undefined) delete target[key];
        else target[key] = value;

        if (editScope === "stop") next.tourStops = { ...next.tourStops, [activeTourStopIdx]: target };
        else if (editScope === "tier") next.tiers = { ...next.tiers, [activeTierId]: target };
        else next.combinations = { ...next.combinations, [`${activeTourStopIdx}_${activeTierId}`]: target };

        return next;
      });
    }
  };

  const activeStop = activeTourStopIdx >= 0 ? tourStops[activeTourStopIdx] : (tourStops[0] || null);
  const activeTier = activeTierId ? ticketTiers.find((t: any) => t.id === activeTierId) : (ticketTiers[0] || null);

  const dynamicDefaults = {
    title: eventMatch?.title || "Event Title",
    subtitle: activeStop?.venue ? `${activeStop.venue} · ${activeStop.city}` : (eventMatch?.category || "Event"),
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
    ...(activeTourStopIdx >= 0 ? overrides.tourStops[activeTourStopIdx] : {}),
    ...(activeTierId ? overrides.tiers[activeTierId] : {}),
    ...(activeTourStopIdx >= 0 && activeTierId ? overrides.combinations[`${activeTourStopIdx}_${activeTierId}`] : {})
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
      coverImage: mergedDesign.cover,
      design_overrides: overrides,
      eventId: eventId || "",
      font: mergedDesign.font,
      logoText: mergedDesign.logoText,
      name: projectName,
      palette: mergedDesign.palette,
      seat: mergedDesign.seat,
      template: mergedDesign.template,
      tier: dynamicDefaults.tierName,
      updated_on: new Date().toISOString(),
      workspaceId: activeWorkspace?.id || "",
      logoScale: String(mergedDesign.logoScale || 24),
      logoImage: mergedDesign.logoImage || "",
      logoColorMode: mergedDesign.logoColorMode || "original",
      logoOpacity: String(mergedDesign.logoOpacity ?? 1)
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

  return (
    <div className="min-h-screen bg-secondary/30">
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

      <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        {/* Controls */}
        <aside className="space-y-6">
          <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
            <button
              onClick={() => setActiveTab("setup")}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${activeTab === "setup" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
            >
              Setup
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${activeTab === "design" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${activeTab === "media" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${activeTab === "content" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
            >
              Content
            </button>
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

          <Section title="Live Preview Context" icon={Eye}>
            <div className="space-y-3">
              {tourStops.length > 0 && (
                <Field label="Preview Location / Date">
                  <select 
                    value={activeTourStopIdx}
                    onChange={e => setActiveTourStopIdx(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={-1}>Base Template (All Locations)</option>
                    {tourStops.map((stop: any, i: number) => (
                      <option key={i} value={i}>{stop.city || "TBD"} - {stop.date || "TBD"}</option>
                    ))}
                  </select>
                </Field>
              )}
              {ticketTiers.length > 0 && (
                <Field label="Preview Ticket Tier">
                  <select 
                    value={activeTierId}
                    onChange={e => setActiveTierId(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Base Template (All Tiers)</option>
                    {ticketTiers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.type} (${t.cost})</option>
                    ))}
                  </select>
                </Field>
              )}
              
              <div className="pt-2 border-t border-border/40">
                <Field label="Save My Edits To:">
                  <select 
                    value={editScope}
                    onChange={e => setEditScope(e.target.value as any)}
                    className="w-full rounded-xl border border-border/60 bg-accent/30 text-accent-foreground px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="base">Base Template (Default)</option>
                    {activeTourStopIdx >= 0 && <option value="stop">This Location Only Override</option>}
                    {activeTierId && <option value="tier">This Tier Only Override</option>}
                    {activeTourStopIdx >= 0 && activeTierId && <option value="combination">This Location + Tier Override</option>}
                  </select>
                </Field>
              </div>
            </div>
          </Section>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <Section title="Template" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateDesign("template", t.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                    mergedDesign.template === t.id
                      ? "border-primary bg-accent/40"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <t.icon className="h-4 w-4 text-primary" /> {t.label}
                </button>
              ))}
            </div>
          </Section>

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
                  {mergedDesign.cover ? "Replace cover" : "Drop image or click to upload"}
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
                <div className="space-y-3">
                  <Field label="Title">
                    <Input value={mergedDesign.title || dynamicDefaults.title || ""} onChange={(e) => updateDesign("title", e.target.value)} placeholder={dynamicDefaults.title} />
                  </Field>
                  <Field label="Subtitle / Venue">
                    <Input value={mergedDesign.subtitle || dynamicDefaults.subtitle || ""} onChange={(e) => updateDesign("subtitle", e.target.value)} placeholder={dynamicDefaults.subtitle} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date">
                      <Input value={mergedDesign.date || dynamicDefaults.date || ""} onChange={(e) => updateDesign("date", e.target.value)} placeholder={dynamicDefaults.date} />
                    </Field>
                    <Field label="Time">
                      <Input value={mergedDesign.time || dynamicDefaults.time || ""} onChange={(e) => updateDesign("time", e.target.value)} placeholder={dynamicDefaults.time} />
                    </Field>
                  </div>
                  <Field label="Seat / Section">
                    <Input value={mergedDesign.seat || ""} onChange={(e) => updateDesign("seat", e.target.value)} placeholder={dynamicDefaults.seat} />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Field label="Currency">
                        <Input value={mergedDesign.currency || ""} onChange={(e) => updateDesign("currency", e.target.value)} placeholder={dynamicDefaults.currency} />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Price">
                        <Input
                          value={mergedDesign.price || ""}
                          onChange={(e) => updateDesign("price", e.target.value)}
                          placeholder={dynamicDefaults.price}
                        />
                      </Field>
                    </div>
                  </div>
                  <Field label="Brand / Workspace Name">
                    <Input value={mergedDesign.logoText || ""} onChange={(e) => updateDesign("logoText", e.target.value)} placeholder={dynamicDefaults.brand} />
                  </Field>
                </div>
              </Section>
            </div>
          )}
        </aside>

        {/* Preview */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-8">
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

            <div className="flex justify-center">
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
                cover={mergedDesign.cover}
                logoText={mergedDesign.logoText || dynamicDefaults.brand}
                logoImage={mergedDesign.logoImage}
                logoScale={mergedDesign.logoScale || 24}
                logoOpacity={mergedDesign.logoOpacity ?? 1}
                logoColorMode={mergedDesign.logoColorMode || "original"}
                orderId={orderId}
                previewMode={previewMode}
                onLogoClick={handleLogoClick}
              />
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
  } = props;

  if (previewMode === "Front" || previewMode === "Back") {
    const isBack = previewMode === "Back";
    return (
      <div
        id="ticket-preview-container"
        className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[28px] text-white shadow-2xl transition-all ${isBack ? "flex-row-reverse" : "flex-row"}`}
        style={{
          fontFamily: font.css,
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
        }}
      >
        {/* Cover */}
        <div className="relative flex-1 p-7">
          {cover && (
            <img
              src={cover}
              className={`absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay ${isBack ? "-scale-x-100" : ""}`}
              alt=""
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-${isBack ? "l" : "r"} from-black/60 via-black/20 to-transparent`} />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className={`flex items-center justify-between ${isBack ? "flex-row-reverse" : ""}`}>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
                {tier} · {template}
              </span>
              <div className={`flex flex-col ${isBack ? "items-start" : "items-end"}`}>
                <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
                {logoImage && (
                  <img
                    src={logoImage}
                    style={{ 
                      height: `${logoScale}px`, 
                      opacity: logoOpacity,
                      filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none"
                    }}
                    className="mt-1 max-w-[150px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    alt="Logo"
                    onClick={onLogoClick}
                  />
                )}
              </div>
            </div>

            {isBack ? (
              <div className="mt-4 flex-1 space-y-1 text-[10px] text-white/80 flex flex-col justify-end">
                <p className="font-bold uppercase tracking-widest text-white mb-1">Terms & Conditions</p>
                <p>• Ticket is non-refundable and non-transferable.</p>
                <p>• Organizer reserves the right to refuse entry.</p>
                <p>• Retain this ticket for the duration of the event.</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-3xl font-black leading-tight drop-shadow">{title}</h2>
                  <p className="mt-1 text-sm text-white/80">{subtitle}</p>
                </div>

                <div className="grid grid-cols-4 gap-3 text-[11px]">
                  <Cell label="Date" value={date} />
                  <Cell label="Time" value={time} />
                  <Cell label="Seat" value={seat} />
                  <Cell label="Price" value={`${currency}${price}`} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Perforation */}
        <div className="relative w-px">
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
          <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
          <div className="h-full w-px border-l-2 border-dashed border-white/40" />
        </div>

        {/* Stub */}
        <div className="flex w-[200px] flex-col items-center justify-between bg-black/30 p-6 text-center backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/70">Admit One</p>
            <p className="mt-1 text-xs font-mono">{orderId}</p>
          </div>
          <div className="rounded-xl bg-white p-2">
            <QRCode value={orderId} size={110} />
          </div>
          <p className="text-[10px] text-white/70">Scan at entrance</p>
        </div>
      </div>
    );
  }
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-2 backdrop-blur-md border border-white/10">
      <p className="text-[9px] uppercase tracking-widest text-white/70">{label}</p>
      <p className="mt-0.5 text-xs font-bold">{value}</p>
    </div>
  );
}
