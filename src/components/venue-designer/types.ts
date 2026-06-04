export type SeatStatus = "available" | "vip" | "accessible" | "blocked" | "stage";

export type Seat = {
  id: string;
  row: string;
  col: number;
  status: SeatStatus;
  section: string;
  price: number;
};

export type Section = {
  id: string;
  name: string;
  color: string;
  
  // Seat Generation config
  rows: number;
  cols: number;
  capacity: number;
  type: "reserved" | "general_admission" | "vip";
  priceZone: string;
  visible: boolean;

  // Geometry configuration
  shape: "rect" | "arc" | "polygon" | "path";
  x: number;
  y: number;
  rotation: number;
  
  // Rect specifics
  width?: number;
  height?: number;
  
  // Arc specifics
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;

  // Polygon specifics
  points?: string;

  // Custom Path specifics
  pathData?: string; // e.g., "-50,-50 50,-50 40,50 -40,50"
};

export type TemplateId = "arena" | "stadium" | "concert" | "conference" | "blank";

export type PitchType = 
  | "none"
  | "basketball" 
  | "football" 
  | "handball" 
  | "volleyball" 
  | "stage_concert" 
  | "stage_thrust" 
  | "stage_round" 
  | "ring_boxing" 
  | "runway" 
  | "podium_classic" 
  | "podium_glass" 
  | "panel_table";

export interface VenueTemplate {
  id: TemplateId;
  label: string;
  description: string;
  icon: any; // lucide icon component
  sections: Section[];
  
  // Center stage/court dimensions (deprecated for raw pitch rendering, but kept for legacy)
  stageLabel?: string;
  stageWidth?: number;
  stageHeight?: number;

  // New precise pitch type
  pitchType?: PitchType;
  
  // Arena boundary wall
  boundaryShape?: "rect" | "circle" | "oval";
  boundaryWidth?: number;
  boundaryHeight?: number;
  boundaryRx?: number; // corner radius
};
