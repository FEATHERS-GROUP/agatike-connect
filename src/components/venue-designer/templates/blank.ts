import { LayoutGrid } from "lucide-react";
import { VenueTemplate } from "../types";

export const blankCanvas: VenueTemplate = {
  id: "blank",
  label: "Blank Canvas",
  description: "Start from scratch",
  icon: LayoutGrid,
  stageLabel: "STAGE",
  stageWidth: 300,
  stageHeight: 120,
  sections: [],
};
