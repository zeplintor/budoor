import type { ElevationData, Parcelle } from "@/types";
import { getWeatherData, ExtendedWeatherData } from "./openMeteo";
import { getSoilData, SoilDataWithSource } from "./soilGrids";
import { getElevationForPolygon } from "./openElevation";

export interface ParcelleDataSnapshot {
  weather: ExtendedWeatherData;
  soil: SoilDataWithSource;
  elevation: ElevationData;
  fetchedAt: Date;
}

// Fetch all external data for a parcelle
export async function getParcelleData(parcelle: Parcelle): Promise<ParcelleDataSnapshot> {
  const { lat, lng } = parcelle.centroid;
  const coordinates = parcelle.geometry.coordinates[0];

  // Fetch all data in parallel
  const [weather, soil, elevationResult] = await Promise.all([
    getWeatherData(lat, lng),
    getSoilData(lat, lng),
    getElevationForPolygon(coordinates),
  ]);

  return {
    weather,
    soil,
    elevation: {
      elevation: elevationResult.elevation,
      slope: elevationResult.slope,
      aspect: elevationResult.aspect,
    },
    fetchedAt: new Date(),
  };
}

// Get a quick summary of parcelle conditions
export function getParcelleConditionSummary(data: ParcelleDataSnapshot): {
  status: "optimal" | "attention" | "alerte";
  alerts: string[];
  opportunities: string[];
} {
  const alerts: string[] = [];
  const opportunities: string[] = [];

  // Weather checks
  const { weather, soil, elevation } = data;

  // Temperature extremes
  if (weather.current.temperature < 5) {
    alerts.push("Risque de gel - proteger les cultures sensibles");
  } else if (weather.current.temperature > 35) {
    alerts.push("Canicule - irrigation recommandee");
  }

  // Precipitation
  const totalPrecipNext3Days = weather.daily.precipitationSum.slice(0, 3).reduce((a, b) => a + b, 0);
  if (totalPrecipNext3Days > 50) {
    alerts.push("Fortes pluies prevues - reporter les traitements");
  } else if (totalPrecipNext3Days < 5 && weather.current.temperature > 25) {
    alerts.push("Secheresse - surveiller l'irrigation");
  }

  // Wind
  if (weather.current.windSpeed > 30) {
    alerts.push("Vent fort - eviter les pulverisations");
  }

  // Soil checks
  if (soil.ph < 5.5) {
    alerts.push("Sol acide - chaulage recommande");
  } else if (soil.ph > 8) {
    alerts.push("Sol alcalin - surveiller les carences en fer");
  }

  if (soil.organicCarbon < 10) {
    alerts.push("Sol pauvre - apport de matiere organique necessaire");
  }

  // Opportunities based on conditions
  if (weather.current.precipitation === 0 && weather.current.windSpeed < 15) {
    opportunities.push("Conditions ideales pour pulverisation");
  }

  if (totalPrecipNext3Days > 10 && totalPrecipNext3Days < 30) {
    opportunities.push("Pluie prevue - reporter l'irrigation");
  }

  if (weather.current.humidity > 60 && weather.current.humidity < 80) {
    opportunities.push("Humidite favorable aux semis");
  }

  // Determine overall status
  let status: "optimal" | "attention" | "alerte" = "optimal";
  if (alerts.length > 2) {
    status = "alerte";
  } else if (alerts.length > 0) {
    status = "attention";
  }

  return { status, alerts, opportunities };
}
