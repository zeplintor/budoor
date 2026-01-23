import type { ReportRequest, AgronomicReport } from "@/lib/api/claudeService";
import { generateDarijaScript } from "@/lib/audio/darijaGenerator";
import { generateAudioFromText } from "@/lib/audio/audioGenerator";

export type AudioGenerator = (
    text: string,
    voiceId?: string,
    fileName?: string
) => Promise<string>;

export async function assembleReport(
    reportData: any,
    data: ReportRequest,
    audioGen: AudioGenerator = generateAudioFromText,
    darijaGen = generateDarijaScript
): Promise<AgronomicReport> {
    // Map status safely
    const statusMap = {
        ok: "ok",
        vigilance: "vigilance",
        alerte: "alerte",
    } as const;

    const status =
        typeof reportData.status === "string" && (reportData.status in statusMap)
            ? (reportData.status as AgronomicReport["status"])
            : "ok";

    let audioUrl: string | undefined;
    let darijaScript: string | undefined;

    try {
        darijaScript = await darijaGen(
            {
                parcelleName: data.parcelle.name,
                status: status === "ok" ? "normal" : status,
                summary: reportData.summary || "",
                recommendations: reportData.recommendations || [],
                weather: {
                    temperature: data.weather.current.temperature,
                    humidity: data.weather.current.humidity,
                    precipitation: data.weather.current.precipitation,
                    windSpeed: data.weather.current.windSpeed,
                },
            },
            "الفلاح"
        );

        const audioFileName = `report_manual_${Date.now()}.mp3`;
        audioUrl = await audioGen(darijaScript, undefined, audioFileName);
    } catch (err: any) {
        console.error("Audio generation failed, continuing without audio:", err);
        if (process.env.NODE_ENV !== "production" || process.env.ALLOW_PROD_DEBUG === "1") {
            // Attach debug information for local troubleshooting
            return {
                id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                parcelleId: data.parcelle.id,
                parcelleName: data.parcelle.name,
                generatedAt: new Date(),
                status: (reportData.status as AgronomicReport["status"]) || status,
                summary: reportData.summary || "",
                weatherAnalysis: reportData.weatherAnalysis || "",
                soilAnalysis: reportData.soilAnalysis || "",
                recommendations: reportData.recommendations || [],
                diseaseRisk: reportData.diseaseRisk || {
                    level: "low",
                    diseases: [],
                    preventiveActions: [],
                },
                irrigationAdvice: reportData.irrigationAdvice || "",
                nextActions: reportData.nextActions || [],
                weeklyForecast: reportData.weeklyForecast || "",
                audioUrl: undefined,
                darijaScript: undefined,
                debug: {
                    audioGenerated: false,
                    audioError: err?.message || String(err),
                },
            } as AgronomicReport;
        }
    }

    const report: AgronomicReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parcelleId: data.parcelle.id,
        parcelleName: data.parcelle.name,
        generatedAt: new Date(),
        status: (reportData.status as AgronomicReport["status"]) || status,
        summary: reportData.summary || "",
        weatherAnalysis: reportData.weatherAnalysis || "",
        soilAnalysis: reportData.soilAnalysis || "",
        recommendations: reportData.recommendations || [],
        diseaseRisk: reportData.diseaseRisk || {
            level: "low",
            diseases: [],
            preventiveActions: [],
        },
        irrigationAdvice: reportData.irrigationAdvice || "",
        nextActions: reportData.nextActions || [],
        weeklyForecast: reportData.weeklyForecast || "",
        audioUrl,
        darijaScript,
        debug: process.env.NODE_ENV !== "production" ? { audioGenerated: !!audioUrl } : undefined,
    };

    return report;
}

export default assembleReport;
