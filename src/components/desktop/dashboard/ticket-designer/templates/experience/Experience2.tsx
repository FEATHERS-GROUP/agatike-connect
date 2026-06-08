import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_EXPERIENCE_BACK_HTML } from "../types";
import { PlaneTakeoff, QrCode } from "lucide-react";

export function Experience2(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack
  } = props;

  if (template === "experience-2") {
    return (
      <div
        id="ticket-preview-container"
        className="relative flex w-[760px] flex-row overflow-hidden rounded-[20px] text-[#e2e8f0] bg-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#334155]"
        style={{
          fontFamily: font.css,
          height: 250,
        }}
      >
        {isBack ? (
          <div className="relative flex-1 p-6 flex flex-row w-full h-full">
            <div className="flex-1 flex flex-col justify-between pr-6 border-r border-[#334155]">
               <div className="flex items-center gap-3">
                  <PlaneTakeoff size={20} className="text-[#38bdf8]" />
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-[#38bdf8]">{logoText}</span>
               </div>
               <div className="ticket-back-content text-[11px] leading-relaxed py-4 text-[#94a3b8]" dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_EXPERIENCE_BACK_HTML }} />
            </div>
            <div className="w-[200px] pl-6 flex flex-col items-center justify-center text-center">
                {back.backImage && (
                  <img crossOrigin="anonymous" src={back.backImage} className="w-full h-[120px] object-cover rounded-xl mb-4 border border-[#334155]" style={{ opacity: back.backImageOpacity }} alt="" />
                )}
                <div className="bg-white p-2 rounded-xl mt-auto">
                  <QRCode value={qrValue || orderId} size={70} />
                </div>
                <p className="text-[9px] font-mono mt-2 text-[#64748b]">{orderId}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Boarding Pass Body */}
            <div className="relative z-10 flex-1 p-6 flex flex-col justify-between overflow-hidden">
              {/* Tech Background Graphic */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(${palette.from} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: palette.from }}></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: palette.to }}></div>

              {/* Top Bar */}
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  {logoImage ? (
                    <img crossOrigin="anonymous" src={logoImage} style={{ height: `${logoScale * 0.7}px`, opacity: logoOpacity, filter: logoColorMode === "white" ? "brightness(0) invert(1)" : logoColorMode === "black" ? "brightness(0)" : "none" }} className="object-contain cursor-pointer" alt="Logo" onClick={onLogoClick} />
                  ) : (
                    <PlaneTakeoff size={24} style={{ color: palette.from }} />
                  )}
                  <span className="text-sm font-black tracking-[0.25em] uppercase opacity-90">{logoText}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-[#334155] bg-[#1e293b]">
                   <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: palette.from }}></span>
                   <span className="text-[10px] font-mono tracking-widest text-[#94a3b8]">BOARDING PASS</span>
                </div>
              </div>

              {/* Passenger & Flight Info */}
              <div className="relative z-10 flex justify-between items-end" style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign as any }}>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748b] mb-1">Experience Name</p>
                  <h2 className="font-black leading-none uppercase tracking-tight text-white drop-shadow-md" style={{ fontSize: `${layout.titleSize + 2}px` }}>
                    {title}
                  </h2>
                  <p className="mt-2 text-[#94a3b8] font-medium whitespace-pre-line" style={{ fontSize: `${layout.subtitleSize}px` }}>
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Meta Info Grid */}
              <div className="relative z-10 grid grid-cols-4 gap-4 mt-6 bg-[#1e293b] rounded-xl p-4 border border-[#334155]" style={{ fontSize: `${layout.metaSize}px` }}>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Date</p>
                  <p className="font-bold text-[#f8fafc] mt-0.5">{date}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Departs</p>
                  <p className="font-bold text-[#f8fafc] mt-0.5">{time}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Zone / Tier</p>
                  <p className="font-bold text-[#f8fafc] mt-0.5">{tier}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Seat / Spot</p>
                  <p className="font-bold text-[#f8fafc] mt-0.5">{seat}</p>
                </div>
              </div>
            </div>

            {/* Serrated Edge Separator */}
            <div className="relative w-[2px] h-full bg-[#334155] flex flex-col justify-around py-4 z-20">
               {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-4 bg-[#0f172a] rounded-full -ml-[3px]" />
               ))}
            </div>

            {/* Right Tech Stub */}
            <div className="relative w-[200px] flex flex-col justify-between p-6 bg-[#0f172a] overflow-hidden z-10">
               <div className="absolute right-0 top-0 bottom-0 w-1 shadow-[inset_-20px_0_30px_rgba(0,0,0,0.5)] pointer-events-none" style={{ background: palette.from }}></div>
               
               <div className="w-full text-right">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#64748b] mb-1">Amount Paid</p>
                  <p className="text-lg font-black text-white">{currency}{price}</p>
               </div>

               <div className="flex flex-col items-center mt-auto">
                  <div className="bg-white p-2 rounded-lg border-2 border-[#1e293b]">
                    <QRCode value={qrValue || orderId} size={84} />
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[#64748b]">
                     <QrCode size={14} />
                     <p className="text-[9px] font-mono tracking-widest uppercase">{orderId}</p>
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
