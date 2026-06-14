import React, { useMemo, useState, useRef, useEffect } from "react";
import { Section, VenueTemplate } from "../venue-designer/types";
import { PitchRenderer } from "../venue-designer/PitchRenderer";
import { Info, Map as MapIcon, Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
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
    "M", start.x, start.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
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
  onSeatSelect: (seat: { code: string; sectionName: string; ticketId: string; cost: number; type: string }) => void;
  onSeatDeselect: (code: string) => void;
  maxSelectable: number;
  currency?: string;
  activeTicketId?: string;
  hideLegend?: boolean;
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
}: VenueSeatSelectorProps) {
  const sections: Section[] = venueProject.sections_data || [];
  
  const isMobile = useIsMobile();

  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const [activeSectionForModal, setActiveSectionForModal] = useState<Section | null>(null);

  useEffect(() => {
    if (activeTicketId && sections.length > 0) {
      const targetSections = sections.filter(s => s.ticketId === activeTicketId);
      if (targetSections.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        targetSections.forEach(sec => {
          const x = sec.x || 0;
          const y = sec.y || 0;
          const w = sec.w || 100;
          const h = sec.h || 100;
          if (x - w / 2 < minX) minX = x - w / 2;
          if (x + w / 2 > maxX) maxX = x + w / 2;
          if (y - h / 2 < minY) minY = y - h / 2;
          if (y + h / 2 > maxY) maxY = y + h / 2;
        });

        if (minX !== Infinity) {
          const bbW = maxX - minX;
          const bbH = maxY - minY;
          const cx = minX + bbW / 2;
          const cy = minY + bbH / 2;
          
          const bw = venueProject.boundary_width || 800;
          const bh = venueProject.boundary_height || 600;
          const padding = Math.max(bw, bh) * 0.02;
          const viewBoxW = bw + padding * 2;
          const viewBoxH = bh + padding * 2;

          const scaleX = viewBoxW / (bbW * 1.5);
          const scaleY = viewBoxH / (bbH * 1.5);
          let targetScale = Math.min(scaleX, scaleY);
          
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          if (isMobile) {
            targetScale *= 1.4; // Zoom a bit more aggressively on small screens
          }
          
          targetScale = Math.max(1, Math.min(targetScale, 4));
          
          const targetPanX = (-cx * targetScale) / (viewBoxW / 800);
          const targetPanY = (-cy * targetScale) / (viewBoxH / 600);

          setZoomScale(targetScale);
          setPanPos({ x: targetPanX, y: targetPanY });
          return;
        }
      }
    }
    
    // Default fallback
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setZoomScale(1.5);
      } else {
        setZoomScale(1);
      }
    }
    setPanPos({ x: 0, y: 0 });
  }, [activeTicketId, sections, venueProject]);

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
    eventTickets.forEach(t => {
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
    isGA?: boolean
  ) => {
    if (isBooked || lockedSeats.includes(code)) return;

    if (isSelected) {
      onSeatDeselect(code);
      channelRef.current?.postMessage({ type: "UNLOCK", code, sessionId: mySessionId.current });
    } else {
      if (selectedSeats.length >= maxSelectable && maxSelectable > 0) {
        const removedCode = selectedSeats[0];
        onSeatDeselect(removedCode);
        channelRef.current?.postMessage({ type: "UNLOCK", code: removedCode, sessionId: mySessionId.current });
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
    // Cannot prevent default on passive event listeners in React by default.
    const zoomIntensity = 0.05;
    let newScale = zoomScale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
    newScale = Math.min(Math.max(0.5, newScale), 5);
    setZoomScale(newScale);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPanPos({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const bw = venueProject.boundary_width || 800;
  const bh = venueProject.boundary_height || 600;
  const padding = Math.max(bw, bh) * 0.02; // Reduced padding to 2%
  const viewBoxW = bw + padding * 2;
  const viewBoxH = bh + padding * 2;
  const viewBoxStr = `${-(bw / 2) - padding} ${-(bh / 2) - padding} ${viewBoxW} ${viewBoxH}`;

  const handleSectionAutoZoom = (sec: Section) => {
    if (activeTicketId && sec.ticketId !== activeTicketId) return;
    setActiveSectionForModal(sec);
  };

  return (
    <div className="w-full h-full relative bg-background rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
      {!hideLegend && (
        <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-md border p-3 rounded-xl shadow-lg w-64 text-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <MapIcon className="h-4 w-4 text-primary" /> Legend
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background"></div>
              <span className="text-xs">Your Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
              <span className="text-xs">Unavailable / Sold</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground font-medium mb-2">Ticket Sections</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {sections.map(s => {
                if (s.shape === "pitch" || !s.ticketId) return null;
                const t = ticketMap[s.ticketId];
                return (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                      <span className="text-xs truncate max-w-[100px]" title={s.name}>{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold">{t ? formatCurrency(t.cost, currency || "RWF") : '-'}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-2 text-xs text-center text-muted-foreground">
            Selected: {selectedSeats.length} / {maxSelectable || "∞"}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-card/90 backdrop-blur-md border border-border p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setZoomScale(s => Math.min(s + 0.2, 5))}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomScale(s => Math.max(s - 0.2, 0.5))}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setZoomScale(1); setPanPos({ x: 0, y: 0 }); }}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Reset View"
        >
          <MapIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative" style={{ backgroundColor: venueProject.canvas_bg === '#ffffff' ? 'transparent' : (venueProject.canvas_bg || 'transparent') }}>
        <svg
          viewBox={viewBoxStr}
          className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
          preserveAspectRatio="xMidYMid meet"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <g transform={`translate(${panPos.x * (viewBoxW / 800)}, ${panPos.y * (viewBoxH / 600)}) scale(${zoomScale})`}>
          {venueProject.boundary_shape && venueProject.boundary_width && venueProject.boundary_height && (
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
              d = describeArc(0, 0, sec.innerRadius || 100, sec.outerRadius || 150, sec.startAngle || 0, sec.endAngle || 90);
            } else if (sec.shape === "polygon") {
              const pts = (sec.points || "").trim().split(/\s+/);
              if (pts.length > 0) d = `M ${pts[0].replace(",", " ")} ` + pts.slice(1).map((p) => `L ${p.replace(",", " ")}`).join(" ") + " Z";
            } else if (sec.shape === "path") {
              d = sec.pathData || "";
            } else {
              const hw = (sec.width || 100) / 2;
              const hh = (sec.height || 50) / 2;
              d = `M ${-hw} ${-hh} L ${hw} ${-hh} L ${hw} ${hh} L ${-hw} ${hh} Z`;
            }

            // Generate Seats
            const seatsToRender = [];
            if (sec.rows > 0 && sec.cols > 0 && sec.shape !== "pitch") {
              if (sec.shape === "rect") {
                const w = sec.width || 100;
                const h = sec.height || 50;
                const spX = w / sec.cols;
                const spY = h / sec.rows;
                const r = Math.min(spX, spY) * 0.35;

                for (let row = 0; row < sec.rows; row++) {
                  for (let col = 0; col < sec.cols; col++) {
                    const cx = -w / 2 + (col + 0.5) * spX;
                    const cy = -h / 2 + (row + 0.5) * spY;
                    const code = `${sec.id}-R${row + 1}-C${col + 1}`.replace(/\s+/g, '-');
                    seatsToRender.push({ cx, cy, r, code, num: row * sec.cols + col + 1, rot: 0 });
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
                    const code = `${sec.id}-R${row + 1}-C${col + 1}`.replace(/\s+/g, '-');
                    seatsToRender.push({ cx: pos.x, cy: pos.y, r, code, num: row * sec.cols + col + 1, rot: ang + 90 });
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
                  pointerEvents: isActive ? 'auto' : 'none', 
                  cursor: sec.ticketId ? 'pointer' : 'default',
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" // Bouncy bubble effect
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
                    className={`transition-all duration-200 ${sec.ticketId ? 'hover:opacity-50' : 'opacity-20'} ${selectedSeats.includes(`GA-${sec.id}`) ? 'opacity-60 ring-2 ring-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'opacity-20'}`}
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
                      className={`transition-all duration-200 ${isBooked ? 'opacity-50' : 'hover:brightness-125'} ${isSelected ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : ''}`}
                    >
                      <title>{`Seat ${seat.num}${isBooked ? ' (Sold)' : ''}`}</title>
                      {/* Chair base outline */}
                      <rect 
                        x={-half} y={-half} 
                        width={size} height={size} 
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
                        x={-half + size * 0.15} y={-half + size * 0.3} 
                        width={size * 0.7} height={size * 0.6} 
                        rx={size * 0.15} 
                        fill={fill} 
                        opacity={isBooked ? 0.3 : 0.9}
                      />
                      {/* Selection Highlight */}
                      {isSelected && (
                        <rect 
                          x={-half} y={-half} 
                          width={size} height={size} 
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

      {isMobile ? (
        <Drawer open={!!activeSectionForModal} onOpenChange={(open) => !open && setActiveSectionForModal(null)}>
          <DrawerContent className="max-h-[90vh] bg-card border-border px-1 pb-safe">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-center">{activeSectionForModal?.name} - Select Seats</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 bg-secondary/20 overflow-auto flex justify-center custom-scrollbar w-full">
              {activeSectionForModal && (() => {
                const sec = activeSectionForModal;
                const pitch = sections.find((s) => s.shape === "pitch");
                
                const isGA = !sec.rows || sec.rows === 0 || !sec.cols || sec.cols === 0;

                const ticket = ticketMap[sec.ticketId || ""];
                const mappedSections = sections.filter(s => s.ticketId === sec.ticketId);
                
                const tierTotalCapacity = ticket ? (ticket.remaining + ticket.sold) : (sec.capacity || 0);
                const sectionCapacity = mappedSections.length > 0 
                  ? Math.floor(tierTotalCapacity / mappedSections.length) 
                  : (isGA ? (sec.capacity || 0) : (sec.rows || 0) * (sec.cols || 0));

                const actualSeatCount = sectionCapacity;

                const cols = Math.min(20, Math.max(1, Math.ceil(Math.sqrt(actualSeatCount * 1.5))));
                
                const isDense = cols > 10;
                const isVeryDense = cols > 16;

                // Seat dimensions for SVG
                const size = isVeryDense ? 32 : isDense ? 40 : 50;
                const half = size / 2;
                const gapSize = isVeryDense ? "gap-1" : isDense ? "gap-1.5" : "gap-2 sm:gap-3";

                const gaBookedCount = isGA ? bookedSeats.filter(c => c === `GA-${sec.id}` || c.startsWith(`${sec.id}-`) || c.startsWith(`GA-${sec.id}-`)).length : 0;
                const remainingCount = Math.max(0, actualSeatCount - (isGA ? gaBookedCount : bookedSeats.filter(c => c.startsWith(`${sec.id}-`)).length));

                const totalCells = Math.ceil(actualSeatCount / cols) * cols;
                const seats = Array.from({ length: totalCells }).map((_, i) => i < actualSeatCount ? i : null);
                
                const rowsArray = [];
                for (let i = 0; i < seats.length; i += cols) {
                  rowsArray.push(seats.slice(i, i + cols));
                }
                const visuallyOrderedSeats = rowsArray.reverse().flat();

                return (
                  <div className="flex flex-col gap-6 items-center justify-center w-full min-w-max pb-8">
                    <div className="flex flex-col items-center gap-1 mb-2">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {isGA ? "General Admission" : "Reserved Seating"}
                      </span>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                        {remainingCount} Seats Available
                      </span>
                    </div>
                    
                    <div 
                      className={`grid justify-center ${gapSize}`} 
                      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
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
                          code = `${sec.id}-R${originalRow + 1}-C${originalCol + 1}`.replace(/\s+/g, '-');
                        }
                        
                        const isBooked = isGA ? (i < gaBookedCount) : bookedSeats.includes(code);
                        const isSelected = selectedSeats.includes(code);
                        const isLockedByOther = lockedSeats.includes(code) && !isSelected;
                        
                        let bgColor = sec.color || "#0ea5e9";
                        if (isBooked) bgColor = "rgba(128,128,128,0.3)";
                        if (isSelected) bgColor = "var(--primary)";
                        if (isLockedByOther) bgColor = "#fbbf24"; // Amber color for locked

                        return (
                          <svg
                            key={i}
                            width={size}
                            height={size}
                            viewBox={`0 0 ${size} ${size}`}
                            className={`transition-all duration-200 ${isBooked || isLockedByOther ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-0.5'} ${isSelected ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : (!isBooked && !isLockedByOther) ? 'hover:brightness-125' : ''}`}
                            onClick={() => {
                              if (!isBooked && !isLockedByOther) handleSeatClick(code, sec, isBooked, isSelected, seatNum, isGA);
                            }}
                          >
                            <title>{isGA ? `Ticket ${seatNum}` : `Seat ${seatNum}`}{isBooked ? ' (Sold)' : isLockedByOther ? ' (Locked by another user)' : ''}</title>
                            <g transform={`translate(${half}, ${half})`}>
                              {/* Chair Backrest */}
                              <path 
                                d={`M ${-half * 0.7} ${half * 0.1} C ${-half * 0.7} ${-half * 0.8}, ${half * 0.7} ${-half * 0.8}, ${half * 0.7} ${half * 0.1}`} 
                                fill="none" 
                                stroke={bgColor} 
                                strokeWidth={size * 0.15} 
                                strokeLinecap="round" 
                                opacity={0.6} 
                              />
                              {/* Chair Cushion */}
                              <circle cx="0" cy={size * 0.1} r={size * 0.35} fill={bgColor} opacity={isBooked || isLockedByOther ? 0.4 : 1} />
                              
                              {/* Selection Highlight */}
                              {isSelected && <circle cx="0" cy={size * 0.1} r={size * 0.45} fill="none" stroke="var(--primary)" strokeWidth={2} />}
                              {isLockedByOther && <circle cx="0" cy={size * 0.1} r={size * 0.45} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="2 2" className="animate-[spin_4s_linear_infinite]" />}
                              
                              {/* Seat Number */}
                              {!isVeryDense && (
                                <text x="0" y={size * 0.1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={size * 0.3} fontWeight="bold">
                                  {seatNum}
                                </text>
                              )}
                            </g>
                          </svg>
                        );
                      })}
                    </div>

                    {pitch && !isGA && (
                      <div className="bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold tracking-widest text-primary rounded-xl w-full max-w-md h-12 mt-4 shadow-sm">
                         <span>STAGE / FRONT</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        activeSectionForModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-card/95 backdrop-blur-md animate-in fade-in duration-200">
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-background z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">{activeSectionForModal.name} - Select Seats</h2>
                <p className="text-sm text-muted-foreground">Click the seats you want to book.</p>
              </div>
              <button 
                className="px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setActiveSectionForModal(null)}
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 p-4 md:p-8 overflow-auto flex justify-center items-center custom-scrollbar">
              {(() => {
                const sec = activeSectionForModal;
                const pitch = sections.find((s) => s.shape === "pitch");
                
                const isGA = !sec.rows || sec.rows === 0 || !sec.cols || sec.cols === 0;

                const ticket = ticketMap[sec.ticketId || ""];
                const mappedSections = sections.filter(s => s.ticketId === sec.ticketId);
                
                const tierTotalCapacity = ticket ? (ticket.remaining + ticket.sold) : (sec.capacity || 0);
                const sectionCapacity = mappedSections.length > 0 
                  ? Math.floor(tierTotalCapacity / mappedSections.length) 
                  : (isGA ? (sec.capacity || 0) : (sec.rows || 0) * (sec.cols || 0));

                const actualSeatCount = sectionCapacity;

                const cols = Math.min(20, Math.max(1, Math.ceil(Math.sqrt(actualSeatCount * 1.5))));
                
                const isDense = cols > 10;
                const isVeryDense = cols > 16;

                // Seat dimensions for SVG
                const size = isVeryDense ? 32 : isDense ? 40 : 50;
                const half = size / 2;
                const gapSize = isVeryDense ? "gap-1" : isDense ? "gap-1.5" : "gap-2 sm:gap-3";

                const gaBookedCount = isGA ? bookedSeats.filter(c => c === `GA-${sec.id}` || c.startsWith(`${sec.id}-`) || c.startsWith(`GA-${sec.id}-`)).length : 0;
                const remainingCount = Math.max(0, actualSeatCount - (isGA ? gaBookedCount : bookedSeats.filter(c => c.startsWith(`${sec.id}-`)).length));

                const totalCells = Math.ceil(actualSeatCount / cols) * cols;
                const seats = Array.from({ length: totalCells }).map((_, i) => i < actualSeatCount ? i : null);
                
                const rowsArray = [];
                for (let i = 0; i < seats.length; i += cols) {
                  rowsArray.push(seats.slice(i, i + cols));
                }
                const visuallyOrderedSeats = rowsArray.reverse().flat();

                return (
                  <div className="flex flex-col gap-6 items-center justify-center w-full min-w-max pb-4">
                    <div className="flex flex-col items-center gap-1 mb-4">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {isGA ? "General Admission" : "Reserved Seating"}
                      </span>
                      <span className="text-xl font-bold text-primary bg-primary/10 px-5 py-2 rounded-full">
                        {remainingCount} Seats Available
                      </span>
                    </div>
                    
                    <div 
                      className={`grid justify-center ${gapSize} bg-secondary/10 p-6 rounded-2xl`} 
                      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
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
                          code = `${sec.id}-R${originalRow + 1}-C${originalCol + 1}`.replace(/\s+/g, '-');
                        }
                        
                        const isBooked = isGA ? (i < gaBookedCount) : bookedSeats.includes(code);
                        const isSelected = selectedSeats.includes(code);
                        const isLockedByOther = lockedSeats.includes(code) && !isSelected;
                        
                        let bgColor = sec.color || "#0ea5e9";
                        if (isBooked) bgColor = "rgba(128,128,128,0.3)";
                        if (isSelected) bgColor = "var(--primary)";
                        if (isLockedByOther) bgColor = "#fbbf24"; // Amber color for locked

                        return (
                          <svg
                            key={i}
                            width={size}
                            height={size}
                            viewBox={`0 0 ${size} ${size}`}
                            className={`transition-all duration-200 ${isBooked || isLockedByOther ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-0.5'} ${isSelected ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : (!isBooked && !isLockedByOther) ? 'hover:brightness-125' : ''}`}
                            onClick={() => {
                              if (!isBooked && !isLockedByOther) handleSeatClick(code, sec, isBooked, isSelected, seatNum, isGA);
                            }}
                          >
                            <title>{isGA ? `Ticket ${seatNum}` : `Seat ${seatNum}`}{isBooked ? ' (Sold)' : isLockedByOther ? ' (Locked by another user)' : ''}</title>
                            <g transform={`translate(${half}, ${half})`}>
                              {/* Chair Backrest */}
                              <path 
                                d={`M ${-half * 0.7} ${half * 0.1} C ${-half * 0.7} ${-half * 0.8}, ${half * 0.7} ${-half * 0.8}, ${half * 0.7} ${half * 0.1}`} 
                                fill="none" 
                                stroke={bgColor} 
                                strokeWidth={size * 0.15} 
                                strokeLinecap="round" 
                                opacity={0.6} 
                              />
                              {/* Chair Cushion */}
                              <circle cx="0" cy={size * 0.1} r={size * 0.35} fill={bgColor} opacity={isBooked || isLockedByOther ? 0.4 : 1} />
                              
                              {/* Selection Highlight */}
                              {isSelected && <circle cx="0" cy={size * 0.1} r={size * 0.45} fill="none" stroke="var(--primary)" strokeWidth={2} />}
                              {isLockedByOther && <circle cx="0" cy={size * 0.1} r={size * 0.45} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="2 2" className="animate-[spin_4s_linear_infinite]" />}
                              
                              {/* Seat Number */}
                              {!isVeryDense && (
                                <text x="0" y={size * 0.1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={size * 0.3} fontWeight="bold">
                                  {seatNum}
                                </text>
                              )}
                            </g>
                          </svg>
                        );
                      })}
                    </div>

                    {pitch && !isGA && (
                      <div className="bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold tracking-widest text-primary rounded-xl w-full max-w-md h-12 mt-4 shadow-sm">
                         <span>STAGE / FRONT</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )
      )}
    </div>
  );
}
