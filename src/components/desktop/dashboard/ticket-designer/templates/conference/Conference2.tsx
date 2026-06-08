import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_TERMS_HTML } from "../types";

export function Conference2(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack
  } = props;

  if (template === "conference-2") {
    return (
      <div
        id="ticket-preview-container"
        className="relative flex w-[480px] flex-col overflow-hidden rounded-[20px] shadow-2xl bg-white text-gray-900 border-[8px]"
        style={{
          fontFamily: font.css,
          height: 600,
          borderColor: palette.from
        }}
      >
        {/* Lanyard Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-black/10 shadow-inner z-20"></div>

        {isBack ? (
          <div className="relative flex-1 flex flex-col pt-12 p-6 bg-gray-50">
             <div className="text-center border-b border-gray-200 pb-4 mb-4">
               <span className="text-sm font-black tracking-[0.2em] uppercase text-gray-800">{logoText}</span>
             </div>
             <div className="flex-1 overflow-hidden ticket-back-content text-[11px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
             <div className="mt-4 flex flex-col items-center border-t border-gray-200 pt-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Registration Scan</p>
                <div className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm">
                   <QRCode value={qrValue || orderId} size={100} />
                </div>
                <p className="mt-2 text-[10px] font-mono text-gray-400">{orderId}</p>
             </div>
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {/* Header / Cover */}
            <div className="relative h-[220px] w-full bg-gray-100 flex flex-col items-center justify-center pt-8 px-6 text-center overflow-hidden">
               {cover && (
                  <img crossOrigin="anonymous" src={cover} className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-20" alt="" />
               )}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
               
               <div className="relative z-10 w-full flex flex-col items-center h-full justify-between pb-6">
                  {logoImage ? (
                     <img crossOrigin="anonymous" src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0)" : logoColorMode === "black" ? "none" : "none" }} className="object-contain cursor-pointer mb-2" alt="Logo" onClick={onLogoClick} />
                  ) : (
                     <span className="text-xl font-black tracking-[0.2em] uppercase text-gray-900 mb-2">{logoText}</span>
                  )}
                  <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg mt-auto" style={{ background: palette.from }}>
                     {tier}
                  </span>
               </div>
            </div>

            {/* Name / Title block */}
            <div className="px-8 text-center flex flex-col items-center justify-center" style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign as any, minHeight: "120px" }}>
               <h2 className="font-black leading-tight tracking-tight text-gray-900" style={{ fontSize: `${layout.titleSize + 6}px` }}>
                  {title}
               </h2>
               <p className="mt-2 font-medium text-gray-500 uppercase tracking-widest" style={{ fontSize: `${layout.subtitleSize}px` }}>
                  {subtitle}
               </p>
            </div>

            {/* QR Code Prominent in Center */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
               <div className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100">
                  <QRCode value={qrValue || orderId} size={140} fgColor={palette.from} />
               </div>
            </div>

            {/* Bottom Info Footer */}
            <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">Date & Time</p>
                  <p className="font-bold text-gray-800 text-sm">{date} • {time}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">Access</p>
                  <p className="font-bold text-gray-800 text-sm">{seat}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
