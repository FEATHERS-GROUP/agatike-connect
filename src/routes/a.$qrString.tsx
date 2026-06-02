import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAttendeeByQrCode } from "@/api/attendees";
import { getBadgeProjectByEventId, getBadgeProjectById } from "@/api/badges";
import { BadgePreview } from "@/components/badge-designer/BadgePreview";
import { Loader2, ShieldAlert, X, Printer, Download } from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/a/$qrString")({
  validateSearch: (search: Record<string, unknown>) => ({
    badgeId: (search.badgeId as string) || undefined,
  }),
  component: PublicAttendeeBadgeRoute,
});

function PublicAttendeeBadgeRoute() {
  const { qrString } = Route.useParams();
  const { badgeId } = Route.useSearch();
  const badgeRef = useRef<HTMLDivElement>(null);

  const {
    data: attendee,
    isLoading: isAttendeeLoading,
    error: attendeeError,
  } = useQuery({
    queryKey: ["attendee-by-qr", qrString],
    queryFn: async () => {
      const res = await getAttendeeByQrCode({ data: { qrcode_number: qrString } } as any);
      if (!res) throw new Error("Badge not found");
      return res;
    },
    retry: false,
  });

  const { data: badgeProject, isLoading: isBadgeLoading } = useQuery({
    queryKey: ["badge-project", badgeId || attendee?.event_id],
    queryFn: () =>
      badgeId
        ? getBadgeProjectById({ data: { id: badgeId } } as any)
        : getBadgeProjectByEventId({ data: { event_id: attendee.event_id } } as any),
    enabled: !!badgeId || !!attendee?.event_id,
  });

  const handleClose = () => {
    window.close();
    // Fallback if browser blocks window.close()
    window.location.href = "/";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!badgeRef.current) return;
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: null,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendee_Badge_${qrString}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate badge image", err);
    }
  };

  if (isAttendeeLoading || isBadgeLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Loading Attendee Badge...
        </p>
      </div>
    );
  }

  if (attendeeError || !attendee) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Invalid Badge</h1>
        <p className="text-muted-foreground">
          The QR code scanned does not match any attendee in our system.
        </p>
      </div>
    );
  }

  const name = attendee.names || attendee.email || attendee.phone || "Unknown Attendee";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-4 relative">
      {/* Advanced Print Styles to isolate just the badge */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body, html { 
            background: white !important; 
            margin: 0; 
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #badge-print-container, #badge-print-container * {
            visibility: visible;
          }
          #badge-print-container {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            margin: 0;
            padding: 0;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .print-wrapper {
            perspective: none !important;
            transform: none !important;
          }
          /* Override 3D container */
          .preserve-3d {
            transform: none !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 40px !important;
            align-items: center !important;
          }
          /* Show both faces stacked vertically */
          .print-face {
            position: relative !important;
            opacity: 1 !important;
            transform: none !important;
            pointer-events: auto !important;
            page-break-inside: avoid;
            break-inside: avoid;
            margin: 0 !important;
            height: 544px !important;
            width: 340px !important;
            border: 1px dashed #ccc !important;
            border-radius: 2.5rem !important;
            box-shadow: none !important;
            flex-shrink: 0 !important;
          }
          .decorative-lanyard {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <button
        onClick={handleClose}
        className="no-print absolute top-6 right-6 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="no-print w-full max-w-sm mb-6 text-center animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-1 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Verified Attendee
        </h2>
        <p className="text-muted-foreground text-xs mb-3">Event Registration</p>
      </div>

      <div
        id="badge-print-container"
        className="w-[340px] animate-in zoom-in-95 duration-700 fade-in delay-150 relative mx-auto"
        ref={badgeRef}
      >
        {badgeProject ? (
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
              role: attendee.ticket_type || "Attendee",
              qrString: attendee.qrcode_number,
              sectionName: attendee.type || "General",
              initials: name.substring(0, 2).toUpperCase(),
              profileImage: null,
            }}
            sponsors={badgeProject.sponsors_json || []}
          />
        ) : (
          <div className="w-full bg-slate-900 border border-border/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="h-24 w-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
              {attendee.ticket_type || "Attendee"}
            </p>
            <div className="bg-black/50 rounded-xl py-3 px-4 mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Ticket ID
              </p>
              <p className="font-mono text-sm text-white/80">{attendee.qrcode_number}</p>
            </div>
          </div>
        )}
      </div>

      <div className="no-print flex gap-4 mt-8">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Badge
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-full text-primary-foreground font-medium transition-colors shadow-lg shadow-primary/25"
        >
          <Download className="w-4 h-4" /> Save as Image
        </button>
      </div>
    </div>
  );
}
