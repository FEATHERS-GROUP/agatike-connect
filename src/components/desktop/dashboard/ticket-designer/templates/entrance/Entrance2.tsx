import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_TERMS_HTML } from "../types";

export function Entrance2(props: TemplateProps) {
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

  if (template === "entrance-2") {
    return (
      <div
        id="ticket-preview-container"
        className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[20px] shadow-2xl text-white ${isBack ? "flex-row-reverse" : "flex-row"}`}
        style={{
          fontFamily: font.css,
          height: 250,
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
        }}
      >
        {isBack ? (
          <div className="relative flex-1 p-6 flex flex-row bg-black/40 backdrop-blur-md">
            <div className="flex-1 flex flex-col pr-6 border-r border-white/20">
              <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
                <span className="text-sm font-black tracking-[0.2em] uppercase">{logoText}</span>
              </div>
              <div
                className="flex-1 overflow-hidden ticket-back-content text-[11px] text-white/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
              />
            </div>
            <div className="w-[180px] pl-6 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Order ID</p>
              <div className="p-2 border border-white/20 rounded-xl bg-white/10 shadow-sm backdrop-blur-lg mb-2">
                <QRCode
                  value={qrValue || orderId}
                  size={90}
                  fgColor="#ffffff"
                  bgColor="transparent"
                />
              </div>
              <p className="text-[10px] font-mono text-white/60">{orderId}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Ticket Body */}
            <div className="relative flex-1 flex flex-col p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {logoImage ? (
                    <img
                      crossOrigin="anonymous"
                      src={logoImage}
                      style={{
                        height: `${logoScale * 0.6}px`,
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
                    <span className="text-sm font-black tracking-[0.2em] uppercase drop-shadow-md">
                      {logoText}
                    </span>
                  )}
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tier}</span>
                </div>
              </div>

              {/* Title Card */}
              <div
                className="flex-1 flex flex-col justify-center"
                style={{
                  textAlign: layout.titleAlign as any,
                  marginTop: `${layout.titleOffsetY}%`,
                }}
              >
                <h2
                  className="font-black leading-tight tracking-tight drop-shadow-sm"
                  style={{ fontSize: `${layout.titleSize + 4}px` }}
                >
                  {title}
                </h2>
                <p
                  className="mt-1 font-medium text-white/80 uppercase tracking-widest text-xs"
                  style={{ fontSize: `${layout.subtitleSize}px` }}
                >
                  {subtitle}
                </p>
              </div>

              {/* Meta Information Cards */}
              <div
                className="grid grid-cols-4 gap-3 mt-4"
                style={{ fontSize: `${layout.metaSize}px` }}
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-sm flex flex-col justify-center">
                  <p className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">Date</p>
                  <p className="font-bold text-xs truncate">{date}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-sm flex flex-col justify-center">
                  <p className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">Time</p>
                  <p className="font-bold text-xs truncate">{time}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-sm flex flex-col justify-center">
                  <p className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">
                    Entry / Area
                  </p>
                  <p className="font-bold text-xs truncate">{seat}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl p-3 shadow-sm flex flex-col justify-center">
                  <p className="text-[8px] uppercase tracking-widest text-white/70 mb-0.5">Price</p>
                  <p className="font-black text-sm truncate">
                    {currency}
                    {price}
                  </p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="relative w-px bg-white/20 my-4 flex flex-col items-center justify-between">
              <div className="w-4 h-4 rounded-full bg-background absolute -top-6"></div>
              <div className="w-4 h-4 rounded-full bg-background absolute -bottom-6"></div>
            </div>

            {/* Stub */}
            <div className="w-[180px] p-5 flex flex-col items-center justify-center border-l border-white/10 bg-white/5 backdrop-blur-md">
              <div className="bg-white rounded-2xl p-2 shadow-lg mb-3">
                <QRCode value={qrValue || orderId} size={100} fgColor={palette.from} />
              </div>
              <p className="text-[8px] uppercase tracking-widest text-white/60 font-bold text-center">
                Scan at entry
              </p>
              <p className="text-[9px] font-mono text-white/40 mt-1">{orderId}</p>
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
