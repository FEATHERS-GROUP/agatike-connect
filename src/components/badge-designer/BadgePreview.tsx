import React from "react";
import { FlipHorizontal, UserCheck, MapPin, ShieldAlert, Briefcase, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { Sponsor } from "./constants";

interface BadgePreviewProps {
  config: any;
  activeSide?: "front" | "back";
  setActiveSide?: (side: "front" | "back") => void;
  sponsors?: Sponsor[];
  draggingId?: string | null;
  setDraggingId?: (id: string | null) => void;
  handlePointerDown?: (
    e: React.PointerEvent,
    id: string,
    initialX: number,
    initialY: number,
  ) => void;
  isDesigner?: boolean;
  mockUser?: {
    name: string;
    role: string;
    qrString: string;
    sectionName: string;
    initials: string;
    profileImage?: string;
  };
}

export function BadgePreview({
  config,
  activeSide = "front",
  setActiveSide = () => {},
  sponsors = [],
  draggingId = null,
  setDraggingId = () => {},
  handlePointerDown = () => {},
  isDesigner = true,
  mockUser = {
    name: "David Kim",
    role: "Security Lead",
    qrString: "STAFF-DK8492X",
    sectionName: "VIP Lounge",
    initials: "DK"
  }
}: BadgePreviewProps) {
  const renderQRCode = (theme: string, accentColor: string) => {
    const x = config.qrX ?? 50;
    const y = config.qrY ?? 80;

    return (
      <div
        className={`absolute flex flex-col items-center animate-in fade-in zoom-in duration-500 z-40 ${isDesigner ? 'cursor-move' : ''} ${draggingId === "qrcode" ? "opacity-70 scale-105" : "hover:scale-105"} transition-transform bg-transparent p-2 ${isDesigner ? 'pointer-events-auto' : ''}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%) translateZ(15px)",
          touchAction: "none",
        }}
        onPointerDown={(e) => isDesigner && handlePointerDown(e, "qrcode", x, y)}
      >
        <div
          className={`p-4 rounded-3xl ${theme === "minimal" ? "bg-slate-100" : "bg-white/10 backdrop-blur-md border border-white/10"}`}
        >
          <div className="w-24 h-24 p-1 bg-white rounded-xl flex items-center justify-center">
            <QRCode value={mockUser.qrString || "STAFF-XYZ123"} size={88} className="w-full h-full" />
          </div>
        </div>
        <p
          className={`font-mono text-[9px] mt-3 uppercase tracking-[0.3em] font-bold ${theme === "minimal" ? "text-slate-400" : "text-white/50 drop-shadow-md"}`}
        >
          {mockUser.qrString}
        </p>
      </div>
    );
  };

  const renderSection = (theme: string, accentColor: string) => (
    <div
      className={`absolute bottom-0 left-0 right-0 p-6 border-t flex items-center justify-between z-10 pointer-events-none ${theme === "minimal" ? "border-slate-200" : "border-white/10"}`}
    >
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" style={{ color: accentColor }} />
        <span
          className={`font-bold text-xs uppercase tracking-widest ${theme === "minimal" ? "text-black" : "text-white"}`}
        >
          {mockUser.sectionName}
        </span>
      </div>
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}22` }}
      >
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
            className={`absolute flex flex-col items-center justify-center gap-1 z-30 ${isDesigner ? 'cursor-move' : ''} ${draggingId === s.id ? "opacity-70 scale-105" : "hover:scale-105"} transition-transform ${isDesigner ? 'pointer-events-auto' : ''}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%) translateZ(10px)",
              touchAction: "none",
            }}
            onPointerDown={(e) => isDesigner && handlePointerDown(e, s.id, x, y)}
          >
            {s.logoUrl ? (
              <div
                className="p-1.5 bg-white/90 rounded-md shadow-sm pointer-events-none border border-black/5"
                style={{ height: `${scale + 16}px` }}
              >
                <img src={s.logoUrl} alt="Sponsor" className="h-full w-auto object-contain" />
              </div>
            ) : (
              <div
                className="p-1.5 bg-white/90 rounded-md shadow-sm pointer-events-none border border-black/5 flex items-center justify-center"
                style={{ height: `${scale + 16}px`, minWidth: "40px" }}
              >
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
            )}
            {s.text && (
              <span
                className={`text-[7px] tracking-widest uppercase font-bold pointer-events-none ${theme === "minimal" ? "text-slate-500" : "text-white/80 drop-shadow-md"}`}
              >
                {s.text}
              </span>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div
      className={`flex-1 relative flex flex-col items-center justify-center ${isDesigner ? "bg-secondary/30 p-8" : "p-2"} overflow-hidden`}
      onPointerUp={() => setDraggingId && setDraggingId(null)}
    >
      {/* Subtle background grid */}
      {isDesigner && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      )}

      {/* View Toggle */}
      {isDesigner && (
        <div className="absolute top-6 z-30 flex items-center bg-background border border-border/60 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setActiveSide && setActiveSide("front")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSide === "front" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            Front
          </button>
          <button
            onClick={() => setActiveSide && setActiveSide("back")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeSide === "back" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <FlipHorizontal className="h-3 w-3" /> Back
          </button>
        </div>
      )}

      <div
        className="relative transform transition-all duration-700 hover:scale-[1.02]"
        style={{ perspective: "1000px" }}
      >
        {/* THE BADGE */}
        <div
          className={`relative w-[340px] aspect-[1/1.6] rounded-[2.5rem] shadow-2xl border ${config.fontFamily} ${config.theme === "minimal" ? "border-border/60 bg-white" : config.theme === "glass" ? "border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)]" : "border-black/50 shadow-black/50"} transition-transform duration-700 preserve-3d`}
          style={{ transform: activeSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Lanyard Hole (Shared) */}
          <div
            className={`absolute top-6 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full shadow-inner z-20 pointer-events-none transform-style-preserve-3d translate-z-1 ${config.theme === "minimal" ? "bg-slate-200 border-none" : "bg-black/40 border border-white/10 backdrop-blur-md"}`}
          ></div>

          {/* === FRONT DESIGN === */}
          <div
            className={`absolute inset-0 flex flex-col p-8 pt-14 text-center backface-hidden transition-opacity duration-500 z-10 rounded-[2.5rem] overflow-hidden ${activeSide !== "front" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {/* Background Layer */}
            {config.theme !== "minimal" && (
              <div className={`absolute inset-0 bg-gradient-to-b ${config.gradientClass} z-0`}></div>
            )}
            {config.bgImageUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={config.bgImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ opacity: config.bgOpacity ? config.bgOpacity / 100 : 0.5 }}
                />
              </div>
            )}
            {config.theme === "glass" && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] pointer-events-none z-0"></div>
            )}

            {/* Event Name */}
            <div className="mb-6 pointer-events-none relative z-10">
              <h3
                className={`font-black tracking-[0.2em] text-xs uppercase ${config.theme === "minimal" ? "text-black" : "text-white drop-shadow-md"}`}
              >
                {config.logoText}
              </h3>
            </div>

            {/* Profile Section */}
            <div className="flex-grow flex flex-col items-center pointer-events-none relative z-10">
              {config.showUserImage ? (
                <div
                  className={`h-28 w-28 rounded-full overflow-hidden mb-5 border-[3px] ${config.theme === "solid" ? "shadow-black/50" : "shadow-xl"}`}
                  style={{ borderColor: config.accentColor }}
                >
                  <img
                    src={mockUser.profileImage || "https://i.pravatar.cc/300?img=12"}
                    alt="Staff"
                    className="w-full h-full object-cover bg-slate-200"
                  />
                </div>
              ) : (
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center mb-5 shadow-xl border-2 font-bold text-2xl"
                  style={{
                    backgroundColor: config.theme === "minimal" ? "#f1f5f9" : "rgba(0,0,0,0.3)",
                    borderColor: config.accentColor,
                    color: config.theme === "minimal" ? "black" : "white"
                  }}
                >
                  {mockUser.initials || <UserCheck className="h-8 w-8" />}
                </div>
              )}

              <h2
                className={`${config.frontTextSize || "text-3xl"} font-black tracking-tight ${config.theme === "minimal" ? "text-black" : "text-white drop-shadow-md"}`}
              >
                {mockUser.name}
              </h2>
              <p
                className="font-bold tracking-widest uppercase mt-1 text-xs drop-shadow-md"
                style={{ color: config.accentColor }}
              >
                {mockUser.role}
              </p>
              {config.qrPlacement === "front" && renderQRCode(config.theme, config.accentColor)}
            </div>

            {config.sponsorsPlacement === "front" && renderSponsors(config.theme)}
            {config.sectionPlacement === "front" && renderSection(config.theme, config.accentColor)}
          </div>

          {/* === BACK DESIGN === */}
          <div
            className={`absolute inset-0 flex flex-col p-8 pt-14 text-center backface-hidden transition-opacity duration-500 z-10 rounded-[2.5rem] overflow-hidden ${activeSide !== "back" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            style={{ transform: "rotateY(180deg)" }}
          >
            {/* Background Layer */}
            {config.theme !== "minimal" && (
              <div className={`absolute inset-0 bg-gradient-to-b ${config.gradientClass} z-0`}></div>
            )}
            {config.bgImageUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={config.bgImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ opacity: config.bgOpacity / 100 }}
                />
              </div>
            )}
            {config.theme === "glass" && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] pointer-events-none z-0"></div>
            )}

            {/* Event Name */}
            <div className="mb-6 opacity-60 pointer-events-none relative z-10">
              <h3
                className={`font-black tracking-[0.2em] text-xs uppercase ${config.theme === "minimal" ? "text-black" : "text-white drop-shadow-md"}`}
              >
                {config.logoText}
              </h3>
            </div>

            {/* Optional QR Code Placement on Back */}
            {config.qrPlacement === "back" && renderQRCode(config.theme, config.accentColor)}

            {/* Back Custom Text */}
            <div
              className="flex-1 flex flex-col items-center justify-center px-4 pointer-events-none relative z-10"
              style={{ transform: "translateZ(5px)" }}
            >
              <div
                className={`text-xs leading-relaxed whitespace-pre-wrap ${config.theme === "minimal" ? "text-slate-600" : "text-white/80 drop-shadow-sm"}`}
              >
                {config.backText}
              </div>
            </div>

            {config.sponsorsPlacement === "back" && renderSponsors(config.theme)}
            {config.sectionPlacement === "back" && renderSection(config.theme, config.accentColor)}
          </div>
        </div>

        {/* Decorative Lanyard Strings (Visual Only) */}
        <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[140px] h-[120px] opacity-80 pointer-events-none z-0">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-xl"
          >
            <path d="M 10,-20 C 10,50 42,90 42,100" fill="none" stroke="#222" strokeWidth="4" />
            <path d="M 90,-20 C 90,50 58,90 58,100" fill="none" stroke="#222" strokeWidth="4" />
            <rect
              x="38"
              y="90"
              width="24"
              height="12"
              fill="#111"
              rx="3"
              stroke="#444"
              strokeWidth="1"
            />
            <circle cx="50" cy="102" r="4" fill="none" stroke="#888" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
