import { Trophy } from "lucide-react";
import { VenueTemplate } from "../types";

export const footballStadium: VenueTemplate = {
  id: "stadium",
  label: "Football Stadium",
  description: "Pitch center · 3-tier seating",
  icon: Trophy,
  stageLabel: "PITCH",
  stageWidth: 320,
  stageHeight: 180,
  sections: [
    // --- EAST STAND (Right) ---
    { id: "e1", name: "East Lower", color: "#16a34a", rows: 12, cols: 40, price: 50, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 220, startAngle: 60, endAngle: 120 },
    { id: "e2", name: "East Mid", color: "#22c55e", rows: 10, cols: 45, price: 80, tier: "Premium", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 225, outerRadius: 275, startAngle: 60, endAngle: 120 },
    { id: "e3", name: "East Upper", color: "#4ade80", rows: 15, cols: 50, price: 40, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 280, outerRadius: 340, startAngle: 60, endAngle: 120 },
    
    // --- WEST STAND (Left) ---
    { id: "w1", name: "West Lower", color: "#2563eb", rows: 12, cols: 40, price: 60, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 220, startAngle: 240, endAngle: 300 },
    { id: "w2", name: "West VIP", color: "#dc2626", rows: 8, cols: 30, price: 250, tier: "VIP", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 225, outerRadius: 275, startAngle: 240, endAngle: 300 },
    { id: "w3", name: "West Upper", color: "#3b82f6", rows: 15, cols: 50, price: 45, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 280, outerRadius: 340, startAngle: 240, endAngle: 300 },
    
    // --- NORTH STAND (Top) ---
    { id: "n1", name: "North Lower", color: "#f59e0b", rows: 15, cols: 30, price: 35, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 140, outerRadius: 220, startAngle: -35, endAngle: 35 },
    { id: "n2", name: "North Upper", color: "#fbbf24", rows: 20, cols: 40, price: 25, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 225, outerRadius: 320, startAngle: -35, endAngle: 35 },
    
    // --- SOUTH STAND (Bottom) ---
    { id: "s1", name: "South Lower", color: "#f59e0b", rows: 15, cols: 30, price: 35, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 140, outerRadius: 220, startAngle: 145, endAngle: 215 },
    { id: "s2", name: "South Upper", color: "#fbbf24", rows: 20, cols: 40, price: 25, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 225, outerRadius: 320, startAngle: 145, endAngle: 215 },
    
    // --- CORNERS ---
    { id: "ne", name: "NE Corner", color: "#14b8a6", rows: 15, cols: 15, price: 30, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 280, startAngle: 38, endAngle: 57 },
    { id: "nw", name: "NW Corner", color: "#14b8a6", rows: 15, cols: 15, price: 30, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 280, startAngle: 303, endAngle: 322 },
    { id: "se", name: "SE Corner", color: "#14b8a6", rows: 15, cols: 15, price: 30, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 280, startAngle: 123, endAngle: 142 },
    { id: "sw", name: "SW Corner", color: "#14b8a6", rows: 15, cols: 15, price: 30, tier: "General", shape: "arc", x: 0, y: 0, rotation: 0, innerRadius: 180, outerRadius: 280, startAngle: 218, endAngle: 237 },
  ],
};
