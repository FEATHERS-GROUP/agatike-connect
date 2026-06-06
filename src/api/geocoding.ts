import { createServerFn } from "@tanstack/react-start";
import { getServerConfig } from "../lib/config.server";

export const getCoordinates = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const address = ctx.data as unknown as string;
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!apiKey) {
    console.error("Google API key is missing");
    return { lat: null, lng: null };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${apiKey}`,
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

export const getPlacesAutocomplete = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const query = ctx.data as unknown as string;
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!apiKey || !query) return [];

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query,
      )}&key=${apiKey}`,
    );
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
});

export const getPlaceDetails = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const placeId = ctx.data as unknown as string;
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!apiKey || !placeId) return { lat: null, lng: null };

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`,
    );
    const data = await response.json();
    if (data.result?.geometry?.location) {
      const location = data.result.geometry.location;
      return { lat: String(location.lat), lng: String(location.lng) };
    }
  } catch (error) {
    console.error("Error fetching place details:", error);
  }
  return { lat: null, lng: null };
});

export const getRouteDistance = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { origin, destination, waypoints } = ctx.data as unknown as { origin: string, destination: string, waypoints?: string[] };
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!apiKey || !origin || !destination) return null;

  try {
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
    if (waypoints && waypoints.length > 0) {
      url += `&waypoints=${waypoints.join("|")}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      let totalMeters = 0;
      const legs = data.routes[0].legs;
      for (const leg of legs) {
        totalMeters += leg.distance.value;
      }
      return { kilometers: (totalMeters / 1000).toFixed(1) };
    }
  } catch (error) {
    console.error("Error fetching directions:", error);
  }
  return null;
});
