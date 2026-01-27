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
    let audioError: string | undefined;

    // Generate report data structure FIRST (critical path)
    const reportBase: AgronomicReport = {
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
    };

    // Generate audio/Darija asynchronously with timeout (don't block report generation)
    // Wrap in try-catch so timeouts don't crash the entire request
    try {
        // Set a 15-second timeout for audio generation (Netlify allows 30s total)
        const audioPromise = (async () => {
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
                
                console.log("✅ Audio generation succeeded");
            } catch (err: any) {
                audioError = err?.message || String(err);
                console.warn("⚠️ Audio generation failed (non-blocking):", audioError);
                // Don't rethrow - audio is optional
            }
        })();

        // Wait for audio with timeout (15 seconds)
        await Promise.race([
            audioPromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Audio generation timeout (15s)")), 15000)
            ),
        ]);
    } catch (err: any) {
        audioError = err?.message || "Audio generation timeout";
        console.warn("⚠️ Audio generation timed out or failed:", audioError);
        // Continue without audio - it's optional
    }

    // Return report with audio data (if available)
    const report: AgronomicReport = {
        ...reportBase,
        audioUrl,
        darijaScript,
        debug: {
            audioGenerated: !!audioUrl,
            audioError
        },
    };

    console.log("📊 Report assembled:", {
        hasAudio: !!audioUrl,
        audioUrl: audioUrl?.substring(0, 80) + "...",
        hasDarija: !!darijaScript,
        error: audioError
    });

    return report;
}
