import { useState } from "react";
import { Input } from "@/components/ui/input";
import { getPlacesAutocomplete, getPlaceDetails } from "@/api/geocoding";

export function LocationSearchInput({
  value,
  onChange,
  onSelectCoordinates,
  placeholder = "Search for a location...",
  className = "mt-1",
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectCoordinates: (lat: string, lng: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={async (e) => {
          const val = e.target.value;
          onChange(val);
          if (!val.trim()) {
            setPredictions([]);
            setIsOpen(false);
            return;
          }
          setIsOpen(true);
          setIsLoading(true);
          try {
            const results = await getPlacesAutocomplete({ data: val } as any);
            setPredictions(results);
          } catch (err) {
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        }}
        onFocus={() => value.trim() && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && (predictions.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none">
          {isLoading && predictions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
          )}
          {!isLoading &&
            predictions.map((p) => (
              <div
                key={p.place_id}
                className="relative flex cursor-pointer select-none flex-col rounded-sm px-4 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={async () => {
                  onChange(p.description);
                  setIsOpen(false);
                  const coords = await getPlaceDetails({ data: p.place_id } as any);
                  if (coords && coords.lat && coords.lng) {
                    onSelectCoordinates(coords.lat, coords.lng);
                  }
                }}
              >
                <span className="font-medium text-foreground">
                  {p.structured_formatting?.main_text || p.description}
                </span>
                {p.structured_formatting?.secondary_text && (
                  <span className="text-xs text-muted-foreground">
                    {p.structured_formatting.secondary_text}
                  </span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
