import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "./types";
import { DEFAULT_TERMS_HTML, DEFAULT_EXPERIENCE_BACK_HTML } from "./types";

export function ConcertTemplate(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "concert") {
      return (
        <div
          id="ticket-preview-container"
          className={`relative flex w-[720px] max-w-full overflow-hidden rounded-[28px] text-white shadow-2xl ${isBack ? "flex-row-reverse" : "flex-row"}`}
          style={{
            fontFamily: font.css,
            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
            height: 230,
          }}
        >
          {isBack ? (
            BackSide
          ) : (
            <div className="relative flex-1 p-7">
              {cover && (
                <img
                  crossOrigin="anonymous"
                  src={cover}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                  alt=""
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
                    {tier} · {template}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
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
                        className="mt-1 max-w-[120px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                        alt="Logo"
                        onClick={onLogoClick}
                      />
                    )}
                  </div>
                </div>
                <div style={{ marginTop: `${layout.titleOffsetY}%`, textAlign: layout.titleAlign }}>
                  <h2
                    className="font-black leading-tight drop-shadow"
                    style={{ fontSize: `${layout.titleSize}px` }}
                  >
                    {title}
                  </h2>
                  <p
                    className="mt-1 text-white/80 whitespace-pre-line"
                    style={{ fontSize: `${layout.subtitleSize}px` }}
                  >
                    {subtitle}
                  </p>
                </div>
                <div
                  className="grid grid-cols-4 gap-3"
                  style={{ fontSize: `${layout.metaSize}px` }}
                >
                  <Cell label="Date" value={date} />
                  <Cell label="Time" value={time} />
                  <Cell label="Seat" value={seat} />
                  <Cell label="Price" value={`${currency}${price}`} />
                </div>
              </div>
            </div>
          )}
          {Perf}
          {Stub}
        </div>
      );
    }

  return null;
}

export function MovieTemplate(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "movie") {
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

export function ExperienceTemplate(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "experience") {
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

export function ConferenceTemplate(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "conference") {
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

export function EntranceTemplate(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, template, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

      if (template === "entrance") {
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

