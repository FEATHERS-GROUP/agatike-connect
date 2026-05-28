import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ScanLine, CheckCircle2, XCircle, Wifi, WifiOff, Crown, ArrowLeft, Flashlight, Users } from "lucide-react";

type Result = "idle" | "success" | "fail" | "vip";

export function ScannerMobile() {
  const [result, setResult] = useState<Result>("idle");
  const [online, setOnline] = useState(true);
  const [torch, setTorch] = useState(false);

  // Auto-reset in rapid scan mode after 2s
  useEffect(() => {
    if (result !== "idle") {
      const timer = setTimeout(() => setResult("idle"), 2500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-4 bg-black/80 backdrop-blur-md z-30 border-b border-white/10">
        <Link to="/dashboard" className="p-2 -ml-2 text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-sm tracking-tight">Afrobeats Night</h1>
          <p className="text-[10px] text-white/50">Door 2 • General Entry</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setTorch(!torch)} className={`p-2 rounded-full ${torch ? "bg-white text-black" : "text-white"}`}>
            <Flashlight className="h-5 w-5" />
          </button>
          <button onClick={() => setOnline(!online)} className={`p-1.5 rounded-full ${online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Scanner Viewport */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Mock camera feed background */}
        <div className="absolute inset-0 bg-[#0a0a0a]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, #333 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </div>
        
        {/* Viewfinder */}
        <div className={`relative w-full max-w-sm aspect-square rounded-[2.5rem] border-4 transition-colors duration-300 ${
          result === "idle" ? "border-primary/50" : 
          result === "success" || result === "vip" ? "border-emerald-500" : "border-red-500"
        }`}>
          {/* Overlay UI inside viewfinder */}
          {result === "idle" && (
            <>
              <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-[2rem]" />
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/70">
                <ScanLine className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm font-bold tracking-widest uppercase">Align QR Code</p>
              </div>
            </>
          )}

          {result !== "idle" && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm ${
              result === "success" || result === "vip" ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}>
              {result === "success" || result === "vip" ? (
                <CheckCircle2 className="h-24 w-24 text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              ) : (
                <XCircle className="h-24 w-24 text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              )}
            </div>
          )}
        </div>

        {/* Live Stats Pill */}
        <div className="absolute bottom-32 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 text-sm font-bold shadow-2xl">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 842 In</div>
          <div className="h-4 w-px bg-white/20" />
          <div className="text-white/60">358 Left</div>
        </div>
      </div>

      {/* Result Card Modal / Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl border-t border-white/10 p-6 pb-safe transition-transform duration-300 ${result !== "idle" ? "translate-y-0" : "translate-y-[120%]"}`}>
        {result !== "idle" && (
          <div className="animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5">
                <img src="https://i.pravatar.cc/150?img=12" className="h-full w-full rounded-full border-2 border-black object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Amaka Okafor</h3>
                <p className="text-white/50 text-sm">#AG-48211</p>
              </div>
              {result === "vip" && (
                <div className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50 px-3 py-1 rounded-full flex items-center gap-1 font-bold text-xs uppercase">
                  <Crown className="h-3 w-3" /> VIP
                </div>
              )}
            </div>
            
            <div className={`w-full p-4 rounded-2xl text-center font-bold text-lg tracking-wide ${
              result === "fail" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {result === "fail" ? "TICKET ALREADY SCANNED" : "ENTRY APPROVED"}
            </div>
          </div>
        )}
      </div>

      {/* Mock Controls for Demo */}
      <div className="absolute bottom-4 left-4 right-4 z-50 flex gap-2">
         {result === "idle" && (
           <>
            <button onClick={() => setResult("success")} className="flex-1 bg-white/10 text-white p-3 rounded-full text-xs font-bold">Mock Success</button>
            <button onClick={() => setResult("vip")} className="flex-1 bg-[#FFD700]/20 text-[#FFD700] p-3 rounded-full text-xs font-bold">Mock VIP</button>
            <button onClick={() => setResult("fail")} className="flex-1 bg-red-500/20 text-red-400 p-3 rounded-full text-xs font-bold">Mock Fail</button>
           </>
         )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          50% { transform: translateY(100px); }
          100% { transform: translateY(-100px); }
        }
      `}</style>
    </div>
  );
}