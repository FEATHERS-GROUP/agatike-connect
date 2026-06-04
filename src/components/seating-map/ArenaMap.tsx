import React from "react";

interface ArenaMapProps {
  onSectionClick: (sectionId: string) => void;
  activeSectionId: string | null;
  sectionStatus: Record<string, "available" | "sold_out" | "limited" | "disabled">;
}

/**
 * A production-ready, hardcoded SVG seating map.
 * This represents the exact vector geometry of the venue (e.g. Cameron Indoor).
 * In a real platform like Ticketmaster, this file is exported from Adobe Illustrator / GIS tools.
 */
export const ArenaMap: React.FC<ArenaMapProps> = ({
  onSectionClick,
  activeSectionId,
  sectionStatus,
}) => {
  // Helper to get CSS classes based on status and selection
  const getSectionClass = (id: string) => {
    const status = sectionStatus[id] || "disabled";
    const isActive = activeSectionId === id;

    let base =
      "cursor-pointer transition-all duration-300 stroke-[1.5px] hover:brightness-110 hover:stroke-white";

    // Status colors
    if (status === "available") base += " fill-blue-500 stroke-blue-700";
    else if (status === "limited") base += " fill-orange-500 stroke-orange-700";
    else if (status === "sold_out") base += " fill-gray-600 stroke-gray-800 opacity-70";
    else base += " fill-gray-800 stroke-gray-900 opacity-50";

    // Active state
    if (isActive) {
      base +=
        " drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] stroke-white stroke-2 brightness-125 z-10 relative";
    }

    return base;
  };

  return (
    <svg
      viewBox="-400 -300 800 600"
      className="w-full h-full max-h-[70vh] drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background Court / Pitch */}
      <rect
        x="-150"
        y="-100"
        width="300"
        height="200"
        fill="#d97706"
        rx="5"
        stroke="#fef3c7"
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r="30" fill="none" stroke="#fef3c7" strokeWidth="2" />
      <line x1="0" y1="-100" x2="0" y2="100" stroke="#fef3c7" strokeWidth="2" />
      <text
        x="0"
        y="0"
        fill="#fef3c7"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
        opacity="0.5"
      >
        COURT
      </text>

      {/* --- LOWER BOWL --- */}

      {/* North Section (Top) */}
      <g
        id="sec-101"
        className={getSectionClass("sec-101")}
        onClick={() => onSectionClick("sec-101")}
      >
        <polygon points="-150,-120 150,-120 180,-180 -180,-180" />
        <text
          x="0"
          y="-145"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          101
        </text>
      </g>

      {/* South Section (Bottom) */}
      <g
        id="sec-105"
        className={getSectionClass("sec-105")}
        onClick={() => onSectionClick("sec-105")}
      >
        <polygon points="-150,120 150,120 180,180 -180,180" />
        <text
          x="0"
          y="155"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          105
        </text>
      </g>

      {/* East Section (Right) */}
      <g
        id="sec-103"
        className={getSectionClass("sec-103")}
        onClick={() => onSectionClick("sec-103")}
      >
        <polygon points="170,-100 230,-140 230,140 170,100" />
        <text
          x="195"
          y="0"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform="rotate(90, 195, 0)"
          pointerEvents="none"
        >
          103
        </text>
      </g>

      {/* West Section (Left) */}
      <g
        id="sec-107"
        className={getSectionClass("sec-107")}
        onClick={() => onSectionClick("sec-107")}
      >
        <polygon points="-170,-100 -230,-140 -230,140 -170,100" />
        <text
          x="-195"
          y="0"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform="rotate(-90, -195, 0)"
          pointerEvents="none"
        >
          107
        </text>
      </g>

      {/* North-East Corner */}
      <g
        id="sec-102"
        className={getSectionClass("sec-102")}
        onClick={() => onSectionClick("sec-102")}
      >
        <polygon points="155,-120 170,-105 230,-145 185,-180" />
        <text
          x="185"
          y="-135"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          102
        </text>
      </g>

      {/* South-East Corner */}
      <g
        id="sec-104"
        className={getSectionClass("sec-104")}
        onClick={() => onSectionClick("sec-104")}
      >
        <polygon points="155,120 170,105 230,145 185,180" />
        <text
          x="185"
          y="145"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          104
        </text>
      </g>

      {/* South-West Corner */}
      <g
        id="sec-106"
        className={getSectionClass("sec-106")}
        onClick={() => onSectionClick("sec-106")}
      >
        <polygon points="-155,120 -170,105 -230,145 -185,180" />
        <text
          x="-185"
          y="145"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          106
        </text>
      </g>

      {/* North-West Corner */}
      <g
        id="sec-108"
        className={getSectionClass("sec-108")}
        onClick={() => onSectionClick("sec-108")}
      >
        <polygon points="-155,-120 -170,-105 -230,-145 -185,-180" />
        <text
          x="-185"
          y="-135"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          108
        </text>
      </g>

      {/* --- UPPER BOWL --- */}

      {/* North Upper */}
      <g
        id="sec-201"
        className={getSectionClass("sec-201")}
        onClick={() => onSectionClick("sec-201")}
      >
        <polygon points="-185,-190 185,-190 220,-260 -220,-260" />
        <text
          x="0"
          y="-220"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          201
        </text>
      </g>

      {/* South Upper */}
      <g
        id="sec-205"
        className={getSectionClass("sec-205")}
        onClick={() => onSectionClick("sec-205")}
      >
        <polygon points="-185,190 185,190 220,260 -220,260" />
        <text
          x="0"
          y="230"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          205
        </text>
      </g>

      {/* East Upper */}
      <g
        id="sec-203"
        className={getSectionClass("sec-203")}
        onClick={() => onSectionClick("sec-203")}
      >
        <polygon points="240,-150 310,-190 310,190 240,150" />
        <text
          x="270"
          y="0"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform="rotate(90, 270, 0)"
          pointerEvents="none"
        >
          203
        </text>
      </g>

      {/* West Upper */}
      <g
        id="sec-207"
        className={getSectionClass("sec-207")}
        onClick={() => onSectionClick("sec-207")}
      >
        <polygon points="-240,-150 -310,-190 -310,190 -240,150" />
        <text
          x="-270"
          y="0"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform="rotate(-90, -270, 0)"
          pointerEvents="none"
        >
          207
        </text>
      </g>
    </svg>
  );
};
