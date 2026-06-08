import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_EXPERIENCE_BACK_HTML } from "../types";

export function Experience1(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "experience-1") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[760px] max-w-full overflow-hidden rounded-[24px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{ fontFamily: font.css, height: 260 }}
        >
          {/* ── Left: full-bleed cover panel ─────────────────────── */}
          <div className="relative flex-1 overflow-hidden">
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
                style={{ background: `linear-gradient(160deg, ${palette.from}, ${palette.to})` }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${palette.from}99, ${palette.to}55)`,
                mixBlendMode: "multiply",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

            {isBack ? (
              /* Back left: inclusions */
              <div className="relative z-10 flex h-full flex-col justify-end p-6">
                <p className="text-xs font-black tracking-[0.3em] mb-2 opacity-80">{logoText}</p>
                <div
                  className="ticket-back-content text-[10px] text-white/85 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: back.backText || DEFAULT_EXPERIENCE_BACK_HTML,
                  }}
                />
              </div>
            ) : (
              /* Front left: activity name */
              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                <div className="flex items-center gap-2">
                  {logoImage && (
                    <img
                      crossOrigin="anonymous"
                      src={logoImage}
                      style={{
                        height: `${logoScale * 0.65}px`,
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
                  <span className="text-[10px] font-black tracking-[0.25em] opacity-90">
                    {logoText}
                  </span>
                </div>
                <div
                  style={{
                    textAlign: layout.titleAlign as any,
                    marginTop: `${layout.titleOffsetY * 0.5}%`,
                  }}
                >
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 mb-1">
                    Experience
                  </p>
                  <h2
                    className="font-black leading-tight drop-shadow-xl"
                    style={{ fontSize: `${layout.titleSize + 2}px` }}
                  >
                    {title}
                  </h2>
                  <p
                    className="mt-1 text-white/70 whitespace-pre-line"
                    style={{ fontSize: `${layout.subtitleSize}px` }}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Perforator ───────────────────────────────────────── */}
          <div className="relative w-px z-10">
            <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
            <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
            <div className="h-full w-px border-l-2 border-dashed border-white/40" />
          </div>

          {/* ── Right: dark info panel ───────────────────────────── */}
          <div
            className="relative flex w-[280px] flex-col justify-between p-6"
            style={{ background: `linear-gradient(160deg, ${palette.from}ee, ${palette.to}cc)` }}
          >
            {cover && (
              <img
                crossOrigin="anonymous"
                src={cover}
                className="absolute inset-0 h-full w-full object-cover opacity-15"
                alt=""
              />
            )}
            <div className="absolute inset-0 bg-black/50" />

            {isBack ? (
              /* Back right: QR */
              <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
                <p className="text-[9px] uppercase tracking-widest text-white/50">{tier}</p>
                <div className="rounded-xl bg-white p-2">
                  <QRCode value={qrValue || orderId} size={100} />
                </div>
                <p className="text-[9px] font-mono text-white/50">{orderId}</p>
              </div>
            ) : (
              /* Front right: adventure details */
              <div className="relative z-10 flex h-full flex-col justify-between">
                {/* Tier badge */}
                <span className="self-start rounded-md bg-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
                  {tier}
                </span>

                {/* Info fields */}
                <div className="space-y-2.5" style={{ fontSize: `${layout.metaSize}px` }}>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50">
                      📍 Pickup Point
                    </p>
                    <p className="font-bold text-xs leading-tight mt-0.5">
                      {seat || "Check booking confirmation"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50">
                      🏁 Activity Location
                    </p>
                    <p className="font-bold text-xs leading-tight mt-0.5 whitespace-pre-line">
                      {subtitle || "TBA"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-white/20 pt-2.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/50">Date</p>
                      <p className="font-bold text-[11px]">{date}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/50">Time</p>
                      <p className="font-bold text-[11px]">{time}</p>
                    </div>
                  </div>
                </div>

                {/* QR + price */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5">
                      Price
                    </p>
                    <p className="text-base font-black">
                      {currency}
                      {price}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-1.5">
                    <QRCode value={qrValue || orderId} size={60} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

  return null;
}
