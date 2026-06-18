import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { getPlacesAutocomplete, getPlaceDetails } from "@/api/geocoding";
import { Loader2 } from "lucide-react";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(async (val: string) => {
    if (!val.trim()) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsOpen(true);
    try {
      const results = await getPlacesAutocomplete({ data: val } as any);
      setPredictions(results || []);
    } catch (err) {
      console.error(err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    // Clear any pending debounced call
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Show loading immediately but debounce the actual fetch
    setIsLoading(true);
    setIsOpen(true);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(val);
    }, 350);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={handleChange}
        onFocus={() => value?.trim() && (predictions.length > 0 || isLoading) && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && value?.trim() && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none">
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}
          {!isLoading && predictions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">No results found</div>
          )}
          {predictions.map((p) => (
            <div
              key={p.place_id}
              className="relative flex cursor-pointer select-none flex-col rounded-sm px-4 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onMouseDown={async (e) => {
                e.preventDefault();
                onChange(p.description);
                setIsOpen(false);
                setPredictions([]);
                // Nominatim results already have lat/lng attached directly
                if (p._lat && p._lng) {
                  onSelectCoordinates(String(p._lat), String(p._lng));
                } else {
                  // Google results need a second lookup
                  const coords = await getPlaceDetails({ data: p.place_id } as any);
                  if (coords && coords.lat && coords.lng) {
                    onSelectCoordinates(coords.lat, coords.lng);
                  }
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
