import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_TERMS_HTML } from "../types";

export function Concert2(props: TemplateProps) {
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
  } = props;

  if (template === "concert-2") {
    return (
      <div
        id="ticket-preview-container"
        className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[24px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
        style={{
          fontFamily: font.css,
          height: 250,
          background: `linear-gradient(to right, #111827, #000000)`,
        }}
      >
        {isBack ? (
          <div className="relative flex-1 p-6 flex flex-row border border-white/10 rounded-[24px]">
            <div className="flex-1 pr-6 border-r border-white/10 flex flex-col">
              <div className="text-left border-b border-white/10 pb-3 mb-3">
                <span className="text-sm font-black tracking-[0.3em] uppercase opacity-80">
                  {logoText}
                </span>
              </div>
              <div
                className="flex-1 overflow-hidden ticket-back-content text-[11px] text-white/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
              />
            </div>
            <div className="w-[180px] pl-6 flex flex-col items-center justify-center">
              <div className="bg-white p-2 rounded-xl mb-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <QRCode value={qrValue || orderId} size={90} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
                Scan for Entry
              </p>
              <p className="text-[10px] font-mono opacity-80">{orderId}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Body */}
            <div className="relative flex-1 flex flex-col p-6 overflow-hidden border border-white/10 rounded-l-[24px] border-r-0">
              {/* Dynamic Cover Image */}
              {cover ? (
                <img
                  crossOrigin="anonymous"
                  src={cover}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity"
                  alt="Cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              )}
              {/* Vibrant Gradient Overlay */}
              <div
                className="absolute inset-0 opacity-60 mix-blend-color"
                style={{ background: `linear-gradient(45deg, ${palette.from}, ${palette.to})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Header */}
              <div className="relative z-10 flex justify-between items-start mb-2">
                {logoImage ? (
                  <img
                    crossOrigin="anonymous"
                    src={logoImage}
                    style={{
                      height: `${logoScale * 0.7}px`,
                      opacity: logoOpacity,
                      filter:
                        logoColorMode === "white"
                          ? "brightness(0) invert(1)"
                          : logoColorMode === "black"
                            ? "brightness(0)"
                            : "none",
                    }}
                    className="object-contain cursor-pointer"
                    alt="Logo"
                    onClick={onLogoClick}
                  />
                ) : (
                  <span className="text-sm font-black tracking-[0.25em] uppercase drop-shadow-md">
                    {logoText}
                  </span>
                )}
                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: palette.from }}
                  >
                    {tier}
                  </span>
                </div>
              </div>

              {/* Title Block */}
              <div
                className="relative z-10 flex-1 flex flex-col justify-end pb-2"
                style={{
                  textAlign: layout.titleAlign as any,
                  marginBottom: `${layout.titleOffsetY}%`,
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest font-bold text-white/70 mb-1"
                  style={{ fontSize: `${layout.subtitleSize}px`, color: palette.to }}
                >
                  {subtitle}
                </p>
                <h2
                  className="font-black leading-none tracking-tight drop-shadow-lg"
                  style={{ fontSize: `${layout.titleSize + 8}px` }}
                >
                  {title}
                </h2>
              </div>
            </div>

            {/* Neon Separator */}
            <div className="relative w-1 h-full z-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-black"></div>
              <div
                className="w-[2px] h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ background: `linear-gradient(to bottom, ${palette.from}, ${palette.to})` }}
              ></div>
            </div>

            {/* Stub */}
            <div className="relative w-[220px] bg-[#111827] flex flex-col justify-between p-6 overflow-hidden border border-white/10 rounded-r-[24px] border-l-0">
              {/* Faint logo background */}
              <div className="absolute -bottom-10 -right-10 text-[100px] opacity-5 rotate-[-15deg] font-black">
                #
              </div>

              <div
                className="relative z-10 flex flex-col gap-4"
                style={{ fontSize: `${layout.metaSize}px` }}
              >
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/50 mb-0.5">
                    Date & Time
                  </p>
                  <p className="font-bold text-sm">
                    {date} • {time}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/50 mb-0.5">
                    Section / Row / Seat
                  </p>
                  <p className="font-bold text-sm">{seat}</p>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end mt-auto">
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">
                    Admit One
                  </p>
                  <p className="font-black text-xl" style={{ color: palette.from }}>
                    {currency}
                    {price}
                  </p>
                </div>
                <div className="bg-white p-1.5 rounded-lg">
                  <QRCode value={qrValue || orderId} size={50} fgColor="#000000" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
