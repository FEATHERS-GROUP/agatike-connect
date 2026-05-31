export const GRADIENTS = [
  { id: "obsidian", name: "Obsidian Glass", class: "from-slate-900 to-black" },
  { id: "amber", name: "Amber VIP", class: "from-amber-700 to-amber-950" },
  { id: "ruby", name: "Ruby Security", class: "from-red-800 to-rose-950" },
  { id: "emerald", name: "Emerald Access", class: "from-emerald-800 to-teal-950" },
  { id: "royal", name: "Royal Crew", class: "from-blue-800 to-indigo-950" },
  { id: "amethyst", name: "Amethyst Media", class: "from-purple-800 to-fuchsia-950" },
];

export const FONTS = [
  { id: "font-sans", name: "Inter (Modern Sans)" },
  { id: "font-mono", name: "Roboto Mono (Technical)" },
  { id: "font-serif", name: "Playfair (Elegant Serif)" },
];

export type Sponsor = {
  id: string;
  text: string;
  logoUrl: string;
  scale?: number;
  x?: number;
  y?: number;
};
