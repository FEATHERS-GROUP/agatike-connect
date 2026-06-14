import React, { useRef, useState, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Seat, Section, VenueTemplate } from "./types";
import { PitchRenderer } from "./PitchRenderer";

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
  if (shape === "diamond") {
    return `M 0 ${-hh} L ${hw} 0 L 0 ${hh} L ${-hw} 0 Z`;
  }
  if (shape === "hexagon") {
    const q = hw * 0.5;
    return `M ${-q} ${-hh} L ${q} ${-hh} L ${hw} 0 L ${q} ${hh} L ${-q} ${hh} L ${-hw} 0 Z`;
  }
  if (shape === "octagon") {
    const qx = hw * 0.4;
    const qy = hh * 0.4;
    return `M ${-qx} ${-hh} L ${qx} ${-hh} L ${hw} ${-qy} L ${hw} ${qy} L ${qx} ${hh} L ${-qx} ${hh} L ${-hw} ${qy} L ${-hw} ${-qy} Z`;
  }
  if (shape === "d_shape") {
    return `M ${-hw} ${hh} L ${hw} ${hh} L ${hw} 0 A ${hw} ${hh} 0 0 0 ${-hw} 0 Z`;
  }
  if (shape === "horseshoe") {
    return `M ${-hw} ${-hh} L ${-hw} 0 A ${hw} ${hh} 0 0 0 ${hw} 0 L ${hw} ${-hh} Z`;
  }

  // Default: rounded rect
  return `M ${-hw + rx} ${-hh} L ${hw - rx} ${-hh} Q ${hw} ${-hh} ${hw} ${-hh + rx} L ${hw} ${hh - rx} Q ${hw} ${hh} ${hw - rx} ${hh} L ${-hw + rx} ${hh} Q ${-hw} ${hh} ${-hw} ${hh - rx} L ${-hw} ${-hh + rx} Q ${-hw} ${-hh} ${-hw + rx} ${-hh} Z`;
}

export function VenueCanvas({
  venueName,
  eventName,
  template,
  sections,
  activeSection,
  setActiveSection,
  updateSection,
  saveHistory,
  canvasBg,
  removeSection,
  duplicateSection,
  addSection,
  toolMode,
  setToolMode,
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
  saveHistory: () => void;
  canvasBg: string;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  addSection: (shape: any, type?: any, customPoints?: any, customPathData?: any, pitchType?: any, config?: any) => void;
  toolMode: "select" | "draw" | "text";
  setToolMode: (m: "select" | "draw" | "text") => void;
}) {
  const stageWidth = template.stageWidth || 200;
  const stageHeight = template.stageHeight || 100;

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);
  const [rotatingSectionId, setRotatingSectionId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialSectionPos, setInitialSectionPos] = useState({ x: 0, y: 0 });
  const [initialSectionSize, setInitialSectionSize] = useState<{ w: number; h: number; points?: string }>({ w: 0, h: 0 });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sectionId: string;
  } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [zoom, setZoom] = useState(1);

  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  const finishDrawing = useCallback(() => {
    if (drawingPoints.length < 3) {
      setDrawingPoints([]);
      setToolMode("select");
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    drawingPoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    const cx = minX + (maxX - minX) / 2;
    const cy = minY + (maxY - minY) / 2;
    const width = Math.max(20, maxX - minX);
    const height = Math.max(20, maxY - minY);

    const normalizedPoints = drawingPoints
      .map(p => `${Math.round(p.x - cx)},${Math.round(p.y - cy)}`)
      .join(" ");

    addSection("polygon", "reserved", normalizedPoints, undefined, undefined, { x: cx, y: cy, width, height });

    setDrawingPoints([]);
    setToolMode("select");
  }, [drawingPoints, addSection, setToolMode]);

  useEffect(() => {
    if (toolMode !== "draw") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") finishDrawing();
      else if (e.key === "Escape") {
        setDrawingPoints([]);
        setToolMode("select");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toolMode, finishDrawing]);

  // Close context menu on outside click
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  // Handle native wheel (scroll/trackpad) and multi-touch (tablet pinch) zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // prevent browser zoom/scroll
      // e.ctrlKey is true for pinch gestures on Mac trackpads
      const sensitivity = e.ctrlKey ? 0.01 : 0.002;
      setZoom((z) => Math.max(0.25, Math.min(3, z - e.deltaY * sensitivity)));
    };

    let initialDist = 0;
    let initialZoom = 1;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // prevent default browser pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDist = Math.sqrt(dx * dx + dy * dy);
        setZoom((z) => {
          initialZoom = z;
          return z;
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / initialDist;
        setZoom(Math.max(0.25, Math.min(3, initialZoom * scale)));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Convert screen coordinates to SVG viewBox coordinates
  const getSvgCoordinates = (event: React.PointerEvent<SVGSVGElement> | React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - CTM.e) / CTM.a) / zoom,
      y: ((event.clientY - CTM.f) / CTM.d) / zoom,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, section: Section) => {
    if (toolMode === "draw") return;
    e.stopPropagation();
    saveHistory(); // Save history before drag starts
    setActiveSection(section.id);
    const coords = getSvgCoordinates(e as any);
    setDraggingSectionId(section.id);
    setDragStartPos(coords);
    setInitialSectionPos({ x: section.x, y: section.y });

    // Capture pointer to ensure smooth drag outside boundaries
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleResizePointerDown = (e: React.PointerEvent<SVGCircleElement>, section: Section) => {
    if (toolMode === "draw") return;
    e.stopPropagation();
    saveHistory();
    setActiveSection(section.id);
    const coords = getSvgCoordinates(e as any);
    setResizingSectionId(section.id);
    setDragStartPos(coords);
    setInitialSectionSize({ w: section.width || 100, h: section.height || 50, points: section.points });

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleRotatePointerDown = (e: React.PointerEvent<SVGCircleElement>, section: Section) => {
    if (toolMode === "draw") return;
    e.stopPropagation();
    saveHistory();
    setActiveSection(section.id);
    setRotatingSectionId(section.id);

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (toolMode === "draw") {
        setCurrentMousePos(getSvgCoordinates(e));
        return;
      }

      if (rotatingSectionId) {
        const coords = getSvgCoordinates(e);
        const section = sections.find(s => s.id === rotatingSectionId);
        if (!section) return;

        const dx = coords.x - section.x;
        const dy = coords.y - section.y;
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        let rotation = angle + 90;
        
        // Snap to 5 degrees for cleaner UI
        rotation = Math.round(rotation / 5) * 5;

        updateSection(rotatingSectionId, { rotation });
        return;
      }

      if (resizingSectionId) {
        const coords = getSvgCoordinates(e);
        const dx = coords.x - dragStartPos.x;
        const dy = coords.y - dragStartPos.y;

        const section = sections.find(s => s.id === resizingSectionId);
        if (!section) return;

        const newW = Math.max(20, Math.round((initialSectionSize.w + dx * 2) / 10) * 10);
        const newH = Math.max(20, Math.round((initialSectionSize.h + dy * 2) / 10) * 10);

        if (section.shape === "polygon" && initialSectionSize.points) {
          const ratioX = newW / (initialSectionSize.w || 1);
          const ratioY = newH / (initialSectionSize.h || 1);
          const newPoints = initialSectionSize.points
            .split(" ")
            .map(pt => {
              if (!pt.trim()) return "";
              const [px, py] = pt.split(",").map(Number);
              return `${Math.round(px * ratioX)},${Math.round(py * ratioY)}`;
            })
            .filter(Boolean)
            .join(" ");
          
          updateSection(resizingSectionId, { width: newW, height: newH, points: newPoints });
        } else {
          updateSection(resizingSectionId, { width: newW, height: newH });
        }
        return;
      }

      if (!draggingSectionId) return;

      const coords = getSvgCoordinates(e);
      const dx = coords.x - dragStartPos.x;
      const dy = coords.y - dragStartPos.y;

      // Snap to grid (10px increments)
      const newX = Math.round((initialSectionPos.x + dx) / 10) * 10;
      const newY = Math.round((initialSectionPos.y + dy) / 10) * 10;

      updateSection(draggingSectionId, { x: newX, y: newY });
    },
    [toolMode, draggingSectionId, resizingSectionId, dragStartPos, initialSectionPos, initialSectionSize, updateSection, zoom],
  );

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingSectionId) {
      setDraggingSectionId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    if (resizingSectionId) {
      setResizingSectionId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    if (rotatingSectionId) {
      setRotatingSectionId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[linear-gradient(to_right,rgba(128,128,128,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.15)_1px,transparent_1px)] bg-[size:40px_40px] rounded-2xl border border-border shadow-sm"
      style={{ backgroundColor: canvasBg }}
    >
      <svg
        ref={svgRef}
        viewBox="-560 -480 1120 960"
        className="w-full h-full cursor-crosshair select-none touch-none"
        preserveAspectRatio="xMidYMid meet"
        onContextMenu={(e) => {
          if (toolMode === "draw") {
            e.preventDefault();
            finishDrawing();
          }
        }}
        onPointerDown={(e) => {
          if (toolMode === "draw") {
            if (e.button === 2) return; // ignore right click for adding points
            const coords = getSvgCoordinates(e);
            setDrawingPoints(prev => [...prev, coords]);
          } else {
            setActiveSection(null);
          }
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <g transform={`scale(${zoom})`}>
          {/* Drawing Path Preview */}
          {toolMode === "draw" && drawingPoints.length > 0 && (
            <g>
              <path
                d={`M ${drawingPoints.map(p => `${p.x},${p.y}`).join(" L ")} ${currentMousePos ? `L ${currentMousePos.x},${currentMousePos.y}` : ""}`}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {drawingPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={i === 0 ? "#f59e0b" : "#ffffff"}
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  style={{ cursor: i === 0 ? "pointer" : "default", pointerEvents: "all" }}
                  onPointerDown={(e) => {
                    if (i === 0 && drawingPoints.length > 2) {
                      e.stopPropagation();
                      finishDrawing();
                    }
                  }}
                />
              ))}
            </g>
          )}

          {/* Arena Outer Boundary Wall */}
        {template.boundaryWidth && template.boundaryHeight && (
          <>
            {/* Outer shadow/glow */}
            <path
              d={getBoundaryPath(
                template.boundaryShape || "rect",
                template.boundaryWidth + 8,
                template.boundaryHeight + 8,
                (template.boundaryRx || 60) + 4,
              )}
              fill="none"
              stroke="rgba(100,120,150,0.15)"
              strokeWidth="12"
            />
            {/* Main boundary wall */}
            <path
              d={getBoundaryPath(
                template.boundaryShape || "rect",
                template.boundaryWidth,
                template.boundaryHeight,
                template.boundaryRx || 60,
              )}
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(150,170,200,0.5)"
              strokeWidth="3"
            />
          </>
        )}

        {/* Background Stage Fallback removed per user request */}

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
              d =
                `M ${pts[0].replace(",", " ")} ` +
                pts
                  .slice(1)
                  .map((p) => `L ${p.replace(",", " ")}`)
                  .join(" ") +
                " Z";
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
              transform={`translate(${sec.x}, ${sec.y}) rotate(${sec.rotation || 0}) scale(${sec.scaleX ?? 1}, ${sec.scaleY ?? 1})`}
              onPointerDown={(e) => handlePointerDown(e, sec)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSection(sec.id);
                setContextMenu({ x: e.clientX, y: e.clientY, sectionId: sec.id });
              }}
              style={{
                transformOrigin: `0px 0px`,
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              {/* Canva-style Selection Box & Resize Handles */}
              {isActive && (
                <g pointerEvents="none">
                  <path
                    d={d}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                  {/* Rotation Handle */}
                  {(() => {
                    let topY = -50;
                    if (sec.shape === "rect" || sec.shape === "pitch" || sec.shape === "polygon") {
                      topY = -((sec.height || 100) / 2);
                    } else if (sec.shape === "arc") {
                      topY = -(sec.outerRadius || 150);
                    }
                    return (
                      <g>
                        <line 
                          x1="0" 
                          y1={topY - 5} 
                          x2="0" 
                          y2={topY - 30} 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                        />
                        <circle
                          cx="0"
                          cy={topY - 30}
                          r="6"
                          fill="#ffffff"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          style={{ cursor: "grab", pointerEvents: "all" }}
                          onPointerDown={(e) => handleRotatePointerDown(e, sec)}
                        />
                      </g>
                    );
                  })()}
                  {/* Resize handle for rects/pitches/polygons */}
                  {(!sec.shape || sec.shape === "rect" || sec.shape === "pitch" || sec.shape === "polygon") && (
                    <circle
                      cx={(sec.width || 100) / 2}
                      cy={(sec.height || 50) / 2}
                      r="8"
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      style={{ cursor: "nwse-resize", pointerEvents: "all" }}
                      onPointerDown={(e) => handleResizePointerDown(e, sec)}
                    />
                  )}
                </g>
              )}

              {/* Main Shape */}
              {sec.shape === "pitch" ? (
                <PitchRenderer type={sec.pitchType || "none"} />
              ) : (
                <path
                  d={d}
                  fill={sec.color}
                  stroke={isActive ? "#ffffff" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isActive ? "3" : "1"}
                  className={`transition-all duration-100 ${isActive ? "brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "hover:brightness-125 opacity-90"}`}
                />
              )}

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
                        const midAngle =
                          (sec.startAngle || 0) +
                          ((sec.endAngle || 90) - (sec.startAngle || 0)) / 2;
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
                {sec.name}
              </text>
            </g>
          );
        })}
        </g>
      </svg>

      {/* Drawing Mode Hint */}
      {toolMode === "draw" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium pointer-events-none z-50">
          Click to add points. <span className="font-bold border border-primary-foreground/30 px-1 rounded mx-1">Right-click</span> or <span className="font-bold border border-primary-foreground/30 px-1 rounded mx-1">Enter</span> to finish.
        </div>
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[180px] rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Header: section name or rename input */}
          {renaming ? (
            <div className="px-3 py-2 border-b border-border/40">
              <input
                autoFocus
                className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (renameValue.trim())
                      updateSection(contextMenu.sectionId, { name: renameValue.trim() });
                    setRenaming(false);
                    setContextMenu(null);
                  }
                  if (e.key === "Escape") {
                    setRenaming(false);
                  }
                }}
              />
              <div className="flex gap-1 mt-1.5">
                <button
                  className="flex-1 rounded-md bg-primary text-primary-foreground text-xs py-1 hover:opacity-90"
                  onClick={() => {
                    if (renameValue.trim())
                      updateSection(contextMenu.sectionId, { name: renameValue.trim() });
                    setRenaming(false);
                    setContextMenu(null);
                  }}
                >
                  Save
                </button>
                <button
                  className="flex-1 rounded-md border border-border/60 text-xs py-1 hover:bg-secondary/60"
                  onClick={() => setRenaming(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 truncate">
              {sections.find((s) => s.id === contextMenu.sectionId)?.name || "Section"}
            </div>
          )}

          {!renaming && (
            <>
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                onClick={() => {
                  const sec = sections.find((s) => s.id === contextMenu.sectionId);
                  setRenameValue(sec?.name || "");
                  setRenaming(true);
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Rename
              </button>
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                onClick={() => {
                  duplicateSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>
              <div className="border-t border-border/40 my-0.5" />
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => {
                  removeSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center bg-card border border-border/60 rounded-full shadow-lg p-1 z-10">
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
