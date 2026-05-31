import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStaffByBadgeId, getEventSections } from "@/api/staff";
import { getBadgeProjectByEventId } from "@/api/badges";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";
import { Loader2, ShieldAlert, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/b/$qrString")({
  component: PublicBadgeRoute,
});

function PublicBadgeRoute() {
  const { qrString } = Route.useParams();

  const { data: staff, isLoading: isStaffLoading, error: staffError } = useQuery({
    queryKey: ["staff-by-qr", qrString],
    queryFn: async () => {
      const res = await getStaffByBadgeId({ data: { badge_qr_string: qrString } } as any);
      if (!res) throw new Error("Badge not found");
      return res;
    },
    retry: false,
  });

  const { data: badgeProject, isLoading: isBadgeLoading } = useQuery({
    queryKey: ["badge-project", staff?.event_id],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: staff.event_id } } as any),
    enabled: !!staff?.event_id,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["event-sections", staff?.event_id],
    queryFn: () => getEventSections({ data: { event_id: staff.event_id } } as any),
    enabled: !!staff?.event_id,
  });

  const [timeLeft, setTimeLeft] = useState(60);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (isStaffLoading || isBadgeLoading || !staff) return;
    if (expired) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, expired, isStaffLoading, isBadgeLoading, staff]);

  const handleClose = () => {
    window.close();
    // Fallback if browser blocks window.close()
    window.location.href = "/";
  };

  if (isStaffLoading || isBadgeLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
      </div>
    );
  }

  if (staffError || !staff) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Invalid Badge</h1>
        <p className="text-muted-foreground">The QR code scanned does not match any active credentials in our system.</p>
      </div>
    );
  }

  const name = (!staff.user_id && (staff.first_name || staff.last_name))
    ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim()
    : `User ${staff.user_id?.substring(0, 6) || "Unknown"}`;

  if (expired) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
          <Clock className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">View Expired</h1>
        <p className="text-muted-foreground mb-8">For security, this identity verification page expires after 60 seconds. Please scan the QR code again.</p>
        <button 
          onClick={handleClose}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Close Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-4 relative">
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-sm mb-6 text-center animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-1 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Verified Identity
        </h2>
        <p className="text-muted-foreground text-xs mb-3">Official Staff Credential</p>
        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-mono text-white/50">
          <Clock className="h-3 w-3" /> Expires in {timeLeft}s
        </div>
      </div>

      {badgeProject ? (
        <div className="w-[340px] animate-in zoom-in-95 duration-700 fade-in delay-150 relative mx-auto">
           <BadgePreview
              config={{
                theme: badgeProject.theme,
                fontFamily: badgeProject.font_family,
                gradientClass: badgeProject.gradient_class,
                bgImageUrl: badgeProject.bg_image_url,
                logoText: badgeProject.logo_text,
                showUserImage: badgeProject.show_user_image,
                accentColor: badgeProject.accent_color,
                ...(badgeProject.front_design || {}),
              }}
              isDesigner={false}
              mockUser={{
                name: name,
                role: staff.role,
                qrString: staff.badge_qr_string,
                sectionName: staff.allowed_sections?.includes("*") 
                  ? "ALL ACCESS" 
                  : (staff.allowed_sections && staff.allowed_sections.length > 0)
                    ? staff.allowed_sections.map((id: string) => sections.find((s: any) => s.id === id)?.name).filter(Boolean).join(", ") 
                    : "NO ACCESS",
                initials: `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase(),
                profileImage: staff.profile_image
              }}
              sponsors={badgeProject.sponsors_json || []}
            />
        </div>
      ) : (
        <div className="w-full max-w-sm bg-slate-900 border border-border/10 rounded-3xl p-8 text-center shadow-2xl">
          <div className="h-24 w-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">{staff.role}</p>
          <div className="bg-black/50 rounded-xl py-3 px-4 mb-4">
             <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Badge ID</p>
             <p className="font-mono text-sm text-white/80">{staff.badge_qr_string}</p>
          </div>
        </div>
      )}

      {staff.status !== "active" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center font-bold uppercase tracking-widest text-sm z-50 animate-in slide-in-from-bottom-full">
          Warning: Badge Inactive
        </div>
      )}
    </div>
  );
}
