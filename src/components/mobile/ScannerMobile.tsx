import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ScanLine, CheckCircle2, XCircle, Wifi, WifiOff, Crown, ArrowLeft, Flashlight,
  ShieldAlert, MapPin, CreditCard, Minus, Plus, Settings, Keyboard
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getStaffByBadgeId, getEventSections } from "@/api/staff";
import { getWorkspaceEvents } from "@/api/events";
import { scanAndVerifyTicket } from "@/api/attendees";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { lazy, Suspense } from "react";

// Dynamically import Scanner to prevent SSR crashes since it uses browser APIs
const Scanner = lazy(() => import("@yudiel/react-qr-scanner").then(m => ({ default: m.Scanner })));
import { outline } from "@yudiel/react-qr-scanner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Result = "idle" | "success" | "fail" | "vip" | "staff" | "voucher" | "punch";

// --- SUB-COMPONENTS ---

function ScannerHeader({ onClose, events, sections, selectedEventId, setSelectedEventId, currentSectionId, setCurrentSectionId, torch, setTorch, online, setOnline }: any) {
  const activeEvent = events?.find((e: any) => e.id === selectedEventId);
  const activeSection = sections?.find((s: any) => s.id === currentSectionId);
  
  return (
    <header className="flex items-center justify-between px-4 pt-safe-top pb-4 bg-black/60 backdrop-blur-2xl z-30 border-b border-white/5 relative">
      <button onClick={onClose} className="p-2 -ml-2 text-white/80 hover:text-white active:scale-95 transition-all">
        <ArrowLeft className="h-7 w-7" />
      </button>
      <div className="text-center flex-1 mx-2">
        <h1 className="font-black text-base tracking-tight text-white flex flex-col items-center">
          <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mb-0.5">Scanning</span>
          {activeEvent?.title || "Scanner App"}
        </h1>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${online ? "bg-emerald-400" : "bg-red-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${online ? "bg-emerald-500" : "bg-red-500"}`}></span>
          </span>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            {activeSection?.name || "All Access Mode"}
          </p>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-2 text-white/70 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Scanner Setup</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Event</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger><SelectValue placeholder="Choose event" /></SelectTrigger>
                  <SelectContent>
                    {events?.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Location (Gate/Section)</Label>
                <Select value={currentSectionId} onValueChange={setCurrentSectionId}>
                  <SelectTrigger><SelectValue placeholder="All Access Gate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Anywhere (All Access Gate)</SelectItem>
                    {sections?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Staff badges will be rejected if they are not allowed in this section.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <button onClick={() => setTorch(!torch)} className={`p-2 rounded-full transition-colors ${torch ? "bg-white text-black" : "text-white/70"}`}>
          <Flashlight className="h-5 w-5" />
        </button>
        <button onClick={() => setOnline(!online)} className={`p-1.5 rounded-full transition-colors ${online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

function ScannerViewport({ result, onScan }: { result: Result, onScan: (text: string) => void }) {
  const getBorderColor = () => {
    if (result === "idle") return "border-primary/60";
    if (result === "success" || result === "vip" || result === "staff") return "border-emerald-500";
    if (result === "voucher" || result === "punch") return "border-blue-500";
    return "border-red-500";
  };

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Camera Feed Simulation */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Animated vignette */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* The Viewfinder Box */}
      <div className={`relative w-full max-w-[280px] sm:max-w-xs aspect-square z-10 transition-transform duration-500 ${result !== "idle" ? "scale-105" : "scale-100"}`}>
        
        {/* Dark mask outside the viewfinder */}
        <div className="absolute inset-0 rounded-[2.5rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-opacity duration-300" />
        
        {/* Corner Brackets */}
        <div className={`absolute -top-1 -left-1 w-12 h-12 border-t-[5px] border-l-[5px] rounded-tl-[2.5rem] transition-colors duration-300 ${getBorderColor()}`} />
        <div className={`absolute -top-1 -right-1 w-12 h-12 border-t-[5px] border-r-[5px] rounded-tr-[2.5rem] transition-colors duration-300 ${getBorderColor()}`} />
        <div className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-[5px] border-l-[5px] rounded-bl-[2.5rem] transition-colors duration-300 ${getBorderColor()}`} />
        <div className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-[5px] border-r-[5px] rounded-br-[2.5rem] transition-colors duration-300 ${getBorderColor()}`} />

        {/* Scan Laser & Idle State */}
        {result === "idle" && (
          <>
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] z-10 pointer-events-auto bg-black">
              {typeof window !== "undefined" && (
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/50">Loading camera...</div>}>
                  <Scanner 
                    onScan={(detected) => {
                      if (detected && detected.length > 0 && detected[0].rawValue) {
                        onScan(detected[0].rawValue);
                      }
                    }}
                    formats={["qr_code"]}
                    components={{
                      tracker: outline,
                    }}
                    styles={{
                      container: { width: '100%', height: '100%', borderRadius: '2.5rem' },
                      video: { objectFit: 'cover' }
                    }}
                  />
                </Suspense>
              )}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_4px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite] z-20">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/30 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
              <ScanLine className="h-16 w-16 mb-4 text-white/30" />
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-center px-4 text-white/50 bg-black/40 py-1.5 px-3 rounded-full backdrop-blur-md">
                Align QR Code
              </p>
            </div>
          </>
        )}

        {/* Result Overlay */}
        {(result === "success" || result === "fail" || result === "vip") && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] backdrop-blur-xl z-20 ${result === "success" || result === "vip" ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
            {result === "success" || result === "vip" ? (
              <CheckCircle2 className="h-28 w-28 text-emerald-400 mb-2 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-in zoom-in duration-300" />
            ) : (
              <XCircle className="h-28 w-28 text-red-500 mb-2 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-in zoom-in duration-300" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScannerManualEntryModal({ onScan, isPending }: { onScan: (qr: string) => void, isPending: boolean }) {
  const [qrInput, setQrInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    onScan(qrInput.trim());
    setQrInput("");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex-none flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full text-sm font-black tracking-wide backdrop-blur-md border border-white/20 active:scale-95 transition-all shadow-xl hover:bg-white/20 mx-auto w-full max-w-sm">
          <Keyboard className="h-5 w-5" />
          ENTER CODE MANUALLY
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-[#111] text-white border-t border-white/10 rounded-t-[2.5rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white text-left text-2xl font-black">Manual Entry</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-safe">
          <div className="space-y-2">
            <Label className="text-white/70 font-semibold ml-1">Ticket or Badge Code</Label>
            <Input 
              value={qrInput} 
              onChange={e => setQrInput(e.target.value)} 
              placeholder="e.g. STAFF-123 or TICKET-XYZ"
              className="bg-black/60 border-white/20 focus:border-primary text-white h-16 rounded-[1.25rem] px-5 text-lg font-mono placeholder:text-white/20 placeholder:font-sans transition-colors"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending || !qrInput.trim()}
            className="h-16 mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-black rounded-[1.25rem] text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
          >
            {isPending ? "Verifying Code..." : "Check Code"}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// --- MAIN COMPONENT ---

export function ScannerMobile({ onClose }: { onClose?: () => void }) {
  const [result, setResult] = useState<Result>("idle");
  const [online, setOnline] = useState(true);
  const [torch, setTorch] = useState(false);
  const [failReason, setFailReason] = useState("");
  const [scannedStaff, setScannedStaff] = useState<any>(null);
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  const { activeWorkspace } = useWorkspace();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [currentSectionId, setCurrentSectionId] = useState<string>("none");

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: async () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["event-sections", selectedEventId],
    queryFn: async () => getEventSections({ data: { event_id: selectedEventId } } as any),
    enabled: !!selectedEventId,
  });

  const scanMutation = useMutation({
    mutationFn: async (qr: string) => {
      // If it starts with STAFF-, it's a staff badge. Otherwise, ticket.
      if (qr.startsWith("STAFF-")) {
        const staff = await getStaffByBadgeId({ data: { badge_qr_string: qr } } as any);
        return { type: "staff" as const, data: staff };
      } else {
        const res = await scanAndVerifyTicket({ data: { qrcode_number: qr } } as any);
        return { type: "ticket" as const, data: res };
      }
    },
    onSuccess: (resultData) => {
      // Vibrate on result
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200]);
      }

      if (resultData.type === "staff") {
        const staff = resultData.data;
        if (!staff) {
          setResult("fail");
          setFailReason("BADGE NOT FOUND");
          return;
        }
        setScannedStaff(staff);

        if (staff.status !== "active") {
          setResult("fail");
          setFailReason("BADGE INACTIVE");
          return;
        }

        if (currentSectionId !== "none") {
          const allowed = staff.allowed_sections || [];
          if (allowed.length > 0 && !allowed.includes(currentSectionId)) {
            setResult("fail");
            setFailReason("RESTRICTED AREA");
            return;
          }
        }
        setResult("staff");
      } else if (resultData.type === "ticket") {
        const { success, message, attendee } = resultData.data;
        if (!success) {
          setResult("fail");
          setFailReason(message.toUpperCase());
          return;
        }
        
        setScannedTicket(attendee);
        setResult("success");
      }
    },
    onError: () => {
      setResult("fail");
      setFailReason("NETWORK ERROR");
    },
  });

  const handleManualScan = (qr: string) => {
    if (result !== "idle" || scanMutation.isPending) return;
    scanMutation.mutate(qr);
  };

  const [transactionAmount, setTransactionAmount] = useState(1);
  const [processingTx, setProcessingTx] = useState(false);

  useEffect(() => {
    if (result === "success" || result === "fail" || result === "vip") {
      const timer = setTimeout(() => setResult("idle"), 2500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleProcessTransaction = () => {
    setProcessingTx(true);
    setTimeout(() => {
      setProcessingTx(false);
      toast.success(result === "voucher" ? `$${transactionAmount} deducted` : `${transactionAmount} punches used`);
      setResult("idle");
      setTransactionAmount(1);
    }, 800);
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      <ScannerHeader 
        onClose={onClose} events={events} sections={sections} 
        selectedEventId={selectedEventId} setSelectedEventId={setSelectedEventId}
        currentSectionId={currentSectionId} setCurrentSectionId={setCurrentSectionId}
        torch={torch} setTorch={setTorch} online={online} setOnline={setOnline}
      />

      <ScannerViewport result={result} onScan={handleManualScan} />

      {/* Result Card Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-[2.5rem] border-t border-white/10 p-6 pb-safe transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${result !== "idle" ? "translate-y-0 shadow-[0_-30px_60px_rgba(0,0,0,0.9)]" : "translate-y-[120%]"}`}>
        
        {/* TICKET RESULT */}
        {(result === "success" || result === "fail" || result === "vip") && (
          <div className="animate-in slide-in-from-bottom-8 duration-300">
            {result !== "fail" && scannedTicket && (
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center font-black text-2xl">
                  {scannedTicket?.names?.charAt(0) || "G"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-2xl font-black tracking-tight truncate">{scannedTicket?.names || "Guest"}</h3>
                  <p className="text-white/50 text-sm font-medium truncate">#{scannedTicket?.qrcode_number || "TICKET"}</p>
                </div>
              </div>
            )}

            <div className={`w-full p-5 rounded-2xl text-center font-black text-xl tracking-wide shadow-inner mb-4 ${result === "fail" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
              {result === "fail" ? failReason || "ALREADY SCANNED" : "ENTRY APPROVED"}
            </div>

            {result === "vip" && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-bold">VIP Privileges</p>
                <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
                  <div className="flex items-center justify-between text-sm"><span className="text-white/70 font-medium">Parking Access</span><span className="font-bold text-emerald-400">Yes</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-white/70 font-medium">License Plate</span><span className="font-mono bg-black/50 px-2.5 py-1 rounded-lg text-[#FFD700] font-bold tracking-widest">RAA 123 A</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-white/70 font-medium">Backstage Pass</span><span className="font-bold text-emerald-400">Yes</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAFF BADGE RESULT */}
        {result === "staff" && (
          <div className="animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-black text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Staff Verification</h2>
              <button onClick={() => setResult("idle")} className="text-white/50 hover:text-white p-2 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
              <div className="relative z-10 flex gap-5 items-center">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border-4 border-primary shadow-[0_0_20px_rgba(var(--color-primary),0.3)] shrink-0">
                  <ShieldAlert className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                    {scannedStaff?.first_name || scannedStaff?.last_name ? `${scannedStaff.first_name || ""} ${scannedStaff.last_name || ""}`.trim() : `User ${scannedStaff?.user_id?.substring(0, 6) || "Unknown"}`}
                  </h3>
                  <p className="text-primary font-black uppercase text-sm tracking-wider mt-1">{scannedStaff?.role || "Staff"}</p>
                  <p className="text-white/30 font-mono text-[11px] mt-1.5">{scannedStaff?.badge_qr_string}</p>
                </div>
              </div>
              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center gap-3 bg-black/20 -mx-6 -mb-6 px-6 pb-6 rounded-b-[2rem]">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Access Level</span>
                  <span className="text-emerald-400 font-black text-sm uppercase">
                    {currentSectionId === "none" ? "All Areas" : sections?.find((s: any) => s.id === currentSectionId)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTION RESULT */}
        {(result === "voucher" || result === "punch") && (
          <div className="animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-black text-blue-400 tracking-widest uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                {result === "voucher" ? "Wallet Transaction" : "Punch Card Use"}
              </h2>
              <button onClick={() => setResult("idle")} className="text-white/50 hover:text-white p-2">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-slate-900 border border-blue-500/30 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(59,130,246,0.15)]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Amaka Okafor</h3>
                  <p className="text-white/50 text-sm font-medium mt-1">Remaining: {result === "voucher" ? "$50.00" : "8 Punches"}</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <CreditCard className="h-7 w-7 text-blue-400" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 mb-8">
                <button onClick={() => setTransactionAmount(Math.max(1, transactionAmount - (result === "voucher" ? 5 : 1)))} className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 active:scale-95 transition-all border border-white/10">
                  <Minus className="h-8 w-8" />
                </button>
                <div className="text-5xl font-black w-32 text-center tabular-nums tracking-tighter">
                  {result === "voucher" ? `$${transactionAmount}` : transactionAmount}
                </div>
                <button onClick={() => setTransactionAmount(transactionAmount + (result === "voucher" ? 5 : 1))} className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 active:scale-95 transition-all border border-white/10">
                  <Plus className="h-8 w-8" />
                </button>
              </div>

              <button onClick={handleProcessTransaction} disabled={processingTx} className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] text-lg">
                {processingTx ? "Processing..." : `Deduct ${result === "voucher" ? `$${transactionAmount}` : `${transactionAmount} Punches`}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Controls & Manual Entry */}
      <div className="absolute bottom-6 left-4 right-4 z-50 flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x items-center">
        {result === "idle" && (
          <>
            <ScannerManualEntryModal onScan={handleManualScan} isPending={scanMutation.isPending} />
            <button onClick={() => setResult("success")} className="flex-none bg-emerald-500/20 text-emerald-400 px-6 py-4 rounded-full text-sm font-bold whitespace-nowrap border border-emerald-500/30 shadow-lg snap-start">
              Simulate Ticket
            </button>
            <button onClick={() => setResult("voucher")} className="flex-none bg-blue-500/20 text-blue-400 px-6 py-4 rounded-full text-sm font-bold whitespace-nowrap border border-blue-500/30 shadow-lg snap-start">
              Simulate Wallet
            </button>
            <button onClick={() => handleManualScan("STAFF-123")} className="flex-none bg-primary/20 text-primary px-6 py-4 rounded-full text-sm font-bold whitespace-nowrap border border-primary/30 shadow-lg snap-start">
              Simulate Badge
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-50px); }
          50% { transform: translateY(180px); }
          100% { transform: translateY(-50px); }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
