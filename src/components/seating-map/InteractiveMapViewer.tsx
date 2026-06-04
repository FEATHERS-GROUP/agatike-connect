import React, { useState } from "react";
import { ArenaMap } from "./ArenaMap";
import { mockSectionMetadata, getSectionInventory, SectionMetadata } from "./mockData";
import { CheckCircle2, Info, Lock, ShoppingCart, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InteractiveMapViewer() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Derived state
  const activeSection: SectionMetadata | null = activeSectionId
    ? mockSectionMetadata[activeSectionId]
    : null;
  const inventory = activeSectionId ? getSectionInventory(activeSectionId) : null;

  // Extract status map for the SVG
  const sectionStatus = Object.fromEntries(
    Object.values(mockSectionMetadata).map((m) => [m.sectionId, m.status]),
  );
  // Map our "sec-101" ids to the metadata "101" ids for the SVG
  const svgStatusMap: Record<string, "available" | "sold_out" | "limited" | "disabled"> = {};
  Object.keys(mockSectionMetadata).forEach((k) => {
    svgStatusMap[k] = mockSectionMetadata[k].status;
  });

  const handleSectionClick = (id: string) => {
    if (svgStatusMap[id] === "sold_out" || svgStatusMap[id] === "disabled") return;
    setActiveSectionId(id);
    setSelectedSeats([]); // Reset selected seats when changing sections
  };

  const toggleSeat = (seatId: string, status: string) => {
    if (status !== "available") return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* MAP AREA */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-[#f8fafc] dark:bg-[#0f172a]">
        {/* Top Info Bar */}
        <div className="absolute top-6 left-6 flex gap-4">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full shadow-sm border text-xs font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Available
          </div>
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full shadow-sm border text-xs font-medium">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span> Limited
          </div>
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full shadow-sm border text-xs font-medium">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span> Sold Out
          </div>
        </div>

        {/* The pure SVG component */}
        <div className="w-full h-full max-w-5xl flex items-center justify-center">
          <ArenaMap
            onSectionClick={handleSectionClick}
            activeSectionId={activeSectionId}
            sectionStatus={svgStatusMap}
          />
        </div>
      </div>

      {/* TICKETING PANEL */}
      <div
        className={`w-96 border-l bg-card shadow-2xl transition-transform duration-300 ${activeSectionId ? "translate-x-0" : "translate-x-full absolute right-0"}`}
      >
        {activeSection ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{activeSection.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4" /> Capacity: {activeSection.capacity}
                  </p>
                </div>
                {activeSection.isVIP && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    VIP
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    Available
                  </p>
                  <p className="font-semibold text-blue-600">
                    {activeSection.availableSeats} Seats
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    Price Range
                  </p>
                  <p className="font-semibold">
                    ${activeSection.priceMin} - ${activeSection.priceMax}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory / Seat Selection Map */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                Select Your Seats
              </h3>

              <div className="space-y-4">
                {inventory?.rows.map((row) => (
                  <div key={row.row} className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-muted-foreground">{row.row}</span>
                    <div className="flex flex-wrap gap-1">
                      {row.seats.map((seat, idx) => {
                        const seatId = `${activeSection.sectionId}-${row.row}-${seat.number}`;
                        const isSelected = selectedSeats.includes(seatId);

                        let seatClass =
                          "w-6 h-6 rounded-t-md text-[10px] flex items-center justify-center font-medium transition-all ";

                        if (seat.status === "sold") {
                          seatClass +=
                            "bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed";
                        } else if (isSelected) {
                          seatClass += "bg-primary text-primary-foreground scale-110 shadow-md";
                        } else {
                          seatClass +=
                            "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-110 cursor-pointer dark:bg-blue-900/40 dark:text-blue-400";
                        }

                        return (
                          <button
                            key={seat.number}
                            className={seatClass}
                            disabled={seat.status !== "available"}
                            onClick={() => toggleSeat(seatId, seat.status)}
                            title={`Row ${row.row} Seat ${seat.number} - $${seat.price}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="p-6 border-t bg-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">{selectedSeats.length} Seats Selected</span>
                <span className="text-xl font-bold">
                  ${(selectedSeats.length * activeSection.priceMin).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full py-6 text-lg rounded-xl shadow-lg"
                disabled={selectedSeats.length === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Seats reserved for 5:00 upon click
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
