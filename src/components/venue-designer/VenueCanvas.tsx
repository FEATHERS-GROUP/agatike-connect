import React, { useRef, useState, useCallback } from "react";
import { Seat, Section, VenueTemplate } from "./types";
import { PitchRenderer } from "./PitchRenderer";

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
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

export function VenueCanvas({
  venueName,
  eventName,
  template,
  sections,
  activeSection,
  setActiveSection,
  updateSection,
}: {
  venueName: string;
  eventName: string;
  template: VenueTemplate;
  sections: Section[];
  seats: Seat[];
  paintSeat: (id: string) => void;
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
  updateSection: (id: string, patch: Partial<Section>) => void;
}) {
  const stageWidth = template.stageWidth || 200;
  const stageHeight = template.stageHeight || 100;
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialSectionPos, setInitialSectionPos] = useState({ x: 0, y: 0 });

  // Convert screen coordinates to SVG viewBox coordinates
  const getSvgCoordinates = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, section: Section) => {
    e.stopPropagation();
    setActiveSection(section.id);
    const coords = getSvgCoordinates(e as any);
    setDraggingSectionId(section.id);
    setDragStartPos(coords);
    setInitialSectionPos({ x: section.x, y: section.y });
    
    // Capture pointer to ensure smooth drag outside boundaries
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingSectionId) return;
    
    const coords = getSvgCoordinates(e);
    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;
    
    // Snap to grid (10px increments)
    const newX = Math.round((initialSectionPos.x + dx) / 10) * 10;
    const newY = Math.round((initialSectionPos.y + dy) / 10) * 10;

    updateSection(draggingSectionId, { x: newX, y: newY });
  }, [draggingSectionId, dragStartPos, initialSectionPos, updateSection]);

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingSectionId) {
      setDraggingSectionId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[#0a0a0a] p-6 shadow-2xl h-full flex flex-col">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.accent.DEFAULT/15),transparent_60%)] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {venueName}
          </p>
          <h3 className="text-xl font-bold text-white shadow-black drop-shadow-md">{eventName}</h3>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative mt-12 w-full flex-1 overflow-hidden bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] rounded-xl border border-white/5">
        
        <svg 
          ref={svgRef}
          viewBox="-560 -480 1120 960" 
          className="w-full h-full cursor-crosshair select-none touch-none"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={() => setActiveSection(null)}
        >
          {/* Arena Outer Boundary Wall */}
          {template.boundaryWidth && template.boundaryHeight && (
            <>
              {/* Outer shadow/glow */}
              <rect
                x={-template.boundaryWidth / 2 - 4}
                y={-template.boundaryHeight / 2 - 4}
                width={template.boundaryWidth + 8}
                height={template.boundaryHeight + 8}
                rx={(template.boundaryRx || 60) + 4}
                fill="none"
                stroke="rgba(100,120,150,0.15)"
                strokeWidth="12"
              />
              {/* Main boundary wall */}
              <rect
                x={-template.boundaryWidth / 2}
                y={-template.boundaryHeight / 2}
                width={template.boundaryWidth}
                height={template.boundaryHeight}
                rx={template.boundaryRx || 60}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(150,170,200,0.5)"
                strokeWidth="3"
              />
            </>
          )}

          {/* Stage / Court / Focal Point */}
          {template.pitchType && template.pitchType !== "none" ? (
            <PitchRenderer type={template.pitchType} />
          ) : template.stageWidth && template.stageHeight ? (
            <g>
              <rect
                x={-template.stageWidth / 2}
                y={-template.stageHeight / 2}
                width={template.stageWidth}
                height={template.stageHeight}
                rx={template.stageWidth > 200 ? 12 : 8}
                fill="#1a7a4a"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="3"
              />
              <line x1={0} y1={-template.stageHeight/2 + 8} x2={0} y2={template.stageHeight/2 - 8} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <circle cx={0} cy={0} r={28} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <text
                x="0"
                y="0"
                fill="rgba(255,255,255,0.0)"
                fontSize="1"
                textAnchor="middle"
                pointerEvents="none"
              >
                {template.stageLabel}
              </text>
            </g>
          ) : null}

          {/* Sections */}
          {sections.map((sec) => {
            if (sec.visible === false) return null;
            const isActive = activeSection === sec.id;
            const isDragging = draggingSectionId === sec.id;
            
            // Generate Path Data
            let d = "";
            let textX = sec.x;
            let textY = sec.y;

            if (sec.shape === "arc") {
              const ir = sec.innerRadius || 100;
              const or = sec.outerRadius || 150;
              const sa = sec.startAngle || 0;
              const ea = sec.endAngle || 90;
              d = describeArc(0, 0, ir, or, sa, ea); // Centered at 0,0 for translation
              
              const midAngle = sa + (ea - sa) / 2;
              const midRadius = ir + (or - ir) / 2;
              const pos = polarToCartesian(0, 0, midRadius, midAngle);
              textX = pos.x;
              textY = pos.y;
            } else if (sec.shape === "polygon") {
              const pts = (sec.points || "").trim().split(/\s+/);
              if (pts.length > 0) {
                d = `M ${pts[0].replace(',', ' ')} ` + pts.slice(1).map(p => `L ${p.replace(',', ' ')}`).join(' ') + ' Z';
              }
              textX = 0;
              textY = 0;
            } else if (sec.shape === "path") {
              d = sec.pathData || "";
              textX = 0;
              textY = 0;
            } else {
              const w = sec.width || 100;
              const h = sec.height || 50;
              const hw = w / 2;
              const hh = h / 2;
              // Rect centered at 0,0 (will be translated later)
              d = `M ${-hw} ${-hh} L ${hw} ${-hh} L ${hw} ${hh} L ${-hw} ${hh} Z`;
              // Text remains at 0,0 inside the group
              textX = 0; 
              textY = 0;
            }

            return (
              <g
                key={sec.id}
                id={sec.id}
                className="venue-section"
                transform={`translate(${sec.x}, ${sec.y}) rotate(${sec.rotation || 0})`}
                onPointerDown={(e) => handlePointerDown(e, sec)}
                style={{
                  transformOrigin: `0px 0px`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                {/* Glow effect for active section */}
                {isActive && (
                  <path
                    d={d}
                    fill="none"
                    stroke={sec.color}
                    strokeWidth="8"
                    opacity="0.5"
                    filter="blur(4px)"
                  />
                )}
                
                {/* Main Shape */}
                <path
                  d={d}
                  fill={sec.color}
                  stroke={isActive ? "#ffffff" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isActive ? "3" : "1"}
                  className={`transition-all duration-100 ${isActive ? 'brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'hover:brightness-125 opacity-90'}`}
                />
                
                {/* Section Name Text */}
                <text
                  x={textX}
                  y={textY}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  pointerEvents="none"
                  className="drop-shadow-md"
                  transform={
                    sec.shape === "arc" 
                      ? (() => {
                          const midAngle = (sec.startAngle || 0) + ((sec.endAngle || 90) - (sec.startAngle || 0)) / 2;
                          let rotateAngle = midAngle;
                          // Flip text if it's upside down (bottom half of circle)
                          if (rotateAngle > 90 && rotateAngle < 270) {
                            rotateAngle += 180;
                          }
                          return `rotate(${rotateAngle}, ${textX}, ${textY})`;
                        })()
                      : ""
                  }
                >
                  {sec.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
