import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_TERMS_HTML } from "../types";

export function Movie1(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "movie-1") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[24px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, height: 240 }}
        >
          {/* Full-bleed background */}
          {cover ? (
            <img
              crossOrigin="anonymous"
              src={cover}
              className={`absolute inset-0 h-full w-full object-cover ${isBack ? "-scale-x-100" : ""}`}
              alt=""
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
            />
          )}
          {/* Color grade overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${palette.from}bb, ${palette.to}66)`,
              mixBlendMode: "multiply",
            }}
          />
          {/* Cinematic vignette — dark edges, light center */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/10 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

          {isBack ? (
            /* ── Back ──────────────────────────────────────────────── */
            <>
              <div className="relative z-10 flex-1 p-7 flex flex-col justify-end">
                <p className="text-xs font-black tracking-[0.3em] mb-3 opacity-80">{logoText}</p>
                <div
                  className="ticket-back-content text-[10px] text-white/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
                />
              </div>
              {/* Film-hole perforator */}
              <div className="relative w-px z-10">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-card/80"
                    style={{ top: `${10 + i * 15}%` }}
                  />
                ))}
                <div className="h-full w-px border-l-2 border-dashed border-white/30" />
              </div>
              <div className="relative z-10 flex w-[170px] flex-col items-center justify-between bg-black/50 p-5 text-center backdrop-blur-sm">
                {back.backImage && (
                  <img
                    crossOrigin="anonymous"
                    src={back.backImage}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ opacity: back.backImageOpacity }}
                    alt=""
                  />
                )}
                <p className="relative z-10 text-[9px] uppercase tracking-widest text-white/50">
                  Scan to enter
                </p>
                <div className="relative z-10 rounded-lg bg-white p-2">
                  <QRCode value={qrValue || orderId} size={90} />
                </div>
                <p className="relative z-10 text-[9px] font-mono text-white/50">{orderId}</p>
              </div>
            </>
          ) : (
            /* ── Front ─────────────────────────────────────────────── */
            <>
              {/* Main content area */}
              <div className="relative z-10 flex flex-1 flex-col justify-between p-7">
                {/* Top: tier badge + logo */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                      {tier}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
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
                        className="max-w-[120px] object-contain cursor-pointer"
                        alt="Logo"
                        onClick={onLogoClick}
                      />
                    )}
                    <span className="text-xs font-black tracking-[0.3em] opacity-90">
                      {logoText}
                    </span>
                  </div>
                </div>

                {/* Center: dramatic title */}
                <div
                  style={{
                    textAlign: layout.titleAlign as any,
                    marginTop: `${layout.titleOffsetY * 0.5}%`,
                  }}
                >
                  <h2
                    className="font-black leading-none tracking-tight drop-shadow-2xl"
                    style={{
                      fontSize: `${layout.titleSize + 6}px`,
                      textShadow: "0 4px 24px rgba(0,0,0,0.8)",
                    }}
                  >
                    {title}
                  </h2>
                  <p
                    className="mt-2 text-white/70 tracking-widest uppercase whitespace-pre-line"
                    style={{ fontSize: `${layout.subtitleSize - 1}px`, letterSpacing: "0.2em" }}
                  >
                    {subtitle}
                  </p>
                </div>

                {/* Bottom: info row */}
                <div className="flex gap-8" style={{ fontSize: `${layout.metaSize}px` }}>
                  <Cell label="Date" value={date} />
                  <Cell label="Showtime" value={time} />
                  <Cell label="Screen" value={seat} />
                  <Cell label="Price" value={`${currency}${price}`} />
                </div>
              </div>

              {/* Film-hole perforation */}
              <div className="relative w-px z-10">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-card/80"
                    style={{ top: `${10 + i * 15}%` }}
                  />
                ))}
                <div className="h-full w-px border-l-2 border-dashed border-white/30" />
              </div>

              {/* QR stub */}
              <div className="relative z-10 flex w-[170px] flex-col items-center justify-between bg-black/50 p-5 text-center backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-widest text-white/50">Now Showing</p>
                <div className="rounded-xl bg-white p-2">
                  <QRCode value={qrValue || orderId} size={96} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5">
                    Admit One
                  </p>
                  <p className="text-[9px] font-mono text-white/60">{orderId}</p>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

  return null;
}
