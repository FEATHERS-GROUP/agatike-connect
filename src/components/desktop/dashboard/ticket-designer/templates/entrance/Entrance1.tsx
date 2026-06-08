import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "../types";

export function Entrance1(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "entrance-1") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[16px] shadow-xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{
            fontFamily: font.css,
            height: 260,
            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          }}
        >
          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <div className="flex flex-1 flex-row bg-white text-slate-900">
              {/* Center Content (White) */}
              <div className="relative flex-1 p-8 flex flex-col">
                <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 mb-6">
                  {logoText}
                </p>
                <div
                  className="ticket-back-content text-[11px] text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
                />
              </div>

              {/* Perforation line */}
              <div className="relative w-px h-full bg-white flex flex-col items-center">
                <div className="absolute -top-3 h-6 w-6 rounded-full bg-slate-50" />
                <div className="absolute -bottom-3 h-6 w-6 rounded-full bg-slate-50" />
              </div>

              {/* Right Stub (Colored, which becomes Left due to flex-row-reverse) */}
              <div
                className="w-[160px] flex flex-col items-center justify-center p-6 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
              >
                <div className="rounded-xl bg-white p-1.5 mb-4">
                  <QRCode value={qrValue || orderId} size={84} />
                </div>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Scan at Gate</p>
                <p className="text-[11px] font-mono opacity-100 mt-1">{orderId}</p>
              </div>
            </div>
          ) : (
            /* ── Front ─────────────────────────────────────────────── */
            <div className="flex flex-1 flex-row bg-white text-slate-900">
              {/* Left Image */}
              <div className="relative w-[220px]">
                {cover ? (
                  <img
                    crossOrigin="anonymous"
                    src={cover}
                    className="absolute inset-0 h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-200" />
                )}
                {/* Overlay tier tag */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
                  {tier}
                </div>
              </div>

              {/* Center Content */}
              <div className="flex-1 flex flex-col justify-between p-7 bg-white relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {logoImage && (
                      <img
                        crossOrigin="anonymous"
                        src={logoImage}
                        style={{
                          height: `${logoScale * 0.5}px`,
                          opacity: logoOpacity,
                          filter: logoColorMode === "white" ? "brightness(0)" : "none",
                        }}
                        className="object-contain cursor-pointer"
                        alt="Logo"
                        onClick={onLogoClick}
                      />
                    )}
                    <span className="text-[11px] font-black tracking-[0.2em] text-slate-400">
                      {logoText}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: layout.titleAlign as any,
                    marginTop: `${layout.titleOffsetY * 0.5}%`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 whitespace-pre-line">
                    {subtitle}
                  </p>
                  <h2
                    className="font-black leading-tight text-slate-900"
                    style={{ fontSize: `${layout.titleSize + 4}px` }}
                  >
                    {title}
                  </h2>
                </div>

                <div
                  className="flex items-center gap-8 border-t border-slate-100 pt-4 mt-4"
                  style={{ fontSize: `${layout.metaSize}px` }}
                >
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Date</p>
                    <p className="font-bold mt-0.5">{date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Entry</p>
                    <p className="font-bold mt-0.5">{time || "All Day"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Admit</p>
                    <p className="font-bold mt-0.5">{seat || "1 Person"}</p>
                  </div>
                </div>
              </div>

              {/* Perforation line */}
              <div className="relative w-px h-full bg-white flex flex-col items-center">
                <div className="absolute -top-3 h-6 w-6 rounded-full bg-slate-50" />
                <div className="absolute -bottom-3 h-6 w-6 rounded-full bg-slate-50" />
              </div>

              {/* Right Stub (Colored) */}
              <div
                className="w-[160px] flex flex-col items-center justify-between p-6 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
              >
                <div className="w-full text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-80">Price</p>
                  <p className="text-base font-black">
                    {currency}
                    {price}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-1.5">
                  <QRCode value={qrValue || orderId} size={84} />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

  return null;
}
