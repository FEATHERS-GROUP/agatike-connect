import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "../types";

export function Concert2(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

  if (template === "concert-2") {
    return (
      <div
        id="ticket-preview-container"
        className="relative flex w-[340px] flex-col overflow-hidden rounded-[24px] text-white shadow-2xl"
        style={{
          fontFamily: font.css,
          background: `linear-gradient(180deg, ${palette.from}, ${palette.to})`,
          height: 640,
        }}
      >
        {isBack ? (
          <div className="relative flex-1 p-6 flex flex-col items-center text-center bg-black/40">
            {cover && (
              <img crossOrigin="anonymous" src={cover} className="absolute inset-0 h-full w-full object-cover opacity-20 -scale-x-100" alt="" />
            )}
            <div className="relative z-10 w-full flex-1 flex flex-col justify-between pt-4">
              <span className="text-sm font-black tracking-[0.3em] uppercase">{logoText}</span>
              <div className="flex-1 flex flex-col justify-center items-center py-6">
                {back.backImage && (
                  <img crossOrigin="anonymous" src={back.backImage} className="w-full h-[200px] object-cover rounded-xl mb-6 shadow-lg" style={{ opacity: back.backImageOpacity }} alt="" />
                )}
                <div className="ticket-back-content text-[11px] text-white/80 leading-relaxed max-w-[280px]" dangerouslySetInnerHTML={{ __html: back.backText || "" }} />
              </div>
              <div className="w-full bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
                <p className="text-[10px] uppercase tracking-widest text-white/60 mb-3">Scan for Entry</p>
                <div className="bg-white p-3 rounded-xl mx-auto w-fit">
                  <QRCode value={qrValue || orderId} size={140} />
                </div>
                <p className="mt-3 text-[11px] font-mono opacity-80">{orderId}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {/* Lanyard Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full bg-black/30 shadow-inner z-20 border border-white/10"></div>
            
            {/* Top Cover Section */}
            <div className="relative h-[260px] w-full shrink-0">
              {cover ? (
                <img crossOrigin="anonymous" src={cover} className="absolute inset-0 h-full w-full object-cover" alt="" />
              ) : (
                <div className="absolute inset-0 bg-black/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#111]" />
              
              <div className="relative z-10 pt-12 px-6 flex flex-col items-center text-center h-full">
                {logoImage && (
                  <img crossOrigin="anonymous" src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="mb-2 max-w-[140px] object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />
                )}
                {!logoImage && <span className="text-sm font-black tracking-[0.3em] uppercase">{logoText}</span>}
                
                <span className="mt-auto mb-4 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md border border-white/20 shadow-xl">
                  {tier}
                </span>
              </div>
            </div>

            {/* Bottom Info Section */}
            <div className="relative flex-1 flex flex-col items-center text-center px-6 pb-6 pt-4 bg-[#111] bg-opacity-95">
              <div style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign as any }} className="w-full">
                <h2 className="font-black leading-tight drop-shadow-lg text-white" style={{ fontSize: `${layout.titleSize + 4}px` }}>
                  {title}
                </h2>
                <p className="mt-2 text-white/60 whitespace-pre-line tracking-wide uppercase" style={{ fontSize: `${layout.subtitleSize}px` }}>
                  {subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-auto mb-8 border-y border-white/10 py-5" style={{ fontSize: `${layout.metaSize}px` }}>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-widest text-[#f97316]">Date</p>
                  <p className="font-bold">{date}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-widest text-[#f97316]">Time</p>
                  <p className="font-bold">{time}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-widest text-[#f97316]">Gate / Seat</p>
                  <p className="font-bold">{seat}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-widest text-[#f97316]">Price</p>
                  <p className="font-bold">{currency}{price}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-2 rounded-xl">
                <QRCode value={qrValue || orderId} size={90} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
