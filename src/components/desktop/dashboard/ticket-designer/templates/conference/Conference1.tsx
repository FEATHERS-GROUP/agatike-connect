import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "../types";

export function Conference1(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "conference-1") {
      return (
        <div
          id="ticket-preview-container"
          className="relative flex w-[500px] max-w-full flex-col overflow-hidden rounded-[28px] text-white shadow-2xl"
          style={{
            fontFamily: font.css,
            background: `linear-gradient(180deg, ${palette.from}, ${palette.to})`,
            height: 280,
          }}
        >
          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <>
              {/* Back header + terms */}
              <div className="relative flex-1 flex flex-col p-6 overflow-hidden bg-black/60">
                {cover && (
                  <img
                    crossOrigin="anonymous"
                    src={cover}
                    className="absolute inset-0 h-full w-full object-cover opacity-20 -scale-x-100"
                    alt=""
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/20" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <span className="text-[10px] font-black tracking-[0.2em]">{logoText}</span>
                  </div>
                  <div
                    className="flex-1 ticket-back-content text-[10px] text-white/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
                  />
                </div>
              </div>

              {/* Perforation */}
              <div className="relative h-px mx-0">
                <div className="absolute -left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="absolute -right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="w-full border-t-2 border-dashed border-white/40" />
              </div>

              {/* Back stub */}
              <div className="relative flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md">
                {back.backImage && (
                  <img
                    crossOrigin="anonymous"
                    src={back.backImage}
                    className="absolute inset-0 h-full w-full object-cover rounded-b-[28px]"
                    style={{ opacity: back.backImageOpacity }}
                    alt=""
                  />
                )}
                <div className="relative z-10">
                  <p className="text-[9px] uppercase tracking-widest text-white/60">
                    Scan to enter
                  </p>
                  <p className="text-[10px] font-mono text-white/80 mt-0.5">{orderId}</p>
                </div>
                <div className="relative z-10 rounded-xl bg-white p-1.5">
                  <QRCode value={qrValue || orderId} size={64} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Poster header – taller cover with conference branding */}
              <div className="relative h-[130px] overflow-hidden">
                {cover && (
                  <img
                    crossOrigin="anonymous"
                    src={cover}
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                    alt=""
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 text-center"
                  style={{ textAlign: layout.titleAlign as any }}
                >
                  <h2
                    className="font-black leading-tight drop-shadow-lg"
                    style={{ fontSize: `${layout.titleSize}px` }}
                  >
                    {title}
                  </h2>
                  <p
                    className="text-white/80 mt-0.5 whitespace-pre-line"
                    style={{ fontSize: `${layout.subtitleSize}px` }}
                  >
                    {subtitle}
                  </p>
                </div>
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
                    {tier}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {logoImage && (
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
                    )}
                    <span className="text-[10px] font-black tracking-[0.2em]">{logoText}</span>
                  </div>
                </div>
              </div>

              {/* Info row – conference labels */}
              <div
                className="flex items-center justify-between px-5 py-3 border-t border-white/15"
                style={{ fontSize: `${layout.metaSize}px` }}
              >
                <Cell label="Date" value={date} />
                <Cell label="Time" value={time} />
                <Cell label="Hall / Room" value={seat} />
                <Cell label="Pass" value={`${currency}${price}`} />
              </div>

              {/* Perforation */}
              <div className="relative h-px mx-0">
                <div className="absolute -left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="absolute -right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
                <div className="w-full border-t-2 border-dashed border-white/40" />
              </div>

              {/* Bottom stub */}
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/60">
                    Conference Pass
                  </p>
                  <p className="text-[10px] font-mono">{orderId}</p>
                </div>
                <div className="rounded-xl bg-white p-1.5">
                  <QRCode value={qrValue || orderId} size={52} />
                </div>
                <p className="text-[9px] text-white/60 text-right">
                  Scan at
                  <br />
                  registration
                </p>
              </div>
            </>
          )}
        </div>
      );
    }

  return null;
}
