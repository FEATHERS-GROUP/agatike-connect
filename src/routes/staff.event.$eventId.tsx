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

function AccessCodeInput({ onPinComplete, error, event }: { onPinComplete: (pin: string) => void, error: string, event?: any }) {
  const [pin, setPin] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 9) {
      setPin(value);
      if (value.length === 9) {
        onPinComplete(value);
      }
    }
  };

  const themeColor = event?.theme_color || event?.tickets_page_styles?.primary_color || "#ff3b30";

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground px-6 w-full relative overflow-hidden"
      style={{ "--color-primary": themeColor } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        {event?.cover ? (
          <img src={event.cover} alt="Event Cover" className="w-24 h-24 rounded-2xl object-cover mb-6 shadow-[0_0_30px_var(--color-primary)]/30 border border-black/10" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_30px_var(--color-primary)]/30 border border-primary/20">
            <Lock className="h-10 w-10 text-primary" />
          </div>
        )}
        <h1 className="text-3xl font-black mb-2 text-center tracking-tight">{event?.title || "Staff Portal"}</h1>
        <p className="text-muted-foreground text-sm mb-10 text-center font-medium">Enter your 9-character Access Code</p>

        <div className="w-full relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
          <input
            type="text"
            value={pin}
            onChange={handleChange}
            placeholder="e.g. 2607NWREL"
            className="w-full h-16 bg-background/80 backdrop-blur-md border-2 border-primary/20 focus:border-primary rounded-2xl text-center text-2xl font-black tracking-[0.2em] outline-none shadow-sm transition-all uppercase placeholder:text-muted-foreground/30 relative z-10"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            maxLength={9}
          />
        </div>

        {error && <p className="text-destructive text-sm mt-6 font-medium animate-pulse">{error}</p>}
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
    return <div className="min-h-[100dvh] bg-background flex items-center justify-center text-muted-foreground">Loading security protocols...</div>;
  }

  if (!assignment) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You are not assigned as staff for this event or your assignment has been revoked.</p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80">Return to Profile</button>
        </Link>
      </div>
    );
  }

  const isExpired = assignment.event?.schedules?.[0]?.end_date && new Date(assignment.event.schedules[0].end_date) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Event Ended</h2>
        <p className="text-muted-foreground mb-6">Staff access for "{assignment.event?.title}" has expired.</p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80">Return to Profile</button>
        </Link>
      </div>
    );
  }

  if (!isAuthenticated && assignment.pin_code) {
    return (
      <AccessCodeInput
        onPinComplete={(pin) => {
          if (pin === assignment.pin_code) {
            setIsAuthenticated(true);
            setPinError("");
          } else {
            setPinError("Incorrect Access Code. Please try again.");
          }
        }}
        error={pinError}
        event={assignment.event}
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
    <div className="min-h-[100dvh] bg-background text-foreground overflow-y-auto pb-safe">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <header className="px-6 pt-safe-top pb-4 flex items-center justify-between relative z-10 mt-4">
        <Link to="/profile" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-bold tracking-wider uppercase">Live</span>
        </div>
      </header>

      <main className="px-6 pt-2 pb-24 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1 leading-tight">{assignment.event?.title || "Event Dashboard"}</h1>
          <p className="text-muted-foreground font-medium">{assignment.role} • {assignment.allowed_sections?.includes('*') ? 'All Access' : 'Restricted Access'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-square">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-xs text-muted-foreground font-medium">Checked In</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-square">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-xs text-muted-foreground font-medium">Scans/Hour</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Quick Actions</h3>
          
          <Link to={`/events/${eventId}`} className="block">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:bg-secondary/50 active:bg-secondary transition-colors shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-foreground/80" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">View Event Page</h4>
                <p className="text-xs text-muted-foreground">See public details & lineup</p>
              </div>
            </div>
          </Link>
          
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 opacity-50 pointer-events-none shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Users className="h-6 w-6 text-foreground/80" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Guest List</h4>
              <p className="text-xs text-muted-foreground">View attendees (Coming Soon)</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Scanner */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(var(--color-primary),0.3)] hover:opacity-90 active:scale-95 transition-all"
        >
          <ScanLine className="h-6 w-6" /> Scan Tickets
        </button>
      </div>
    </div>
  );
}
