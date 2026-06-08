import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "../types";

export function Movie2(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

  if (template === "movie-2") {
    return (
      <div
        id="ticket-preview-container"
        className="relative flex w-[700px] flex-row overflow-hidden rounded-[12px] shadow-2xl bg-[#f4f1ea] text-[#1a1a1a]"
        style={{
          fontFamily: font.css,
          height: 220,
          border: `2px solid ${palette.from}`,
        }}
      >
        {isBack ? (
          <div className="relative flex-1 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start border-b-2 border-dashed pb-4" style={{ borderColor: palette.from }}>
              <span className="text-xs font-black tracking-[0.3em] uppercase">{logoText}</span>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Terms & Conditions</p>
            </div>
            <div className="ticket-back-content text-[10px] opacity-80 leading-relaxed py-4 text-[#1a1a1a]" dangerouslySetInnerHTML={{ __html: back.backText || "" }} />
            <div className="flex justify-between items-end">
              <div className="rounded-xl p-2 bg-white border-2" style={{ borderColor: palette.from }}>
                <QRCode value={qrValue || orderId} size={64} bgColor="#ffffff" fgColor="#1a1a1a" />
              </div>
              <p className="text-[10px] font-mono opacity-60">{orderId}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left Main Body */}
            <div className="relative z-10 flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {logoImage && (
                    <img crossOrigin="anonymous" src={logoImage} style={{ height: `${logoScale * 0.8}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0)" : logoColorMode === "black" ? "none" : "none" }} className="max-w-[100px] object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />
                  )}
                  <span className="text-xs font-black tracking-[0.3em] uppercase opacity-80">{logoText}</span>
                </div>
                <div className="border-2 px-3 py-1 rounded-full" style={{ borderColor: palette.from, color: palette.from }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tier}</span>
                </div>
              </div>

              <div style={{ textAlign: layout.titleAlign as any, marginTop: `${layout.titleOffsetY}%` }} className="flex-1 flex flex-col justify-center">
                <h2 className="font-black leading-tight uppercase tracking-tight" style={{ fontSize: `${layout.titleSize + 4}px`, color: palette.from }}>
                  {title}
                </h2>
                <p className="mt-1 font-medium whitespace-pre-line opacity-70" style={{ fontSize: `${layout.subtitleSize}px` }}>
                  {subtitle}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 border-t-2 pt-3 mt-auto" style={{ borderColor: palette.from, fontSize: `${layout.metaSize}px` }}>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Date</p>
                  <p className="font-bold">{date}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Showtime</p>
                  <p className="font-bold">{time}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Screen</p>
                  <p className="font-bold">{seat}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Admit</p>
                  <p className="font-bold">1 Person</p>
                </div>
              </div>
            </div>

            {/* Vintage Perforated Line */}
            <div className="relative w-px h-full flex flex-col justify-between items-center z-20">
              <div className="w-6 h-6 rounded-full bg-white absolute -top-3 shadow-inner border-b-2" style={{ borderColor: palette.from }} />
              <div className="h-full w-px border-l-[3px] border-dotted opacity-30" style={{ borderColor: palette.from }} />
              <div className="w-6 h-6 rounded-full bg-white absolute -bottom-3 shadow-inner border-t-2" style={{ borderColor: palette.from }} />
            </div>

            {/* Right Tear-off Stub */}
            <div className="w-[180px] p-5 flex flex-col justify-between items-center text-center relative" style={{ background: `linear-gradient(135deg, ${palette.from}15, ${palette.to}15)` }}>
              {cover && (
                <img crossOrigin="anonymous" src={cover} className="absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-multiply" alt="" />
              )}
              <div className="relative z-10 w-full flex flex-col items-center">
                <p className="text-[12px] font-black uppercase tracking-widest mb-1" style={{ color: palette.from }}>Row / Seat</p>
                <p className="text-xl font-bold border-2 rounded-lg px-4 py-1" style={{ borderColor: palette.from }}>{seat || "GA"}</p>
              </div>

              <div className="relative z-10 bg-white p-2 rounded-xl shadow-sm border" style={{ borderColor: `${palette.from}33` }}>
                <QRCode value={qrValue || orderId} size={70} fgColor={palette.from} />
              </div>
              
              <div className="relative z-10 w-full">
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Total</p>
                <p className="text-sm font-black">{currency}{price}</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
