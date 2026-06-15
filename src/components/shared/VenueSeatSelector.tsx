import React, { useMemo, useState, useRef, useEffect } from "react";
import { Section, VenueTemplate } from "../venue-designer/types";
import { PitchRenderer } from "../venue-designer/PitchRenderer";
import { Info, Map as MapIcon, Minus, Plus, RotateCcw, Check, X, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  return [
    "M",
    start.x,
    start.y,
    "A",
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    innerEnd.x,
    innerEnd.y,
    "A",
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    "Z",
  ].join(" ");
}

function getBoundaryPath(shape: string, w: number, h: number, rx: number) {
  const hw = w / 2;
  const hh = h / 2;
  if (shape === "circle" || shape === "oval") {
    return `M ${-hw} 0 A ${hw} ${hh} 0 1 0 ${hw} 0 A ${hw} ${hh} 0 1 0 ${-hw} 0 Z`;
  }
  // Default: rounded rect
  return `M ${-hw + rx} ${-hh} L ${hw - rx} ${-hh} Q ${hw} ${-hh} ${hw} ${-hh + rx} L ${hw} ${hh - rx} Q ${hw} ${hh} ${hw - rx} ${hh} L ${-hw + rx} ${hh} Q ${-hw} ${hh} ${-hw} ${hh - rx} L ${-hw} ${-hh + rx} Q ${-hw} ${-hh} ${-hw + rx} ${-hh} Z`;
}

export type SeatCode = string;

interface VenueSeatSelectorProps {
  venueProject: any;
  eventTickets: any[];
  bookedSeats: SeatCode[];
  selectedSeats: SeatCode[];
  onSeatSelect: (seat: {
    code: string;
    sectionName: string;
    seatName?: string;
    ticketId: string;
    cost: number;
    type: string;
  }) => void;
  onSeatDeselect: (code: string) => void;
  maxSelectable: number;
  currency?: string;
  activeTicketId?: string;
  hideLegend?: boolean;
  onSectionActive?: (isActive: boolean) => void;
}

export function VenueSeatSelector({
  venueProject,
  eventTickets,
  bookedSeats,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  maxSelectable,
  currency,
  activeTicketId,
  hideLegend,
  onSectionActive,
}: VenueSeatSelectorProps) {
  const sections: Section[] = venueProject.sections_data || [];

  const isMobile = useIsMobile();

  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const isPointerDown = useRef(false);

  const [activeSectionForModal, setActiveSectionForModal] = useState<Section | null>(null);

  // Call the prop when internal state changes
  useEffect(() => {
    onSectionActive?.(!!activeSectionForModal);
  }, [activeSectionForModal, onSectionActive]);

  useEffect(() => {
    // Reset manual zoom/pan whenever the active tier changes — the SVG
    // viewBox below auto-fits to the targeted sections like an image.
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  }, [activeTicketId]);

  // Compute a bounding-box-driven viewBox so the active tier (or whole
  // venue) is rendered fitted to the container like an SVG illustration.
  const fittedViewBox = useMemo(() => {
    const bw = venueProject.boundary_width || 800;
    const bh = venueProject.boundary_height || 600;
    const defaultPad = Math.max(bw, bh) * 0.02;
    const fullVB = {
      x: -(bw / 2) - defaultPad,
      y: -(bh / 2) - defaultPad,
      w: bw + defaultPad * 2,
      h: bh + defaultPad * 2,
    };

    if (!activeTicketId) return fullVB;
    const targets = sections.filter((s) => s.ticketId === activeTicketId);
    if (targets.length === 0) return fullVB;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    targets.forEach((sec) => {
      const x = sec.x || 0;
      const y = sec.y || 0;
      const w = (sec.width || sec.outerRadius ? (sec.outerRadius || 0) * 2 : sec.width) || 120;
      const h = (sec.height || sec.outerRadius ? (sec.outerRadius || 0) * 2 : sec.height) || 120;
      const sx = sec.scaleX || 1;
      const sy = sec.scaleY || 1;
      const halfW = (w * sx) / 2;
      const halfH = (h * sy) / 2;
      if (x - halfW < minX) minX = x - halfW;
      if (x + halfW > maxX) maxX = x + halfW;
      if (y - halfH < minY) minY = y - halfH;
      if (y + halfH > maxY) maxY = y + halfH;
    });
    if (!isFinite(minX)) return fullVB;

    const bbW = Math.max(50, maxX - minX);
    const bbH = Math.max(50, maxY - minY);
    // Generous padding so chips/legends don't overlap focused area
    const padX = bbW * 0.45;
    const padY = bbH * 0.55;
    return {
      x: minX - padX,
      y: minY - padY,
      w: bbW + padX * 2,
      h: bbH + padY * 2,
    };
  }, [activeTicketId, sections, venueProject.boundary_width, venueProject.boundary_height]);

  // REALTIME SYNC (Mocking WebSocket behavior across tabs)
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const mySessionId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("seat_locks_channel");
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, code, sessionId } = event.data;
        if (sessionId === mySessionId.current) return; // Ignore my own events

        if (type === "LOCK") {
          setLockedSeats((prev) => [...prev, code]);
        } else if (type === "UNLOCK") {
          setLockedSeats((prev) => prev.filter((c) => c !== code));
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Create a map of ticketId -> ticket details for quick lookup
  const ticketMap = useMemo(() => {
    const map: Record<string, any> = {};
    eventTickets.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [eventTickets]);

  const handleSeatClick = (
    code: string,
    section: Section,
    isBooked: boolean,
    isSelected: boolean,
    seatNum?: number,
    isGA?: boolean,
  ) => {
    if (isBooked || lockedSeats.includes(code)) return;

    if (isSelected) {
      onSeatDeselect(code);
      channelRef.current?.postMessage({ type: "UNLOCK", code, sessionId: mySessionId.current });
    } else {
      if (selectedSeats.length >= maxSelectable && maxSelectable > 0) {
        const removedCode = selectedSeats[0];
        onSeatDeselect(removedCode);
        channelRef.current?.postMessage({
          type: "UNLOCK",
          code: removedCode,
          sessionId: mySessionId.current,
        });
      }

      const ticketId = section.ticketId || "";
      const ticket = ticketMap[ticketId];

      onSeatSelect({
        code,
        sectionName: section.name,
        seatName: seatNum ? (isGA ? `GA ${seatNum}` : `Seat ${seatNum}`) : code,
        ticketId,
        cost: ticket ? ticket.cost : 0,
        type: ticket ? ticket.type : "Unmapped",
      });
      channelRef.current?.postMessage({ type: "LOCK", code, sessionId: mySessionId.current });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIntensity = 0.05;
    let newScale = zoomScale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
    newScale = Math.min(Math.max(0.5, newScale), 5);
    setZoomScale(newScale);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;

    if (!isDragging) {
      const dist = Math.hypot(
        e.clientX - pointerDownPos.current.x,
        e.clientY - pointerDownPos.current.y,
      );
      if (dist > 5) {
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        return;
      }
    }

    setPanPos({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDown.current = false;
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const viewBoxW = fittedViewBox.w;
  const viewBoxH = fittedViewBox.h;
  const viewBoxStr = `${fittedViewBox.x} ${fittedViewBox.y} ${viewBoxW} ${viewBoxH}`;

  const handleSectionAutoZoom = (sec: Section) => {
    if (activeTicketId && sec.ticketId !== activeTicketId) return;
    setActiveSectionForModal(sec);
  };

  if (activeSectionForModal) {
    const sec = activeSectionForModal;
    const pitch = sections.find((s) => s.shape === "pitch");

    const isGA = !sec.rows || sec.rows === 0 || !sec.cols || sec.cols === 0;

    const ticket = ticketMap[sec.ticketId || ""];
    const mappedSections = sections.filter((s) => s.ticketId === sec.ticketId);

    const tierTotalCapacity = ticket ? ticket.remaining + ticket.sold : sec.capacity || 0;
    const sectionCapacity =
      mappedSections.length > 0
        ? Math.floor(tierTotalCapacity / mappedSections.length)
        : isGA
          ? sec.capacity || 0
          : (sec.rows || 0) * (sec.cols || 0);

    const actualSeatCount = sectionCapacity;

    // On mobile, cap columns more aggressively so seats stay tappable.
    const colCap = isMobile ? 12 : 20;
    const cols = Math.min(colCap, Math.max(1, Math.ceil(Math.sqrt(actualSeatCount * 1.5))));

    const isDense = cols > (isMobile ? 8 : 10);
    const isVeryDense = cols > (isMobile ? 10 : 16);

    const totalCells = Math.ceil(actualSeatCount / cols) * cols;
    const maxRender = 3000;
    if (totalCells > maxRender) {
      return (
        <div className="w-full h-full relative bg-background rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card z-10 shadow-sm shrink-0">
            <div>
              <h2 className="text-xl font-bold">{sec.name} - Section Too Large</h2>
            </div>
            <button
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm"
              onClick={() => setActiveSectionForModal(null)}
            >
              Back to Map
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold mb-2">Section is too large to render visually</h3>
            <p className="text-muted-foreground mb-4">
              This section has {actualSeatCount} seats. Please break it down into smaller
              subsections in the venue builder to enable visual seat selection.
            </p>
          </div>
        </div>
      );
    }

    // Seat dimensions for SVG. Bumped up so seats stay legible & tappable
    // on mobile (Apple HIG minimum target ~44px).
    const size = isMobile
      ? isVeryDense
        ? 44
        : isDense
          ? 52
          : 60
      : isVeryDense
        ? 36
        : isDense
          ? 44
          : 54;
    const half = size / 2;
    const gapSize = isVeryDense
      ? "gap-1 sm:gap-1"
      : isDense
        ? "gap-1.5 sm:gap-1.5"
        : "gap-2 sm:gap-3";

    const gaBookedCount = isGA
      ? bookedSeats.filter(
          (c) =>
            c === `GA-${sec.id}` || c.startsWith(`${sec.id}-`) || c.startsWith(`GA-${sec.id}-`),
        ).length
      : 0;
    const remainingCount = Math.max(
      0,
      actualSeatCount -
        (isGA ? gaBookedCount : bookedSeats.filter((c) => c.startsWith(`${sec.id}-`)).length),
    );

    const seats = Array.from({ length: totalCells }).map((_, i) =>
      i < actualSeatCount ? i : null,
    );

    const rowsArray = [];
    for (let i = 0; i < seats.length; i += cols) {
      rowsArray.push(seats.slice(i, i + cols));
    }
    const visuallyOrderedSeats = rowsArray.reverse().flat();

    return (
      <div className="w-full h-full relative bg-background rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
        {/* Premium gradient header */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${sec.color || "#0ea5e9"}22, transparent 70%), linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-40" style={{
            background: `radial-gradient(circle at 20% 0%, ${sec.color || "#0ea5e9"}33, transparent 50%)`,
          }} />
          <div className="relative p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-border/40">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center text-white shadow-lg"
                style={{ background: sec.color || "#0ea5e9" }}
              >
                <MapIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                  {isGA ? "General Admission" : "Reserved Seating"}
                </p>
                <h2 className="text-lg sm:text-xl font-bold truncate">{sec.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ticket && (
                <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur border border-border/60">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">From</span>
                  <span className="text-sm font-bold text-primary leading-none">
                    {formatCurrency(ticket.cost, currency || "RWF")}
                  </span>
                </div>
              )}
              <button
                className="px-3 sm:px-4 py-2 bg-background hover:bg-secondary border border-border/60 text-foreground font-semibold rounded-xl transition-colors text-xs sm:text-sm shadow-sm flex items-center gap-1.5"
                onClick={() => setActiveSectionForModal(null)}
              >
                <X className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back to Map</span><span className="sm:hidden">Close</span>
              </button>
            </div>
          </div>
          {/* Capacity bar */}
          <div className="relative px-5 pb-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (remainingCount / Math.max(1, actualSeatCount)) * 100)}%`,
                  background: `linear-gradient(90deg, ${sec.color || "#0ea5e9"}, ${sec.color || "#0ea5e9"}aa)`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground tabular-nums">
              <span className="text-foreground">{remainingCount}</span> / {actualSeatCount} left
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 custom-scrollbar flex justify-center bg-gradient-to-b from-secondary/5 via-secondary/10 to-secondary/20 relative">
          <div className="flex flex-col gap-6 items-center w-full pb-24 pt-2 max-w-5xl">
            {/* Curved stage marker */}
            {!isGA && (
              <div className="w-full max-w-2xl flex flex-col items-center gap-1.5">
                <svg viewBox="0 0 400 40" className="w-full h-8" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="stageGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 35 Q 200 0 400 35" fill="none" stroke="url(#stageGrad)" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                  {pitch ? "Stage / Front" : "Screen / Stage"}
                </span>
              </div>
            )}

            <div
              className={`grid justify-center ${gapSize} w-full px-2`}
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, ${size}px))` }}
            >
              {visuallyOrderedSeats.map((i, index) => {
                if (i === null) return <div key={`empty-${index}`} />;

                const seatNum = i + 1;
                let code = "";

                if (isGA) {
                  code = `GA-${sec.id}-${seatNum}`;
                } else {
                  const originalCols = sec.cols || 1;
                  const originalRow = Math.floor(i / originalCols);
                  const originalCol = i % originalCols;
                  code = `${sec.id}-R${originalRow + 1}-C${originalCol + 1}`.replace(/\s+/g, "-");
                }

                const isBooked = isGA ? i < gaBookedCount : bookedSeats.includes(code);
                const isSelected = selectedSeats.includes(code);
                const isLockedByOther = lockedSeats.includes(code) && !isSelected;

                let bgColor = sec.color || "#0ea5e9";
                if (isBooked) bgColor = "rgba(128,128,128,0.3)";
                if (isSelected) bgColor = "var(--primary)";
                if (isLockedByOther) bgColor = "#fbbf24";

                return (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${size} ${size}`}
                      className={`transition-all duration-200 ${isBooked || isLockedByOther ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:-translate-y-0.5"} ${isSelected ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : !isBooked && !isLockedByOther ? "hover:brightness-125" : ""}`}
                      onClick={() => {
                        if (!isBooked && !isLockedByOther)
                          handleSeatClick(code, sec, isBooked, isSelected, seatNum, isGA);
                      }}
                    >
                      <title>
                        {isGA ? `Ticket ${seatNum}` : `Seat ${seatNum}`}
                        {isBooked ? " (Sold)" : isLockedByOther ? " (Locked by another user)" : ""}
                      </title>
                      <g transform={`translate(${half}, ${half})`}>
                        <path
                          d={`M ${-half * 0.7} ${half * 0.1} C ${-half * 0.7} ${-half * 0.8}, ${half * 0.7} ${-half * 0.8}, ${half * 0.7} ${half * 0.1}`}
                          fill="none"
                          stroke={bgColor}
                          strokeWidth={size * 0.15}
                          strokeLinecap="round"
                          opacity={0.6}
                        />
                        <circle
                          cx="0"
                          cy={size * 0.1}
                          r={size * 0.35}
                          fill={bgColor}
                          opacity={isBooked || isLockedByOther ? 0.4 : 1}
                        />
                        {isSelected && (
                          <circle
                            cx="0"
                            cy={size * 0.1}
                            r={size * 0.45}
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth={2}
                          />
                        )}
                        {isLockedByOther && (
                          <circle
                            cx="0"
                            cy={size * 0.1}
                            r={size * 0.45}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            strokeDasharray="2 2"
                            className="animate-[spin_4s_linear_infinite]"
                          />
                        )}
                        <text
                          x="0"
                          y={size * 0.1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#fff"
                          fontSize={size * 0.3}
                          fontWeight="bold"
                        >
                          {seatNum}
                        </text>
                      </g>
                    </svg>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-background rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
      {!hideLegend && (
        <>
          {/* Top-left header pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-lg">
            <div className="h-7 w-7 rounded-xl grid place-items-center bg-primary/10 text-primary">
              <MapIcon className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <p className="font-bold leading-tight">Tap a section</p>
              <p className="text-muted-foreground leading-tight text-[10px]">to pick your seats</p>
            </div>
          </div>

          {/* Bottom section legend dock */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-center pointer-events-none">
            <div className="pointer-events-auto max-w-full flex items-center gap-2 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-lg overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0 pr-3 mr-1 border-r border-border/60">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold whitespace-nowrap">
                  Sections
                </span>
              </div>
              {sections.filter((s) => s.shape !== "pitch" && s.ticketId).length === 0 && (
                <span className="text-xs text-muted-foreground px-2">No sections configured</span>
              )}
              {sections.map((s) => {
                if (s.shape === "pitch" || !s.ticketId) return null;
                const t = ticketMap[s.ticketId];
                const isFocused = activeTicketId && s.ticketId === activeTicketId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSectionAutoZoom(s)}
                    className={`shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                      isFocused
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border/60 hover:bg-secondary hover:border-border"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0 ring-2 ring-background"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs font-semibold truncate max-w-[110px]" title={s.name}>
                      {s.name}
                    </span>
                    {t && (
                      <span className="text-[10px] font-bold text-primary tabular-nums">
                        {formatCurrency(t.cost, currency || "RWF")}
                      </span>
                    )}
                  </button>
                );
              })}
              {maxSelectable > 0 && (
                <div className="shrink-0 ml-1 pl-3 border-l border-border/60 flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold tabular-nums">
                    {selectedSeats.length} / {maxSelectable}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Horizontal zoom dock */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-0.5 bg-card/95 backdrop-blur-xl border border-border/60 p-1 rounded-2xl shadow-lg">
        <button
          onClick={() => setZoomScale((s) => Math.min(s + 0.2, 5))}
          className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <span className="px-1.5 text-[10px] font-bold tabular-nums text-muted-foreground min-w-[2.5rem] text-center">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          onClick={() => setZoomScale((s) => Math.max(s - 0.2, 0.5))}
          className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-border/60 mx-0.5" />
        <button
          onClick={() => {
            setZoomScale(1);
            setPanPos({ x: 0, y: 0 });
          }}
          className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex-1 w-full h-full relative"
        style={{
          backgroundColor:
            venueProject.canvas_bg === "#ffffff"
              ? "transparent"
              : venueProject.canvas_bg || "transparent",
        }}
      >
        <svg
          viewBox={viewBoxStr}
          className={`w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} touch-none`}
          preserveAspectRatio="xMidYMid meet"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <g
            transform={`translate(${panPos.x * (viewBoxW / 800)}, ${panPos.y * (viewBoxH / 600)}) scale(${zoomScale})`}
          >
            {venueProject.boundary_shape &&
              venueProject.boundary_width &&
              venueProject.boundary_height && (
                <path
                  d={getBoundaryPath(
                    venueProject.boundary_shape,
                    venueProject.boundary_width,
                    venueProject.boundary_height,
                    venueProject.boundary_rx || 60,
                  )}
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(150,170,200,0.5)"
                  strokeWidth="3"
                />
              )}

            {sections.map((sec) => {
              if (sec.visible === false) return null;

              let d = "";
              if (sec.shape === "arc") {
                d = describeArc(
                  0,
                  0,
                  sec.innerRadius || 100,
                  sec.outerRadius || 150,
                  sec.startAngle || 0,
                  sec.endAngle || 90,
                );
              } else if (sec.shape === "polygon") {
                const pts = (sec.points || "").trim().split(/\s+/);
                if (pts.length > 0)
                  d =
                    `M ${pts[0].replace(",", " ")} ` +
                    pts
                      .slice(1)
                      .map((p) => `L ${p.replace(",", " ")}`)
                      .join(" ") +
                    " Z";
              } else if (sec.shape === "path") {
                d = sec.pathData || "";
              } else {
                const hw = (sec.width || 100) / 2;
                const hh = (sec.height || 50) / 2;
                d = `M ${-hw} ${-hh} L ${hw} ${-hh} L ${hw} ${hh} L ${-hw} ${hh} Z`;
              }

              // Generate Seats
              const seatsToRender = [];
              if (
                sec.rows > 0 &&
                sec.cols > 0 &&
                sec.shape !== "pitch" &&
                sec.rows * sec.cols <= 2000
              ) {
                if (sec.shape === "rect") {
                  const w = sec.width || 100;
                  const h = sec.height || 50;
                  const spX = w / sec.cols;
                  const spY = h / sec.rows;
                  const r = Math.min(spX, spY) * 0.35;

                  for (let row = 0; row < sec.rows; row++) {
                    for (let col = 0; col < sec.cols; col++) {
                      const cx = -w / 2 + (col + 0.5) * spX;
                      const cy = h / 2 - (row + 0.5) * spY;
                      const code = `${sec.id}-R${row + 1}-C${col + 1}`.replace(/\s+/g, "-");
                      seatsToRender.push({
                        cx,
                        cy,
                        r,
                        code,
                        num: row * sec.cols + col + 1,
                        rot: 0,
                      });
                    }
                  }
                } else if (sec.shape === "arc") {
                  const ir = sec.innerRadius || 100;
                  const or = sec.outerRadius || 150;
                  const sa = sec.startAngle || 0;
                  const ea = sec.endAngle || 90;
                  const r = ((or - ir) / sec.rows) * 0.35;

                  for (let row = 0; row < sec.rows; row++) {
                    for (let col = 0; col < sec.cols; col++) {
                      const rad = ir + (or - ir) * ((row + 0.5) / sec.rows);
                      const ang = sa + (ea - sa) * ((col + 0.5) / sec.cols);
                      const pos = polarToCartesian(0, 0, rad, ang);
                      const code = `${sec.id}-R${row + 1}-C${col + 1}`.replace(/\s+/g, "-");
                      seatsToRender.push({
                        cx: pos.x,
                        cy: pos.y,
                        r,
                        code,
                        num: row * sec.cols + col + 1,
                        rot: ang + 90,
                      });
                    }
                  }
                }
              }

              const isActive = !activeTicketId || sec.ticketId === activeTicketId;
              const isTarget = activeTicketId && sec.ticketId === activeTicketId;
              const baseScaleX = sec.scaleX || 1;
              const baseScaleY = sec.scaleY || 1;
              const popScale = isTarget ? 1.4 : 1;

              return (
                <g
                  key={sec.id}
                  transform={`translate(${sec.x || 0}, ${sec.y || 0}) rotate(${sec.rotation || 0}) scale(${baseScaleX * popScale}, ${baseScaleY * popScale})`}
                  style={{
                    opacity: isActive ? 1 : 0.2,
                    pointerEvents: isActive ? "auto" : "none",
                    cursor: sec.ticketId ? "pointer" : "default",
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Bouncy bubble effect
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionAutoZoom(sec);
                  }}
                >
                  {/* Background Shape */}
                  {sec.shape === "pitch" ? (
                    <PitchRenderer type={sec.pitchType || "none"} />
                  ) : (
                    <path
                      d={d}
                      fill={sec.color}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                      className={`transition-all duration-200 ${sec.ticketId ? "hover:opacity-50" : "opacity-20"} ${selectedSeats.includes(`GA-${sec.id}`) ? "opacity-60 ring-2 ring-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "opacity-20"}`}
                    >
                      <title>{sec.name}</title>
                    </path>
                  )}

                  {/* Draw Individual Seats */}
                  {seatsToRender.map((seat: any) => {
                    const isBooked = bookedSeats.includes(seat.code);
                    const isSelected = selectedSeats.includes(seat.code);

                    let fill = sec.color || "#333";
                    if (isBooked) fill = "rgba(128,128,128,0.3)";
                    if (isSelected) fill = "var(--primary)";

                    const size = seat.r * 2.5;
                    const half = size / 2;

                    return (
                      <g
                        key={seat.code}
                        transform={`translate(${seat.cx}, ${seat.cy}) rotate(${seat.rot || 0})`}
                        className={`transition-all duration-200 ${isBooked ? "opacity-50" : "hover:brightness-125"} ${isSelected ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : ""}`}
                      >
                        <title>{`Seat ${seat.num}${isBooked ? " (Sold)" : ""}`}</title>
                        {/* Chair base outline */}
                        <rect
                          x={-half}
                          y={-half}
                          width={size}
                          height={size}
                          rx={size * 0.2}
                          fill="rgba(0,0,0,0.15)"
                        />
                        {/* Chair Backrest */}
                        <path
                          d={`M ${-half + size * 0.1} ${-half + size * 0.15} Q 0 ${-half - size * 0.2} ${half - size * 0.1} ${-half + size * 0.15}`}
                          fill="none"
                          stroke={fill}
                          strokeWidth={size * 0.3}
                          strokeLinecap="round"
                        />
                        {/* Chair Cushion */}
                        <rect
                          x={-half + size * 0.15}
                          y={-half + size * 0.3}
                          width={size * 0.7}
                          height={size * 0.6}
                          rx={size * 0.15}
                          fill={fill}
                          opacity={isBooked ? 0.3 : 0.9}
                        />
                        {/* Selection Highlight */}
                        {isSelected && (
                          <rect
                            x={-half}
                            y={-half}
                            width={size}
                            height={size}
                            rx={size * 0.2}
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth={size * 0.15}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
