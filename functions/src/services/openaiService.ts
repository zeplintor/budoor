import * as functions from "firebase-functions";
import OpenAI from "openai";

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
};

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
}

interface SoilData {
  texture: string;
  ph: number;
  organicCarbon: number;
}

interface ParcelleInfo {
  name: string;
  cultureType: string;
  areaHectares: number;
  weather: WeatherData;
  soil?: SoilData;
}

interface ReportResult {
  summary: string;
  recommendations: string[];
  status: "normal" | "vigilance" | "alerte";
  fullReport: string;
}

/**
 * Generate a concise daily report using GPT-4o-mini for WhatsApp
 */
export async function generateDailyReport(
  parcelle: ParcelleInfo,
  language: "fr" | "ar" = "fr"
): Promise<ReportResult> {
  const openai = getOpenAIClient();

  const systemPrompt =
    language === "fr"
      ? `Tu es un agronome expert. Génère un rapport concis pour WhatsApp (max 500 caractères).
Focus sur les points critiques et recommandations urgentes.
Réponds en JSON: { "summary": "...", "recommendations": ["..."], "status": "normal|vigilance|alerte" }`
      : `أنت مهندس زراعي خبير. قم بإنشاء تقرير موجز لواتساب (500 حرف كحد أقصى).
ركز على النقاط الحرجة والتوصيات العاجلة.
أجب بصيغة JSON: { "summary": "...", "recommendations": ["..."], "status": "normal|vigilance|alerte" }`;

  const userPrompt =
    language === "fr"
      ? `Parcelle: ${parcelle.name}
Culture: ${parcelle.cultureType}
Surface: ${parcelle.areaHectares} ha

Météo actuelle:
- Température: ${parcelle.weather.temperature}°C
- Humidité: ${parcelle.weather.humidity}%
- Précipitations: ${parcelle.weather.precipitation}mm
- Vent: ${parcelle.weather.windSpeed}km/h

${
  parcelle.soil
    ? `Sol:
- Texture: ${parcelle.soil.texture}
- pH: ${parcelle.soil.ph}
- Carbone organique: ${parcelle.soil.organicCarbon}%`
    : ""
}

Analyse et recommandations pour aujourd'hui:`
      : `القطعة: ${parcelle.name}
المحصول: ${parcelle.cultureType}
المساحة: ${parcelle.areaHectares} هكتار

الطقس الحالي:
- درجة الحرارة: ${parcelle.weather.temperature}°C
- الرطوبة: ${parcelle.weather.humidity}%
- الهطول: ${parcelle.weather.precipitation}mm
- الرياح: ${parcelle.weather.windSpeed}km/h

التحليل والتوصيات لهذا اليوم:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);

    return {
      summary: result.summary || "",
      recommendations: result.recommendations || [],
      status: result.status || "normal",
      fullReport: content,
    };
  } catch (error) {
    functions.logger.error("Error generating report", { error });
    throw error;
  }
}

/**
 * Generate a weekly summary for multiple parcelles
 */
export async function generateWeeklySummary(
  parcelles: ParcelleInfo[],
  language: "fr" | "ar" = "fr"
): Promise<string> {
  const openai = getOpenAIClient();

  const systemPrompt =
    language === "fr"
      ? `Tu es un agronome expert. Génère un résumé hebdomadaire concis (max 800 caractères) pour WhatsApp.
Mentionne les points clés pour chaque parcelle et les actions prioritaires de la semaine.`
      : `أنت مهندس زراعي خبير. قم بإنشاء ملخص أسبوعي موجز (800 حرف كحد أقصى) لواتساب.
اذكر النقاط الرئيسية لكل قطعة والإجراءات ذات الأولوية للأسبوع.`;

  const parcellesSummary = parcelles
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} (${p.cultureType}, ${p.areaHectares}ha) - Temp: ${p.weather.temperature}°C`
    )
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Résumé de ${parcelles.length} parcelles:\n${parcellesSummary}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    functions.logger.error("Error generating weekly summary", { error });
    throw error;
  }
}
