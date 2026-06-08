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
        className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[16px] shadow-2xl bg-white text-gray-900 border-l-[12px] ${isBack ? "flex-row-reverse" : "flex-row"}`}
        style={{
          fontFamily: font.css,
          height: 250,
          borderColor: palette.from
        }}
      >
        {isBack ? (
          <div className="relative flex-1 flex flex-row p-6 bg-gray-50">
             <div className="flex-1 overflow-hidden ticket-back-content text-[11px] text-gray-600 leading-relaxed pr-6 border-r border-gray-200" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }} />
             <div className="w-[180px] flex flex-col items-center justify-center pl-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Registration Scan</p>
                <div className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm mb-2">
                   <QRCode value={qrValue || orderId} size={90} />
                </div>
                <p className="text-[10px] font-mono text-gray-400">{orderId}</p>
             </div>
          </div>
        ) : (
          <>
            {/* Main Information Panel */}
            <div className="relative flex-1 flex flex-col p-8">
               {/* Cover Image Background Option */}
               {cover && (
                  <div className="absolute inset-0 opacity-5">
                    <img crossOrigin="anonymous" src={cover} className="w-full h-full object-cover mix-blend-multiply" alt="" />
                  </div>
               )}

               <div className="relative z-10 flex justify-between items-start mb-6">
                  {logoImage ? (
                     <img crossOrigin="anonymous" src={logoImage} style={{ height: `${logoScale}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0)" : logoColorMode === "black" ? "none" : "none" }} className="object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />
                  ) : (
                     <span className="text-xl font-black tracking-[0.2em] uppercase text-gray-900">{logoText}</span>
                  )}
                  <span className="text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md" style={{ background: palette.from }}>
                     {tier}
                  </span>
               </div>

               <div className="relative z-10 flex-1 flex flex-col justify-center" style={{ textAlign: layout.titleAlign as any, marginTop: `${layout.titleOffsetY}%` }}>
                  <h2 className="font-black leading-tight tracking-tight text-gray-900" style={{ fontSize: `${layout.titleSize + 4}px` }}>
                     {title}
                  </h2>
                  <p className="mt-1 font-semibold text-gray-500 uppercase tracking-widest" style={{ fontSize: `${layout.subtitleSize}px` }}>
                     {subtitle}
                  </p>
               </div>

               <div className="relative z-10 grid grid-cols-3 gap-6 mt-6 border-t border-gray-100 pt-4" style={{ fontSize: `${layout.metaSize}px` }}>
                  <div>
                     <p className="text-[9px] uppercase tracking-widest text-gray-400">Date</p>
                     <p className="font-bold text-gray-800 text-sm mt-0.5">{date}</p>
                  </div>
                  <div>
                     <p className="text-[9px] uppercase tracking-widest text-gray-400">Time</p>
                     <p className="font-bold text-gray-800 text-sm mt-0.5">{time}</p>
                  </div>
                  <div>
                     <p className="text-[9px] uppercase tracking-widest text-gray-400">Access Level</p>
                     <p className="font-bold text-gray-800 text-sm mt-0.5">{seat}</p>
                  </div>
               </div>
            </div>

            {/* Separator Line */}
            <div className="relative w-px bg-gray-200 my-6"></div>

            {/* Right Stub for QR Code */}
            <div className="w-[200px] flex flex-col items-center justify-center p-6 bg-gray-50">
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <QRCode value={qrValue || orderId} size={110} fgColor={palette.from} />
               </div>
               <div className="mt-4 text-center">
                  <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Attendee ID</p>
                  <p className="text-[10px] font-mono text-gray-600 mt-0.5">{orderId}</p>
               </div>
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
