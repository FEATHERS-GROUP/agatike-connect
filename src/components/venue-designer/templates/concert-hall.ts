import { Music2 } from "lucide-react";
import { VenueTemplate } from "../types";

export const concertHall: VenueTemplate = {
  id: "concert",
  label: "Concert Hall",
  description: "Stage front · Fan-shaped seating",
  icon: Music2,
  stageLabel: "STAGE",
  stageWidth: 300,
  stageHeight: 80,
  sections: [
    // Pit (Rectangle)
    { id: "pit", name: "Standing Pit", color: "#f97316", rows: 15, cols: 30, price: 120, tier: "Floor", shape: "rect", x: 0, y: 120, rotation: 0, width: 280, height: 100 },
    
    // Floor (Arcs)
    { id: "f1", name: "Floor L", color: "#0ea5e9", rows: 12, cols: 15, price: 90, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 280, outerRadius: 360, startAngle: 110, endAngle: 145 },
    { id: "f2", name: "Floor C", color: "#0ea5e9", rows: 12, cols: 20, price: 95, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 280, outerRadius: 360, startAngle: 150, endAngle: 210 },
    { id: "f3", name: "Floor R", color: "#0ea5e9", rows: 12, cols: 15, price: 90, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 280, outerRadius: 360, startAngle: 215, endAngle: 250 },
    
    // Balcony (Arcs)
    { id: "b1", name: "Balcony L", color: "#8b5cf6", rows: 10, cols: 20, price: 60, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 380, outerRadius: 460, startAngle: 100, endAngle: 145 },
    { id: "b2", name: "Balcony C", color: "#8b5cf6", rows: 12, cols: 30, price: 70, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 380, outerRadius: 480, startAngle: 150, endAngle: 210 },
    { id: "b3", name: "Balcony R", color: "#8b5cf6", rows: 10, cols: 20, price: 60, tier: "General", shape: "arc", x: 0, y: -50, rotation: 0, innerRadius: 380, outerRadius: 460, startAngle: 215, endAngle: 260 },
    
    // VIP Boxes (Rects)
    { id: "vip-l", name: "VIP L", color: "#dc2626", rows: 2, cols: 8, price: 250, tier: "VIP", shape: "rect", x: -220, y: 150, rotation: 15, width: 80, height: 40 },
    { id: "vip-r", name: "VIP R", color: "#dc2626", rows: 2, cols: 8, price: 250, tier: "VIP", shape: "rect", x: 220, y: 150, rotation: -15, width: 80, height: 40 },
  ],
};
