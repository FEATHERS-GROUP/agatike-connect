import React, { useRef } from "react";

export function ResizableSubElement({
  comp,
  idx,
  subKey,
  selectedElementId,
  setSelectedElementId,
  updateComponent,
  children,
  defaultWidth = "100%",
  defaultHeight = "auto",
  defaultPadding = "0px",
  defaultRadius = "0px",
  defaultBackgroundColor,
  className = "",
}: {
  comp: any;
  idx: number;
  subKey: string;
  selectedElementId?: string | null;
  setSelectedElementId: (id: string | null) => void;
  updateComponent: (index: number, key: string, value: any) => void;
  children: React.ReactNode;
  defaultWidth?: string;
  defaultHeight?: string;
  defaultPadding?: string;
  defaultRadius?: string;
  defaultBackgroundColor?: string;
  className?: string;
}) {
  const compositeId = `${comp.id}__${subKey}`;
  const isSelected = selectedElementId === compositeId;
  const blockRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent, type: 'width' | 'height' | 'both' | 'radius' | 'move') => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = blockRef.current?.offsetWidth || 0;
    const startHeight = blockRef.current?.offsetHeight || 0;
    const startRadius = parseInt(comp[`${subKey}_borderRadius`] || defaultRadius.replace('px', ''));
    const startPosX = parseInt(comp[`${subKey}_x`] || '0');
    const startPosY = parseInt(comp[`${subKey}_y`] || '0');

    const onMove = (moveEvent: PointerEvent) => {
      if (type === 'width' || type === 'both') {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        updateComponent(idx, `${subKey}_width`, `${Math.max(50, newWidth)}px`);
      }
      if (type === 'height' || type === 'both') {
        const newHeight = startHeight + (moveEvent.clientY - startY);
        updateComponent(idx, `${subKey}_height`, `${Math.max(20, newHeight)}px`);
      }
      if (type === 'radius') {
        const newRadius = startRadius + (moveEvent.clientX - startX);
        updateComponent(idx, `${subKey}_borderRadius`, `${Math.max(0, newRadius)}`);
      }
      if (type === 'move') {
        const newX = startPosX + (moveEvent.clientX - startX);
        const newY = startPosY + (moveEvent.clientY - startY);
        updateComponent(idx, `${subKey}_x`, newX);
        updateComponent(idx, `${subKey}_y`, newY);
      }
    };

    const onUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  const isHidden = comp[`${subKey}_hidden`] === true;
  if (isHidden) return null;

  const innerStyle = {
    color: comp[`${subKey}_color`] || undefined,
    fontFamily: comp[`${subKey}_fontFamily`] || undefined,
    fontSize: comp[`${subKey}_fontSize`] ? `${comp[`${subKey}_fontSize`]}px` : undefined,
    textDecoration: comp[`${subKey}_textDecoration`] || undefined,
    fontWeight: comp[`${subKey}_fontWeight`] || undefined,
    backgroundColor: comp[`${subKey}_backgroundColor`] || defaultBackgroundColor || undefined,
    borderRadius: comp[`${subKey}_borderRadius`] ? `${comp[`${subKey}_borderRadius`]}px` : defaultRadius,
  };

  const styledChild = React.isValidElement(children) 
    ? React.cloneElement(children as React.ReactElement<any>, {
        style: { ...((children as React.ReactElement<any>).props.style || {}), ...innerStyle }
      })
    : <span style={innerStyle}>{children}</span>;

  const content = (
    <div 
      ref={blockRef}
      className={`relative group transition-all cursor-pointer ${
        isSelected ? "ring-2 ring-primary/40 z-10" : "hover:ring-1 hover:ring-primary/20"
      } ${className}`}
      style={{
        width: comp[`${subKey}_width`] || defaultWidth,
        height: comp[`${subKey}_height`] || defaultHeight,
        padding: comp[`${subKey}_padding`] ? `${comp[`${subKey}_padding`]}px` : defaultPadding,
        alignSelf: comp[`${subKey}_alignment`] === 'start' ? 'flex-start' : comp[`${subKey}_alignment`] === 'end' ? 'flex-end' : 'center',
        transform: `translate(${comp[`${subKey}_x`] || 0}px, ${comp[`${subKey}_y`] || 0}px)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElementId(compositeId);
      }}
    >
      {comp[`${subKey}_url`] ? (
        <a href={comp[`${subKey}_url`]} className="block w-full h-full" onClick={(e) => e.preventDefault()}>
          {styledChild}
        </a>
      ) : styledChild}

      {isSelected && (
        <>
          {/* Right Width Handle */}
          <div 
            className="absolute top-1/2 -right-1.5 w-3 h-6 bg-primary rounded-sm -translate-y-1/2 cursor-ew-resize z-30 shadow-sm"
            onPointerDown={(e) => startDrag(e, 'width')}
          />
          {/* Bottom Height Handle */}
          <div 
            className="absolute bottom-[-6px] left-1/2 w-6 h-3 bg-primary rounded-sm -translate-x-1/2 cursor-ns-resize z-30 shadow-sm"
            onPointerDown={(e) => startDrag(e, 'height')}
          />
          {/* Bottom Right Both Handle */}
          <div 
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-nwse-resize z-30 shadow-sm"
            onPointerDown={(e) => startDrag(e, 'both')}
          />
          {/* Top Left Border Radius Handle */}
          <div 
            className="absolute top-2 left-2 w-3 h-3 bg-background border-2 border-primary rounded-full cursor-nwse-resize z-30 shadow-sm"
            title="Drag to change border radius"
            onPointerDown={(e) => startDrag(e, 'radius')}
          />
          {/* Top Center Move Handle */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground rounded-sm cursor-move z-30 shadow-sm flex items-center justify-center"
            title="Drag to move element"
            onPointerDown={(e) => startDrag(e, 'move')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
          </div>
          {/* Top Right Hide/Delete Button */}
          <button
            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-md flex items-center justify-center z-30 shadow-sm hover:bg-destructive/90"
            title="Hide this element"
            onClick={(e) => {
              e.stopPropagation();
              updateComponent(idx, `${subKey}_hidden`, true);
              setSelectedElementId(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </>
      )}
    </div>
  );

  return content;
}
