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
  const getValue = (keySuffix: string) => {
    let val = comp[`${subKey}_${keySuffix}`];
    if (val !== undefined) return val;
    // Fallback for legacy items before unified styling
    if (subKey.startsWith("inv_item")) {
      const legacyKey = subKey.replace("inv_item", "inv_1");
      val = comp[`${legacyKey}_${keySuffix}`];
    } else if (subKey.startsWith("card_item")) {
      const legacyKey = subKey.replace("card_item", "card_1");
      val = comp[`${legacyKey}_${keySuffix}`];
    }
    return val;
  };

  const isHidden = getValue("hidden") === true;
  if (isHidden) return null;

  const innerStyle = {
    color: getValue("color") || undefined,
    fontFamily: getValue("fontFamily") || undefined,
    fontSize: getValue("fontSize") ? `${getValue("fontSize")}px` : undefined,
    textDecoration: getValue("textDecoration") || undefined,
    fontWeight: getValue("fontWeight") || undefined,
    backgroundColor: getValue("backgroundColor") || defaultBackgroundColor || undefined,
    borderRadius: getValue("borderRadius") ? `${getValue("borderRadius")}px` : defaultRadius,
  };

  const styledChild = React.isValidElement(children) ? (
    React.cloneElement(children as React.ReactElement<any>, {
      style: { ...((children as React.ReactElement<any>).props.style || {}), ...innerStyle },
    })
  ) : (
    <span style={innerStyle}>{children}</span>
  );

  return (
    <div
      className={`relative transition-all ${className}`}
      style={{
        width: getValue("width") || defaultWidth,
        maxWidth: "100%",
        height: getValue("height") || defaultHeight,
        padding: getValue("padding") ? `${getValue("padding")}px` : defaultPadding,
        alignSelf:
          getValue("alignment") === "start"
            ? "flex-start"
            : getValue("alignment") === "end"
              ? "flex-end"
              : "center",
        transform: `translate(${getValue("x") || 0}px, ${getValue("y") || 0}px)`,
      }}
    >
      {getValue("url") ? (
        <a href={getValue("url")} className="block w-full h-full">
          {styledChild}
        </a>
      ) : (
        styledChild
      )}
    </div>
  );
}
