import React, { useMemo, useState, useRef } from "react";
import { Section, VenueTemplate } from "../venue-designer/types";
import { PitchRenderer } from "../venue-designer/PitchRenderer";
import { Info, Map as MapIcon, Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const [activeSectionForModal, setActiveSectionForModal] = useState<Section | null>(null);

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
  ) => {
    if (isBooked) return;

    if (isSelected) {
      onSeatDeselect(code);
    } else {
      if (selectedSeats.length >= maxSelectable && maxSelectable > 0) {
        // Automatically deselect the first selected seat if we reached the limit
        onSeatDeselect(selectedSeats[0]);
      }
      
      const ticketId = section.ticketId || "";
      const ticket = ticketMap[ticketId];
      
      onSeatSelect({
        code,
        sectionName: section.name,
        ticketId,
        cost: ticket ? ticket.cost : 0,
        type: ticket ? ticket.type : "Unmapped",
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    let newScale = zoomScale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
    newScale = Math.min(Math.max(0.5, newScale), 5);
    setZoomScale(newScale);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPanPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
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

    if (!sec.rows || sec.rows === 0) {
      // If it's a GA section with no individual seats to click, select the section
      const isSelected = selectedSeats.includes(`GA-${sec.id}`);
      handleSeatClick(`GA-${sec.id}`, sec, false, isSelected);
    } else {
      setActiveSectionForModal(sec);
    }
  };

  return (
    <div className="w-full h-[600px] relative bg-background rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
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
                    const code = `${sec.name}-R${row + 1}-C${col + 1}`.replace(/\s+/g, '-');
                    seatsToRender.push({ cx, cy, r, code });
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
                    const code = `${sec.name}-R${row + 1}-C${col + 1}`.replace(/\s+/g, '-');
                    seatsToRender.push({ cx: pos.x, cy: pos.y, r, code });
                  }
                }
              }
            }

            const isActive = !activeTicketId || sec.ticketId === activeTicketId;

            return (
              <g
                key={sec.id}
                transform={`translate(${sec.x || 0}, ${sec.y || 0}) rotate(${sec.rotation || 0}) scale(${sec.scaleX || 1}, ${sec.scaleY || 1})`}
                style={{ opacity: isActive ? 1 : 0.2, pointerEvents: isActive ? 'auto' : 'none' }}
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
                    className={`transition-all duration-200 ${sec.ticketId ? 'cursor-pointer hover:opacity-50' : 'opacity-20'} ${selectedSeats.includes(`GA-${sec.id}`) ? 'opacity-60 ring-2 ring-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'opacity-20'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectionAutoZoom(sec);
                    }}
                  >
                    <title>{sec.name}</title>
                  </path>
                )}

                {/* Draw Individual Seats */}
                {seatsToRender.map((seat) => {
                  const isBooked = bookedSeats.includes(seat.code);
                  const isSelected = selectedSeats.includes(seat.code);
                  
                  let fill = sec.color;
                  if (isBooked) fill = "rgba(128,128,128,0.3)";
                  if (isSelected) fill = "var(--primary)";

                  return (
                    <circle
                      key={seat.code}
                      cx={seat.cx}
                      cy={seat.cy}
                      r={seat.r}
                      fill={fill}
                      className={`transition-all duration-200 ${isBooked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-125'} ${isSelected ? 'ring-2 ring-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : ''}`}
                      onClick={() => handleSeatClick(seat.code, sec, isBooked, isSelected)}
                    >
                      <title>{`${seat.code}${isBooked ? ' (Sold)' : ''}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
          </g>
        </svg>
      </div>

      <Dialog open={!!activeSectionForModal} onOpenChange={(open) => !open && setActiveSectionForModal(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl xl:max-w-7xl border-border bg-card z-[110]">
          <DialogHeader>
            <DialogTitle>{activeSectionForModal?.name} - Select Seats</DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-6 bg-secondary/20 rounded-xl overflow-auto max-h-[80vh] flex justify-center items-center custom-scrollbar">
            {activeSectionForModal && (() => {
              const sec = activeSectionForModal;
              const pitch = sections.find((s) => s.shape === "pitch");
              
              const cols = sec.cols || 1;
              const isDense = cols > 12;
              const isVeryDense = cols > 20;

              const seatSize = isVeryDense 
                ? "w-6 h-6 sm:w-7 sm:h-7 text-[8px]" 
                : isDense 
                  ? "w-8 h-8 sm:w-9 sm:h-9 text-[9px]" 
                  : "w-10 h-10 sm:w-12 sm:h-12 text-[11px]";
                  
              const gapSize = isVeryDense ? "gap-0.5" : isDense ? "gap-1" : "gap-1.5 sm:gap-2";

              return (
                <div className="flex flex-col gap-6 items-center justify-center w-full min-w-max">
                  <div 
                    className={`grid justify-center ${gapSize}`} 
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
                  >
                    {Array.from({ length: (sec.rows || 0) * cols }).map((_, i) => {
                      const visualRow = Math.floor(i / cols);
                      const visualCol = i % cols;
                      
                      // Stage is at the bottom, so Row 1 is at the bottom of the visual grid
                      const rowLabel = (sec.rows || 1) - visualRow;
                      const colLabel = visualCol + 1;
                      const code = `${sec.name}-R${rowLabel}-C${colLabel}`.replace(/\s+/g, '-');
                      
                      const isBooked = bookedSeats.includes(code);
                      const isSelected = selectedSeats.includes(code);
                      
                      let bgColor = sec.color || "#0ea5e9";
                      if (isBooked) bgColor = "rgba(128,128,128,0.5)";
                      if (isSelected) bgColor = "var(--primary)";

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (!isBooked) handleSeatClick(code, sec, isBooked, isSelected);
                          }}
                          className={`${seatSize} rounded-t-xl rounded-b-sm flex flex-col items-center justify-center font-bold transition-all shadow-sm leading-none gap-0.5 ${isBooked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-110 hover:-translate-y-0.5'} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : ''}`}
                          style={{ backgroundColor: bgColor, color: "#fff" }}
                          title={`Row ${rowLabel}, Seat ${colLabel}${isBooked ? ' (Sold)' : ''}`}
                        >
                          {!isVeryDense && <span>R{rowLabel}</span>}
                          {!isVeryDense && <span className="opacity-90">S{colLabel}</span>}
                        </div>
                      );
                    })}
                    {(sec.rows === 0 || cols === 0) && (
                      <p className="text-sm text-muted-foreground text-center col-span-full">
                        No seats defined in this section.
                      </p>
                    )}
                  </div>

                  {pitch && (
                    <div className="bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold tracking-widest text-primary rounded-xl w-full max-w-md h-12 mt-4 shadow-sm">
                      <span>STAGE / FRONT</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
