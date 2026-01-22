import type { SoilData } from "@/types";

const BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";

interface SoilGridsResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    layers: Array<{
      name: string;
      unit_measure: {
        mapped_units: string;
        target_units: string;
        conversion_factor: number;
      };
      depths: Array<{
        label: string;
        range: { top_depth: number; bottom_depth: number; unit_depth: string };
        values: {
          mean: number;
          uncertainty?: number;
        };
      }>;
    }>;
  };
}

export interface SoilDataWithSource extends SoilData {
  isEstimated: boolean;
  source: string;
}

// Soil texture classification based on USDA
function classifySoilTexture(clay: number, sand: number, silt: number): string {
  // Ensure values are valid
  if (clay + sand + silt === 0) return "Inconnu";

  // Simplified USDA soil texture classification
  if (clay >= 40) {
    if (silt >= 40) return "Argilo-limoneux";
    if (sand >= 45) return "Argilo-sableux";
    return "Argileux";
  }
  if (sand >= 70) {
    if (clay >= 15) return "Sablo-argileux";
    return "Sableux";
  }
  if (silt >= 80) return "Limoneux pur";
  if (silt >= 50) return "Limoneux";
  if (clay >= 27 && clay < 40 && sand <= 20) return "Argilo-limoneux";
  if (clay >= 20 && clay < 35 && silt >= 28 && silt < 50) return "Limon argileux";
  if (sand >= 43 && sand <= 85 && clay < 20) return "Sablo-limoneux";
  if (clay >= 7 && clay < 27 && silt >= 28 && silt < 50) return "Limon";
  return "Limon";
}

export async function getSoilData(lat: number, lng: number): Promise<SoilDataWithSource> {
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.warn("Invalid coordinates for soil data:", { lat, lng });
    return getEstimatedSoilData(lat, lng);
  }

  // SoilGrids API requires specific format
  const url = `${BASE_URL}?lon=${lng.toFixed(6)}&lat=${lat.toFixed(6)}&property=clay&property=sand&property=silt&property=phh2o&property=soc&depth=0-5cm&value=mean`;

  try {
    console.log(`Fetching soil data for coordinates: ${lat}, ${lng}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`SoilGrids API error: ${response.status} ${response.statusText}`);
      return getEstimatedSoilData(lat, lng);
    }

    const data: SoilGridsResponse = await response.json();

    // Check if we got valid data
    if (!data.properties?.layers || data.properties.layers.length === 0) {
      console.warn("SoilGrids returned empty layers");
      return getEstimatedSoilData(lat, lng);
    }

    // Extract values from response
    const getValue = (name: string): number => {
      const layer = data.properties.layers.find((l) => l.name === name);
      if (layer && layer.depths && layer.depths[0]?.values?.mean !== undefined) {
        const value = layer.depths[0].values.mean;
        // Apply conversion factor if present
        const factor = layer.unit_measure?.conversion_factor || 1;
        return value * factor;
      }
      return 0;
    };

    // SoilGrids returns: clay/sand/silt in g/kg, phh2o in cg/kg (pH * 10), soc in dg/kg
    const clayRaw = getValue("clay");
    const sandRaw = getValue("sand");
    const siltRaw = getValue("silt");
    const phRaw = getValue("phh2o");
    const socRaw = getValue("soc");

    // Convert to usable units
    const clay = clayRaw / 10; // g/kg to %
    const sand = sandRaw / 10;
    const silt = siltRaw / 10;
    const ph = phRaw / 10; // cg/kg to pH
    const organicCarbon = socRaw / 10; // dg/kg to g/kg

    // Validate results
    if (clay === 0 && sand === 0 && silt === 0) {
      console.warn("SoilGrids returned zero values, using estimation");
      return getEstimatedSoilData(lat, lng);
    }

    console.log(`Soil data fetched successfully: clay=${clay}%, sand=${sand}%, silt=${silt}%, pH=${ph}`);

    return {
      clay: Math.round(clay),
      sand: Math.round(sand),
      silt: Math.round(silt),
      ph: Math.round(ph * 10) / 10,
      organicCarbon: Math.round(organicCarbon * 10) / 10,
      texture: classifySoilTexture(clay, sand, silt),
      isEstimated: false,
      source: "SoilGrids (ISRIC)",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("SoilGrids request timed out");
    } else {
      console.error("SoilGrids fetch error:", error);
    }
    return getEstimatedSoilData(lat, lng);
  }
}

// Generate estimated soil data based on geographic region
// This provides varied data instead of always returning the same values
function getEstimatedSoilData(lat: number, lng: number): SoilDataWithSource {
  // Use coordinates to generate pseudo-random but consistent values
  // This ensures the same location always gets the same estimated values
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
  const rand = (min: number, max: number) => {
    const r = Math.abs(Math.sin(seed * (min + max))) % 1;
    return min + r * (max - min);
  };

  // Estimate based on latitude zones (very simplified)
  let baseClay = 25;
  let baseSand = 35;
  let basePh = 6.5;
  let baseOC = 15;

  // Mediterranean region (Southern Europe, North Africa)
  if (lat >= 30 && lat <= 45 && lng >= -10 && lng <= 40) {
    baseClay = rand(20, 35);
    baseSand = rand(30, 50);
    basePh = rand(7.0, 8.0);
    baseOC = rand(10, 20);
  }
  // Northern Europe
  else if (lat >= 45 && lat <= 60) {
    baseClay = rand(15, 30);
    baseSand = rand(25, 45);
    basePh = rand(5.5, 7.0);
    baseOC = rand(15, 30);
  }
  // Tropical regions
  else if (lat >= -23 && lat <= 23) {
    baseClay = rand(30, 50);
    baseSand = rand(20, 40);
    basePh = rand(5.0, 6.5);
    baseOC = rand(20, 40);
  }
  // Default temperate
  else {
    baseClay = rand(20, 35);
    baseSand = rand(30, 45);
    basePh = rand(6.0, 7.5);
    baseOC = rand(12, 25);
  }

  const clay = Math.round(baseClay);
  const sand = Math.round(baseSand);
  const silt = Math.round(100 - clay - sand);
  const ph = Math.round(basePh * 10) / 10;
  const organicCarbon = Math.round(baseOC * 10) / 10;

  return {
    clay,
    sand,
    silt,
    ph,
    organicCarbon,
    texture: classifySoilTexture(clay, sand, silt),
    isEstimated: true,
    source: "Estimation regionale",
  };
}

// Legacy function for backward compatibility
export function getSoilQuality(soil: SoilData | SoilDataWithSource): {
  quality: "excellent" | "good" | "average" | "poor";
  description: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let score = 0;

  // pH assessment (ideal: 6.0-7.0)
  if (soil.ph >= 6.0 && soil.ph <= 7.0) {
    score += 3;
  } else if (soil.ph >= 5.5 && soil.ph <= 7.5) {
    score += 2;
    recommendations.push(
      soil.ph < 6.0 ? "Envisagez un chaulage pour augmenter le pH" : "Sol legerement alcalin"
    );
  } else {
    score += 1;
    recommendations.push("pH du sol a corriger");
  }

  // Organic carbon (ideal: > 20 g/kg)
  if (soil.organicCarbon >= 20) {
    score += 3;
  } else if (soil.organicCarbon >= 10) {
    score += 2;
    recommendations.push("Apport de matiere organique recommande");
  } else {
    score += 1;
    recommendations.push("Sol pauvre en matiere organique - amendement necessaire");
  }

  // Texture balance
  if (soil.clay >= 15 && soil.clay <= 35 && soil.sand >= 20 && soil.sand <= 50) {
    score += 3;
  } else if (soil.clay > 50) {
    score += 1;
    recommendations.push("Sol argileux - drainage a surveiller");
  } else if (soil.sand > 70) {
    score += 1;
    recommendations.push("Sol sableux - irrigation frequente necessaire");
  } else {
    score += 2;
  }

  if (score >= 8) {
    return { quality: "excellent", description: "Sol de tres bonne qualite", recommendations };
  } else if (score >= 6) {
    return { quality: "good", description: "Sol de bonne qualite", recommendations };
  } else if (score >= 4) {
    return { quality: "average", description: "Sol de qualite moyenne", recommendations };
  }
  return { quality: "poor", description: "Sol necessitant des amendements", recommendations };
}
