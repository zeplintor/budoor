import type { Parcelle } from "@/types";
import type { ExtendedWeatherData } from "./openMeteo";
import type { SoilDataWithSource } from "./soilGrids";
import type { ElevationData } from "@/types";

export interface ReportRequest {
  parcelle: Parcelle;
  weather: ExtendedWeatherData;
  soil: SoilDataWithSource;
  elevation: ElevationData;
  language?: "fr" | "en" | "ar";
}

export interface AgronomicReport {
  id: string;
  parcelleId: string;
  parcelleName: string;
  generatedAt: Date;
  status: "ok" | "vigilance" | "alerte";
  summary: string;
  weatherAnalysis: string;
  soilAnalysis: string;
  recommendations: string[];
  diseaseRisk: {
    level: "low" | "medium" | "high";
    diseases: string[];
    preventiveActions: string[];
  };
  irrigationAdvice: string;
  nextActions: {
    action: string;
    priority: "high" | "medium" | "low";
    timing: string;
  }[];
  weeklyForecast: string;
  // Optional audio attachments (added when generated)
  audioUrl?: string;
  darijaScript?: string;
  // Debug info populated in non-production for troubleshooting
  debug?: {
    audioGenerated?: boolean;
    audioError?: string;
  };
}

export const AGRONOMIST_SYSTEM_PROMPT = `Tu es un agronome expert specialise dans le conseil aux agriculteurs.
Tu analyses les donnees meteo, sol et topographiques pour fournir des conseils pratiques et actionnables.

CONTEXTE:
- Tu recois des donnees reelles provenant d'APIs (Open-Meteo pour la meteo, SoilGrids pour le sol)
- Les agriculteurs comptent sur tes conseils pour optimiser leurs cultures
- Tes recommandations doivent etre precises et adaptees aux conditions locales

FORMAT DE REPONSE (JSON strict):
{
  "status": "ok" | "vigilance" | "alerte",
  "summary": "Resume en 2-3 phrases de l'etat general",
  "weatherAnalysis": "Analyse detaillee de la meteo et son impact sur les cultures",
  "soilAnalysis": "Analyse du sol et recommandations d'amendements",
  "recommendations": ["Liste de 3-5 recommandations prioritaires"],
  "diseaseRisk": {
    "level": "low" | "medium" | "high",
    "diseases": ["Maladies a surveiller"],
    "preventiveActions": ["Actions preventives"]
  },
  "irrigationAdvice": "Conseils d'irrigation adaptes",
  "nextActions": [
    {"action": "Action concrete", "priority": "high|medium|low", "timing": "Quand agir"}
  ],
  "weeklyForecast": "Resume des conditions attendues cette semaine"
}

REGLES:
- Priorise la securite des cultures
- Donne des fenetres d'action concretes (dates)
- Mentionne les risques avec leur probabilite
- Propose toujours une action immediate
- Si les donnees du sol sont estimees, mentionne-le et recommande une analyse de sol
- Adapte tes conseils a la culture specifique de la parcelle`;

export function buildReportPrompt(data: ReportRequest): string {
  const { parcelle, weather, soil, elevation } = data;

  const weatherSummary = {
    current: {
      temperature: weather.current.temperature,
      humidity: weather.current.humidity,
      windSpeed: weather.current.windSpeed,
      precipitation: weather.current.precipitation,
      uvIndex: weather.current.uvIndex,
    },
    forecast7Days: weather.daily.time.slice(0, 7).map((date, i) => ({
      date,
      tempMax: weather.daily.temperatureMax[i],
      tempMin: weather.daily.temperatureMin[i],
      precipitation: weather.daily.precipitationSum[i],
    })),
  };

  const soilSummary = {
    texture: soil.texture,
    clay: soil.clay,
    sand: soil.sand,
    silt: soil.silt,
    ph: soil.ph,
    organicCarbon: soil.organicCarbon,
    isEstimated: soil.isEstimated,
    source: soil.source,
  };

  return `Analyse cette parcelle et genere un rapport agronomique detaille.

PARCELLE:
- Nom: ${parcelle.name}
- Culture: ${parcelle.culture.type}
- Surface: ${parcelle.areaHectares} hectares
- Coordonnees: ${parcelle.centroid.lat.toFixed(4)}, ${parcelle.centroid.lng.toFixed(4)}

METEO ACTUELLE ET PREVISIONS:
${JSON.stringify(weatherSummary, null, 2)}

DONNEES DU SOL ${soil.isEstimated ? "(ESTIMEES - recommander analyse)" : "(SoilGrids)"}:
${JSON.stringify(soilSummary, null, 2)}

TOPOGRAPHIE:
- Altitude: ${elevation.elevation} m
- Pente: ${elevation.slope || "N/A"}%
- Orientation: ${elevation.aspect || "N/A"}

Genere le rapport JSON selon le format specifie.`;
}

export async function generateReport(data: ReportRequest): Promise<AgronomicReport> {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Get response text first so we can parse it properly
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = "Erreur lors de la generation du rapport";
    try {
      const error = JSON.parse(responseText);
      errorMessage = error.message || errorMessage;
    } catch {
      // If response is not JSON (e.g., HTML error page)
      console.error("Non-JSON error response:", responseText.substring(0, 200));
      errorMessage = `Erreur serveur (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error("Failed to parse successful response:", responseText.substring(0, 200));
    throw new Error("Réponse invalide du serveur");
  }
}
