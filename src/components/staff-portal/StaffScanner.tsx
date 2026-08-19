import React, { useState } from "react";
import { ScanLine, Check, X, Wifi, WifiOff, Crown, Dumbbell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordSpaceCheckIn } from "@/api/spaces";
import { toast } from "sonner";

type Result = "idle" | "success" | "fail" | "vip";
type ScannerMode = "event" | "space" | "venue";

interface StaffScannerProps {
  spaceManagers: any[];
}

export function StaffScanner({ spaceManagers }: StaffScannerProps) {
  const [result, setResult] = useState<Result>("idle");
  const [online, setOnline] = useState(true);
  const [mode, setMode] = useState<ScannerMode>("space");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaceManagers[0]?.space?.id || "");

  const handleSimulateScan = async (type: Result) => {
    setResult(type);

    if (mode === "space" && (type === "success" || type === "vip")) {
      try {
        if (!selectedSpaceId) {
          toast.error("Please select a space to check into");
          return;
        }
        await recordSpaceCheckIn({
          data: {
            space_id: selectedSpaceId,
            user_id: "00000000-0000-0000-0000-000000000000", // dummy user ID
            method: "qrcode_scan",
          },
        });
        toast.success("Check-in recorded to database!");
      } catch (err) {
        console.error("Mock DB insert failed (expected if dummy UUIDs)", err);
      }
    } else if (mode === "event") {
      if (type === "success" || type === "vip") toast.success("Event Ticket Validated!");
      else toast.error("Invalid Event Ticket");
    } else if (mode === "venue") {
      if (type === "success" || type === "vip") toast.success("Venue Pass Validated!");
      else toast.error("Invalid Venue Pass");
    }
  };

  const selectedSpace = spaceManagers.find((sm) => sm.space?.id === selectedSpaceId)?.space;

  return (
    <div className="flex flex-col h-full text-foreground bg-[oklch(0.1_0.01_50)] rounded-3xl overflow-hidden shadow-2xl relative mt-4">
      <div className="flex flex-col px-5 pt-6 pb-10 flex-1 text-white">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ScannerMode)}
              className="bg-primary/20 text-primary-foreground border-none text-xs font-bold rounded-full px-3 py-1.5 focus:ring-0 outline-none backdrop-blur-md"
            >
              <option value="space">Subscriptions</option>
              <option value="event">Event Tickets</option>
              <option value="venue">Venue Passes</option>
            </select>
            <button
              onClick={() => setOnline(!online)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md ${
                online ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            </button>
          </div>
        </header>

        {mode === "space" && spaceManagers.length > 0 && (
          <div className="mb-4 space-y-1">
            <label className="text-xs uppercase tracking-widest text-white/50">Location</label>
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="" disabled className="text-black">
                Select your branch...
              </option>
              {spaceManagers.map((sm) => (
                <option key={sm.id} value={sm.space?.id} className="text-black">
                  {sm.space?.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-2">
          <p className="text-xs uppercase tracking-widest text-white/50">Scanner Active</p>
          <h1 className="text-xl font-semibold">
            {mode === "event"
              ? "Event Access"
              : mode === "venue"
                ? "Venue Pass Scanning"
                : selectedSpace?.name || "No Branch Selected"}
          </h1>
          <p className="text-xs text-white/60">
            {mode === "space" && selectedSpace
              ? "Ready for member check-in"
              : "Scan any valid QR code"}
          </p>
        </div>

        {/* Scanner viewport */}
        <div className="relative mt-6 aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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
                className={`grid h-24 w-24 place-items-center rounded-full ${
                  result === "success" || result === "vip" ? "bg-emerald-500" : "bg-red-500"
                } text-white animate-in zoom-in duration-300`}
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
          <div className="mt-5 animate-in slide-in-from-bottom-4 duration-300 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              <div className="min-w-0">
                <p className="font-semibold">Amaka Okafor</p>
                <p className="text-xs text-white/60">
                  {mode === "event"
                    ? `Order #AG-48211 · ${result === "vip" ? "VIP Lounge" : "General Admission"} x1`
                    : mode === "venue"
                      ? "Venue Daily Pass"
                      : `Member #1249 · Premium Access`}
                </p>
              </div>
              {result === "vip" && mode === "event" && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-300">
                  <Crown className="h-3 w-3" /> VIP
                </span>
              )}
              {result === "success" && mode === "space" && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-blue-400/15 px-2 py-1 text-xs text-blue-300">
                  <Dumbbell className="h-3 w-3" /> Active
                </span>
              )}
              {result === "success" && mode === "venue" && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-purple-400/15 px-2 py-1 text-xs text-purple-300">
                  <MapPin className="h-3 w-3" /> Valid
                </span>
              )}
            </div>

            {result === "fail" && mode === "space" && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm text-red-200">
                <p>Membership Frozen or Expired.</p>
              </div>
            )}

            <p
              className={`mt-4 rounded-2xl px-3 py-2 text-sm ${
                result === "fail"
                  ? "bg-red-500/10 text-red-200"
                  : "bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {result === "fail"
                ? mode === "event"
                  ? "Ticket already used at 21:14"
                  : mode === "venue"
                    ? "Pass expired"
                    : "Access Denied"
                : mode === "event"
                  ? "Welcome — entry confirmed"
                  : mode === "venue"
                    ? "Welcome to the venue"
                    : "Welcome — check-in logged"}
            </p>
          </div>
        )}

        <div className="mt-auto grid grid-cols-3 gap-2 pt-6">
          <Button
            onClick={() => handleSimulateScan("success")}
            className="h-14 rounded-2xl bg-white/20 text-white hover:bg-white/30 border-none"
          >
            Valid
          </Button>
          <Button
            onClick={() => handleSimulateScan("vip")}
            variant="outline"
            className="h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            {mode === "event" ? "VIP" : mode === "space" ? "Class" : "Guest"}
          </Button>
          <Button
            onClick={() => handleSimulateScan("fail")}
            variant="outline"
            className="h-14 rounded-2xl border-white/20 bg-red-500/20 text-red-300 hover:bg-red-500/30"
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
