import { useEffect, useRef, useState } from "react";
import { Input } from "./input";

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelect?: (address: string) => void;
}

export function AddressAutocomplete({
  onAddressSelect,
  value,
  onChange,
  ...props
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const w = window as any;
    if (w.google && w.google.maps && w.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = "google-maps-places-script";
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (w.google && w.google.maps && w.google.maps.places) {
          setIsScriptLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const apiKey = import.meta.env.GOOGLE_MAP_API;
    if (!apiKey) {
      console.warn("GOOGLE_MAP_API is missing in environment variables.");
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current) return;

    const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address"],
    });

    // Disable default browser autocomplete so it doesn't overlap with Google's
    inputRef.current.setAttribute("autocomplete", "off");

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        if (onAddressSelect) {
          onAddressSelect(place.formatted_address);
        } else if (onChange) {
          // Simulate a change event
          const event = {
            target: { value: place.formatted_address },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      }
    });

    return () => {
      if (listener) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [isScriptLoaded, onAddressSelect, onChange]);

  return <Input ref={inputRef} value={value} onChange={onChange} {...props} />;
}
