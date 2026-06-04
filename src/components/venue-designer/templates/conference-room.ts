import { Presentation } from "lucide-react";
import { VenueTemplate } from "../types";

export const conferenceRoom: VenueTemplate = {
  id: "conference",
  label: "Conference Room",
  description: "Podium front · Theater seating",
  icon: Presentation,
  stageLabel: "PODIUM",
  stageWidth: 160,
  stageHeight: 60,
  sections: [
    {
      id: "front", name: "Front VIP", color: "#dc2626", rows: 3, cols: 24, shape: "rect", x: 0, y: 100, rotation: 0, width: 300, height: 60,
      capacity: 0,
      type: "reserved",
      priceZone: "",
      visible: false
    },
    {
      id: "left", name: "Left Wing", color: "#0ea5e9", rows: 12, cols: 10, shape: "rect", x: -160, y: 280, rotation: 15, width: 120, height: 240,
      capacity: 0,
      type: "reserved",
      priceZone: "",
      visible: false
    },
    {
      id: "center", name: "Main Block", color: "#3b82f6", rows: 15, cols: 20, shape: "rect", x: 0, y: 300, rotation: 0, width: 240, height: 300,
      capacity: 0,
      type: "reserved",
      priceZone: "",
      visible: false
    },
    {
      id: "right", name: "Right Wing", color: "#0ea5e9", rows: 12, cols: 10, shape: "rect", x: 160, y: 280, rotation: -15, width: 120, height: 240,
      capacity: 0,
      type: "reserved",
      priceZone: "",
      visible: false
    },
  ],
};
