import React from "react";
import { PitchType } from "./types";

export function PitchRenderer({ type }: { type: PitchType }) {
  switch (type) {
    case "football":
      return (
        <g transform="translate(-220, -150)">
          <defs>
            <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d6a2d"/>
              <stop offset="50%" stopColor="#276127"/>
              <stop offset="100%" stopColor="#2d6a2d"/>
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="432" height="292" rx="6" fill="url(#grass)" stroke="#1a3d1a" strokeWidth="3"/>
          <rect x="16" y="16" width="408" height="268" fill="none" stroke="#fff" strokeWidth="2"/>
          <line x1="220" y1="16" x2="220" y2="284" stroke="#fff" strokeWidth="2"/>
          <circle cx="220" cy="150" r="44" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="220" cy="150" r="3" fill="#fff"/>
          <rect x="16" y="76" width="72" height="118" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="16" y="104" width="32" height="62" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="60" cy="150" r="3" fill="#fff"/>
          <rect x="352" y="76" width="72" height="118" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="376" y="104" width="32" height="62" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="380" cy="150" r="3" fill="#fff"/>
          <rect x="4" y="124" width="12" height="52" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="424" y="124" width="12" height="52" fill="none" stroke="#fff" strokeWidth="2"/>
        </g>
      );
    case "basketball":
      return (
        <g transform="translate(-250, -170)">
          <rect x="2" y="2" width="496" height="336" rx="8" fill="#c8860a" stroke="#7a4f00" strokeWidth="3"/>
          <rect x="16" y="16" width="468" height="308" fill="none" stroke="#fff" strokeWidth="2"/>
          <line x1="250" y1="16" x2="250" y2="324" stroke="#fff" strokeWidth="2"/>
          <circle cx="250" cy="170" r="46" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="250" cy="170" r="5" fill="#fff"/>
          <rect x="16" y="100" width="110" height="140" fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="2"/>
          <path d="M126,100 Q176,170 126,240" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="374" y="100" width="110" height="140" fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="2"/>
          <path d="M374,100 Q324,170 374,240" fill="none" stroke="#fff" strokeWidth="2"/>
          <path d="M16,60 Q180,170 16,280" fill="none" stroke="#fff" strokeWidth="2"/>
          <path d="M484,60 Q320,170 484,280" fill="none" stroke="#fff" strokeWidth="2"/>
        </g>
      );
    case "handball":
      return (
        <g transform="translate(-260, -170)">
          <rect x="2" y="2" width="516" height="336" rx="6" fill="#4a7c59" stroke="#2d5c3a" strokeWidth="3"/>
          <rect x="16" y="16" width="488" height="308" fill="none" stroke="#fff" strokeWidth="2"/>
          <line x1="260" y1="16" x2="260" y2="324" stroke="#fff" strokeWidth="2"/>
          <circle cx="260" cy="170" r="6" fill="#fff"/>
          <path d="M16,70 Q190,70 190,170 Q190,270 16,270" fill="rgba(255,255,255,.07)" stroke="#fff" strokeWidth="2"/>
          <path d="M16,30 Q240,30 240,170 Q240,310 16,310" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="8,5"/>
          <rect x="16" y="130" width="20" height="80" fill="none" stroke="#fff" strokeWidth="2.5"/>
          <circle cx="90" cy="170" r="4" fill="#fff"/>
          <path d="M504,70 Q330,70 330,170 Q330,270 504,270" fill="rgba(255,255,255,.07)" stroke="#fff" strokeWidth="2"/>
          <path d="M504,30 Q280,30 280,170 Q280,310 504,310" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="8,5"/>
          <rect x="484" y="130" width="20" height="80" fill="none" stroke="#fff" strokeWidth="2.5"/>
          <circle cx="430" cy="170" r="4" fill="#fff"/>
        </g>
      );
    case "volleyball":
      return (
        <g transform="translate(-230, -150)">
          <rect x="2" y="2" width="456" height="296" rx="6" fill="#e8c97a" stroke="#b8960a" strokeWidth="3"/>
          <rect x="20" y="20" width="420" height="260" fill="none" stroke="#c0392b" strokeWidth="2.5"/>
          <line x1="230" y1="20" x2="230" y2="280" stroke="#fff" strokeWidth="3"/>
          <line x1="160" y1="20" x2="160" y2="280" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="6,4"/>
          <line x1="300" y1="20" x2="300" y2="280" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="6,4"/>
          <line x1="20" y1="130" x2="20" y2="170" stroke="#c0392b" strokeWidth="2.5"/>
          <line x1="440" y1="130" x2="440" y2="170" stroke="#c0392b" strokeWidth="2.5"/>
          <circle cx="230" cy="150" r="5" fill="#fff"/>
        </g>
      );
    case "podium_classic":
      return (
        <g transform="translate(-60, -135)">
          <rect x="42" y="200" width="36" height="20" rx="3" fill="#3a3a3a"/>
          <rect x="36" y="194" width="48" height="8" rx="2" fill="#555"/>
          <polygon points="30,90 90,90 82,194 38,194" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
          <rect x="30" y="80" width="60" height="14" rx="3" fill="#1e40af"/>
          <line x1="60" y1="80" x2="60" y2="58" stroke="#aaa" strokeWidth="2"/>
          <ellipse cx="60" cy="54" rx="6" ry="8" fill="#888"/>
        </g>
      );
    case "podium_glass":
      return (
        <g transform="translate(-147, -150)">
          <rect x="8" y="120" width="90" height="88" rx="4" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/>
          <text x="53" y="170" fontFamily="Arial" fontSize="28" fontWeight="900" fill="#fff" textAnchor="middle">2</text>
          <rect x="102" y="80" width="90" height="128" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
          <text x="147" y="152" fontFamily="Arial" fontSize="32" fontWeight="900" fill="#fff" textAnchor="middle">1</text>
          <text x="147" y="112" fontFamily="Arial" fontSize="22" fill="#fff" textAnchor="middle">★</text>
          <rect x="196" y="152" width="90" height="56" rx="4" fill="#cd7c2f" stroke="#b45309" strokeWidth="2"/>
          <text x="241" y="186" fontFamily="Arial" fontSize="28" fontWeight="900" fill="#fff" textAnchor="middle">3</text>
          <rect x="8" y="206" width="278" height="14" rx="3" fill="#374151"/>
        </g>
      );
    case "panel_table":
      return (
        <g transform="translate(-180, -101)">
          <rect x="16" y="60" width="328" height="18" rx="6" fill="#5b3a1e" stroke="#3d2610" strokeWidth="2"/>
          <rect x="30" y="78" width="300" height="64" rx="4" fill="#6b4423" stroke="#3d2610" strokeWidth="2"/>
          <rect x="38" y="142" width="14" height="40" rx="3" fill="#4a2e12"/>
          <rect x="308" y="142" width="14" height="40" rx="3" fill="#4a2e12"/>
          <line x1="90" y1="60" x2="90" y2="30" stroke="#aaa" strokeWidth="1.5"/>
          <ellipse cx="90" cy="26" rx="5" ry="7" fill="#888"/>
          <line x1="180" y1="60" x2="180" y2="24" stroke="#aaa" strokeWidth="1.5"/>
          <ellipse cx="180" cy="20" rx="5" ry="7" fill="#888"/>
          <line x1="270" y1="60" x2="270" y2="30" stroke="#aaa" strokeWidth="1.5"/>
          <ellipse cx="270" cy="26" rx="5" ry="7" fill="#888"/>
        </g>
      );
    case "stage_concert":
      return (
        <g transform="translate(-250, -152)">
          <rect x="10" y="10" width="480" height="180" rx="6" fill="#1a1a2e" stroke="#333" strokeWidth="2"/>
          <rect x="24" y="22" width="452" height="140" rx="4" fill="#0d1b4b" stroke="#2563eb" strokeWidth="1.5"/>
          <rect x="8" y="188" width="484" height="100" rx="6" fill="#292929" stroke="#444" strokeWidth="2"/>
          <rect x="8" y="284" width="484" height="10" rx="3" fill="#f59e0b" opacity=".7"/>
          <rect x="8" y="150" width="48" height="140" rx="4" fill="#111" stroke="#333" strokeWidth="1.5"/>
          <rect x="444" y="150" width="48" height="140" rx="4" fill="#111" stroke="#333" strokeWidth="1.5"/>
          <polygon points="80,10 100,10 120,60 60,60" fill="rgba(253,224,71,.25)"/>
          <polygon points="240,10 260,10 290,80 210,80" fill="rgba(253,224,71,.2)"/>
          <polygon points="400,10 420,10 440,60 380,60" fill="rgba(253,224,71,.25)"/>
        </g>
      );
    case "stage_thrust":
      return (
        <g transform="translate(-250, -159)">
          <rect x="50" y="20" width="400" height="150" rx="8" fill="#3d1c8c" stroke="#6d28d9" strokeWidth="2"/>
          <rect x="210" y="168" width="80" height="130" rx="6" fill="#3d1c8c" stroke="#6d28d9" strokeWidth="2"/>
          <rect x="50" y="20" width="400" height="12" rx="5" fill="#7c3aed"/>
          <circle cx="100" cy="26" r="6" fill="#fbbf24"/>
          <circle cx="150" cy="26" r="6" fill="#f87171"/>
          <circle cx="200" cy="26" r="6" fill="#34d399"/>
          <circle cx="250" cy="26" r="6" fill="#60a5fa"/>
          <circle cx="300" cy="26" r="6" fill="#fbbf24"/>
          <circle cx="350" cy="26" r="6" fill="#f87171"/>
          <circle cx="400" cy="26" r="6" fill="#34d399"/>
          <rect x="24" y="20" width="28" height="150" rx="4" fill="#1e0a4a"/>
          <rect x="448" y="20" width="28" height="150" rx="4" fill="#1e0a4a"/>
        </g>
      );
    case "stage_round":
      return (
        <g transform="translate(-250, -250)">
          <circle cx="250" cy="250" r="160" fill="none" stroke="#f59e0b" strokeWidth="3" opacity=".4"/>
          <circle cx="250" cy="250" r="140" fill="#1f1f1f" stroke="#6b7280" strokeWidth="2.5"/>
          <circle cx="250" cy="250" r="100" fill="#292929" stroke="#f59e0b" strokeWidth="2"/>
          <circle cx="250" cy="250" r="120" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="12,8"/>
          <circle cx="250" cy="250" r="12" fill="#f59e0b" opacity=".7"/>
          <rect x="246" y="50" width="8" height="200" rx="3" fill="#3a3a3a"/>
          <rect x="246" y="250" width="8" height="200" rx="3" fill="#3a3a3a"/>
          <rect x="50" y="246" width="200" height="8" rx="3" fill="#3a3a3a"/>
          <rect x="250" y="246" width="200" height="8" rx="3" fill="#3a3a3a"/>
        </g>
      );
    case "ring_boxing":
      return (
        <g transform="translate(-200, -190)">
          <rect x="20" y="60" width="360" height="260" rx="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2"/>
          <rect x="40" y="80" width="320" height="220" rx="4" fill="#fff" stroke="#d1d5db" strokeWidth="1.5"/>
          <rect x="28" y="100" width="344" height="6" rx="2" fill="#dc2626"/>
          <rect x="28" y="140" width="344" height="6" rx="2" fill="#dc2626"/>
          <rect x="28" y="180" width="344" height="6" rx="2" fill="#1d4ed8"/>
          <rect x="28" y="120" width="6" height="140" rx="2" fill="#dc2626"/>
          <rect x="366" y="120" width="6" height="140" rx="2" fill="#dc2626"/>
          <rect x="28" y="78" width="16" height="188" rx="3" fill="#6b7280"/>
          <rect x="356" y="78" width="16" height="188" rx="3" fill="#6b7280"/>
          <circle cx="200" cy="200" r="40" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="6,4"/>
          <rect x="172" y="306" width="56" height="20" rx="3" fill="#d1d5db"/>
          <rect x="160" y="322" width="80" height="14" rx="2" fill="#e5e7eb"/>
        </g>
      );
    case "runway":
      return (
        <g transform="translate(-250, -185)">
          <rect x="20" y="20" width="460" height="130" rx="6" fill="#111" stroke="#444" strokeWidth="2"/>
          <rect x="180" y="20" width="140" height="330" rx="6" fill="#1a1a1a" stroke="#444" strokeWidth="2"/>
          <circle cx="210" cy="60" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="210" cy="110" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="210" cy="160" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="210" cy="210" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="210" cy="260" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="290" cy="60" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="290" cy="110" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="290" cy="160" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="290" cy="210" r="8" fill="#fbbf24" opacity=".8"/>
          <circle cx="290" cy="260" r="8" fill="#fbbf24" opacity=".8"/>
          <rect x="20" y="148" width="460" height="8" rx="2" fill="#f59e0b" opacity=".6"/>
        </g>
      );
    case "dj_booth":
      return (
        <g transform="translate(-75, -40)">
          <rect x="0" y="0" width="150" height="80" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="3"/>
          <rect x="10" y="10" width="130" height="60" rx="4" fill="#111827"/>
          <circle cx="40" cy="40" r="20" fill="#374151" stroke="#4b5563" strokeWidth="2"/>
          <circle cx="110" cy="40" r="20" fill="#374151" stroke="#4b5563" strokeWidth="2"/>
          <rect x="65" y="15" width="20" height="50" rx="2" fill="#4b5563"/>
        </g>
      );
    case "speaker_panel":
      return (
        <g transform="translate(-30, -80)">
          <rect x="0" y="0" width="60" height="160" rx="8" fill="#111" stroke="#333" strokeWidth="4"/>
          <circle cx="30" cy="30" r="20" fill="#222" stroke="#444" strokeWidth="2"/>
          <circle cx="30" cy="80" r="20" fill="#222" stroke="#444" strokeWidth="2"/>
          <circle cx="30" cy="130" r="20" fill="#222" stroke="#444" strokeWidth="2"/>
          <circle cx="30" cy="30" r="6" fill="#111"/>
          <circle cx="30" cy="80" r="6" fill="#111"/>
          <circle cx="30" cy="130" r="6" fill="#111"/>
        </g>
      );
    case "choral_risers":
      return (
        <g transform="translate(-150, -60)">
          <path d="M 0,100 Q 150,-20 300,100" fill="none" stroke="#4b5563" strokeWidth="24"/>
          <path d="M 0,70 Q 150,-50 300,70" fill="none" stroke="#374151" strokeWidth="24"/>
          <path d="M 0,40 Q 150,-80 300,40" fill="none" stroke="#1f2937" strokeWidth="24"/>
        </g>
      );
    case "orchestra_pit":
      return (
        <g transform="translate(-200, -100)">
          <path d="M 0,0 L 400,0 A 200 200 0 0 1 0,0 Z" fill="#1f1f1f" stroke="#4b5563" strokeWidth="4"/>
          <path d="M 20,10 L 380,10 A 180 180 0 0 1 20,10 Z" fill="#292929"/>
          {/* Conductor podium */}
          <circle cx="200" cy="30" r="15" fill="#f59e0b" stroke="#b45309" strokeWidth="2"/>
        </g>
      );
    case "tennis_court":
      return (
        <g transform="translate(-200, -100)">
          <rect x="0" y="0" width="400" height="200" fill="#1e3a8a" stroke="#fff" strokeWidth="3"/>
          <rect x="40" y="20" width="320" height="160" fill="#2563eb" stroke="#fff" strokeWidth="2"/>
          {/* Net */}
          <line x1="200" y1="0" x2="200" y2="200" stroke="#fff" strokeWidth="4" strokeDasharray="4 2"/>
          {/* Service boxes */}
          <line x1="110" y1="20" x2="110" y2="180" stroke="#fff" strokeWidth="2"/>
          <line x1="290" y1="20" x2="290" y2="180" stroke="#fff" strokeWidth="2"/>
          <line x1="110" y1="100" x2="290" y2="100" stroke="#fff" strokeWidth="2"/>
          <line x1="40" y1="100" x2="45" y2="100" stroke="#fff" strokeWidth="2"/>
          <line x1="355" y1="100" x2="360" y2="100" stroke="#fff" strokeWidth="2"/>
        </g>
      );
    case "ice_rink":
      return (
        <g transform="translate(-250, -125)">
          <rect x="0" y="0" width="500" height="250" rx="60" fill="#f8fafc" stroke="#3b82f6" strokeWidth="4"/>
          <line x1="250" y1="0" x2="250" y2="250" stroke="#ef4444" strokeWidth="4"/>
          <circle cx="250" cy="125" r="30" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle cx="250" cy="125" r="4" fill="#3b82f6"/>
          {/* Blue lines */}
          <line x1="160" y1="0" x2="160" y2="250" stroke="#3b82f6" strokeWidth="4"/>
          <line x1="340" y1="0" x2="340" y2="250" stroke="#3b82f6" strokeWidth="4"/>
          {/* Faceoff circles */}
          <circle cx="80" cy="60" r="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="80" cy="190" r="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="420" cy="60" r="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="420" cy="190" r="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
          {/* Goal creases */}
          <path d="M 20,110 A 15 15 0 0 1 20,140 Z" fill="#bfdbfe" stroke="#ef4444" strokeWidth="2"/>
          <path d="M 480,110 A 15 15 0 0 0 480,140 Z" fill="#bfdbfe" stroke="#ef4444" strokeWidth="2"/>
        </g>
      );
    case "wrestling_mat":
      return (
        <g transform="translate(-150, -150)">
          <rect x="0" y="0" width="300" height="300" fill="#ef4444" stroke="#991b1b" strokeWidth="4"/>
          <circle cx="150" cy="150" r="130" fill="#fde047" stroke="#eab308" strokeWidth="4"/>
          <circle cx="150" cy="150" r="10" fill="#ef4444"/>
          <circle cx="150" cy="150" r="100" fill="none" stroke="#eab308" strokeWidth="2"/>
        </g>
      );
    default:
      return null;
  }
}
