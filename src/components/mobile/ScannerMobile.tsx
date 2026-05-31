import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Crown,
  ArrowLeft,
  Flashlight,
  Users,
  ShieldAlert,
  MapPin,
  CreditCard,
  Minus,
  Plus
} from "lucide-react";
import { toast } from "sonner";

type Result = "idle" | "success" | "fail" | "vip" | "staff" | "voucher" | "punch";

export function ScannerMobile() {
  const [result, setResult] = useState<Result>("idle");
  const [online, setOnline] = useState(true);
  const [torch, setTorch] = useState(false);

  // Transaction state for merch/vouchers
  const [transactionAmount, setTransactionAmount] = useState(1);
  const [processingTx, setProcessingTx] = useState(false);

  // Auto-reset in rapid scan mode after 2s for simple tickets only
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
      toast.success(result === "voucher" ? `$${transactionAmount} deducted from wallet` : `${transactionAmount} punches used`);
      setResult("idle");
      setTransactionAmount(1);
    }, 800);
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-4 bg-black/80 backdrop-blur-md z-30 border-b border-white/10">
        <Link to="/dashboard" className="p-2 -ml-2 text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-sm tracking-tight">Afrobeats Night</h1>
          <p className="text-[10px] text-white/50">Scanner App</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setTorch(!torch)}
            className={`p-2 rounded-full ${torch ? "bg-white text-black" : "text-white"}`}
          >
            <Flashlight className="h-5 w-5" />
          </button>
          <button
            onClick={() => setOnline(!online)}
            className={`p-1.5 rounded-full ${online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Scanner Viewport */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Mock camera feed background */}
        <div className="absolute inset-0 bg-[#0a0a0a]">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at center, #333 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Viewfinder */}
        <div
          className={`relative w-full max-w-sm aspect-square rounded-[2.5rem] border-4 transition-colors duration-300 ${
            result === "idle"
              ? "border-primary/50"
              : result === "success" || result === "vip" || result === "staff"
                ? "border-emerald-500"
                : result === "voucher" || result === "punch" 
                  ? "border-blue-500" 
                  : "border-red-500"
          }`}
        >
          {/* Overlay UI inside viewfinder */}
          {result === "idle" && (
            <>
              <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-[2rem]" />
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/70">
                <ScanLine className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm font-bold tracking-widest uppercase text-center px-4">
                  Scan Ticket, Badge, or Voucher
                </p>
              </div>
            </>
          )}

          {(result === "success" || result === "fail" || result === "vip") && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm ${
                result === "success" || result === "vip" ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}
            >
              {result === "success" || result === "vip" ? (
                <CheckCircle2 className="h-24 w-24 text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              ) : (
                <XCircle className="h-24 w-24 text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              )}
            </div>
          )}
          
          {/* We hide the checkmark for complex transactions (staff/merch) because the UI is in the bottom sheet */}
        </div>
      </div>

      {/* Result Card Modal / Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl border-t border-white/10 p-6 pb-safe transition-transform duration-300 ${result !== "idle" ? "translate-y-0 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]" : "translate-y-[120%]"}`}
      >
        {/* EVENT TICKET RESULT */}
        {(result === "success" || result === "fail" || result === "vip") && (
          <div className="animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  className="h-full w-full rounded-full border-2 border-black object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Amaka Okafor</h3>
                <p className="text-white/50 text-sm">#TICKET-48211</p>
              </div>
              {result === "vip" && (
                <div className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50 px-3 py-1 rounded-full flex items-center gap-1 font-bold text-xs uppercase">
                  <Crown className="h-3 w-3" /> VIP
                </div>
              )}
            </div>

            <div
              className={`w-full p-4 rounded-2xl text-center font-bold text-lg tracking-wide ${
                result === "fail"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {result === "fail" ? "TICKET ALREADY SCANNED" : "ENTRY APPROVED"}
            </div>
          </div>
        )}

        {/* STAFF BADGE RESULT */}
        {result === "staff" && (
          <div className="animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-primary tracking-widest uppercase">Staff Verification</h2>
               <button onClick={() => setResult("idle")} className="text-white/50 p-2"><XCircle className="h-5 w-5"/></button>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-md"></div>
               <div className="relative z-10 flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-primary">
                    <ShieldAlert className="h-8 w-8 text-white/80" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-white">David Kim</h3>
                     <p className="text-primary font-bold uppercase text-xs tracking-wider">Security Lead</p>
                     <p className="text-white/40 font-mono text-[10px] mt-1">STAFF-DK8492X</p>
                  </div>
               </div>
               <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-emerald-400" />
                 <span className="text-emerald-400 font-bold text-sm uppercase">Access: VIP Lounge</span>
               </div>
            </div>
          </div>
        )}

        {/* MERCHANDISE / VOUCHER TRANSACTION */}
        {(result === "voucher" || result === "punch") && (
          <div className="animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase">
                 {result === "voucher" ? "Wallet Transaction" : "Punch Card Use"}
               </h2>
               <button onClick={() => setResult("idle")} className="text-white/50 p-2"><XCircle className="h-5 w-5"/></button>
            </div>
            
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Amaka Okafor</h3>
                    <p className="text-white/50 text-sm">Remaining: {result === "voucher" ? "$50.00" : "8 Punches"}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-400" />
                  </div>
               </div>

               <div className="flex items-center justify-center gap-6 mb-6">
                 <button 
                   onClick={() => setTransactionAmount(Math.max(1, transactionAmount - (result === "voucher" ? 5 : 1)))}
                   className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
                 >
                   <Minus className="h-6 w-6" />
                 </button>
                 <div className="text-4xl font-black w-24 text-center">
                   {result === "voucher" ? `$${transactionAmount}` : transactionAmount}
                 </div>
                 <button 
                   onClick={() => setTransactionAmount(transactionAmount + (result === "voucher" ? 5 : 1))}
                   className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
                 >
                   <Plus className="h-6 w-6" />
                 </button>
               </div>

               <button 
                 onClick={handleProcessTransaction}
                 disabled={processingTx}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors"
               >
                 {processingTx ? "Processing..." : `Deduct ${result === "voucher" ? `$${transactionAmount}` : `${transactionAmount} Punches`}`}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Mock Scanner Simulator Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-50 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {result === "idle" && (
          <>
            <button
              onClick={() => setResult("success")}
              className="flex-none bg-white/10 text-white px-4 py-3 rounded-full text-xs font-bold whitespace-nowrap"
            >
              Scan Ticket
            </button>
            <button
              onClick={() => setResult("staff")}
              className="flex-none bg-emerald-500/20 text-emerald-400 px-4 py-3 rounded-full text-xs font-bold whitespace-nowrap border border-emerald-500/30"
            >
              Scan Staff Badge
            </button>
            <button
              onClick={() => setResult("voucher")}
              className="flex-none bg-blue-500/20 text-blue-400 px-4 py-3 rounded-full text-xs font-bold whitespace-nowrap border border-blue-500/30"
            >
              Scan Wallet Voucher
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          50% { transform: translateY(100px); }
          100% { transform: translateY(-100px); }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
