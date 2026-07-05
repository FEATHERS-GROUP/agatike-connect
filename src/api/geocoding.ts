import { createServerFn } from "@tanstack/react-start";
import { getServerConfig } from "../lib/config.server";

export const getCoordinates = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
  const payload = ctx.data as any;
  const address = payload?.data || payload;
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

export const getPlacesAutocomplete = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
  const payload = ctx.data as any;
  const query = payload?.data || payload;
  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (!query) return [];

  // Try Google Places first if we have an API key
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query,
        )}&key=${apiKey}`,
      );
      const data = await response.json();
      // Only use Google results if the request was OK (billing enabled)
      if (data.status === "OK" && data.predictions?.length > 0) {
        return data.predictions;
      }
    } catch (error) {
      console.error("Google Places error:", error);
    }
  }

  // Fallback: OpenStreetMap Nominatim (free, no billing required)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&accept-language=en`,
      { headers: { "User-Agent": "AgatikeConnect/1.0" } },
    );
    const data = await response.json();
    // Normalize to match Google's prediction shape so LocationSearchInput doesn't need changes
    return (data || []).map((item: any) => ({
      place_id: item.place_id,
      description: item.display_name,
      structured_formatting: {
        main_text: item.name || item.display_name.split(",")[0],
        secondary_text: item.display_name.split(",").slice(1).join(",").trim(),
      },
      // Attach lat/lng directly so we don't need a second lookup
      _lat: item.lat,
      _lng: item.lon,
    }));
  } catch (err) {
    console.error("Nominatim fallback error:", err);
    return [];
  }
});

export const getPlaceDetails = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
  const payload = ctx.data as any;
  const placeId = payload?.data || payload;
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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const getRouteDistance = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
  const payload = ctx.data as any;
  const { origin, destination, waypoints } = payload?.data || payload;

  if (!origin || !destination) return null;

  const config = getServerConfig();
  const apiKey = config.googleApiKey;

  if (apiKey) {
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
  }

  // Fallback: Haversine distance formula if API key is missing, directions API fails, or no routes found
  try {
    const parseLatLng = (str: string) => {
      const [lat, lng] = str.split(",").map(Number);
      return { lat, lng };
    };

    const originCoords = parseLatLng(origin);
    const destCoords = parseLatLng(destination);
    const waypointCoords = (waypoints || []).map(parseLatLng);

    const allPoints = [originCoords, ...waypointCoords, destCoords];
    let totalKm = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p1 = allPoints[i];
      const p2 = allPoints[i + 1];
      if (!isNaN(p1.lat) && !isNaN(p1.lng) && !isNaN(p2.lat) && !isNaN(p2.lng)) {
        totalKm += getDistanceFromLatLonInKm(p1.lat, p1.lng, p2.lat, p2.lng);
      }
    }
    // Multiply straight-line distance by 1.2 to estimate trail winding
    return { kilometers: (totalKm * 1.2).toFixed(1) };
  } catch (err) {
    console.error("Haversine fallback error:", err);
  }

  return null;
});
