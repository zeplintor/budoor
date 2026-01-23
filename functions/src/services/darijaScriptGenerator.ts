import { GoogleGenerativeAI } from "@google/generative-ai";
import * as functions from "firebase-functions";

interface ReportData {
  parcelleName: string;
  status: "normal" | "vigilance" | "alerte";
  summary: string;
  recommendations: string[];
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
}

/**
 * Generate a Moroccan Darija audio script from a report using Google Gemini
 * Structure: Salutation + Context + Action + Conclusion (130-150 words, ~1 min)
 * IMPORTANT: Output is ONLY in Moroccan Darija Arabic script (NO French, NO transliteration)
 */
export async function generateDarijaScript(
  report: ReportData,
  userName: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a Moroccan Darija dialect expert and agronomist.
Generate a script ONLY IN MOROCCAN DARIJA (NOT in French, NOT mixed with French) for a 1-minute audio report (~130-150 words).

REPORT INFORMATION:
- Plot: ${report.parcelleName}
- Status: ${report.status === "alerte" ? "تنبيه خطير" : report.status === "vigilance" ? "يقظة" : "عادي"}
- Summary: ${report.summary}
- Recommendations: ${report.recommendations.join(", ")}
- Weather: ${report.weather.temperature}°C, humidity ${report.weather.humidity}%, rain ${report.weather.precipitation}mm, wind ${report.weather.windSpeed}km/h

MANDATORY STRUCTURE (Arabic script only):
1. **Warm greeting**: "السلام عليكم ورحمة الله وبركاته يا أخي الفلاح" (Hello brother farmer)
2. **Context**: Present Budoor daily report for ${report.parcelleName}
3. **Current status**: Describe the status and weather conditions ONLY IN DARIJA ARABIC
4. **Weather details**: Temperature, humidity, wind, rain - all explained in natural Moroccan Darija
5. **Concrete actions**: The main recommendations translated to authentic Moroccan Darija
6. **Closing**: "الله يسخر لك الخير والبركة" (May God bless your harvest)

CRITICAL RULES:
- Write ONLY in Moroccan Darija using Arabic script (العربية فقط)
- NO French words, NO transliteration, NO numbers, NO mixed languages
- Use proper Arabic spelling for agricultural terms: السقي (irrigation), الجذور (roots), الأمراض (diseases), الرطوبة (humidity), التربة (soil), etc.
- Warm and encouraging tone, like a local agricultural advisor
- Maximum 150 words
- Plain text only, NO markdown, NO formatting

Generate ONLY the Darija script - nothing else, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const script = response.text().trim();

    functions.logger.info("Darija script generated successfully with Gemini", {
      parcelleName: report.parcelleName,
      scriptLength: script.length,
    });

    return script;
  } catch (error) {
    functions.logger.error("Failed to generate Darija script with Gemini", {
      error,
    });
    throw error;
  }
}
