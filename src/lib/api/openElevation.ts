import type { ElevationData } from "@/types";

const BASE_URL = "https://api.open-elevation.com/api/v1/lookup";

interface OpenElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}

export async function getElevationData(lat: number, lng: number): Promise<ElevationData> {
  try {
    const response = await fetch(`${BASE_URL}?locations=${lat},${lng}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Open-Elevation API error: ${response.status}, using fallback`);
      return getFallbackElevationData();
    }

    const data: OpenElevationResponse = await response.json();

    if (data.results && data.results.length > 0) {
      const elevation = data.results[0].elevation;
      return {
        elevation: Math.round(elevation),
        slope: undefined, // Would need multiple points to calculate
        aspect: undefined,
      };
    }

    return getFallbackElevationData();
  } catch (error) {
    console.error("Open-Elevation fetch error:", error);
    return getFallbackElevationData();
  }
}

// Get elevation for multiple points (useful for calculating slope)
export async function getElevationForPolygon(
  coordinates: number[][]
): Promise<{ elevation: number; slope: number; aspect: string }> {
  try {
    // Sample 4 points from the polygon for slope calculation
    const samplePoints = coordinates.slice(0, Math.min(4, coordinates.length));
    const locations = samplePoints.map(([lng, lat]) => `${lat},${lng}`).join("|");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}?locations=${locations}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { elevation: 100, slope: 0, aspect: "N/A" };
    }

    const data: OpenElevationResponse = await response.json();

    if (data.results && data.results.length > 0) {
      const elevations = data.results.map((r) => r.elevation);
      const avgElevation = elevations.reduce((a, b) => a + b, 0) / elevations.length;
      const maxElev = Math.max(...elevations);
      const minElev = Math.min(...elevations);

      // Estimate slope based on elevation difference
      const elevDiff = maxElev - minElev;
      // Rough estimate: assume 100m distance between points
      const estimatedSlope = Math.atan(elevDiff / 100) * (180 / Math.PI);

      // Determine aspect (simplified - based on which point is highest)
      const highestIndex = elevations.indexOf(maxElev);
      const aspects = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const aspect = highestIndex < aspects.length ? aspects[highestIndex] : "N/A";

      return {
        elevation: Math.round(avgElevation),
        slope: Math.round(estimatedSlope * 10) / 10,
        aspect,
      };
    }

    return { elevation: 100, slope: 0, aspect: "N/A" };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Elevation API timeout, using fallback");
    } else {
      console.error("Elevation polygon fetch error:", error);
    }
    return { elevation: 100, slope: 0, aspect: "N/A" };
  }
}

// Fallback elevation data
function getFallbackElevationData(): ElevationData {
  return {
    elevation: 100,
    slope: undefined,
    aspect: undefined,
  };
}

// Get elevation classification for agriculture
export function getElevationClassification(elevation: number): {
  zone: "plaine" | "colline" | "montagne";
  description: string;
  considerations: string[];
} {
  if (elevation < 200) {
    return {
      zone: "plaine",
      description: "Zone de plaine",
      considerations: [
        "Risque d'inondation a surveiller",
        "Bon potentiel pour grandes cultures",
        "Mecanisation facile",
      ],
    };
  } else if (elevation < 600) {
    return {
      zone: "colline",
      description: "Zone de collines",
      considerations: [
        "Bon drainage naturel",
        "Attention a l'erosion sur pentes",
        "Ideal pour vignobles et vergers",
      ],
    };
  }
  return {
    zone: "montagne",
    description: "Zone de montagne",
    considerations: [
      "Saison de croissance plus courte",
      "Risque de gel tardif",
      "Cultures adaptees recommandees",
    ],
  };
}
