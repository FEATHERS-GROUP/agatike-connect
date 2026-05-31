import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Palette, Type, Image as ImageIcon, Briefcase, UserCheck, ShieldAlert, MapPin, QrCode, Plus, Trash2, Upload, Loader2, FlipHorizontal, Lock, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { saveBadgeProject, getBadgeProjectById } from "@/api/badges";
import { getWorkspaceEvents } from "@/api/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/dashboard/$workspaceSlug/badge-designer/$projectId")({
  component: BadgeDesignerEditor,
});

const GRADIENTS = [
  { id: "obsidian", name: "Obsidian Glass", class: "from-slate-900 to-black" },
  { id: "amber", name: "Amber VIP", class: "from-amber-700 to-amber-950" },
  { id: "ruby", name: "Ruby Security", class: "from-red-800 to-rose-950" },
  { id: "emerald", name: "Emerald Access", class: "from-emerald-800 to-teal-950" },
  { id: "royal", name: "Royal Crew", class: "from-blue-800 to-indigo-950" },
  { id: "amethyst", name: "Amethyst Media", class: "from-purple-800 to-fuchsia-950" },
];

const FONTS = [
  { id: "font-sans", name: "Inter (Modern Sans)" },
  { id: "font-mono", name: "Roboto Mono (Technical)" },
  { id: "font-serif", name: "Playfair (Elegant Serif)" },
];

type Sponsor = { id: string; text: string; logoUrl: string; scale?: number; x?: number; y?: number };

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
    backText: "NON-TRANSFERABLE\nValid only for the specified event date.\nSubject to terms and conditions.",
    eventId: "00000000-0000-0000-0000-000000000000",
    qrPlacement: "front", // front | back | none
    sectionPlacement: "front", // front | back | none
    sponsorsPlacement: "back", // front | back | none
    frontTextSize: "text-3xl"
  });

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  // Only fetch if projectId looks like a real UUID (Hasura rejects non-UUID values)
  const isRealUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);

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
        backText: existingProject.back_design?.text || "NON-TRANSFERABLE\nValid only for the specified event date.\nSubject to terms and conditions.",
        eventId: existingProject.event_id || "00000000-0000-0000-0000-000000000000",
        qrPlacement: existingProject.front_design?.qrPlacement || "front",
        sectionPlacement: existingProject.front_design?.sectionPlacement || "front",
        sponsorsPlacement: existingProject.front_design?.sponsorsPlacement || "back",
        frontTextSize: existingProject.front_design?.textSize || "text-3xl"
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
        sectionPlacement: config.sectionPlacement,
        sponsorsPlacement: config.sponsorsPlacement,
        textSize: config.frontTextSize
      };
      
      const backDesign = {
        theme: config.theme,
        gradient: config.gradientClass,
        bgImage: config.bgImageUrl,
        text: config.backText,
        qrPlacement: config.qrPlacement,
        sectionPlacement: config.sectionPlacement,
        sponsorsPlacement: config.sponsorsPlacement
      };

      return await saveBadgeProject({
        data: {
          id: projectId !== "new" ? projectId : undefined,
          accent_color: config.accentColor,
          back_design: backDesign,
          bg_image_url: config.bgImageUrl,
          event_id: config.eventId === "00000000-0000-0000-0000-000000000000" ? null : config.eventId,
          font_family: config.fontFamily,
          front_design: frontDesign,
          gradient_class: config.gradientClass,
          logo_text: config.logoText,
          show_user_image: config.showUserImage,
          sponsors_json: sponsors,
          theme: config.theme
        }
      } as any);
    },
    onSuccess: () => {
      toast.success("Badge design saved successfully!");
      navigate({ to: `/dashboard/${workspaceSlug}/badge-designer` });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to save badge design. Please check your DB connection.");
    }
  });

  const handleUpload = async (file: File, key: string, callback: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    
    setUploadingState(prev => ({ ...prev, [key]: true }));
    try {
      const url = await uploadFileToStorage(file, "badges/media");
      callback(url);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const addSponsor = () => {
    setSponsors([...sponsors, { id: Math.random().toString(), text: "", logoUrl: "", scale: 24, x: 50, y: 50 }]);
    setActiveSide(config.sponsorsPlacement === "front" ? "front" : "back");
  };

  const updateSponsor = (id: string, field: keyof Sponsor, value: any) => {
    setSponsors(sponsors.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSponsor = (id: string) => {
    setSponsors(sponsors.filter(s => s.id !== id));
  };

  // Drag and Drop Logic for Sponsors
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string, initialX: number, initialY: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX, initialY };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { id, startX, startY, initialX, initialY } = dragRef.current;
      
      // Invert X drag direction if we are looking at the back side (which is rotated 180deg)
      const dx = activeSide === 'back' ? startX - e.clientX : e.clientX - startX;
      const dy = e.clientY - startY;
      
      let newX = initialX + (dx / 340) * 100;
      let newY = initialY + (dy / 544) * 100;
      
      // Optional bounds
      if (newX < 0) newX = 0; if (newX > 100) newX = 100;
      if (newY < 0) newY = 0; if (newY > 100) newY = 100;

      setSponsors(prev => prev.map(s => s.id === id ? { ...s, x: newX, y: newY } : s));
    };
    
    const handlePointerUp = () => {
      setDraggingId(null);
      dragRef.current = null;
    };
    
    if (draggingId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, activeSide]);

  const isLocked = config.eventId === "00000000-0000-0000-0000-000000000000";

  // Reusable components
  const renderQRCode = (theme: string, accentColor: string) => (
    <div className="mt-6 w-full flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10 pointer-events-none">
      <div className={`p-4 rounded-3xl ${theme === 'minimal' ? 'bg-slate-100' : 'bg-white/10 backdrop-blur-md border border-white/10'}`}>
        <div className="w-24 h-24 grid grid-cols-5 grid-rows-5 gap-1 p-1 bg-white rounded-xl">
          <div className="col-span-2 row-span-2 bg-black rounded-tl-lg border-[3px] border-black"><div className="w-full h-full bg-white m-[2px]"></div></div>
          <div className="col-span-1 row-span-1 bg-black rounded-sm"></div>
          <div className="col-span-2 row-span-2 bg-black rounded-tr-lg border-[3px] border-black"><div className="w-full h-full bg-white m-[2px]"></div></div>
          <div className="col-span-1 row-span-1 bg-black rounded-sm"></div>
          <div className="col-span-1 row-span-2 bg-black rounded-sm" style={{ backgroundColor: accentColor }}></div>
          <div className="col-span-1 row-span-1 bg-black rounded-sm"></div>
          <div className="col-span-2 row-span-2 bg-black rounded-bl-lg border-[3px] border-black"><div className="w-full h-full bg-white m-[2px]"></div></div>
          <div className="col-span-1 row-span-1 bg-black rounded-sm"></div>
          <div className="col-span-2 row-span-1 bg-black rounded-br-lg"></div>
        </div>
      </div>
      <p className={`font-mono text-[9px] mt-3 uppercase tracking-[0.3em] font-bold ${theme === 'minimal' ? 'text-slate-400' : 'text-white/50'}`}>STAFF-DK8492X</p>
    </div>
  );

  const renderSection = (theme: string, accentColor: string) => (
    <div className={`absolute bottom-0 left-0 right-0 p-6 border-t flex items-center justify-between z-10 pointer-events-none ${theme === 'minimal' ? 'border-slate-200' : 'border-white/10'}`}>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" style={{ color: accentColor }} />
        <span className={`font-bold text-xs uppercase tracking-widest ${theme === 'minimal' ? 'text-black' : 'text-white'}`}>
          VIP Lounge
        </span>
      </div>
      <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}22` }}>
        <ShieldAlert className="h-3.5 w-3.5" style={{ color: accentColor }} />
      </div>
    </div>
  );

  const renderSponsors = (theme: string) => (
    <>
      {sponsors.map((s, idx) => {
        const x = s.x ?? 50;
        const y = s.y ?? 50;
        const scale = s.scale ?? 24;
        
        return (
          <div 
            key={s.id} 
            className={`absolute flex flex-col items-center justify-center gap-1 z-30 cursor-move ${draggingId === s.id ? 'opacity-70 scale-105' : 'hover:scale-105'} transition-transform`}
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%) translateZ(10px)', // Added translateZ to fix 3D visibility bugs in some browsers
              touchAction: 'none'
            }}
            onPointerDown={(e) => handlePointerDown(e, s.id, x, y)}
          >
            {s.logoUrl ? (
              <div className="p-1.5 bg-white/90 rounded-md shadow-sm pointer-events-none border border-black/5" style={{ height: `${scale + 16}px` }}>
                <img src={s.logoUrl} alt="Sponsor" className="h-full w-auto object-contain" />
              </div>
            ) : (
              <div className="p-1.5 bg-white/90 rounded-md shadow-sm pointer-events-none border border-black/5 flex items-center justify-center" style={{ height: `${scale + 16}px`, minWidth: '40px' }}>
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
            )}
            {s.text && (
              <span className={`text-[7px] tracking-widest uppercase font-bold pointer-events-none ${theme === 'minimal' ? 'text-slate-500' : 'text-white/80 drop-shadow-md'}`}>{s.text}</span>
            )}
          </div>
        );
      })}
    </>
  );

  if (isRealUUID && isLoadingProject) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <header className="flex-none flex items-center justify-between border-b border-border/60 bg-card/80 px-6 py-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/${workspaceSlug}/badge-designer`} className="rounded-full p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Advanced Badge Designer</h1>
            <p className="text-xs text-muted-foreground">Project: {projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={config.eventId} onValueChange={(val) => {
            const selectedEvent = events.find((e: any) => e.id === val);
            setConfig({
              ...config, 
              eventId: val,
              logoText: selectedEvent ? selectedEvent.title : config.logoText
            });
          }}>
            <SelectTrigger className={`w-[250px] h-9 ${isLocked ? 'ring-2 ring-primary ring-offset-2 animate-pulse' : ''}`}>
              <SelectValue placeholder="Link to Event to Unlock..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="00000000-0000-0000-0000-000000000000">Select Event to Unlock...</SelectItem>
              {events.map((ev: any) => (
                <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending || isLocked}
            className="rounded-full px-6 shadow-[var(--shadow-glow)] transition-all" 
            style={{ background: isLocked ? "var(--muted)" : "var(--gradient-primary)" }}
          >
            {saveMutation.isPending ? <span className="animate-pulse">Saving...</span> : <><Save className="mr-2 h-4 w-4" /> Save Design</>}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Controls */}
        <div className="w-full lg:w-[450px] border-r border-border/60 bg-card/50 overflow-y-auto flex-none z-10 custom-scrollbar relative">
          
          {isLocked && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Designer Locked</h3>
              <p className="text-sm text-muted-foreground">Please select an event from the dropdown in the top right to unlock the designer tools.</p>
            </div>
          )}

          <Tabs defaultValue="style" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border/60 bg-transparent p-0 grid grid-cols-5 h-auto">
              <TabsTrigger value="style" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2">
                <Palette className="h-4 w-4" /> <span className="text-[9px] uppercase tracking-wider">Style</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2">
                <LayoutTemplate className="h-4 w-4" /> <span className="text-[9px] uppercase tracking-wider">Layout</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2">
                <Type className="h-4 w-4" /> <span className="text-[9px] uppercase tracking-wider">Text</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2">
                <ImageIcon className="h-4 w-4" /> <span className="text-[9px] uppercase tracking-wider">Media</span>
              </TabsTrigger>
              <TabsTrigger value="sponsors" onClick={() => setActiveSide(config.sponsorsPlacement === "front" ? "front" : "back")} className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col gap-2">
                <Briefcase className="h-4 w-4" /> <span className="text-[9px] uppercase tracking-wider">Sponsors</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="style" className="p-6 space-y-8 animate-in fade-in">
              <section>
                <Label className="text-base font-semibold mb-4 block">Card Material</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setConfig({...config, theme: "glass"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === 'glass' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                  >
                    <div className="w-full h-10 rounded bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md border border-white/10 mb-2"></div>
                    <span className="text-xs font-medium">Glass</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, theme: "solid"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === 'solid' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                  >
                    <div className="w-full h-10 rounded bg-slate-800 mb-2"></div>
                    <span className="text-xs font-medium">Matte</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, theme: "minimal"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${config.theme === 'minimal' ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'}`}
                  >
                    <div className="w-full h-10 rounded bg-white border border-slate-200 mb-2"></div>
                    <span className="text-xs font-medium">Minimal</span>
                  </button>
                </div>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Color Palette</Label>
                <div className="grid grid-cols-2 gap-3">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setConfig({...config, gradientClass: g.class})}
                      className={`relative flex items-center p-3 rounded-xl border-2 transition-all overflow-hidden ${config.gradientClass === g.class ? 'border-primary' : 'border-transparent hover:border-border/60'}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${g.class} opacity-20`}></div>
                      <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${g.class} border border-white/20 mr-3 shadow-sm`}></div>
                      <span className="text-xs font-medium relative z-10">{g.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Accent Color (Highlights & QR)</Label>
                <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border/60">
                  <input 
                    type="color" 
                    value={config.accentColor}
                    onChange={(e) => setConfig({...config, accentColor: e.target.value})}
                    className="h-10 w-20 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-sm font-mono text-muted-foreground uppercase bg-background px-3 py-1.5 rounded-md border border-border">{config.accentColor}</span>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="layout" className="p-6 space-y-8 animate-in fade-in">
              <section>
                <Label className="text-base font-semibold mb-4 block">Sponsors Placement</Label>
                <Select value={config.sponsorsPlacement} onValueChange={(v) => { setConfig({...config, sponsorsPlacement: v}); setActiveSide(v === "front" ? "front" : "back"); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front Side</SelectItem>
                    <SelectItem value="back">Back Side</SelectItem>
                    <SelectItem value="none">Hidden</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">Choose which side the sponsor logos show on. You can then drag to position them.</p>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">QR Code Placement</Label>
                <Select value={config.qrPlacement} onValueChange={(v) => { setConfig({...config, qrPlacement: v}); setActiveSide(v === "back" ? "back" : "front"); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front Side</SelectItem>
                    <SelectItem value="back">Back Side</SelectItem>
                    <SelectItem value="none">Hidden (Not Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Section / VIP Access Footer</Label>
                <Select value={config.sectionPlacement} onValueChange={(v) => { setConfig({...config, sectionPlacement: v}); setActiveSide(v === "back" ? "back" : "front"); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front Side</SelectItem>
                    <SelectItem value="back">Back Side</SelectItem>
                    <SelectItem value="none">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Staff Name Size</Label>
                <Select value={config.frontTextSize} onValueChange={(v) => setConfig({...config, frontTextSize: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xl">Small</SelectItem>
                    <SelectItem value="text-2xl">Medium</SelectItem>
                    <SelectItem value="text-3xl">Large (Default)</SelectItem>
                    <SelectItem value="text-4xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </section>
            </TabsContent>

            <TabsContent value="branding" className="p-6 space-y-8 animate-in fade-in">
              <section>
                <Label className="text-base font-semibold mb-4 block">Typography</Label>
                <Select value={config.fontFamily} onValueChange={(v) => setConfig({...config, fontFamily: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map(f => (
                      <SelectItem key={f.id} value={f.id} className={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Event Name / Header Text</Label>
                <Input 
                  value={config.logoText}
                  onChange={(e) => setConfig({...config, logoText: e.target.value})}
                  placeholder="e.g. AGATIKE FESTIVAL"
                />
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Back Side Rules / Text</Label>
                <p className="text-xs text-muted-foreground mb-3">Custom rules or information to show on the back of the badge.</p>
                <textarea 
                  value={config.backText}
                  onChange={(e) => { setConfig({...config, backText: e.target.value}); setActiveSide("back"); }}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="NON-TRANSFERABLE\nValid only for the specified event date."
                />
              </section>
            </TabsContent>

            <TabsContent value="images" className="p-6 space-y-8 animate-in fade-in">
              <section className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-secondary/30">
                <div>
                  <Label className="text-base font-semibold block">Show Staff Photo</Label>
                  <p className="text-xs text-muted-foreground mt-1">Display the staff's profile picture</p>
                </div>
                <Switch 
                  checked={config.showUserImage} 
                  onCheckedChange={(checked) => { setConfig({...config, showUserImage: checked}); setActiveSide("front"); }} 
                />
              </section>

              <section>
                <Label className="text-base font-semibold mb-4 block">Custom Background Image</Label>
                <p className="text-xs text-muted-foreground mb-3">Upload a pattern or photo (Max 5MB).</p>
                <div className="flex gap-2">
                   <Input 
                     value={config.bgImageUrl}
                     onChange={(e) => setConfig({...config, bgImageUrl: e.target.value})}
                     placeholder="https://... or upload"
                   />
                   <Button variant="outline" size="icon" className="shrink-0 relative overflow-hidden">
                     {uploadingState['bg'] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="absolute inset-0 opacity-0 cursor-pointer"
                       onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'bg', (url) => setConfig({...config, bgImageUrl: url}))}
                     />
                   </Button>
                </div>
                {config.bgImageUrl && (
                  <div className="mt-4 space-y-4">
                    <div className="h-24 rounded-lg overflow-hidden border border-border/60 relative group">
                      <img src={config.bgImageUrl} alt="Bg preview" className="w-full h-full object-cover" />
                      <button onClick={() => setConfig({...config, bgImageUrl: ""})} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-xs">Background Opacity</Label>
                        <span className="text-xs text-muted-foreground">{config.bgOpacity}%</span>
                      </div>
                      <Slider 
                        value={[config.bgOpacity]} 
                        onValueChange={(v) => setConfig({...config, bgOpacity: v[0]})} 
                        max={100} 
                        step={1} 
                      />
                    </div>
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="sponsors" className="p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                 <div>
                   <Label className="text-base font-semibold block">Sponsor Logos</Label>
                   <p className="text-xs text-muted-foreground">Click and drag them directly on the preview to position them!</p>
                 </div>
                 <Button onClick={addSponsor} size="sm" variant="outline"><Plus className="mr-2 h-4 w-4"/> Add</Button>
              </div>

              {sponsors.length === 0 && (
                <div className="text-center p-8 border border-dashed border-border/60 rounded-xl bg-secondary/20">
                  <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No sponsors added yet.</p>
                </div>
              )}

              <div className="space-y-4">
                {sponsors.map((s, idx) => (
                  <div key={s.id} className="p-4 border border-border/60 rounded-xl bg-secondary/10 relative">
                    <button onClick={() => removeSponsor(s.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                    <Label className="text-xs mb-2 block">Sponsor {idx + 1} Label</Label>
                    <Input 
                      value={s.text} 
                      onChange={(e) => updateSponsor(s.id, "text", e.target.value)} 
                      placeholder="e.g. POWERED BY" 
                      className="mb-3 h-8"
                    />
                    <Label className="text-xs mb-2 block">Sponsor {idx + 1} Logo</Label>
                    <div className="flex gap-2 mb-3">
                      <Input 
                        value={s.logoUrl} 
                        onChange={(e) => updateSponsor(s.id, "logoUrl", e.target.value)} 
                        placeholder="Image URL" 
                        className="h-8"
                      />
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0 relative overflow-hidden">
                        {uploadingState[`sp_${s.id}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], `sp_${s.id}`, (url) => updateSponsor(s.id, "logoUrl", url))}
                        />
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Logo Scale</Label>
                      </div>
                      <Slider 
                        value={[s.scale || 24]} 
                        onValueChange={(v) => updateSponsor(s.id, "scale", v[0])} 
                        max={100} 
                        min={10}
                        step={1} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Live Preview Workspace */}
        <div className="flex-1 bg-secondary/30 relative flex flex-col items-center justify-center p-8 overflow-hidden" onPointerUp={() => setDraggingId(null)}>
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          {/* View Toggle */}
          <div className="absolute top-6 z-30 flex items-center bg-background border border-border/60 rounded-full p-1 shadow-sm">
            <button 
              onClick={() => setActiveSide("front")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSide === "front" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              Front
            </button>
            <button 
              onClick={() => setActiveSide("back")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeSide === "back" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <FlipHorizontal className="h-3 w-3" /> Back
            </button>
          </div>

          <div className="relative transform transition-all duration-700 hover:scale-[1.02]" style={{ perspective: '1000px' }}>
            
            {/* THE BADGE */}
            <div 
              className={`relative w-[340px] aspect-[1/1.6] rounded-[2.5rem] overflow-hidden shadow-2xl border ${config.fontFamily} ${config.theme === 'minimal' ? 'border-border/60 bg-white' : config.theme === 'glass' ? 'border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)]' : 'border-black/50 shadow-black/50'} transition-transform duration-700 preserve-3d`}
              style={{ transform: activeSide === "back" ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              
              {/* Background Layer (Shared) */}
              {config.theme !== 'minimal' && (
                <div className={`absolute inset-0 bg-gradient-to-b ${config.gradientClass}`}></div>
              )}
              {config.bgImageUrl && (
                <div className="absolute inset-0 z-0">
                  <img src={config.bgImageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: config.bgOpacity / 100 }} />
                </div>
              )}
              {config.theme === 'glass' && (
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] pointer-events-none z-0"></div>
              )}

              {/* Lanyard Hole (Shared) */}
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full shadow-inner z-20 pointer-events-none transform-style-preserve-3d translate-z-1 ${config.theme === 'minimal' ? 'bg-slate-200 border-none' : 'bg-black/40 border border-white/10 backdrop-blur-md'}`}></div>

              {/* === FRONT DESIGN === */}
              <div className={`absolute inset-0 flex flex-col p-8 pt-14 text-center backface-hidden transition-opacity duration-500 z-10 ${activeSide !== 'front' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Event Name */}
                <div className="mb-6 pointer-events-none">
                  <h3 className={`font-black tracking-[0.2em] text-xs uppercase ${config.theme === 'minimal' ? 'text-black' : 'text-white drop-shadow-md'}`}>{config.logoText}</h3>
                </div>

                {/* Profile Section */}
                <div className="flex-grow flex flex-col items-center pointer-events-none relative z-10">
                  {config.showUserImage ? (
                    <div className={`h-28 w-28 rounded-full overflow-hidden mb-5 border-[3px] ${config.theme === 'solid' ? 'shadow-black/50' : 'shadow-xl'}`} style={{ borderColor: config.accentColor }}>
                      <img src="https://i.pravatar.cc/300?img=12" alt="Staff" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mb-5 shadow-xl border-2" style={{ backgroundColor: config.theme === 'minimal' ? '#f1f5f9' : 'rgba(0,0,0,0.3)', borderColor: config.accentColor }}>
                      <UserCheck className={`h-8 w-8 ${config.theme === 'minimal' ? 'text-black' : 'text-white/80'}`} />
                    </div>
                  )}
                  
                  <h2 className={`${config.frontTextSize} font-black tracking-tight ${config.theme === 'minimal' ? 'text-black' : 'text-white drop-shadow-md'}`}>David Kim</h2>
                  <p className="font-bold tracking-widest uppercase mt-1 text-xs drop-shadow-md" style={{ color: config.accentColor }}>Security Lead</p>
                  
                  {config.qrPlacement === "front" && renderQRCode(config.theme, config.accentColor)}
                </div>

                {config.sponsorsPlacement === "front" && renderSponsors(config.theme)}
                {config.sectionPlacement === "front" && renderSection(config.theme, config.accentColor)}
              </div>

              {/* === BACK DESIGN === */}
              <div 
                className={`absolute inset-0 flex flex-col p-8 pt-14 text-center backface-hidden transition-opacity duration-500 z-10 ${activeSide !== 'back' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                 {/* Event Name */}
                 <div className="mb-6 opacity-60 pointer-events-none">
                   <h3 className={`font-black tracking-[0.2em] text-xs uppercase ${config.theme === 'minimal' ? 'text-black' : 'text-white drop-shadow-md'}`}>{config.logoText}</h3>
                 </div>

                 {/* Optional QR Code Placement on Back */}
                 {config.qrPlacement === "back" && (
                    <div className="mb-4 transform scale-90">
                      {renderQRCode(config.theme, config.accentColor)}
                    </div>
                 )}

                 {/* Back Custom Text */}
                 <div className="flex-1 flex flex-col items-center justify-center px-4 pointer-events-none">
                    <div className={`text-xs leading-relaxed whitespace-pre-wrap ${config.theme === 'minimal' ? 'text-slate-600' : 'text-white/80 drop-shadow-sm'}`}>
                      {config.backText}
                    </div>
                 </div>

                 {config.sponsorsPlacement === "back" && renderSponsors(config.theme)}
                 {config.sectionPlacement === "back" && renderSection(config.theme, config.accentColor)}
              </div>

            </div>
            
            {/* Decorative Lanyard Strings (Visual Only) */}
            <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[140px] h-[120px] opacity-80 pointer-events-none z-0">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-xl">
                <path d="M 10,-20 C 10,50 42,90 42,100" fill="none" stroke="#222" strokeWidth="4" />
                <path d="M 90,-20 C 90,50 58,90 58,100" fill="none" stroke="#222" strokeWidth="4" />
                <rect x="38" y="90" width="24" height="12" fill="#111" rx="3" stroke="#444" strokeWidth="1" />
                <circle cx="50" cy="102" r="4" fill="none" stroke="#888" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
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
