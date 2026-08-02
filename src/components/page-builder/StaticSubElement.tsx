import React from "react";

export function StaticSubElement({
  comp,
  subKey,
  children,
  defaultWidth = "100%",
  defaultHeight = "auto",
  defaultPadding = "0px",
  defaultRadius = "0px",
  defaultBackgroundColor,
  className = "",
}: {
  comp: any;
  subKey: string;
  children: React.ReactNode;
  defaultWidth?: string;
  defaultHeight?: string;
  defaultPadding?: string;
  defaultRadius?: string;
  defaultBackgroundColor?: string;
  className?: string;
}) {
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

  return (
    <div 
      className={`relative transition-all ${className}`}
      style={{
        width: comp[`${subKey}_width`] || defaultWidth,
        height: comp[`${subKey}_height`] || defaultHeight,
        padding: comp[`${subKey}_padding`] ? `${comp[`${subKey}_padding`]}px` : defaultPadding,
        alignSelf: comp[`${subKey}_alignment`] === 'start' ? 'flex-start' : comp[`${subKey}_alignment`] === 'end' ? 'flex-end' : 'center',
        transform: `translate(${comp[`${subKey}_x`] || 0}px, ${comp[`${subKey}_y`] || 0}px)`,
      }}
    >
      {comp[`${subKey}_url`] ? (
        <a href={comp[`${subKey}_url`]} className="block w-full h-full">
          {styledChild}
        </a>
      ) : styledChild}
    </div>
  );
}
