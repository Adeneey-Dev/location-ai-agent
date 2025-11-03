import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GeocodingResponse {
  results: {
    geometry: {
      lat: number;
      lng: number;
    };
    formatted_address: string;
  }[];
}

interface DirectionsResponse {
  routes: {
    legs: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }[];
  }[];
}

export const getAutoLocationTool = createTool({
  id: "get-auto-location",
  description: "Automatically detect user location based on IP address",
  inputSchema: z.object({}),
  outputSchema: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
    country: z.string(),
    address: z.string(),
  }),
  execute: async () => {
    return await getAutoLocation();
  },
});

// Tool to get current location based on IP or a default location
export const getCurrentLocationTool = createTool({
  id: "get-current-location",
  description: "Get the current location coordinates (latitude and longitude)",
  inputSchema: z.object({
    address: z
      .string()
      .optional()
      .describe("Optional address to get coordinates for"),
  }),
  outputSchema: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  execute: async ({ context }) => {
    return await getCurrentLocation(context.address);
  },
});

// Tool to get directions from current location to destination
export const getDirectionsTool = createTool({
  id: "get-directions",
  description:
    "Get directions, distance, and travel time from origin to destination",
  inputSchema: z.object({
    origin: z.string().describe("Starting location address"),
    destination: z.string().describe("Destination address"),
  }),
  outputSchema: z.object({
    origin: z.string(),
    destination: z.string(),
    distanceKm: z.number(),
    drivingTime: z.string(),
    walkingTime: z.string(),
    navigationLink: z.string(),
    safetyTips: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    return await getDirections(context.origin, context.destination);
  },
});

const getAutoLocation = async () => {
  try {
    // Using ip-api.com (free, no API key needed)
    const response = await fetch("http://ip-api.com/json/");
    const data = await response.json();

    if (data.status === "fail") {
      // Fallback to Lagos if IP detection fails
      return {
        latitude: 6.5244,
        longitude: 3.3792,
        city: "Lagos",
        country: "Nigeria",
        address: "Lagos, Nigeria",
      };
    }

    return {
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      country: data.country,
      address: `${data.city}, ${data.regionName}, ${data.country}`,
    };
  } catch (error) {
    // Fallback to Lagos on error
    return {
      latitude: 6.5244,
      longitude: 3.3792,
      city: "Lagos",
      country: "Nigeria",
      address: "Lagos, Nigeria",
    };
  }
};

// Get current location using geocoding API
const getCurrentLocation = async (address?: string) => {
  // If no address provided, use Lagos, Nigeria as default
  const locationQuery = address || "Lagos, Nigeria";

  const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`;

  const response = await fetch(geocodingUrl, {
    headers: {
      "User-Agent": "LocationAgent/1.0",
    },
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Location '${locationQuery}' not found`);
  }

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    address: data[0].display_name,
  };
};
// Get directions using OpenRouteService API
const getDirections = async (origin: string, destination: string) => {
  // Get coordinates for origin and destination
  const originCoords = await getCurrentLocation(origin);
  const destCoords = await getCurrentLocation(destination);

  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    originCoords.latitude,
    originCoords.longitude,
    destCoords.latitude,
    destCoords.longitude
  );

  // Estimate travel times
  const avgDrivingSpeed = 50; // km/h
  const avgWalkingSpeed = 5; // km/h

  const drivingMinutes = Math.round((distance / avgDrivingSpeed) * 60);
  const walkingMinutes = Math.round((distance / avgWalkingSpeed) * 60);

  const drivingTime = formatTime(drivingMinutes);
  const walkingTime = formatTime(walkingMinutes);

  // Generate Google Maps navigation link
  const navigationLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  // Generate safety tips
  const safetyTips = generateSafetyTips(distance, drivingMinutes);

  return {
    origin: originCoords.address,
    destination: destCoords.address,
    distanceKm: parseFloat(distance.toFixed(2)),
    drivingTime,
    walkingTime,
    navigationLink,
    safetyTips,
  };
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0
    ? `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`
    : `${hours} hour${hours > 1 ? "s" : ""}`;
}

function generateSafetyTips(
  distance: number,
  drivingMinutes: number
): string[] {
  const tips: string[] = [];

  // Distance-based tips
  if (distance > 100) {
    tips.push(
      "🚗 Long journey ahead - Ensure your vehicle is in good condition before departure"
    );
    tips.push("⛽ Check fuel level and plan refueling stops along the route");
    tips.push("🛌 Take breaks every 2 hours to avoid fatigue");
  } else if (distance > 50) {
    tips.push("🚗 Moderate distance - Check your fuel level before starting");
    tips.push("☕ Consider a rest stop if you feel tired");
  } else if (distance < 5) {
    tips.push(
      "🚶 Short distance - Walking or cycling could be a healthy alternative"
    );
  }

  // Time-based tips
  if (drivingMinutes > 180) {
    tips.push("⏰ Journey exceeds 3 hours - Plan for meal breaks");
    tips.push(
      "📱 Inform someone about your travel plans and estimated arrival time"
    );
  }

  // General safety tips
  tips.push(
    "🔒 Always wear your seatbelt and ensure all passengers do the same"
  );
  tips.push(
    "📵 Avoid using your phone while driving - pull over if you need to make a call"
  );
  tips.push("🌦️ Check weather conditions before you travel");
  tips.push("🚦 Obey all traffic rules and speed limits");
  tips.push("💼 Keep emergency contacts and important documents handy");
  tips.push(
    "🔦 Travel during daylight hours when possible for better visibility"
  );

  // Night travel warning
  const currentHour = new Date().getHours();
  if (currentHour >= 20 || currentHour <= 5) {
    tips.push(
      "🌙 Night travel - Be extra cautious and ensure your vehicle lights are working"
    );
  }

  // Additional safety
  tips.push(
    "🏥 Know the location of hospitals or emergency services along your route"
  );
  tips.push("💧 Stay hydrated and carry water, especially for long trips");

  return tips;
}

/*
```

## Now your output will look like this:
```
📍 LOCATION DETAILS
Origin: Ikeja, Lagos State, Nigeria
Destination: Lekki Phase 1, Lagos State, Nigeria

📏 DISTANCE & TIME
Distance: 23.45 km
Driving Time: 28 minutes
Walking Time: 4 hours 41 minutes

🗺️ NAVIGATION
Google Maps: https://www.google.com/maps/dir/?api=1&origin=Ikeja&destination=Lekki&travelmode=driving

🛡️ SAFETY TIPS
🚗 Moderate distance - Check your fuel level before starting
🔒 Always wear your seatbelt and ensure all passengers do the same
📵 Avoid using your phone while driving - pull over if you need to make a call
🌦️ Check weather conditions before you travel
🚦 Obey all traffic rules and speed limits
💼 Keep emergency contacts and important documents handy
🔦 Travel during daylight hours when possible for better visibility
🏥 Know the location of hospitals or emergency services along your route
💧 Stay hydrated and carry water, especially for long trips

*/
