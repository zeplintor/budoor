import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function generateDarijaScript(
  report: ReportData,
  userName: string = "الفلاح"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use Gemini 2.5 Flash (stable, free tier, latest)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Map status to Darija terms
  const statusInDarija =
    report.status === "alerte"
      ? "تنبيه خطير"
      : report.status === "vigilance"
      ? "يقظة"
      : "عادي";

  // Build context about weather
  const weatherContext = `
درجة الحرارة: ${report.weather.temperature}°C
الرطوبة: ${report.weather.humidity}%
الأمطار: ${report.weather.precipitation}mm
الريح: ${report.weather.windSpeed}km/h
  `.trim();

  const prompt = `You are a Moroccan Darija dialect expert and agronomist. 
Generate a script ONLY IN MOROCCAN DARIJA (NOT in French, NOT mixed with French) for a 1-minute audio report (~130-150 words).

**REPORT INFORMATION:**
- Plot: ${report.parcelleName}
- Status: ${statusInDarija}
- Weather:
${weatherContext}
- Summary: ${report.summary}
- Recommendations:
${report.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

**MANDATORY STRUCTURE (Arabic script only):**
1. **Warm greeting**: "السلام عليكم ورحمة الله وبركاته يا أخي الفلاح" (Hello brother farmer)
2. **Context**: Present Budoor daily report for ${report.parcelleName}
3. **Current status**: Describe the status (${statusInDarija}) and weather conditions ONLY IN DARIJA ARABIC
4. **Weather details**: Temperature, humidity, wind, rain - all explained in natural Moroccan Darija
5. **Concrete actions**: The main recommendations translated to authentic Moroccan Darija
6. **Closing**: "الله يسخر لك الخير والبركة" (May God bless your harvest)

**CRITICAL RULES:**
- Write ONLY in Moroccan Darija using Arabic script (العربية فقط)
- NO French words, NO transliteration, NO numbers, NO mixed languages
- Use proper Arabic spelling for agricultural terms: السقي (irrigation), الجذور (roots), الأمراض (diseases), الرطوبة (humidity), etc.
- Warm and encouraging tone, like a local agricultural advisor
- Maximum 150 words
- Plain text only, NO markdown, NO formatting

Generate ONLY the Darija script - nothing else, no explanations.`;


  try {
    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    console.log("✅ Darija script generated successfully with Gemini");
    return script;
  } catch (error) {
    console.error("❌ Failed to generate Darija script:", error);
    throw error;
  }
}
