import { createServerFn } from "@tanstack/react-start";
import { getServerConfig } from "../lib/config.server";

export const getCoordinates = createServerFn("POST", async (address: string) => {
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!apiKey) {
    console.error("Google API key is missing");
    return { lat: null, lng: null };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: String(location.lat), lng: String(location.lng) };
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
  }

  return { lat: null, lng: null };
});
