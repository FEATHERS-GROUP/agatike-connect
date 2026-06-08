import React from "react";
import {
  Concert1,
  Concert2,
  Movie1,
  Movie2,
  Experience1,
  Experience2,
  Conference1,
  Conference2,
  Entrance1,
  Entrance2,
} from "./templates";
import { DEFAULT_TERMS_HTML, DEFAULT_EXPERIENCE_BACK_HTML } from "./templates/types";
import { Template, TicketLayout, TicketBack } from "./templates/types";

import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import {
  Ticket as TicketIcon,
  Crown,
  Film,
  Mountain,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

export { DEFAULT_TERMS_HTML, DEFAULT_EXPERIENCE_BACK_HTML };

export function TicketPreview(props: {
  template: Template;
  palette: { from: string; to: string; name: string };
  font: { css: string; name: string };
  tier: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  currency: string;
  cover: string;
  logoText: string;
  logoImage?: string;
  logoScale: number;
  logoOpacity: number;
  logoColorMode: string;
  orderId: string;
  qrValue?: string;
  previewMode: "Front" | "Back" | "Mobile";
  onLogoClick?: () => void;
  layout: TicketLayout;
  back: TicketBack;
}) {
  const {
    palette,
    font,
    tier,
    title,
    subtitle,
    date,
    time,
    seat,
    price,
    currency,
    cover,
    logoText,
    logoImage,
    logoScale,
    logoOpacity,
    logoColorMode,
    orderId,
    qrValue,
    template,
    previewMode,
    onLogoClick,
    layout,
    back,
  } = props;

  if (previewMode === "Front" || previewMode === "Back") {
    const isBack = previewMode === "Back";

    // ── Shared back side ──────────────────────────────────────────────────
    const BackSide = (
      <div className="relative flex-1 p-7" style={{ background: "rgba(0,0,0,0.25)" }}>
        {cover && (
          <img
            crossOrigin="anonymous"
            src={cover}
            className="absolute inset-0 h-full w-full object-cover opacity-20 -scale-x-100"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-end mb-4">
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
                className="ml-2 max-w-[100px] object-contain"
                alt=""
              />
            )}
          </div>
          <div className="flex-1 flex flex-col justify-end relative">
            {back.backImage && (
              <img
                crossOrigin="anonymous"
                src={back.backImage}
                className="absolute inset-0 h-full w-full object-cover rounded-xl"
                style={{ opacity: back.backImageOpacity }}
                alt=""
              />
            )}
            <div
              className="relative z-10 ticket-back-content text-[10px] text-white/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: back.backText || DEFAULT_TERMS_HTML }}
            />
          </div>
        </div>
      </div>
    );

    // ── Shared stub (matches Concert front stub) ─────────────────────────
    const Stub = (
      <div className="flex w-[160px] flex-col justify-between bg-black/20 p-5">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-widest opacity-80">Admit One</p>
          <p className="mt-1 text-[10px] font-mono opacity-80 break-all">{orderId}</p>
        </div>
        <div className="rounded-xl bg-white p-1.5 self-start">
          <QRCode value={qrValue || orderId} size={80} />
        </div>
        <div className="text-left">
          <p className="text-[9px] opacity-80">Scan at entrance</p>
        </div>
      </div>
    );

    // ── Perforator ────────────────────────────────────────────────────────
    const Perf = (
      <div className="relative w-px">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="h-full w-px border-l-2 border-dashed border-white/40" />
      </div>
    );

    const templateProps = {
      ...props,
      isBack,
      BackSide,
      Stub,
      Perf,
      Cell,
    };

    if (template === "concert-1") return <Concert1 {...templateProps} />;
    if (template === "concert-2") return <Concert2 {...templateProps} />;
    if (template === "movie-1") return <Movie1 {...templateProps} />;
    if (template === "movie-2") return <Movie2 {...templateProps} />;
    if (template === "experience-1") return <Experience1 {...templateProps} />;
    if (template === "experience-2") return <Experience2 {...templateProps} />;
    if (template === "conference-1") return <Conference1 {...templateProps} />;
    if (template === "conference-2") return <Conference2 {...templateProps} />;
    if (template === "entrance-1") return <Entrance1 {...templateProps} />;
    if (template === "entrance-2") return <Entrance2 {...templateProps} />;

    return null;
  }
  return null;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-white/20 pt-2">
      <p className="text-[9px] uppercase tracking-widest text-white/50">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  );
}
