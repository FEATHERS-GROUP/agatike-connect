import React from "react";
import { cn } from "@/lib/utils";

export interface AgencyChipProps {
  agency: string;
  logoUrl: string;
  selected: boolean;
  onSelect: (agency: string) => void;
}

export function AgencyChip({ agency, logoUrl, selected, onSelect }: AgencyChipProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-card hover:bg-card/80 transition-colors",
        selected && "border-primary bg-primary/10",
      )}
      onClick={() => onSelect(agency)}
    >
      <img src={logoUrl} alt={agency} className="h-6 w-6 rounded-full" />
      <span className="text-sm font-medium">{agency}</span>
    </button>
  );
}
