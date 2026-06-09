import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "../types";

export function Concert1(props: TemplateProps) {
  const {
    palette,
    font,
    tier,
    title,
    subtitle,
    date,
    time,
    seat,
    price,
    currency,
    cover,
    logoText,
    logoImage,
    logoScale,
    logoOpacity,
    logoColorMode,
    orderId,
    qrValue,
    previewMode,
    template,
    onLogoClick,
    layout,
    back,
    isBack,
    BackSide,
    Stub,
    Perf,
    Cell,
  } = props;

  if (template === "concert-1" || template === "concert") {
    return (
      <div
        id="ticket-preview-container"
        className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[28px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
        style={{
          fontFamily: font.css,
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          height: 230,
        }}
      >
        {isBack ? (
          BackSide
        ) : (
          <div className="relative flex-1 p-7">
            {cover && (
              <img
                crossOrigin="anonymous"
                src={cover}
                className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                alt=""
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
                  {tier} · {template}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
                  {logoImage && (
                    <img
                      crossOrigin="anonymous"
                      src={logoImage}
                      style={{
                        height: `${logoScale}px`,
                        opacity: logoOpacity,
                        filter:
                          logoColorMode === "white"
                            ? "brightness(0) invert(1)"
                            : logoColorMode === "black"
                              ? "brightness(0)"
                              : "none",
                      }}
                      className="mt-1 max-w-[120px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      alt="Logo"
                      onClick={onLogoClick}
                    />
                  )}
                </div>
              </div>
              <div style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign }}>
                <h2
                  className="font-black leading-tight drop-shadow"
                  style={{ fontSize: `${layout.titleSize}px` }}
                >
                  {title}
                </h2>
                <p
                  className="mt-1 text-white/80 whitespace-pre-line"
                  style={{ fontSize: `${layout.subtitleSize}px` }}
                >
                  {subtitle}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3" style={{ fontSize: `${layout.metaSize}px` }}>
                <Cell label="Date" value={date} />
                <Cell label="Time" value={time} />
                <Cell label="Seat" value={seat} />
                <Cell label="Price" value={`${currency}${price}`} />
              </div>
            </div>
          </div>
        )}
        {Perf}
        {Stub}
      </div>
    );
  }

  return null;
}
