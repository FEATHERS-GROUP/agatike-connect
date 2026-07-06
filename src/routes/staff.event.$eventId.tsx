import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserStaffAssignments } from "@/api/staff";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Lock, ArrowLeft, ScanLine, Users, Activity, ExternalLink, Calendar, MapPin, XCircle, CheckCircle2 } from "lucide-react";
import { ScannerMobile } from "@/components/mobile/ScannerMobile";
import { getEventById } from "@/api/events";

export const Route = createFileRoute("/staff/event/$eventId")({
  component: StaffEventDashboard,
});

function Numpad({ onPinComplete, error }: { onPinComplete: (pin: string) => void, error: string }) {
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onPinComplete(newPin);
        // Add slight delay before clearing so user sees the 4th dot
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white px-6 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_var(--color-primary)]/30">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Staff Portal</h1>
        <p className="text-white/60 text-sm mb-8">Enter your 4-digit security PIN</p>

        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i ? "bg-primary shadow-[0_0_10px_var(--color-primary)] scale-125" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-6 animate-pulse">{error}</p>}

        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-2xl font-medium flex items-center justify-center active:bg-white/20 active:scale-95 transition-all mx-auto backdrop-blur-md"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress("0")}
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-2xl font-medium flex items-center justify-center active:bg-white/20 active:scale-95 transition-all mx-auto backdrop-blur-md"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-white/50 text-xl font-medium flex items-center justify-center active:text-white active:scale-95 transition-all mx-auto"
          >
            DEL
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffEventDashboard() {
  const { eventId } = Route.useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["user-staff-assignments", user?.id],
    queryFn: () => getUserStaffAssignments({ data: { user_id: user?.id } } as any),
    enabled: !!user?.id,
  });

  const assignment = assignments.find((a: any) => a.event_id === eventId);
  
  const { data: eventDetails } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId && isAuthenticated,
  });

  if (isLoading) {
    return <div className="min-h-[100dvh] bg-black flex items-center justify-center text-white/50">Loading security protocols...</div>;
  }

  if (!assignment) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-white/60 mb-6">You are not assigned as staff for this event or your assignment has been revoked.</p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-white/10 rounded-full font-medium active:bg-white/20">Return to Profile</button>
        </Link>
      </div>
    );
  }

  const isExpired = assignment.event?.schedules?.[0]?.end_date && new Date(assignment.event.schedules[0].end_date) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Event Ended</h2>
        <p className="text-white/60 mb-6">Staff access for "{assignment.event?.title}" has expired.</p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-white/10 rounded-full font-medium active:bg-white/20">Return to Profile</button>
        </Link>
      </div>
    );
  }

  if (!isAuthenticated && assignment.pin_code) {
    return (
      <Numpad
        onPinComplete={(pin) => {
          if (pin === assignment.pin_code) {
            setIsAuthenticated(true);
            setPinError("");
          } else {
            setPinError("Incorrect PIN");
          }
        }}
        error={pinError}
      />
    );
  }

  // If we reach here, we are authenticated (or no PIN was required)
  
  if (showScanner) {
    // For now we render the global ScannerMobile but ideally it should be tailored
    // We can wrap it in a div that handles going back
    return (
      <div className="relative h-[100dvh] w-full bg-black">
        <button 
          onClick={() => setShowScanner(false)}
          className="absolute top-safe-top left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <ScannerMobile />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white overflow-y-auto pb-safe">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      
      <header className="px-6 pt-safe-top pb-4 flex items-center justify-between relative z-10 mt-4">
        <Link to="/profile" className="p-2 -ml-2 text-white/70 hover:text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="bg-primary/20 border border-primary/50 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-bold tracking-wider uppercase">Live</span>
        </div>
      </header>

      <main className="px-6 pt-2 pb-24 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1 leading-tight">{assignment.event?.title || "Event Dashboard"}</h1>
          <p className="text-white/60 font-medium">{assignment.role} • {assignment.allowed_sections?.includes('*') ? 'All Access' : 'Restricted Access'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between aspect-square">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-xs text-white/50 font-medium">Checked In</p>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between aspect-square">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-xs text-white/50 font-medium">Scans/Hour</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 ml-2">Quick Actions</h3>
          
          <Link to={`/events/${eventId}`} className="block">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 active:bg-white/10 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white/80" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">View Event Page</h4>
                <p className="text-xs text-white/50">See public details & lineup</p>
              </div>
            </div>
          </Link>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 opacity-50 pointer-events-none">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-white/80" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Guest List</h4>
              <p className="text-xs text-white/50">View attendees (Coming Soon)</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Scanner */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
        >
          <ScanLine className="h-6 w-6" /> Scan Tickets
        </button>
      </div>
    </div>
  );
}
