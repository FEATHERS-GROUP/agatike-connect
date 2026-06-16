import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine, Check, X, Wifi, WifiOff, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Result = "idle" | "success" | "fail" | "vip";

export function ScannerDesktop() {
  const [result, setResult] = useState<Result>("idle");
  const [online, setOnline] = useState(true);

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.01_50)] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-6 pb-10">
        <header className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <button
            onClick={() => setOnline(!online)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${online ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? "Online" : "Offline mode"}
          </button>
        </header>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/50">Now scanning</p>
          <h1 className="text-xl font-semibold">Afrobeats Night Live</h1>
          <p className="text-xs text-white/60">Eko Convention Centre · Door 2</p>
        </div>

        {/* Scanner viewport */}
        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.3_0.06_50)_0%,oklch(0.08_0.01_50)_70%)]" />
          {/* corners */}
          {[
            "top-4 left-4 border-l-2 border-t-2",
            "top-4 right-4 border-r-2 border-t-2",
            "bottom-4 left-4 border-l-2 border-b-2",
            "bottom-4 right-4 border-r-2 border-b-2",
          ].map((c) => (
            <div
              key={c}
              className={`absolute h-12 w-12 rounded-md ${c}`}
              style={{ borderColor: "oklch(0.78 0.18 55)" }}
            />
          ))}
          {/* sweep */}
          {result === "idle" && (
            <div
              className="absolute left-4 right-4 top-1/2 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(0.78 0.18 55), transparent)",
                boxShadow: "0 0 30px oklch(0.78 0.18 55)",
              }}
            />
          )}
          {result !== "idle" && (
            <div className="absolute inset-0 grid place-items-center">
              <div
                className={`grid h-24 w-24 place-items-center rounded-full ${result === "success" || result === "vip" ? "bg-emerald-500" : "bg-red-500"} text-white animate-scale-in`}
              >
                {result === "success" || result === "vip" ? (
                  <Check className="h-12 w-12" />
                ) : (
                  <X className="h-12 w-12" />
                )}
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">
            <ScanLine className="mx-auto mb-1 h-4 w-4" /> Align QR inside the frame
          </div>
        </div>

        {/* Attendee card */}
        {result !== "idle" && (
          <div className="mt-5 animate-fade-in rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
              <div className="min-w-0">
                <p className="font-semibold">Amaka Okafor</p>
                <p className="text-xs text-white/60">
                  Order #AG-48211 · {result === "vip" ? "VIP Lounge" : "General Admission"} x1
                </p>
              </div>
              {result === "vip" && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-300">
                  <Crown className="h-3 w-3" /> VIP
                </span>
              )}
            </div>
            
            {result === "vip" && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-2">VIP Privileges</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Parking Access</span>
                  <span className="font-semibold text-emerald-300">Yes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">License Plate</span>
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300">RAA 123 A</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Backstage Pass</span>
                  <span className="font-semibold text-emerald-300">Yes</span>
                </div>
              </div>
            )}

            <p
              className={`mt-4 rounded-2xl px-3 py-2 text-sm ${result === "fail" ? "bg-red-500/10 text-red-200" : "bg-emerald-500/10 text-emerald-200"}`}
            >
              {result === "fail" ? "Ticket already used at 21:14" : "Welcome — entry confirmed"}
            </p>
          </div>
        )}

        <div className="mt-auto grid grid-cols-3 gap-2 pt-6">
          <Button
            onClick={() => setResult("success")}
            className="h-14 rounded-2xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            Valid
          </Button>
          <Button
            onClick={() => setResult("vip")}
            variant="outline"
            className="h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            VIP
          </Button>
          <Button
            onClick={() => setResult("fail")}
            variant="outline"
            className="h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Reject
          </Button>
        </div>
        <button
          onClick={() => setResult("idle")}
          className="mt-3 text-center text-xs text-white/50 hover:text-white"
        >
          Reset scanner
        </button>
      </div>
    </div>
  );
}
