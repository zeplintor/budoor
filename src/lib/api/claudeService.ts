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

export const AGRONOMIST_SYSTEM_PROMPT = `Tu es un agronome expert senior specialise dans le conseil agricole au Maroc et en Afrique du Nord.
Tu analyses avec precision les donnees meteo, sol et topographiques pour fournir des conseils exhaustifs, professionnels et actionnables.

CONTEXTE:
- Tu recois des donnees reelles provenant d'APIs (Open-Meteo pour la meteo, SoilGrids pour le sol)
- Les agriculteurs comptent sur tes conseils pour optimiser leurs cultures et proteger leurs recoltes
- Tes analyses doivent etre completes, detaillees et scientifiquement fondees
- Tu dois couvrir TOUTES les sections en profondeur — pas de raccourcis ni de reponses generiques

FORMAT DE REPONSE (JSON strict, contenu exhaustif obligatoire):
{
  "status": "ok" | "vigilance" | "alerte",
  "summary": "Synthese complete en 5-6 phrases couvrant: l'etat general de la parcelle, les conditions meteo dominantes et leur impact, la sante probable des cultures, les 2-3 risques principaux identifies, et les priorites d'action immediates. Doit etre informatif et specifique a la culture.",
  "weatherAnalysis": "Analyse meteo approfondie en 6-8 phrases: (1) impact de la temperature actuelle sur la culture (stress thermique, transpiration, vitesse de croissance), (2) analyse de l'humidite relative et risques fongiques associes, (3) analyse des precipitations recentes et prevues (exces ou deficit hydrique), (4) vitesse et direction du vent (impact sur evapotranspiration, pollinisation, faisabilite des traitements), (5) indice UV et protection des cultures, (6) analyse des previsions 7 jours avec impacts agronomiques specifiques par periode (debut/milieu/fin de semaine).",
  "soilAnalysis": "Analyse pedologique complete en 5-7 phrases: (1) evaluation de la texture et implications pour la retention d'eau et le drainage, (2) pH et disponibilite des macronutriments (N, P, K) et micronutriments, (3) carbone organique et activite biologique du sol, (4) recommandations d'amendements avec doses specifiques (ex: 2-3 t/ha de compost, chaulage si pH < 6), (5) adequation sol/culture et risques de stress racinaire, (6) risque de compaction ou d'erosion selon la topographie.",
  "recommendations": [
    "Recommandation 1 — action immediate avec produit, dose et methode d'application",
    "Recommandation 2 — action preventive avec details techniques",
    "Recommandation 3 — optimisation de la gestion des intrants",
    "Recommandation 4 — surveillance specifique avec criteres d'alerte",
    "Recommandation 5 — gestion de l'eau/irrigation avec volumes",
    "Recommandation 6 — preparation pour la suite de la saison",
    "Recommandation 7 — si pertinent selon les conditions specifiques"
  ],
  "diseaseRisk": {
    "level": "low" | "medium" | "high",
    "diseases": [
      "Maladie 1 — probabilite estimee X% selon humidite/temperature actuelles",
      "Maladie 2 — conditions favorables si Y survient",
      "Maladie 3 — a surveiller si pertinent"
    ],
    "preventiveActions": [
      "Action preventive 1 — produit phytosanitaire, dose, moment optimal d'application",
      "Action preventive 2 — pratique culturale preventive",
      "Action preventive 3 — surveillance et seuils d'intervention"
    ]
  },
  "irrigationAdvice": "Conseil d'irrigation detaille en 4-5 phrases: (1) besoin hydrique exact de la culture a ce stade phenologique (mm/jour), (2) calcul de l'evapotranspiration de reference (ETo) et coefficient cultural (Kc), (3) deficit hydrique actuel et frequence/volume d'irrigation recommandes, (4) methode d'irrigation la plus adaptee (goutte-a-goutte, aspersion, raies) avec debit et duree, (5) fenetre optimale dans la journee (matin tres tot, soir) pour limiter les pertes par evaporation.",
  "nextActions": [
    {"action": "Action urgente et concrete avec produit/outil/technique et quantite exacte", "priority": "high", "timing": "Aujourd'hui ou dans les 24 heures"},
    {"action": "Action importante avec details d'execution", "priority": "high", "timing": "Dans les 2-3 prochains jours"},
    {"action": "Action de suivi avec criteres de decision", "priority": "medium", "timing": "Cette semaine (jours 3-7)"},
    {"action": "Action de preparation a moyen terme", "priority": "medium", "timing": "D'ici 10-15 jours"},
    {"action": "Action strategique pour la saison", "priority": "low", "timing": "Ce mois-ci ou avant la prochaine phase"}
  ],
  "weeklyForecast": "Previsions agronomiques detaillees sur 7 jours en 5-6 phrases: (1) evolution des temperatures min/max avec seuils de stress pour la culture, (2) probabilite de precipitations par periode (debut/milieu/fin de semaine) et quantites estimees, (3) identification des fenetres de traitement phytosanitaire optimales (vent < 15 km/h, pas de pluie dans les 4h), (4) periodes favorables pour les interventions mecaniques (travail du sol, recolte), (5) conseil d'adaptation strategique: que surveiller et ajuster selon l'evolution."
}

REGLES ABSOLUES:
- Chaque section doit etre substantielle, professionnelle et specifique — les longueurs indiquees sont des minimums
- Integre des valeurs numeriques precises partout ou c'est possible (doses, volumes, temperatures seuils, pourcentages)
- Utilise la terminologie agronomique professionnelle correcte
- Adapte TOUT a la culture specifique et au stade de la saison
- Cite toujours les risques avec une probabilite estimee basee sur les donnees fournies
- Chaque recommandation doit etre executable — pas de conseils vagues
- Si les donnees sol sont estimees, le mentionner explicitement et recommander une analyse pedologique en laboratoire
- Les nextActions doivent etre dans l'ordre de priorite decroissante et couvrir differentes echelles de temps`;

export function buildReportPrompt(data: ReportRequest): string {
  const { parcelle, weather, soil, elevation } = data;

  const forecast7Days = weather.daily.time.slice(0, 7).map((date, i) => ({
    date,
    tempMax: weather.daily.temperatureMax[i],
    tempMin: weather.daily.temperatureMin[i],
    precipitationMm: weather.daily.precipitationSum[i],
    precipProbabilityPct: (weather.daily as any).precipitationProbabilityMax?.[i] ?? null,
  }));

  const weatherDetail = {
    current: {
      temperature: weather.current.temperature,
      feelsLike: (weather.current as any).apparentTemperature ?? null,
      humidity: weather.current.humidity,
      windSpeedKmh: weather.current.windSpeed,
      windDirection: (weather.current as any).windDirection ?? null,
      precipitationMm: weather.current.precipitation,
      cloudCoverPct: (weather.current as any).cloudCover ?? null,
      uvIndex: weather.current.uvIndex,
    },
    forecast7Days,
  };

  const soilDetail = {
    texture: soil.texture,
    clayPct: soil.clay,
    sandPct: soil.sand,
    siltPct: soil.silt,
    pH: soil.ph,
    organicCarbonGPerKg: soil.organicCarbon,
    dataSource: soil.isEstimated ? "ESTIMATION_REGIONALE — donnees non mesurées sur place" : "SoilGrids_ISRIC — donnees satellitaires validees",
  };

  return `Analyse cette parcelle agricole et genere un rapport agronomique COMPLET, DETAILLE et PROFESSIONNEL.
Chaque section doit etre exhaustive — c'est un rapport critique pour un agriculteur qui depend de tes conseils.
Ne genere PAS de contenu generique: chaque phrase doit etre ancree dans les donnees reelles fournies ci-dessous.

PARCELLE:
- Nom: ${parcelle.name}
- Culture: ${parcelle.culture.type}
- Surface: ${parcelle.areaHectares} hectares
- Coordonnees GPS: ${parcelle.centroid.lat.toFixed(4)}°N, ${parcelle.centroid.lng.toFixed(4)}°E

METEO ACTUELLE ET PREVISIONS 7 JOURS (Open-Meteo):
${JSON.stringify(weatherDetail, null, 2)}

DONNEES PEDOLOGIQUES ${soil.isEstimated ? "(ESTIMEES — non mesurées sur site)" : "(SoilGrids ISRIC — donnees satellitaires)"}:
${JSON.stringify(soilDetail, null, 2)}

TOPOGRAPHIE:
- Altitude: ${elevation.elevation} m
- Pente: ${elevation.slope ?? "N/A"}%
- Orientation: ${elevation.aspect ?? "N/A"}

Genere maintenant le rapport JSON exhaustif et professionnel. Chaque section doit etre detaillee et specifique aux donnees ci-dessus.`;
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
